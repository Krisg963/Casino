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
  size?: "sm" | "md" | "lg";
  isWinning?: boolean;
}

export function SlotSymbol({ symbolId, symbols, size = "md", isWinning = false }: SlotSymbolProps) {
  const symbol = symbols.find(s => s.id === symbolId) ?? symbols[0];
  if (!symbol) return null;

  const sizeClasses = {
    sm: "w-9 h-9 text-[10px]",
    md: "w-12 h-12 text-xs",
    lg: "w-14 h-14 text-sm",
  };

  const isScatter = symbol.isScatter || symbol.id === "scatter";

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-md flex items-center justify-center font-bold
        transition-all duration-300 select-none border
        ${isWinning ? "scale-110 ring-2 ring-yellow-400 ring-offset-1 ring-offset-background shadow-lg shadow-yellow-400/30" : "border-white/10"}
        ${isScatter ? "animate-pulse border-yellow-400/60" : ""}
      `}
      style={{ backgroundColor: symbol.bgColor, color: symbol.color }}
      data-testid={`symbol-${symbolId}`}
    >
      {symbol.label}
    </div>
  );
}
