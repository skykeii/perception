import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFontPreferenceSchema, updateFontPreferenceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/font-preferences/current", async (req, res) => {
    try {
      const preference = await storage.getCurrentFontPreference();
      
      if (!preference) {
        return res.status(404).json({ 
          error: "No font preferences found",
          message: "Please create font preferences first" 
        });
      }
      
      res.json(preference);
    } catch (error) {
      console.error("Error fetching font preferences:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/font-preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const preference = await storage.getFontPreference(id);
      
      if (!preference) {
        return res.status(404).json({ error: "Font preference not found" });
      }
      
      res.json(preference);
    } catch (error) {
      console.error("Error fetching font preference:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/font-preferences", async (req, res) => {
    try {
      const validatedData = insertFontPreferenceSchema.parse(req.body);
      const preference = await storage.createFontPreference(validatedData);
      
      res.status(201).json(preference);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation error",
          details: error
        });
      }
      console.error("Error creating font preference:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/font-preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateFontPreferenceSchema.parse(req.body);
      
      const updated = await storage.updateFontPreference(id, validatedData);
      
      if (!updated) {
        return res.status(404).json({ error: "Font preference not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation error",
          details: error
        });
      }
      console.error("Error updating font preference:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/font-preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFontPreference(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Font preference not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting font preference:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
