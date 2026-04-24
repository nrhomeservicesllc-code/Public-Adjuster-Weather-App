import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { Shield, Users, Bell, RefreshCw } from "lucide-react"

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/")

  const [userCount, alertCount, eventCount, recentAlerts] = await Promise.all([
    prisma.user.count(),
    prisma.alert.count({ where: { expires: { gte: new Date() } } }),
    prisma.stormEvent.count({ where: { startTime: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, areaDesc: true, severity: true, expires: true, createdAt: true },
    }),
  ])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-6 w-6 text-blue-700" />
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Users", value: userCount, icon: Users, color: "text-blue-600" },
          { label: "Active NWS Alerts", value: alertCount, icon: Bell, color: "text-red-600" },
          { label: "Events (30 days)", value: eventCount, icon: RefreshCw, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Data Sync</h2>
        <div className="flex flex-wrap gap-3">
          <SyncButton endpoint="/api/cron/sync-alerts" label="Sync NWS Alerts" />
          <SyncButton endpoint="/api/cron/sync-storm-events" label="Sync NOAA Events" />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Alerts sync automatically every 15 minutes. NOAA events sync daily at 3 AM UTC.
          These buttons trigger a manual sync (requires CRON_SECRET header in production).
        </p>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Recent NWS Alerts</h2>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5 ${
                alert.severity === "EXTREME" ? "bg-red-100 text-red-700"
                : alert.severity === "HIGH" ? "bg-orange-100 text-orange-700"
                : "bg-yellow-100 text-yellow-700"
              }`}>
                {alert.severity}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.areaDesc} · Expires {formatDate(alert.expires)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SyncButton({ endpoint, label }: { endpoint: string; label: string }) {
  return (
    <form action={async () => {
      "use server"
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
    }}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        {label}
      </button>
    </form>
  )
}
