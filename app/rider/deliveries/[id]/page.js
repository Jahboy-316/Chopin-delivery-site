"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bike,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getDeliveryTimeline } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { deliveryApi, riderApi } from "@/lib/api";

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  ASSIGNED: UserCheck,
  PICKED_UP: PackageCheck,
  IN_TRANSIT: Bike,
  DELIVERED: Check,
  CANCELLED: XCircle,
};

function RiderDeliveryDetailInner() {
  const { token } = useAuth();
  const params = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!token || !params?.id) return;
    try {
      const response = await deliveryApi.get(token, params.id);
      setDelivery(response.delivery);
    } catch (loadError) {
      setError(loadError.message || "Unable to load this delivery");
    } finally {
      setLoading(false);
    }
  }, [params, token]);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      if (!isMounted) return;
      await loadData();
    };
    void execute();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const updateStatus = async (status) => {
    if (!delivery) return;
    setUpdating(true);
    setError("");
    try {
      await riderApi.updateStatus(token, delivery.id, status);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update status");
    } finally {
      setUpdating(false);
    }
  };

  const nextAction = (status) => {
    if (status === "ASSIGNED")
      return { label: "Confirm Pickup", status: "PICKED_UP", icon: PackageCheck, color: "bg-emerald-600 hover:bg-emerald-700" };
    if (status === "PICKED_UP")
      return { label: "Start Transit", status: "IN_TRANSIT", icon: Bike, color: "bg-orange-600 hover:bg-orange-700" };
    if (status === "IN_TRANSIT")
      return { label: "Mark Delivered", status: "DELIVERED", icon: CheckCircle2, color: "bg-emerald-700 hover:bg-emerald-800" };
    return null;
  };

  const timeline = useMemo(
    () => (delivery ? getDeliveryTimeline(delivery.status) : []),
    [delivery],
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-8 max-w-7xl mx-auto space-y-4">
        <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-72 bg-white rounded-2xl animate-pulse border border-gray-200" />
      </div>
    );

  const action = delivery ? nextAction(delivery.status) : null;
  const ActionIcon = action?.icon || CheckCircle2;

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell
        role="RIDER"
        title="Assigned Run Details"
        description={`Active run #${delivery?.id || ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/rider/deliveries">
              <Button variant="outline" className="gap-2 rounded-xl text-xs font-semibold">
                <ArrowLeft className="h-4 w-4" /> All Assignments
              </Button>
            </Link>
            {action && (
              <Button
                size="sm"
                onClick={() => updateStatus(action.status)}
                disabled={updating}
                className={`rounded-xl font-bold text-xs gap-1.5 text-white ${action.color}`}
              >
                <ActionIcon className="h-4 w-4" />
                <span>{updating ? "Updating..." : action.label}</span>
              </Button>
            )}
          </div>
        }
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {delivery && (
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            {/* Waypoints & Customer info */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Order Reference</span>
                    <CardTitle className="text-lg font-mono mt-0.5">{delivery.id}</CardTitle>
                  </div>
                  <StatusBadge status={delivery.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
                    {/* Pickup */}
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pickup Origin</span>
                        <div className="text-base font-bold text-gray-900 mt-0.5">{delivery.pickupAddress}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Sender: {delivery.pickupContactName} • {delivery.pickupContactPhone}
                        </div>
                      </div>
                    </div>

                    <div className="border-l-2 border-dashed border-gray-300 ml-3.5 h-4" />

                    {/* Destination */}
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-orange-100 text-orange-800 text-xs font-bold shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Drop-off Destination</span>
                        <div className="text-base font-bold text-gray-900 mt-0.5">{delivery.deliveryAddress}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Recipient: {delivery.recipientName} • {delivery.recipientPhone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {delivery.description && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-600">
                      <span className="font-bold text-gray-900">Parcel Notes: </span>
                      {delivery.description}
                    </div>
                  )}

                  <div className="rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500 flex justify-between items-center">
                    <span>Customer Account:</span>
                    <span className="font-bold text-gray-800">{delivery.customer?.name || "Customer"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stepper Timeline & Progression */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Delivery Milestones</CardTitle>
                  <CardDescription>Live progress of this assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-1">
                    {timeline.map((step, index) => {
                      const Icon = STATUS_ICONS[step.key] || Check;
                      const isCompleted = step.active && !step.current;
                      const isCurrent = step.current;

                      return (
                        <div key={step.label} className="flex items-start gap-3.5 relative">
                          {index < timeline.length - 1 && (
                            <div
                              className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                                step.active ? "bg-emerald-500" : "bg-gray-200"
                              }`}
                            />
                          )}

                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 z-10 transition-colors ${
                              isCurrent
                                ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                                : isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-bold ${
                                  isCurrent
                                    ? "text-emerald-800"
                                    : isCompleted
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {action && (
                    <div className="pt-3 border-t border-gray-100">
                      <Button
                        onClick={() => updateStatus(action.status)}
                        disabled={updating}
                        className={`w-full rounded-xl font-bold py-5 text-sm gap-2 text-white ${action.color}`}
                      >
                        <ActionIcon className="h-4 w-4" />
                        <span>{updating ? "Updating..." : `Advance to: ${action.label}`}</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}

export default function RiderDeliveryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] p-8 max-w-7xl mx-auto space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-white rounded-2xl animate-pulse border border-gray-200" />
        </div>
      }
    >
      <RiderDeliveryDetailInner />
    </Suspense>
  );
}
