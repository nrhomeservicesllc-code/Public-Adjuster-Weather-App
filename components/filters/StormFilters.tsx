"use client"

import { useState } from "react"
import { Filter, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMapStore } from "@/store/mapStore"
import { STORM_COLORS } from "@/lib/stormColors"
import { cn } from "@/lib/utils"
import type { StormType, DateRange, Severity } from "@/types"

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "24h", value: "24h" },
  { label: "3 days", value: "3d" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
]

const SEVERITIES: { label: string; value: Severity; color: string }[] = [
  { label: "Low", value: "LOW", color: "bg-green-500" },
  { label: "Moderate", value: "MODERATE", color: "bg-yellow-500" },
  { label: "High", value: "HIGH", color: "bg-orange-500" },
  { label: "Extreme", value: "EXTREME", color: "bg-red-600" },
]

export function StormFilters() {
  const [open, setOpen] = useState(false)
  const { filters, setFilters, resetFilters } = useMapStore()

  const toggleStormType = (type: StormType) => {
    const current = filters.stormTypes
    setFilters({
      stormTypes: current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    })
  }

  const toggleSeverity = (sev: Severity) => {
    const current = filters.severities
    setFilters({
      severities: current.includes(sev)
        ? current.filter((s) => s !== sev)
        : [...current, sev],
    })
  }

  const activeFiltersCount =
    (filters.stormTypes.length > 0 ? 1 : 0) +
    (filters.severities.length > 0 ? 1 : 0) +
    (filters.dateRange !== "7d" ? 1 : 0)

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "absolute top-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-colors",
          open
            ? "bg-blue-700 text-white"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
        )}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-1 bg-white text-blue-700 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {open && (
        <div className="absolute top-14 right-3 z-[400] bg-white rounded-xl shadow-xl border border-slate-200 w-72 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-900">Filter Storm Data</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* Date Range */}
            <div>
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">
                Date Range
              </Label>
              <div className="grid grid-cols-4 gap-1">
                {DATE_RANGES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setFilters({ dateRange: value })}
                    className={cn(
                      "py-1.5 text-xs rounded-md font-medium transition-colors",
                      filters.dateRange === value
                        ? "bg-blue-700 text-white"
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
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">
                Storm Types
              </Label>
              <div className="space-y-1.5">
                {Object.entries(STORM_COLORS).map(([key, val]) => {
                  const type = key as StormType
                  const active = filters.stormTypes.includes(type)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleStormType(type)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                        active
                          ? "bg-slate-100 font-semibold"
                          : "hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: val.fill }}
                      />
                      {val.label}
                      {active && (
                        <span className="ml-auto text-blue-600 text-xs">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Severity */}
            <div>
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">
                Severity
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {SEVERITIES.map(({ label, value, color }) => {
                  const active = filters.severities.includes(value)
                  return (
                    <button
                      key={value}
                      onClick={() => toggleSeverity(value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                        active ? "ring-2 ring-blue-500 bg-slate-50" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                      )}
                    >
                      <span className={cn("w-2.5 h-2.5 rounded-full", color)} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-alerts" className="text-sm text-slate-700">
                  Show NWS Alerts
                </Label>
                <Switch
                  id="show-alerts"
                  checked={filters.showAlerts}
                  onCheckedChange={(v) => setFilters({ showAlerts: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-events" className="text-sm text-slate-700">
                  Show Storm Events
                </Label>
                <Switch
                  id="show-events"
                  checked={filters.showStormEvents}
                  onCheckedChange={(v) => setFilters({ showStormEvents: v })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
