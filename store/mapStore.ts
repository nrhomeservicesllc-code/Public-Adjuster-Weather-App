"use client"

import { create } from "zustand"
import type { MapFilters, StormEvent, NWSAlert, StormType, Severity } from "@/types"

interface MapState {
  filters: MapFilters
  selectedEvent: StormEvent | null
  selectedAlert: NWSAlert | null
  mapRef: unknown | null
  highlightedAlertId: string | null
  highlightedEventId: string | null
  searchedLocation: { lat: number; lng: number; name: string } | null
  setFilters: (f: Partial<MapFilters>) => void
  setSelectedEvent: (e: StormEvent | null) => void
  setSelectedAlert: (a: NWSAlert | null) => void
  setMapRef: (map: unknown) => void
  setHighlightedAlertId: (id: string | null) => void
  setHighlightedEventId: (id: string | null) => void
  setSearchedLocation: (loc: { lat: number; lng: number; name: string } | null) => void
  flyTo: (lat: number, lng: number, zoom?: number) => void
  resetFilters: () => void
}

const defaultFilters: MapFilters = {
  dateRange: "30d",
  stormTypes: [],
  severities: [],
  showAlerts: true,
  showStormEvents: true,
}

export const useMapStore = create<MapState>((set, get) => ({
  filters: defaultFilters,
  selectedEvent: null,
  selectedAlert: null,
  mapRef: null,
  highlightedAlertId: null,
  highlightedEventId: null,
  searchedLocation: null,

  setFilters: (f) =>
    set((s) => ({ filters: { ...s.filters, ...f } })),

  setSelectedEvent: (e) => set({ selectedEvent: e, selectedAlert: null }),
  setSelectedAlert: (a) => set({ selectedAlert: a, selectedEvent: null }),
  setMapRef: (map) => set({ mapRef: map }),
  setHighlightedAlertId: (id) => set({ highlightedAlertId: id }),
  setHighlightedEventId: (id) => set({ highlightedEventId: id }),
  setSearchedLocation: (loc) => set({ searchedLocation: loc }),

  flyTo: (lat, lng, zoom = 12) => {
    const map = get().mapRef as {
      flyTo?: (latlng: [number, number], zoom: number) => void
    } | null
    map?.flyTo?.([lat, lng], zoom)
  },

  resetFilters: () => set({ filters: defaultFilters }),
}))

export function useStormTypeFilter() {
  const { filters, setFilters } = useMapStore()
  const toggleType = (type: StormType) => {
    const current = filters.stormTypes
    setFilters({
      stormTypes: current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    })
  }
  return { stormTypes: filters.stormTypes, toggleType }
}

export function useSeverityFilter() {
  const { filters, setFilters } = useMapStore()
  const toggleSeverity = (sev: Severity) => {
    const current = filters.severities
    setFilters({
      severities: current.includes(sev)
        ? current.filter((s) => s !== sev)
        : [...current, sev],
    })
  }
  return { severities: filters.severities, toggleSeverity }
}
