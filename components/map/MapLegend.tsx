"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { STORM_COLORS } from "@/lib/stormColors"

export function MapLegend() {
  const [open, setOpen] = useState(false)

  return (
    /* bottom-[72px] on mobile clears the 64px bottom nav + 8px gap.
       md:bottom-12 sits above the Leaflet zoom controls on desktop.    */
    <div className="absolute bottom-[72px] left-3 z-[400] bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden md:bottom-12 md:left-auto md:right-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 gap-3"
      >
        <span>Storm Types</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-1.5 min-w-[140px]">
          {Object.entries(STORM_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: val.fill }}
              />
              <span className="text-xs text-slate-700">{val.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 border-2 border-dashed border-blue-600 bg-blue-100" />
            <span className="text-xs text-slate-700">NWS Alert Zone</span>
          </div>
        </div>
      )}
    </div>
  )
}
