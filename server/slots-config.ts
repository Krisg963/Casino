export interface SlotSymbol {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  weight: number;
  value3: number;
  value4: number;
  value5: number;
  isScatter?: boolean;
}

export interface SlotConfig {
  themeKey: string;
  symbols: SlotSymbol[];
}

const SCATTER: SlotSymbol = {
  id: "scatter", label: "FREE", color: "#1a1a1a", bgColor: "#ffd700",
  weight: 4, value3: 0, value4: 0, value5: 0, isScatter: true,
};

function withScatter(symbols: SlotSymbol[]): SlotSymbol[] {
  return [...symbols, SCATTER];
}

export const slotConfigs: Record<string, SlotConfig> = {
  classic_fruit: {
    themeKey: "classic_fruit",
    symbols: withScatter([
      { id: "cherry", label: "CHR", color: "#fff", bgColor: "#e53e3e", weight: 30, value3: 2, value4: 5, value5: 15 },
      { id: "lemon", label: "LEM", color: "#1a1a1a", bgColor: "#ecc94b", weight: 25, value3: 3, value4: 8, value5: 20 },
      { id: "orange", label: "ORG", color: "#fff", bgColor: "#ed8936", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "plum", label: "PLM", color: "#fff", bgColor: "#9f7aea", weight: 15, value3: 8, value4: 20, value5: 50 },
      { id: "bar", label: "BAR", color: "#fff", bgColor: "#4a5568", weight: 7, value3: 15, value4: 40, value5: 100 },
      { id: "seven", label: "7", color: "#fff", bgColor: "#c53030", weight: 3, value3: 30, value4: 80, value5: 200 },
    ]),
  },
  aztec_gold: {
    themeKey: "aztec_gold",
    symbols: withScatter([
      { id: "stone", label: "STN", color: "#fff", bgColor: "#744210", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "jade", label: "JAD", color: "#fff", bgColor: "#276749", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "snake", label: "SNK", color: "#fff", bgColor: "#2f855a", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "mask", label: "MSK", color: "#fff", bgColor: "#b7791f", weight: 15, value3: 8, value4: 20, value5: 50 },
      { id: "sun", label: "SUN", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value3: 15, value4: 40, value5: 100 },
      { id: "idol", label: "IDL", color: "#fff", bgColor: "#d69e2e", weight: 3, value3: 30, value4: 80, value5: 250 },
    ]),
  },
  space_adventure: {
    themeKey: "space_adventure",
    symbols: withScatter([
      { id: "star", label: "STR", color: "#fff", bgColor: "#2d3748", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "planet", label: "PLN", color: "#fff", bgColor: "#2b6cb0", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "comet", label: "CMT", color: "#fff", bgColor: "#553c9a", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "rocket", label: "RKT", color: "#fff", bgColor: "#e53e3e", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "alien", label: "ALN", color: "#fff", bgColor: "#2f855a", weight: 7, value3: 15, value4: 40, value5: 100 },
      { id: "ufo", label: "UFO", color: "#1a1a1a", bgColor: "#68d391", weight: 3, value3: 35, value4: 90, value5: 250 },
    ]),
  },
  dragon_fire: {
    themeKey: "dragon_fire",
    symbols: withScatter([
      { id: "scale", label: "SCL", color: "#fff", bgColor: "#276749", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "gem", label: "GEM", color: "#fff", bgColor: "#2b6cb0", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "sword", label: "SWD", color: "#fff", bgColor: "#4a5568", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "crown", label: "CRN", color: "#1a1a1a", bgColor: "#f6e05e", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "fire", label: "FIR", color: "#fff", bgColor: "#c05621", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "dragon", label: "DRG", color: "#fff", bgColor: "#c53030", weight: 3, value3: 40, value4: 100, value5: 300 },
    ]),
  },
  ocean_treasure: {
    themeKey: "ocean_treasure",
    symbols: withScatter([
      { id: "fish", label: "FSH", color: "#fff", bgColor: "#2b6cb0", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "coral", label: "CRL", color: "#fff", bgColor: "#e53e3e", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "seahorse", label: "SEA", color: "#fff", bgColor: "#b7791f", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "pearl", label: "PRL", color: "#1a1a1a", bgColor: "#e2e8f0", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "starfish", label: "SFH", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value3: 15, value4: 40, value5: 100 },
      { id: "chest", label: "CST", color: "#fff", bgColor: "#d69e2e", weight: 3, value3: 35, value4: 85, value5: 250 },
    ]),
  },
  pirate_bounty: {
    themeKey: "pirate_bounty",
    symbols: withScatter([
      { id: "coin", label: "CON", color: "#1a1a1a", bgColor: "#f6e05e", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "parrot", label: "PRT", color: "#fff", bgColor: "#e53e3e", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "cannon", label: "CNN", color: "#fff", bgColor: "#2d3748", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "map", label: "MAP", color: "#fff", bgColor: "#744210", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "skull", label: "SKL", color: "#fff", bgColor: "#1a1a1a", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "treasure", label: "TRS", color: "#fff", bgColor: "#d69e2e", weight: 3, value3: 40, value4: 100, value5: 300 },
    ]),
  },
  wild_west: {
    themeKey: "wild_west",
    symbols: withScatter([
      { id: "cactus", label: "CCT", color: "#fff", bgColor: "#276749", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "horseshoe", label: "HSH", color: "#fff", bgColor: "#4a5568", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "boot", label: "BOT", color: "#fff", bgColor: "#744210", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "revolver", label: "RVL", color: "#fff", bgColor: "#1a1a1a", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "nugget", label: "NGT", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "sheriff", label: "SHF", color: "#fff", bgColor: "#c05621", weight: 3, value3: 35, value4: 85, value5: 250 },
    ]),
  },
  egyptian: {
    themeKey: "egyptian",
    symbols: withScatter([
      { id: "scarab", label: "SCB", color: "#fff", bgColor: "#276749", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "eye", label: "EYE", color: "#fff", bgColor: "#2b6cb0", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "cat", label: "CAT", color: "#fff", bgColor: "#1a1a1a", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "ankh", label: "ANK", color: "#fff", bgColor: "#c05621", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "pyramid", label: "PYR", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "pharaoh", label: "PHR", color: "#1a1a1a", bgColor: "#d69e2e", weight: 3, value3: 45, value4: 100, value5: 300 },
    ]),
  },
  crystal_gems: {
    themeKey: "crystal_gems",
    symbols: withScatter([
      { id: "amethyst", label: "AMT", color: "#fff", bgColor: "#9f7aea", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "topaz", label: "TPZ", color: "#fff", bgColor: "#ed8936", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "sapphire", label: "SPH", color: "#fff", bgColor: "#3182ce", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "emerald", label: "EMR", color: "#fff", bgColor: "#2f855a", weight: 15, value3: 12, value4: 30, value5: 70 },
      { id: "ruby", label: "RBY", color: "#fff", bgColor: "#c53030", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "diamond", label: "DMD", color: "#1a1a1a", bgColor: "#e2e8f0", weight: 3, value3: 50, value4: 120, value5: 350 },
    ]),
  },
  viking_raid: {
    themeKey: "viking_raid",
    symbols: withScatter([
      { id: "rune", label: "RNE", color: "#fff", bgColor: "#2d3748", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "axe", label: "AXE", color: "#fff", bgColor: "#4a5568", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "shield", label: "SHD", color: "#fff", bgColor: "#c53030", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "wolf", label: "WLF", color: "#fff", bgColor: "#1a1a1a", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "ship", label: "SHP", color: "#fff", bgColor: "#2b6cb0", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "odin", label: "ODN", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value3: 40, value4: 100, value5: 300 },
    ]),
  },
  lucky_clover: {
    themeKey: "lucky_clover",
    symbols: withScatter([
      { id: "clover", label: "CLV", color: "#fff", bgColor: "#276749", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "rainbow", label: "RBW", color: "#fff", bgColor: "#3182ce", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "horseshoe2", label: "HSH", color: "#fff", bgColor: "#b7791f", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "hat", label: "HAT", color: "#fff", bgColor: "#276749", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "pot", label: "POT", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value3: 15, value4: 40, value5: 100 },
      { id: "leprechaun", label: "LEP", color: "#fff", bgColor: "#d69e2e", weight: 3, value3: 40, value4: 95, value5: 280 },
    ]),
  },
  neon_nights: {
    themeKey: "neon_nights",
    symbols: withScatter([
      { id: "dice", label: "DCE", color: "#fff", bgColor: "#2d3748", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "card", label: "CRD", color: "#fff", bgColor: "#553c9a", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "chip", label: "CHP", color: "#fff", bgColor: "#2b6cb0", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "cocktail", label: "CKT", color: "#fff", bgColor: "#e53e3e", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "cash", label: "CSH", color: "#fff", bgColor: "#276749", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "jackpot", label: "JPT", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value3: 50, value4: 120, value5: 350 },
    ]),
  },
  jungle_safari: {
    themeKey: "jungle_safari",
    symbols: withScatter([
      { id: "monkey", label: "MNK", color: "#fff", bgColor: "#744210", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "zebra", label: "ZBR", color: "#fff", bgColor: "#2d3748", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "elephant", label: "ELF", color: "#fff", bgColor: "#4a5568", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "tiger", label: "TGR", color: "#fff", bgColor: "#ed8936", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "lion", label: "LIN", color: "#fff", bgColor: "#c05621", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "gorilla", label: "GRL", color: "#fff", bgColor: "#1a1a1a", weight: 3, value3: 35, value4: 85, value5: 250 },
    ]),
  },
  frozen_kingdom: {
    themeKey: "frozen_kingdom",
    symbols: withScatter([
      { id: "snowflake", label: "SNW", color: "#fff", bgColor: "#3182ce", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "crystal", label: "CRY", color: "#fff", bgColor: "#63b3ed", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "wolf2", label: "WLF", color: "#fff", bgColor: "#2d3748", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "bear", label: "BER", color: "#fff", bgColor: "#4a5568", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "castle", label: "CSL", color: "#fff", bgColor: "#553c9a", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "ice_queen", label: "IQN", color: "#1a1a1a", bgColor: "#bee3f8", weight: 3, value3: 45, value4: 100, value5: 300 },
    ]),
  },
  money_vault: {
    themeKey: "money_vault",
    symbols: withScatter([
      { id: "coin2", label: "CON", color: "#1a1a1a", bgColor: "#f6e05e", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "safe", label: "SFE", color: "#fff", bgColor: "#4a5568", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "briefcase", label: "BCE", color: "#fff", bgColor: "#744210", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "gold_bar", label: "GLD", color: "#1a1a1a", bgColor: "#d69e2e", weight: 15, value3: 12, value4: 30, value5: 70 },
      { id: "diamond2", label: "DMD", color: "#1a1a1a", bgColor: "#e2e8f0", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "vault", label: "VLT", color: "#fff", bgColor: "#c53030", weight: 3, value3: 50, value4: 120, value5: 350 },
    ]),
  },
  candy_land: {
    themeKey: "candy_land",
    symbols: withScatter([
      { id: "gummy", label: "GMY", color: "#fff", bgColor: "#e53e3e", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "lollipop", label: "LLP", color: "#fff", bgColor: "#ed64a6", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "chocolate", label: "CHC", color: "#fff", bgColor: "#744210", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "candy_cane", label: "CNC", color: "#fff", bgColor: "#c53030", weight: 15, value3: 8, value4: 20, value5: 50 },
      { id: "ice_cream", label: "ICR", color: "#1a1a1a", bgColor: "#fbb6ce", weight: 7, value3: 15, value4: 40, value5: 100 },
      { id: "cake", label: "CKE", color: "#fff", bgColor: "#9f7aea", weight: 3, value3: 35, value4: 85, value5: 250 },
    ]),
  },
  cyber_future: {
    themeKey: "cyber_future",
    symbols: withScatter([
      { id: "circuit", label: "CRC", color: "#fff", bgColor: "#2d3748", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "data", label: "DTA", color: "#fff", bgColor: "#3182ce", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "laser", label: "LSR", color: "#fff", bgColor: "#e53e3e", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "robot", label: "RBT", color: "#fff", bgColor: "#553c9a", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "ai", label: "A.I", color: "#fff", bgColor: "#276749", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "chip2", label: "QNT", color: "#1a1a1a", bgColor: "#9ae6b4", weight: 3, value3: 45, value4: 100, value5: 300 },
    ]),
  },
  ancient_rome: {
    themeKey: "ancient_rome",
    symbols: withScatter([
      { id: "laurel", label: "LRL", color: "#fff", bgColor: "#276749", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "column", label: "CLM", color: "#fff", bgColor: "#e2e8f0", weight: 25, value3: 4, value4: 10, value5: 22 },
      { id: "eagle", label: "EGL", color: "#fff", bgColor: "#c05621", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "gladiator", label: "GLD", color: "#fff", bgColor: "#4a5568", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "roman_coin", label: "AUG", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "caesar", label: "CAE", color: "#fff", bgColor: "#c53030", weight: 3, value3: 40, value4: 100, value5: 300 },
    ]),
  },
  ninja_warriors: {
    themeKey: "ninja_warriors",
    symbols: withScatter([
      { id: "shuriken", label: "SHR", color: "#fff", bgColor: "#2d3748", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "lantern", label: "LNT", color: "#fff", bgColor: "#c53030", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "katana", label: "KTN", color: "#fff", bgColor: "#4a5568", weight: 20, value3: 5, value4: 12, value5: 30 },
      { id: "mask2", label: "MSK", color: "#fff", bgColor: "#1a1a1a", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "dragon2", label: "DRG", color: "#fff", bgColor: "#c05621", weight: 7, value3: 18, value4: 45, value5: 110 },
      { id: "sensei", label: "SNS", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value3: 40, value4: 95, value5: 280 },
    ]),
  },
  fantasy_forest: {
    themeKey: "fantasy_forest",
    symbols: withScatter([
      { id: "mushroom", label: "MSH", color: "#fff", bgColor: "#c53030", weight: 30, value3: 2, value4: 5, value5: 12 },
      { id: "acorn", label: "ACR", color: "#fff", bgColor: "#744210", weight: 25, value3: 3, value4: 8, value5: 18 },
      { id: "fairy", label: "FRY", color: "#fff", bgColor: "#ed64a6", weight: 20, value3: 6, value4: 15, value5: 35 },
      { id: "elf", label: "ELF", color: "#fff", bgColor: "#276749", weight: 15, value3: 10, value4: 25, value5: 60 },
      { id: "unicorn", label: "UNI", color: "#fff", bgColor: "#9f7aea", weight: 7, value3: 20, value4: 50, value5: 120 },
      { id: "magic", label: "MGC", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value3: 45, value4: 100, value5: 300 },
    ]),
  },
};

