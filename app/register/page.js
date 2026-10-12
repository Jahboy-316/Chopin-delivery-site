"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Package, User } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/customer");
    }
  }, [router, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = await authApi.register({ ...form });
      login({ token: payload.token, user: payload.user });
      router.replace("/customer");
    } catch (submitError) {
      setError(submitError.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            Create Customer Account
          </h1>
          <p className="text-xs text-gray-500">
            Send parcels anytime with real-time courier tracking across town
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-900 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Fast Dispatch
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Live Tracking
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> ₦5,000 Fee
          </span>
        </div>

        {/* Main Sign Up Card */}
        <Card className="border-gray-200/90 bg-white shadow-soft">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="pl-10 h-11"
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="pl-10 h-11"
                    placeholder="jane@example.com"
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
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="pl-10 h-11"
                    placeholder="At least 8 characters"
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
                <span>{isSubmitting ? "Creating account..." : "Register & Start Sending"}</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-emerald-700 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
