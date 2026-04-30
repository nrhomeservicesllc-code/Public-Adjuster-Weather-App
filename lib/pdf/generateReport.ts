import React from "react"
import {
  renderToBuffer, Document, Page, Text, View, StyleSheet, Image,
  Svg, Circle,
} from "@react-pdf/renderer"
import type { ReportData } from "@/types"
import { formatDate } from "@/lib/utils"

// ─── Map geometry ─────────────────────────────────────────────────────────────

const PAGE_PAD = 36
// LETTER = 612pt wide; content width after left+right margins
const PDF_MAP_W = 612 - PAGE_PAD * 2   // 540
const PDF_MAP_H = Math.round(280 * PDF_MAP_W / 640)  // 236

// The bbox in the route uses padding=1.5, so the circle always spans
// 1/padding = 1/1.5 of each half-dimension.  Circle radius in PDF points:
const CIRCLE_PADDING = 1.5
const CIRCLE_R = Math.round(PDF_MAP_H / (2 * CIRCLE_PADDING))  // ~79 pt

// ─── Storm helpers ────────────────────────────────────────────────────────────

function parseStormType(areaName: string): string {
  const label = (areaName.split(/[—–-]/)[0] ?? "").trim().toLowerCase()
  if (label.includes("tornado")) return "TORNADO"
  if (label.includes("hurricane")) return "HURRICANE"
  if (label.includes("tropical")) return "TROPICAL_STORM"
  if (label.includes("hail")) return "HAIL"
  if (label.includes("wind")) return "WIND"
  if (label.includes("flood")) return "FLOOD"
  if (label.includes("rain")) return "RAIN"
  return "THUNDERSTORM"
}

function parseSeverity(summary: string | null | undefined, areaName: string): string {
  if (summary) {
    const m = summary.match(/severity[:\s]+([A-Z]+)/i)
    if (m) return m[1].toUpperCase()
  }
  const n = areaName.toLowerCase()
  if (n.includes("tornado") || n.includes("hurricane") || n.includes("extreme")) return "EXTREME"
  if (n.includes("warning") || n.includes("high")) return "HIGH"
  return "MODERATE"
}

function impactRadiusM(stormType: string, severity: string): number {
  const base: Record<string, number> = {
    TORNADO: 3000, HURRICANE: 40000, TROPICAL_STORM: 22000,
    HAIL: 5000, WIND: 5000, FLOOD: 7000, RAIN: 5000, THUNDERSTORM: 5000,
  }
  let r = base[stormType] ?? 5000
  if (severity === "EXTREME") r *= 1.8
  else if (severity === "HIGH") r *= 1.4
  return r
}

function estimateHomes(radiusM: number): string {
  const mi = radiusM / 1609.34
  const h = Math.round(Math.PI * mi * mi * 1200)
  if (h >= 1_000_000) return `${(h / 1_000_000).toFixed(1)}M`
  if (h >= 1_000) return `${Math.round(h / 1_000)}k`
  return h.toString()
}

const STORM_HEADLINES: Record<string, string> = {
  TORNADO: "A TORNADO TOUCHED DOWN IN YOUR AREA",
  HURRICANE: "A HURRICANE STRUCK YOUR AREA",
  TROPICAL_STORM: "A TROPICAL STORM HIT YOUR AREA",
  HAIL: "A HAILSTORM STRUCK YOUR AREA",
  WIND: "HIGH WINDS STRUCK YOUR AREA",
  FLOOD: "SEVERE FLOODING OCCURRED IN YOUR AREA",
  RAIN: "HEAVY RAIN FELL IN YOUR AREA",
  THUNDERSTORM: "A SEVERE THUNDERSTORM STRUCK YOUR AREA",
}

const STORM_SUBHEADS: Record<string, string> = {
  TORNADO: "YOUR ROOF MAY BE DAMAGED — EVEN IF YOUR HOME WASN'T IN THE DIRECT PATH.",
  HURRICANE: "YOUR ROOF MAY BE DAMAGED — HURRICANE WINDS EXTEND MILES FROM THE EYE.",
  TROPICAL_STORM: "YOUR ROOF MAY BE DAMAGED — TROPICAL SYSTEMS BRING WIDESPREAD WIND & RAIN.",
  HAIL: "YOUR ROOF MAY BE DAMAGED — HAIL CAUSES HIDDEN DAMAGE INVISIBLE FROM THE GROUND.",
  WIND: "YOUR ROOF MAY BE DAMAGED — HIGH WINDS CAUSE DAMAGE MILES FROM THE STORM CENTER.",
  FLOOD: "YOUR PROPERTY MAY BE DAMAGED — FLOODING EXPOSES HIDDEN STRUCTURAL VULNERABILITIES.",
  RAIN: "YOUR ROOF MAY BE DAMAGED — HEAVY RAIN REVEALS HIDDEN VULNERABILITIES.",
  THUNDERSTORM: "YOUR ROOF MAY BE DAMAGED — SEVERE STORMS CAUSE DAMAGE BEYOND THE VISIBLE PATH.",
}

