"use client"

import React, { useEffect, useMemo } from "react"
import { Polygon, Marker, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import { useStormEvents } from "@/hooks/useStormEvents"
import { useMapStore } from "@/store/mapStore"
import { getStormColor } from "@/lib/stormColors"
import { StormPopup } from "./StormPopup"
import type { StormEvent } from "@/types"

/**
 * Generates an organic blob polygon around a lat/lng point.
 * Uses deterministic sine-wave perturbation so the shape is stable across renders.
 */
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

function getImpactRadius(event: StormEvent): number {
  const base: Record<string, number> = {
    TORNADO: 22000,
    HURRICANE: 80000,
    TROPICAL_STORM: 55000,
    HAIL: 25000,
    WIND: 30000,
    FLOOD: 28000,
    RAIN: 22000,
    THUNDERSTORM: 22000,
  }
  let radius = base[event.eventType] ?? 22000

  if (event.windSpeedMph && event.windSpeedMph > 40) radius += event.windSpeedMph * 150
  if (event.hailSizeInches && event.hailSizeInches > 0.5) radius += event.hailSizeInches * 4000
  if (event.rainfallInches && event.rainfallInches > 1) radius += event.rainfallInches * 2000
  if (event.tornadoEF) {
    const ef = parseInt(event.tornadoEF.replace(/\D/g, ""), 10)
    if (!isNaN(ef)) radius += ef * 3000
  }
  if (event.severity === "EXTREME") radius *= 1.5
  else if (event.severity === "HIGH") radius *= 1.25

  return Math.min(radius, 120000)
}

function isToday(event: StormEvent): boolean {
  return Date.now() - new Date(event.startTime).getTime() < 24 * 60 * 60 * 1000
}

function makeIcon(emoji: string, color: string, size: number) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2.5px solid #fff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size * 0.52)}px;line-height:1;
      box-shadow:0 2px 6px rgba(0,0,0,0.45);
      ">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -(size / 2 + 4)],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

export function StormEventLayer() {
  const map = useMap()
  const { data: events = [], isLoading } = useStormEvents()
  const showStormEvents = useMapStore((s) => s.filters.showStormEvents)
  const highlightedEventId = useMapStore((s) => s.highlightedEventId)

  useEffect(() => {
    if (!highlightedEventId || events.length === 0) return
    const ev = events.find((e) => e.id === highlightedEventId)
    if (!ev || ev.latitude == null || ev.longitude == null) return
    setTimeout(() => {
      map.flyTo([ev.latitude!, ev.longitude!], 12, { animate: true, duration: 1.5 })
    }, 400)
  }, [highlightedEventId, events, map])

  const validEvents = useMemo(
    () =>
      events.filter(
        (e): e is StormEvent & { latitude: number; longitude: number } =>
          e.latitude != null && e.longitude != null
      ),
    [events]
  )

  if (!showStormEvents || isLoading) return null

  return (
    <>
      {validEvents.map((event) => {
        const color = getStormColor(event.eventType)
        const impactRadius = getImpactRadius(event)
        const isHighlighted = event.id === highlightedEventId
        const todayEvent = isToday(event)
        const fillOpacity = isHighlighted ? 0.60 : todayEvent ? 0.48 : 0.35

        const outerBlob = blobPolygon(event.latitude, event.longitude, impactRadius * 1.3)
        const innerBlob = blobPolygon(event.latitude, event.longitude, impactRadius)

        const nearbyCount = validEvents.filter(
          (e) => e.county && e.county === event.county && e.eventType === event.eventType
        ).length

        const iconSize = isHighlighted ? 36 : todayEvent ? 30 : 26
        const icon = makeIcon(color.emoji, color.fill, iconSize)

        return (
          <React.Fragment key={event.id}>
            {/* Outer glow zone */}
            <Polygon
              positions={outerBlob}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: isHighlighted ? 0.14 : 0.08,
                weight: 0,
                interactive: false,
              }}
            />
            {/* Main impact zone — organic blob */}
            <Polygon
              positions={innerBlob}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity,
                weight: isHighlighted ? 3 : 2,
                interactive: false,
              }}
            />
            {/* Emoji icon marker */}
            <Marker
              position={[event.latitude, event.longitude]}
              icon={icon}
              zIndexOffset={isHighlighted ? 1000 : todayEvent ? 500 : 0}
            >
              <Tooltip direction="top" offset={[0, -(iconSize / 2 + 4)]} sticky>
                <div className="text-xs">
                  <span className="font-bold">{color.label}</span>
                  {" · "}
                  <span>{event.locationName}</span>
                  {event.severity !== "LOW" && (
                    <span className="ml-1 opacity-70">({event.severity})</span>
                  )}
                  {todayEvent && <span className="ml-1 font-bold text-red-600">● TODAY</span>}
                </div>
              </Tooltip>
              <StormPopup event={event} nearbyCount={nearbyCount} />
            </Marker>
          </React.Fragment>
        )
      })}
    </>
  )
}
