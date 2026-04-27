"use client"

import { MapContainer, TileLayer, Circle, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { getStormColor } from "@/lib/stormColors"

interface Props {
  lat: number
  lng: number
  stormType: string
  radiusM: number
}

export function ReportMiniMap({ lat, lng, stormType, radiusM }: Props) {
  const color = getStormColor(stormType)

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={11}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ cursor: "default" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      {/* Impact radius */}
      <Circle
        center={[lat, lng]}
        radius={radiusM}
        pathOptions={{
          color: color.stroke,
          fillColor: color.fill,
          fillOpacity: 0.22,
          weight: 2,
          dashArray: "5 4",
          interactive: false,
        } as object}
      />
      {/* Storm epicentre */}
      <CircleMarker
        center={[lat, lng]}
        radius={9}
        pathOptions={{
          color: "#fff",
          fillColor: color.fill,
          fillOpacity: 1,
          weight: 2.5,
          interactive: false,
        } as object}
      />
    </MapContainer>
  )
}
