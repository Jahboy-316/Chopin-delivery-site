"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { paymentApi } from "@/lib/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await paymentApi.list(token);
        setPayments(response.payments || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filtered = payments.filter((payment) => {
    const textMatch = `${payment.method} ${payment.amount} ${payment.delivery?.customer?.name || ""} ${payment.deliveryId || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!textMatch) return false;
    if (statusFilter === "ALL") return true;
    return payment.status === statusFilter;
  });

  const totalSuccessful = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell
        role="ADMIN"
        title="Payment Settlements"
        description="Review transaction records, payment methods, and delivery fees across the platform."
      >
        {/* Tally Card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Settled Volume</span>
              <div className="text-2xl font-black text-gray-900 mt-0.5">₦{totalSuccessful.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-xs text-emerald-800/80">
            Recorded across {payments.length} orders
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
            <div>
              <CardTitle>Transactions Ledger ({filtered.length})</CardTitle>
              <CardDescription>Payment status and delivery linkage</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "ALL", label: "All" },
                  { id: "SUCCESSFUL", label: "Successful" },
                  { id: "PENDING", label: "Pending" },
                  { id: "FAILED", label: "Failed" },
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
              <div className="relative w-full sm:w-60">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search method or name"
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-16 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-12 text-center text-sm text-gray-500">
                No payment records match the current filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-all shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          ₦{payment.amount}
                        </span>
                        <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                          {payment.method}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Customer: <span className="font-semibold text-gray-700">{payment.delivery?.customer?.name || "Customer"}</span> • Delivery Ref: <span className="font-mono">{payment.delivery?.id || payment.deliveryId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge status={payment.status} type="payment" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
