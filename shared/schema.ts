import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  balance: real("balance").notNull().default(0),
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const slots = pgTable("slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  rtp: real("rtp").notNull().default(96),
  minBet: real("min_bet").notNull().default(1),
  maxBet: real("max_bet").notNull().default(500),
  maxWin: integer("max_win").notNull().default(5000),
  isActive: boolean("is_active").notNull().default(true),
  features: text("features").array().default(sql`'{}'::text[]`),
  themeKey: text("theme_key").notNull(),
  volatility: text("volatility").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  balanceBefore: real("balance_before").notNull(),
  balanceAfter: real("balance_after").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  slotId: varchar("slot_id").notNull().references(() => slots.id),
  betAmount: real("bet_amount").notNull(),
  winAmount: real("win_amount").notNull(),
  reels: jsonb("reels").notNull(),
  isWin: boolean("is_win").notNull(),
  multiplier: real("multiplier").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
}).extend({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  passwordHash: z.string(),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Brukernavn må ha minst 3 tegn").max(20, "Brukernavn kan maks ha 20 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(6, "Passord må ha minst 6 tegn"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Brukernavn er påkrevd"),
  password: z.string().min(1, "Passord er påkrevd"),
});

export const depositSchema = z.object({
  amount: z.number().min(10, "Minimum innskudd er 100 kr").max(50000, "Maksimum innskudd er 50 000 kr"),
});

export const spinSchema = z.object({
  betAmount: z.number().min(1).max(500),
});

export const insertSlotSchema = createInsertSchema(slots).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Slot = typeof slots.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;
