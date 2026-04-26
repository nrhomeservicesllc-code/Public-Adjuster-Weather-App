import { syncStormEvents } from "@/lib/jobs/syncStormEvents"

async function handler(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const yearRaw = url.searchParams.get("year")
  const monthRaw = url.searchParams.get("month")
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? parseInt(yearRaw) : undefined
  const month = monthRaw && /^\d{1,2}$/.test(monthRaw) ? parseInt(monthRaw) : undefined

  const result = await syncStormEvents(year, month)
  return Response.json(result)
}

export { handler as GET, handler as POST }
