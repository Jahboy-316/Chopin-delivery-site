"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, PackageCheck } from "lucide-react";

import { DashboardShell } from "@/components/site-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { deliveryApi, paymentApi } from "@/lib/api";

const initialForm = {
  pickupAddress: "",
  pickupContactName: "",
  pickupContactPhone: "",
  deliveryAddress: "",
  recipientName: "",
  recipientPhone: "",
  description: "",
};

export default function NewDeliveryPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [method, setMethod] = useState("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdDelivery, setCreatedDelivery] = useState(null);

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const deliveryResponse = await deliveryApi.create(token, form);
      const paymentResponse = await paymentApi.create(token, {
        deliveryId: deliveryResponse.delivery.id,
        method,
      });
      setCreatedDelivery({ delivery: deliveryResponse.delivery, payment: paymentResponse.payment });
    } catch (submitError) {
      setError(submitError.message || "Unable to create the delivery.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardShell
        role="CUSTOMER"
        title="Create delivery"
        description="Submit pickup, destination, recipient, and payment details."
        actions={
          <Link href="/customer/deliveries">
            <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          </Link>
        }
      >
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {createdDelivery ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="h-6 w-6" />
                <CardTitle>Delivery created</CardTitle>
              </div>
              <CardDescription>Payment captured and the delivery is now visible to the admin and rider workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Reference</div>
                <div className="mt-1 text-lg font-medium">{createdDelivery.delivery.id}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Pickup</div>
                  <div className="font-medium">{createdDelivery.delivery.pickupAddress}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Destination</div>
                  <div className="font-medium">{createdDelivery.delivery.deliveryAddress}</div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Link href="/customer/deliveries">
                  <Button variant="outline">View history</Button>
                </Link>
                <Link href={`/customer/deliveries/${createdDelivery.delivery.id}`}>
                  <Button className="gap-2"><PackageCheck className="h-4 w-4" /> View delivery</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Delivery details</CardTitle>
              <CardDescription>All fields match the live backend validation rules.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress">Pickup address</Label>
                    <Input id="pickupAddress" value={form.pickupAddress} onChange={(event) => handleChange("pickupAddress", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupContactName">Pickup contact name</Label>
                    <Input id="pickupContactName" value={form.pickupContactName} onChange={(event) => handleChange("pickupContactName", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupContactPhone">Pickup contact phone</Label>
                    <Input id="pickupContactPhone" value={form.pickupContactPhone} onChange={(event) => handleChange("pickupContactPhone", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery address</Label>
                    <Input id="deliveryAddress" value={form.deliveryAddress} onChange={(event) => handleChange("deliveryAddress", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient name</Label>
                    <Input id="recipientName" value={form.recipientName} onChange={(event) => handleChange("recipientName", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientPhone">Recipient phone</Label>
                    <Input id="recipientPhone" value={form.recipientPhone} onChange={(event) => handleChange("recipientPhone", event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Delivery details</Label>
                  <Input id="description" value={form.description} onChange={(event) => handleChange("description", event.target.value)} placeholder="Optional details such as parcel type or instructions" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment method</Label>
                  <select id="paymentMethod" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={method} onChange={(event) => setMethod(event.target.value)}>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>

                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
                  Payment amount is set by the backend as <span className="font-medium text-foreground">₦5.00</span> and recorded for the delivery.
                </div>

                <div className="flex justify-end gap-3">
                  <Link href="/customer/deliveries"><Button type="button" variant="outline">Cancel</Button></Link>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? "Creating..." : "Create delivery"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
