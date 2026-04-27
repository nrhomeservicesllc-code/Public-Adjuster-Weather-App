"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Newspaper, Wind, Droplets, RefreshCw, MapPin,
  ExternalLink, Clock, ChevronDown, ChevronUp,
  AlertTriangle, Zap, Map, Radio
} from "lucide-react"
import { getStormColor } from "@/lib/stormColors"
import { formatDate } from "@/lib/utils"
import { searchFLLocations } from "@/lib/florida-locations"
import type { StormEvent, NWSAlert } from "@/types"

// ─── Types ────────────────────────────────────────────────────────────────────
type FeedItem =
  | { kind: "event"; data: StormEvent }
  | { kind: "alert"; data: NWSAlert }

function itemDate(item: FeedItem) {
  return item.kind === "event"
    ? new Date(item.data.startTime).getTime()
    : new Date(item.data.effective).getTime()
}

const SEV_STYLE: Record<string, string> = {
  EXTREME:  "bg-red-100 text-red-700 border border-red-200",
  HIGH:     "bg-orange-100 text-orange-700 border border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  LOW:      "bg-slate-100 text-slate-600 border border-slate-200",
  Extreme:  "bg-red-100 text-red-700 border border-red-200",
  Severe:   "bg-orange-100 text-orange-700 border border-orange-200",
  Moderate: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Minor:    "bg-slate-100 text-slate-600 border border-slate-200",
}

/** Estimate impact radius in miles based on storm type + metrics */
function estimateRadiusMiles(
  eventType: string,
  severity: string,
  wind?: number | null,
  hail?: number | null,
  rain?: number | null,
  ef?: string | null,
): number {
  const base: Record<string, number> = {
    TORNADO: 1.5,
    HURRICANE: 22,
    TROPICAL_STORM: 12,
    HAIL: 2.5,
    WIND: 2.5,
    FLOOD: 4,
    RAIN: 3,
    THUNDERSTORM: 3,
  }
  let r = base[eventType] ?? 2.5
  if (wind && wind > 40) r += wind * 0.04
  if (hail && hail > 0.5) r += hail * 1.5
  if (rain && rain > 1) r += rain * 0.5
  if (ef) {
    const n = parseInt(ef.replace(/\D/g, ""), 10)
    if (!isNaN(n)) r += n * 0.8
  }
  if (severity === "EXTREME") r *= 1.8
  else if (severity === "HIGH") r *= 1.4
  return Math.round(Math.min(r, 50) * 10) / 10
}

/** Get alert center coords from rawGeometry or areaDesc fallback */
function getAlertCenter(alert: NWSAlert): { lat: number; lng: number } | null {
  const g = alert.rawGeometry
  if (g) {
    try {
      if (g.type === "Point") {
        const [lng, lat] = g.coordinates as number[]
        return { lat, lng }
      }
      if (g.type === "Polygon") {
        const ring = (g.coordinates as number[][][])[0]
        return {
          lat: ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length,
          lng: ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length,
        }
      }
      if (g.type === "MultiPolygon") {
        const ring = ((g.coordinates as number[][][][])[0])[0]
        return {
          lat: ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length,
          lng: ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length,
        }
      }
    } catch { /* fall through */ }
  }

  // No geometry — parse areaDesc to find a matching FL location
  if (alert.areaDesc) {
    const areas = alert.areaDesc.split(";").map((s) => s.trim())
    for (const area of areas) {
      // Strip " County" suffix and search
      const term = area.replace(/ county$/i, "").trim()
      const matches = searchFLLocations(term, 1)
      if (matches.length > 0) {
        return { lat: matches[0].latitude, lng: matches[0].longitude }
      }
    }
  }
  return null
}

