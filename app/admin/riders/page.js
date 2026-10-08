"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/components/auth-provider";
import { adminApi } from "@/lib/api";

export default function AdminRidersPage() {
  const { token } = useAuth();
  const [riders, setRiders] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const response = await adminApi.listRiders(token);
      setRiders(response.riders || []);
    };

    load();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell role="ADMIN" title="Riders" description="Operational status and rider profiles.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {riders.map((rider) => (
            <Card key={rider.id}>
              <CardHeader>
                <CardTitle>{rider.user?.name || "Rider"}</CardTitle>
                <CardDescription>{rider.user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Availability</span><StatusBadge status={rider.availability} type="availability" /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Account</span><StatusBadge status={rider.user?.status || "ACTIVE"} type="user" /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
