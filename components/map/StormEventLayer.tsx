"use client"

import React, { useEffect } from "react"
import { Circle, CircleMarker, Tooltip, useMap } from "react-leaflet"
import { useStormEvents } from "@/hooks/useStormEvents"
import { useMapStore } from "@/store/mapStore"
import { getStormColor } from "@/lib/stormColors"
import { getMarkerRadius } from "@/lib/utils"
import { StormPopup } from "./StormPopup"
import type { StormEvent } from "@/types"

/** Returns geographic impact radius in meters based on storm type + metrics */
function getImpactRadius(event: StormEvent): number {
  const base: Record<string, number> = {
    TORNADO: 2500,
    HURRICANE: 35000,
    TROPICAL_STORM: 20000,
    HAIL: 4000,
    WIND: 4000,
    FLOOD: 6000,
    RAIN: 5000,
    THUNDERSTORM: 5000,
  }
  let radius = base[event.eventType] ?? 4000

  if (event.windSpeedMph && event.windSpeedMph > 40) radius += event.windSpeedMph * 60
  if (event.hailSizeInches && event.hailSizeInches > 0.5) radius += event.hailSizeInches * 3000
  if (event.rainfallInches && event.rainfallInches > 1) radius += event.rainfallInches * 1500
  if (event.tornadoEF) {
    const ef = parseInt(event.tornadoEF.replace(/\D/g, ""), 10)
    if (!isNaN(ef)) radius += ef * 1200
  }

  if (event.severity === "EXTREME") radius *= 1.8
  else if (event.severity === "HIGH") radius *= 1.4

  return Math.min(radius, 80000)
}

/** True if event occurred within the last 24 hours */
function isToday(event: StormEvent): boolean {
  return Date.now() - new Date(event.startTime).getTime() < 24 * 60 * 60 * 1000
}

export function StormEventLayer() {
  const map = useMap()
  const { data: events = [], isLoading } = useStormEvents()
  const showStormEvents = useMapStore((s) => s.filters.showStormEvents)
  const highlightedEventId = useMapStore((s) => s.highlightedEventId)

  // Auto-fly to highlighted event when arriving from news page
  useEffect(() => {
    if (!highlightedEventId || events.length === 0) return
    const ev = events.find((e) => e.id === highlightedEventId)
    if (!ev || ev.latitude == null || ev.longitude == null) return
    setTimeout(() => {
      map.flyTo([ev.latitude!, ev.longitude!], 12, { animate: true, duration: 1.5 })
    }, 400)
  }, [highlightedEventId, events, map])

  if (!showStormEvents || isLoading) return null

  const validEvents = events.filter(
    (e): e is StormEvent & { latitude: number; longitude: number } =>
      e.latitude != null && e.longitude != null
  )

  return (
    <>
      {validEvents.map((event) => {
        const color = getStormColor(event.eventType)
        const radius = getMarkerRadius(event)
        const impactRadius = getImpactRadius(event)
        const isHighlighted = event.id === highlightedEventId
        const todayEvent = isToday(event)

        const nearbyCount = validEvents.filter(
          (e) => e.county && e.county === event.county && e.eventType === event.eventType
        ).length

        const fillOpacity = isHighlighted ? 0.55 : todayEvent ? 0.40 : 0.30

        return (
          <React.Fragment key={event.id}>
            {/* Outer glow ring — always present */}
            <Circle
              center={[event.latitude, event.longitude]}
              radius={impactRadius * 1.3}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: isHighlighted ? 0.12 : 0.08,
                weight: 1,
                interactive: false,
              } as object}
            />

            {/* Solid impact zone */}
            <Circle
              center={[event.latitude, event.longitude]}
              radius={impactRadius}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity,
                weight: isHighlighted ? 3 : 2.5,
                interactive: false,
              } as object}
            />

            {/* Precise location marker */}
            <CircleMarker
              center={[event.latitude, event.longitude]}
              radius={isHighlighted ? radius + 4 : radius}
              pathOptions={{
                color: isHighlighted ? "#ffffff" : color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.95,
                weight: isHighlighted ? 3 : 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -(isHighlighted ? radius + 4 : radius)]} sticky>
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
            </CircleMarker>
          </React.Fragment>
        )
      })}
    </>
  )
}
