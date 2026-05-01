"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, ZoomControl, useMap, Circle, CircleMarker, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { StormEventLayer } from "./StormEventLayer"
import { AlertLayer } from "./AlertLayer"
import { MapLegend } from "./MapLegend"
import { MapSearchOverlay } from "./MapSearchOverlay"
import { useMapStore } from "@/store/mapStore"
import { getStormColor } from "@/lib/stormColors"

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const FLORIDA_CENTER: [number, number] = [27.9944, -81.7603]

function MapRefCapture() {
  const map = useMap()
  const setMapRef = useMapStore((s) => s.setMapRef)
  useEffect(() => {
    setMapRef(map)
    return () => setMapRef(null)
  }, [map, setMapRef])
  return null
}

/**
 * Reads ?lat/?lng/?zoom/?aid/?eid from URL and flies the map + sets highlight IDs.
 * Uses window.location.search directly to avoid the Suspense requirement
 * that useSearchParams() imposes in Next.js 15 App Router.
 */
function MapUrlNavigator() {
  const map = useMap()
  const setHighlightedAlertId = useMapStore((s) => s.setHighlightedAlertId)
  const setHighlightedEventId = useMapStore((s) => s.setHighlightedEventId)

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const lat = parseFloat(params.get("lat") ?? "")
    const lng = parseFloat(params.get("lng") ?? "")
    const zoom = parseInt(params.get("zoom") ?? "12", 10)
    const aid = params.get("aid")
    const eid = params.get("eid")

    if (aid) setHighlightedAlertId(aid)
    if (eid) setHighlightedEventId(eid)

    if (
      !isNaN(lat) && !isNaN(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    ) {
      const safeZoom = Math.min(Math.max(isNaN(zoom) ? 12 : zoom, 4), 18)
      setTimeout(() => {
        map.flyTo([lat, lng], safeZoom, { animate: true, duration: 1.2 })
      }, 300)
    }
  }, [map, setHighlightedAlertId, setHighlightedEventId])

  return null
}

/** Pulsing pin shown after a map search — auto-clears after 12 s */
function SearchLocationLayer() {
  const searchedLocation = useMapStore((s) => s.searchedLocation)
  const setSearchedLocation = useMapStore((s) => s.setSearchedLocation)

  useEffect(() => {
    if (!searchedLocation) return
    const t = setTimeout(() => setSearchedLocation(null), 12000)
    return () => clearTimeout(t)
  }, [searchedLocation, setSearchedLocation])

  if (!searchedLocation) return null

  return (
    <>
      <Circle
        center={[searchedLocation.lat, searchedLocation.lng]}
        radius={6000}
        pathOptions={{
          color: "#2563EB",
          fillColor: "#3B82F6",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 4",
          interactive: false,
        } as object}
      />
      <CircleMarker
        center={[searchedLocation.lat, searchedLocation.lng]}
        radius={9}
        pathOptions={{ color: "#1D4ED8", fillColor: "#3B82F6", fillOpacity: 1, weight: 3 }}
      >
        <Tooltip permanent direction="top" offset={[0, -13]}>
          <span className="font-semibold">📍 {searchedLocation.name}</span>
        </Tooltip>
      </CircleMarker>
    </>
  )
}

/**
 * When arriving from "View on Map" in Latest Reports, the URL carries
 * ?stormType=TORNADO&radiusM=3000. This layer draws the impact circle
 * directly from those params so it always shows — even for old events
 * that aren't in the current 24h filter window.
 */
function ReportImpactLayer() {
  const [impact, setImpact] = useState<{
    lat: number; lng: number; radiusM: number; stormType: string
  } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const p = new URLSearchParams(window.location.search)
    const lat      = parseFloat(p.get("lat") ?? "")
    const lng      = parseFloat(p.get("lng") ?? "")
    const radiusM  = parseInt(p.get("radiusM") ?? "", 10)
    const stormType = p.get("stormType") ?? ""
    if (!isNaN(lat) && !isNaN(lng) && radiusM > 0 && stormType) {
      setImpact({ lat, lng, radiusM, stormType })
    }
  }, [])

  if (!impact) return null

  const color = getStormColor(impact.stormType)

  return (
    <>
      {/* Outer glow ring */}
      <Circle
        center={[impact.lat, impact.lng]}
        radius={impact.radiusM * 1.25}
        pathOptions={{
          color: color.stroke,
          fillColor: color.fill,
          fillOpacity: 0.07,
          weight: 1,
          dashArray: "6 5",
          interactive: false,
        } as object}
      />
      {/* Main impact zone */}
      <Circle
        center={[impact.lat, impact.lng]}
        radius={impact.radiusM}
        pathOptions={{
          color: color.stroke,
          fillColor: color.fill,
          fillOpacity: 0.32,
          weight: 3,
          interactive: false,
        } as object}
      />
      {/* Epicentre marker */}
      <CircleMarker
        center={[impact.lat, impact.lng]}
        radius={10}
        pathOptions={{
          color: "#ffffff",
          fillColor: color.fill,
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -14]}>
          <span className="font-bold">{color.label} Impact Zone</span>
        </Tooltip>
      </CircleMarker>
    </>
  )
}

export function StormMap() {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={FLORIDA_CENTER}
        zoom={7}
        minZoom={4}
        maxZoom={18}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#e8eef4" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <MapRefCapture />
        <MapUrlNavigator />
        <SearchLocationLayer />
        <ReportImpactLayer />
        <AlertLayer />
        <StormEventLayer />
      </MapContainer>

      {/* Floating search — z-[1500] sits above all Leaflet panes */}
      <MapSearchOverlay />
      <MapLegend />
    </div>
  )
}
