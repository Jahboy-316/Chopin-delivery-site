"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Truck } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getDeliveryTimeline } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { deliveryApi, paymentApi } from "@/lib/api";

function CustomerDeliveryDetailInner() {
  const params = useParams();
  const { token } = useAuth();
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token || !params?.id) return;
      try {
        const [deliveryData, paymentData] = await Promise.all([
          deliveryApi.get(token, params.id),
          paymentApi.list(token),
        ]);
        const nextDelivery = deliveryData.delivery;
        const relatedPayment = (paymentData.payments || []).find((item) => item.deliveryId === nextDelivery.id) || null;
        setDelivery(nextDelivery);
        setPayment(relatedPayment);
      } catch (loadError) {
        setError(loadError.message || "Unable to load this delivery.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params, token]);

  const timeline = useMemo(() => (delivery ? getDeliveryTimeline(delivery.status) : []), [delivery]);

  if (loading) {
    return <ProtectedRoute allowedRoles={["CUSTOMER"]}><div className="min-h-screen bg-background p-8"><div className="h-36 animate-pulse rounded-2xl border border-border bg-card" /></div></ProtectedRoute>;
  }

  if (error) {
    return <ProtectedRoute allowedRoles={["CUSTOMER"]}><DashboardShell role="CUSTOMER" title="Delivery detail" description="Unable to load this order."><div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div></DashboardShell></ProtectedRoute>;
  }

  if (!delivery) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title="Delivery details"
        description="Live status, payment, and dispatch information."
        actions={
          <Link href="/customer/deliveries">
            <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> All deliveries</Button>
          </Link>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Delivery reference</div>
                  <CardTitle className="mt-1">{delivery.id}</CardTitle>
                </div>
                <StatusBadge status={delivery.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Pickup</div>
                    <div className="mt-2 font-medium">{delivery.pickupAddress}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{delivery.pickupContactName} · {delivery.pickupContactPhone}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4" /> Destination</div>
                    <div className="mt-2 font-medium">{delivery.deliveryAddress}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{delivery.recipientName} · {delivery.recipientPhone}</div>
                  </div>
                </div>

                {delivery.description && (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Details: </span>{delivery.description}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeline.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-sm font-medium text-foreground">{step.label}</div>
                      {step.current && <div className="text-xs text-primary">Current</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment state</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="font-medium">{payment?.method || "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {payment ? <StatusBadge status={payment.status} type="payment" /> : <span className="text-sm">No payment yet</span>}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-medium">₦{payment?.amount || "5.00"}</span>
                </div>
                <div className="text-sm text-muted-foreground">Created {new Date(delivery.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rider</CardTitle>
              </CardHeader>
              <CardContent>
                {delivery.rider ? (
                  <div className="space-y-2">
                    <div className="font-medium">{delivery.rider.user?.name || "Assigned rider"}</div>
                    <div className="text-sm text-muted-foreground">Availability: {delivery.rider.availability}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Waiting for assignment.</div>
                )}
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
    <Suspense fallback={<div className="min-h-screen bg-background p-8"><div className="h-36 animate-pulse rounded-2xl border border-border bg-card" /></div>}>
      <CustomerDeliveryDetailInner />
    </Suspense>
  );
}
