"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, Package, Plus, Search } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { deliveryApi } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function CustomerDeliveriesPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await deliveryApi.list(token);
        setDeliveries(response.deliveries || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load deliveries.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const filtered = deliveries.filter((delivery) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return [delivery.pickupAddress, delivery.deliveryAddress, delivery.recipientName, delivery.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title="Delivery history"
        description="Review active, completed, and cancelled orders."
        actions={
          <Link href="/customer/deliveries/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> New delivery</Button>
          </Link>
        }
      >
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>My deliveries</CardTitle>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search deliveries" className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-xl border border-border bg-muted/60" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
                <Archive className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-medium">No deliveries found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your delivery history will appear here after you create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((delivery) => (
                  <Link key={delivery.id} href={`/customer/deliveries/${delivery.id}`} className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/20">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          {delivery.status}
                        </div>
                        <div className="text-lg font-medium">{delivery.deliveryAddress}</div>
                        <div className="text-sm text-muted-foreground">Pickup: {delivery.pickupAddress}</div>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <StatusBadge status={delivery.status} />
                        <div className="text-sm text-muted-foreground">{formatDate(delivery.createdAt)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
