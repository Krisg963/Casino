interface SymbolData {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  weight: number;
  value: number;
}

interface SlotSymbolProps {
  symbolId: string;
  symbols: SymbolData[];
  size?: "sm" | "md" | "lg";
  isWinning?: boolean;
}

export function SlotSymbol({ symbolId, symbols, size = "md", isWinning = false }: SlotSymbolProps) {
  const symbol = symbols.find(s => s.id === symbolId) ?? symbols[0];
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-md flex items-center justify-center font-bold
        transition-all duration-300 select-none
        ${isWinning ? "scale-110 ring-2 ring-yellow-400 ring-offset-1 ring-offset-background" : ""}
      `}
      style={{ backgroundColor: symbol.bgColor, color: symbol.color }}
    >
      {symbol.label}
    </div>
  );
}
