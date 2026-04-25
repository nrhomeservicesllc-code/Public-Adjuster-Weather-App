"use client"

import { Popup } from "react-leaflet"
import { ExternalLink, FileText, Copy, Wind, Droplets, Tornado } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStormColor } from "@/lib/stormColors"
import { formatDate } from "@/lib/utils"
import type { StormEvent } from "@/types"

interface Props {
  event: StormEvent & { latitude: number; longitude: number }
  nearbyCount?: number
}

const CONFIDENCE_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-500 text-white",
  REPORTED: "bg-yellow-500 text-white",
  RADAR_INDICATED: "bg-blue-500 text-white",
  ALERT_BASED: "bg-gray-400 text-white",
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

function buildSummary(event: StormEvent): string {
  const color = getStormColor(event.eventType)
  const lines = [
    `Storm Impact Map — ${color.label} Event`,
    `Location: ${event.locationName}${event.county ? `, ${event.county} County` : ""}`,
    `Date: ${formatDate(event.startTime, "long")}`,
    event.windSpeedMph ? `Wind Speed: ${event.windSpeedMph} mph` : null,
    event.hailSizeInches ? `Hail Size: ${event.hailSizeInches}"` : null,
    event.tornadoEF ? `Tornado: ${event.tornadoEF}` : null,
    `Severity: ${event.severity}`,
    `Confidence: ${event.confidenceLevel.replace(/_/g, " ")}`,
    `Source: ${event.source}`,
    event.sourceUrl ? `Link: ${event.sourceUrl}` : null,
    "",
    "DISCLAIMER: This data reflects storm exposure only and does not confirm property damage.",
  ]
  return lines.filter(Boolean).join("\n")
}

export function StormPopup({ event, nearbyCount }: Props) {
  const color = getStormColor(event.eventType)

  const createReport = () => {
    fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        areaName: `${color.label} — ${event.locationName}`,
        geoJson: { type: "Point", coordinates: [event.longitude, event.latitude] },
        stormEventIds: [event.id],
        alertIds: [],
        summary: buildSummary(event),
      }),
    }).catch(() => {})
  }

  return (
    <Popup maxWidth={320} className="storm-popup">
      <div className="p-1 min-w-[280px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color.fill }}
          />
          <span className="font-bold text-base text-gray-900">{color.label}</span>
          <span
            className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${CONFIDENCE_COLORS[event.confidenceLevel] ?? "bg-gray-400 text-white"}`}
          >
            {event.confidenceLevel.replace(/_/g, " ")}
          </span>
        </div>

        {/* Location + Date */}
        <div className="text-sm text-gray-700 mb-3 space-y-1">
          <div className="font-semibold">
            {event.locationName}{event.county ? `, ${event.county} Co.` : ""}
          </div>
          <div className="text-gray-500">{formatDate(event.startTime, "long")}</div>
        </div>

        {/* Nearby count badge */}
        {nearbyCount && nearbyCount > 1 && event.county && (
          <div className="text-xs rounded-lg px-3 py-2 mb-3 font-medium"
            style={{ backgroundColor: color.fill + "18", color: color.stroke }}>
            {nearbyCount} {color.label} events in {event.county} County this period
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {event.windSpeedMph && (
            <div className="flex items-center gap-1.5 text-xs bg-yellow-50 rounded p-2">
              <Wind className="h-3.5 w-3.5 text-yellow-600" />
              <span>{event.windSpeedMph} mph</span>
            </div>
          )}
          {event.hailSizeInches && (
            <div className="flex items-center gap-1.5 text-xs bg-orange-50 rounded p-2">
              <span className="text-orange-600 font-bold text-xs">⬡</span>
              <span>{event.hailSizeInches}&quot; hail</span>
            </div>
          )}
          {event.rainfallInches && (
            <div className="flex items-center gap-1.5 text-xs bg-blue-50 rounded p-2">
              <Droplets className="h-3.5 w-3.5 text-blue-600" />
              <span>{event.rainfallInches}&quot; rain</span>
            </div>
          )}
          {event.tornadoEF && (
            <div className="flex items-center gap-1.5 text-xs bg-red-50 rounded p-2">
              <Tornado className="h-3.5 w-3.5 text-red-600" />
              <span>{event.tornadoEF}</span>
            </div>
          )}
        </div>

        {/* Severity */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Severity:</span>
          <Badge
            className="text-xs"
            variant={
              event.severity === "EXTREME" ? "destructive"
              : event.severity === "HIGH" ? "warning"
              : "secondary"
            }
          >
            {event.severity}
          </Badge>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-3">{event.description}</p>
        )}

        {/* Source */}
        <div className="text-xs text-gray-500 mb-3">
          Source: <span className="font-medium text-gray-700">{event.source}</span>
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-0.5 text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mb-3">
          Storm exposure data only — does not confirm property damage.
        </p>

        {/* Actions */}
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 flex-1"
            onClick={() => copyToClipboard(buildSummary(event))}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            className="text-xs h-8 flex-1"
            onClick={createReport}
          >
            <FileText className="h-3 w-3 mr-1" />
            Save Report
          </Button>
        </div>
      </div>
    </Popup>
  )
}
