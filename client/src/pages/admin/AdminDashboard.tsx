import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gamepad2, DollarSign, TrendingUp, Shield, BarChart3, List, Settings } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalBets: number;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  if (!user || !isAdmin) { navigate("/"); return null; }

  const { data: stats, isLoading } = useQuery<Stats>({ queryKey: ["/api/admin/stats"] });

  const statCards = [
    { label: "Totalt brukere", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Aktive brukere", value: stats?.activeUsers ?? 0, icon: TrendingUp, color: "text-green-400" },
    { label: "Totalt innskudd", value: `${(stats?.totalDeposits ?? 0).toFixed(0)} kr`, icon: DollarSign, color: "text-yellow-400" },
    { label: "Totalt veddet", value: `${(stats?.totalBets ?? 0).toFixed(0)} kr`, icon: BarChart3, color: "text-purple-400" },
  ];

  const adminLinks = [
    { href: "/admin/users", label: "Brukeradministrasjon", icon: Users, desc: "Se, aktiver/deaktiver og juster saldo for brukere" },
    { href: "/admin/transactions", label: "Transaksjoner", icon: DollarSign, desc: "Alle innskudd, gevinster og tap" },
    { href: "/admin/games", label: "Spillhistorikk", icon: Gamepad2, desc: "Alle spinnresultater fra alle brukere" },
    { href: "/admin/slots", label: "Spilleautomater", icon: Settings, desc: "Aktiver eller deaktiver spilleautomater" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">NordCasino administrasjonsverktøy</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <card.icon className={`h-3 w-3 ${card.color}`} />
                  {card.label}
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className={`font-bold text-lg ${card.color}`} data-testid={`admin-stat-${card.label.replace(/\s+/g, "-").toLowerCase()}`}>
                    {card.value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {adminLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
