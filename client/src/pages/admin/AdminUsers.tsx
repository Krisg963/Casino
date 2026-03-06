import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowLeft, UserCheck, UserX, DollarSign, Search } from "lucide-react";
import { useState } from "react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editBalanceId, setEditBalanceId] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState("");

  if (!user || !isAdmin) { navigate("/"); return null; }

  const { data: users, isLoading } = useQuery<AdminUser[]>({ queryKey: ["/api/admin/users"] });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/active`, { isActive });
      if (!res.ok) throw new Error("Feil");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Bruker oppdatert" });
    },
    onError: () => toast({ title: "Feil", variant: "destructive" }),
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ id, balance }: { id: string; balance: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/balance`, { balance });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditBalanceId(null);
      setNewBalance("");
      toast({ title: "Saldo oppdatert" });
    },
    onError: (e: Error) => toast({ title: "Feil", description: e.message, variant: "destructive" }),
  });

  const filtered = users?.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Brukeradministrasjon</h1>
            <p className="text-muted-foreground text-sm">{users?.length ?? 0} registrerte brukere</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Søk etter bruker..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-users" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Brukere</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Ingen brukere funnet</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/50 flex-wrap" data-testid={`user-row-${u.id}`}>
                    <div className="flex-1 min-w-[140px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{u.username}</span>
                        {u.role === "admin" && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                        {!u.isActive && <Badge variant="destructive" className="text-xs">Deaktivert</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>

                    {editBalanceId === u.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={newBalance}
                          onChange={e => setNewBalance(e.target.value)}
                          className="w-24 text-sm"
                          placeholder="Ny saldo"
                          data-testid={`input-balance-${u.id}`}
                        />
                        <Button size="sm" onClick={() => updateBalanceMutation.mutate({ id: u.id, balance: parseFloat(newBalance) })} disabled={updateBalanceMutation.isPending}>
                          Lagre
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditBalanceId(null); setNewBalance(""); }}>
                          Avbryt
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-medium">{u.balance.toFixed(2)} kr</p>
                          <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("nb-NO")}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditBalanceId(u.id); setNewBalance(u.balance.toString()); }}
                          data-testid={`button-edit-balance-${u.id}`}
                        >
                          <DollarSign className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={u.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })}
                          disabled={toggleActiveMutation.isPending || u.role === "admin"}
                          data-testid={`button-toggle-user-${u.id}`}
                        >
                          {u.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
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
