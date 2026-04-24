import { syncStormEvents } from "@/lib/jobs/syncStormEvents"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const year = url.searchParams.get("year")
    ? parseInt(url.searchParams.get("year")!)
    : undefined
  const month = url.searchParams.get("month")
    ? parseInt(url.searchParams.get("month")!)
    : undefined

  const result = await syncStormEvents(year, month)
  return Response.json(result)
}
