export function buildBBoxWhere(bbox: string): string | null {
  const parts = bbox.split(",").map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return null
  const [minLng, minLat, maxLng, maxLat] = parts
  if (
    minLng < -180 || maxLng > 180 ||
    minLat < -90 || maxLat > 90
  ) return null
  return `latitude >= ${minLat} AND latitude <= ${maxLat} AND longitude >= ${minLng} AND longitude <= ${maxLng}`
}

export const FLORIDA_BOUNDS = {
  minLat: 24.4,
  maxLat: 31.1,
  minLng: -87.7,
  maxLng: -79.9,
}

export function isInFlorida(lat: number, lng: number): boolean {
  return (
    lat >= FLORIDA_BOUNDS.minLat &&
    lat <= FLORIDA_BOUNDS.maxLat &&
    lng >= FLORIDA_BOUNDS.minLng &&
    lng <= FLORIDA_BOUNDS.maxLng
  )
}

export function distanceMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3959
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
