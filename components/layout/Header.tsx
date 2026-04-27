"use client"

import Link from "next/link"
import { RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LocationSearch } from "@/components/search/LocationSearch"
import { ClaimCastWordmark } from "@/components/ClaimCastLogo"

export function Header() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const pathname = usePathname()
  const isMapPage = pathname === "/map"

  const handleRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <header className="h-14 bg-[#0A0F1E] border-b border-white/10 flex items-center gap-2 px-3 sm:px-4 sticky top-0 z-[800] flex-shrink-0">
      {isMapPage ? (
        /* On the map page the search lives in the MapSearchOverlay overlay.
           Show the logo here so the header isn't empty. */
        <>
          <Link href="/map" className="flex-shrink-0">
            <ClaimCastWordmark />
          </Link>
          <div className="flex-1" />
        </>
      ) : (
        <div className="flex-1 min-w-0">
          <LocationSearch />
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        title="Refresh data"
        className="flex-shrink-0 h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
      </Button>
    </header>
  )
}
