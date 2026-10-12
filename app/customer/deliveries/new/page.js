"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  MapPin,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

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

const PAYMENT_OPTIONS = [
  { id: "CASH", label: "Cash on Delivery", icon: Banknote, desc: "Pay rider directly upon delivery" },
  { id: "CARD", label: "Debit / Credit Card", icon: CreditCard, desc: "Instant secure card verification" },
  { id: "TRANSFER", label: "Bank Transfer", icon: Landmark, desc: "Direct Nigerian bank transfer" },
];

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
        title="Send a Delivery"
        description="Fill in pickup and drop-off instructions to book an instant dispatch."
        actions={
          <Link href="/customer/deliveries">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" /> Cancel & Return
            </Button>
          </Link>
        }
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {createdDelivery ? (
          <Card className="border-emerald-200 bg-white max-w-2xl mx-auto shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <CardTitle className="text-2xl font-black text-gray-900">Delivery Booked Successfully!</CardTitle>
              <CardDescription className="text-gray-600">
                Your order is registered with payment recorded. A rider will be assigned immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-500 uppercase tracking-wider">Tracking Reference</span>
                  <span className="font-mono font-bold text-gray-900">{createdDelivery.delivery.id}</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-1 text-sm">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pickup Origin</span>
                    <div className="font-bold text-gray-900 mt-0.5">{createdDelivery.delivery.pickupAddress}</div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Destination</span>
                    <div className="font-bold text-gray-900 mt-0.5">{createdDelivery.delivery.deliveryAddress}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                  <span className="text-gray-500">Recorded Payment:</span>
                  <span className="font-bold text-emerald-700">₦{createdDelivery.payment?.amount || "5,000.00"} ({createdDelivery.payment?.method || method})</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Link href="/customer/deliveries" className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full rounded-xl font-semibold">
                    View All Deliveries
                  </Button>
                </Link>
                <Link href={`/customer/deliveries/${createdDelivery.delivery.id}`} className="flex-1 sm:flex-none">
                  <Button className="w-full gap-2 rounded-xl font-bold">
                    <PackageCheck className="h-4 w-4" /> Track Live Delivery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              {/* Form Input Sections */}
              <div className="space-y-6">
                {/* Section 1: Pickup Location */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold">
                        1
                      </div>
                      <CardTitle className="text-lg">Pickup Location & Sender</CardTitle>
                    </div>
                    <CardDescription>Where should our rider collect the package?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pickupAddress" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Pickup Address *
                      </Label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600" />
                        <Input
                          id="pickupAddress"
                          value={form.pickupAddress}
                          onChange={(e) => handleChange("pickupAddress", e.target.value)}
                          placeholder="e.g. 14 Broad Street, Lagos Island"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="pickupContactName" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Sender Contact Name *
                        </Label>
                        <Input
                          id="pickupContactName"
                          value={form.pickupContactName}
                          onChange={(e) => handleChange("pickupContactName", e.target.value)}
                          placeholder="Sender full name"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pickupContactPhone" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Sender Phone Number *
                        </Label>
                        <Input
                          id="pickupContactPhone"
                          value={form.pickupContactPhone}
                          onChange={(e) => handleChange("pickupContactPhone", e.target.value)}
                          placeholder="+234 800 000 0000"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Destination & Recipient */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold">
                        2
                      </div>
                      <CardTitle className="text-lg">Delivery Destination & Recipient</CardTitle>
                    </div>
                    <CardDescription>Who is receiving this parcel?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="deliveryAddress" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Delivery Address *
                      </Label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-orange-600" />
                        <Input
                          id="deliveryAddress"
                          value={form.deliveryAddress}
                          onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                          placeholder="e.g. 25 Admiralty Way, Lekki Phase 1"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="recipientName" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Recipient Name *
                        </Label>
                        <Input
                          id="recipientName"
                          value={form.recipientName}
                          onChange={(e) => handleChange("recipientName", e.target.value)}
                          placeholder="Recipient full name"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="recipientPhone" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Recipient Phone *
                        </Label>
                        <Input
                          id="recipientPhone"
                          value={form.recipientPhone}
                          onChange={(e) => handleChange("recipientPhone", e.target.value)}
                          placeholder="+234 800 000 0000"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Package Details & Instructions */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-purple-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold">
                        3
                      </div>
                      <CardTitle className="text-lg">Parcel Description & Instructions</CardTitle>
                    </div>
                    <CardDescription>Optional details to help your rider handle the delivery safely.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Package Details (Optional)
                      </Label>
                      <Input
                        id="description"
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="e.g. Documents in sealed envelope, fragile, or gate code #42"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4: Payment Method */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-sky-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold">
                        4
                      </div>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                    </div>
                    <CardDescription>Select how this delivery fee will be settled.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {PAYMENT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = method === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setMethod(opt.id)}
                            className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-2 rounded-xl ${isSelected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-emerald-600 bg-emerald-600" : "border-gray-300"}`}>
                                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </span>
                            </div>
                            <span className="font-bold text-xs sm:text-sm text-gray-900">{opt.label}</span>
                            <span className="text-[11px] text-gray-500 mt-0.5 leading-snug">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Summary Column */}
              <div className="space-y-6">
                <Card className="sticky top-20 border-gray-200 bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                    <CardDescription>Instant delivery cost estimate</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Standard delivery fee</span>
                        <span className="font-semibold text-gray-900">₦5,000.00</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Rider dispatch fee</span>
                        <span className="font-semibold text-emerald-700">Included</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Real-time tracking</span>
                        <span className="font-semibold text-emerald-700">Free</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                        <span className="font-bold text-gray-900 text-base">Total payable</span>
                        <span className="text-2xl font-black text-gray-900">₦5,000.00</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
                      <div className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Chopin Guarantee
                      </div>
                      <p>
                        Payment records automatically upon submission. Cash, card, or transfer choices are reflected in your invoice.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl font-bold py-6 text-base gap-2 shadow-sm"
                    >
                      {isSubmitting ? "Dispatching Rider..." : "Confirm & Send Delivery"}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
