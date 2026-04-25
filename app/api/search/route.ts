import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) return Response.json([])

  try {
    // Try DB first
    const locations = await prisma.location.findMany({
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

    if (locations.length > 0) {
      return Response.json(locations.map((l) => ({ ...l, boundingBox: l.boundingBox ?? null })))
    }

    // Fallback: Nominatim geocoding
    const nominatimUrl =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(q + ", Florida, USA")}` +
      `&format=json&limit=8&countrycodes=us&addressdetails=1`

    const res = await fetch(nominatimUrl, {
      headers: { "User-Agent": "storm-impact-map/1.0 (admin@stormimpactmap.com)" },
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      const data: Array<{
        place_id: string
        display_name: string
        addresstype?: string
        type?: string
        address?: {
          city?: string
          town?: string
          village?: string
          county?: string
          state?: string
          postcode?: string
        }
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
            item.address?.city ??
            item.address?.town ??
            item.address?.village ??
            item.display_name.split(",")[0].trim()

          const type = item.addresstype === "postcode" ? "ZIP"
            : item.addresstype === "administrative" ? "COUNTY"
            : "CITY"

          const bb = item.boundingbox
          const boundingBox = bb
            ? [[parseFloat(bb[0]), parseFloat(bb[2])], [parseFloat(bb[1]), parseFloat(bb[3])]]
            : null

          return {
            id: `nominatim-${item.place_id}`,
            name: cityName,
            displayName: item.display_name,
            type,
            state: "FL",
            county: item.address?.county ?? null,
            zipCode: item.address?.postcode ?? null,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            boundingBox,
          }
        })

      return Response.json(results)
    }

    return Response.json([])
  } catch (err) {
    console.error("Search error:", err)
    return Response.json([])
  }
}
