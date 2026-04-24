export type StormType =
  | "HAIL"
  | "TORNADO"
  | "WIND"
  | "HURRICANE"
  | "RAIN"
  | "FLOOD"
  | "THUNDERSTORM"
  | "TROPICAL_STORM"

export type Severity = "LOW" | "MODERATE" | "HIGH" | "EXTREME"

export type ConfidenceLevel =
  | "CONFIRMED"
  | "REPORTED"
  | "RADAR_INDICATED"
  | "ALERT_BASED"

export type Role = "USER" | "ADMIN"

export type DateRange = "24h" | "3d" | "7d" | "30d" | "custom"

export interface StormEvent {
  id: string
  externalId?: string | null
  source: string
  sourceUrl?: string | null
  eventType: StormType
  severity: Severity
  confidenceLevel: ConfidenceLevel
  locationName: string
  state: string
  county?: string | null
  zipCode?: string | null
  latitude?: number | null
  longitude?: number | null
  startTime: string
  endTime?: string | null
  windSpeedMph?: number | null
  hailSizeInches?: number | null
  rainfallInches?: number | null
  tornadoEF?: string | null
  description?: string | null
  createdAt: string
}

export interface NWSAlert {
  id: string
  nwsId: string
  title: string
  description: string
  eventType: string
  areaDesc: string
  severity: string
  urgency: string
  certainty: string
  effective: string
  expires: string
  sourceUrl: string
  rawGeometry?: GeoJsonGeometry | null
  createdAt: string
}

export interface NWSAlertFeature {
  id: string
  type: "Feature"
  geometry: GeoJsonGeometry | null
  properties: {
    id: string
    event: string
    headline?: string
    description: string
    areaDesc: string
    effective: string
    expires: string
    severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown"
    urgency: string
    certainty: string
    url: string
    status: string
    messageType: string
  }
}

export interface NWSAlertCollection {
  type: "FeatureCollection"
  features: NWSAlertFeature[]
}

export interface Location {
  id: string
  name: string
  displayName: string
  type: "CITY" | "COUNTY" | "ZIP" | "NEIGHBORHOOD"
  state: string
  county?: string | null
  zipCode?: string | null
  latitude: number
  longitude: number
  boundingBox?: [[number, number], [number, number]] | null
}

export interface SavedArea {
  id: string
  userId: string
  name: string
  notes?: string | null
  isProspecting: boolean
  geoJson: GeoJsonGeometry
  createdAt: string
}

export interface Report {
  id: string
  userId: string
  areaName: string
  geoJson?: GeoJsonGeometry | null
  stormEventIds: string[]
  alertIds: string[]
  summary?: string | null
  generatedAt: string
}

export interface ReportData {
  id: string
  areaName: string
  generatedAt: string
  stormEvents: StormEvent[]
  alerts: NWSAlert[]
  affectedLocations: string[]
  summary: string
  dateRangeLabel: string
}

export interface MapFilters {
  dateRange: DateRange
  customStart?: Date
  customEnd?: Date
  stormTypes: StormType[]
  severities: Severity[]
  showAlerts: boolean
  showStormEvents: boolean
}

export interface GeoJsonPoint {
  type: "Point"
  coordinates: [number, number]
}

export interface GeoJsonPolygon {
  type: "Polygon"
  coordinates: number[][][]
}

export interface GeoJsonMultiPolygon {
  type: "MultiPolygon"
  coordinates: number[][][][]
}

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon | GeoJsonMultiPolygon | {
  type: string
  coordinates: unknown
}

export interface StormColor {
  fill: string
  stroke: string
  label: string
  bgClass: string
  textClass: string
}
