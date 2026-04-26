import { Sidebar } from "@/components/layout/Sidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { Header } from "@/components/layout/Header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen h-dvh bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 md:ml-60 min-w-0 h-full overflow-hidden">
        <Header />
        {/*
          On mobile we reserve 64px at the bottom for the fixed bottom nav.
          The map page needs overflow-hidden so Leaflet fills correctly;
          other pages (news, reports) scroll inside themselves.
        */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-auto pb-16 md:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile nav — z-[2000] always above Leaflet panes */}
      <MobileBottomNav />
    </div>
  )
}
