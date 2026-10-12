"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bike,
  CheckCircle2,
  Search,
  UserCheck,
} from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { adminApi, deliveryApi } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminDeliveriesPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedRiderMap, setSelectedRiderMap] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [deliveryRes, riderRes] = await Promise.all([
        deliveryApi.adminList(token),
        adminApi.listRiders(token).catch(() => ({ riders: [] })),
      ]);
      setDeliveries(deliveryRes.deliveries || []);
      setRiders(riderRes.riders || []);
    } catch (err) {
      setError(err.message || "Unable to load deliveries");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      if (!isMounted) return;
      await loadData();
    };
    void execute();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const handleAssignRider = async (deliveryId) => {
    const riderId = selectedRiderMap[deliveryId];
    if (!riderId) {
      alert("Please select a rider to assign.");
      return;
    }
    setAssigningId(deliveryId);
    setError("");
    setFeedback("");
    try {
      await deliveryApi.assignRider(token, deliveryId, riderId);
      setFeedback("Rider successfully assigned to delivery!");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to assign rider");
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = deliveries.filter((delivery) => {
    const textMatch = `${delivery.pickupAddress} ${delivery.deliveryAddress} ${delivery.customer?.name || ""} ${delivery.id}`
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!textMatch) return false;
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return !["DELIVERED", "CANCELLED"].includes(delivery.status);
    if (statusFilter === "UNASSIGNED") return !delivery.riderId && !delivery.rider;
    return delivery.status === statusFilter;
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell
        role="ADMIN"
        title="Delivery Operations"
        description="Inspect all platform deliveries, track routing, and assign riders to open runs."
      >
        {feedback && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
            <div>
              <CardTitle>Platform Deliveries ({filtered.length})</CardTitle>
              <CardDescription>Dispatch control and rider allocation</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Quick Status Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "ALL", label: "All" },
                  { id: "ACTIVE", label: "Active" },
                  { id: "UNASSIGNED", label: "Needs Rider" },
                  { id: "DELIVERED", label: "Delivered" },
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

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search address or user"
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-12 text-center text-sm text-gray-500">
                No deliveries match the selected query.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((delivery) => {
                  const hasRider = !!(delivery.rider || delivery.riderId);
                  const isAssigning = assigningId === delivery.id;

                  return (
                    <div
                      key={delivery.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 shadow-xs hover:border-gray-300 transition-all"
                    >
                      {/* Top Bar: Reference, Date, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            #{delivery.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(delivery.createdAt)}
                          </span>
                        </div>
                        <StatusBadge status={delivery.status} />
                      </div>

                      {/* Route Summary */}
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="font-bold text-gray-400 uppercase tracking-wider block text-[10px]">
                            Pickup Origin
                          </span>
                          <div className="font-bold text-gray-900 mt-0.5">{delivery.pickupAddress}</div>
                          <div className="text-gray-500 mt-0.5">
                            Customer: {delivery.customer?.name || "Customer"} ({delivery.pickupContactPhone || "—"})
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="font-bold text-gray-400 uppercase tracking-wider block text-[10px]">
                            Drop-Off Destination
                          </span>
                          <div className="font-bold text-gray-900 mt-0.5">{delivery.deliveryAddress}</div>
                          <div className="text-gray-500 mt-0.5">
                            Recipient: {delivery.recipientName || "—"} ({delivery.recipientPhone || "—"})
                          </div>
                        </div>
                      </div>

                      {/* Rider Assignment Strip */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs">
                          <Bike className="h-4 w-4 text-emerald-600" />
                          <span className="text-gray-500">Assigned Rider:</span>
                          <span className="font-bold text-gray-900">
                            {delivery.rider?.user?.name || "None (Unassigned)"}
                          </span>
                        </div>

                        {/* Assign Rider Action UI */}
                        {delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRiderMap[delivery.id] || ""}
                              onChange={(e) =>
                                setSelectedRiderMap((prev) => ({
                                  ...prev,
                                  [delivery.id]: e.target.value,
                                }))
                              }
                              className="text-xs rounded-xl border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-800"
                            >
                              <option value="">Select Rider...</option>
                              {riders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.user?.name || "Rider"} ({r.availability})
                                </option>
                              ))}
                            </select>

                            <Button
                              size="sm"
                              onClick={() => handleAssignRider(delivery.id)}
                              disabled={isAssigning}
                              className="rounded-xl text-xs font-bold gap-1"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>{isAssigning ? "Assigning..." : hasRider ? "Reassign" : "Assign Rider"}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
