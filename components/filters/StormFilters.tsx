"use client"

import { useState } from "react"
import { Filter, X, RotateCcw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMapStore } from "@/store/mapStore"
import { STORM_COLORS } from "@/lib/stormColors"
import { cn } from "@/lib/utils"
import type { StormType, DateRange, Severity } from "@/types"

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "24h",     value: "24h" },
  { label: "3 days",  value: "3d"  },
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "6 months", value: "6mo" },
]

const SEVERITIES: { label: string; value: Severity; color: string }[] = [
  { label: "Low",      value: "LOW",      color: "bg-green-500"  },
  { label: "Moderate", value: "MODERATE", color: "bg-yellow-500" },
  { label: "High",     value: "HIGH",     color: "bg-orange-500" },
  { label: "Extreme",  value: "EXTREME",  color: "bg-red-600"    },
]

// ─── Shared filter content (used in both mobile sheet and desktop panel) ──────
function FilterContent({ onClose }: { onClose: () => void }) {
  const { filters, setFilters, resetFilters } = useMapStore()

  const toggleStormType = (type: StormType) => {
    const cur = filters.stormTypes
    setFilters({ stormTypes: cur.includes(type) ? cur.filter((t) => t !== type) : [...cur, type] })
  }

  const toggleSeverity = (sev: Severity) => {
    const cur = filters.severities
    setFilters({ severities: cur.includes(sev) ? cur.filter((s) => s !== sev) : [...cur, sev] })
  }

  return (
    <div className="space-y-5">
      {/* Date Range */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Range</p>
        <div className="grid grid-cols-3 gap-1.5">
          {DATE_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilters({ dateRange: value })}
              className={cn(
                "py-2 text-xs rounded-lg font-semibold transition-colors",
                filters.dateRange === value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Storm Types */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storm Types</p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(STORM_COLORS).map(([key, val]) => {
            const type = key as StormType
            const active = filters.stormTypes.includes(type)
            return (
              <button
                key={key}
                onClick={() => toggleStormType(type)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                  active
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: val.fill }} />
                {val.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Severity */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Severity</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SEVERITIES.map(({ label, value, color }) => {
            const active = filters.severities.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggleSeverity(value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active ? "ring-2 ring-blue-500 bg-blue-50 text-blue-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color)} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <Label htmlFor="sw-alerts" className="text-sm text-slate-700 font-medium">Show NWS Alerts</Label>
          <Switch
            id="sw-alerts"
            checked={filters.showAlerts}
            onCheckedChange={(v) => setFilters({ showAlerts: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sw-events" className="text-sm text-slate-700 font-medium">Show Storm Events</Label>
          <Switch
            id="sw-events"
            checked={filters.showStormEvents}
            onCheckedChange={(v) => setFilters({ showStormEvents: v })}
          />
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => { resetFilters(); onClose() }}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset all filters
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function StormFilters() {
  const [open, setOpen] = useState(false)
  const { filters } = useMapStore()

  const activeCount =
    (filters.stormTypes.length > 0 ? 1 : 0) +
    (filters.severities.length > 0 ? 1 : 0) +
    (filters.dateRange !== "30d" ? 1 : 0)

  const badge = activeCount > 0 && (
    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black">
      {activeCount}
    </span>
  )

  return (
    <>
      {/* ── MOBILE: floating pill button above bottom nav ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "md:hidden fixed bottom-[72px] right-4 z-[900] flex items-center gap-2 px-4 py-3 rounded-full shadow-xl font-semibold text-sm transition-colors",
          open
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-700 border border-slate-200"
        )}
      >
        <Filter className="h-4 w-4" />
        Filters
        {badge}
      </button>

      {/* ── MOBILE: Bottom sheet ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[1000] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[82vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-900">Filter Storm Data</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 pb-8">
              <FilterContent onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP: floating button on map ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hidden md:flex absolute top-3 right-3 z-[400] items-center gap-1.5 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-colors",
          open
            ? "bg-blue-700 text-white"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
        )}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-0.5 bg-white text-blue-700 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── DESKTOP: floating panel ── */}
      {open && (
        <div className="hidden md:block absolute top-14 right-3 z-[400] bg-white rounded-xl shadow-xl border border-slate-200 w-72 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-900">Filter Storm Data</h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <FilterContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
