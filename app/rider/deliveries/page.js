"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  PackageCheck,
} from "lucide-react";

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
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const loadDeliveries = useCallback(async () => {
    if (!token) return;
    try {
      const response = await riderApi.listAssignments(token);
      setDeliveries(response.deliveries || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your assignments.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      if (!isMounted) return;
      await loadDeliveries();
    };
    void execute();
    return () => {
      isMounted = false;
    };
  }, [loadDeliveries]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      await riderApi.updateStatus(token, id, status);
      await loadDeliveries();
    } catch (submitError) {
      setError(submitError.message || "Unable to update this delivery.");
    } finally {
      setUpdatingId(null);
    }
  };

  const nextAction = (delivery) => {
    if (delivery.status === "ASSIGNED")
      return { label: "Confirm Pickup", status: "PICKED_UP", icon: PackageCheck, color: "bg-emerald-600 hover:bg-emerald-700" };
    if (delivery.status === "PICKED_UP")
      return { label: "Start Transit", status: "IN_TRANSIT", icon: Bike, color: "bg-orange-600 hover:bg-orange-700" };
    if (delivery.status === "IN_TRANSIT")
      return { label: "Mark Delivered", status: "DELIVERED", icon: CheckCircle2, color: "bg-emerald-700 hover:bg-emerald-800" };
    return null;
  };

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell
        role="RIDER"
        title="Assigned Deliveries"
        description="Advance package lifecycle milestones in real time as you complete pickups and drop-offs."
        actions={
          <Link href="/rider">
            <Button variant="outline" className="rounded-xl font-bold">
              Return to Dashboard
            </Button>
          </Link>
        }
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>My Active Runs ({deliveries.length})</CardTitle>
            <CardDescription>
              Execute each stage in sequential order: Picked Up &rarr; In Transit &rarr; Delivered
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : deliveries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 mx-auto mb-3">
                  <PackageCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No assigned deliveries</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  When the dispatcher assigns jobs to you or when you accept an open run, it will appear here.
                </p>
                <div className="mt-4">
                  <Link href="/rider">
                    <Button size="sm" className="rounded-xl font-bold">
                      Check Available Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => {
                  const action = nextAction(delivery);
                  const isUpdating = updatingId === delivery.id;
                  const ActionIcon = action?.icon || ArrowRight;

                  return (
                    <div
                      key={delivery.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs hover:border-gray-300 transition-all"
                    >
                      {/* Top Header: ID, Date, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            #{delivery.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-gray-400">
                            Ordered {formatDate(delivery.createdAt)}
                          </span>
                        </div>
                        <StatusBadge status={delivery.status} />
                      </div>

                      {/* Route Path Box */}
                      <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                            A
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pickup Origin</span>
                            <div className="text-sm font-bold text-gray-900">{delivery.pickupAddress}</div>
                            <div className="text-xs text-gray-500">Contact: {delivery.pickupContactName} • {delivery.pickupContactPhone}</div>
                          </div>
                        </div>

                        <div className="border-l-2 border-dashed border-gray-300 ml-3 h-2" />

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold shrink-0">
                            B
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Delivery Destination</span>
                            <div className="text-sm font-bold text-gray-900">{delivery.deliveryAddress}</div>
                            <div className="text-xs text-gray-500">Recipient: {delivery.recipientName} • {delivery.recipientPhone}</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <div className="text-xs text-gray-500">
                          Customer: <span className="font-semibold text-gray-800">{delivery.customer?.name || "Customer"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/rider/deliveries/${delivery.id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                              View Details
                            </Button>
                          </Link>

                          {action && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(delivery.id, action.status)}
                              disabled={isUpdating}
                              className={`rounded-xl font-bold text-xs gap-1.5 text-white ${action.color}`}
                            >
                              <ActionIcon className="h-4 w-4" />
                              <span>{isUpdating ? "Updating..." : action.label}</span>
                            </Button>
                          )}
                        </div>
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
