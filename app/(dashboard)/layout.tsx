import { Sidebar } from "@/components/layout/Sidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { Header } from "@/components/layout/Header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-60 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto pb-16 md:pb-0 min-h-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
