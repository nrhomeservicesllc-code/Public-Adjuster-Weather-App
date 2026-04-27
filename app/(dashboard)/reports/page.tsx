"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { FileText, Download, Trash2, Map, Clock, AlertTriangle, Home, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Report } from "@/types"

// Leaflet needs to be client-only
const ReportMiniMap = dynamic(
  () => import("@/components/reports/ReportMiniMap").then((m) => ({ default: m.ReportMiniMap })),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl" /> }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse storm type keyword from areaName like "Hail — Miami" → "HAIL" */
function parseStormType(areaName: string): string {
  const label = (areaName.split(/[—–-]/)[0] ?? "").trim().toLowerCase()
  if (label.includes("tornado")) return "TORNADO"
  if (label.includes("hurricane")) return "HURRICANE"
  if (label.includes("tropical")) return "TROPICAL_STORM"
  if (label.includes("hail")) return "HAIL"
  if (label.includes("wind")) return "WIND"
  if (label.includes("flood")) return "FLOOD"
  if (label.includes("rain")) return "RAIN"
  if (label.includes("thunder")) return "THUNDERSTORM"
  return "THUNDERSTORM"
}

/** Parse severity from summary text ("Severity: HIGH") or infer from name */
function parseSeverity(summary: string | null | undefined, areaName: string): string {
  if (summary) {
    const m = summary.match(/severity[:\s]+([A-Z]+)/i)
    if (m) return m[1].toUpperCase()
  }
  const name = areaName.toLowerCase()
  if (name.includes("tornado") || name.includes("hurricane") || name.includes("extreme")) return "EXTREME"
  if (name.includes("warning") || name.includes("high")) return "HIGH"
  return "MODERATE"
}

/** Impact radius in meters based on storm type and severity */
function impactRadiusM(stormType: string, severity: string): number {
  const base: Record<string, number> = {
    TORNADO: 3000, HURRICANE: 40000, TROPICAL_STORM: 22000,
    HAIL: 5000, WIND: 5000, FLOOD: 7000, RAIN: 5000, THUNDERSTORM: 5000,
  }
  let r = base[stormType] ?? 5000
  if (severity === "EXTREME") r *= 1.8
  else if (severity === "HIGH") r *= 1.4
  return r
}

/** Estimate homes affected. Florida avg ~1,200 housing units per sq mile. */
function estimateHomes(radiusM: number): string {
  const radiusMi = radiusM / 1609.34
  const homes = Math.round(Math.PI * radiusMi * radiusMi * 1200)
  if (homes >= 1_000_000) return `${(homes / 1_000_000).toFixed(1)}M`
  if (homes >= 1_000) return `${Math.round(homes / 1_000)}k`
  return homes.toString()
}

const SEV_STYLE: Record<string, string> = {
  EXTREME:  "bg-red-100 text-red-700 border border-red-200",
  HIGH:     "bg-orange-100 text-orange-700 border border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  LOW:      "bg-slate-100 text-slate-600 border border-slate-200",
}

/** Extract [lat, lng] from a report's geoJson, or null */
function getCenter(geoJson: unknown): [number, number] | null {
  try {
    const geo = geoJson as { type: string; coordinates: number[] | number[][][] }
    if (geo.type === "Point") {
      const [lng, lat] = geo.coordinates as number[]
      return [lat, lng]
    }
    if (geo.type === "Polygon") {
      const ring = (geo.coordinates as number[][][])[0]
      const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
      const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      return [lat, lng]
    }
  } catch { /* empty */ }
  return null
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setReports(data) : setReports([]))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return
    setDeleting(id)
    try {
      await fetch(`/api/reports/${id}`, { method: "DELETE" })
      setReports((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const viewOnMap = (report: Report) => {
    const center = getCenter(report.geoJson)
    if (!center) return
    const [lat, lng] = center
    const eid = report.stormEventIds[0] ?? ""
    const aid = report.alertIds[0] ?? ""
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), zoom: "12" })
    if (eid) params.set("eid", eid)
    else if (aid) params.set("aid", aid)
    router.push(`/map?${params}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Previous Reports</h1>
          <p className="text-sm text-slate-500">
            {reports.length} storm report{reports.length !== 1 ? "s" : ""} — saved from the map or auto-archived
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong>Disclaimer:</strong> Reports reflect storm exposure data only. They do not confirm
          property damage. Always conduct a proper on-site inspection before making property damage claims.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-lg">No previous reports yet</p>
          <p className="text-sm mt-1">
            Click a storm event on the map and press <strong>&quot;Save to Previous Reports&quot;</strong> to archive it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const center = getCenter(report.geoJson)
            const stormType = parseStormType(report.areaName)
            const severity = parseSeverity(report.summary, report.areaName)
            const radiusM = impactRadiusM(stormType, severity)
            const homes = estimateHomes(radiusM)
            const radiusMiLabel = (radiusM / 1609.34).toFixed(1)

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Mini Map */}
                  {center && (
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
                      <ReportMiniMap
                        lat={center[0]}
                        lng={center[1]}
                        stormType={stormType}
                        radiusM={radiusM}
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 p-5 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate">{report.areaName}</h3>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(report.generatedAt, "long")}
                          </span>
                          {report.stormEventIds.length > 0 && (
                            <span className="text-xs text-blue-600 font-semibold">
                              {report.stormEventIds.length} storm event{report.stormEventIds.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {report.alertIds.length > 0 && (
                            <span className="text-xs text-red-600 font-semibold">
                              {report.alertIds.length} NWS alert{report.alertIds.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Severity badge */}
                      <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${SEV_STYLE[severity] ?? SEV_STYLE.MODERATE}`}>
                        {severity}
                      </span>
                    </div>

                    {/* Impact stats */}
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 leading-none">Impact Radius</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">{radiusMiLabel} mi</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <Home className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 leading-none">Est. Homes Affected</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">~{homes}</div>
                        </div>
                      </div>
                    </div>

                    {report.summary && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">{report.summary}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {center && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => viewOnMap(report)}
                        >
                          <Map className="h-3.5 w-3.5 text-blue-600" />
                          View on Map
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => window.open(`/api/reports/${report.id}/pdf`, "_blank")}
                      >
                        <Download className="h-3.5 w-3.5 text-green-600" />
                        Download PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                        disabled={deleting === report.id}
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
