"use client"

import { RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LocationSearch } from "@/components/search/LocationSearch"

export function Header() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sticky top-0 z-30">
      <div className="flex-1 max-w-md">
        <LocationSearch />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh data">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </header>
  )
}