export function getSymbolsForSlot(themeKey: string): SlotSymbol[] {
  return slotConfigs[themeKey]?.symbols ?? slotConfigs["classic_fruit"].symbols;
}

function weightedRandom(symbols: SlotSymbol[]): SlotSymbol {
  const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  for (const symbol of symbols) {
    random -= symbol.weight;
    if (random <= 0) return symbol;
  }
  return symbols[0];
}

export function spinReels(themeKey: string, reelCount = 5, rowCount = 3): string[][] {
  const symbols = getSymbolsForSlot(themeKey);
  const reels: string[][] = [];
  for (let i = 0; i < reelCount; i++) {
    const reel: string[] = [];
    for (let j = 0; j < rowCount; j++) {
      reel.push(weightedRandom(symbols).id);
    }
    reels.push(reel);
  }
  return reels;
}

const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
];

export function calculateWin(reels: string[][], betAmount: number, themeKey: string): {
  winAmount: number;
  multiplier: number;
  winningLines: number[];
  freeSpinsWon: number;
  scatterCount: number;
} {
  const symbols = getSymbolsForSlot(themeKey);
  const symbolMap = new Map(symbols.map(s => [s.id, s]));

  let totalMultiplier = 0;
  const winningLines: number[] = [];

  for (let lineIdx = 0; lineIdx < PAYLINES.length; lineIdx++) {
    const payline = PAYLINES[lineIdx];
    const lineSymbols = payline.map((row, col) => reels[col]?.[row] ?? "");

    if (lineSymbols[0] === "scatter") continue;

    let matchCount = 1;
    const firstSym = lineSymbols[0];
    for (let i = 1; i < lineSymbols.length; i++) {
      if (lineSymbols[i] === firstSym) {
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const sym = symbolMap.get(firstSym);
      if (sym) {
        let value = 0;
        if (matchCount === 3) value = sym.value3;
        else if (matchCount === 4) value = sym.value4;
        else if (matchCount >= 5) value = sym.value5;
        totalMultiplier += value;
        winningLines.push(lineIdx);
      }
    }
  }

  let scatterCount = 0;
  for (const reel of reels) {
    for (const sym of reel) {
      if (sym === "scatter") scatterCount++;
    }
  }

  let freeSpinsWon = 0;
  if (scatterCount >= 3) freeSpinsWon = 5;
  if (scatterCount >= 4) freeSpinsWon = 10;
  if (scatterCount >= 5) freeSpinsWon = 15;

  const winAmount = totalMultiplier > 0 ? parseFloat((betAmount * totalMultiplier).toFixed(2)) : 0;
  return { winAmount, multiplier: totalMultiplier, winningLines, freeSpinsWon, scatterCount };
}
