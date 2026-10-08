"use client";

import { useAuth } from "@/components/auth-provider";
import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell role="CUSTOMER" title="Account profile" description="Your customer account details are available here.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Basic account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="mt-1 text-lg font-medium">{user?.name || "—"}</div>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="mt-1 text-lg font-medium">{user?.email || "—"}</div>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">Role</div>
                <div className="mt-1 text-lg font-medium">{user?.role || "CUSTOMER"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery preferences</CardTitle>
              <CardDescription>Customer-facing summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Use delivery creation to set pickup and destination details for each order.</p>
              <p>Payment is recorded using the server-side configured delivery fee and selected payment method.</p>
              <p>Customers can update pending deliveries before pickup and cancel prior to rider collection.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
