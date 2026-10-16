import { NavLink, Outlet } from "react-router-dom";
import { Car, Database, HandCoins, Home, Menu, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/predict", label: "Predict Price", icon: TrendingUp, end: false },
  { to: "/deal", label: "Deal Analysis", icon: HandCoins, end: false },
];

const STACK = ["Python", "FastAPI", "Scikit-Learn", "React", "Tailwind"];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(16,185,129,0.8)]">
        <Car className="size-5" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[0.95rem] font-bold tracking-tight">
              WorthMy-Car
            </span>
            <Badge variant="info" className="hidden sm:inline-flex">
              ML
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Resale price prediction
          </p>
        </div>
      )}
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring/70",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-all",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-glow min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-border bg-background/70 p-5 backdrop-blur-xl lg:flex">
        <Logo />

        <Separator className="my-5" />

        <p className="mb-2 px-3 text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Navigation
        </p>
        <NavList />

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" />
              Made With
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Database className="size-3.5" />
            <span>© 2026 WorthMy-Car</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Menu className="size-4" />
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-border px-3 py-3 animate-fade-in">
            <NavList onNavigate={() => setMobileOpen(false)} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
