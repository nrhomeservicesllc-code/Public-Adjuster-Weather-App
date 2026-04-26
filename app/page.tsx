"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  MapPin, Zap, FileText, Bell, Shield, BarChart3,
  ChevronRight, Check, Menu, X, Star, ArrowRight,
  Smartphone, Monitor, Tablet, Globe
} from "lucide-react"
import { ClaimCastIcon, ClaimCastWordmark } from "@/components/ClaimCastLogo"

const LandingMapPreview = dynamic(
  () => import("@/components/landing/LandingMapPreview").then((m) => ({ default: m.LandingMapPreview })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 shadow-xl" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <ClaimCastWordmark />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Platforms"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-white/10 px-4 pb-4">
          {["Features", "How It Works", "Pricing", "Platforms"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-slate-300 hover:text-white border-b border-white/5 font-medium"
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/login" className="text-center py-3 text-slate-300 font-medium">Sign In</Link>
            <Link href="/register" className="text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold">
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── App Mockup (CSS illustration) ──────────────────────────────────────────
function AppMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow behind mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-3xl blur-3xl" />

      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
        {/* Browser chrome */}
        <div className="bg-[#1E293B] px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 bg-[#0F172A] rounded-lg h-7 flex items-center px-3 gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
            <span className="text-xs text-slate-400 font-mono">app.claimcast.com</span>
          </div>
        </div>

        {/* App UI */}
        <div className="flex" style={{ height: 360 }}>
          {/* Sidebar */}
          <div className="w-14 bg-[#0A0F1E] flex flex-col items-center py-4 gap-5 border-r border-white/5 flex-shrink-0">
            <ClaimCastIcon size={28} />
            <div className="w-8 h-8 rounded-lg bg-blue-600/80 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Bell className="h-4 w-4 text-slate-400" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Map area — real Leaflet map with CartoDB tiles */}
          <div className="flex-1 relative overflow-hidden">
            <LandingMapPreview />

            {/* Active alert card overlay */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 text-xs shadow-lg z-[400]" style={{ width: 155 }}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-slate-800 font-bold">3 Active Alerts</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Tornado Warning", color: "text-red-500" },
                  { label: "Hail Advisory", color: "text-orange-500" },
                  { label: "Flash Flood Watch", color: "text-blue-500" },
                ].map((a) => (
                  <div key={a.label} className={`${a.color} text-[10px] flex items-center gap-1 font-medium`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {a.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom filter bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-3 py-2 flex items-center gap-2 z-[400]">
              {[
                { label: "Hail", cls: "bg-orange-100 text-orange-600 border border-orange-200" },
                { label: "Tornado", cls: "bg-red-100 text-red-600 border border-red-200" },
                { label: "Wind", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
                { label: "Flood", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
              ].map((t) => (
                <span key={t.label} className={`text-[10px] px-2 py-1 rounded-full font-semibold ${t.cls}`}>{t.label}</span>
              ))}
              <span className="ml-auto text-[10px] text-slate-500 font-medium">10 events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat cards */}
      <div className="absolute -left-6 top-1/3 bg-[#0F172A] border border-white/10 rounded-2xl p-3 shadow-2xl hidden lg:block">
        <div className="text-2xl font-black text-white">47</div>
        <div className="text-xs text-slate-400">Storm events</div>
        <div className="text-xs text-green-400 font-medium mt-1">↑ Live data</div>
      </div>
      <div className="absolute -right-6 bottom-1/4 bg-[#0F172A] border border-white/10 rounded-2xl p-3 shadow-2xl hidden lg:block">
        <div className="text-2xl font-black text-white">3.2M</div>
        <div className="text-xs text-slate-400">Acres tracked</div>
        <div className="text-xs text-blue-400 font-medium mt-1">Florida</div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-8 text-sm text-blue-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Live NWS + NOAA data · Updated in real time
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-none tracking-tight mb-6">
              <span className="text-white">Storm</span>
              <br />
              <span style={{
                background: "linear-gradient(135deg, #60A5FA 0%, #22D3EE 60%, #A78BFA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Intelligence.
              </span>
              <br />
              <span className="text-white">Cast to You.</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
              The only platform built for public adjusters. Track hail, tornadoes, flooding,
              and hurricane damage in real time — then generate professional PDF reports and
              close more claims, faster.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-all shadow-xl shadow-blue-500/30 text-base"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-base"
              >
                Sign In
              </Link>
            </div>

            <p className="text-sm text-slate-500">
              No credit card required · Free 14-day trial · Cancel anytime
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 mt-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-slate-400">Trusted by public adjusters across Florida</span>
            </div>
          </div>

          {/* Right: App mockup */}
          <div className="w-full">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: "Real-Time", label: "NWS Alert Data", sub: "Updates every 15 min" },
            { value: "30 Days", label: "Storm History", sub: "NOAA NCEI database" },
            { value: "8 Types", label: "Storm Categories", sub: "Hail · Tornado · Wind · More" },
            { value: "1-Click", label: "PDF Reports", sub: "Professional & court-ready" },
          ].map(({ value, label, sub }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-sm font-semibold text-slate-300">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-600/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-5 text-sm text-cyan-300 font-medium">
            <Zap className="h-3.5 w-3.5" /> Everything you need in one platform
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Built for how adjusters<br />
            <span style={{ background: "linear-gradient(135deg,#60A5FA,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              actually work
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Stop wasting time cross-referencing weather sites. ClaimCast puts every data source you need in one professional dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: MapPin,
              color: "from-blue-600 to-blue-700",
              glow: "blue",
              title: "Live Storm Map",
              desc: "Interactive map overlays NWS active alerts and NOAA historical events with color-coded storm type markers and impact radius circles.",
            },
            {
              icon: Bell,
              color: "from-red-600 to-orange-600",
              glow: "red",
              title: "Real-Time NWS Alerts",
              desc: "Tornado warnings, hurricane watches, flood advisories — all pulled live from the National Weather Service the moment they're issued.",
            },
            {
              icon: BarChart3,
              color: "from-cyan-600 to-teal-600",
              glow: "cyan",
              title: "Impact Radius Analysis",
              desc: "See exactly how far each storm's damage reached, scaled by wind speed, hail size, and EF rating. Know which neighborhoods were hit hardest.",
            },
            {
              icon: FileText,
              color: "from-violet-600 to-purple-700",
              glow: "violet",
              title: "Instant PDF Reports",
              desc: "Generate court-ready storm exposure reports with a single click. Includes event table, affected locations, sources, and legal disclaimer.",
            },
            {
              icon: Shield,
              color: "from-emerald-600 to-green-700",
              glow: "emerald",
              title: "Save & Prospect Areas",
              desc: "Bookmark neighborhoods you're working, flag prospecting targets, and add private notes visible only to you.",
            },
            {
              icon: Globe,
              color: "from-amber-500 to-orange-600",
              glow: "amber",
              title: "Works Everywhere",
              desc: "Fully responsive across iPhone, iPad, Android, Mac, Windows, and Linux — no app download required. Works in any modern browser.",
            },
          ].map(({ icon: Icon, color, glow, title, desc }) => (
            <div
              key={title}
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 cursor-default"
            >
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-${glow}-600/5 to-transparent pointer-events-none`} />
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} mb-4 shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              From storm to claim in{" "}
              <span style={{ background: "linear-gradient(135deg,#60A5FA,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                minutes
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines - desktop only */}
            <div className="absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-500/50 to-cyan-500/50 hidden md:block" />

            {[
              { step: "01", icon: MapPin, title: "Search your area", desc: "Type any Florida city, county, or ZIP code. The map instantly flies to that location and loads all storm events in the last 30 days." },
              { step: "02", icon: BarChart3, title: "Analyze storm events", desc: "See color-coded markers for hail, tornadoes, wind, and flooding. Click any event to see wind speeds, hail size, EF ratings, and source data." },
              { step: "03", icon: FileText, title: "Export your report", desc: "Hit 'Save Report' on any event to generate a professional PDF with all storm data, sources, and legal disclaimers included automatically." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mb-5 shadow-lg shadow-blue-500/30">
                  <Icon className="h-7 w-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center text-xs font-black text-cyan-400">
                    {step.slice(1)}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Simple pricing</h2>
          <p className="text-slate-400 text-lg">Start free. Upgrade when you&apos;re ready to scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Starter */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Starter</div>
            <div className="text-5xl font-black text-white mb-1">Free</div>
            <div className="text-slate-500 text-sm mb-8">Forever free · No card needed</div>
            <ul className="space-y-3 mb-8">
              {[
                "Live NWS alerts on the map",
                "7-day storm event history",
                "3 saved areas",
                "5 PDF reports per month",
                "All storm categories",
                "Search any FL location",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-b from-blue-600/20 to-cyan-600/10 border border-blue-500/40 rounded-2xl p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black px-4 py-1 rounded-full">
              MOST POPULAR
            </div>
            <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Pro</div>
            <div className="flex items-end gap-1 mb-1">
              <div className="text-5xl font-black text-white">$49</div>
              <div className="text-slate-400 mb-2">/month</div>
            </div>
            <div className="text-slate-400 text-sm mb-8">Billed monthly · Cancel anytime</div>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Starter",
                "30-day storm event history",
                "Unlimited saved areas",
                "Unlimited PDF reports",
                "CSV data export",
                "Priority email support",
                "Early access to new features",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                  <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
              Start Free Trial
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Need a team plan?{" "}
          <a href="mailto:hello@claimcast.com" className="text-blue-400 hover:underline">Contact us</a>
          {" "}for enterprise pricing.
        </p>
      </section>

      {/* ── PLATFORMS ── */}
      <section id="platforms" className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Works on every device you own
          </h2>
          <p className="text-slate-400 mb-12 text-lg">
            No app store. No download. Just open your browser and go — on any device, any OS.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-12">
            {[
              { icon: Smartphone, label: "iPhone", sub: "iOS 15+" },
              { icon: Tablet, label: "iPad", sub: "iPadOS 15+" },
              { icon: Smartphone, label: "Android", sub: "Chrome / Firefox" },
              { icon: Monitor, label: "Windows", sub: "All versions" },
              { icon: Monitor, label: "macOS", sub: "Safari / Chrome" },
              { icon: Globe, label: "Linux", sub: "Any browser" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-2">
                <Icon className="h-7 w-7 text-slate-300" />
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-xs text-slate-500">{sub}</div>
              </div>
            ))}
          </div>

          {/* PWA callout */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl px-6 py-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Progressive Web App</div>
              <div className="text-xs text-slate-400">Add ClaimCast to your home screen for an app-like experience on iPhone, iPad, and Android.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ClaimCastIcon size={56} className="mx-auto mb-6" />
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-5 tracking-tight">
            Ready to find<br />
            <span style={{ background: "linear-gradient(135deg,#60A5FA,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              more claims?
            </span>
          </h2>
          <p className="text-slate-400 text-xl mb-10">
            Join public adjusters using ClaimCast to work smarter, close faster, and stay ahead of the storm.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-all shadow-2xl shadow-blue-500/30 text-lg"
            >
              Start Free Trial
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-lg"
            >
              Sign In
            </Link>
          </div>
          <p className="text-slate-600 text-sm mt-6">No credit card · Free 14-day trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div className="max-w-xs">
              <ClaimCastWordmark className="mb-3" />
              <p className="text-slate-500 text-sm leading-relaxed">
                Storm intelligence platform for public adjusters. Real-time NWS alerts + NOAA historical storm data in one dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="font-semibold text-white mb-3">Product</div>
                <ul className="space-y-2 text-slate-500">
                  <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-white mb-3">Data</div>
                <ul className="space-y-2 text-slate-500">
                  <li><span>NWS Alerts</span></li>
                  <li><span>NOAA NCEI</span></li>
                  <li><span>Storm Events DB</span></li>
                  <li><span>FL Coverage</span></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-white mb-3">Legal</div>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="mailto:hello@claimcast.com" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} ClaimCast. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Data sourced from{" "}
              <a href="https://www.weather.gov" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">NWS</a>
              {" "}and{" "}
              <a href="https://www.ncei.noaa.gov" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">NOAA NCEI</a>
              . Storm exposure data only — does not confirm property damage.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
