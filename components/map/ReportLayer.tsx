"use client"

import { Circle, CircleMarker, Tooltip, Popup } from "react-leaflet"
import { useReports } from "@/hooks/useReports"
import { getStormColor } from "@/lib/stormColors"
import { searchFLLocations } from "@/lib/florida-locations"
import type { Report } from "@/types"

function parseStormType(areaName: string): string {
  const label = (areaName.split(/[—–-]/)[0] ?? "").trim().toLowerCase()
  if (label.includes("tornado")) return "TORNADO"
  if (label.includes("hurricane")) return "HURRICANE"
  if (label.includes("tropical")) return "TROPICAL_STORM"
  if (label.includes("hail")) return "HAIL"
  if (label.includes("wind")) return "WIND"
  if (label.includes("flood")) return "FLOOD"
  if (label.includes("rain")) return "RAIN"
  return "THUNDERSTORM"
}

function impactRadiusM(stormType: string): number {
  const base: Record<string, number> = {
    TORNADO: 22000, HURRICANE: 80000, TROPICAL_STORM: 55000,
    HAIL: 25000, WIND: 30000, FLOOD: 28000, RAIN: 22000, THUNDERSTORM: 22000,
  }
  return base[stormType] ?? 22000
}

function getCenter(geoJson: unknown, areaName: string): [number, number] | null {
  try {
    const geo = geoJson as { type: string; coordinates: unknown }
    if (geo?.type === "Point") {
      const [lng, lat] = geo.coordinates as number[]
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]
    }
    if (geo?.type === "Polygon") {
      const ring = (geo.coordinates as number[][][])[0]
      const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
      const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]
    }
  } catch { /* fall through */ }

  const candidates: string[] = []
  const dashPart = areaName.split(/[—–]/).slice(1).join(" ").trim()
  if (dashPart) {
    dashPart.split(",").forEach((s) =>
      candidates.push(s.trim().replace(/\s+(co\.|county|fl|florida)\.?$/i, "").trim())
    )
  }
  candidates.push(areaName.split(/[—–]/)[0].trim())

  for (const term of candidates) {
    if (term.length < 3) continue
    const hits = searchFLLocations(term, 1)
    if (hits.length > 0) return [hits[0].latitude, hits[0].longitude]
  }

  return null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function ReportLayer() {
  const { data: reports = [] } = useReports()

  const positioned = reports
    .map((r) => ({ report: r, center: getCenter(r.geoJson, r.areaName) }))
    .filter((x): x is { report: Report; center: [number, number] } => x.center !== null)

  return (
    <>
      {positioned.map(({ report, center }) => {
        const stormType = parseStormType(report.areaName)
        const radiusM = impactRadiusM(stormType)
        const color = getStormColor(stormType)

        return (
          <React.Fragment key={report.id}>
            {/* Glow ring */}
            <Circle
              center={center}
              radius={radiusM * 1.3}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.06,
                weight: 1,
                dashArray: "8 5",
                interactive: false,
              } as object}
            />
            {/* Impact zone */}
            <Circle
              center={center}
              radius={radiusM}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.22,
                weight: 2,
                interactive: false,
              } as object}
            />
            {/* Pin */}
            <CircleMarker
              center={center}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                fillColor: color.fill,
                fillOpacity: 1,
                weight: 2.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -12]}>
                <div className="text-xs">
                  <div className="font-bold">{report.areaName}</div>
                  <div className="opacity-70">{formatDate(report.generatedAt)}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <div className="font-bold mb-1" style={{ color: color.stroke }}>{report.areaName}</div>
                  {report.summary && <div className="text-xs text-slate-600 mb-2">{report.summary.slice(0, 120)}{report.summary.length > 120 ? "…" : ""}</div>}
                  <div className="text-xs text-slate-400">{formatDate(report.generatedAt)}</div>
                  <a
                    href={`/api/reports/${report.id}/pdf`}
                    className="mt-2 block text-center text-xs font-semibold text-white rounded px-2 py-1"
                    style={{ backgroundColor: color.stroke }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download PDF
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        )
      })}
    </>
  )
}

// React is needed for React.Fragment
import React from "react"
