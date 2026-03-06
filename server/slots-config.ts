export interface SlotSymbol {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  weight: number;
  value: number;
}

export interface SlotConfig {
  themeKey: string;
  symbols: SlotSymbol[];
}

export const slotConfigs: Record<string, SlotConfig> = {
  classic_fruit: {
    themeKey: "classic_fruit",
    symbols: [
      { id: "cherry", label: "CHR", color: "#fff", bgColor: "#e53e3e", weight: 30, value: 2 },
      { id: "lemon", label: "LEM", color: "#1a1a1a", bgColor: "#ecc94b", weight: 25, value: 3 },
      { id: "orange", label: "ORG", color: "#fff", bgColor: "#ed8936", weight: 20, value: 5 },
      { id: "plum", label: "PLM", color: "#fff", bgColor: "#9f7aea", weight: 15, value: 8 },
      { id: "bar", label: "BAR", color: "#fff", bgColor: "#4a5568", weight: 7, value: 15 },
      { id: "seven", label: "7", color: "#fff", bgColor: "#c53030", weight: 3, value: 50 },
    ],
  },
  aztec_gold: {
    themeKey: "aztec_gold",
    symbols: [
      { id: "stone", label: "STN", color: "#fff", bgColor: "#744210", weight: 30, value: 2 },
      { id: "jade", label: "JAD", color: "#fff", bgColor: "#276749", weight: 25, value: 3 },
      { id: "snake", label: "SNK", color: "#fff", bgColor: "#2f855a", weight: 20, value: 5 },
      { id: "mask", label: "MSK", color: "#fff", bgColor: "#b7791f", weight: 15, value: 8 },
      { id: "sun", label: "SUN", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value: 20 },
      { id: "idol", label: "IDL", color: "#fff", bgColor: "#d69e2e", weight: 3, value: 60 },
    ],
  },
  space_adventure: {
    themeKey: "space_adventure",
    symbols: [
      { id: "star", label: "STR", color: "#fff", bgColor: "#2d3748", weight: 30, value: 2 },
      { id: "planet", label: "PLN", color: "#fff", bgColor: "#2b6cb0", weight: 25, value: 3 },
      { id: "comet", label: "CMT", color: "#fff", bgColor: "#553c9a", weight: 20, value: 5 },
      { id: "rocket", label: "RKT", color: "#fff", bgColor: "#e53e3e", weight: 15, value: 10 },
      { id: "alien", label: "ALN", color: "#fff", bgColor: "#2f855a", weight: 7, value: 20 },
      { id: "ufo", label: "UFO", color: "#1a1a1a", bgColor: "#68d391", weight: 3, value: 75 },
    ],
  },
  dragon_fire: {
    themeKey: "dragon_fire",
    symbols: [
      { id: "scale", label: "SCL", color: "#fff", bgColor: "#276749", weight: 30, value: 2 },
      { id: "gem", label: "GEM", color: "#fff", bgColor: "#2b6cb0", weight: 25, value: 4 },
      { id: "sword", label: "SWD", color: "#fff", bgColor: "#4a5568", weight: 20, value: 6 },
      { id: "crown", label: "CRN", color: "#1a1a1a", bgColor: "#f6e05e", weight: 15, value: 10 },
      { id: "fire", label: "FIR", color: "#fff", bgColor: "#c05621", weight: 7, value: 25 },
      { id: "dragon", label: "DRG", color: "#fff", bgColor: "#c53030", weight: 3, value: 80 },
    ],
  },
  ocean_treasure: {
    themeKey: "ocean_treasure",
    symbols: [
      { id: "fish", label: "FSH", color: "#fff", bgColor: "#2b6cb0", weight: 30, value: 2 },
      { id: "coral", label: "CRL", color: "#fff", bgColor: "#e53e3e", weight: 25, value: 3 },
      { id: "seahorse", label: "SEA", color: "#fff", bgColor: "#b7791f", weight: 20, value: 5 },
      { id: "pearl", label: "PRL", color: "#1a1a1a", bgColor: "#e2e8f0", weight: 15, value: 10 },
      { id: "starfish", label: "SFH", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value: 20 },
      { id: "chest", label: "CST", color: "#fff", bgColor: "#d69e2e", weight: 3, value: 70 },
    ],
  },
  pirate_bounty: {
    themeKey: "pirate_bounty",
    symbols: [
      { id: "coin", label: "CON", color: "#1a1a1a", bgColor: "#f6e05e", weight: 30, value: 2 },
      { id: "parrot", label: "PRT", color: "#fff", bgColor: "#e53e3e", weight: 25, value: 3 },
      { id: "cannon", label: "CNN", color: "#fff", bgColor: "#2d3748", weight: 20, value: 6 },
      { id: "map", label: "MAP", color: "#fff", bgColor: "#744210", weight: 15, value: 10 },
      { id: "skull", label: "SKL", color: "#fff", bgColor: "#1a1a1a", weight: 7, value: 20 },
      { id: "treasure", label: "TRS", color: "#fff", bgColor: "#d69e2e", weight: 3, value: 85 },
    ],
  },
  wild_west: {
    themeKey: "wild_west",
    symbols: [
      { id: "cactus", label: "CCT", color: "#fff", bgColor: "#276749", weight: 30, value: 2 },
      { id: "horseshoe", label: "HSH", color: "#fff", bgColor: "#4a5568", weight: 25, value: 4 },
      { id: "boot", label: "BOT", color: "#fff", bgColor: "#744210", weight: 20, value: 5 },
      { id: "revolver", label: "RVL", color: "#fff", bgColor: "#1a1a1a", weight: 15, value: 10 },
      { id: "nugget", label: "NGT", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value: 25 },
      { id: "sheriff", label: "SHF", color: "#fff", bgColor: "#c05621", weight: 3, value: 75 },
    ],
  },
  egyptian: {
    themeKey: "egyptian",
    symbols: [
      { id: "scarab", label: "SCB", color: "#fff", bgColor: "#276749", weight: 30, value: 2 },
      { id: "eye", label: "EYE", color: "#fff", bgColor: "#2b6cb0", weight: 25, value: 4 },
      { id: "cat", label: "CAT", color: "#fff", bgColor: "#1a1a1a", weight: 20, value: 6 },
      { id: "ankh", label: "ANK", color: "#fff", bgColor: "#c05621", weight: 15, value: 10 },
      { id: "pyramid", label: "PYR", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value: 22 },
      { id: "pharaoh", label: "PHR", color: "#1a1a1a", bgColor: "#d69e2e", weight: 3, value: 90 },
    ],
  },
  crystal_gems: {
    themeKey: "crystal_gems",
    symbols: [
      { id: "amethyst", label: "AMT", color: "#fff", bgColor: "#9f7aea", weight: 30, value: 2 },
      { id: "topaz", label: "TPZ", color: "#fff", bgColor: "#ed8936", weight: 25, value: 3 },
      { id: "sapphire", label: "SPH", color: "#fff", bgColor: "#3182ce", weight: 20, value: 6 },
      { id: "emerald", label: "EMR", color: "#fff", bgColor: "#2f855a", weight: 15, value: 12 },
      { id: "ruby", label: "RBY", color: "#fff", bgColor: "#c53030", weight: 7, value: 25 },
      { id: "diamond", label: "DMD", color: "#1a1a1a", bgColor: "#e2e8f0", weight: 3, value: 100 },
    ],
  },
  viking_raid: {
    themeKey: "viking_raid",
    symbols: [
      { id: "rune", label: "RNE", color: "#fff", bgColor: "#2d3748", weight: 30, value: 2 },
      { id: "axe", label: "AXE", color: "#fff", bgColor: "#4a5568", weight: 25, value: 4 },
      { id: "shield", label: "SHD", color: "#fff", bgColor: "#c53030", weight: 20, value: 6 },
      { id: "wolf", label: "WLF", color: "#fff", bgColor: "#1a1a1a", weight: 15, value: 10 },
      { id: "ship", label: "SHP", color: "#fff", bgColor: "#2b6cb0", weight: 7, value: 22 },
      { id: "odin", label: "ODN", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value: 85 },
    ],
  },
  lucky_clover: {
    themeKey: "lucky_clover",
    symbols: [
      { id: "clover", label: "CLV", color: "#fff", bgColor: "#276749", weight: 30, value: 2 },
      { id: "rainbow", label: "RBW", color: "#fff", bgColor: "#3182ce", weight: 25, value: 3 },
      { id: "horseshoe2", label: "HSH", color: "#fff", bgColor: "#b7791f", weight: 20, value: 5 },
      { id: "hat", label: "HAT", color: "#fff", bgColor: "#276749", weight: 15, value: 10 },
      { id: "pot", label: "POT", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value: 20 },
      { id: "leprechaun", label: "LEP", color: "#fff", bgColor: "#d69e2e", weight: 3, value: 80 },
    ],
  },
  neon_nights: {
    themeKey: "neon_nights",
    symbols: [
      { id: "dice", label: "DCE", color: "#fff", bgColor: "#2d3748", weight: 30, value: 2 },
      { id: "card", label: "CRD", color: "#fff", bgColor: "#553c9a", weight: 25, value: 4 },
      { id: "chip", label: "CHP", color: "#fff", bgColor: "#2b6cb0", weight: 20, value: 6 },
      { id: "cocktail", label: "CKT", color: "#fff", bgColor: "#e53e3e", weight: 15, value: 10 },
      { id: "cash", label: "CSH", color: "#fff", bgColor: "#276749", weight: 7, value: 25 },
      { id: "jackpot", label: "JPT", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value: 100 },
    ],
  },
  jungle_safari: {
    themeKey: "jungle_safari",
    symbols: [
      { id: "monkey", label: "MNK", color: "#fff", bgColor: "#744210", weight: 30, value: 2 },
      { id: "zebra", label: "ZBR", color: "#fff", bgColor: "#2d3748", weight: 25, value: 3 },
      { id: "elephant", label: "ELF", color: "#fff", bgColor: "#4a5568", weight: 20, value: 5 },
      { id: "tiger", label: "TGR", color: "#fff", bgColor: "#ed8936", weight: 15, value: 10 },
      { id: "lion", label: "LIN", color: "#fff", bgColor: "#c05621", weight: 7, value: 22 },
      { id: "gorilla", label: "GRL", color: "#fff", bgColor: "#1a1a1a", weight: 3, value: 75 },
    ],
  },
  frozen_kingdom: {
    themeKey: "frozen_kingdom",
    symbols: [
      { id: "snowflake", label: "SNW", color: "#fff", bgColor: "#3182ce", weight: 30, value: 2 },
      { id: "crystal", label: "CRY", color: "#fff", bgColor: "#63b3ed", weight: 25, value: 4 },
      { id: "wolf2", label: "WLF", color: "#fff", bgColor: "#2d3748", weight: 20, value: 6 },
      { id: "bear", label: "BER", color: "#fff", bgColor: "#4a5568", weight: 15, value: 10 },
      { id: "castle", label: "CSL", color: "#fff", bgColor: "#553c9a", weight: 7, value: 22 },
      { id: "ice_queen", label: "IQN", color: "#1a1a1a", bgColor: "#bee3f8", weight: 3, value: 88 },
    ],
  },
  money_vault: {
    themeKey: "money_vault",
    symbols: [
      { id: "coin2", label: "CON", color: "#1a1a1a", bgColor: "#f6e05e", weight: 30, value: 2 },
      { id: "safe", label: "SFE", color: "#fff", bgColor: "#4a5568", weight: 25, value: 4 },
      { id: "briefcase", label: "BCE", color: "#fff", bgColor: "#744210", weight: 20, value: 6 },
      { id: "gold_bar", label: "GLD", color: "#1a1a1a", bgColor: "#d69e2e", weight: 15, value: 12 },
      { id: "diamond2", label: "DMD", color: "#1a1a1a", bgColor: "#e2e8f0", weight: 7, value: 25 },
      { id: "vault", label: "VLT", color: "#fff", bgColor: "#c53030", weight: 3, value: 100 },
    ],
  },
  candy_land: {
    themeKey: "candy_land",
    symbols: [
      { id: "gummy", label: "GMY", color: "#fff", bgColor: "#e53e3e", weight: 30, value: 2 },
      { id: "lollipop", label: "LLP", color: "#fff", bgColor: "#ed64a6", weight: 25, value: 3 },
      { id: "chocolate", label: "CHC", color: "#fff", bgColor: "#744210", weight: 20, value: 5 },
      { id: "candy_cane", label: "CNC", color: "#fff", bgColor: "#c53030", weight: 15, value: 8 },
      { id: "ice_cream", label: "ICR", color: "#1a1a1a", bgColor: "#fbb6ce", weight: 7, value: 20 },
      { id: "cake", label: "CKE", color: "#fff", bgColor: "#9f7aea", weight: 3, value: 75 },
    ],
  },
  cyber_future: {
    themeKey: "cyber_future",
    symbols: [
      { id: "circuit", label: "CRC", color: "#fff", bgColor: "#2d3748", weight: 30, value: 2 },
      { id: "data", label: "DTA", color: "#fff", bgColor: "#3182ce", weight: 25, value: 4 },
      { id: "laser", label: "LSR", color: "#fff", bgColor: "#e53e3e", weight: 20, value: 6 },
      { id: "robot", label: "RBT", color: "#fff", bgColor: "#553c9a", weight: 15, value: 10 },
      { id: "ai", label: "A.I", color: "#fff", bgColor: "#276749", weight: 7, value: 25 },
      { id: "chip2", label: "QNT", color: "#1a1a1a", bgColor: "#9ae6b4", weight: 3, value: 90 },
    ],
  },
  ancient_rome: {
    themeKey: "ancient_rome",
    symbols: [
      { id: "laurel", label: "LRL", color: "#fff", bgColor: "#276749", weight: 30, value: 2 },
      { id: "column", label: "CLM", color: "#fff", bgColor: "#e2e8f0", weight: 25, value: 4 },
      { id: "eagle", label: "EGL", color: "#fff", bgColor: "#c05621", weight: 20, value: 6 },
      { id: "gladiator", label: "GLD", color: "#fff", bgColor: "#4a5568", weight: 15, value: 10 },
      { id: "roman_coin", label: "AUG", color: "#1a1a1a", bgColor: "#f6e05e", weight: 7, value: 22 },
      { id: "caesar", label: "CAE", color: "#fff", bgColor: "#c53030", weight: 3, value: 85 },
    ],
  },
  ninja_warriors: {
    themeKey: "ninja_warriors",
    symbols: [
      { id: "shuriken", label: "SHR", color: "#fff", bgColor: "#2d3748", weight: 30, value: 2 },
      { id: "lantern", label: "LNT", color: "#fff", bgColor: "#c53030", weight: 25, value: 3 },
      { id: "katana", label: "KTN", color: "#fff", bgColor: "#4a5568", weight: 20, value: 5 },
      { id: "mask2", label: "MSK", color: "#fff", bgColor: "#1a1a1a", weight: 15, value: 10 },
      { id: "dragon2", label: "DRG", color: "#fff", bgColor: "#c05621", weight: 7, value: 22 },
      { id: "sensei", label: "SNS", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value: 80 },
    ],
  },
  fantasy_forest: {
    themeKey: "fantasy_forest",
    symbols: [
      { id: "mushroom", label: "MSH", color: "#fff", bgColor: "#c53030", weight: 30, value: 2 },
      { id: "acorn", label: "ACR", color: "#fff", bgColor: "#744210", weight: 25, value: 3 },
      { id: "fairy", label: "FRY", color: "#fff", bgColor: "#ed64a6", weight: 20, value: 6 },
      { id: "elf", label: "ELF", color: "#fff", bgColor: "#276749", weight: 15, value: 10 },
      { id: "unicorn", label: "UNI", color: "#fff", bgColor: "#9f7aea", weight: 7, value: 25 },
      { id: "magic", label: "MGC", color: "#1a1a1a", bgColor: "#f6e05e", weight: 3, value: 90 },
    ],
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

export function spinReels(themeKey: string, reelCount = 3, rowCount = 3): string[][] {
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

export function calculateWin(reels: string[][], betAmount: number, themeKey: string): {
  winAmount: number;
  multiplier: number;
  winningLines: number[];
} {
  const symbols = getSymbolsForSlot(themeKey);
  const symbolMap = new Map(symbols.map(s => [s.id, s]));

  const rows = reels[0].length;
  const cols = reels.length;
  let totalMultiplier = 0;
  const winningLines: number[] = [];

  for (let row = 0; row < rows; row++) {
    const rowSymbols = reels.map(col => col[row]);
    const allSame = rowSymbols.every(s => s === rowSymbols[0]);
    if (allSame) {
      const sym = symbolMap.get(rowSymbols[0]);
      if (sym) {
        totalMultiplier += sym.value;
        winningLines.push(row);
      }
    }
  }

  if (cols >= 3) {
    const diagDown = reels.map((col, i) => col[Math.min(i, rows - 1)]);
    const allSameDiagDown = diagDown.every(s => s === diagDown[0]);
    if (allSameDiagDown) {
      const sym = symbolMap.get(diagDown[0]);
      if (sym) {
        totalMultiplier += sym.value;
        winningLines.push(rows);
      }
    }

    const diagUp = reels.map((col, i) => col[Math.max(rows - 1 - i, 0)]);
    const allSameDiagUp = diagUp.every(s => s === diagUp[0]);
    if (allSameDiagUp) {
      const sym = symbolMap.get(diagUp[0]);
      if (sym) {
        totalMultiplier += sym.value;
        winningLines.push(rows + 1);
      }
    }
  }

  const winAmount = totalMultiplier > 0 ? parseFloat((betAmount * totalMultiplier).toFixed(2)) : 0;
  return { winAmount, multiplier: totalMultiplier, winningLines };
}
