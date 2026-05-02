"use client"

import React from "react"
import { Polygon, Marker, Tooltip, Popup } from "react-leaflet"
import L from "leaflet"
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

function getCenter(geoJson: unknown, areaName: string): [number, number] {
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
    const words = dashPart.split(/[\s,]+/).filter((w) => w.length > 3 && !/^\d+$/.test(w) && !/^[A-Z]{1,3}$/.test(w))
    words.reverse().forEach((w) => candidates.push(w))
  }
  candidates.push(areaName.split(/[—–]/)[0].trim())

  for (const term of candidates) {
    if (term.length < 3) continue
    const hits = searchFLLocations(term, 1)
    if (hits.length > 0) return [hits[0].latitude, hits[0].longitude]
  }

  return [27.9944, -81.7603]
}

function blobPolygon(lat: number, lng: number, radiusM: number): [number, number][] {
  const N = 22
  const latR = radiusM / 111000
  const lngR = radiusM / (111000 * Math.cos((lat * Math.PI) / 180))
  const seed = ((lat * 997 + lng * 431) % (2 * Math.PI)) + 1

  return Array.from({ length: N }, (_, i) => {
    const angle = (i / N) * 2 * Math.PI
    const r =
      1 +
      0.13 * Math.sin(angle * 3 + seed) +
      0.09 * Math.cos(angle * 5 + seed * 1.6) +
      0.05 * Math.sin(angle * 7 + seed * 0.8)
    return [lat + latR * r * Math.cos(angle), lng + lngR * r * Math.sin(angle)] as [number, number]
  })
}

function makeIcon(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="
      width:30px;height:30px;
      background:${color};
      border:2.5px solid #fff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:15px;line-height:1;
      box-shadow:0 2px 6px rgba(0,0,0,0.45);
      ">📋</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, -19],
    popupAnchor: [0, -19],
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function ReportLayer() {
  const { data: reports = [] } = useReports()

  return (
    <>
      {reports.map((report: Report) => {
        const center = getCenter(report.geoJson, report.areaName)
        const stormType = parseStormType(report.areaName)
        const radiusM = impactRadiusM(stormType)
        const color = getStormColor(stormType)
        const outerBlob = blobPolygon(center[0], center[1], radiusM * 1.3)
        const innerBlob = blobPolygon(center[0], center[1], radiusM)
        const icon = makeIcon(color.emoji, color.fill)

        return (
          <React.Fragment key={report.id}>
            {/* Outer glow */}
            <Polygon
              positions={outerBlob}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.07,
                weight: 0,
                interactive: false,
              }}
            />
            {/* Impact zone blob */}
            <Polygon
              positions={innerBlob}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.32,
                weight: 2,
                interactive: false,
              }}
            />
            {/* Report pin */}
            <Marker position={center} icon={icon}>
              <Tooltip direction="top" offset={[0, -19]}>
                <div className="text-xs">
                  <div className="font-bold">{report.areaName}</div>
                  <div className="opacity-70">{formatDate(report.generatedAt)}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <div className="font-bold mb-1" style={{ color: color.stroke }}>{report.areaName}</div>
                  {report.summary && (
                    <div className="text-xs text-slate-600 mb-2">
                      {report.summary.slice(0, 120)}{report.summary.length > 120 ? "…" : ""}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mb-2">{formatDate(report.generatedAt)}</div>
                  <a
                    href={`/api/reports/${report.id}/pdf`}
                    className="block text-center text-xs font-semibold text-white rounded px-2 py-1"
                    style={{ backgroundColor: color.stroke }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download PDF
                  </a>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        )
      })}
    </>
  )
}
