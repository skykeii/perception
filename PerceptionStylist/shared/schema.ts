import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const fontPreferences = pgTable("font_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fontFamily: text("font_family").notNull(),
  fontSize: integer("font_size").notNull(),
});

export const insertFontPreferenceSchema = createInsertSchema(fontPreferences).omit({
  id: true,
}).extend({
  fontFamily: z.enum(["Arial", "Verdana", "Georgia", "Times New Roman", "Courier"], {
    errorMap: () => ({ message: "Font family must be one of: Arial, Verdana, Georgia, Times New Roman, Courier" })
  }),
  fontSize: z.number().int().min(12, "Font size must be at least 12px").max(24, "Font size must be at most 24px")
});

export const updateFontPreferenceSchema = insertFontPreferenceSchema.partial();

export type InsertFontPreference = z.infer<typeof insertFontPreferenceSchema>;
export type UpdateFontPreference = z.infer<typeof updateFontPreferenceSchema>;
export type FontPreference = typeof fontPreferences.$inferSelect;
