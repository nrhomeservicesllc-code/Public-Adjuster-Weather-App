"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { GeoJsonGeometry } from "@/types"

interface Props {
  geoJson: GeoJsonGeometry
  defaultName?: string
  trigger?: React.ReactNode
  onSaved?: (id: string) => void
}

export function SaveAreaDialog({ geoJson, defaultName = "", trigger, onSaved }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultName)
  const [notes, setNotes] = useState("")
  const [isProspecting, setIsProspecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!name.trim()) { setError("Area name is required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/saved-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), notes: notes.trim() || undefined, isProspecting, geoJson }),
      })
      if (!res.ok) throw new Error("Failed to save area")
      const data = await res.json()
      onSaved?.(data.id)
      setOpen(false)
      setName(defaultName)
      setNotes("")
      setIsProspecting(false)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Bookmark className="h-4 w-4 mr-1" />
            Save Area
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Area</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="area-name">Area Name *</Label>
            <Input
              id="area-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kendall Hail Zone - June 2025"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="area-notes">Notes</Label>
            <Textarea
              id="area-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this area..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="prospecting">Mark as Prospecting Area</Label>
            <Switch id="prospecting" checked={isProspecting} onCheckedChange={setIsProspecting} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Area"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
