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

      {/*
        Overlay cards are children of MapContainer so they live inside
        .leaflet-container's stacking context. z-[800] beats all Leaflet
        panes (max z-index 700), bypassing GPU compositing conflicts.
      */}

      {/* Active alert card — top right */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 text-xs shadow-lg" style={{ zIndex: 800, width: 155 }}>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-slate-800 font-bold">3 Active Alerts</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Tornado Warning", color: "text-red-500" },
            { label: "Hail Advisory", color: "text-orange-500" },
            { label: "Flash Flood Watch", color: "text-blue-500" },
          ].map((a) => (
            <div key={a.label} className={`${a.color} text-[10px] flex items-center gap-1 font-medium`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
              {a.label}
            </div>
          ))}
        </div>
      </div>

      {/* Storm events stat card — top left */}
      <div className="absolute top-3 left-3 bg-[#0F172A]/90 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 shadow-xl" style={{ zIndex: 800 }}>
        <div className="text-xl font-black text-white leading-none">47</div>
        <div className="text-[10px] text-slate-400 mt-0.5">Storm events</div>
        <div className="text-[10px] text-green-400 font-semibold mt-0.5">↑ Live data</div>
      </div>

      {/* Acres tracked stat card — bottom left */}
      <div className="absolute bottom-10 left-3 bg-[#0F172A]/90 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 shadow-xl" style={{ zIndex: 800 }}>
        <div className="text-xl font-black text-white leading-none">3.2M</div>
        <div className="text-[10px] text-slate-400 mt-0.5">Acres tracked</div>
        <div className="text-[10px] text-blue-400 font-semibold mt-0.5">Florida</div>
      </div>

      {/* Filter bar — bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-3 py-2 flex items-center gap-2" style={{ zIndex: 800 }}>
        {[
          { label: "Hail", cls: "bg-orange-100 text-orange-600 border border-orange-200" },
          { label: "Tornado", cls: "bg-red-100 text-red-600 border border-red-200" },
          { label: "Wind", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
          { label: "Flood", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
        ].map((t) => (
          <span key={t.label} className={`text-[10px] px-2 py-1 rounded-full font-semibold ${t.cls}`}>{t.label}</span>
        ))}
        <span className="ml-auto text-[10px] text-slate-500 font-medium">10 events</span>
      </div>
    </MapContainer>
  )
}
