import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  focusMode: boolean("focus_mode").default(false),
  motionBlocker: boolean("motion_blocker").default(false),
  contrastLevel: text("contrast_level").default("normal"),
  largerClickTargets: boolean("larger_click_targets").default(false),
  textSimplification: boolean("text_simplification").default(false),
  readAloud: boolean("read_aloud").default(false),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const altTextCache = pgTable("alt_text_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull().unique(),
  altText: text("alt_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAltTextCacheSchema = createInsertSchema(altTextCache).omit({
  id: true,
  createdAt: true,
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string().optional(),
});

export const simplifyTextRequestSchema = z.object({
  text: z.string().min(1),
  readingLevel: z.enum(["elementary", "middle", "high"]).default("middle"),
});

export const generateAltTextRequestSchema = z.object({
  imageUrl: z.string().url(),
  useCache: z.boolean().default(true),
});

export const readAloudRequestSchema = z.object({
  text: z.string().min(1),
  wordsPerMinute: z.number().min(50).max(300).default(150),
});

export const chatRequestSchema = z.object({
  userId: z.string(),
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertAltTextCache = z.infer<typeof insertAltTextCacheSchema>;
export type AltTextCache = typeof altTextCache.$inferSelect;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SimplifyTextRequest = z.infer<typeof simplifyTextRequestSchema>;
export type GenerateAltTextRequest = z.infer<typeof generateAltTextRequestSchema>;
export type ReadAloudRequest = z.infer<typeof readAloudRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
