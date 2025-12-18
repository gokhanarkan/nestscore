import { Outlet, createRootRoute, Link, useLocation } from "@tanstack/react-router";
import { Home, List, GitCompare, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createRootRoute({
  component: RootLayout,
});

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/properties", icon: List, label: "Properties" },
  { to: "/compare", icon: GitCompare, label: "Compare" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 md:pb-0 md:pl-20">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 z-50 hidden h-full w-20 flex-col border-r border-border bg-card/80 backdrop-blur-xl md:flex">
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold text-lg">
            N
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-all hover:bg-accent",
                  isActive ? "bg-accent text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-4">
          <Link
            to="/properties/new"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      {/* Mobile FAB */}
      <Link
        to="/properties/new"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
