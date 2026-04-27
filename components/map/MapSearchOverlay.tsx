"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, X } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { useMapStore } from "@/store/mapStore"

/**
 * Floating search bar positioned as an absolute overlay inside the map container.
 * Avoids the Leaflet GPU-compositing issue that can render the header dropdown
 * behind hardware-accelerated tile layers.
 */
export function MapSearchOverlay() {
  const { query, setQuery, results, loading } = useSearch()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(query.length >= 2)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (result: (typeof results)[number]) => {
    setQuery(result.name)
    setOpen(false)

    const mapRef = useMapStore.getState().mapRef as {
      flyTo?: (latlng: [number, number], zoom: number, opts?: object) => void
      flyToBounds?: (b: [[number, number], [number, number]], opts: object) => void
    } | null

    if (mapRef) {
      if (result.boundingBox && mapRef.flyToBounds) {
        mapRef.flyToBounds(result.boundingBox as [[number, number], [number, number]], {
          padding: [60, 60],
          animate: true,
          duration: 1.5,
        })
      } else {
        mapRef.flyTo?.([result.latitude, result.longitude], 13, { animate: true, duration: 1.5 })
      }
    }

    useMapStore.getState().setSearchedLocation({
      lat: result.latitude,
      lng: result.longitude,
      name: result.name,
    })
  }

  return (
    /* z-[1500] sits above all Leaflet panes (max z-700) and the filter button (z-400).
       On desktop we leave room on the right for the Filters button (right-36 ≈ 144px).
       On mobile the filter button is fixed at the bottom, so we span full width. */
    <div
      ref={containerRef}
      className="absolute top-3 left-3 right-3 md:right-36 z-[1500]"
      style={{ pointerEvents: "auto" }}
    >
      {/* Input */}
      <div className="relative shadow-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) setOpen(true) }}
          placeholder="Search city, county, or ZIP in Florida..."
          className="w-full h-11 pl-9 pr-9 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/95 backdrop-blur-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Searching Florida locations...
            </div>
          )}
          {!loading && results.length > 0 && results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <span className="text-base flex-shrink-0">
                {result.type === "CITY" ? "🏙" : result.type === "COUNTY" ? "🗺" : result.type === "ZIP" ? "📮" : "📍"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 truncate">{result.name}</div>
                {result.displayName && result.displayName !== result.name && (
                  <div className="text-xs text-slate-500 truncate">{result.displayName}</div>
                )}
              </div>
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-auto" />
            </button>
          ))}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2.5 text-sm text-slate-500">
              No Florida locations found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
