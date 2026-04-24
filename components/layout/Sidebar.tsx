"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Bookmark, FileText, Settings, LogOut, Zap } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Map, label: "Storm Map" },
  { href: "/saved-areas", icon: Bookmark, label: "Saved Areas" },
  { href: "/reports", icon: FileText, label: "Reports" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-white h-screen fixed left-0 top-0 z-40">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-700">
        <Zap className="h-6 w-6 text-blue-400" />
        <div>
          <h1 className="font-bold text-sm leading-tight">Storm Impact Map</h1>
          <p className="text-xs text-slate-400">Public Adjuster Tool</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-700 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700 space-y-1">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          Admin
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
