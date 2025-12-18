import { Outlet, createRootRoute, Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, List, GitCompare, Map, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function NestScoreIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M16 6L6 14V25C6 25.55 6.45 26 7 26H13V19H19V26H25C25.55 26 26 25.55 26 25V14L16 6Z"
        fill="currentColor"
        className="text-primary-foreground"
      />
    </svg>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/properties", icon: List, label: "Properties" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/compare", icon: GitCompare, label: "Compare" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex w-full items-center justify-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <NestScoreIcon className="h-7 w-7" />
            <span className="font-semibold">NestScore</span>
          </Link>
        </div>
      </header>

      {/* Desktop top header */}
      <header className="fixed left-0 right-0 top-0 z-50 hidden h-14 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl md:flex">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <NestScoreIcon className="h-8 w-8" />
            <span className="font-semibold">NestScore</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link key={item.to} to={item.to}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                    whileTap={{ scale: 0.97 }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="pb-20 pt-12 md:pb-0 md:pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav - cleaner iOS-style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon
                  className={cn("h-6 w-6", isActive && "stroke-[2.5px]")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
