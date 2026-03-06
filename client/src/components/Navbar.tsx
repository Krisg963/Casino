import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home, Gamepad2, Wallet, History, Shield, LogOut, LogIn, UserPlus, TrendingUp, Menu
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [loc] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    toast({ title: "Logget ut", description: "Ha en fin dag!" });
  };

  const navItems = user ? [
    { href: "/", label: "Hjem", icon: Home },
    { href: "/slots", label: "Spill", icon: Gamepad2 },
    { href: "/wallet", label: "Lommebok", icon: Wallet },
    { href: "/history", label: "Historikk", icon: History },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ] : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">NordCasino</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={loc === item.href ? "secondary" : "ghost"}
                  size="sm"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium" data-testid="text-username">{user.username}</span>
                  <span className="text-xs text-muted-foreground" data-testid="text-balance">
                    {user.balance.toLocaleString("nb-NO", { minimumFractionDigits: 2 })} kr
                  </span>
                </div>
                {isAdmin && <Badge variant="secondary" className="hidden sm:flex">Admin</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="link-login" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Logg inn</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" data-testid="link-register" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrer</span>
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {mobileOpen && user && (
          <div className="md:hidden border-t border-border py-2 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={loc === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
