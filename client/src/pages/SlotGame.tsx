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
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
const SYMBOL_HEIGHT = 72;
const VISIBLE_HEIGHT = SYMBOL_HEIGHT * ROW_COUNT;
const SPIN_SYMBOLS = 20;
const REEL_STOP_DELAY = 350;

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
  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef(false);

  const [reelOffsets, setReelOffsets] = useState<number[]>(Array(REEL_COUNT).fill(0));
  const [reelStrips, setReelStrips] = useState<string[][]>(Array(REEL_COUNT).fill([]));
  const [reelStates, setReelStates] = useState<("idle" | "spinning" | "stopping" | "stopped")[]>(
    Array(REEL_COUNT).fill("idle")
  );
  const [flashingReels, setFlashingReels] = useState<boolean[]>(Array(REEL_COUNT).fill(false));
  const animFrameRef = useRef<number | null>(null);
  const spinStartTimeRef = useRef<number>(0);

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
      const initial = Array(REEL_COUNT).fill(null).map(() =>
        Array(ROW_COUNT).fill(null).map(() => symbols[0].id)
      );
      setDisplayReels(initial);
    }
  }, [symbols]);

  const randomSymbolId = useCallback((syms: SlotSymbolData[]) => {
    return syms[Math.floor(Math.random() * syms.length)].id;
  }, []);

  const buildReelStrip = useCallback((finalSymbols: string[], syms: SlotSymbolData[]): string[] => {
    const strip: string[] = [];
    for (let i = 0; i < SPIN_SYMBOLS; i++) {
      strip.push(randomSymbolId(syms));
    }
    strip.push(...finalSymbols);
    return strip;
  }, [randomSymbolId]);

  const animateReels = useCallback((finalReels: string[][], syms: SlotSymbolData[]): Promise<void> => {
    return new Promise((resolve) => {
      const strips = finalReels.map(col => buildReelStrip(col, syms));
      setReelStrips(strips);
      setReelStates(Array(REEL_COUNT).fill("spinning"));
      setReelOffsets(Array(REEL_COUNT).fill(0));
      setFlashingReels(Array(REEL_COUNT).fill(false));

      spinStartTimeRef.current = performance.now();
      const totalStripHeight = (SPIN_SYMBOLS + ROW_COUNT) * SYMBOL_HEIGHT;
      const targetOffset = totalStripHeight - VISIBLE_HEIGHT;

      const baseDuration = 1200;
      const reelDurations = Array(REEL_COUNT).fill(null).map((_, i) => baseDuration + i * REEL_STOP_DELAY);

      let resolved = false;

      const animate = (now: number) => {
        const elapsed = now - spinStartTimeRef.current;
        const newOffsets: number[] = [];
        const newStates: ("idle" | "spinning" | "stopping" | "stopped")[] = [];
        let allDone = true;

        for (let i = 0; i < REEL_COUNT; i++) {
          const duration = reelDurations[i];
          if (elapsed >= duration) {
            newOffsets.push(targetOffset);
            newStates.push("stopped");

            setFlashingReels(prev => {
              const next = [...prev];
              if (!next[i]) {
                next[i] = true;
                setTimeout(() => {
                  setFlashingReels(p => {
                    const n = [...p];
                    n[i] = false;
                    return n;
                  });
                }, 400);
              }
              return next;
            });
          } else {
            allDone = false;
            const progress = elapsed / duration;
            const eased = progress < 0.7
              ? progress / 0.7
              : 1 - Math.pow(1 - (progress - 0.7) / 0.3, 3) * 0.05 + 0.95 + Math.sin((progress - 0.7) / 0.3 * Math.PI * 2) * 0.02 * (1 - progress);

            const offset = eased * targetOffset;
            newOffsets.push(offset);
            newStates.push(progress < 0.7 ? "spinning" : "stopping");
          }
        }

        setReelOffsets(newOffsets);
        setReelStates(newStates);

        if (allDone) {
          setDisplayReels(finalReels);
          setSpinning(false);
          if (!resolved) {
            resolved = true;
            setTimeout(resolve, 100);
          }
        } else {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    });
  }, [buildReelStrip]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

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
      setReelStates(Array(REEL_COUNT).fill("idle"));
      toast({ title: "Feil", description: err.message, variant: "destructive" });
      if (autoSpinRef.current) {
        setAutoSpin(false);
        autoSpinRef.current = false;
      }
    },
  });

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

  const isSpinning = reelStates.some(s => s === "spinning" || s === "stopping");
  const allStopped = reelStates.every(s => s === "stopped" || s === "idle");

  const ledCount = 24;
  const leds = Array(ledCount).fill(null);

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
          <div className="machine-frame rounded-2xl p-3 relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20">
              <div className="absolute top-0 left-0 right-0 flex justify-around px-6 pt-1">
                {leds.slice(0, ledCount / 2).map((_, i) => (
                  <div
                    key={`top-${i}`}
                    className="w-2 h-2 rounded-full led-dot"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#f59e0b" : "#ef4444",
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-around px-6 pb-1">
                {leds.slice(ledCount / 2).map((_, i) => (
                  <div
                    key={`bot-${i}`}
                    className="w-2 h-2 rounded-full led-dot"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#ef4444" : "#f59e0b",
                      animationDelay: `${(i + ledCount / 2) * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-2 relative z-10">
              <span className="text-amber-400/80 text-xs font-bold tracking-[0.3em] uppercase">
                {slot.name}
              </span>
            </div>

            <div className="bg-black rounded-xl p-2 relative overflow-hidden border border-amber-900/50" data-testid="slot-reels">
              <div className="absolute inset-0 reel-window z-10 pointer-events-none rounded-xl" />

              <div className="flex gap-[3px] justify-center relative">
                {Array(REEL_COUNT).fill(null).map((_, col) => {
                  const state = reelStates[col];
                  const isThisReelSpinning = state === "spinning" || state === "stopping";
                  const justStopped = flashingReels[col];

                  return (
                    <div
                      key={col}
                      className={`relative overflow-hidden rounded-lg ${justStopped ? "reel-flash" : ""}`}
                      style={{
                        height: `${VISIBLE_HEIGHT}px`,
                        width: "calc((100% - 12px) / 5)",
                        backgroundColor: "#111",
                      }}
                    >
                      {col > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-amber-700/30 z-20" />
                      )}

                      {isThisReelSpinning && reelStrips[col]?.length > 0 ? (
                        <div
                          className="absolute left-0 right-0"
                          style={{
                            transform: `translateY(-${reelOffsets[col]}px)`,
                            willChange: "transform",
                          }}
                        >
                          {reelStrips[col].map((symId, idx) => (
                            <div key={idx} style={{ height: `${SYMBOL_HEIGHT}px` }} className="p-[2px]">
                              <SlotSymbol symbolId={symId} symbols={symbols} size="reel" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={state === "stopped" ? "reel-stopped" : ""}
                        >
                          <div className="reel-strip">
                            {Array(ROW_COUNT).fill(null).map((_, row) => (
                              <div key={row} style={{ height: `${SYMBOL_HEIGHT}px` }} className="p-[2px]">
                                <SlotSymbol
                                  symbolId={displayReels[col]?.[row] ?? ""}
                                  symbols={symbols}
                                  size="reel"
                                  isWinning={allStopped && !spinning && isSymbolOnWinningLine(col, row, winningLines)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${SYMBOL_HEIGHT - 1}px` }}>
                <div className="reel-separator h-[1px]" />
              </div>
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${SYMBOL_HEIGHT * 2 - 1}px` }}>
                <div className="reel-separator h-[1px]" />
              </div>

              <div className="mt-2 flex justify-center gap-1">
                {Array(9).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${winningLines.includes(i)
                      ? "bg-yellow-400 shadow-md shadow-yellow-400/50"
                      : "bg-white/8"}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 relative z-10">
              <button
                onClick={toggleAutoSpin}
                disabled={spinning && !autoSpin}
                className="px-4 py-2 rounded-lg text-sm font-bold border border-amber-700/50 bg-black/50 text-amber-400 hover:bg-amber-900/30 disabled:opacity-40 transition-all"
                data-testid="button-auto-spin"
              >
                <RotateCcw className={`h-4 w-4 inline mr-1 ${autoSpin ? "animate-spin text-yellow-400" : ""}`} />
                {autoSpin ? "Stopp" : "Auto"}
              </button>

              <button
                onClick={doSpin}
                disabled={spinning || autoSpin}
                className="spin-button-3d px-10 py-4 rounded-2xl text-lg font-extrabold text-black tracking-wide disabled:cursor-not-allowed"
                data-testid="button-spin"
              >
                {spinning ? (
                  <RotateCcw className="h-6 w-6 animate-spin inline" />
                ) : freeSpins > 0 ? (
                  <span className="flex items-center gap-2">
                    <Star className="h-6 w-6" />
                    GRATIS!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-6 w-6" />
                    SPINN
                  </span>
                )}
              </button>

              <button
                onClick={() => setBetAmount(Math.min(slot.maxBet, betAmount * 2))}
                disabled={spinning || freeSpins > 0}
                className="px-4 py-2 rounded-lg text-sm font-bold border border-amber-700/50 bg-black/50 text-amber-400 hover:bg-amber-900/30 disabled:opacity-40 transition-all"
                data-testid="button-max-bet"
              >
                <Zap className="h-4 w-4 inline mr-1" />
                2x
              </button>
            </div>
          </div>

          {showFreeSpinBanner && (
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center rounded-2xl">
              <div className="bg-black/90 rounded-xl px-8 py-6 text-center border-2 border-yellow-400 shadow-2xl shadow-yellow-400/30">
                <Star className="h-10 w-10 text-yellow-400 mx-auto mb-2 animate-spin" />
                <p className="text-yellow-300 text-sm font-bold uppercase tracking-widest">Gratis Spinn!</p>
                <p className="text-yellow-400 text-4xl font-extrabold">{lastResult?.freeSpinsWon}</p>
                <p className="text-yellow-300/60 text-xs mt-1">spinn vunnet</p>
              </div>
            </div>
          )}

          {lastResult && lastResult.winAmount > 0 && !showFreeSpinBanner && allStopped && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center rounded-2xl">
              <div className="bg-black/85 rounded-xl px-8 py-5 text-center border border-yellow-400/80 shadow-xl shadow-yellow-400/20">
                <p className="text-yellow-300 text-xs font-bold uppercase tracking-widest">Gevinst!</p>
                <p className="text-yellow-400 text-4xl font-extrabold">+{lastResult.winAmount.toFixed(2)} kr</p>
                <p className="text-yellow-300/60 text-sm">{lastResult.multiplier}x multiplisator</p>
              </div>
            </div>
          )}
        </div>

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
