"use client"

import { useState, useEffect } from "react"
import { Newspaper, Wind, Droplets, AlertTriangle, RefreshCw, MapPin, ExternalLink, Clock } from "lucide-react"
import { getStormColor } from "@/lib/stormColors"
import { formatDate } from "@/lib/utils"
import type { StormEvent, NWSAlert } from "@/types"

type FeedItem =
  | { kind: "event"; data: StormEvent }
  | { kind: "alert"; data: NWSAlert }

function sortedDate(item: FeedItem): number {
  return item.kind === "event"
    ? new Date(item.data.startTime).getTime()
    : new Date(item.data.effective).getTime()
}

const SEVERITY_STYLE: Record<string, string> = {
  EXTREME: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function NewsPage() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "alerts" | "events">("all")
  const [refreshing, setRefreshing] = useState(false)

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)

    try {
      const [alertsRes, eventsRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/storm-events"),
      ])

      const alerts: NWSAlert[] = alertsRes.ok ? await alertsRes.json() : []
      const events: StormEvent[] = eventsRes.ok ? await eventsRes.json() : []

      const items: FeedItem[] = [
        ...alerts.map((a): FeedItem => ({ kind: "alert", data: a })),
        ...events.map((e): FeedItem => ({ kind: "event", data: e })),
      ]
      items.sort((a, b) => sortedDate(b) - sortedDate(a))
      setFeed(items)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const displayed = feed.filter((item) => {
    if (filter === "alerts") return item.kind === "alert"
    if (filter === "events") return item.kind === "event"
    return true
  })

  const alertCount = feed.filter((i) => i.kind === "alert").length
  const eventCount = feed.filter((i) => i.kind === "event").length

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Latest Storm Reports</h1>
            <p className="text-sm text-slate-500">Live NWS alerts + recent storm activity in Florida</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "all", label: `All (${feed.length})` },
          { key: "alerts", label: `NWS Alerts (${alertCount})` },
          { key: "events", label: `Storm Events (${eventCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-blue-700 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No storm activity found</p>
          <p className="text-sm text-slate-400 mt-1">Try refreshing or check back later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((item, i) =>
            item.kind === "alert" ? (
              <AlertCard key={`alert-${item.data.id}-${i}`} alert={item.data} />
            ) : (
              <EventCard key={`event-${item.data.id}-${i}`} event={item.data} />
            )
          )}
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert }: { alert: NWSAlert }) {
  const [expanded, setExpanded] = useState(false)
  const color = getStormColor(alert.eventType)
  const sev = alert.severity?.toUpperCase() as string

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 p-4">
        <span
          className="flex-shrink-0 w-3 h-3 rounded-full mt-1.5"
          style={{ backgroundColor: color.fill }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{alert.title}</h3>
            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold border ${SEVERITY_STYLE[sev] ?? SEVERITY_STYLE.LOW}`}>
              {sev}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {alert.areaDesc}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(alert.effective, "long")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
              backgroundColor: color.fill + "22",
              color: color.stroke,
            }}>
              {color.label}
            </span>
            <span className="text-xs text-slate-400">Expires {formatDate(alert.expires)}</span>
            <span className="text-xs text-slate-400">NWS Alert</span>
          </div>
        </div>
      </div>

      {alert.description && (
        <>
          <div
            className={`px-4 pb-1 text-xs text-slate-600 leading-relaxed overflow-hidden transition-all ${
              expanded ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="border-t border-slate-100 pt-3 pb-2 whitespace-pre-wrap">{alert.description}</div>
          </div>
          <div className="px-4 pb-3 flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {expanded ? "Show less" : "Read full alert"}
            </button>
            {alert.sourceUrl && (
              <a
                href={alert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                NWS Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function EventCard({ event }: { event: StormEvent }) {
  const color = getStormColor(event.eventType)
  const sev = event.severity?.toUpperCase() as string

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 p-4">
        <span
          className="flex-shrink-0 w-3 h-3 rounded-full mt-1.5"
          style={{ backgroundColor: color.fill }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm">
              {color.label} — {event.locationName}
              {event.county ? `, ${event.county} Co.` : ""}
            </h3>
            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold border ${SEVERITY_STYLE[sev] ?? SEVERITY_STYLE.LOW}`}>
              {sev}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(event.startTime, "long")}
            </span>
            <span className="text-slate-300">·</span>
            <span>{event.source}</span>
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap gap-2 mb-2">
            {event.windSpeedMph && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-full">
                <Wind className="h-3 w-3" /> {event.windSpeedMph} mph wind
              </span>
            )}
            {event.hailSizeInches && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-800 px-2 py-0.5 rounded-full">
                ⬡ {event.hailSizeInches}&quot; hail
              </span>
            )}
            {event.rainfallInches && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                <Droplets className="h-3 w-3" /> {event.rainfallInches}&quot; rain
              </span>
            )}
            {event.tornadoEF && (
              <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-800 px-2 py-0.5 rounded-full">
                🌪 {event.tornadoEF}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
              backgroundColor: color.fill + "22",
              color: color.stroke,
            }}>
              {color.label}
            </span>
            <span className="text-xs text-slate-400">{event.confidenceLevel.replace(/_/g, " ")}</span>
            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline ml-auto"
              >
                Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
