import { prisma } from "@/lib/db"
import { fetchFloridaAlerts } from "@/lib/api/nws"
import { normalizeNWSEventType, NWS_SEVERITY_MAP } from "@/lib/stormColors"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const live = searchParams.get("live") !== "false"

  try {
    if (live) {
      const collection = await fetchFloridaAlerts()
      const alerts = collection.features.map((f) => ({
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
      }))
      return Response.json(alerts, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
      })
    }

    const alerts = await prisma.alert.findMany({
      where: { expires: { gte: new Date() } },
      orderBy: { effective: "desc" },
      take: 200,
    })
    return Response.json(alerts)
  } catch (err) {
    console.error("Alerts route error:", err)
    const alerts = await prisma.alert.findMany({
      where: { expires: { gte: new Date() } },
      orderBy: { effective: "desc" },
      take: 200,
    })
    return Response.json(alerts)
  }
}
