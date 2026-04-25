import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { Shield, Users, Bell, Activity, RefreshCw, Database } from "lucide-react"
import { UserManagement } from "@/components/admin/UserManagement"

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/")

  const [userCount, alertCount, eventCount, reportCount, recentAlerts, recentEvents] =
    await Promise.all([
      prisma.user.count(),
      prisma.alert.count({ where: { expires: { gte: new Date() } } }),
      prisma.stormEvent.count({
        where: { startTime: { gte: new Date(Date.now() - 30 * 86400000) } },
      }),
      prisma.report.count(),
      prisma.alert.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, areaDesc: true, severity: true, expires: true, createdAt: true },
      }),
      prisma.stormEvent.findMany({
        orderBy: { startTime: "desc" },
        take: 8,
        select: { id: true, eventType: true, locationName: true, severity: true, startTime: true, source: true },
      }),
    ])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Signed in as admin: {session.user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Alerts", value: alertCount, icon: Bell, color: "text-red-600", bg: "bg-red-50" },
          { label: "Events (30d)", value: eventCount, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
          { label: "Reports", value: reportCount, icon: Database, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Data Sync */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-1">Data Sync</h2>
        <p className="text-sm text-slate-500 mb-4">
          Manually trigger data syncs. Alerts auto-sync daily at noon UTC; storm events sync at 3 AM UTC.
        </p>
        <div className="flex flex-wrap gap-3">
          <SyncButton endpoint="/api/cron/sync-alerts" label="Sync NWS Alerts" />
          <SyncButton endpoint="/api/cron/sync-storm-events" label="Sync NOAA Events" />
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">User Management</h2>
        <UserManagement />
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Recent NWS Alerts</h2>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-slate-400">No active alerts — run a sync above.</p>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0"
                >
                  <span
                    className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5 ${
                      alert.severity === "EXTREME"
                        ? "bg-red-100 text-red-700"
                        : alert.severity === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{alert.title}</p>
                    <p className="text-xs text-slate-500">
                      {alert.areaDesc} · Expires {formatDate(alert.expires)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Storm Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Storm Events</h2>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-slate-400">No events in DB — run a sync or data will load live from NWS.</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0"
                >
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5 ${
                    evt.severity === "EXTREME" ? "bg-red-100 text-red-700"
                    : evt.severity === "HIGH" ? "bg-orange-100 text-orange-700"
                    : evt.severity === "MODERATE" ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-600"
                  }`}>
                    {evt.eventType}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{evt.locationName}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(evt.startTime)} · {evt.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SyncButton({ endpoint, label }: { endpoint: string; label: string }) {
  return (
    <form
      action={async () => {
        "use server"
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
          })
        } catch {
          // Sync runs in background; ignore fetch errors
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 active:scale-95 transition-all"
      >
        <RefreshCw className="h-4 w-4" />
        {label}
      </button>
    </form>
  )
}
