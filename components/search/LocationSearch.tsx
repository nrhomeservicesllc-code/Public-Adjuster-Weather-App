"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, X } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { useMapStore } from "@/store/mapStore"
import { cn } from "@/lib/utils"

export function LocationSearch() {
  const { query, setQuery, results, loading } = useSearch()
  const [open, setOpen] = useState(false)
  const { flyTo } = useMapStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(results.length > 0 && query.length >= 2)
  }, [results, query])

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
    flyTo(result.latitude, result.longitude, 12)
    setQuery(result.name)
    setOpen(false)
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
          placeholder="Search city, county, or ZIP code in Florida..."
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-[500] overflow-hidden">
          {loading && (
            <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>
          )}
          {!loading && results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors"
            >
              <span className="text-base">{typeIcons[result.type] ?? "📍"}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{result.name}</div>
                <div className="text-xs text-slate-500 truncate">{result.displayName}</div>
              </div>
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-auto" />
            </button>
          ))}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-3 py-2.5 text-sm text-slate-500">No Florida locations found.</div>
          )}
        </div>
      )}
    </div>
  )
}
