"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Compass,
  CreditCard,
  MapPin,
  Package,
  Plus,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react";

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
    let isMounted = true;
    const load = async () => {
      if (!token) return;
      try {
        const [deliveryResponse, paymentResponse] = await Promise.all([
          deliveryApi.list(token),
          paymentApi.list(token),
        ]);
        if (isMounted) {
          setDeliveries(deliveryResponse.deliveries || []);
          setPayments(paymentResponse.payments || []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load your dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const activeDelivery = useMemo(
    () => deliveries.find((delivery) => !["DELIVERED", "CANCELLED"].includes(delivery.status)),
    [deliveries],
  );

  const firstName = user?.name ? user.name.split(" ")[0] : "Customer";

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title={`Welcome back, ${firstName}! 👋`}
        description="Here is your live delivery summary, active parcels, and recent orders."
        actions={
          <Link href="/customer/deliveries/new">
            <Button className="gap-2 shadow-sm font-bold rounded-xl">
              <Plus className="h-4 w-4" /> Send new delivery
            </Button>
          </Link>
        }
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {/* Quick Send Banner for returning customers */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-teal-50 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-xs">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Need something picked up or dropped off?</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Dispatch an on-demand rider to any address in your city with real-time tracking.
              </p>
            </div>
          </div>
          <Link href="/customer/deliveries/new">
            <Button className="whitespace-nowrap rounded-xl font-bold gap-2">
              <span>Book Pickup</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="hover:shadow-sm transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="font-semibold text-xs uppercase tracking-wider text-gray-500">
                    Active Delivery
                  </CardDescription>
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                    <Bike className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900">
                    {activeDelivery ? (
                      <span className="text-emerald-700">1 in progress</span>
                    ) : (
                      "None active"
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {activeDelivery ? activeDelivery.deliveryAddress : "All caught up"}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-sm transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="font-semibold text-xs uppercase tracking-wider text-gray-500">
                    Total Deliveries
                  </CardDescription>
                  <div className="rounded-xl bg-orange-50 p-2 text-orange-700">
                    <Package className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900">{deliveries.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Across your order history</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-sm transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="font-semibold text-xs uppercase tracking-wider text-gray-500">
                    Successful Payments
                  </CardDescription>
                  <div className="rounded-xl bg-sky-50 p-2 text-sky-700">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900">
                    {payments.filter((payment) => payment.status === "SUCCESSFUL").length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Settled & recorded transactions</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Interactive Row */}
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              {/* Left Column: Active Order Card & Recent Deliveries */}
              <div className="space-y-6">
                {/* Active Delivery Highlight (if one is currently in progress) */}
                {activeDelivery && (
                  <Card className="border-emerald-200 bg-white overflow-hidden shadow-xs">
                    <div className="bg-emerald-600 px-5 py-3 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider">Live Package In Progress</span>
                      </div>
                      <Link
                        href={`/customer/deliveries/${activeDelivery.id}`}
                        className="text-xs font-bold underline hover:text-emerald-100 flex items-center gap-1"
                      >
                        View Full Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <CardContent className="p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">Reference:</span>
                          <span className="text-xs font-mono font-bold text-gray-800 ml-1.5">{activeDelivery.id.slice(0, 12)}...</span>
                        </div>
                        <StatusBadge status={activeDelivery.status} />
                      </div>

                      {/* Route Path */}
                      <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            A
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pickup</span>
                            <div className="text-sm font-semibold text-gray-900">{activeDelivery.pickupAddress}</div>
                            <div className="text-xs text-gray-500">{activeDelivery.pickupContactName} • {activeDelivery.pickupContactPhone}</div>
                          </div>
                        </div>

                        <div className="border-l-2 border-dashed border-gray-300 ml-2.5 h-3" />

                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                            B
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Destination</span>
                            <div className="text-sm font-semibold text-gray-900">{activeDelivery.deliveryAddress}</div>
                            <div className="text-xs text-gray-500">{activeDelivery.recipientName} • {activeDelivery.recipientPhone}</div>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Rider Banner */}
                      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 font-bold">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {activeDelivery.rider?.user?.name || "Assigning nearby rider..."}
                            </div>
                            <div className="text-gray-500">
                              {activeDelivery.rider ? `Rider status: ${activeDelivery.rider.availability}` : "Dispatcher is routing an available rider"}
                            </div>
                          </div>
                        </div>
                        <Link href={`/customer/deliveries/${activeDelivery.id}`}>
                          <Button size="sm" variant="outline" className="rounded-lg text-xs font-semibold">
                            Track
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Deliveries List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Your latest package activity & history</CardDescription>
                    </div>
                    <Link
                      href="/customer/deliveries"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>View all ({deliveries.length})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2">
                    {deliveries.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mx-auto mb-3">
                          <Package className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">No deliveries yet</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                          Ready to send something? Request your first delivery and track your rider in real time.
                        </p>
                        <div className="mt-4">
                          <Link href="/customer/deliveries/new">
                            <Button size="sm" className="rounded-xl font-bold">
                              Send your first parcel
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      deliveries.slice(0, 4).map((delivery) => (
                        <Link
                          key={delivery.id}
                          href={`/customer/deliveries/${delivery.id}`}
                          className="group block rounded-2xl border border-gray-200/90 bg-white p-4 transition-all duration-150 hover:border-emerald-300 hover:shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="font-medium text-gray-700">{delivery.pickupAddress}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                <span>{delivery.deliveryAddress}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Ordered {formatDate(delivery.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                              <StatusBadge status={delivery.status} />
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Account Snapshot & Service Guarantees */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Profile</CardTitle>
                    <CardDescription>Verified customer details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{user?.name}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <ReceiptText className="h-4 w-4 text-emerald-600" /> Payment Methods
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Pay effortlessly using Cash, Card, or Bank Transfer recorded securely with every order.
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Delivery Protection
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Every package handled with care by our verified rider network across the city.
                      </p>
                    </div>

                    <Link href="/customer/profile" className="block pt-1">
                      <Button variant="outline" size="sm" className="w-full rounded-xl font-semibold text-xs">
                        Manage Account Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Helpful Delivery Instructions Tips */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-xs text-emerald-900 space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-emerald-700" /> Quick Dispatch Tip
                  </div>
                  <p className="text-emerald-800/80 leading-relaxed">
                    Ensure both pickup and recipient phone numbers are active. Our dispatchers and riders contact numbers before departure.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
