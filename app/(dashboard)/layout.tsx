import { Sidebar } from "@/components/layout/Sidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { Header } from "@/components/layout/Header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen h-dvh bg-slate-50">
      {/* Desktop sidebar — fixed, hidden on mobile */}
      <Sidebar />

      {/* Content column */}
      <div className="flex flex-col flex-1 md:ml-60 min-w-0 h-full">
        {/* Header — sticky, z-[800] sits above Leaflet panes */}
        <Header />

        {/*
          overflow-y-auto lets non-map pages scroll.
          pb-16 reserves space for the fixed mobile bottom nav.
          The map page breaks out of this via its own calc() height.
        */}
        <main className="flex-1 min-h-0 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — z-[2000] always above Leaflet (z-200..z-700) */}
      <MobileBottomNav />
    </div>
  )
}
