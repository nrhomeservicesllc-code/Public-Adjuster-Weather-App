import { prisma } from "@/lib/db"
import { fetchFloridaAlerts, fetchZoneGeometry } from "@/lib/api/nws"
import { normalizeNWSEventType, NWS_SEVERITY_MAP } from "@/lib/stormColors"

export async function syncAlerts(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = []
  let synced = 0

  try {
    const collection = await fetchFloridaAlerts()

    for (const feature of collection.features) {
      try {
        const props = feature.properties
        let geometry = feature.geometry

        if (!geometry && props.id) {
          const zoneMatch = props.areaDesc?.match(/\b([A-Z]{2}[ZC]\d{3})\b/)
          if (zoneMatch) {
            const zoneId = zoneMatch[1]
            const zoneType = zoneId.includes("Z") ? "forecast" : "county"
            geometry = await fetchZoneGeometry(zoneType, zoneId)
          }
        }

        const eventType = normalizeNWSEventType(props.event)
        const severity = NWS_SEVERITY_MAP[props.severity] ?? "LOW"

        await prisma.alert.upsert({
          where: { nwsId: props.id },
          create: {
            nwsId: props.id,
            title: props.headline ?? props.event,
            description: props.description ?? "",
            eventType,
            areaDesc: props.areaDesc ?? "",
            severity,
            urgency: props.urgency ?? "Unknown",
            certainty: props.certainty ?? "Unknown",
            effective: new Date(props.effective),
            expires: new Date(props.expires),
            sourceUrl: props.url ?? `https://api.weather.gov/alerts/${props.id}`,
            rawGeometry: geometry ? (geometry as object) : undefined,
          },
          update: {
            title: props.headline ?? props.event,
            description: props.description ?? "",
            areaDesc: props.areaDesc ?? "",
            severity,
            expires: new Date(props.expires),
            rawGeometry: geometry ? (geometry as object) : undefined,
          },
        })
        synced++
      } catch (err) {
        errors.push(`Alert ${feature.properties.id}: ${String(err)}`)
      }
    }

    // Keep alerts for 25h after expiry so the 24h grace window in the API stays intact
    const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000)
    await prisma.alert.deleteMany({
      where: { expires: { lt: cutoff } },
    })
  } catch (err) {
    errors.push(`Fetch error: ${String(err)}`)
  }

  return { synced, errors }
}
