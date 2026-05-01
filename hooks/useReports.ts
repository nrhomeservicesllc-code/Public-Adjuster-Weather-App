"use client"

import { useQuery } from "@tanstack/react-query"
import type { Report } from "@/types"

export function useReports() {
  return useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports")
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}
