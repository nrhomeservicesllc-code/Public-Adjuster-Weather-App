import type { NWSAlertCollection } from "@/types"

const NWS_BASE = "https://api.weather.gov"
const NWS_HEADERS = {
  "User-Agent": "(storm-impact-map, admin@stormimpactmap.com)",
  Accept: "application/geo+json",
}

export async function fetchFloridaAlerts(): Promise<NWSAlertCollection> {
  const res = await fetch(`${NWS_BASE}/alerts/active?area=FL`, {
    headers: NWS_HEADERS,
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`NWS alerts API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchZoneGeometry(zoneType: string, zoneId: string) {
  const res = await fetch(`${NWS_BASE}/zones/${zoneType}/${zoneId}`, {
    headers: NWS_HEADERS,
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.geometry ?? null
}

export async function fetchLocalStormReports() {
  const offices = ["MFL", "TBW", "JAX", "MLB", "TAE"]
  const results = await Promise.allSettled(
    offices.map((office) =>
      fetch(`${NWS_BASE}/products?type=LSR&location=${office}`, {
        headers: NWS_HEADERS,
      }).then((r) => (r.ok ? r.json() : null))
    )
  )
  return results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => (r as PromiseFulfilledResult<unknown>).value)
}
