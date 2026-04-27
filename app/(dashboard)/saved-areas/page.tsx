"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bookmark, MapPin, Trash2, Star, Bell, Map, Plus, Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/utils"
import { searchFLLocations } from "@/lib/florida-locations"
import type { SavedArea } from "@/types"

function AddAreaForm({ onSaved }: { onSaved: (area: SavedArea) => void }) {
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [isProspecting, setIsProspecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!name.trim()) { setError("Area name is required."); return }

    // Resolve the location to coordinates
    const matches = location.trim() ? searchFLLocations(location.trim(), 1) : []
    const coords = matches.length > 0
      ? { lat: matches[0].latitude, lng: matches[0].longitude }
      : null

    const geoJson = coords
      ? { type: "Point", coordinates: [coords.lng, coords.lat] }
      : { type: "Point", coordinates: [-81.7603, 27.9944] } // Florida center fallback

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/saved-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          notes: notes.trim() || undefined,
          isProspecting,
          geoJson,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      onSaved(data)
      setName(""); setLocation(""); setNotes(""); setIsProspecting(false); setShow(false)
    } catch {
      setError("Failed to save area. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!show) {
    return (
      <Button onClick={() => setShow(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add New Area
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-5 space-y-4">
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        <Plus className="h-4 w-4 text-blue-600" />
        Save New Area
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-name">Area Name *</Label>
          <Input
            id="new-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Miami-Dade Hail Zone"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="new-location">Florida Location (city / county)</Label>
          <Input
            id="new-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Miami, Orlando, Tampa…"
            className="mt-1"
          />
          <p className="text-xs text-slate-400 mt-0.5">Leave blank to save a general FL area. Or save directly from the map by clicking a storm event.</p>
        </div>
      </div>
      <div>
        <Label htmlFor="new-notes">Notes</Label>
        <Textarea
          id="new-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add context — client address, claim number, etc."
          rows={2}
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="new-prospecting">Mark as Prospecting Area</Label>
        <Switch id="new-prospecting" checked={isProspecting} onCheckedChange={setIsProspecting} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Area"}
        </Button>
      </div>
    </div>
  )
}

export default function SavedAreasPage() {
  const router = useRouter()
  const [areas, setAreas] = useState<SavedArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/saved-areas")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setAreas(data) : setAreas([]))
      .catch(() => setAreas([]))
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

  const viewOnMap = (area: SavedArea) => {
    try {
      const geo = area.geoJson as { type: string; coordinates: number[] | number[][][] }
      let lat: number, lng: number
      if (geo.type === "Point") {
        [lng, lat] = geo.coordinates as number[]
      } else if (geo.type === "Polygon") {
        const ring = (geo.coordinates as number[][][])[0]
        lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
        lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      } else return
      router.push(`/map?lat=${lat}&lng=${lng}&zoom=12`)
    } catch { /* no coords available */ }
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Saved Areas</h1>
            <p className="text-sm text-slate-500">{areas.length} saved location{areas.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <AddAreaForm onSaved={(a) => setAreas((prev) => [a, ...prev])} />
      </div>

      {/* Email notification banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
        <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Storm Email Alerts Active</p>
          <p className="text-blue-700 mt-0.5">
            When a new NWS alert or storm event is detected near any of your saved areas, you&apos;ll receive
            an email notification automatically. Make sure your account email is correct.
          </p>
          <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Notifications sent to your registered email address.
          </p>
        </div>
      </div>

      {/* Add-from-map tip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 items-start text-sm text-slate-600">
        <Map className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Tip:</strong> You can also save areas directly from the map — click any storm event marker
          and press <strong>&quot;📍 Save Area&quot;</strong> to bookmark that location instantly.
        </p>
      </div>

      {/* Area list */}
      {areas.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-lg">No saved areas yet</p>
          <p className="text-sm mt-1">Add an area above, or click a storm event on the map and press &quot;📍 Save Area&quot;.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{area.name}</h3>
                    {area.isProspecting && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                        <Star className="h-3 w-3 mr-1 fill-amber-500" />
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

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => viewOnMap(area)}
                    title="View on map"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleToggleProspecting(area)}
                    title={area.isProspecting ? "Remove prospecting flag" : "Mark as prospecting"}
                  >
                    <Star className={`h-4 w-4 ${area.isProspecting ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
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
