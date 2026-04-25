import { StormMapClient } from "@/components/map/StormMapClient"
import { StormFilters } from "@/components/filters/StormFilters"

export default function MapPage() {
  return (
    <div className="relative h-full">
      <StormMapClient />
      <StormFilters />
    </div>
  )
}
