"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { riderApi } from "@/lib/api";

export default function RiderProfilePage() {
  const { user, token } = useAuth();
  const [rider, setRider] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await riderApi.me(token);
        setRider(response.rider);
      } catch {
        setRider(null);
      }
    };

    load();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={["RIDER"]}>
      <DashboardShell role="RIDER" title="Rider profile" description="Account information and availability status.">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Live rider record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="mt-1 text-lg font-medium">{user?.name || rider?.user?.name || "—"}</div>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="mt-1 text-lg font-medium">{user?.email || rider?.user?.email || "—"}</div>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1 text-lg font-medium">{rider?.user?.status || user?.status || "ACTIVE"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Current rider operating state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Availability is controlled by the backend and only changes when you have no active assignment.</p>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current</div>
                <div className="mt-2 text-xl font-semibold text-foreground">{rider?.availability || "OFFLINE"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
