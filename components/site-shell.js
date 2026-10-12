"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  Truck,
  UserCircle2,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLE_META = {
  CUSTOMER: {
    home: "/customer",
    brand: "Chopin",
    roleName: "Customer Portal",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sidebar: [
      { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
      { label: "My Deliveries", href: "/customer/deliveries", icon: PackageCheck },
      { label: "Profile", href: "/customer/profile", icon: UserCircle2 },
    ],
  },
  RIDER: {
    home: "/rider",
    brand: "Chopin Rider",
    roleName: "Rider Fleet",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    sidebar: [
      { label: "Overview", href: "/rider", icon: LayoutDashboard },
      { label: "Active Jobs", href: "/rider/deliveries", icon: ArrowLeftRight },
      { label: "Profile", href: "/rider/profile", icon: UserCircle2 },
    ],
  },
  ADMIN: {
    home: "/admin",
    brand: "Chopin Admin",
    roleName: "Ops & Admin",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    sidebar: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Deliveries", href: "/admin/deliveries", icon: PackageCheck },
      { label: "Riders", href: "/admin/riders", icon: Truck },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
};

export function DashboardShell({ title, description, actions, children, role, customNav = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const meta = ROLE_META[role] || ROLE_META.CUSTOMER;
  const navItems = customNav.length ? customNav : meta.sidebar;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            <Link href={meta.home} className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-gray-900 leading-tight">
                  Chopin
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 leading-none">
                  {meta.roleName}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== meta.home && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150",
                    active
                      ? "bg-emerald-50 text-emerald-800 shadow-xs"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-emerald-700" : "text-gray-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50/80 px-2.5 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                  {userInitial}
                </div>
                <div className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                  {user.name || user.email}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs font-medium text-gray-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200 bg-white md:hidden overflow-hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1.5 px-4 py-3">
              {user && (
                <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {userInitial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== meta.home && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-emerald-700" : "text-gray-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl flex-1 w-full px-4 py-6 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
          {/* Page Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight mb-2 bg-white text-gray-600 border-gray-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span>{meta.roleName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
              {description && <p className="mt-1 text-sm text-gray-500 max-w-2xl">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
          </div>

          {children}
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-4 text-center text-xs text-gray-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Chopin Delivery. All rights reserved.</span>
          <span className="text-gray-400">Reliable local courier & logistics network</span>
        </div>
      </footer>
    </div>
  );
}
