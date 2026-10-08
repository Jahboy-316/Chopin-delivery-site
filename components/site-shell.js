"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, CreditCard, House, LayoutDashboard, LogOut, Menu, PackageCheck, Truck, UserCircle2, Users, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLE_META = {
  CUSTOMER: {
    home: "/customer",
    brand: "Chopin",
    sidebar: [
      { label: "Overview", href: "/customer", icon: LayoutDashboard },
      { label: "Deliveries", href: "/customer/deliveries", icon: PackageCheck },
      { label: "Profile", href: "/customer/profile", icon: UserCircle2 },
    ],
  },
  RIDER: {
    home: "/rider",
    brand: "Chopin Rider",
    sidebar: [
      { label: "Overview", href: "/rider", icon: LayoutDashboard },
      { label: "Available jobs", href: "/rider", icon: Truck },
      { label: "Assignments", href: "/rider/deliveries", icon: ArrowLeftRight },
      { label: "Profile", href: "/rider/profile", icon: UserCircle2 },
    ],
  },
  ADMIN: {
    home: "/admin",
    brand: "Chopin Admin",
    sidebar: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Riders", href: "/admin/riders", icon: Truck },
      { label: "Deliveries", href: "/admin/deliveries", icon: PackageCheck },
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Link href={meta.home} className="flex items-center gap-2 text-lg font-semibold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base text-primary-foreground">
                <House className="h-4 w-4" />
              </span>
              <span>{meta.brand}</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground md:block">
              {user?.role || "USER"}
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="border-b border-border bg-card md:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{role}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
              {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions}
          </div>

          {children}
        </motion.div>
      </main>
    </div>
  );
}
