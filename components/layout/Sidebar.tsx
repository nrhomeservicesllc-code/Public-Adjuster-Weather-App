"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Bookmark, FileText, Settings, LogOut, Newspaper } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ClaimCastWordmark } from "@/components/ClaimCastLogo"

const navItems = [
  { href: "/map", icon: Map, label: "Storm Map" },
  { href: "/news", icon: Newspaper, label: "Latest Reports" },
  { href: "/saved-areas", icon: Bookmark, label: "Saved Areas" },
  { href: "/reports", icon: FileText, label: "My Reports" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#0A0F1E] text-white h-screen fixed left-0 top-0 z-40 border-r border-white/5">
      <div className="px-4 py-5 border-b border-white/5">
        <ClaimCastWordmark />
        <p className="text-xs text-slate-500 mt-1 ml-11">Public Adjuster Tool</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === href || (href === "/map" && pathname === "/map")
                ? "bg-blue-600/20 text-blue-300 border border-blue-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/admin"
              ? "bg-blue-600/20 text-blue-300 border border-blue-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" />
          Admin
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
