import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Zap, Trophy, RotateCcw, Wallet, TrendingUp, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { SlotSymbol } from "@/components/SlotSymbol";

interface Slot {
  id: string;
  name: string;
  description: string;
  category: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  maxWin: number;
  features: string[];
  volatility: string;
  themeKey: string;
}

interface SlotSymbolData {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  weight: number;
  value: number;
}

interface SpinResult {
  reels: string[][];
  winAmount: number;
  multiplier: number;
  winningLines: number[];
  newBalance: number;
}

const VOLATILITY_LABEL: Record<string, string> = { low: "Lav", medium: "Middels", high: "Høy" };
const VOLATILITY_COLOR: Record<string, string> = {
  low: "bg-green-900 text-green-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

const REEL_COUNT = 3;
const ROW_COUNT = 3;

export default function SlotGame() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [betAmount, setBetAmount] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [displayReels, setDisplayReels] = useState<string[][]>(
    Array(REEL_COUNT).fill(null).map(() => Array(ROW_COUNT).fill(""))
  );
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const spinInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef(false);

  if (!user) { navigate("/login"); return null; }

  const { data: slot, isLoading: slotLoading } = useQuery<Slot>({ queryKey: [`/api/slots/${id}`] });
  const { data: symbols } = useQuery<SlotSymbolData[]>({ queryKey: [`/api/slots/${id}/symbols`] });

  useEffect(() => {
    if (slot && betAmount < slot.minBet) setBetAmount(slot.minBet);
  }, [slot]);

  useEffect(() => {
    if (symbols?.length && displayReels[0][0] === "") {
      setDisplayReels(Array(REEL_COUNT).fill(null).map(() => Array(ROW_COUNT).fill(symbols[0].id)));
    }
  }, [symbols]);

  const spinMutation = useMutation({
    mutationFn: async (bet: number) => {
      const res = await apiRequest("POST", `/api/slots/${id}/spin`, { betAmount: bet });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json() as Promise<SpinResult>;
    },
    onSuccess: async (result) => {
      if (symbols && symbols.length > 0) {
        await animateReels(result.reels, symbols);
      }
      setLastResult(result);
      setWinningLines(result.winningLines);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      refreshUser();
      if (result.winAmount > 0) {
        toast({ title: `Gevinst! ${result.winAmount.toFixed(2)} kr`, description: `${result.multiplier}x multiplisator!` });
      }
      if (autoSpinRef.current) {
        setTimeout(() => {
          if (autoSpinRef.current) doSpin();
        }, 600);
      }
    },
    onError: (err: Error) => {
      setSpinning(false);
      toast({ title: "Feil", description: err.message, variant: "destructive" });
      if (autoSpinRef.current) {
        setAutoSpin(false);
        autoSpinRef.current = false;
      }
    },
  });

  const animateReels = (finalReels: string[][], syms: SlotSymbolData[]): Promise<void> => {
    return new Promise((resolve) => {
      let ticks = 0;
      const maxTicks = 15;
      spinInterval.current = setInterval(() => {
        ticks++;
        setDisplayReels(Array(REEL_COUNT).fill(null).map((_, col) => {
          if (ticks > maxTicks - (REEL_COUNT - col) * 3) return finalReels[col];
          return Array(ROW_COUNT).fill(null).map(() => syms[Math.floor(Math.random() * syms.length)].id);
        }));
        if (ticks >= maxTicks) {
          clearInterval(spinInterval.current!);
          setDisplayReels(finalReels);
          setSpinning(false);
          resolve();
        }
      }, 80);
    });
  };

  const doSpin = () => {
    if (spinning) return;
    if (user.balance < betAmount) {
      toast({ title: "Ikke nok saldo", description: "Sett inn mer penger for å spille", variant: "destructive" });
      setAutoSpin(false); autoSpinRef.current = false;
      return;
    }
    setSpinning(true);
    setWinningLines([]);
    setLastResult(null);
    spinMutation.mutate(betAmount);
  };

  const toggleAutoSpin = () => {
    const newVal = !autoSpin;
    setAutoSpin(newVal);
    autoSpinRef.current = newVal;
    if (newVal) doSpin();
  };

  if (slotLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-full max-w-2xl h-96 rounded-lg" />
      </div>
    );
  }

  if (!slot || !symbols) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Spill ikke funnet</p>
          <Link href="/"><Button>Tilbake til lobby</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-xl">{slot.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{slot.category}</Badge>
              <Badge className={`text-xs ${VOLATILITY_COLOR[slot.volatility]}`}>{VOLATILITY_LABEL[slot.volatility]} volatilitet</Badge>
              <span className="text-xs text-muted-foreground">RTP {slot.rtp}%</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className="font-bold text-primary" data-testid="slot-balance">
              {(user.balance).toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
            </p>
          </div>
        </div>

        <Card className="relative overflow-visible">
          <CardContent className="p-4">
            {lastResult && lastResult.winAmount > 0 && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center rounded-lg">
                <div className="bg-black/70 rounded-lg px-6 py-3 text-center border border-yellow-400">
                  <p className="text-yellow-300 text-xs font-medium">GEVINST</p>
                  <p className="text-yellow-400 text-2xl font-bold">+{lastResult.winAmount.toFixed(2)} kr</p>
                  <p className="text-yellow-300 text-sm">{lastResult.multiplier}x</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 p-4 rounded-md bg-black/40 border border-border/50">
              {Array(REEL_COUNT).fill(null).map((_, col) => (
                <div key={col} className={`flex flex-col gap-2 items-center transition-all duration-300 ${spinning ? "opacity-80" : ""}`}>
                  {Array(ROW_COUNT).fill(null).map((_, row) => (
                    <div key={row} className={`transition-all duration-200 ${spinning ? "blur-[1px]" : ""}`}>
                      <SlotSymbol
                        symbolId={displayReels[col]?.[row] ?? ""}
                        symbols={symbols}
                        size="lg"
                        isWinning={!spinning && winningLines.includes(row)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-center gap-1">
              {Array(ROW_COUNT).fill(null).map((_, row) => (
                <div
                  key={row}
                  className={`h-1 rounded-full flex-1 transition-all duration-300 ${winningLines.includes(row) ? "bg-yellow-400" : "bg-border"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Innsats per spinn</p>
                <p className="text-xs text-muted-foreground">{slot.minBet} - {slot.maxBet} kr</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.max(slot.minBet, betAmount - 1))} disabled={spinning || betAmount <= slot.minBet}>-</Button>
                <span className="font-bold text-primary min-w-[60px] text-center" data-testid="bet-amount">{betAmount} kr</span>
                <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.min(slot.maxBet, betAmount + 1))} disabled={spinning || betAmount >= slot.maxBet}>+</Button>
              </div>
            </div>
            <Slider
              min={slot.minBet}
              max={Math.min(slot.maxBet, 100)}
              step={1}
              value={[betAmount]}
              onValueChange={([v]) => setBetAmount(v)}
              disabled={spinning}
              data-testid="slider-bet"
            />
            <div className="grid grid-cols-3 gap-2">
              {[slot.minBet, Math.round((slot.maxBet + slot.minBet) / 2), slot.maxBet].map(amount => (
                <Button key={amount} variant="outline" size="sm" onClick={() => setBetAmount(amount)} disabled={spinning} className="text-xs">
                  {amount} kr
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={toggleAutoSpin}
            disabled={spinning && !autoSpin}
            data-testid="button-auto-spin"
          >
            <RotateCcw className={`h-4 w-4 ${autoSpin ? "text-primary animate-spin" : ""}`} />
            {autoSpin ? "Stopp" : "Auto"}
          </Button>
          <Button
            className="col-span-1 gap-2 text-base font-bold h-12"
            onClick={doSpin}
            disabled={spinning || autoSpin}
            data-testid="button-spin"
          >
            {spinning ? (
              <RotateCcw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Play className="h-5 w-5" />
                Spinn!
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setBetAmount(Math.min(slot.maxBet, betAmount * 2))}
            disabled={spinning}
            data-testid="button-max-bet"
          >
            <Zap className="h-4 w-4" />
            2x
          </Button>
        </div>

        {user.balance < slot.minBet && (
          <div className="rounded-md bg-yellow-900/30 border border-yellow-700/50 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-yellow-400 shrink-0" />
              <p className="text-sm text-yellow-300">Ikke nok saldo til å spille</p>
            </div>
            <Link href="/wallet">
              <Button size="sm" className="shrink-0">Sett inn</Button>
            </Link>
          </div>
        )}

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Symbolverdi
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {symbols.map(sym => (
                <div key={sym.id} className="text-center space-y-1">
                  <div className="flex justify-center">
                    <SlotSymbol symbolId={sym.id} symbols={symbols} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground">{sym.value}x</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {slot.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slot.features.map(f => (
              <Badge key={f} variant="outline" className="text-xs gap-1">
                <Trophy className="h-3 w-3" />
                {f}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
