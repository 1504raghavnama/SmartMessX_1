import { ReactNode, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  Home, CreditCard, CalendarCheck, QrCode, LogOut, Menu, X,
  UtensilsCrossed, Users, BarChart3, FileText, Sparkles, Tag,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const studentNav = [
  { to: "/student", icon: Home, label: "Home" },
  { to: "/student/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/student/payments", icon: CreditCard, label: "Payments" },
  { to: "/student/checkin", icon: QrCode, label: "Check-in" },
];

const ownerNav = [
  { to: "/owner", icon: Home, label: "Home" },
  { to: "/owner/attendance", icon: ClipboardCheck, label: "Attendance" },
  { to: "/owner/predictions", icon: BarChart3, label: "Predictions" },
  { to: "/owner/students", icon: Users, label: "Students" },
  { to: "/owner/reports", icon: FileText, label: "Reports" },
  { to: "/owner/festival", icon: Sparkles, label: "Festival Mode" },
  { to: "/owner/offers", icon: Tag, label: "Offers" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navItems = user?.role === "owner" ? ownerNav : studentNav;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground text-sm">SmartMessX</h2>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/student" || item.to === "/owner"}
            onClick={() => setSidebarOpen(false)}
            className={() => {
              const isActive =
                item.to === "/student" || item.to === "/owner"
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
              return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`;
            }}
          >
            <item.icon className="w-4.5 h-4.5" />
            <span>{item.label}</span>
          </RouterNavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {user?.name?.[0]}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
