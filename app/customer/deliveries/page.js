"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  ArrowRight,
  MapPin,
  Plus,
  Search,
} from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [statusFilter, setStatusFilter] = useState("ALL");
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
    const matchesSearch = [
      delivery.pickupAddress,
      delivery.deliveryAddress,
      delivery.recipientName,
      delivery.description,
      delivery.id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return !["DELIVERED", "CANCELLED"].includes(delivery.status);
    if (statusFilter === "DELIVERED") return delivery.status === "DELIVERED";
    if (statusFilter === "CANCELLED") return delivery.status === "CANCELLED";
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title="Delivery History"
        description="Search and inspect all your current and past package requests."
        actions={
          <Link href="/customer/deliveries/new">
            <Button className="gap-2 rounded-xl font-bold">
              <Plus className="h-4 w-4" /> Send new delivery
            </Button>
          </Link>
        }
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
            <div>
              <CardTitle>My Deliveries ({filtered.length})</CardTitle>
              <CardDescription>Track active dispatches or review past completed runs</CardDescription>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              {/* Quick Status Pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "ALL", label: "All" },
                  { id: "ACTIVE", label: "Active" },
                  { id: "DELIVERED", label: "Delivered" },
                  { id: "CANCELLED", label: "Cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      statusFilter === tab.id
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by address or ID"
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 mx-auto mb-3">
                  <Archive className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No deliveries found</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  {search || statusFilter !== "ALL"
                    ? "Try adjusting your search keyword or status filters."
                    : "You haven't requested any deliveries yet. Request your first one now!"}
                </p>
                <div className="mt-4">
                  <Link href="/customer/deliveries/new">
                    <Button size="sm" className="rounded-xl font-bold">
                      Book a Delivery
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((delivery) => (
                  <Link
                    key={delivery.id}
                    href={`/customer/deliveries/${delivery.id}`}
                    className="group block rounded-2xl border border-gray-200/90 bg-white p-4 transition-all duration-150 hover:border-emerald-300 hover:shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Route and meta */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            #{delivery.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(delivery.createdAt)}
                          </span>
                        </div>

                        {/* Origin to Destination */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm pt-1">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-700 truncate max-w-xs">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{delivery.pickupAddress}</span>
                          </div>
                          <ArrowRight className="hidden sm:inline h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <div className="flex items-center gap-1.5 font-bold text-gray-900 truncate max-w-xs">
                            <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                            <span className="truncate">{delivery.deliveryAddress}</span>
                          </div>
                        </div>

                        {delivery.recipientName && (
                          <div className="text-xs text-gray-500">
                            Recipient: {delivery.recipientName} ({delivery.recipientPhone || "—"})
                          </div>
                        )}
                      </div>

                      {/* Right: Status and action pill */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                        <StatusBadge status={delivery.status} />
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                          <ArrowRight className="h-4 w-4" />
                        </div>
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
