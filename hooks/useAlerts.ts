"use client"

import { useQuery } from "@tanstack/react-query"
import { useMapStore } from "@/store/mapStore"
import type { NWSAlert } from "@/types"

export function useAlerts() {
  const showAlerts = useMapStore((s) => s.filters.showAlerts)

  return useQuery<NWSAlert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts")
      if (!res.ok) throw new Error("Failed to fetch alerts")
      return res.json()
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    enabled: showAlerts,
  })
}
