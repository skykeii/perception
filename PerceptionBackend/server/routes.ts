import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  chatGPTRequestSchema,
  simplifyTextRequestSchema,
  generateAltTextRequestSchema,
  readAloudRequestSchema,
  fontSizeRequestSchema,
  insertUserPreferencesSchema,
  type ChatMessage,
} from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Preferences Endpoints
  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        preferences = await storage.createUserPreferences({
          userId,
          focusMode: false,
          motionBlocker: false,
          contrastLevel: "normal",
          largerClickTargets: false,
          textSimplification: false,
          readAloud: false,
          fontSize: "100",
          preferences: {},
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      let preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        preferences = await storage.createUserPreferences({
          userId,
          ...updates,
        });
      } else {
        preferences = await storage.updateUserPreferences(userId, updates);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Font Size Control Endpoint
  app.post("/api/font-size/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = fontSizeRequestSchema.parse(req.body);
      const { action, value } = validatedData;

      let preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        preferences = await storage.createUserPreferences({
          userId,
          focusMode: false,
          motionBlocker: false,
          contrastLevel: "normal",
          largerClickTargets: false,
          textSimplification: false,
          readAloud: false,
          fontSize: "100",
          preferences: {},
        });
      }

      let currentSize = parseInt(preferences.fontSize || "100");
      let newSize = currentSize;

      switch (action) {
        case "increase":
          newSize = Math.min(currentSize + 10, 300);
          break;
        case "decrease":
          newSize = Math.max(currentSize - 10, 50);
          break;
        case "set":
          if (value) {
            newSize = Math.max(50, Math.min(value, 300));
          }
          break;
        case "reset":
          newSize = 100;
          break;
      }

      preferences = await storage.updateUserPreferences(userId, {
        fontSize: newSize.toString(),
      });

      res.json({
        fontSize: newSize,
        previousSize: currentSize,
        action,
        percentage: `${newSize}%`,
      });
    } catch (error) {
      console.error("Error adjusting font size:", error);
      res.status(500).json({ error: "Failed to adjust font size" });
    }
  });

  // Get Font Size
  app.get("/api/font-size/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        preferences = await storage.createUserPreferences({
          userId,
          focusMode: false,
          motionBlocker: false,
          contrastLevel: "normal",
          largerClickTargets: false,
          textSimplification: false,
          readAloud: false,
          fontSize: "100",
          preferences: {},
        });
      }

      const fontSize = parseInt(preferences.fontSize || "100");

      res.json({
        fontSize,
        percentage: `${fontSize}%`,
      });
    } catch (error) {
      console.error("Error fetching font size:", error);
      res.status(500).json({ error: "Failed to fetch font size" });
    }
  });

  // ChatGPT Endpoint
  app.post("/api/chatgpt", async (req, res) => {
    try {
      const validatedData = chatGPTRequestSchema.parse(req.body);
      const { 
        message, 
        conversationHistory = [], 
        systemPrompt,
        temperature = 0.7,
        maxTokens = 1000,
        stream = false
      } = validatedData;

      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [];
      
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      
      conversationHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
      
      messages.push({ role: "user", content: message });

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        });

        let fullResponse = "";

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ content: "", done: true, fullResponse })}\n\n`);
        res.end();
      } else {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages,
          temperature,
          max_tokens: maxTokens,
        });

        const responseMessage = completion.choices[0].message.content || "I apologize, but I couldn't generate a response.";

        res.json({
          message: responseMessage,
          usage: completion.usage,
          model: completion.model,
        });
      }
    } catch (error) {
      console.error("Error in chatgpt endpoint:", error);
      res.status(500).json({ error: "Failed to process ChatGPT request" });
    }
  });

  // Text Simplification Endpoint
  app.post("/api/simplify", async (req, res) => {
    try {
      const validatedData = simplifyTextRequestSchema.parse(req.body);
      const { text, readingLevel } = validatedData;

      const readingLevelMap = {
        elementary: "3rd-5th grade",
        middle: "6th-8th grade",
        high: "9th-12th grade",
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert at rewriting text to be more accessible. Rewrite the provided text to match a ${readingLevelMap[readingLevel]} reading level. Use simple vocabulary, short sentences, and clear explanations. Maintain the core meaning and important information.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const simplifiedText = completion.choices[0].message.content || text;

      res.json({
        original: text,
        simplified: simplifiedText,
        readingLevel,
      });
    } catch (error) {
      console.error("Error in simplify endpoint:", error);
      res.status(500).json({ error: "Failed to simplify text" });
    }
  });

  // Visual Element Explainer (Alt Text Generation) Endpoint
  app.post("/api/generate-alt-text", async (req, res) => {
    try {
      const validatedData = generateAltTextRequestSchema.parse(req.body);
      const { imageUrl, useCache } = validatedData;

      if (useCache) {
        const cached = await storage.getAltTextFromCache(imageUrl);
        if (cached) {
          return res.json({
            altText: cached.altText,
            cached: true,
          });
        }
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating descriptive alt text for images to help visually impaired users. Provide clear, concise descriptions that convey the essential information and context of the image.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please provide descriptive alt text for this image.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const altText = completion.choices[0].message.content || "Image description unavailable";

      await storage.cacheAltText({
        imageUrl,
        altText,
      });

      res.json({
        altText,
        cached: false,
      });
    } catch (error) {
      console.error("Error in generate-alt-text endpoint:", error);
      res.status(500).json({ error: "Failed to generate alt text" });
    }
  });

  // Read Aloud (Text-to-Speech with word timing) Endpoint
  app.post("/api/read-aloud", async (req, res) => {
    try {
      const validatedData = readAloudRequestSchema.parse(req.body);
      const { text, wordsPerMinute } = validatedData;

      const words = text.split(/\s+/);
      const millisecondsPerWord = (60 / wordsPerMinute) * 1000;

      const wordTimings = words.map((word, index) => ({
        word,
        startTime: index * millisecondsPerWord,
        duration: millisecondsPerWord,
      }));

      res.json({
        text,
        wordTimings,
        totalDuration: words.length * millisecondsPerWord,
        wordsPerMinute,
      });
    } catch (error) {
      console.error("Error in read-aloud endpoint:", error);
      res.status(500).json({ error: "Failed to process read-aloud request" });
    }
  });

  // Get conversation history
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const conversations = await storage.getChatConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get specific conversation
  app.get("/api/conversation/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const conversation = await storage.getChatConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
