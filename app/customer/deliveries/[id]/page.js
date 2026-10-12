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
  CreditCard,
  MapPin,
  Package,
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
import { deliveryApi, paymentApi } from "@/lib/api";

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  ASSIGNED: UserCheck,
  PICKED_UP: PackageCheck,
  IN_TRANSIT: Bike,
  DELIVERED: Check,
  CANCELLED: XCircle,
};

function CustomerDeliveryDetailInner() {
  const params = useParams();
  const { token } = useAuth();
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!token || !params?.id) return;
    try {
      const [deliveryData, paymentData] = await Promise.all([
        deliveryApi.get(token, params.id),
        paymentApi.list(token),
      ]);
      const nextDelivery = deliveryData.delivery;
      const relatedPayment =
        (paymentData.payments || []).find((item) => item.deliveryId === nextDelivery.id) || null;
      setDelivery(nextDelivery);
      setPayment(relatedPayment);
    } catch (loadError) {
      setError(loadError.message || "Unable to load this delivery.");
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

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this pending delivery?")) return;
    setCancelling(true);
    try {
      await deliveryApi.cancel(token, delivery.id);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to cancel delivery");
    } finally {
      setCancelling(false);
    }
  };

  const timeline = useMemo(
    () => (delivery ? getDeliveryTimeline(delivery.status) : []),
    [delivery],
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
        <div className="min-h-screen bg-[#F8F9FA] p-8 max-w-7xl mx-auto space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-72 bg-white rounded-2xl animate-pulse border border-gray-200" />
            <div className="h-72 bg-white rounded-2xl animate-pulse border border-gray-200" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !delivery) {
    return (
      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
        <DashboardShell role="CUSTOMER" title="Delivery Details" description="Order could not be displayed.">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 max-w-lg mx-auto text-center space-y-3">
            <p>{error || "Delivery not found."}</p>
            <Link href="/customer/deliveries">
              <Button variant="outline" size="sm" className="rounded-xl">
                Return to Deliveries
              </Button>
            </Link>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  const isPending = delivery.status === "PENDING";

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title="Live Delivery Tracking"
        description={`Tracking order reference #${delivery.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/customer/deliveries">
              <Button variant="outline" className="gap-2 rounded-xl text-xs font-semibold">
                <ArrowLeft className="h-4 w-4" /> All Deliveries
              </Button>
            </Link>
            {isPending && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-xl text-xs font-semibold"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </div>
        }
      >
        {/* Top Status Hero Banner */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Order Ref</span>
                <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                  {delivery.id}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 mt-1">
                Placed on {new Date(delivery.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <StatusBadge status={delivery.status} className="text-sm px-3.5 py-1" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Left Column: Route Details & Visual Timeline */}
          <div className="space-y-6">
            {/* Delivery Progress Stepper */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Delivery Milestones</CardTitle>
                <CardDescription>Live timeline as your package advances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-1">
                  {timeline.map((step, index) => {
                    const Icon = STATUS_ICONS[step.key] || Check;
                    const isCompleted = step.active && !step.current;
                    const isCurrent = step.current;

                    return (
                      <div key={step.label} className="flex items-start gap-3.5 relative">
                        {/* Connecting Line */}
                        {index < timeline.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                              step.active ? "bg-emerald-500" : "bg-gray-200"
                            }`}
                          />
                        )}

                        {/* Step Icon Badge */}
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

                        {/* Step Details */}
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
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Waypoint Route Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Route & Waypoints</CardTitle>
                <CardDescription>Sender and recipient coordinates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
                  {/* Origin */}
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Pickup Location
                      </span>
                      <div className="text-base font-bold text-gray-900 mt-0.5">{delivery.pickupAddress}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Sender: {delivery.pickupContactName} • {delivery.pickupContactPhone}
                      </div>
                    </div>
                  </div>

                  {/* Connected Track */}
                  <div className="border-l-2 border-dashed border-gray-300 ml-3.5 h-4" />

                  {/* Destination */}
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-orange-100 text-orange-800 text-xs font-bold shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Drop-Off Destination
                      </span>
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Rider & Payment Cards */}
          <div className="space-y-6">
            {/* Assigned Rider Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Assigned Rider</CardTitle>
                <CardDescription>Professional courier handling your package</CardDescription>
              </CardHeader>
              <CardContent>
                {delivery.rider ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-base shadow-xs">
                        {delivery.rider.user?.name?.charAt(0).toUpperCase() || "R"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{delivery.rider.user?.name || "Rider"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Chopin Express Fleet</div>
                        <div className="mt-1">
                          <StatusBadge status={delivery.rider.availability} type="availability" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
                    <Bike className="mx-auto h-8 w-8 text-gray-400 mb-2 animate-bounce" />
                    <div className="text-sm font-bold text-gray-800">Dispatching Rider</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Our system is pairing an available nearby rider for pickup.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Summary</CardTitle>
                <CardDescription>Transaction record for this delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    {payment?.method || "Recorded"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Settlement Status</span>
                  {payment ? (
                    <StatusBadge status={payment.status} type="payment" />
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">Pending</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm py-2">
                  <span className="font-bold text-gray-900">Total Charged</span>
                  <span className="text-xl font-black text-gray-900">₦{payment?.amount || "5.00"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

export default function CustomerDeliveryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] p-8 max-w-7xl mx-auto space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-white rounded-2xl animate-pulse border border-gray-200" />
        </div>
      }
    >
      <CustomerDeliveryDetailInner />
    </Suspense>
  );
}
