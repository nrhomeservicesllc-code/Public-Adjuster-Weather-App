import type { StormColor, StormType } from "@/types"

export const STORM_COLORS: Record<StormType, StormColor> = {
  HAIL: {
    fill: "#FB923C",
    stroke: "#EA580C",
    label: "Hail",
    emoji: "🌨",
    bgClass: "bg-orange-400",
    textClass: "text-orange-700",
  },
  TORNADO: {
    fill: "#EF4444",
    stroke: "#DC2626",
    label: "Tornado",
    emoji: "🌪",
    bgClass: "bg-red-500",
    textClass: "text-red-700",
  },
  WIND: {
    fill: "#FBBF24",
    stroke: "#D97706",
    label: "High Wind",
    emoji: "💨",
    bgClass: "bg-amber-400",
    textClass: "text-amber-700",
  },
  HURRICANE: {
    fill: "#C026D3",
    stroke: "#A21CAF",
    label: "Hurricane",
    emoji: "🌀",
    bgClass: "bg-fuchsia-600",
    textClass: "text-fuchsia-700",
  },
  TROPICAL_STORM: {
    fill: "#F43F5E",
    stroke: "#E11D48",
    label: "Tropical Storm",
    emoji: "🌀",
    bgClass: "bg-rose-500",
    textClass: "text-rose-700",
  },
  RAIN: {
    fill: "#38BDF8",
    stroke: "#0284C7",
    label: "Heavy Rain",
    emoji: "🌧",
    bgClass: "bg-sky-400",
    textClass: "text-sky-700",
  },
  FLOOD: {
    fill: "#34D399",
    stroke: "#059669",
    label: "Flooding",
    emoji: "🌊",
    bgClass: "bg-emerald-400",
    textClass: "text-emerald-700",
  },
  THUNDERSTORM: {
    fill: "#22D3EE",
    stroke: "#0891B2",
    label: "Thunderstorm",
    emoji: "⛈",
    bgClass: "bg-cyan-400",
    textClass: "text-cyan-700",
  },
}

export const NWS_EVENT_TYPE_MAP: Record<string, StormType> = {
  "Tornado Warning": "TORNADO",
  "Tornado Watch": "TORNADO",
  "Tornado Emergency": "TORNADO",
  "Hurricane Warning": "HURRICANE",
  "Hurricane Watch": "HURRICANE",
  "Hurricane Local Statement": "HURRICANE",
  "Tropical Storm Warning": "TROPICAL_STORM",
  "Tropical Storm Watch": "TROPICAL_STORM",
  "Tropical Storm Local Statement": "TROPICAL_STORM",
  "Flash Flood Warning": "FLOOD",
  "Flash Flood Watch": "FLOOD",
  "Flash Flood Emergency": "FLOOD",
  "Flood Warning": "FLOOD",
  "Flood Watch": "FLOOD",
  "Flood Advisory": "FLOOD",
  "Flood Statement": "FLOOD",
  "Severe Thunderstorm Warning": "THUNDERSTORM",
  "Severe Thunderstorm Watch": "THUNDERSTORM",
  "Special Marine Warning": "THUNDERSTORM",
  "High Wind Warning": "WIND",
  "High Wind Watch": "WIND",
  "Wind Advisory": "WIND",
  "Extreme Wind Warning": "WIND",
  "Dense Fog Advisory": "RAIN",
  "Heavy Rain Warning": "RAIN",
  "Winter Storm Warning": "RAIN",
  "Special Weather Statement": "THUNDERSTORM",
}

export function normalizeNWSEventType(event: string): StormType {
  return NWS_EVENT_TYPE_MAP[event] ?? "THUNDERSTORM"
}

export function getStormColor(eventType: string): StormColor {
  return STORM_COLORS[eventType as StormType] ?? STORM_COLORS.THUNDERSTORM
}

export const SEVERITY_ORDER: Record<string, number> = {
  EXTREME: 4,
  HIGH: 3,
  MODERATE: 2,
  LOW: 1,
}

export const NWS_SEVERITY_MAP: Record<string, string> = {
  Extreme: "EXTREME",
  Severe: "HIGH",
  Moderate: "MODERATE",
  Minor: "LOW",
  Unknown: "LOW",
}