// ─── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: StormEvent }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const color = getStormColor(event.eventType)
  const radius = estimateRadiusMiles(
    event.eventType, event.severity,
    event.windSpeedMph, event.hailSizeInches, event.rainfallInches, event.tornadoEF,
  )

  // Use direct coords if available, otherwise resolve from locationName
  const coords = (event.latitude != null && event.longitude != null)
    ? { lat: event.latitude, lng: event.longitude }
    : (() => {
        const hits = searchFLLocations(event.locationName, 1)
        return hits.length > 0 ? { lat: hits[0].latitude, lng: hits[0].longitude } : null
      })()
  const hasCoords = coords !== null

  const goToMap = () => {
    if (coords) {
      router.push(`/map?lat=${coords.lat}&lng=${coords.lng}&zoom=12&eid=${event.id}`)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToMap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") goToMap() }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${hasCoords ? "cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5" : ""}`}
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color.fill }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color.fill + "22" }}>
              {event.eventType === "TORNADO" && <span className="text-lg">🌪</span>}
              {event.eventType === "HURRICANE" && <span className="text-lg">🌀</span>}
              {event.eventType === "HAIL" && <span className="text-lg">🧊</span>}
              {event.eventType === "WIND" && <Wind className="h-5 w-5" style={{ color: color.fill }} />}
              {(event.eventType === "FLOOD" || event.eventType === "RAIN") && <Droplets className="h-5 w-5" style={{ color: color.fill }} />}
              {!["TORNADO","HURRICANE","HAIL","WIND","FLOOD","RAIN"].includes(event.eventType) && <Zap className="h-5 w-5" style={{ color: color.fill }} />}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm">
                {color.label}
                {event.county ? ` · ${event.county} County` : ""}
              </div>
              <div className="text-xs text-slate-500 truncate">{event.locationName}</div>
            </div>
          </div>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-bold ${SEV_STYLE[event.severity] ?? SEV_STYLE.LOW}`}>
            {event.severity}
          </span>
        </div>

        {/* Radius + time row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span style={{ color: color.fill }}>◉</span>
            ~{radius} mi impact radius
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatDate(event.startTime, "long")}
          </span>
          {event.endTime && (
            <span className="text-slate-400">→ {formatDate(event.endTime, "long")}</span>
          )}
        </div>

        {/* Metrics row */}
        {(event.windSpeedMph || event.hailSizeInches || event.rainfallInches || event.tornadoEF) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {event.windSpeedMph && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-full font-semibold">
                <Wind className="h-3 w-3" />
                {event.windSpeedMph} mph
              </span>
            )}
            {event.hailSizeInches && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1.5 rounded-full font-semibold">
                🧊 {event.hailSizeInches}&quot; hail
              </span>
            )}
            {event.rainfallInches && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full font-semibold">
                <Droplets className="h-3 w-3" />
                {event.rainfallInches}&quot; rain
              </span>
            )}
            {event.tornadoEF && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-800 px-3 py-1.5 rounded-full font-semibold">
                🌪 Tornado {event.tornadoEF}
              </span>
            )}
          </div>
        )}

        {/* Info grid */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Storm Type</div>
            <div className="font-bold text-slate-800">{color.label}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Severity</div>
            <div className="font-bold text-slate-800">{event.severity}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Impact Radius</div>
            <div className="font-bold text-slate-800">~{radius} miles</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Confidence</div>
            <div className="font-bold text-slate-800">{event.confidenceLevel.replace(/_/g, " ")}</div>
          </div>
          {event.state && (
            <div>
              <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">State</div>
              <div className="font-bold text-slate-800">Florida ({event.state})</div>
            </div>
          )}
          {hasCoords && (
            <div className="col-span-2 sm:col-span-3">
              <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Coordinates</div>
              <div className="font-mono text-xs text-slate-700">{coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}</div>
            </div>
          )}
        </div>

        {/* Description toggle — stop propagation so clicking doesn't trigger card nav */}
        {event.description && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Hide full report" : "Read full report"}
            </button>
            {expanded && (
              <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 whitespace-pre-wrap border border-slate-100">
                {event.description}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
          Storm exposure data only — does not confirm property damage. Conduct on-site inspection before filing claims.
        </div>

        {/* Action row */}
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          {hasCoords ? (
            <button
              onClick={goToMap}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Map className="h-3.5 w-3.5" />
              View on Map
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 px-3 py-2 bg-slate-100 rounded-xl">
              <MapPin className="h-3.5 w-3.5" />
              Location unavailable
            </div>
          )}
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Alert Card ────────────────────────────────────────────────────────────────
function AlertCard({ alert }: { alert: NWSAlert }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const color = getStormColor(alert.eventType)

  const center = getAlertCenter(alert)
  const canNavigate = center !== null

  // Estimate radius based on event type + severity (no metrics available for raw alerts)
  const radius = estimateRadiusMiles(alert.eventType, alert.severity)

  const goToMap = () => {
    if (center) {
      router.push(`/map?lat=${center.lat}&lng=${center.lng}&zoom=9&aid=${alert.id}`)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToMap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") goToMap() }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${canNavigate ? "cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5" : ""}`}
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color.fill }} />

      <div className="p-5">
        {/* Live badge + title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: color.fill }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: color.fill }}>
                <Radio className="inline h-3 w-3 mr-1" />
                NWS Live Alert
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">{alert.title}</h3>
          </div>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-bold ${SEV_STYLE[alert.severity] ?? SEV_STYLE.LOW}`}>
            {alert.severity?.toUpperCase()}
          </span>
        </div>

        {/* Location + radius + time */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mb-3">
          <span className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-3 w-3" />
            {alert.areaDesc}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span style={{ color: color.fill }}>◉</span>
            ~{radius} mi estimated radius
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Clock className="h-3 w-3" />
            {formatDate(alert.effective, "long")}
          </span>
          <span className="text-amber-600 font-semibold">
            Expires: {formatDate(alert.expires, "long")}
          </span>
        </div>

        {/* Info grid — always shows type + severity + radius */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Storm Type</div>
            <div className="font-bold text-slate-800">{color.label}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Severity</div>
            <div className="font-bold text-slate-800">{alert.severity?.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Est. Radius</div>
            <div className="font-bold text-slate-800">~{radius} miles</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Urgency</div>
            <div className="font-bold text-slate-800">{alert.urgency}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Certainty</div>
            <div className="font-bold text-slate-800">{alert.certainty}</div>
          </div>
          {center && (
            <div className="col-span-2 sm:col-span-3">
              <div className="text-slate-400 mb-0.5 uppercase tracking-wide text-[10px]">Map Location</div>
              <div className="font-mono text-xs text-slate-700">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</div>
            </div>
          )}
        </div>

        {/* Description toggle */}
        {alert.description && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Hide full alert text" : "Read full NWS alert"}
            </button>
            {expanded && (
              <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 whitespace-pre-wrap border border-slate-100">
                {alert.description}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          {canNavigate ? (
            <button
              onClick={goToMap}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Map className="h-3.5 w-3.5" />
              View on Map
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 px-3 py-2 bg-slate-100 rounded-xl">
              <MapPin className="h-3.5 w-3.5" />
              No map coordinates
            </div>
          )}
          {alert.sourceUrl && (
            <a
              href={alert.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              NWS Source
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "alerts" | "events">("all")
  const [refreshing, setRefreshing] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    setError("")

    try {
      const [alertsRes, eventsRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/storm-events?since=" + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const alerts: NWSAlert[] = alertsRes.ok ? await alertsRes.json() : []
      const events: StormEvent[] = eventsRes.ok ? await eventsRes.json() : []

      if (!alertsRes.ok && !eventsRes.ok) {
        setError("Unable to load storm data — NWS API may be temporarily unavailable. Try refreshing.")
        return
      }

      const items: FeedItem[] = [
        ...alerts.map((a): FeedItem => ({ kind: "alert", data: a })),
        ...events.map((e): FeedItem => ({ kind: "event", data: e })),
      ]
      items.sort((a, b) => itemDate(b) - itemDate(a))
      setFeed(items)
    } catch {
      setError("Network error. Check your connection and try refreshing.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const stormTypes = [...new Set(
    feed
      .filter((i) => i.kind === "event")
      .map((i) => (i.data as StormEvent).eventType)
  )]

  const displayed = feed.filter((item) => {
    if (filter === "alerts" && item.kind !== "alert") return false
    if (filter === "events" && item.kind !== "event") return false
    if (typeFilter !== "all" && item.kind === "event") {
      return (item.data as StormEvent).eventType === typeFilter
    }
    return true
  })

  const alertCount = feed.filter((i) => i.kind === "alert").length
  const eventCount = feed.filter((i) => i.kind === "event").length

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Latest Storm Reports</h1>
            <p className="text-sm text-slate-500">
              {feed.length > 0
                ? `${alertCount} active NWS alerts · ${eventCount} storm events — click any card to view on map`
                : loading ? "Loading live NWS + NOAA data..." : "No storm activity in the last 30 days"}
            </p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(["all", "alerts", "events"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${
                filter === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {k === "all" ? `All (${feed.length})` : k === "alerts" ? `🔴 Alerts (${alertCount})` : `⚡ Events (${eventCount})`}
            </button>
          ))}
        </div>

        {filter !== "alerts" && stormTypes.length > 1 && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold"
          >
            <option value="all">All storm types</option>
            {stormTypes.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 && !error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-lg">No storm activity found</p>
          <p className="text-sm text-slate-400 mt-1">Try changing filters or refreshing — data updates every 5 minutes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((item, i) =>
            item.kind === "alert"
              ? <AlertCard key={`a-${item.data.id}-${i}`} alert={item.data} />
              : <EventCard key={`e-${item.data.id}-${i}`} event={item.data} />
          )}
        </div>
      )}
    </div>
  )
}
