import { 
  type User, 
  type InsertUser,
  type FontPreference,
  type InsertFontPreference,
  type UpdateFontPreference
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getFontPreference(id: string): Promise<FontPreference | undefined>;
  getCurrentFontPreference(): Promise<FontPreference | undefined>;
  createFontPreference(preference: InsertFontPreference): Promise<FontPreference>;
  updateFontPreference(id: string, preference: UpdateFontPreference): Promise<FontPreference | undefined>;
  deleteFontPreference(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private fontPreferences: Map<string, FontPreference>;
  private currentPreferenceId: string | null;

  constructor() {
    this.users = new Map();
    this.fontPreferences = new Map();
    this.currentPreferenceId = null;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFontPreference(id: string): Promise<FontPreference | undefined> {
    return this.fontPreferences.get(id);
  }

  async getCurrentFontPreference(): Promise<FontPreference | undefined> {
    if (!this.currentPreferenceId) {
      return undefined;
    }
    return this.fontPreferences.get(this.currentPreferenceId);
  }

  async createFontPreference(insertPreference: InsertFontPreference): Promise<FontPreference> {
    const id = randomUUID();
    const preference: FontPreference = { 
      ...insertPreference, 
      id 
    };
    this.fontPreferences.set(id, preference);
    this.currentPreferenceId = id;
    return preference;
  }

  async updateFontPreference(id: string, updatePreference: UpdateFontPreference): Promise<FontPreference | undefined> {
    const existing = this.fontPreferences.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated: FontPreference = {
      ...existing,
      ...updatePreference
    };
    this.fontPreferences.set(id, updated);
    return updated;
  }

  async deleteFontPreference(id: string): Promise<boolean> {
    const deleted = this.fontPreferences.delete(id);
    if (deleted && this.currentPreferenceId === id) {
      this.currentPreferenceId = null;
    }
    return deleted;
  }
}

export const storage = new MemStorage();
