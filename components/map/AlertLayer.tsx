"use client"

import { GeoJSON, Tooltip } from "react-leaflet"
import { useAlerts } from "@/hooks/useAlerts"
import { useMapStore } from "@/store/mapStore"
import { getStormColor } from "@/lib/stormColors"
import type { NWSAlert } from "@/types"
import type { PathOptions, Layer } from "leaflet"
import type { GeoJsonObject } from "geojson"

export function AlertLayer() {
  const { data: alerts = [] } = useAlerts()
  const showAlerts = useMapStore((s) => s.filters.showAlerts)
  const setSelectedAlert = useMapStore((s) => s.setSelectedAlert)

  if (!showAlerts) return null

  const alertsWithGeometry = alerts.filter((a) => a.rawGeometry)

  return (
    <>
      {alertsWithGeometry.map((alert) => {
        const color = getStormColor(alert.eventType)

        const style: PathOptions = {
          color: color.stroke,
          fillColor: color.fill,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: "6 4",
        }

        const onEachFeature = (_: unknown, layer: Layer) => {
          layer.on("click", () => setSelectedAlert(alert))
        }

        return (
          <GeoJSON
            key={alert.id}
            data={alert.rawGeometry as GeoJsonObject}
            style={style}
            onEachFeature={onEachFeature}
          >
            <Tooltip sticky>
              <span className="font-semibold">{alert.title}</span>
              <br />
              <span className="text-xs">{alert.areaDesc}</span>
            </Tooltip>
          </GeoJSON>
        )
      })}
    </>
  )
}
