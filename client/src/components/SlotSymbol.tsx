interface SymbolData {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  weight: number;
  value3?: number;
  value4?: number;
  value5?: number;
  value?: number;
  isScatter?: boolean;
}

interface SlotSymbolProps {
  symbolId: string;
  symbols: SymbolData[];
  size?: "sm" | "md" | "lg" | "reel";
  isWinning?: boolean;
}

export function SlotSymbol({ symbolId, symbols, size = "md", isWinning = false }: SlotSymbolProps) {
  const symbol = symbols.find(s => s.id === symbolId) ?? symbols[0];
  if (!symbol) return null;

  const sizeClasses = {
    sm: "w-9 h-9 text-[10px]",
    md: "w-12 h-12 text-xs",
    lg: "w-14 h-14 text-sm",
    reel: "w-full h-[72px] text-lg",
  };

  const isScatter = symbol.isScatter || symbol.id === "scatter";

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-lg flex items-center justify-center font-extrabold
        select-none relative overflow-hidden
        ${isWinning ? "symbol-winning z-10 scale-105" : ""}
        ${isScatter ? "border-2 border-yellow-400/70" : "border border-white/15"}
      `}
      style={{ backgroundColor: symbol.bgColor, color: symbol.color }}
      data-testid={`symbol-${symbolId}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20 pointer-events-none rounded-lg" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-white/20 rounded-t-lg" />

      <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {symbol.label}
      </span>

      {isScatter && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-transparent to-yellow-500/20 pointer-events-none" />
      )}
    </div>
  );
}
