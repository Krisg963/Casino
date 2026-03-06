import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { spinReels, calculateWin, getSymbolsForSlot } from "./slots-config";
import {
  registerSchema, loginSchema, depositSchema, spinSchema
} from "@shared/schema";

const scryptAsync = promisify(scrypt);
const PgSession = connectPgSimple(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Ikke logget inn" });
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Ikke logget inn" });
  if ((req.user as any)?.role !== "admin") return res.status(403).json({ message: "Ingen tilgang" });
  next();
}

async function seedData() {
  try {
    const existingSlots = await storage.getAllSlots();
    if (existingSlots.length > 0) return;

    const slotDefs = [
      { name: "Klassisk Frukt", description: "Den klassiske spilleautomaten med frukter, 7-ere og BAR-symboler. Enkel og morsom!", category: "Klassisk", rtp: 97, minBet: 1, maxBet: 200, maxWin: 5000, features: ["Wildsymbol", "Free Spins"], themeKey: "classic_fruit", volatility: "low" },
      { name: "Aztec Gold", description: "Reis til det gamle Aztec-imperiet og finn skjulte skatter i jungelen.", category: "Eventyr", rtp: 96, minBet: 2, maxBet: 300, maxWin: 8000, features: ["Free Spins", "Multiplier"], themeKey: "aztec_gold", volatility: "medium" },
      { name: "Space Adventure", description: "Utforsk universet og finn skjulte skatter blant stjerner og planeter.", category: "Sci-Fi", rtp: 96.5, minBet: 1, maxBet: 250, maxWin: 7500, features: ["Expanding Wild", "Re-Spin"], themeKey: "space_adventure", volatility: "medium" },
      { name: "Dragon's Fire", description: "Møt den mektige dragen og vinn store premier med ild og flammer.", category: "Fantasy", rtp: 95.5, minBet: 2, maxBet: 500, maxWin: 15000, features: ["Bonus Round", "Free Spins", "Multiplier"], themeKey: "dragon_fire", volatility: "high" },
      { name: "Ocean Treasure", description: "Dykk ned i havets dybder og finn mystiske skatter og sjeldne perler.", category: "Eventyr", rtp: 96, minBet: 1, maxBet: 200, maxWin: 6000, features: ["Scatter", "Free Spins"], themeKey: "ocean_treasure", volatility: "medium" },
      { name: "Pirate's Bounty", description: "Bli med pirater på jakten etter det ultimate byttet på høye hav.", category: "Eventyr", rtp: 95, minBet: 2, maxBet: 400, maxWin: 10000, features: ["Bonus Chest", "Free Spins"], themeKey: "pirate_bounty", volatility: "high" },
      { name: "Wild West", description: "Ritt inn i solnedgangen i den vill vesten med cowboys og gullfunn.", category: "Eventyr", rtp: 96.5, minBet: 1, maxBet: 300, maxWin: 7000, features: ["Duel Feature", "Free Spins"], themeKey: "wild_west", volatility: "medium" },
      { name: "Egyptens Rikheter", description: "Tre inn i faraos pyramide og oppdage de skjulte skatten til Egypt.", category: "Klassisk", rtp: 95.8, minBet: 2, maxBet: 500, maxWin: 12000, features: ["Expanding Wild", "Bonus Game"], themeKey: "egyptian", volatility: "high" },
      { name: "Crystal Gems", description: "Spektakulære krystaller og edelstener venter deg i denne glinsende automaten.", category: "Klassisk", rtp: 97, minBet: 1, maxBet: 200, maxWin: 5000, features: ["Gem Collect", "Free Spins"], themeKey: "crystal_gems", volatility: "low" },
      { name: "Viking Raid", description: "Vær med vikingene på heirtokt og vinn kongelige premier og gull.", category: "Eventyr", rtp: 96, minBet: 2, maxBet: 400, maxWin: 9000, features: ["Raid Mode", "Free Spins"], themeKey: "viking_raid", volatility: "medium" },
      { name: "Lucky Clover", description: "Finn de magiske kløverne og regnbuen som fører til leprechaunens gull.", category: "Klassisk", rtp: 97.5, minBet: 1, maxBet: 100, maxWin: 4000, features: ["Lucky Streak", "Mini-Game"], themeKey: "lucky_clover", volatility: "low" },
      { name: "Neon Nights", description: "Opplev nattliv og kasinoatmosfære i denne stilige automaten full av lys.", category: "Klassisk", rtp: 96.5, minBet: 5, maxBet: 500, maxWin: 10000, features: ["Casino Mode", "Jackpot"], themeKey: "neon_nights", volatility: "medium" },
      { name: "Jungle Safari", description: "Utforsk den afrikanske jungelen og møt ville dyr på dette eventyret.", category: "Eventyr", rtp: 95.5, minBet: 1, maxBet: 300, maxWin: 7000, features: ["Animal Wilds", "Free Spins"], themeKey: "jungle_safari", volatility: "medium" },
      { name: "Frozen Kingdom", description: "Tre inn i et frosset kongerike der is og snø skjuler enorme skatter.", category: "Fantasy", rtp: 96, minBet: 2, maxBet: 400, maxWin: 8500, features: ["Ice Storm", "Free Spins"], themeKey: "frozen_kingdom", volatility: "medium" },
      { name: "Money Vault", description: "Knekk hvelvet og ta all rikdommen i denne pengefokuserte automaten.", category: "Klassisk", rtp: 96.8, minBet: 5, maxBet: 500, maxWin: 20000, features: ["Vault Bonus", "Mega Win"], themeKey: "money_vault", volatility: "high" },
      { name: "Candy Land", description: "Reiser til Godteriland der alt er søtt og premiene er enda søtere!", category: "Morsom", rtp: 97, minBet: 1, maxBet: 100, maxWin: 3000, features: ["Sweet Wilds", "Candy Bonus"], themeKey: "candy_land", volatility: "low" },
      { name: "Cyber Future", description: "Kom inn i fremtiden med AI, roboter og teknologi i dette sci-fi eventyret.", category: "Sci-Fi", rtp: 96.5, minBet: 2, maxBet: 500, maxWin: 12000, features: ["Quantum Wild", "Neural Bonus"], themeKey: "cyber_future", volatility: "high" },
      { name: "Antikkens Roma", description: "Gladiatorene venter i Colosseum - vinn som en sann Caeser!", category: "Historisk", rtp: 96, minBet: 2, maxBet: 300, maxWin: 8000, features: ["Gladiator Bonus", "Free Spins"], themeKey: "ancient_rome", volatility: "medium" },
      { name: "Ninja Warriors", description: "Tren som en ninja og vinn med presisjon og hurtighet i skyggen.", category: "Action", rtp: 96.5, minBet: 1, maxBet: 400, maxWin: 9000, features: ["Stealth Mode", "Shuriken Wild"], themeKey: "ninja_warriors", volatility: "medium" },
      { name: "Fantasy Forest", description: "Et magisk skogseventyr med alver, enhjørninger og magiske skapninger.", category: "Fantasy", rtp: 96, minBet: 1, maxBet: 200, maxWin: 6500, features: ["Magic Wild", "Forest Bonus"], themeKey: "fantasy_forest", volatility: "medium" },
    ];

    for (const slot of slotDefs) {
      await storage.createSlot(slot);
    }

    const adminHash = await hashPassword("admin123");
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      const admin = await storage.createUser({
        username: "admin",
        email: "admin@casino.no",
        passwordHash: adminHash,
      });
      await storage.updateUserRole(admin.id, "admin");
      await storage.updateUserBalance(admin.id, 0);
    }

    console.log("Seed data inserted successfully");
  } catch (err) {
    console.error("Seed error:", err);
  }
}

