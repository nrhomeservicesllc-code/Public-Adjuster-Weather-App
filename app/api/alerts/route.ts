import { prisma } from "@/lib/db"
import { fetchFloridaAlerts } from "@/lib/api/nws"
import { normalizeNWSEventType, NWS_SEVERITY_MAP } from "@/lib/stormColors"

export const dynamic = "force-dynamic"

function mapNWSFeature(f: Parameters<typeof normalizeNWSEventType>[0] extends never ? never : import("@/types").NWSAlertFeature) {
  return {
    id: f.properties.id,
    nwsId: f.properties.id,
    title: f.properties.headline ?? f.properties.event,
    description: f.properties.description ?? "",
    eventType: normalizeNWSEventType(f.properties.event),
    areaDesc: f.properties.areaDesc ?? "",
    severity: NWS_SEVERITY_MAP[f.properties.severity] ?? "LOW",
    urgency: f.properties.urgency ?? "Unknown",
    certainty: f.properties.certainty ?? "Unknown",
    effective: f.properties.effective,
    expires: f.properties.expires,
    sourceUrl: f.properties.url ?? "",
    rawGeometry: f.geometry,
    createdAt: new Date().toISOString(),
  }
}

export async function GET() {
  // 1. Try live NWS first (fastest, most up-to-date)
  try {
    const collection = await fetchFloridaAlerts()
    const alerts = collection.features.map(mapNWSFeature)
    return Response.json(alerts, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    })
  } catch (nwsErr) {
    console.error("NWS alerts fetch failed:", nwsErr)
    // fall through to DB
  }

  // 2. Try cached DB alerts — keep alerts visible for 24h after expiry
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const alerts = await prisma.alert.findMany({
      where: { expires: { gte: cutoff } },
      orderBy: { effective: "desc" },
      take: 200,
    })
    return Response.json(alerts)
  } catch (dbErr) {
    console.error("DB alerts fetch failed:", dbErr)
    // fall through to empty response
  }

  // 3. Both unavailable — return empty so the UI shows gracefully
  return Response.json([])
}
