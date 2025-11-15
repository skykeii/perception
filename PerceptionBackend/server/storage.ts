import {
  type UserPreferences,
  type InsertUserPreferences,
  type ChatConversation,
  type InsertChatConversation,
  type AltTextCache,
  type InsertAltTextCache,
  type ChatMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, prefs: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  
  getChatConversation(id: string): Promise<ChatConversation | undefined>;
  getChatConversationsByUser(userId: string): Promise<ChatConversation[]>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: string, messages: ChatMessage[]): Promise<ChatConversation>;
  
  getAltTextFromCache(imageUrl: string): Promise<AltTextCache | undefined>;
  cacheAltText(cache: InsertAltTextCache): Promise<AltTextCache>;
}

export class MemStorage implements IStorage {
  private userPreferences: Map<string, UserPreferences>;
  private chatConversations: Map<string, ChatConversation>;
  private altTextCache: Map<string, AltTextCache>;

  constructor() {
    this.userPreferences = new Map();
    this.chatConversations = new Map();
    this.altTextCache = new Map();
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
  }

  async createUserPreferences(insertPrefs: InsertUserPreferences): Promise<UserPreferences> {
    const id = randomUUID();
    const now = new Date();
    const prefs: UserPreferences = {
      id,
      userId: insertPrefs.userId,
      focusMode: insertPrefs.focusMode ?? false,
      motionBlocker: insertPrefs.motionBlocker ?? false,
      contrastLevel: insertPrefs.contrastLevel ?? "normal",
      largerClickTargets: insertPrefs.largerClickTargets ?? false,
      textSimplification: insertPrefs.textSimplification ?? false,
      readAloud: insertPrefs.readAloud ?? false,
      fontSize: insertPrefs.fontSize ?? "100",
      preferences: insertPrefs.preferences ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.userPreferences.set(id, prefs);
    return prefs;
  }

  async updateUserPreferences(
    userId: string,
    updates: Partial<InsertUserPreferences>
  ): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    if (!existing) {
      throw new Error("User preferences not found");
    }
    
    const updated: UserPreferences = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }

  async getChatConversation(id: string): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }

  async getChatConversationsByUser(userId: string): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values()).filter(
      (conv) => conv.userId === userId
    );
  }

  async createChatConversation(insertConv: InsertChatConversation): Promise<ChatConversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: ChatConversation = {
      id,
      userId: insertConv.userId,
      messages: insertConv.messages ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.chatConversations.set(id, conversation);
    return conversation;
  }

  async updateChatConversation(id: string, messages: ChatMessage[]): Promise<ChatConversation> {
    const existing = await this.getChatConversation(id);
    if (!existing) {
      throw new Error("Chat conversation not found");
    }
    
    const updated: ChatConversation = {
      ...existing,
      messages: messages as any,
      updatedAt: new Date(),
    };
    this.chatConversations.set(id, updated);
    return updated;
  }

  async getAltTextFromCache(imageUrl: string): Promise<AltTextCache | undefined> {
    return Array.from(this.altTextCache.values()).find(
      (cache) => cache.imageUrl === imageUrl
    );
  }

  async cacheAltText(insertCache: InsertAltTextCache): Promise<AltTextCache> {
    const id = randomUUID();
    const cache: AltTextCache = {
      ...insertCache,
      id,
      createdAt: new Date(),
    };
    this.altTextCache.set(id, cache);
    return cache;
  }
}

export const storage = new MemStorage();
