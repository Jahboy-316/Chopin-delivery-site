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
import { deliveryApi } from "@/lib/api";

function RiderDeliveryDetailInner() {
  const { token } = useAuth();
  const params = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token || !params?.id) return;
      try {
        const response = await deliveryApi.get(token, params.id);
        setDelivery(response.delivery);
      } catch (loadError) {
        setError(loadError.message || "Unable to load this delivery");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params, token]);

  const timeline = useMemo(() => (delivery ? getDeliveryTimeline(delivery.status) : []), [delivery]);

  if (loading) return <div className="min-h-screen bg-background p-8"><div className="h-32 animate-pulse rounded-2xl border border-border bg-card" /></div>;

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell role="RIDER" title="Delivery detail" description="Assigned route and current state.">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {delivery && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Reference</div>
                  <CardTitle className="mt-1">{delivery.id}</CardTitle>
                </div>
                <StatusBadge status={delivery.status} />
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Pickup</div>
                    <div className="mt-2 font-medium">{delivery.pickupAddress}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{delivery.pickupContactName} · {delivery.pickupContactPhone}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4" /> Destination</div>
                    <div className="mt-2 font-medium">{delivery.deliveryAddress}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{delivery.recipientName} · {delivery.recipientPhone}</div>
                  </div>
                </div>
                {delivery.description && <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">{delivery.description}</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipment progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {timeline.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</div>
                    <div className="flex-1 text-sm font-medium">{step.label}</div>
                    {step.current && <div className="text-xs text-primary">Current</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
        <div className="mt-6">
          <Link href="/rider/deliveries"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to assignments</Button></Link>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}

export default function RiderDeliveryDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-8"><div className="h-32 animate-pulse rounded-2xl border border-border bg-card" /></div>}>
      <RiderDeliveryDetailInner />
    </Suspense>
  );
}
