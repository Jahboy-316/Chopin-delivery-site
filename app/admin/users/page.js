"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { adminApi } from "@/lib/api";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const response = await adminApi.listUsers(token);
      setUsers(response.users || []);
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

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingId(id);
    try {
      await adminApi.updateUserStatus(token, id, nextStatus);
      await load();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter((user) => {
    const textMatch = `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!textMatch) return false;
    if (roleFilter === "ALL") return true;
    return user.role === roleFilter;
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell
        role="ADMIN"
        title="Member Accounts"
        description="Manage registered customer, rider, and administrator profiles and access permissions."
      >
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
            <div>
              <CardTitle>Platform Members ({filtered.length})</CardTitle>
              <CardDescription>Authentication records and status control</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Role filter pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "ALL", label: "All" },
                  { id: "CUSTOMER", label: "Customers" },
                  { id: "RIDER", label: "Riders" },
                  { id: "ADMIN", label: "Admins" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoleFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      roleFilter === tab.id
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name or email"
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
                No users match the search filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((u) => {
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : "U";
                  const isToggling = togglingId === u.id;

                  return (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                          {u.role}
                        </span>

                        <StatusBadge status={u.status} type="user" />

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatus(u.id, u.status)}
                          disabled={isToggling}
                          className="rounded-xl text-xs font-semibold h-8 px-3"
                        >
                          {isToggling
                            ? "Updating..."
                            : u.status === "ACTIVE"
                              ? "Disable"
                              : "Activate"}
                        </Button>
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
