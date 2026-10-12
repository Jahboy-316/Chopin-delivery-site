"use client";

import { useAuth } from "@/components/auth-provider";
import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "C";

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title="Account Profile"
        description="View your personal details, verified status, and delivery preferences."
        actions={
          <Link href="/customer/deliveries/new">
            <Button className="rounded-xl font-bold">New Delivery</Button>
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Credentials</CardTitle>
              <CardDescription>Authenticated platform account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-xl shadow-xs">
                  {initial}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user?.name || "Customer"}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">{user?.email || "—"}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Active Customer
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 pt-2">
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Account Role</span>
                  <span className="text-xs font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    {user?.role || "CUSTOMER"}
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Security & Auth</span>
                  <span className="text-xs font-bold text-emerald-700">JWT Session Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Preferences and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Operations</CardTitle>
              <CardDescription>Guidelines for smooth deliveries with Chopin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-gray-600">
              <div className="rounded-xl border border-gray-100 p-4 space-y-1 bg-gray-50/50">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Transparent Pricing
                </div>
                <p className="text-xs text-gray-500">
                  Deliveries are charged at the transparent platform rate (₦5.00) and recorded against your selected payment method (Cash, Card, or Bank Transfer).
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 space-y-1 bg-gray-50/50">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Order Modifications
                </div>
                <p className="text-xs text-gray-500">
                  Deliveries in Pending status can be cancelled prior to dispatch. Once a rider is assigned and in transit, status transitions are managed by the courier.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
