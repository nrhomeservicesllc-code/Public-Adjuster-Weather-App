"use client"

import { useEffect, useState } from "react"
import { FileText, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Report } from "@/types"

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => setReports(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-700" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">{reports.length} generated reports</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
        <strong>Disclaimer:</strong> Reports reflect storm exposure data only. They do not confirm
        property damage. Always conduct a proper on-site inspection before making property damage claims.
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No reports yet</p>
          <p className="text-sm mt-1">Create a report from any storm event on the map</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate">{report.areaName}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Generated {formatDate(report.generatedAt, "long")} ·{" "}
                    {report.stormEventIds.length} events · {report.alertIds.length} alerts
                  </p>
                  {report.summary && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{report.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/api/reports/${report.id}/pdf`, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
