"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Newspaper, Wind, Droplets, RefreshCw, MapPin,
  ExternalLink, Clock, ChevronDown, ChevronUp,
  AlertTriangle, Tornado, Zap, Map
} from "lucide-react"
import { getStormColor } from "@/lib/stormColors"
import { formatDate } from "@/lib/utils"
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

const SEV: Record<string, string> = {
  EXTREME:  "bg-red-500/15 text-red-400 border border-red-500/30",
  HIGH:     "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  MODERATE: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  LOW:      "bg-slate-500/15 text-slate-400 border border-slate-500/20",
  Extreme:  "bg-red-500/15 text-red-400 border border-red-500/30",
  Severe:   "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  Moderate: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  Minor:    "bg-slate-500/15 text-slate-400 border border-slate-500/20",
}

// ─── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: StormEvent }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const color = getStormColor(event.eventType)
  const hasCoords = event.latitude != null && event.longitude != null

  const viewOnMap = () => {
    if (hasCoords) {
      router.push(`/map?lat=${event.latitude}&lng=${event.longitude}&zoom=12&eid=${event.id}`)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: color.fill }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color.fill + "20" }}>
              {event.eventType === "TORNADO" && <Tornado className="h-4 w-4" style={{ color: color.fill }} />}
              {event.eventType === "WIND" && <Wind className="h-4 w-4" style={{ color: color.fill }} />}
              {(event.eventType === "FLOOD" || event.eventType === "RAIN") && <Droplets className="h-4 w-4" style={{ color: color.fill }} />}
              {!["TORNADO","WIND","FLOOD","RAIN"].includes(event.eventType) && <Zap className="h-4 w-4" style={{ color: color.fill }} />}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">
                {color.label}
                {event.county ? ` · ${event.county} County` : ""}
              </div>
              <div className="text-xs text-slate-500 truncate">{event.locationName}</div>
            </div>
          </div>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${SEV[event.severity] ?? SEV.LOW}`}>
            {event.severity}
          </span>
        </div>

        {/* Time + source */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatDate(event.startTime, "long")}
          </span>
          {event.endTime && (
            <span className="text-slate-400">— {formatDate(event.endTime, "long")}</span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            {event.source}
          </span>
        </div>

        {/* Metrics */}
        {(event.windSpeedMph || event.hailSizeInches || event.rainfallInches || event.tornadoEF) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {event.windSpeedMph && (
              <div className="inline-flex items-center gap-1.5 text-xs bg-yellow-50 border border-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full font-medium">
                <Wind className="h-3 w-3" />
                {event.windSpeedMph} mph wind
              </div>
            )}
            {event.hailSizeInches && (
              <div className="inline-flex items-center gap-1.5 text-xs bg-orange-50 border border-orange-100 text-orange-800 px-3 py-1.5 rounded-full font-medium">
                <span className="font-bold">⬡</span>
                {event.hailSizeInches}&quot; hail diameter
              </div>
            )}
            {event.rainfallInches && (
              <div className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                <Droplets className="h-3 w-3" />
                {event.rainfallInches}&quot; rainfall
              </div>
            )}
            {event.tornadoEF && (
              <div className="inline-flex items-center gap-1.5 text-xs bg-red-50 border border-red-100 text-red-800 px-3 py-1.5 rounded-full font-medium">
                <Tornado className="h-3 w-3" />
                Tornado {event.tornadoEF}
              </div>
            )}
          </div>
        )}

        {/* Storm info summary */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-slate-400 mb-0.5">Storm Type</div>
            <div className="font-semibold text-slate-800">{color.label}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Severity</div>
            <div className="font-semibold text-slate-800">{event.severity}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Confidence</div>
            <div className="font-semibold text-slate-800">{event.confidenceLevel.replace(/_/g, " ")}</div>
          </div>
          {hasCoords && (
            <div className="col-span-2 sm:col-span-1">
              <div className="text-slate-400 mb-0.5">Coordinates</div>
              <div className="font-mono text-xs text-slate-700">{event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}</div>
            </div>
          )}
          {event.state && (
            <div>
              <div className="text-slate-400 mb-0.5">State</div>
              <div className="font-semibold text-slate-800">Florida ({event.state})</div>
            </div>
          )}
        </div>

        {/* Description toggle */}
        {event.description && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
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

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {hasCoords && (
            <button
              onClick={viewOnMap}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Map className="h-3.5 w-3.5" />
              View on Map
            </button>
          )}
          {!hasCoords && (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 px-3 py-2 bg-slate-100 rounded-xl">
              <MapPin className="h-3.5 w-3.5" />
              No coordinates available
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

  const hasCoords =
    alert.rawGeometry != null &&
    (alert.rawGeometry.type === "Polygon" || alert.rawGeometry.type === "MultiPolygon" || alert.rawGeometry.type === "Point")

  const getCenter = (): { lat: number; lng: number } | null => {
    const g = alert.rawGeometry
    if (!g) return null
    try {
      if (g.type === "Point") {
        const [lng, lat] = g.coordinates as number[]
        return { lat, lng }
      }
      if (g.type === "Polygon") {
        const ring = (g.coordinates as number[][][])[0]
        const lng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length
        const lat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length
        return { lat, lng }
      }
      if (g.type === "MultiPolygon") {
        const ring = ((g.coordinates as number[][][][])[0])[0]
        const lng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length
        const lat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length
        return { lat, lng }
      }
    } catch { return null }
    return null
  }

  const viewOnMap = () => {
    const center = getCenter()
    if (center) {
      router.push(`/map?lat=${center.lat}&lng=${center.lng}&zoom=9&aid=${alert.id}`)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 w-full" style={{ backgroundColor: color.fill }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: color.fill }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: color.fill }}>
                NWS Active Alert
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">{alert.title}</h3>
          </div>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${SEV[alert.severity] ?? SEV.LOW}`}>
            {alert.severity?.toUpperCase()}
          </span>
        </div>

        {/* Location + time */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {alert.areaDesc}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Issued: {formatDate(alert.effective, "long")}
          </span>
          <span className="text-amber-600 font-medium">
            Expires: {formatDate(alert.expires, "long")}
          </span>
        </div>

        {/* Info grid */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <div className="text-slate-400 mb-0.5">Type</div>
            <div className="font-semibold text-slate-800">{color.label}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Urgency</div>
            <div className="font-semibold text-slate-800">{alert.urgency}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Certainty</div>
            <div className="font-semibold text-slate-800">{alert.certainty}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-0.5">Source</div>
            <div className="font-semibold text-slate-800">NWS</div>
          </div>
        </div>

        {/* Full description toggle */}
        {alert.description && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Hide full alert text" : "Read full alert text"}
            </button>
            {expanded && (
              <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 whitespace-pre-wrap border border-slate-100 max-h-64 overflow-y-auto">
                {alert.description}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {hasCoords && (
            <button
              onClick={viewOnMap}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Map className="h-3.5 w-3.5" />
              View on Map
            </button>
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
        fetch("/api/storm-events"),
      ])

      const alerts: NWSAlert[] = alertsRes.ok ? await alertsRes.json() : []
      const events: StormEvent[] = eventsRes.ok ? await eventsRes.json() : []

      if (!alertsRes.ok && !eventsRes.ok) {
        setError("Unable to load storm data. Please refresh.")
        return
      }

      const items: FeedItem[] = [
        ...alerts.map((a): FeedItem => ({ kind: "alert", data: a })),
        ...events.map((e): FeedItem => ({ kind: "event", data: e })),
      ]
      items.sort((a, b) => itemDate(b) - itemDate(a))
      setFeed(items)
    } catch {
      setError("Network error. Check your connection and refresh.")
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
                ? `${alertCount} active alerts · ${eventCount} storm events`
                : "Loading live NWS + NOAA data..."}
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filter === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {k === "all" ? `All (${feed.length})` : k === "alerts" ? `Alerts (${alertCount})` : `Events (${eventCount})`}
            </button>
          ))}
        </div>

        {filter !== "alerts" && stormTypes.length > 1 && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">All storm types</option>
            {stormTypes.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 && !error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-lg">No storm activity found</p>
          <p className="text-sm text-slate-400 mt-1">Try changing filters or refreshing</p>
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
