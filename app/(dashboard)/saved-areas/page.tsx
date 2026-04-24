"use client"

import { useEffect, useState } from "react"
import { Bookmark, MapPin, Trash2, FileText, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { SavedArea } from "@/types"

export default function SavedAreasPage() {
  const [areas, setAreas] = useState<SavedArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/saved-areas")
      .then((r) => r.json())
      .then((data) => setAreas(data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved area?")) return
    await fetch(`/api/saved-areas/${id}`, { method: "DELETE" })
    setAreas((prev) => prev.filter((a) => a.id !== id))
  }

  const handleToggleProspecting = async (area: SavedArea) => {
    const res = await fetch(`/api/saved-areas/${area.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isProspecting: !area.isProspecting }),
    })
    if (res.ok) {
      setAreas((prev) =>
        prev.map((a) => a.id === area.id ? { ...a, isProspecting: !area.isProspecting } : a)
      )
    }
  }

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
        <Bookmark className="h-6 w-6 text-blue-700" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saved Areas</h1>
          <p className="text-sm text-slate-500">{areas.length} saved locations</p>
        </div>
      </div>

      {areas.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No saved areas yet</p>
          <p className="text-sm mt-1">Click on any storm event on the map and select &quot;Save Area&quot;</p>
        </div>
      ) : (
        <div className="space-y-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{area.name}</h3>
                    {area.isProspecting && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Prospecting
                      </Badge>
                    )}
                  </div>
                  {area.notes && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{area.notes}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>Saved {formatDate(area.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => handleToggleProspecting(area)}
                    title={area.isProspecting ? "Remove prospecting flag" : "Mark as prospecting"}
                  >
                    <Star className={`h-4 w-4 ${area.isProspecting ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => window.open(`/api/reports/new?areaId=${area.id}`, "_blank")}
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(area.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
