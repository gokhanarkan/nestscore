import { Outlet, createRootRoute, Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, List, GitCompare, Map, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 md:pb-0 md:pl-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
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
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 z-50 hidden h-full w-20 flex-col border-r border-border bg-card/80 backdrop-blur-xl md:flex">
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <motion.div
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            N
          </motion.div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to}>
                <motion.div
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-accent",
                    isActive ? "bg-accent text-primary" : "text-muted-foreground"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
        <div className="p-4">
          <Link to="/properties/new">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="h-5 w-5" />
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Mobile FAB */}
      <Link to="/properties/new">
        <motion.div
          className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="h-6 w-6" />
        </motion.div>
      </Link>
    </div>
  );
}
