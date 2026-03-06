import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowUpCircle, Loader2, Plus, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const TX_TYPE_STYLE: Record<string, { label: string; color: string }> = {
  deposit: { label: "Innskudd", color: "bg-green-900 text-green-300" },
  win: { label: "Gevinst", color: "bg-green-900 text-green-300" },
  loss: { label: "Tap", color: "bg-red-900 text-red-300" },
  bonus: { label: "Bonus", color: "bg-purple-900 text-purple-300" },
  admin_adjust: { label: "Admin", color: "bg-blue-900 text-blue-300" },
};

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [customAmount, setCustomAmount] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/deposit", { amount });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Innskudd vellykket!", description: data.message });
    },
    onError: (err: Error) => {
      toast({ title: "Feil", description: err.message, variant: "destructive" });
    },
  });

  const handleDeposit = (amount: number) => {
    if (amount < 10) { toast({ title: "Feil", description: "Minimum innskudd er 100 kr", variant: "destructive" }); return; }
    depositMutation.mutate(amount);
  };

  const totalDeposited = transactions?.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalWon = transactions?.filter(t => t.type === "win").reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalLost = transactions?.filter(t => t.type === "loss").reduce((s, t) => s + Math.abs(t.amount), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lommebok</h1>
          <p className="text-muted-foreground">Administrer dine midler</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="sm:col-span-1">
            <CardContent className="pt-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <WalletIcon className="h-4 w-4" />
                Nåværende saldo
              </div>
              <p className="text-3xl font-bold text-primary" data-testid="wallet-balance">
                {user.balance.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Totale gevinster
              </div>
              <p className="text-2xl font-bold text-green-400" data-testid="wallet-total-won">
                +{totalWon.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingDown className="h-4 w-4 text-red-400" />
                Totale tap
              </div>
              <p className="text-2xl font-bold text-red-400" data-testid="wallet-total-lost">
                -{totalLost.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-400" />
              Sett inn penger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {QUICK_AMOUNTS.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeposit(amount)}
                  disabled={depositMutation.isPending}
                  data-testid={`button-deposit-${amount}`}
                  className="text-xs"
                >
                  {amount} kr
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kr</span>
                <input
                  type="number"
                  placeholder="Annet beløp..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  data-testid="input-custom-amount"
                  min="10"
                  max="50000"
                />
              </div>
              <Button
                onClick={() => {
                  const amount = parseFloat(customAmount);
                  if (isNaN(amount)) { toast({ title: "Feil", description: "Skriv inn et gyldig beløp", variant: "destructive" }); return; }
                  handleDeposit(amount);
                  setCustomAmount("");
                }}
                disabled={depositMutation.isPending || !customAmount}
                data-testid="button-deposit-custom"
                className="gap-2"
              >
                {depositMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Sett inn
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Minimum innskudd: 10 kr. Maksimum: 50 000 kr.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transaksjonshistorikk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : !transactions?.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Ingen transaksjoner ennå</p>
                <Link href="/slots">
                  <Button variant="outline" size="sm" className="mt-3 gap-2">Spill nå</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => {
                  const typeInfo = TX_TYPE_STYLE[tx.type] ?? { label: tx.type, color: "bg-muted text-muted-foreground" };
                  const isPositive = tx.amount >= 0;
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0" data-testid={`tx-row-${tx.id}`}>
                      <Badge className={`text-xs shrink-0 ${typeInfo.color}`}>{typeInfo.label}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString("nb-NO")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}{tx.amount.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.balanceAfter.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr</p>
                      </div>
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
