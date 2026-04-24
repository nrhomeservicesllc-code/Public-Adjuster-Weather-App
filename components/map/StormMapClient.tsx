"use client"

import dynamic from "next/dynamic"

const StormMap = dynamic(
  () => import("@/components/map/StormMap").then((m) => ({ default: m.StormMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Loading Storm Impact Map...</p>
        </div>
      </div>
    ),
  }
)

export function StormMapClient() {
  return <StormMap />
}
