"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useSearchParams } from "next/navigation"
import { StormEventLayer } from "./StormEventLayer"
import { AlertLayer } from "./AlertLayer"
import { MapLegend } from "./MapLegend"
import { useMapStore } from "@/store/mapStore"

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

/** Reads ?lat, ?lng, ?zoom URL params and flies the map there on mount. */
function MapUrlNavigator() {
  const map = useMap()
  const searchParams = useSearchParams()

  useEffect(() => {
    const lat = parseFloat(searchParams.get("lat") ?? "")
    const lng = parseFloat(searchParams.get("lng") ?? "")
    const zoom = parseInt(searchParams.get("zoom") ?? "12", 10)

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const safeZoom = Math.min(Math.max(zoom, 4), 18)
      map.flyTo([lat, lng], safeZoom, { animate: true, duration: 1.2 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return null
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
        <AlertLayer />
        <StormEventLayer />
      </MapContainer>
      <MapLegend />
    </div>
  )
}
