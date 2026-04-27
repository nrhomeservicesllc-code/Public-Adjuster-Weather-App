import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

// Runs after the 24h grace window: archives recently-expired alerts as
// Previous Reports for any user whose saved area overlaps the alert zone.
async function handler(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Alerts expired in the last 25h but NOT yet archived (we check a flag via Report deduplication)
  const window25h = new Date(Date.now() - 25 * 60 * 60 * 1000)
  const window1h = new Date(Date.now() - 60 * 60 * 1000)

  let expiredAlerts: Array<{ id: string; nwsId: string; title: string; areaDesc: string; severity: string; effective: Date; expires: Date; rawGeometry: unknown }> = []
  try {
    expiredAlerts = await prisma.alert.findMany({
      where: {
        expires: { gte: window25h, lt: window1h },
      },
      select: {
        id: true,
        nwsId: true,
        title: true,
        areaDesc: true,
        severity: true,
        effective: true,
        expires: true,
        rawGeometry: true,
      },
    })
  } catch {
    return Response.json({ error: "DB unavailable" }, { status: 503 })
  }

  if (expiredAlerts.length === 0) {
    return Response.json({ archived: 0 })
  }

  // Get all users with saved areas
  const savedAreas = await prisma.savedArea.findMany({
    select: { id: true, userId: true, name: true, geoJson: true },
  })

  let archived = 0

  for (const alert of expiredAlerts) {
    // Avoid duplicate archival: check if a report already references this alert
    const existing = await prisma.report.findFirst({
      where: { alertIds: { has: alert.id } },
    })
    if (existing) continue

    // Build a centroid from rawGeometry for the report geoJson
    let geoJson: object = { type: "Point", coordinates: [-81.76, 27.99] } // FL center fallback
    try {
      const geo = alert.rawGeometry as { type: string; coordinates: unknown } | null
      if (geo?.type === "Point") {
        geoJson = geo
      } else if (geo?.type === "Polygon") {
        const ring = (geo.coordinates as number[][][])[0]
        const lng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length
        const lat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length
        geoJson = { type: "Point", coordinates: [lng, lat] }
      } else if (geo?.type === "MultiPolygon") {
        const firstRing = (geo.coordinates as number[][][][])[0][0]
        const lng = firstRing.reduce((s: number, c: number[]) => s + c[0], 0) / firstRing.length
        const lat = firstRing.reduce((s: number, c: number[]) => s + c[1], 0) / firstRing.length
        geoJson = { type: "Point", coordinates: [lng, lat] }
      }
    } catch { /* use fallback */ }

    // Find nearby saved areas using simple haversine check
    const affectedUserIds = new Set<string>()
    const alertCenter = (geoJson as { type: string; coordinates: number[] }).coordinates

    for (const area of savedAreas) {
      try {
        const areaGeo = area.geoJson as { type: string; coordinates: number[] | number[][][] }
        let aLng: number, aLat: number
        if (areaGeo.type === "Point") {
          [aLng, aLat] = areaGeo.coordinates as number[]
        } else if (areaGeo.type === "Polygon") {
          const ring = (areaGeo.coordinates as number[][][])[0]
          aLng = ring.reduce((s, c) => s + c[0], 0) / ring.length
          aLat = ring.reduce((s, c) => s + c[1], 0) / ring.length
        } else continue

        // ~200km radius — NWS alerts cover large zones
        const dLat = (aLat - alertCenter[1]) * (Math.PI / 180)
        const dLng = (aLng - alertCenter[0]) * (Math.PI / 180)
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(alertCenter[1] * (Math.PI / 180)) *
          Math.cos(aLat * (Math.PI / 180)) *
          Math.sin(dLng / 2) ** 2
        const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        if (distKm <= 200) {
          affectedUserIds.add(area.userId)
        }
      } catch { /* skip malformed area */ }
    }

    // Create one archived report per affected user
    const userIds = Array.from(affectedUserIds)
    if (userIds.length === 0) {
      // Still archive under a system-level record if no saved areas match
      // We skip to avoid polluting individual users' histories with unrelated alerts
      continue
    }

    await Promise.allSettled(
      userIds.map((userId) =>
        prisma.report.create({
          data: {
            userId,
            areaName: alert.title || `NWS Alert — ${alert.areaDesc}`,
            geoJson,
            stormEventIds: [],
            alertIds: [alert.id],
            summary: `NWS alert for ${alert.areaDesc}. Severity: ${alert.severity}. ` +
              `Active from ${alert.effective.toISOString().slice(0, 16)} UTC to ` +
              `${alert.expires.toISOString().slice(0, 16)} UTC. Auto-archived after expiry.`,
          },
        })
      )
    )
    archived++
  }

  return Response.json({ archived, checked: expiredAlerts.length })
}

export { handler as GET, handler as POST }
