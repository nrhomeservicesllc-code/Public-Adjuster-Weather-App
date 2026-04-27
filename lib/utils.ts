import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (format === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function getSinceDate(range: string, customStart?: Date): Date {
  const now = new Date()
  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case "3d":
      return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "6mo":
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case "custom":
      return customStart ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

export function getMarkerRadius(event: {
  windSpeedMph?: number | null
  hailSizeInches?: number | null
  severity?: string
}): number {
  if (event.windSpeedMph && event.windSpeedMph > 0) {
    return Math.max(8, Math.min(30, event.windSpeedMph / 5))
  }
  if (event.hailSizeInches && event.hailSizeInches > 0) {
    return Math.max(8, Math.min(30, event.hailSizeInches * 10))
  }
  const severityMap: Record<string, number> = {
    EXTREME: 20,
    HIGH: 14,
    MODERATE: 10,
    LOW: 8,
  }
  return severityMap[event.severity ?? "MODERATE"] ?? 10
}
