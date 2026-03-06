import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DollarSign, ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

const TX_TYPE_STYLE: Record<string, { label: string; color: string }> = {
  deposit: { label: "Innskudd", color: "bg-green-900 text-green-300" },
  win: { label: "Gevinst", color: "bg-green-900 text-green-300" },
  loss: { label: "Tap", color: "bg-red-900 text-red-300" },
  bonus: { label: "Bonus", color: "bg-purple-900 text-purple-300" },
  admin_adjust: { label: "Admin", color: "bg-blue-900 text-blue-300" },
};

export default function AdminTransactions() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (!user || !isAdmin) { navigate("/"); return null; }

  const { data: transactions, isLoading } = useQuery<Transaction[]>({ queryKey: ["/api/admin/transactions"] });

  const filtered = transactions?.filter(tx => {
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || tx.type === filter;
    return matchSearch && matchFilter;
  }) ?? [];

  const totalDeposits = transactions?.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalWins = transactions?.filter(t => t.type === "win").reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalLosses = transactions?.filter(t => t.type === "loss").reduce((s, t) => s + Math.abs(t.amount), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Transaksjoner</h1>
            <p className="text-muted-foreground text-sm">{transactions?.length ?? 0} totale transaksjoner</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3 w-3 text-green-400" />Totale innskudd
              </div>
              <p className="font-bold text-green-400">{totalDeposits.toFixed(2)} kr</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3 w-3 text-blue-400" />Totale gevinster
              </div>
              <p className="font-bold text-blue-400">{totalWins.toFixed(2)} kr</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingDown className="h-3 w-3 text-red-400" />Totale tap (spillere)
              </div>
              <p className="font-bold text-red-400">{totalLosses.toFixed(2)} kr</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "deposit", "win", "loss", "bonus", "admin_adjust"].map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="text-xs">
              {f === "all" ? "Alle" : TX_TYPE_STYLE[f]?.label ?? f}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 flex-1"><DollarSign className="h-5 w-5" />Transaksjoner</CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Søk..." className="pl-7 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Ingen transaksjoner funnet</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filtered.map(tx => {
                  const typeInfo = TX_TYPE_STYLE[tx.type] ?? { label: tx.type, color: "bg-muted text-muted-foreground" };
                  const isPositive = tx.amount >= 0;
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0" data-testid={`tx-row-${tx.id}`}>
                      <Badge className={`text-xs shrink-0 ${typeInfo.color}`}>{typeInfo.label}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString("nb-NO")}</p>
                      </div>
                      <span className={`text-sm font-medium shrink-0 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {isPositive ? "+" : ""}{tx.amount.toFixed(2)} kr
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
