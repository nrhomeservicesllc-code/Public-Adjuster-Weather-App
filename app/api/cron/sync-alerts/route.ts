import { syncAlerts } from "@/lib/jobs/syncAlerts"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const result = await syncAlerts()
  return Response.json(result)
}
