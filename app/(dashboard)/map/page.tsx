import { StormMapClient } from "@/components/map/StormMapClient"
import { StormFilters } from "@/components/filters/StormFilters"

export default function MapPage() {
  /*
   * The map must fill its container precisely on mobile so Leaflet can
   * measure the container height. We use h-dvh minus the header (56px) and
   * the mobile bottom nav (64px). On md+ the sidebar + desktop layout handle
   * sizing and the bottom nav is hidden, so plain h-full works.
   */
  return (
    <div className="relative h-[calc(100dvh-56px-64px)] md:h-full overflow-hidden">
      <StormMapClient />
      <StormFilters />
    </div>
  )
}