function getBody(stormType: string, stormLabel: string): { p1: string; p2: string } {
  const bodies: Record<string, { p1: string; p2: string }> = {
    TORNADO: {
      p1: `Your home does not need to be in the direct path of a tornado to have a damaged roof. Tornadoes bring violent weather systems — high winds, driving rain, and severe atmospheric conditions — that extend for miles beyond the visible path. Lifted shingles, cracked tiles, damaged flashing, and broken seals are common in surrounding areas and completely invisible from the ground. If you are within miles of this storm, your roof needs to be inspected.`,
      p2: `We are offering homeowners in your neighborhood a free professional roof inspection at no cost and no obligation. We will conduct a thorough inspection of your roof, document everything we find, and give you a straight answer on where things stand.`,
    },
    HURRICANE: {
      p1: `Hurricane-force winds and driving rain can cause catastrophic damage across hundreds of square miles. Even homes far from the direct impact zone experience sustained high winds, flying debris, and water infiltration that can compromise your roof's integrity in ways that aren't visible from the ground.`,
      p2: `We are offering homeowners in your area a free professional property inspection at no cost and no obligation. We will document all storm-related damage and help you understand your options.`,
    },
    TROPICAL_STORM: {
      p1: `Tropical storms bring sustained high winds and heavy rainfall across wide areas. Your roof may have sustained damage — including lifted shingles, compromised flashing, and water infiltration — that is completely invisible from the ground but will lead to leaks and mold if left unchecked.`,
      p2: `We are offering homeowners in your neighborhood a free professional roof inspection at no cost and no obligation. We will document everything we find and give you a straight answer.`,
    },
    HAIL: {
      p1: `Hailstones — even those smaller than a golf ball — can cause significant and often invisible damage to your roof. A single hailstorm can crack shingles, dent metal flashing, and compromise the waterproof membrane protecting your home. This damage is virtually impossible to spot from the ground, but it leads to leaks and mold within months.`,
      p2: `We are offering homeowners in your neighborhood a free professional roof inspection at no cost and no obligation. Hail damage is one of the most commonly covered claims — we will document everything and give you a clear picture of your roof's condition.`,
    },
    WIND: {
      p1: `High winds can strip shingles, dislodge tiles, and cause structural damage to your roof even when your home is miles from the storm's center. Wind damage is often subtle — loose shingles, lifted edges, and disturbed flashing — but left unchecked, it leads to leaks, mold, and expensive repairs.`,
      p2: `We are offering homeowners in your neighborhood a free professional roof inspection at no cost and no obligation. We will document all wind damage and give you a straight answer on where things stand.`,
    },
    FLOOD: {
      p1: `Flooding events can cause significant structural damage that extends far beyond visible water lines. Water infiltration, compromised flashing, and saturated roofing materials can cause damage that only becomes apparent weeks later as moisture works into your home's structure.`,
      p2: `We are offering homeowners in your area a free professional property inspection at no cost and no obligation. We will assess all flood-related damage and help you understand your options.`,
    },
    RAIN: {
      p1: `Heavy rainfall can reveal existing roof vulnerabilities and create new ones. Water infiltration, compromised flashing, and backed-up drainage can cause significant damage that only becomes apparent weeks later as moisture works its way into your home's structure.`,
      p2: `We are offering homeowners in your neighborhood a free professional roof inspection at no cost and no obligation. We will document everything and give you a straight answer on where things stand.`,
    },
    THUNDERSTORM: {
      p1: `Severe thunderstorms bring a combination of high winds, heavy rain, and often hail — a triple threat that can damage your roof in ways that aren't visible from the ground. In the hours after a storm, many homeowners don't realize their roof has been compromised until they see water damage inside their home.`,
      p2: `We are offering homeowners in your neighborhood a free professional roof inspection at no cost and no obligation. We will conduct a thorough inspection, document everything we find, and give you a straight answer on where things stand.`,
    },
  }
  return bodies[stormType] ?? bodies.THUNDERSTORM
}

