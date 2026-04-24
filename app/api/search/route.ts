import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) return Response.json([])

  try {
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

    if (locations.length === 0) {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)},Florida&format=json&limit=5&countrycodes=us&addressdetails=1`
      const res = await fetch(nominatimUrl, {
        headers: { "User-Agent": "storm-impact-map/1.0 (admin@stormimpactmap.com)" },
      })

      if (res.ok) {
        const data = await res.json()
        const results = data
          .filter((item: { addresstype?: string; address?: { state?: string } }) =>
            item.address?.state === "Florida" || item.addresstype === "city"
          )
          .map((item: {
            place_id: string
            display_name: string
            addresstype?: string
            address?: { city?: string; town?: string; county?: string; postcode?: string }
            lat: string
            lon: string
            boundingbox?: string[]
          }) => ({
            id: `nominatim-${item.place_id}`,
            name: item.address?.city ?? item.address?.town ?? item.display_name.split(",")[0],
            displayName: item.display_name,
            type: item.addresstype?.toUpperCase() ?? "CITY",
            state: "FL",
            county: item.address?.county ?? null,
            zipCode: item.address?.postcode ?? null,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            boundingBox: item.boundingbox
              ? [
                  [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[2])],
                  [parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[3])],
                ]
              : null,
          }))
        return Response.json(results)
      }
    }

    return Response.json(
      locations.map((l) => ({
        ...l,
        boundingBox: l.boundingBox ?? null,
      }))
    )
  } catch (err) {
    console.error("Search error:", err)
    return Response.json([])
  }
}
