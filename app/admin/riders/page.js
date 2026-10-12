"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { adminApi } from "@/lib/api";

export default function AdminRidersPage() {
  const { token } = useAuth();
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await adminApi.listRiders(token);
        setRiders(response.riders || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const filtered = riders.filter((rider) =>
    `${rider.user?.name || ""} ${rider.user?.email || ""} ${rider.availability || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell
        role="ADMIN"
        title="Fleet Roster"
        description="Monitor courier fleet duty states, active workloads, and account statuses."
      >
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
            <div>
              <CardTitle>Registered Riders ({filtered.length})</CardTitle>
              <CardDescription>Live telemetry and availability status</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by rider name"
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-12 text-center text-sm text-gray-500">
                No riders match the current search.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((rider) => {
                  const initial = rider.user?.name ? rider.user.name.charAt(0).toUpperCase() : "R";
                  return (
                    <Card key={rider.id} className="p-5 space-y-4 hover:border-gray-300 transition-all shadow-xs">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 font-bold text-base">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{rider.user?.name || "Rider"}</h4>
                          <div className="text-xs text-gray-500 truncate">{rider.user?.email}</div>
                          <div className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {rider.id.slice(0, 8)}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">On-Duty Availability:</span>
                          <StatusBadge status={rider.availability} type="availability" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Account Access:</span>
                          <StatusBadge status={rider.user?.status || "ACTIVE"} type="user" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
