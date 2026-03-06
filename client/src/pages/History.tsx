import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, TrendingUp, TrendingDown, Trophy, Target, Link } from "lucide-react";
import { Link as WouterLink, useLocation } from "wouter";

interface GameSession {
  id: string;
  slotId: string;
  slotName: string;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  multiplier: number;
  createdAt: string;
  reels: string[][];
}

export default function History() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) { navigate("/login"); return null; }

  const { data: sessions, isLoading } = useQuery<GameSession[]>({ queryKey: ["/api/history"] });

  const totalBet = sessions?.reduce((s, g) => s + g.betAmount, 0) ?? 0;
  const totalWon = sessions?.reduce((s, g) => s + g.winAmount, 0) ?? 0;
  const winCount = sessions?.filter(g => g.isWin).length ?? 0;
  const winRate = sessions?.length ? ((winCount / sessions.length) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Spillhistorikk</h1>
          <p className="text-muted-foreground">Se alle dine tidligere spinn</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Totalt spinn", value: sessions?.length ?? 0, icon: Target, color: "text-foreground" },
            { label: "Vunnet", value: `${winCount} (${winRate}%)`, icon: Trophy, color: "text-yellow-400" },
            { label: "Total innsats", value: `${totalBet.toFixed(2)} kr`, icon: TrendingDown, color: "text-red-400" },
            { label: "Total gevinst", value: `${totalWon.toFixed(2)} kr`, icon: TrendingUp, color: "text-green-400" },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <item.icon className={`h-3 w-3 ${item.color}`} />
                  {item.label}
                </div>
                <p className={`font-bold text-sm ${item.color}`} data-testid={`stat-${item.label.replace(/\s+/g, "-").toLowerCase()}`}>
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Spinnhistorikk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
            ) : !sessions?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="mb-3">Ingen spill ennå</p>
                <WouterLink href="/slots">
                  <Button className="gap-2">Spill ditt første spill</Button>
                </WouterLink>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-md bg-card border border-card-border" data-testid={`session-row-${session.id}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${session.isWin ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {session.isWin ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{session.slotName}</p>
                        {session.isWin && session.multiplier >= 20 && (
                          <Badge className="bg-yellow-900 text-yellow-300 text-xs shrink-0">{session.multiplier}x</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleString("nb-NO")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${session.isWin ? "text-green-400" : "text-red-400"}`}>
                        {session.isWin ? `+${session.winAmount.toFixed(2)}` : `-${session.betAmount.toFixed(2)}`} kr
                      </p>
                      <p className="text-xs text-muted-foreground">Innsats: {session.betAmount.toFixed(2)} kr</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
