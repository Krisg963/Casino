import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Settings, ArrowLeft, Gamepad2, Eye, EyeOff } from "lucide-react";

interface Slot {
  id: string;
  name: string;
  description: string;
  category: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  maxWin: number;
  isActive: boolean;
  volatility: string;
  features: string[];
  themeKey: string;
}

const VOLATILITY_LABEL: Record<string, string> = { low: "Lav", medium: "Middels", high: "Høy" };
const VOLATILITY_COLOR: Record<string, string> = {
  low: "bg-green-900 text-green-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

export default function AdminSlots() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user || !isAdmin) { navigate("/"); return null; }

  const { data: slots, isLoading } = useQuery<Slot[]>({ queryKey: ["/api/admin/slots"] });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/slots/${id}/active`, { isActive });
      if (!res.ok) throw new Error("Feil");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      toast({ title: "Spill oppdatert" });
    },
    onError: () => toast({ title: "Feil", variant: "destructive" }),
  });

  const activeCount = slots?.filter(s => s.isActive).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Spilleautomater</h1>
            <p className="text-muted-foreground text-sm">{activeCount} av {slots?.length ?? 0} aktive spill</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Administrer spill</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
            ) : (
              <div className="space-y-2">
                {slots?.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/50" data-testid={`slot-row-${slot.id}`}>
                    <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${slot.isActive ? "bg-primary/20" : "bg-muted"}`}>
                      <Gamepad2 className={`h-4 w-4 ${slot.isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${slot.isActive ? "" : "text-muted-foreground"}`}>{slot.name}</span>
                        <Badge variant="secondary" className="text-xs">{slot.category}</Badge>
                        <Badge className={`text-xs ${VOLATILITY_COLOR[slot.volatility]}`}>{VOLATILITY_LABEL[slot.volatility]}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">RTP: {slot.rtp}% | Min: {slot.minBet}kr | Max: {slot.maxBet}kr | Maks vinn: {slot.maxWin.toLocaleString()}kr</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {slot.isActive ? (
                        <Badge className="bg-green-900 text-green-300 text-xs gap-1">
                          <Eye className="h-3 w-3" />Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <EyeOff className="h-3 w-3" />Skjult
                        </Badge>
                      )}
                      <Switch
                        checked={slot.isActive}
                        onCheckedChange={checked => toggleMutation.mutate({ id: slot.id, isActive: checked })}
                        disabled={toggleMutation.isPending}
                        data-testid={`switch-slot-${slot.id}`}
                      />
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
