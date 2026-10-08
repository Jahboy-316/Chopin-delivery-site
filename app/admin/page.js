"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, PackageCheck, ShieldCheck, Users } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { adminApi, deliveryApi, paymentApi } from "@/lib/api";

export default function AdminOverviewPage() {
  const { token, user } = useAuth();
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
    { label: "Total users", value: users.length, icon: Users },
    { label: "Customers", value: totalCustomers, icon: Users },
    { label: "Riders", value: totalRiders, icon: ShieldCheck },
    { label: "Active deliveries", value: activeDeliveries, icon: PackageCheck },
    { label: "Completed", value: completedDeliveries, icon: ShieldCheck },
    { label: "Pending payments", value: pendingPayments, icon: CreditCard },
    { label: "Successful", value: successfulPayments, icon: CreditCard },
  ];

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell role="ADMIN" title={`Welcome back, ${user?.name || "admin"}`} description="Platform overview and operational health." >
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">{Array.from({ length: 7 }).map((_, idx) => <div key={idx} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />)}</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardDescription>{label}</CardDescription>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Recent deliveries</CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deliveries.slice(0, 5).map((delivery) => (
                    <div key={delivery.id} className="rounded-2xl border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{delivery.deliveryAddress}</div>
                        <StatusBadge status={delivery.status} />
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{delivery.customer?.name || "Customer"} · {delivery.pickupAddress}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>Recent payment outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="rounded-2xl border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{payment.delivery?.customer?.name || "Customer"}</div>
                        <StatusBadge status={payment.status} type="payment" />
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{payment.method} · ₦{payment.amount}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/users"><button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Manage users</button></Link>
              <Link href="/admin/riders"><button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Manage riders</button></Link>
              <Link href="/admin/deliveries"><button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Review deliveries</button></Link>
              <Link href="/admin/payments"><button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Review payments</button></Link>
            </div>
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
