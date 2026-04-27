import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Storm Impact Map — Public Adjuster Tool",
  description:
    "Track storm-affected areas in Florida for public adjusters. See hail, tornado, wind, hurricane, and flood events on an interactive map.",
  keywords: ["storm map", "public adjuster", "Florida weather", "hail map", "tornado map", "property damage"],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
