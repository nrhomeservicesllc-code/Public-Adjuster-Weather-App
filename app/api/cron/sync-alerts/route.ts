import { syncAlerts } from "@/lib/jobs/syncAlerts"

async function handler(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const result = await syncAlerts()
  return Response.json(result)
}

export { handler as GET, handler as POST }
