"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, PackageCheck } from "lucide-react";

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

export default function RiderAssignmentsPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await riderApi.listAssignments(token);
        setDeliveries(response.deliveries || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your assignments.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await riderApi.updateStatus(token, id, status);
      const response = await riderApi.listAssignments(token);
      setDeliveries(response.deliveries || []);
    } catch (submitError) {
      setError(submitError.message || "Unable to update this delivery.");
    }
  };

  const nextAction = (delivery) => {
    if (delivery.status === "ASSIGNED") return { label: "Mark picked up", status: "PICKED_UP" };
    if (delivery.status === "PICKED_UP") return { label: "Mark in transit", status: "IN_TRANSIT" };
    if (delivery.status === "IN_TRANSIT") return { label: "Mark delivered", status: "DELIVERED" };
    return null;
  };

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell role="RIDER" title="Assigned deliveries" description="Advance valid delivery statuses in the backend-defined order.">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>My active deliveries</CardTitle>
            <CardDescription>Only assigned riders can advance the live lifecycle.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl border border-border bg-muted/60" />)}</div>
            ) : deliveries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
                <PackageCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-base font-medium">No assigned deliveries</h3>
                <p className="mt-1 text-sm text-muted-foreground">When a job is assigned to you, it appears here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => {
                  const action = nextAction(delivery);
                  return (
                    <div key={delivery.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="h-4 w-4" /> {formatDate(delivery.createdAt)}</div>
                          <div className="mt-2 text-lg font-medium">{delivery.deliveryAddress}</div>
                          <div className="mt-1 text-sm text-muted-foreground">Pickup: {delivery.pickupAddress}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={delivery.status} />
                          {action && (
                            <Button size="sm" onClick={() => updateStatus(delivery.id, action.status)} className="gap-2">
                              {action.label}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm text-muted-foreground">
                        <span>Customer: {delivery.customer?.name || "—"}</span>
                        <Link href={`/rider/deliveries/${delivery.id}`} className="font-medium text-primary">Open details</Link>
                      </div>
                    </div>
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
