import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Gamepad2, Wallet, Zap, Search, Star, ArrowRight, Gift } from "lucide-react";
import { useState } from "react";

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

const THEME_COLORS: Record<string, string> = {
  classic_fruit: "from-red-900 to-orange-900",
  aztec_gold: "from-yellow-900 to-amber-900",
  space_adventure: "from-indigo-900 to-purple-900",
  dragon_fire: "from-red-900 to-rose-900",
  ocean_treasure: "from-blue-900 to-cyan-900",
  pirate_bounty: "from-amber-900 to-brown-900",
  wild_west: "from-orange-900 to-amber-900",
  egyptian: "from-yellow-900 to-orange-900",
  crystal_gems: "from-violet-900 to-purple-900",
  viking_raid: "from-slate-900 to-blue-900",
  lucky_clover: "from-green-900 to-emerald-900",
  neon_nights: "from-purple-900 to-pink-900",
  jungle_safari: "from-green-900 to-yellow-900",
  frozen_kingdom: "from-blue-900 to-indigo-900",
  money_vault: "from-green-900 to-emerald-900",
  candy_land: "from-pink-900 to-rose-900",
  cyber_future: "from-cyan-900 to-blue-900",
  ancient_rome: "from-amber-900 to-red-900",
  ninja_warriors: "from-slate-900 to-gray-900",
  fantasy_forest: "from-emerald-900 to-green-900",
};

const VOLATILITY_COLOR: Record<string, string> = {
  low: "bg-green-900 text-green-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

const VOLATILITY_LABEL: Record<string, string> = {
  low: "Lav",
  medium: "Middels",
  high: "Høy",
};

const CATEGORIES = ["Alle", "Klassisk", "Eventyr", "Fantasy", "Sci-Fi", "Historisk", "Action", "Morsom"];

export default function Home() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Alle");

  const { data: slots, isLoading } = useQuery<Slot[]>({ queryKey: ["/api/slots"] });

  const filtered = slots?.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Alle" || s.category === activeCategory;
    return matchSearch && matchCat;
  }) ?? [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold">Velkommen til NordCasino</h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Norges beste online casino med over 20 spilleautomater og store premiervinster
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-cta-register">
                  <Gift className="h-5 w-5" />
                  Få 1000 kr velkomstbonus
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-cta-login">
                  Logg inn
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {[
                { icon: Gamepad2, title: "20+ Spill", desc: "Bredt utvalg av spilleautomater" },
                { icon: Zap, title: "Lynrask utbetaling", desc: "Rask og sikker behandling" },
                { icon: Star, title: "Opp til 100x", desc: "Store multipliserte premier" },
              ].map(item => (
                <Card key={item.title}>
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="flex justify-center">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20">
          <h2 className="text-2xl font-bold mb-6">Populære spill</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            )) : slots?.slice(0, 8).map(slot => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/register">
              <Button size="lg" className="gap-2" data-testid="button-see-all">
                Se alle spill
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="rounded-lg bg-gradient-to-r from-primary/20 to-accent p-4 sm:p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Hei, {user.username}!</h1>
              <p className="text-muted-foreground">Klar for å spille? Prøv et av våre populære spill.</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-md bg-background p-3 border border-border text-center min-w-[120px]">
                <p className="text-xs text-muted-foreground">Din saldo</p>
                <p className="font-bold text-lg text-primary" data-testid="balance-display">
                  {user.balance.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
                </p>
              </div>
              <Link href="/wallet">
                <Button className="gap-2 h-full" data-testid="button-deposit-hero">
                  <Wallet className="h-4 w-4" />
                  Sett inn
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter spill..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-slots"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              data-testid={`filter-${cat.toLowerCase()}`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Ingen spill funnet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(slot => <SlotCard key={slot.id} slot={slot} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotCard({ slot }: { slot: Slot }) {
  const gradient = THEME_COLORS[slot.themeKey] ?? "from-slate-900 to-gray-900";

  return (
    <Link href={`/slots/${slot.id}`}>
      <div
        className="rounded-lg overflow-visible border border-border cursor-pointer hover-elevate group"
        data-testid={`card-slot-${slot.id}`}
      >
        <div className={`h-32 bg-gradient-to-br ${gradient} rounded-t-lg flex items-center justify-center relative`}>
          <Gamepad2 className="h-12 w-12 text-white/40" />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className={`text-xs ${VOLATILITY_COLOR[slot.volatility] ?? ""}`}>
              {VOLATILITY_LABEL[slot.volatility] ?? slot.volatility}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
              {slot.category}
            </Badge>
          </div>
        </div>
        <div className="p-3 bg-card rounded-b-lg">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">{slot.name}</h3>
            <span className="text-xs text-muted-foreground shrink-0">RTP {slot.rtp}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{slot.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{slot.minBet} - {slot.maxBet} kr</span>
            <span className="text-xs font-medium text-primary">Maks {slot.maxWin.toLocaleString()} kr</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
