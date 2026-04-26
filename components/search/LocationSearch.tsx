"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, MapPin, X } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { useMapStore } from "@/store/mapStore"

export function LocationSearch() {
  const { query, setQuery, results, loading } = useSearch()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
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
      flyTo?: (latlng: [number, number], zoom: number) => void
      flyToBounds?: (b: [[number, number], [number, number]], o: object) => void
    } | null

    const isOnMapPage = pathname === "/map"

    if (isOnMapPage && mapRef) {
      if (result.boundingBox && mapRef.flyToBounds) {
        mapRef.flyToBounds(result.boundingBox as [[number, number], [number, number]], { padding: [40, 40] })
      } else {
        mapRef.flyTo?.([result.latitude, result.longitude], 13)
      }
    } else {
      // Not on map page — navigate there with coords in URL so MapUrlNavigator picks them up
      router.push(`/map?lat=${result.latitude}&lng=${result.longitude}&zoom=13`)
    }
  }

  const typeIcons: Record<string, string> = {
    CITY: "🏙",
    COUNTY: "🗺",
    ZIP: "📮",
    NEIGHBORHOOD: "🏘",
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) setOpen(true) }}
          placeholder="Search city, county, or ZIP in Florida..."
          className="w-full h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-xl z-[9999] overflow-hidden max-h-72 overflow-y-auto">
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
              <span className="text-base flex-shrink-0">{typeIcons[result.type] ?? "📍"}</span>
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
