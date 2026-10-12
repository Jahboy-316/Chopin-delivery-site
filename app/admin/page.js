"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bike,
  Clock,
  CreditCard,
  Package,
  PackageCheck,
  Users,
} from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { adminApi, deliveryApi, paymentApi } from "@/lib/api";

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [userResponse, deliveryResponse, paymentResponse] = await Promise.all([
          adminApi.listUsers(token),
          deliveryApi.adminList(token),
          paymentApi.list(token),
        ]);
        setUsers(userResponse.users || []);
        setDeliveries(deliveryResponse.deliveries || []);
        setPayments(paymentResponse.payments || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const totalCustomers = users.filter((item) => item.role === "CUSTOMER").length;
  const totalRiders = users.filter((item) => item.role === "RIDER").length;
  const activeDeliveries = deliveries.filter((item) => !["DELIVERED", "CANCELLED"].includes(item.status)).length;
  const completedDeliveries = deliveries.filter((item) => item.status === "DELIVERED").length;
  const pendingPayments = payments.filter((item) => item.status === "PENDING").length;
  const successfulPayments = payments.filter((item) => item.status === "SUCCESSFUL").length;

  const stats = [
    { label: "Total Members", value: users.length, icon: Users, color: "bg-blue-50 text-blue-700" },
    { label: "Active Customers", value: totalCustomers, icon: Users, color: "bg-emerald-50 text-emerald-700" },
    { label: "Fleet Riders", value: totalRiders, icon: Bike, color: "bg-orange-50 text-orange-700" },
    { label: "Active Runs", value: activeDeliveries, icon: Package, color: "bg-amber-50 text-amber-700" },
    { label: "Completed Runs", value: completedDeliveries, icon: PackageCheck, color: "bg-purple-50 text-purple-700" },
    { label: "Settled Payments", value: successfulPayments, icon: CreditCard, color: "bg-emerald-50 text-emerald-700" },
    { label: "Pending Payments", value: pendingPayments, icon: Clock, color: "bg-rose-50 text-rose-700" },
  ];

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell
        role="ADMIN"
        title={`Operations Command Center`}
        description="Real-time oversight of city dispatches, rider availability, member accounts, and payments."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/deliveries">
              <Button size="sm" className="rounded-xl font-bold gap-1.5 shadow-sm">
                <span>Dispatch Console</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        }
      >
        {/* Quick Management Shortcuts Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pb-1">
          <Link href="/admin/deliveries">
            <Button variant="outline" size="sm" className="rounded-xl font-semibold text-xs gap-1.5">
              <Package className="h-3.5 w-3.5 text-emerald-600" />
              <span>Deliveries ({deliveries.length})</span>
            </Button>
          </Link>
          <Link href="/admin/riders">
            <Button variant="outline" size="sm" className="rounded-xl font-semibold text-xs gap-1.5">
              <Bike className="h-3.5 w-3.5 text-orange-600" />
              <span>Riders ({totalRiders})</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="rounded-xl font-semibold text-xs gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span>Users ({users.length})</span>
            </Button>
          </Link>
          <Link href="/admin/payments">
            <Button variant="outline" size="sm" className="rounded-xl font-semibold text-xs gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-purple-600" />
              <span>Payments ({payments.length})</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : (
          <>
            {/* Top KPI Metrics Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="p-4 shadow-xs hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {label}
                    </span>
                    <div className={`p-1.5 rounded-lg ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-2">{value}</div>
                </Card>
              ))}
            </div>

            {/* Main Tables Row: Live Platform Activity & Payments */}
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              {/* Deliveries Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">Recent Deliveries</CardTitle>
                    <CardDescription>Latest dispatch and routing activity</CardDescription>
                  </div>
                  <Link
                    href="/admin/deliveries"
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deliveries.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No deliveries recorded yet.</div>
                  ) : (
                    deliveries.slice(0, 5).map((delivery) => (
                      <div
                        key={delivery.id}
                        className="rounded-2xl border border-gray-200 bg-white p-3.5 hover:border-gray-300 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-bold text-sm text-gray-900 truncate">
                            {delivery.deliveryAddress}
                          </div>
                          <StatusBadge status={delivery.status} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate">From: {delivery.pickupAddress}</span>
                          <span className="text-gray-400 shrink-0 ml-2">
                            {delivery.customer?.name || "Customer"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Payments Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">Payments Ledger</CardTitle>
                    <CardDescription>Recorded order settlements</CardDescription>
                  </div>
                  <Link
                    href="/admin/payments"
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No payment records yet.</div>
                  ) : (
                    payments.slice(0, 5).map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-2xl border border-gray-200 bg-white p-3.5 hover:border-gray-300 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-bold text-sm text-gray-900">
                            ₦{payment.amount}
                            <span className="text-xs font-medium text-gray-500 ml-2">
                              via {payment.method}
                            </span>
                          </div>
                          <StatusBadge status={payment.status} type="payment" />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex justify-between">
                          <span>{payment.delivery?.customer?.name || "Customer"}</span>
                          <span className="font-mono text-[11px] text-gray-400">
                            #{payment.deliveryId?.slice(0, 8)}
                          </span>
                        </div>
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
