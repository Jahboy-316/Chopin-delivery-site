"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Bike, LockKeyhole, Mail, Package, ShieldCheck, User } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";

const DEMO_ACCOUNTS = [
  { role: "Customer", email: "customer@delivery.test", pass: "Delivery123!", icon: User, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { role: "Rider", email: "rider@delivery.test", pass: "Delivery123!", icon: Bike, color: "text-orange-700 bg-orange-50 border-orange-200" },
  { role: "Admin", email: "admin@delivery.test", pass: "Delivery123!", icon: ShieldCheck, color: "text-purple-700 bg-purple-50 border-purple-200" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "customer@delivery.test", password: "Delivery123!" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      const roleRoute =
        user.role === "CUSTOMER" ? "/customer" : user.role === "RIDER" ? "/rider" : "/admin";
      router.replace(searchParams.get("next") || roleRoute);
    }
  }, [router, searchParams, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = await authApi.login({ email: form.email, password: form.password });
      login({ token: payload.token, user: payload.user });
      const next =
        searchParams.get("next") ||
        (payload.user.role === "CUSTOMER"
          ? "/customer"
          : payload.user.role === "RIDER"
            ? "/rider"
            : "/admin");
      router.replace(next);
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = (email, pass) => {
    setForm({ email, password: pass });
    setError("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Package className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-gray-900 tracking-tight block leading-tight">
                Chopin
              </span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block leading-none">
                Express Delivery
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight pt-2">
            Welcome back
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to track orders, manage runs, or administer operations
          </p>
        </div>

        {/* Demo Quick-Fill Bar for effortless testing */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Quick Demo Sign-in
          </span>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((demo) => {
              const Icon = demo.icon;
              const isSelected = form.email === demo.email;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemo(demo.email, demo.pass)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? `${demo.color} ring-2 ring-emerald-500/20`
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mb-1" />
                  <span>{demo.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Sign In Form Card */}
        <Card className="border-gray-200/90 bg-white shadow-soft">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                    className="pl-10 h-11"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Password
                </Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="pl-10 h-11"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-bold gap-2 shadow-xs"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Signing in..." : "Sign in to Chopin"}</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              New customer?{" "}
              <Link href="/register" className="font-bold text-emerald-700 hover:underline">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
          <div className="h-80 w-full max-w-md animate-pulse rounded-2xl bg-white border border-gray-200" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
