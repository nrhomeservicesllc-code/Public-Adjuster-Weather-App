"use client"

import { Circle, CircleMarker, Tooltip } from "react-leaflet"
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

export function StormEventLayer() {
  const { data: events = [], isLoading } = useStormEvents()
  const showStormEvents = useMapStore((s) => s.filters.showStormEvents)

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

        // How many same-type events in same county (for popup context)
        const nearbyCount = validEvents.filter(
          (e) => e.county && e.county === event.county && e.eventType === event.eventType
        ).length

        return (
          <React.Fragment key={event.id}>
            {/* Impact area — non-interactive so clicks pass through to the marker */}
            <Circle
              center={[event.latitude, event.longitude]}
              radius={impactRadius}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.07,
                weight: 1,
                dashArray: "5 5",
                interactive: false,
              } as object}
            />

            {/* Precise location marker */}
            <CircleMarker
              center={[event.latitude, event.longitude]}
              radius={radius}
              pathOptions={{
                color: color.stroke,
                fillColor: color.fill,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]} sticky>
                <div className="text-xs">
                  <span className="font-bold">{color.label}</span>
                  {" · "}
                  <span>{event.locationName}</span>
                  {event.severity !== "LOW" && (
                    <span className="ml-1 opacity-70">({event.severity})</span>
                  )}
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

// React needs to be in scope for JSX Fragments
import React from "react"
