"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Bookmark, FileText, Settings, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Map, label: "Map" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/saved-areas", icon: Bookmark, label: "Saved" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/admin", icon: Settings, label: "Admin" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-700">
      <div className="grid grid-cols-5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors",
              pathname === href ? "text-blue-400" : "text-slate-400 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
