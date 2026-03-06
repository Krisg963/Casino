import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Gamepad2, ArrowLeft, TrendingUp, TrendingDown, Search, Trophy } from "lucide-react";
import { useState } from "react";

interface GameSession {
  id: string;
  userId: string;
  username: string;
  slotId: string;
  slotName: string;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  multiplier: number;
  createdAt: string;
}

export default function AdminGames() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (!user || !isAdmin) { navigate("/"); return null; }

  const { data: sessions, isLoading } = useQuery<GameSession[]>({ queryKey: ["/api/admin/game-sessions"] });

  const filtered = sessions?.filter(s => {
    const matchSearch = s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.slotName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "win" ? s.isWin : !s.isWin);
    return matchSearch && matchFilter;
  }) ?? [];

  const totalBets = sessions?.reduce((s, g) => s + g.betAmount, 0) ?? 0;
  const totalWins = sessions?.reduce((s, g) => s + g.winAmount, 0) ?? 0;
  const winRate = sessions?.length ? ((sessions.filter(g => g.isWin).length / sessions.length) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Spillhistorikk</h1>
            <p className="text-muted-foreground text-sm">{sessions?.length ?? 0} totale spinn</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total innsats", value: `${totalBets.toFixed(2)} kr`, color: "text-foreground" },
            { label: "Total gevinst utbetalt", value: `${totalWins.toFixed(2)} kr`, color: "text-green-400" },
            { label: "Gevinstrate", value: `${winRate}%`, color: "text-blue-400" },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={`font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { val: "all", label: "Alle" },
            { val: "win", label: "Gevinster" },
            { val: "loss", label: "Tap" },
          ].map(f => (
            <Button key={f.val} variant={filter === f.val ? "default" : "outline"} size="sm" onClick={() => setFilter(f.val)} className="text-xs">
              {f.label}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 flex-1"><Gamepad2 className="h-5 w-5" />Spinnresultater</CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Søk bruker/spill..." className="pl-7 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Ingen spinn funnet</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filtered.map(session => (
                  <div key={session.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0" data-testid={`game-row-${session.id}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${session.isWin ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {session.isWin ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm font-medium">{session.username}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground truncate">{session.slotName}</span>
                        {session.multiplier >= 20 && <Badge className="bg-yellow-900 text-yellow-300 text-xs shrink-0">{session.multiplier}x</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleString("nb-NO")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${session.isWin ? "text-green-400" : "text-red-400"}`}>
                        {session.isWin ? `+${session.winAmount.toFixed(2)}` : `-${session.betAmount.toFixed(2)}`} kr
                      </p>
                      <p className="text-xs text-muted-foreground">Bet: {session.betAmount.toFixed(2)}</p>
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
