"use client";

import { useCallback, useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { riderApi } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function RiderDashboardPage() {
  const { token, user } = useAuth();
  const [rider, setRider] = useState(null);
  const [available, setAvailable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [riderResponse, availableResponse, assignmentsResponse] = await Promise.all([
        riderApi.me(token),
        riderApi.listAvailable(token).catch(() => ({ deliveries: [] })),
        riderApi.listAssignments(token),
      ]);
      setRider(riderResponse.rider);
      setAvailable(availableResponse.deliveries || []);
      setAssignments(assignmentsResponse.deliveries || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load rider dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!active) return;
      await load();
    };
    void bootstrap();
    return () => {
      active = false;
    };
  }, [load]);

  const handleAvailability = async (availability) => {
    try {
      const response = await riderApi.updateAvailability(token, availability);
      setRider(response.rider);
    } catch (submitError) {
      setError(submitError.message || "Unable to update availability.");
    }
  };

  const handleAccept = async (id) => {
    try {
      await riderApi.accept(token, id);
      await load();
    } catch (submitError) {
      setError(submitError.message || "Unable to accept this delivery.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell
        role="RIDER"
        title={`Welcome, ${user?.name || "rider"}`}
        description="Manage availability, accept jobs, and advance assigned deliveries."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleAvailability("AVAILABLE")} disabled={loading}>Available</Button>
            <Button variant="outline" onClick={() => handleAvailability("OFFLINE")} disabled={loading}>Offline</Button>
          </div>
        }
      >
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />)}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-semibold">{rider?.availability || "OFFLINE"}</div>
                    <StatusBadge status={rider?.availability || "OFFLINE"} type="availability" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Available jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{available.length}</div>
                  <div className="text-sm text-muted-foreground">Confirmed and open</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{assignments.filter((delivery) => ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(delivery.status)).length}</div>
                  <div className="text-sm text-muted-foreground">Active assignments</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Available deliveries</CardTitle>
                  <CardDescription>Open jobs that match a rider who is available.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {available.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
                      <PackageOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-3 text-base font-medium">No open jobs</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Check again after the admin confirms or assigns a delivery.</p>
                    </div>
                  ) : (
                    available.map((delivery) => (
                      <div key={delivery.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pickup</div>
                            <div className="mt-1 font-medium">{delivery.pickupAddress}</div>
                            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Destination</div>
                            <div className="mt-1 font-medium">{delivery.deliveryAddress}</div>
                            <div className="mt-4 text-sm text-muted-foreground">{formatDate(delivery.createdAt)}</div>
                          </div>
                          <Button size="sm" onClick={() => handleAccept(delivery.id)}>Accept</Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assignments</CardTitle>
                  <CardDescription>Current delivery movement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No assigned deliveries yet.</div>
                  ) : (
                    assignments.slice(0, 5).map((delivery) => (
                      <div key={delivery.id} className="rounded-2xl border border-border bg-card p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">{delivery.deliveryAddress}</div>
                          <StatusBadge status={delivery.status} />
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">{delivery.pickupAddress}</div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
