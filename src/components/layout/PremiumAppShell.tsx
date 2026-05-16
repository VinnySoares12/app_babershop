import { motion } from "framer-motion";
import { Bell, CalendarDays, Home, LogOut, Scissors, User } from "lucide-react";
import type { PropsWithChildren } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUnreadNotificationsCount } from "@/hooks/use-dashboard-data";
import { appRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { signOut } from "@/services/supabase/auth";

const navItems = [
  { to: appRoutes.home, label: "Home", icon: Home },
  { to: appRoutes.booking, label: "Agenda", icon: CalendarDays },
  { to: appRoutes.plans, label: "Planos", icon: Scissors },
  { to: appRoutes.notifications, label: "Avisos", icon: Bell },
  { to: appRoutes.profile, label: "Perfil", icon: User },
];

export function PremiumAppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const unreadNotificationsQuery = useUnreadNotificationsCount();
  const unreadCount = unreadNotificationsQuery.data ?? 0;

  async function handleSignOut() {
    await signOut();
    navigate(appRoutes.login, { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {children ?? <Outlet />}
        </motion.div>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/88 px-3 pt-3 backdrop-blur-xl">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-1 rounded-2xl border border-border bg-surface/80 p-1.5 shadow-premium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === appRoutes.home}
              className={({ isActive }) =>
                cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted transition",
                  isActive && "bg-gold/12 text-gold",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.to === appRoutes.notifications && unreadCount > 0 ? (
                <span className="absolute right-2 top-1.5 min-w-5 rounded-full bg-gold px-1.5 py-0.5 text-center text-[10px] font-bold text-background">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-danger transition hover:bg-danger/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