const BULLETS = [
  "Storm damage left undetected leads to leaks, mold, and costly repairs.",
  "Small issues found early cost a fraction of what they cost after the next rain.",
  "Our inspection is 100% free — no pressure, no obligation.",
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:         { padding: PAGE_PAD, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a", backgroundColor: "#ffffff" },
  // Header
  headerBox:    { alignItems: "center", marginBottom: 8 },
  companyName:  { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#111827", letterSpacing: 1, textAlign: "center" },
  contactLine:  { fontSize: 9, color: "#4b5563", marginTop: 4, textAlign: "center" },
  dividerGreen: { height: 2, backgroundColor: "#15803d", marginVertical: 10 },
  // Headline
  headline:     { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "center", marginBottom: 6, lineHeight: 1.3 },
  subhead:      { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#b91c1c", textAlign: "center", marginBottom: 12, lineHeight: 1.3 },
  // Map
  mapContainer: { position: "relative", width: PDF_MAP_W, height: PDF_MAP_H, marginBottom: 6, overflow: "hidden", borderRadius: 4 },
  mapPlaceholder: { width: PDF_MAP_W, height: PDF_MAP_H, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center", borderRadius: 4 },
  mapCaption:   { fontSize: 8, color: "#4b5563", textAlign: "center", marginBottom: 12 },
  // Info card overlay
  infoCard:     { position: "absolute", top: 10, left: 10, backgroundColor: "rgba(0,0,0,0.72)", borderRadius: 5, padding: "7 10" },
  infoDate:     { color: "#ffffff", fontSize: 9, fontFamily: "Helvetica-Bold" },
  infoStorm:    { color: "#fb923c", fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 3 },
  infoHomes:    { color: "#cbd5e1", fontSize: 8, marginTop: 2 },
  infoSource:   { color: "#94a3b8", fontSize: 7, marginTop: 2 },
  // Letter body
  salutation:   { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 8, color: "#111827" },
  bodyText:     { fontSize: 10, lineHeight: 1.65, color: "#374151", marginBottom: 10 },
  bullet:       { flexDirection: "row", marginBottom: 5, paddingLeft: 4 },
  bulletDot:    { fontSize: 10, color: "#374151", marginRight: 8, width: 10 },
  bulletText:   { fontSize: 10, lineHeight: 1.5, color: "#374151", flex: 1 },
  // CTA
  ctaBox:       { backgroundColor: "#15803d", borderRadius: 6, padding: "10 14", marginVertical: 14, alignItems: "center" },
  ctaText:      { color: "#ffffff", fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center" },
  // Signature
  sigName:      { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827", marginTop: 4 },
  sigLine:      { fontSize: 9, color: "#4b5563" },
  // Disclaimer
  disclaimer:   { marginTop: 14, paddingTop: 8, borderTop: "1px solid #e5e7eb" },
  disclaimerTx: { fontSize: 7, color: "#9ca3af", lineHeight: 1.5 },
})

// ─── Document ─────────────────────────────────────────────────────────────────

function ProspectingLetter({ data }: { data: ReportData }) {
  const stormType  = parseStormType(data.areaName)
  const severity   = parseSeverity(data.summary, data.areaName)
  const radiusM    = impactRadiusM(stormType, severity)
  const homes      = estimateHomes(radiusM)
  const radiusMi   = (radiusM / 1609.34).toFixed(1)
  const body       = getBody(stormType, stormType)
  const headline   = STORM_HEADLINES[stormType] ?? STORM_HEADLINES.THUNDERSTORM
  const subhead    = STORM_SUBHEADS[stormType] ?? STORM_SUBHEADS.THUNDERSTORM

  const contactName    = data.userName ?? "Your Inspector"
  const contactDisplay = data.userEmail ?? "Contact us today"

  // Date from first storm event or report generation date
  const eventDate = data.stormEvents[0]?.startTime
    ? formatDate(data.stormEvents[0].startTime, "long")
    : formatDate(data.generatedAt, "long")

  const locationLabel = (() => {
    const parts = data.areaName.split(/[—–]/)
    return parts.length > 1 ? parts.slice(1).join("").trim() : data.affectedLocations[0] ?? data.areaName
  })()

  // Verification label based on source
  const source = data.stormEvents[0]?.source ?? data.alerts[0]?.nwsId ? "NWS" : "NOAA"
  const verificationLabel = source.startsWith("NWS") ? "NWS-Verified" : "NOAA-Verified"

  // Map overlay — circle radius is always proportional to the bbox extent
  const rPt = CIRCLE_R   // ~79 pt (matches the 1.5× padding used when fetching the bbox)
  const cX  = PDF_MAP_W / 2
  const cY  = PDF_MAP_H / 2

  const stormLabel = { TORNADO: "Tornado", HURRICANE: "Hurricane", TROPICAL_STORM: "Tropical Storm", HAIL: "Hailstorm", WIND: "High Winds", FLOOD: "Flooding", RAIN: "Heavy Rain", THUNDERSTORM: "Severe Thunderstorm" }[stormType] ?? stormType

  return React.createElement(Document, { title: `Storm Alert — ${data.areaName}` },
    React.createElement(Page, { size: "LETTER", style: S.page },

      // ── Header ──────────────────────────────────────────────────────────────
      React.createElement(View, { style: S.headerBox },
        React.createElement(Text, { style: S.companyName }, contactName.toUpperCase()),
        React.createElement(Text, { style: S.contactLine }, contactDisplay),
      ),
      React.createElement(View, { style: S.dividerGreen }),

      // ── Headline ────────────────────────────────────────────────────────────
      React.createElement(Text, { style: S.headline },
        `${headline} ON ${eventDate.toUpperCase()}.`
      ),
      React.createElement(Text, { style: S.subhead }, subhead),

      // ── Map ─────────────────────────────────────────────────────────────────
      data.mapBase64
        ? React.createElement(View, { style: S.mapContainer },
            // Base map image
            React.createElement(Image, {
              src: data.mapBase64,
              style: { position: "absolute", top: 0, left: 0, width: PDF_MAP_W, height: PDF_MAP_H },
            }),
            // Impact circle overlay
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            React.createElement(Svg as any, {
              style: { position: "absolute", top: 0, left: 0, width: PDF_MAP_W, height: PDF_MAP_H },
              viewBox: `0 0 ${PDF_MAP_W} ${PDF_MAP_H}`,
            },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              React.createElement(Circle as any, {
                cx: cX, cy: cY, r: rPt,
                fill: "rgba(185,28,28,0.22)",
                stroke: "rgba(185,28,28,0.9)",
                strokeWidth: 2.5,
                strokeDasharray: "8 4",
              })
            ),
            // Info card (top-left overlay)
            React.createElement(View, { style: S.infoCard },
              React.createElement(Text, { style: S.infoDate }, eventDate),
              React.createElement(Text, { style: S.infoStorm }, stormLabel),
              React.createElement(Text, { style: S.infoHomes }, `~${homes} Homes Impacted`),
              React.createElement(Text, { style: S.infoSource }, verificationLabel),
            ),
          )
        : React.createElement(View, { style: S.mapPlaceholder },
            React.createElement(Text, { style: { color: "#94a3b8", fontSize: 9 } }, "[Storm Impact Map]")
          ),

      // ── Map caption ─────────────────────────────────────────────────────────
      React.createElement(Text, { style: S.mapCaption },
        `${eventDate}  |  ${locationLabel}, FL  |  ${verificationLabel}  |  ~${homes} Homes in Impact Radius`
      ),

      // ── Letter body ─────────────────────────────────────────────────────────
      React.createElement(Text, { style: S.salutation }, "Dear Homeowner,"),
      React.createElement(Text, { style: S.bodyText }, body.p1),
      React.createElement(Text, { style: S.bodyText }, body.p2),

      // Bullets
      ...BULLETS.map((b) =>
        React.createElement(View, { key: b, style: S.bullet },
          React.createElement(Text, { style: S.bulletDot }, "•"),
          React.createElement(Text, { style: S.bulletText }, b),
        )
      ),

      // ── CTA ─────────────────────────────────────────────────────────────────
      React.createElement(View, { style: S.ctaBox },
        React.createElement(Text, { style: S.ctaText }, `Call or text ${contactName} today: ${contactDisplay}`)
      ),

      // ── Signature ───────────────────────────────────────────────────────────
      React.createElement(Text, { style: { fontSize: 10, color: "#374151", marginBottom: 2 } }, "Sincerely,"),
      React.createElement(Text, { style: S.sigName }, contactName),
      React.createElement(Text, { style: S.sigLine }, contactDisplay),

      // ── Disclaimer ──────────────────────────────────────────────────────────
      React.createElement(View, { style: S.disclaimer },
        React.createElement(Text, { style: S.disclaimerTx },
          "DISCLAIMER: This letter is based on publicly available weather data from the National Weather Service (NWS) and NOAA National Centers for Environmental Information (NCEI). Storm data reflects weather exposure only — it does not confirm property damage at any specific address. Homes-affected figures are estimates based on Florida average housing density. Always conduct a proper on-site inspection before making property damage claims. ClaimCast is not liable for any decisions made based on this information."
        )
      ),
    )
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(ProspectingLetter, { data }) as any
  return renderToBuffer(doc)
}
