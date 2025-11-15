import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  chatRequestSchema,
  simplifyTextRequestSchema,
  generateAltTextRequestSchema,
  readAloudRequestSchema,
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

  // AI Chatbot Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const { userId, message, conversationId } = validatedData;

      let conversation;
      let messages: ChatMessage[] = [];

      if (conversationId) {
        conversation = await storage.getChatConversation(conversationId);
        if (conversation) {
          messages = conversation.messages as ChatMessage[];
        }
      }

      if (!conversation) {
        conversation = await storage.createChatConversation({
          userId,
          messages: [],
        });
      }

      messages.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      const systemPrompt = `You are an AI assistant for the Perception accessibility Chrome extension. Your role is to help users understand and enable accessibility features based on their needs.

Available features:
- Focus Mode: Automatically fades out ads, sidebars, and distracting visuals
- Motion Blocker: Pauses or slows down all motion/flashing content
- Contrast Control: Adjustable contrast levels for better visibility
- Larger Click Targets: Makes clickable areas larger and easier to interact with
- Text Simplification: Rewrites complex paragraphs into simple sentences
- Read Aloud: Word-by-word reading with highlighting
- Button Targeting: Guides cursor to links and buttons

When a user describes their problem or need, recommend the most appropriate features and explain how to enable them. Be concise, empathetic, and practical.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantMessage = completion.choices[0].message.content || "I'm here to help with accessibility features.";

      messages.push({
        role: "assistant",
        content: assistantMessage,
        timestamp: new Date().toISOString(),
      });

      await storage.updateChatConversation(conversation.id, messages);

      res.json({
        conversationId: conversation.id,
        message: assistantMessage,
        suggestions: extractFeatureSuggestions(assistantMessage),
      });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process chat message" });
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

function extractFeatureSuggestions(message: string): string[] {
  const features = [
    "Focus Mode",
    "Motion Blocker",
    "Contrast Control",
    "Larger Click Targets",
    "Text Simplification",
    "Read Aloud",
    "Button Targeting",
  ];

  return features.filter(feature => 
    message.toLowerCase().includes(feature.toLowerCase())
  );
}
