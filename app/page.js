"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bike,
  Compass,
  CreditCard,
  Package,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Instant Dispatch",
    description: "Request a pickup in seconds. Our dispatch engine matches available nearby riders right away.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    icon: Compass,
    title: "Live Order Tracking",
    description: "Watch every stage from order confirmation, package pickup, transit, to doorstep drop-off.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    icon: WalletCards,
    title: "Transparent Payments",
    description: "Support for Cash, Card, and Bank Transfer with instant receipt generation and zero hidden fees.",
    color: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    icon: ShieldCheck,
    title: "Trusted & Safe Handoffs",
    description: "Verified rider fleet and contact verification for pickup and recipient peace of mind.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Enter details",
    description: "Provide pickup and destination addresses, recipient contact, and optional parcel notes.",
  },
  {
    step: "02",
    title: "Rider dispatched",
    description: "Our system assigns a dedicated rider who confirms and heads straight to the pickup point.",
  },
  {
    step: "03",
    title: "Track journey",
    description: "Receive live milestone updates as the rider picks up and delivers the package safely.",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  const destination =
    user?.role === "CUSTOMER"
      ? "/customer"
      : user?.role === "RIDER"
        ? "/rider"
        : user?.role === "ADMIN"
          ? "/admin"
          : "/login";

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#111827]">
      {/* Top Banner Navigation */}
      <div className="container-shell pt-4 pb-2">
        <header className="rounded-2xl border border-gray-200/90 bg-white/95 px-5 py-3.5 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xl shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 block leading-tight">
                  Chopin
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block leading-none">
                  Express Delivery
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
              <a href="#features" className="hover:text-emerald-700 transition-colors">Why Chopin</a>
              <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How it works</a>
              <a href="#portals" className="hover:text-emerald-700 transition-colors">Portals</a>
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {!user ? (
                <>
                  <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-emerald-700 px-3 py-2 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="rounded-xl px-4 font-semibold">
                      Get started
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={destination}>
                  <Button size="sm" className="rounded-xl px-4 font-semibold gap-1.5">
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="container-shell py-12 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Chowdeck & Uber Eats Inspired Speed</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
              Swift, seamless deliveries across town.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
              From business parcels to personal packages, Chopin connects customers with professional riders for fast, verifiable deliveries with transparent pricing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link href={user ? destination : "/register"}>
                <Button size="lg" className="rounded-xl font-bold shadow-md gap-2">
                  <span>{user ? "Go to my dashboard" : "Send a package now"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-xl font-semibold">
                  Sign in
                </Button>
              </Link>
            </div>

            {/* Social Proof Counters */}
            <div className="mt-12 pt-8 border-t border-gray-200/80 grid grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">1,200+</div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Parcels Delivered</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">18 min</div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Avg. Delivery</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">4.9 / 5</div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Customer Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Hero Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-soft relative"
          >
            {/* Top Status Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50/80 border border-emerald-100 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Bike className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-900">Live Delivery Active</div>
                  <div className="text-[11px] text-emerald-700">Rider on the way • 4 mins away</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-2.5 py-1 text-xs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                In Transit
              </span>
            </div>

            {/* Simulated Route Card */}
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 relative">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    A
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pickup Location</span>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">14 Marina Street, Lagos Island</div>
                    <div className="text-xs text-gray-500 mt-0.5">Sender: Tunde Adeleke • +234 801 234 5678</div>
                  </div>
                </div>

                {/* Connecting track line */}
                <div className="my-2 ml-3 h-5 border-l-2 border-dashed border-emerald-400" />

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs">
                    B
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivery Destination</span>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">42 Admiralty Way, Lekki Phase 1</div>
                    <div className="text-xs text-gray-500 mt-0.5">Recipient: Chioma Eze • +234 809 876 5432</div>
                  </div>
                </div>
              </div>

              {/* Rider Snapshot */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-800 font-bold text-sm">
                    JA
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Jamiu Adebayo</div>
                    <div className="text-xs text-gray-500">Yamaha 125cc • Chopin Fleet ★ 4.95</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 bg-emerald-50/40 p-4">
                <div>
                  <div className="text-xs text-gray-500">Standard Delivery Fee</div>
                  <div className="text-xl font-black text-gray-900 mt-0.5">₦5,000.00</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-white border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> Card Payment
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role Portals Shortcut Section */}
      <section id="portals" className="container-shell pb-16">
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Multi-Role Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
              One connected ecosystem for everyone
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Whether you are sending a package, delivering on two wheels, or overseeing platform operations.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Customer Box */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 flex flex-col justify-between hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4 font-bold">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Customers</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Request pickups anytime, input custom handling notes, track rider progress live, and review past receipts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Self-registration open</span>
                <Link href="/register">
                  <Button size="sm" variant="outline" className="rounded-xl font-bold">
                    Start sending
                  </Button>
                </Link>
              </div>
            </div>

            {/* Rider Box */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 flex flex-col justify-between hover:border-orange-200 hover:bg-orange-50/30 transition-all">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-800 mb-4 font-bold">
                  <Bike className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Riders</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Toggle availability when on duty, view available jobs, accept routes, and advance delivery statuses in real-time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-700">Rider fleet access</span>
                <Link href="/login">
                  <Button size="sm" variant="outline" className="rounded-xl font-bold">
                    Rider portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Admin Box */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/30 transition-all">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-800 mb-4 font-bold">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Admins</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Full operations dashboard: monitor total users, rider availability, dispatch assignments, and payment settlements.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700">Platform control</span>
                <Link href="/login">
                  <Button size="sm" variant="outline" className="rounded-xl font-bold">
                    Admin login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container-shell pb-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Features</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Engineered for high reliability
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Built from the ground up to handle demanding city delivery operations.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:shadow-sm transition-all"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container-shell pb-20">
        <div className="rounded-3xl border border-gray-200/90 bg-emerald-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Simple Workflow</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Deliveries delivered in three easy steps
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mt-2">
              We have eliminated clutter so you can get things moved fast.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="rounded-2xl border border-emerald-700/60 bg-emerald-800/40 p-6 backdrop-blur-sm">
                <span className="text-2xl font-black text-emerald-400">{item.step}</span>
                <h3 className="text-lg font-bold text-white mt-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-emerald-700/60">
            <div className="text-sm text-emerald-200">
              Ready to send your first delivery parcel?
            </div>
            <Link href={user ? destination : "/register"}>
              <Button size="lg" className="rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-md">
                Get started today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
