"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPinned, ShieldCheck, Truck, WalletCards } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MapPinned, title: "Fast local delivery", description: "Track pickups, destinations, and assigned riders in one clear flow." },
  { icon: Truck, title: "Rider visibility", description: "Open jobs, assignment flow, and status updates built for busy delivery teams." },
  { icon: WalletCards, title: "Simple payments", description: "Record customer payment preferences and clearly view payment results when they land." },
  { icon: ShieldCheck, title: "Trust and safety", description: "Role-aware access and account status checks keep operations protected." },
];

export default function HomePage() {
  const { user } = useAuth();

  const destination = user?.role === "CUSTOMER" ? "/customer" : user?.role === "RIDER" ? "/rider" : user?.role === "ADMIN" ? "/admin" : "/login";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-shell py-6">
        <header className="rounded-full border border-border bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">C</div>
              <div>
                <div className="text-lg font-semibold">Chopin</div>
                <div className="text-xs text-muted-foreground">Delivery network</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Log in</Link>
              <Link href={destination}>
                <Button>{user ? "Go to dashboard" : "Get started"}</Button>
              </Link>
            </div>
          </div>
        </header>
      </div>

      <section className="container-shell py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
              Local delivery, reimagined
            </div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Faster deliveries for the people you trust.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Chopin connects customers, riders, and businesses in one fluid delivery system built for speed, clarity, and careful handoff.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg">Create account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Sign in</Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl font-semibold text-foreground">1.2k+</div>
                <div>deliveries</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">18 min</div>
                <div>avg. response</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">4.9/5</div>
                <div>service rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className="rounded-[32px] border border-border bg-card p-5 shadow-soft">
            <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary/10 via-white to-orange-50 p-6">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-xl font-semibold">In transit</div>
                </div>
                <div className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">On time</div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-border bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pickup</div>
                  <div className="mt-2 text-lg font-medium">10 Market Street</div>
                  <div className="text-sm text-muted-foreground">Jordan Rider · 4 min away</div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destination</div>
                  <div className="mt-2 text-lg font-medium">25 River Road</div>
                  <div className="text-sm text-muted-foreground">Recipient: Sam Recipient</div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <div>
                  <div className="text-sm text-muted-foreground">Payment</div>
                  <div className="text-xl font-semibold">₦5.00</div>
                </div>
                <div className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">Card</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold">{title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell pb-12">
        <div className="rounded-[32px] border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-3xl font-semibold">Built for actual delivery operations</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            The app adapts by role, with customer delivery creation, rider assignment flow, and admin oversight working against the live backend API.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href={destination}>
              <Button size="lg" className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
