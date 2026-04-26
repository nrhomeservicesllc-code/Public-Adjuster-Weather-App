"use client"

import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import React from "react"

const FLORIDA_CENTER: [number, number] = [27.6, -81.5]

const DEMO_EVENTS = [
  { lat: 25.77,  lng: -80.19, color: "#EF4444", r: 8, impact: 28000 }, // Miami – Tornado
  { lat: 27.95,  lng: -82.46, color: "#F97316", r: 9, impact: 22000 }, // Tampa – Hail
  { lat: 28.54,  lng: -81.38, color: "#3B82F6", r: 8, impact: 38000 }, // Orlando – Flood
  { lat: 29.65,  lng: -82.32, color: "#EAB308", r: 7, impact: 16000 }, // Gainesville – Wind
  { lat: 26.12,  lng: -80.14, color: "#7C3AED", r: 10, impact: 55000 }, // Fort Lauderdale – Hurricane
  { lat: 30.42,  lng: -84.28, color: "#EF4444", r: 7, impact: 12000 }, // Tallahassee – Tornado
  { lat: 27.34,  lng: -82.53, color: "#F97316", r: 8, impact: 20000 }, // Sarasota – Hail
  { lat: 29.19,  lng: -81.04, color: "#4F46E5", r: 7, impact: 18000 }, // Daytona – Thunderstorm
  { lat: 26.64,  lng: -81.87, color: "#F97316", r: 8, impact: 24000 }, // Fort Myers – Hail
  { lat: 30.33,  lng: -81.66, color: "#EAB308", r: 7, impact: 14000 }, // Jacksonville – Wind
]

export function LandingMapPreview() {
  return (
    <MapContainer
      center={FLORIDA_CENTER}
      zoom={6}
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
      {DEMO_EVENTS.map((e, i) => (
        <React.Fragment key={i}>
          <Circle
            center={[e.lat, e.lng]}
            radius={e.impact}
            pathOptions={{
              color: e.color,
              fillColor: e.color,
              fillOpacity: 0.1,
              weight: 1.5,
              dashArray: "4 4",
            }}
          />
          <CircleMarker
            center={[e.lat, e.lng]}
            radius={e.r}
            pathOptions={{
              color: "#fff",
              fillColor: e.color,
              fillOpacity: 1,
              weight: 2,
            }}
          />
        </React.Fragment>
      ))}
    </MapContainer>
  )
}
