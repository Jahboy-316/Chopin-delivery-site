"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  MapPin,
  PackageCheck,
  PackageOpen,
  Power,
} from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { riderApi } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function RiderDashboardPage() {
  const { token, user } = useAuth();
  const [rider, setRider] = useState(null);
  const [available, setAvailable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [riderResponse, availableResponse, assignmentsResponse] = await Promise.all([
        riderApi.me(token),
        riderApi.listAvailable(token).catch(() => ({ deliveries: [] })),
        riderApi.listAssignments(token),
      ]);
      setRider(riderResponse.rider);
      setAvailable(availableResponse.deliveries || []);
      setAssignments(assignmentsResponse.deliveries || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load rider dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!active) return;
      await load();
    };
    void bootstrap();
    return () => {
      active = false;
    };
  }, [load]);

  const handleAvailability = async (availability) => {
    setUpdatingAvailability(true);
    setError("");
    try {
      const response = await riderApi.updateAvailability(token, availability);
      setRider(response.rider);
    } catch (submitError) {
      setError(submitError.message || "Unable to update availability.");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleAccept = async (id) => {
    setAcceptingId(id);
    setError("");
    try {
      await riderApi.accept(token, id);
      await load();
    } catch (submitError) {
      setError(submitError.message || "Unable to accept this delivery.");
    } finally {
      setAcceptingId(null);
    }
  };

  const isOnline = rider?.availability === "AVAILABLE";
  const activeAssignments = assignments.filter((d) => ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(d.status));

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell
        role="RIDER"
        title={`Welcome, ${user?.name || "Rider"}! 🛵`}
        description="Toggle your on-duty availability, accept open local deliveries, and advance assigned runs."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isOnline ? "default" : "outline"}
              size="sm"
              onClick={() => handleAvailability("AVAILABLE")}
              disabled={loading || updatingAvailability}
              className={`rounded-xl font-bold gap-1.5 ${
                isOnline ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-gray-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-gray-400"}`} />
              <span>Available</span>
            </Button>
            <Button
              variant={!isOnline ? "default" : "outline"}
              size="sm"
              onClick={() => handleAvailability("OFFLINE")}
              disabled={loading || updatingAvailability}
              className={`rounded-xl font-bold gap-1.5 ${
                !isOnline ? "bg-gray-800 hover:bg-gray-900 text-white" : "border-gray-200"
              }`}
            >
              <Power className="h-3.5 w-3.5" />
              <span>Offline</span>
            </Button>
          </div>
        }
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* On-Duty Cockpit Status Card */}
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all ${
            isOnline
              ? "border-emerald-200 bg-emerald-50/70"
              : "border-gray-200 bg-gray-50/70"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-white shadow-xs ${
                  isOnline ? "bg-emerald-600" : "bg-gray-600"
                }`}
              >
                <Bike className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</span>
                  <StatusBadge status={rider?.availability || "OFFLINE"} type="availability" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                  {isOnline
                    ? "You are online and ready to receive delivery jobs."
                    : "You are currently offline. Toggle to Available to accept runs."}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/rider/deliveries">
                <Button className="rounded-xl font-bold gap-2">
                  <span>Manage Active Runs ({activeAssignments.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : (
          <>
            {/* Quick Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Fleet Status
                  </CardDescription>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Bike className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900">{rider?.availability || "OFFLINE"}</div>
                  <div className="text-xs text-gray-500 mt-1">Live dispatch state</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Open Jobs Pool
                  </CardDescription>
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-700">
                    <PackageOpen className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900">{available.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Confirmed & ready for pickup</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Active Assigned Runs
                  </CardDescription>
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900">{activeAssignments.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Currently in your queue</div>
                </CardContent>
              </Card>
            </div>

            {/* Split: Open Jobs vs Assigned Deliveries */}
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              {/* Left: Available Deliveries to Accept */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Available Deliveries ({available.length})</CardTitle>
                      <CardDescription>Open customer requests available for instant pickup</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-1">
                  {available.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 mx-auto mb-3">
                        <PackageOpen className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">No open jobs at the moment</h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                        New customer requests will show up here as soon as they are placed or confirmed.
                      </p>
                    </div>
                  ) : (
                    available.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 hover:border-emerald-300 transition-all shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              #{delivery.id.slice(0, 8)}
                            </span>
                            <div className="text-xs text-gray-400">
                              Requested {formatDate(delivery.createdAt)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(delivery.id)}
                            disabled={acceptingId === delivery.id}
                            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 self-start sm:self-auto"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{acceptingId === delivery.id ? "Accepting..." : "Accept Job"}</span>
                          </Button>
                        </div>

                        {/* Route Summary */}
                        <div className="rounded-xl bg-gray-50 p-3 space-y-2 text-xs border border-gray-100">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-gray-700">Pickup:</span>
                            <span className="font-bold text-gray-900 truncate">{delivery.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                            <span className="font-semibold text-gray-700">Destination:</span>
                            <span className="font-bold text-gray-900 truncate">{delivery.deliveryAddress}</span>
                          </div>
                        </div>

                        {delivery.description && (
                          <div className="text-xs text-gray-500 italic">
                            Notes: &ldquo;{delivery.description}&rdquo;
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Right: Active Queue Snapshot */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">My Active Queue</CardTitle>
                    <CardDescription>Deliveries currently assigned to you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assignments.length === 0 ? (
                      <div className="text-xs text-gray-500 p-4 text-center border border-dashed rounded-xl">
                        No assigned deliveries in progress. Accept an open job on the left to start!
                      </div>
                    ) : (
                      assignments.slice(0, 4).map((delivery) => (
                        <div key={delivery.id} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-gray-900 truncate">
                              {delivery.deliveryAddress}
                            </span>
                            <StatusBadge status={delivery.status} />
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            Pickup: {delivery.pickupAddress}
                          </div>
                          <div className="pt-1 flex justify-end">
                            <Link href={`/rider/deliveries/${delivery.id}`}>
                              <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 px-2 font-semibold">
                                View Route Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="pt-2">
                      <Link href="/rider/deliveries">
                        <Button variant="outline" className="w-full rounded-xl text-xs font-bold">
                          Go to Route Management
                        </Button>
                      </Link>
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
