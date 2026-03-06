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
import { ArrowLeft, Play, Zap, Trophy, RotateCcw, Wallet, Info, Star } from "lucide-react";
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
  value3: number;
  value4: number;
  value5: number;
  isScatter?: boolean;
}

interface SpinResult {
  reels: string[][];
  winAmount: number;
  multiplier: number;
  winningLines: number[];
  newBalance: number;
  freeSpinsWon: number;
  freeSpinsRemaining: number;
  scatterCount: number;
  isFreeSpin: boolean;
}

const VOLATILITY_LABEL: Record<string, string> = { low: "Lav", medium: "Middels", high: "Høy" };
const VOLATILITY_COLOR: Record<string, string> = {
  low: "bg-green-900 text-green-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

const REEL_COUNT = 5;
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
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinBet, setFreeSpinBet] = useState(0);
  const [showFreeSpinBanner, setShowFreeSpinBanner] = useState(false);
  const spinInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const { data: slot, isLoading: slotLoading } = useQuery<Slot>({ queryKey: ["/api/slots", id] });
  const { data: symbols } = useQuery<SlotSymbolData[]>({ queryKey: ["/api/slots", id, "symbols"] });

  const { data: fsData } = useQuery<{ freeSpins: number; betAmount: number }>({
    queryKey: ["/api/slots", id, "freespins"],
  });

  useEffect(() => {
    if (fsData) {
      setFreeSpins(fsData.freeSpins);
      setFreeSpinBet(fsData.betAmount);
    }
  }, [fsData]);

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
      setFreeSpins(result.freeSpinsRemaining);
      if (result.freeSpinsWon > 0) {
        setFreeSpinBet(freeSpins > 0 ? freeSpinBet : betAmount);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slots", id, "freespins"] });
      refreshUser();

      if (result.freeSpinsWon > 0) {
        setShowFreeSpinBanner(true);
        toast({
          title: `🎰 ${result.freeSpinsWon} Gratis Spinn!`,
          description: `${result.scatterCount} scatter-symboler! Du har nå ${result.freeSpinsRemaining} gratis spinn.`,
        });
        setTimeout(() => setShowFreeSpinBanner(false), 3000);
      }

      if (result.winAmount > 0) {
        toast({ title: `Gevinst! ${result.winAmount.toFixed(2)} kr`, description: `${result.multiplier}x multiplisator!` });
      }

      if (autoSpinRef.current) {
        setTimeout(() => {
          if (autoSpinRef.current) doSpin();
        }, 800);
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
      const maxTicks = 20;
      spinInterval.current = setInterval(() => {
        ticks++;
        setDisplayReels(Array(REEL_COUNT).fill(null).map((_, col) => {
          const stopAt = maxTicks - (REEL_COUNT - col) * 2;
          if (ticks > stopAt) return finalReels[col];
          return Array(ROW_COUNT).fill(null).map(() => syms[Math.floor(Math.random() * syms.length)].id);
        }));
        if (ticks >= maxTicks) {
          clearInterval(spinInterval.current!);
          setDisplayReels(finalReels);
          setSpinning(false);
          resolve();
        }
      }, 70);
    });
  };

  const doSpin = () => {
    if (spinning) return;
    const isFs = freeSpins > 0;
    const currentBet = isFs ? freeSpinBet : betAmount;

    if (!isFs && user.balance < betAmount) {
      toast({ title: "Ikke nok saldo", description: "Sett inn mer penger for å spille", variant: "destructive" });
      setAutoSpin(false); autoSpinRef.current = false;
      return;
    }
    setSpinning(true);
    setWinningLines([]);
    setLastResult(null);
    setShowFreeSpinBanner(false);
    spinMutation.mutate(currentBet);
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
        <Skeleton className="w-full max-w-4xl h-96 rounded-lg" />
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
      <div className="mx-auto max-w-4xl px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-xl" data-testid="text-slot-name">{slot.name}</h1>
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

        {freeSpins > 0 && (
          <div className="bg-gradient-to-r from-yellow-900/60 to-amber-900/60 border border-yellow-500/50 rounded-lg px-4 py-3 flex items-center justify-between" data-testid="freespin-banner">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
              <div>
                <p className="text-yellow-300 font-bold text-sm">Gratis Spinn</p>
                <p className="text-yellow-400/80 text-xs">Innsats: {freeSpinBet} kr per spinn</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-300 text-2xl font-bold" data-testid="text-freespins-count">{freeSpins}</p>
              <p className="text-yellow-400/60 text-xs">igjen</p>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="bg-gradient-to-b from-amber-950/40 via-black/60 to-amber-950/40 border-2 border-amber-700/40 rounded-xl p-1 shadow-2xl shadow-amber-900/20">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

              <div className="relative flex gap-1 justify-center" data-testid="slot-reels">
                {Array(REEL_COUNT).fill(null).map((_, col) => {
                  const reelStopped = !spinning || (lastResult && displayReels[col] === lastResult.reels[col]);
                  return (
                    <div
                      key={col}
                      className={`flex flex-col gap-1 items-center p-1 rounded-md transition-all duration-200
                        ${!reelStopped ? "bg-white/5" : "bg-transparent"}
                        ${col < REEL_COUNT - 1 ? "border-r border-white/5" : ""}
                      `}
                    >
                      {Array(ROW_COUNT).fill(null).map((_, row) => (
                        <div
                          key={row}
                          className={`transition-all duration-200 ${!reelStopped ? "blur-[2px] translate-y-[2px]" : ""}`}
                        >
                          <SlotSymbol
                            symbolId={displayReels[col]?.[row] ?? ""}
                            symbols={symbols}
                            size="lg"
                            isWinning={!spinning && isSymbolOnWinningLine(col, row, winningLines)}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-center gap-1">
                {Array(9).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-all duration-300 ${winningLines.includes(i) ? "bg-yellow-400 shadow-sm shadow-yellow-400" : "bg-white/10"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {showFreeSpinBanner && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center rounded-xl">
              <div className="bg-black/80 rounded-xl px-8 py-5 text-center border-2 border-yellow-400 animate-bounce shadow-2xl shadow-yellow-400/30">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2 animate-spin" />
                <p className="text-yellow-300 text-xs font-medium uppercase tracking-wider">Gratis Spinn Vunnet!</p>
                <p className="text-yellow-400 text-3xl font-bold">{lastResult?.freeSpinsWon} SPINN</p>
              </div>
            </div>
          )}

          {lastResult && lastResult.winAmount > 0 && !showFreeSpinBanner && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center rounded-xl">
              <div className="bg-black/75 rounded-xl px-6 py-4 text-center border border-yellow-400/80 shadow-xl shadow-yellow-400/20">
                <p className="text-yellow-300 text-xs font-medium uppercase tracking-wider">Gevinst</p>
                <p className="text-yellow-400 text-3xl font-bold">+{lastResult.winAmount.toFixed(2)} kr</p>
                <p className="text-yellow-300/80 text-sm">{lastResult.multiplier}x</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Innsats per spinn</p>
                  <p className="text-xs text-muted-foreground">{slot.minBet} - {slot.maxBet} kr</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.max(slot.minBet, betAmount - 1))} disabled={spinning || betAmount <= slot.minBet || freeSpins > 0} data-testid="button-bet-decrease">-</Button>
                  <span className="font-bold text-primary min-w-[60px] text-center" data-testid="bet-amount">{freeSpins > 0 ? freeSpinBet : betAmount} kr</span>
                  <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.min(slot.maxBet, betAmount + 1))} disabled={spinning || betAmount >= slot.maxBet || freeSpins > 0} data-testid="button-bet-increase">+</Button>
                </div>
              </div>
              <Slider
                min={slot.minBet}
                max={Math.min(slot.maxBet, 100)}
                step={1}
                value={[freeSpins > 0 ? freeSpinBet : betAmount]}
                onValueChange={([v]) => setBetAmount(v)}
                disabled={spinning || freeSpins > 0}
                data-testid="slider-bet"
              />
              <div className="grid grid-cols-5 gap-1">
                {[slot.minBet, 5, 10, 25, slot.maxBet].map(amount => (
                  <Button key={amount} variant="outline" size="sm" onClick={() => setBetAmount(amount)} disabled={spinning || freeSpins > 0} className="text-xs">
                    {amount} kr
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex md:flex-col gap-2 justify-center">
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
              className="gap-2 text-base font-bold h-14 px-8 min-w-[140px]"
              onClick={doSpin}
              disabled={spinning || autoSpin}
              data-testid="button-spin"
            >
              {spinning ? (
                <RotateCcw className="h-5 w-5 animate-spin" />
              ) : freeSpins > 0 ? (
                <>
                  <Star className="h-5 w-5" />
                  Gratis Spinn!
                </>
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
              disabled={spinning || freeSpins > 0}
              data-testid="button-max-bet"
            >
              <Zap className="h-4 w-4" />
              2x
            </Button>
          </div>
        </div>

        {user.balance < slot.minBet && freeSpins === 0 && (
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
              Symbolverdi (3x / 4x / 5x match)
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {symbols.map(sym => (
                <div key={sym.id} className="text-center space-y-1" data-testid={`paytable-${sym.id}`}>
                  <div className="flex justify-center">
                    <SlotSymbol symbolId={sym.id} symbols={symbols} size="sm" />
                  </div>
                  {sym.isScatter ? (
                    <p className="text-[10px] text-yellow-400 font-medium">3+=Gratis</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">{sym.value3}/{sym.value4}/{sym.value5}x</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Gratis Spinn
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-yellow-900/20 rounded-md p-2 border border-yellow-700/30">
                <p className="text-yellow-400 font-bold text-lg">3</p>
                <p className="text-muted-foreground">scatter = 5 spinn</p>
              </div>
              <div className="bg-yellow-900/20 rounded-md p-2 border border-yellow-700/30">
                <p className="text-yellow-400 font-bold text-lg">4</p>
                <p className="text-muted-foreground">scatter = 10 spinn</p>
              </div>
              <div className="bg-yellow-900/20 rounded-md p-2 border border-yellow-700/30">
                <p className="text-yellow-400 font-bold text-lg">5+</p>
                <p className="text-muted-foreground">scatter = 15 spinn</p>
              </div>
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

function isSymbolOnWinningLine(col: number, row: number, winningLines: number[]): boolean {
  const PAYLINES = [
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

  for (const lineIdx of winningLines) {
    if (lineIdx < PAYLINES.length && PAYLINES[lineIdx][col] === row) {
      return true;
    }
  }
  return false;
}
