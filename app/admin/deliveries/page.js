"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { deliveryApi } from "@/lib/api";

export default function AdminDeliveriesPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const response = await deliveryApi.adminList(token);
      setDeliveries(response.deliveries || []);
    };
    load();
  }, [token]);

  const filtered = deliveries.filter((delivery) => `${delivery.pickupAddress} ${delivery.deliveryAddress} ${delivery.customer?.name || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell role="ADMIN" title="Deliveries" description="Platform-wide delivery status and routing.">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All deliveries</CardTitle>
              <CardDescription>Search by pickup, destination, or customer</CardDescription>
            </div>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search deliveries" className="max-w-xs" />
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.map((delivery) => (
              <div key={delivery.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{delivery.deliveryAddress}</div>
                    <div className="mt-1 text-sm text-muted-foreground">Pickup: {delivery.pickupAddress}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={delivery.status} />
                    <span className="text-sm text-muted-foreground">{delivery.customer?.name || "Customer"}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