export async function registerRoutes(httpServer: any, app: Express): Promise<Server> {
  app.use(session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "casino-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Feil brukernavn eller passord" });
      if (!user.isActive) return done(null, false, { message: "Konto er deaktivert" });
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return done(null, false, { message: "Feil brukernavn eller passord" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  await seedData();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const { username, email, password } = parsed.data;
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(400).json({ message: "Brukernavn er allerede tatt" });
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) return res.status(400).json({ message: "E-post er allerede registrert" });
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({ username, email, passwordHash });
      await storage.updateUserBalance(user.id, 1000);
      await storage.createTransaction({
        userId: user.id, type: "bonus",
        amount: 1000, description: "Velkomstbonus for nye spillere",
        balanceBefore: 0, balanceAfter: 1000,
      });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Feil ved innlogging" });
        const { passwordHash: _, ...safeUser } = user;
        res.json({ user: safeUser });
      });
    } catch (err) {
      res.status(500).json({ message: "Serverfeil" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Ugyldig innlogging" });
      req.login(user, (err) => {
        if (err) return next(err);
        const { passwordHash, ...safeUser } = user;
        res.json({ user: safeUser });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Feil ved utlogging" });
      res.json({ message: "Logget ut" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Ikke autentisert" });
    const { passwordHash, ...safeUser } = req.user as any;
    res.json({ user: safeUser });
  });

  app.get("/api/slots", async (req, res) => {
    const slots = await storage.getAllSlots();
    const activeSlots = slots.filter(s => s.isActive);
    res.json(activeSlots);
  });

  app.get("/api/slots/:id", async (req, res) => {
    const slot = await storage.getSlot(req.params.id);
    if (!slot) return res.status(404).json({ message: "Spill ikke funnet" });
    res.json(slot);
  });

  app.get("/api/slots/:id/symbols", async (req, res) => {
    const slot = await storage.getSlot(req.params.id);
    if (!slot) return res.status(404).json({ message: "Spill ikke funnet" });
    const symbols = getSymbolsForSlot(slot.themeKey);
    res.json(symbols);
  });

  app.post("/api/slots/:id/spin", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const parsed = spinSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const { betAmount } = parsed.data;
      const freshUser = await storage.getUser(user.id);
      if (!freshUser) return res.status(404).json({ message: "Bruker ikke funnet" });
      if (freshUser.balance < betAmount) return res.status(400).json({ message: "Ikke nok saldo" });
      const slot = await storage.getSlot(req.params.id);
      if (!slot || !slot.isActive) return res.status(404).json({ message: "Spill ikke tilgjengelig" });
      if (betAmount < slot.minBet) return res.status(400).json({ message: `Minimum innsats er ${slot.minBet} kr` });
      if (betAmount > slot.maxBet) return res.status(400).json({ message: `Maksimum innsats er ${slot.maxBet} kr` });

      const reels = spinReels(slot.themeKey);
      const { winAmount, multiplier, winningLines } = calculateWin(reels, betAmount, slot.themeKey);

      const balanceBefore = freshUser.balance;
      const balanceAfterBet = parseFloat((balanceBefore - betAmount).toFixed(2));
      const balanceAfter = parseFloat((balanceAfterBet + winAmount).toFixed(2));

      await storage.updateUserBalance(user.id, balanceAfter);

      const txDesc = winAmount > 0
        ? `Spinn i ${slot.name} - Vant ${winAmount.toFixed(2)} kr (${multiplier}x)`
        : `Spinn i ${slot.name} - Tapte ${betAmount.toFixed(2)} kr`;

      await storage.createTransaction({
        userId: user.id, type: winAmount > 0 ? "win" : "loss",
        amount: winAmount > 0 ? winAmount - betAmount : -betAmount,
        description: txDesc, balanceBefore, balanceAfter,
      });

      await storage.createGameSession({
        userId: user.id, slotId: slot.id, betAmount, winAmount,
        reels, isWin: winAmount > 0, multiplier,
      });

      res.json({ reels, winAmount, multiplier, winningLines, newBalance: balanceAfter });
    } catch (err) {
      console.error("Spin error:", err);
      res.status(500).json({ message: "Feil ved spinn" });
    }
  });

  app.post("/api/wallet/deposit", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const parsed = depositSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const { amount } = parsed.data;
      const freshUser = await storage.getUser(user.id);
      if (!freshUser) return res.status(404).json({ message: "Bruker ikke funnet" });
      const newBalance = parseFloat((freshUser.balance + amount).toFixed(2));
      await storage.updateUserBalance(user.id, newBalance);
      await storage.createTransaction({
        userId: user.id, type: "deposit",
        amount, description: `Innskudd på ${amount} kr`,
        balanceBefore: freshUser.balance, balanceAfter: newBalance,
      });
      res.json({ balance: newBalance, message: `${amount} kr er satt inn` });
    } catch (err) {
      res.status(500).json({ message: "Feil ved innskudd" });
    }
  });

  app.get("/api/wallet/transactions", requireAuth, async (req, res) => {
    const user = req.user as any;
    const txs = await storage.getUserTransactions(user.id);
    res.json(txs);
  });

  app.get("/api/history", requireAuth, async (req, res) => {
    const user = req.user as any;
    const sessions = await storage.getUserGameSessions(user.id);
    res.json(sessions);
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const safe = allUsers.map(({ passwordHash, ...u }) => u);
    res.json(safe);
  });

  app.patch("/api/admin/users/:id/active", requireAdmin, async (req, res) => {
    const { isActive } = req.body;
    await storage.updateUserActive(req.params.id, isActive);
    res.json({ message: "Oppdatert" });
  });

  app.patch("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
    const { balance } = req.body;
    if (typeof balance !== "number" || balance < 0) return res.status(400).json({ message: "Ugyldig saldo" });
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Bruker ikke funnet" });
    await storage.updateUserBalance(req.params.id, balance);
    await storage.createTransaction({
      userId: req.params.id, type: "admin_adjust",
      amount: balance - user.balance,
      description: `Admin justerte saldo til ${balance} kr`,
      balanceBefore: user.balance, balanceAfter: balance,
    });
    res.json({ message: "Saldo oppdatert" });
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Ugyldig rolle" });
    await storage.updateUserRole(req.params.id, role);
    res.json({ message: "Rolle oppdatert" });
  });

  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    const txs = await storage.getAllTransactions();
    res.json(txs);
  });

  app.get("/api/admin/game-sessions", requireAdmin, async (req, res) => {
    const sessions = await storage.getAllGameSessions();
    res.json(sessions);
  });

  app.get("/api/admin/slots", requireAdmin, async (req, res) => {
    const allSlots = await storage.getAllSlots();
    res.json(allSlots);
  });

  app.patch("/api/admin/slots/:id/active", requireAdmin, async (req, res) => {
    const { isActive } = req.body;
    await storage.updateSlotActive(req.params.id, isActive);
    res.json({ message: "Oppdatert" });
  });

  return httpServer;
}
