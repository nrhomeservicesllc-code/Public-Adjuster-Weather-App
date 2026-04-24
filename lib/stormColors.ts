import type { StormColor, StormType } from "@/types"

export const STORM_COLORS: Record<StormType, StormColor> = {
  HAIL: {
    fill: "#F97316",
    stroke: "#EA580C",
    label: "Hail",
    bgClass: "bg-orange-500",
    textClass: "text-orange-700",
  },
  TORNADO: {
    fill: "#EF4444",
    stroke: "#DC2626",
    label: "Tornado",
    bgClass: "bg-red-500",
    textClass: "text-red-700",
  },
  WIND: {
    fill: "#EAB308",
    stroke: "#CA8A04",
    label: "High Wind",
    bgClass: "bg-yellow-500",
    textClass: "text-yellow-700",
  },
  HURRICANE: {
    fill: "#7C3AED",
    stroke: "#6D28D9",
    label: "Hurricane",
    bgClass: "bg-violet-600",
    textClass: "text-violet-700",
  },
  TROPICAL_STORM: {
    fill: "#0D9488",
    stroke: "#0F766E",
    label: "Tropical Storm",
    bgClass: "bg-teal-600",
    textClass: "text-teal-700",
  },
  RAIN: {
    fill: "#3B82F6",
    stroke: "#2563EB",
    label: "Heavy Rain",
    bgClass: "bg-blue-500",
    textClass: "text-blue-700",
  },
  FLOOD: {
    fill: "#1E40AF",
    stroke: "#1E3A8A",
    label: "Flooding",
    bgClass: "bg-blue-800",
    textClass: "text-blue-900",
  },
  THUNDERSTORM: {
    fill: "#4F46E5",
    stroke: "#4338CA",
    label: "Thunderstorm",
    bgClass: "bg-indigo-600",
    textClass: "text-indigo-700",
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
