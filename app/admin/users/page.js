"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    const response = await adminApi.listUsers(token);
    setUsers(response.users || []);
    setLoading(false);
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

  const toggleStatus = async (id, status) => {
    await adminApi.updateUserStatus(token, id, status);
    await load();
  };

  const filtered = users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell role="ADMIN" title="Users" description="Manage platform account roles and status.">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Platform members</CardTitle>
              <CardDescription>Search by name, email, or role</CardDescription>
            </div>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="max-w-xs" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-16 animate-pulse rounded-xl border border-border bg-muted/60" />)}</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((user) => (
                  <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{user.role}</span>
                      <StatusBadge status={user.status} type="user" />
                      {user.status !== "ACTIVE" ? <Button size="sm" variant="outline" onClick={() => toggleStatus(user.id, "ACTIVE")}>Activate</Button> : <Button size="sm" variant="outline" onClick={() => toggleStatus(user.id, "INACTIVE")}>Disable</Button>}
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
