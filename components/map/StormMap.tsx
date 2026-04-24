"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { StormEventLayer } from "./StormEventLayer"
import { AlertLayer } from "./AlertLayer"
import { MapLegend } from "./MapLegend"
import { useMapStore } from "@/store/mapStore"

// Fix broken Leaflet marker icons in webpack builds
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const FLORIDA_CENTER: [number, number] = [27.9944, -81.7603]
const FLORIDA_BOUNDS: [[number, number], [number, number]] = [
  [24.4, -87.6],
  [31.0, -79.9],
]

function MapRefCapture() {
  const map = useMap()
  const setMapRef = useMapStore((s) => s.setMapRef)
  useEffect(() => {
    setMapRef(map)
    return () => setMapRef(null)
  }, [map, setMapRef])
  return null
}

export function StormMap() {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={FLORIDA_CENTER}
        zoom={7}
        maxBounds={FLORIDA_BOUNDS}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#e8eef4" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <MapRefCapture />
        <AlertLayer />
        <StormEventLayer />
      </MapContainer>
      <MapLegend />
    </div>
  )
}
