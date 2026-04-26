import { searchFLLocations } from "@/lib/florida-locations"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

// Strip anything that isn't alphanumeric, space, period, hyphen, or apostrophe
function sanitizeQuery(q: string): string {
  return q.replace(/[^a-zA-Z0-9\s.\-']/g, "").trim().slice(0, 80)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get("q") ?? ""
  const q = sanitizeQuery(raw)

  if (q.length < 2) return Response.json([])

  // 1. Static FL location data — instant, no network needed
  const staticResults = searchFLLocations(q, 8)
  if (staticResults.length > 0) {
    return Response.json(staticResults)
  }

  // 2. DB locations (seeded data)
  try {
    const dbResults = await prisma.location.findMany({
      where: {
        state: "FL",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
          { county: { contains: q, mode: "insensitive" } },
          { zipCode: { startsWith: q } },
        ],
      },
      take: 8,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    })
    if (dbResults.length > 0) {
      return Response.json(dbResults.map((l) => ({ ...l, boundingBox: l.boundingBox ?? null })))
    }
  } catch {
    // DB might be unavailable — continue to Nominatim fallback
  }

  // 3. Nominatim geocoding — last resort, short timeout
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(q + " Florida")}&format=json&limit=6&countrycodes=us&addressdetails=1`

    const res = await fetch(url, {
      headers: { "User-Agent": "ClaimCast/1.0 contact@claimcast.com" },
      signal: AbortSignal.timeout(4000),
    })

    if (res.ok) {
      const data: Array<{
        place_id: string
        display_name: string
        addresstype?: string
        address?: { city?: string; town?: string; village?: string; county?: string; state?: string; postcode?: string }
        lat: string
        lon: string
        boundingbox?: string[]
      }> = await res.json()

      const results = data
        .filter((item) => {
          const state = item.address?.state
          return !state || state === "Florida" || state === "FL"
        })
        .map((item) => {
          const cityName =
            item.address?.city ?? item.address?.town ?? item.address?.village ??
            item.display_name.split(",")[0].trim()
          const type =
            item.addresstype === "postcode" ? "ZIP"
            : item.addresstype === "administrative" ? "COUNTY"
            : "CITY"
          const bb = item.boundingbox
          return {
            id: `nom-${item.place_id}`,
            name: cityName,
            displayName: item.display_name,
            type,
            state: "FL",
            county: item.address?.county ?? null,
            zipCode: item.address?.postcode ?? null,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            boundingBox: bb
              ? [[parseFloat(bb[0]), parseFloat(bb[2])], [parseFloat(bb[1]), parseFloat(bb[3])]]
              : null,
          }
        })

      return Response.json(results)
    }
  } catch {
    // Nominatim unavailable — return empty
  }

  return Response.json([])
}
