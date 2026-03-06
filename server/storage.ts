import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import {
  users, slots, transactions, gameSessions,
  type User, type InsertUser, type Slot, type InsertSlot,
  type Transaction, type GameSession,
} from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, balance: number): Promise<void>;
  updateUserActive(id: string, isActive: boolean): Promise<void>;
  updateUserRole(id: string, role: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  getAllSlots(): Promise<Slot[]>;
  getSlot(id: string): Promise<Slot | undefined>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlotActive(id: string, isActive: boolean): Promise<void>;

  createTransaction(data: {
    userId: string; type: string; amount: number;
    description: string; balanceBefore: number; balanceAfter: number;
  }): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;

  createGameSession(data: {
    userId: string; slotId: string; betAmount: number; winAmount: number;
    reels: unknown; isWin: boolean; multiplier: number;
  }): Promise<GameSession>;
  getUserGameSessions(userId: string): Promise<(GameSession & { slotName: string })[]>;
  getAllGameSessions(): Promise<(GameSession & { username: string; slotName: string })[]>;

  getAdminStats(): Promise<{
    totalUsers: number; totalDeposits: number;
    totalBets: number; activeUsers: number;
  }>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(id: string, balance: number): Promise<void> {
    await db.update(users).set({ balance }).where(eq(users.id, id));
  }

  async updateUserActive(id: string, isActive: boolean): Promise<void> {
    await db.update(users).set({ isActive }).where(eq(users.id, id));
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllSlots(): Promise<Slot[]> {
    return db.select().from(slots).orderBy(slots.name);
  }

  async getSlot(id: string): Promise<Slot | undefined> {
    const [slot] = await db.select().from(slots).where(eq(slots.id, id));
    return slot;
  }

  async createSlot(slot: InsertSlot): Promise<Slot> {
    const [newSlot] = await db.insert(slots).values(slot).returning();
    return newSlot;
  }

  async updateSlotActive(id: string, isActive: boolean): Promise<void> {
    await db.update(slots).set({ isActive }).where(eq(slots.id, id));
  }

  async createTransaction(data: {
    userId: string; type: string; amount: number;
    description: string; balanceBefore: number; balanceAfter: number;
  }): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(100);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(500);
  }

  async createGameSession(data: {
    userId: string; slotId: string; betAmount: number; winAmount: number;
    reels: unknown; isWin: boolean; multiplier: number;
  }): Promise<GameSession> {
    const [gs] = await db.insert(gameSessions).values(data).returning();
    return gs;
  }

  async getUserGameSessions(userId: string): Promise<(GameSession & { slotName: string })[]> {
    const results = await db
      .select({
        id: gameSessions.id,
        userId: gameSessions.userId,
        slotId: gameSessions.slotId,
        betAmount: gameSessions.betAmount,
        winAmount: gameSessions.winAmount,
        reels: gameSessions.reels,
        isWin: gameSessions.isWin,
        multiplier: gameSessions.multiplier,
        createdAt: gameSessions.createdAt,
        slotName: slots.name,
      })
      .from(gameSessions)
      .innerJoin(slots, eq(gameSessions.slotId, slots.id))
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.createdAt))
      .limit(100);
    return results;
  }

  async getAllGameSessions(): Promise<(GameSession & { username: string; slotName: string })[]> {
    const results = await db
      .select({
        id: gameSessions.id,
        userId: gameSessions.userId,
        slotId: gameSessions.slotId,
        betAmount: gameSessions.betAmount,
        winAmount: gameSessions.winAmount,
        reels: gameSessions.reels,
        isWin: gameSessions.isWin,
        multiplier: gameSessions.multiplier,
        createdAt: gameSessions.createdAt,
        username: users.username,
        slotName: slots.name,
      })
      .from(gameSessions)
      .innerJoin(users, eq(gameSessions.userId, users.id))
      .innerJoin(slots, eq(gameSessions.slotId, slots.id))
      .orderBy(desc(gameSessions.createdAt))
      .limit(500);
    return results;
  }

  async getAdminStats(): Promise<{
    totalUsers: number; totalDeposits: number;
    totalBets: number; activeUsers: number;
  }> {
    const [{ count: totalUsers }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [{ count: activeUsers }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isActive, true));

    const [depositsResult] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactions).where(eq(transactions.type, "deposit"));

    const [betsResult] = await db.select({ total: sql<number>`coalesce(sum(bet_amount), 0)` })
      .from(gameSessions);

    return {
      totalUsers: Number(totalUsers),
      activeUsers: Number(activeUsers),
      totalDeposits: Number(depositsResult.total),
      totalBets: Number(betsResult.total),
    };
  }
}

export const storage = new DbStorage();
