"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Download, Trash2, Map, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Report } from "@/types"

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setReports(data) : setReports([]))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return
    setDeleting(id)
    try {
      await fetch(`/api/reports/${id}`, { method: "DELETE" })
      setReports((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const viewOnMap = (report: Report) => {
    try {
      const geo = report.geoJson as { type: string; coordinates: number[] | number[][][] } | null
      if (!geo) return
      let lat: number, lng: number
      if (geo.type === "Point") {
        [lng, lat] = geo.coordinates as number[]
      } else if (geo.type === "Polygon") {
        const ring = (geo.coordinates as number[][][])[0]
        lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
        lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      } else return
      // Pass first storm event ID for highlighting
      const eid = report.stormEventIds[0] ?? ""
      const aid = report.alertIds[0] ?? ""
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng), zoom: "12" })
      if (eid) params.set("eid", eid)
      else if (aid) params.set("aid", aid)
      router.push(`/map?${params}`)
    } catch { /* no coords */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Previous Reports</h1>
          <p className="text-sm text-slate-500">
            {reports.length} storm report{reports.length !== 1 ? "s" : ""} — saved from the map or auto-archived
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong>Disclaimer:</strong> Reports reflect storm exposure data only. They do not confirm
          property damage. Always conduct a proper on-site inspection before making property damage claims.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-lg">No previous reports yet</p>
          <p className="text-sm mt-1">
            Click a storm event on the map and press <strong>&quot;Save to Previous Reports&quot;</strong> to archive it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const hasCoords = !!report.geoJson
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-base truncate">{report.areaName}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(report.generatedAt, "long")}
                      </span>
                      {report.stormEventIds.length > 0 && (
                        <span className="text-blue-600 font-semibold">{report.stormEventIds.length} storm event{report.stormEventIds.length !== 1 ? "s" : ""}</span>
                      )}
                      {report.alertIds.length > 0 && (
                        <span className="text-red-600 font-semibold">{report.alertIds.length} NWS alert{report.alertIds.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>

                    {report.summary && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">{report.summary}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {hasCoords && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => viewOnMap(report)}
                        title="View affected area on map"
                      >
                        <Map className="h-3.5 w-3.5 text-blue-600" />
                        View on Map
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => window.open(`/api/reports/${report.id}/pdf`, "_blank")}
                    >
                      <Download className="h-3.5 w-3.5 text-green-600" />
                      Download PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={deleting === report.id}
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
