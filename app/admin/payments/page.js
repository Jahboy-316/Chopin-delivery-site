"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { paymentApi } from "@/lib/api";

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const response = await paymentApi.list(token);
      setPayments(response.payments || []);
    };
    load();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell role="ADMIN" title="Payments" description="Payment record overview across deliveries.">
        <Card>
          <CardHeader>
            <CardTitle>Payment records</CardTitle>
            <CardDescription>Method, amount, status, and related delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{payment.delivery?.customer?.name || "Customer"}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{payment.method} · ₦{payment.amount} · {payment.delivery?.id || payment.deliveryId}</div>
                  </div>
                  <StatusBadge status={payment.status} type="payment" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
