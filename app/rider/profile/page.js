"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { riderApi } from "@/lib/api";
import Link from "next/link";

export default function RiderProfilePage() {
  const { user, token } = useAuth();
  const [rider, setRider] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await riderApi.me(token);
        setRider(response.rider);
      } catch {
        setRider(null);
      }
    };

    load();
  }, [token]);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "R";

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell
        role="RIDER"
        title="Rider Profile"
        description="Review your fleet accreditation, operating state, and dispatch parameters."
        actions={
          <Link href="/rider">
            <Button className="rounded-xl font-bold">Rider Dashboard</Button>
          </Link>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Accreditation</CardTitle>
              <CardDescription>Verified Chopin Courier profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white font-extrabold text-xl shadow-xs">
                  {initial}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user?.name || rider?.user?.name || "Rider"}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">{user?.email || rider?.user?.email || "—"}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Active Rider
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 pt-2">
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Account Status</span>
                  <StatusBadge status={rider?.user?.status || user?.status || "ACTIVE"} type="user" />
                </div>
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Fleet ID</span>
                  <span className="text-xs font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border">
                    {rider?.id ? rider.id.slice(0, 12) : "RIDER-CORP"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability State */}
          <Card>
            <CardHeader>
              <CardTitle>Current Duty Status</CardTitle>
              <CardDescription>Availability state reported to the dispatch engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Status</span>
                  <StatusBadge status={rider?.availability || "OFFLINE"} type="availability" />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {rider?.availability === "AVAILABLE" ? "Online & Ready" : "Offline / On Break"}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When Available, you can accept open jobs in the pool. When you have an active run in transit, the dispatch engine prioritizes completing your route before new jobs are assigned.
                </p>
              </div>

              <Link href="/rider" className="block pt-2">
                <Button variant="outline" className="w-full rounded-xl font-bold text-xs">
                  Change Availability in Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
