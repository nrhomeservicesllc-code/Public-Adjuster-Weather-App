import { prisma } from "@/lib/db"
import { fetchFloridaAlerts } from "@/lib/api/nws"
import { sendEmail, buildStormAlertEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

// Runs every 30 minutes. Checks NWS active alerts against saved areas
// and sends one email per user per alert (deduplicated via DB flag).

async function handler(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch live NWS alerts
  let liveAlerts: Array<{ id: string; title: string; severity: string; areaDesc: string; expires: string; rawGeometry: unknown }> = []
  try {
    const collection = await fetchFloridaAlerts()
    liveAlerts = collection.features.map((f) => ({
      id: f.properties.id,
      title: f.properties.headline ?? f.properties.event,
      severity: f.properties.severity ?? "MODERATE",
      areaDesc: f.properties.areaDesc ?? "",
      expires: f.properties.expires ?? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      rawGeometry: f.geometry,
    }))
  } catch {
    return Response.json({ error: "NWS fetch failed" }, { status: 503 })
  }

  if (liveAlerts.length === 0) {
    return Response.json({ notified: 0 })
  }

  // Get all saved areas with user emails
  const savedAreas = await prisma.savedArea.findMany({
    select: {
      id: true,
      name: true,
      geoJson: true,
      user: { select: { id: true, email: true, name: true } },
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://claimcast.app"
  let notified = 0

  for (const alert of liveAlerts) {
    // Get alert centroid
    let alertLng: number | null = null
    let alertLat: number | null = null
    try {
      const geo = alert.rawGeometry as { type: string; coordinates: unknown } | null
      if (geo?.type === "Point") {
        [alertLng, alertLat] = geo.coordinates as number[]
      } else if (geo?.type === "Polygon") {
        const ring = (geo.coordinates as number[][][])[0]
        alertLng = ring.reduce((s, c) => s + c[0], 0) / ring.length
        alertLat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      } else if (geo?.type === "MultiPolygon") {
        const firstRing = (geo.coordinates as number[][][][])[0][0]
        alertLng = firstRing.reduce((s, c) => s + c[0], 0) / firstRing.length
        alertLat = firstRing.reduce((s, c) => s + c[1], 0) / firstRing.length
      }
    } catch { /* skip geometry */ }

    for (const area of savedAreas) {
      if (!area.user?.email) continue

      // Check proximity (200km radius for NWS zone alerts)
      if (alertLat !== null && alertLng !== null) {
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

          const dLat = (aLat - alertLat) * (Math.PI / 180)
          const dLng = (aLng - alertLng) * (Math.PI / 180)
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(alertLat * (Math.PI / 180)) *
            Math.cos(aLat * (Math.PI / 180)) *
            Math.sin(dLng / 2) ** 2
          const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          if (distKm > 200) continue
        } catch { continue }
      }

      // Deduplicate: store notification record in DB (use Report table with a special marker)
      const dedupKey = `notify:${alert.id}:${area.user.id}`
      const alreadySent = await prisma.report.findFirst({
        where: { userId: area.user.id, areaName: dedupKey },
      })
      if (alreadySent) continue

      // Record dedup first (prevent duplicate sends if job overlaps)
      await prisma.report.create({
        data: {
          userId: area.user.id,
          areaName: dedupKey,
          geoJson: { type: "Point", coordinates: [alertLng ?? -81.76, alertLat ?? 27.99] },
          stormEventIds: [],
          alertIds: [alert.id],
          summary: null,
        },
      })

      const expiresLabel = new Date(alert.expires).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York",
      }) + " ET"

      await sendEmail({
        to: area.user.email,
        subject: `⚠️ Storm Alert Near "${area.name}" — ${alert.title}`,
        html: buildStormAlertEmail({
          userName: area.user.name ?? null,
          savedAreaName: area.name,
          alertTitle: alert.title,
          alertSeverity: alert.severity,
          alertAreaDesc: alert.areaDesc,
          alertExpires: expiresLabel,
          mapUrl: `${appUrl}/map?aid=${encodeURIComponent(alert.id)}`,
        }),
      })

      notified++
    }
  }

  return Response.json({ notified, alertsChecked: liveAlerts.length })
}

export { handler as GET, handler as POST }
