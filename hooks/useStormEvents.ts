"use client"

import { useQuery } from "@tanstack/react-query"
import { useMapStore } from "@/store/mapStore"
import { getSinceDate } from "@/lib/utils"
import type { StormEvent } from "@/types"

export function useStormEvents() {
  const { filters } = useMapStore()

  return useQuery<StormEvent[]>({
    queryKey: ["storm-events", filters],
    queryFn: async () => {
      const since = getSinceDate(filters.dateRange, filters.customStart)
      const params = new URLSearchParams()
      params.set("since", since.toISOString())
      if (filters.customEnd) params.set("until", filters.customEnd.toISOString())
      filters.stormTypes.forEach((t) => params.append("type", t))
      filters.severities.forEach((s) => params.append("severity", s))

      const res = await fetch(`/api/storm-events?${params}`)
      if (!res.ok) throw new Error("Failed to fetch storm events")
      return res.json()
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    enabled: filters.showStormEvents,
  })
}
