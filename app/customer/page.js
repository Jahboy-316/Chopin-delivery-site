"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Package, Plus, ReceiptText, Truck } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { deliveryApi, paymentApi } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function CustomerDashboardPage() {
  const { token, user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [deliveryResponse, paymentResponse] = await Promise.all([
          deliveryApi.list(token),
          paymentApi.list(token),
        ]);
        setDeliveries(deliveryResponse.deliveries || []);
        setPayments(paymentResponse.payments || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const activeDelivery = useMemo(() => deliveries.find((delivery) => !["DELIVERED", "CANCELLED"].includes(delivery.status)) || deliveries[0], [deliveries]);

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title={`Welcome back, ${user?.name || "customer"}`}
        description="Track your deliveries, payment state, and recent activity."
        actions={
          <Link href="/customer/deliveries/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> New delivery</Button>
          </Link>
        }
      >
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Active delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-2xl font-semibold">{activeDelivery ? activeDelivery.status : "None"}</div>
                      <div className="text-sm text-muted-foreground">{activeDelivery ? activeDelivery.deliveryAddress : "No open deliveries"}</div>
                    </div>
                    {activeDelivery && <StatusBadge status={activeDelivery.status} />}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Recent deliveries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{deliveries.length}</div>
                  <div className="text-sm text-muted-foreground">Across your order history</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{payments.filter((payment) => payment.status === "SUCCESSFUL").length}</div>
                  <div className="text-sm text-muted-foreground">Successful payments</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent deliveries</CardTitle>
                      <CardDescription>Latest activity and real-time status.</CardDescription>
                    </div>
                    <Link href="/customer/deliveries" className="text-sm font-medium text-primary">View all</Link>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deliveries.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
                        <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-3 text-base font-medium">No deliveries yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Create your first delivery and track it here.</p>
                      </div>
                    ) : (
                      deliveries.slice(0, 4).map((delivery) => (
                        <Link key={delivery.id} href={`/customer/deliveries/${delivery.id}`} className="block rounded-2xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {delivery.pickupAddress}
                              </div>
                              <div className="mt-2 text-lg font-medium">{delivery.deliveryAddress}</div>
                              <div className="mt-1 text-sm text-muted-foreground">{formatDate(delivery.createdAt)}</div>
                            </div>
                            <StatusBadge status={delivery.status} />
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Customer</div>
                        <div className="font-medium">{user?.name}</div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">ACTIVE</div>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ReceiptText className="h-4 w-4" /> Payment methods
                      </div>
                      <div className="mt-2 text-sm">Cash, card, and transfer are accepted according to backend payment rules.</div>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" /> Latest rider update
                      </div>
                      <div className="mt-2 text-sm">
                        {activeDelivery?.rider ? `Assigned to ${activeDelivery.rider.user?.name || "a rider"}` : "Waiting for rider assignment"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
