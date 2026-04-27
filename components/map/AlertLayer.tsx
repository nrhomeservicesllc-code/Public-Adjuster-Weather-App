"use client"

import { useEffect } from "react"
import { GeoJSON, Tooltip, useMap } from "react-leaflet"
import { useAlerts } from "@/hooks/useAlerts"
import { useMapStore } from "@/store/mapStore"
import { getStormColor } from "@/lib/stormColors"
import type { NWSAlert } from "@/types"
import type { PathOptions, Layer } from "leaflet"
import type { GeoJsonObject } from "geojson"

function geometryCenter(geom: { type: string; coordinates: unknown } | null | undefined): { lat: number; lng: number } | null {
  if (!geom) return null
  try {
    if (geom.type === "Point") {
      const [lng, lat] = geom.coordinates as number[]
      return { lat, lng }
    }
    if (geom.type === "Polygon") {
      const ring = (geom.coordinates as number[][][])[0]
      return {
        lat: ring.reduce((s, c) => s + c[1], 0) / ring.length,
        lng: ring.reduce((s, c) => s + c[0], 0) / ring.length,
      }
    }
    if (geom.type === "MultiPolygon") {
      const ring = ((geom.coordinates as number[][][][])[0])[0]
      return {
        lat: ring.reduce((s, c) => s + c[1], 0) / ring.length,
        lng: ring.reduce((s, c) => s + c[0], 0) / ring.length,
      }
    }
  } catch { /* fall through */ }
  return null
}

export function AlertLayer() {
  const map = useMap()
  const { data: alerts = [] } = useAlerts()
  const showAlerts = useMapStore((s) => s.filters.showAlerts)
  const setSelectedAlert = useMapStore((s) => s.setSelectedAlert)
  const highlightedAlertId = useMapStore((s) => s.highlightedAlertId)

  // Auto-fly to highlighted alert when arriving from news page
  useEffect(() => {
    if (!highlightedAlertId || alerts.length === 0) return
    const alert = alerts.find((a) => a.id === highlightedAlertId || a.nwsId === highlightedAlertId)
    if (!alert) return
    const center = geometryCenter(alert.rawGeometry)
    if (center) {
      setTimeout(() => {
        map.flyTo([center.lat, center.lng], 10, { animate: true, duration: 1.5 })
      }, 400)
    }
    setSelectedAlert(alert)
  }, [highlightedAlertId, alerts, map, setSelectedAlert])

  if (!showAlerts) return null

  const alertsWithGeometry = alerts.filter((a) => a.rawGeometry)

  return (
    <>
      {alertsWithGeometry.map((alert) => {
        const color = getStormColor(alert.eventType)
        const isHighlighted = alert.id === highlightedAlertId || alert.nwsId === highlightedAlertId

        const style: PathOptions = isHighlighted
          ? {
              color: color.stroke,
              fillColor: color.fill,
              fillOpacity: 0.45,
              weight: 3,
              dashArray: undefined,
            }
          : {
              color: color.stroke,
              fillColor: color.fill,
              fillOpacity: 0.18,
              weight: 2,
              dashArray: "6 4",
            }

        const onEachFeature = (_: unknown, layer: Layer) => {
          layer.on("click", () => setSelectedAlert(alert))
        }

        return (
          <GeoJSON
            key={`${alert.id}-${isHighlighted}`}
            data={alert.rawGeometry as GeoJsonObject}
            style={style}
            onEachFeature={onEachFeature}
          >
            <Tooltip sticky>
              <span className="font-semibold">{alert.title}</span>
              <br />
              <span className="text-xs">{alert.areaDesc}</span>
              {isHighlighted && (
                <>
                  <br />
                  <span className="text-xs font-bold" style={{ color: color.stroke }}>⚡ Currently highlighted</span>
                </>
              )}
            </Tooltip>
          </GeoJSON>
        )
      })}
    </>
  )
}
