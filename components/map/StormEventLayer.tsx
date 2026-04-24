"use client"

import { CircleMarker, Tooltip } from "react-leaflet"
import { useStormEvents } from "@/hooks/useStormEvents"
import { useMapStore } from "@/store/mapStore"
import { getStormColor } from "@/lib/stormColors"
import { getMarkerRadius } from "@/lib/utils"
import { StormPopup } from "./StormPopup"
import type { StormEvent } from "@/types"

export function StormEventLayer() {
  const { data: events = [], isLoading } = useStormEvents()
  const showStormEvents = useMapStore((s) => s.filters.showStormEvents)

  if (!showStormEvents || isLoading) return null

  const validEvents = events.filter(
    (e): e is StormEvent & { latitude: number; longitude: number } =>
      e.latitude !== null &&
      e.latitude !== undefined &&
      e.longitude !== null &&
      e.longitude !== undefined
  )

  return (
    <>
      {validEvents.map((event) => {
        const color = getStormColor(event.eventType)
        const radius = getMarkerRadius(event)

        return (
          <CircleMarker
            key={event.id}
            center={[event.latitude, event.longitude]}
            radius={radius}
            pathOptions={{
              color: color.stroke,
              fillColor: color.fill,
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -radius]}>
              <span className="font-semibold">{color.label}</span>
              <br />
              {event.locationName}
            </Tooltip>
            <StormPopup event={event} />
          </CircleMarker>
        )
      })}
    </>
  )
}
