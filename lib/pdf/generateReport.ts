import React from "react"
import {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderToBuffer, Document, Page, Text, View, StyleSheet, Canvas as CanvasComponent,
} from "@react-pdf/renderer"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Canvas = CanvasComponent as any
import type { ReportData } from "@/types"
import { formatDate } from "@/lib/utils"

// ─── Map geometry ─────────────────────────────────────────────────────────────

const PAGE_PAD = 36
const PDF_MAP_W = 612 - PAGE_PAD * 2   // 540 pt
const PDF_MAP_H = 236                   // fixed map height

// Circle fills ~55 % of map height — same padding used in route bbox fetch
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

function getBody(stormType: string): { p1: string; p2: string } {
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
  headerBox:    { alignItems: "center", marginBottom: 8 },
  companyName:  { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#111827", letterSpacing: 1, textAlign: "center" },
  contactLine:  { fontSize: 9, color: "#4b5563", marginTop: 4, textAlign: "center" },
  dividerGreen: { height: 2, backgroundColor: "#15803d", marginVertical: 10 },
  headline:     { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "center", marginBottom: 6, lineHeight: 1.3 },
  subhead:      { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#b91c1c", textAlign: "center", marginBottom: 10, lineHeight: 1.3 },
  mapCaption:   { fontSize: 8, color: "#4b5563", textAlign: "center", marginTop: 6, marginBottom: 12 },
  salutation:   { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 8, color: "#111827" },
  bodyText:     { fontSize: 10, lineHeight: 1.65, color: "#374151", marginBottom: 10 },
  bullet:       { flexDirection: "row", marginBottom: 5, paddingLeft: 4 },
  bulletDot:    { fontSize: 10, color: "#374151", marginRight: 8, width: 10 },
  bulletText:   { fontSize: 10, lineHeight: 1.5, color: "#374151", flex: 1 },
  ctaBox:       { backgroundColor: "#15803d", borderRadius: 6, padding: "10 14", marginVertical: 14, alignItems: "center" },
  ctaText:      { color: "#ffffff", fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center" },
  sigName:      { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827", marginTop: 4 },
  sigLine:      { fontSize: 9, color: "#4b5563" },
  disclaimer:   { marginTop: 14, paddingTop: 8, borderTop: "1px solid #e5e7eb" },
  disclaimerTx: { fontSize: 7, color: "#9ca3af", lineHeight: 1.5 },
})

// ─── Document ─────────────────────────────────────────────────────────────────

function ProspectingLetter({ data }: { data: ReportData }) {
  const stormType       = parseStormType(data.areaName)
  const severity        = parseSeverity(data.summary, data.areaName)
  const radiusM         = impactRadiusM(stormType, severity)
  const homes           = estimateHomes(radiusM)
  const radiusMi        = (radiusM / 1609.34).toFixed(1)
  const body            = getBody(stormType)
  const headline        = STORM_HEADLINES[stormType] ?? STORM_HEADLINES.THUNDERSTORM
  const subhead         = STORM_SUBHEADS[stormType] ?? STORM_SUBHEADS.THUNDERSTORM
  const contactName     = data.userName ?? "Your Inspector"
  const contactDisplay  = data.userEmail ?? "Contact us today"

  const eventDate = data.stormEvents[0]?.startTime
    ? formatDate(data.stormEvents[0].startTime, "long")
    : formatDate(data.generatedAt, "long")

  const locationLabel = (() => {
    const parts = data.areaName.split(/[—–]/)
    return parts.length > 1 ? parts.slice(1).join("").trim() : data.affectedLocations[0] ?? data.areaName
  })()

  const source = data.stormEvents[0]?.source ?? ""
  const verificationLabel = source.startsWith("NWS") ? "NWS-Verified" : "NOAA-Verified"

  const stormLabel = {
    TORNADO: "Tornado", HURRICANE: "Hurricane", TROPICAL_STORM: "Tropical Storm",
    HAIL: "Hailstorm", WIND: "High Winds", FLOOD: "Flooding", RAIN: "Heavy Rain",
    THUNDERSTORM: "Severe Thunderstorm",
  }[stormType] ?? stormType

  const cx = PDF_MAP_W / 2
  const cy = PDF_MAP_H / 2
  const R  = CIRCLE_R

  // Canvas paint — draws the entire impact map using PDFKit drawing API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paintMap = (painter: any) => {
    const w = PDF_MAP_W
    const h = PDF_MAP_H

    // ── Background: clean dark radar style (no grid squares) ────────────────
    painter.save()
    painter.rect(0, 0, w, h).fillColor("#0f172a").fill()
    painter.restore()

    // Subtle horizontal terrain bands for visual depth
    painter.save()
    painter.rect(0, h * 0.55, w, h * 0.45).fillColor("#1e293b").fillOpacity(0.5).fill()
    painter.restore()
    painter.save()
    painter.rect(0, h * 0.78, w, h * 0.22).fillColor("#334155").fillOpacity(0.35).fill()
    painter.restore()

    // ── Concentric range rings (radar style) ─────────────────────────────────
    painter.save()
    painter.strokeColor("#64748b").strokeOpacity(0.22).lineWidth(0.5)
    for (const mult of [0.4, 0.7, 1.0, 1.35, 1.7]) {
      painter.circle(cx, cy, R * mult).stroke()
    }
    painter.restore()

    // ── Impact zone fill ────────────────────────────────────────────────────
    painter.save()
    painter.circle(cx, cy, R)
    painter.fillColor("#b91c1c").fillOpacity(0.28).fill()
    painter.restore()

    // ── Impact zone dashed border ────────────────────────────────────────────
    painter.save()
    painter.dash(8, { space: 4 })
    painter.circle(cx, cy, R)
    painter.strokeColor("#dc2626").strokeOpacity(1).lineWidth(2.5).stroke()
    painter.restore()

    // ── Inner 50% ring ───────────────────────────────────────────────────────
    painter.save()
    painter.circle(cx, cy, R * 0.5)
    painter.strokeColor("#ef4444").strokeOpacity(0.35).lineWidth(0.75).stroke()
    painter.restore()

    // ── Cross-hair lines ─────────────────────────────────────────────────────
    painter.save()
    painter.strokeColor("#dc2626").strokeOpacity(0.45).lineWidth(0.75)
    painter.moveTo(cx - R, cy).lineTo(cx + R, cy).stroke()
    painter.moveTo(cx, cy - R).lineTo(cx, cy + R).stroke()
    painter.restore()

    // ── Epicenter dot ────────────────────────────────────────────────────────
    painter.save()
    painter.circle(cx, cy, 6).fillColor("#dc2626").fillOpacity(1).fill()
    painter.circle(cx, cy, 6).strokeColor("#ffffff").strokeOpacity(1).lineWidth(2).stroke()
    painter.restore()

    // ── Cardinal labels ──────────────────────────────────────────────────────
    painter.save()
    painter.fillColor("#ffffff").fillOpacity(0.65).font("Helvetica-Bold").fontSize(8)
    painter.text("N", cx - 4, cy - R - 15, { lineBreak: false })
    painter.text("S", cx - 4, cy + R + 4,  { lineBreak: false })
    painter.text("W", cx - R - 18, cy - 5, { lineBreak: false })
    painter.text("E", cx + R + 6,  cy - 5, { lineBreak: false })
    painter.restore()

    // ── Scale bar ────────────────────────────────────────────────────────────
    painter.save()
    painter.strokeColor("#94a3b8").strokeOpacity(0.8).lineWidth(1)
    painter.moveTo(cx, h - 16).lineTo(cx + R, h - 16).stroke()
    painter.moveTo(cx, h - 20).lineTo(cx, h - 12).stroke()
    painter.moveTo(cx + R, h - 20).lineTo(cx + R, h - 12).stroke()
    painter.fillColor("#94a3b8").fillOpacity(1).font("Helvetica").fontSize(6.5)
    painter.text(`${radiusMi} mi radius`, cx + R / 2 - 14, h - 28, { lineBreak: false })
    painter.restore()

    // ── Coordinates ──────────────────────────────────────────────────────────
    painter.save()
    painter.fillColor("#64748b").fillOpacity(1).font("Helvetica").fontSize(6.5)
    const lat = data.lat ?? 27.9944
    const lng = data.lng ?? -81.7603
    painter.text(`${lat.toFixed(4)}°N  ${Math.abs(lng).toFixed(4)}°W`, 8, h - 12, { lineBreak: false })
    painter.restore()

    // ── Info card (dark overlay top-left) ────────────────────────────────────
    painter.save()
    painter.roundedRect(8, 8, 166, 62, 5)
    painter.fillColor("#000000").fillOpacity(0.72).fill()
    painter.restore()

    painter.save()
    painter.fillOpacity(1)
    painter.font("Helvetica-Bold").fontSize(8.5).fillColor("#ffffff")
    painter.text(eventDate, 18, 18, { lineBreak: false })
    painter.font("Helvetica-Bold").fontSize(8.5).fillColor("#fb923c")
    painter.text(stormLabel, 18, 31, { lineBreak: false })
    painter.font("Helvetica").fontSize(7.5).fillColor("#cbd5e1")
    painter.text(`~${homes} Houses Impacted`, 18, 44, { lineBreak: false })
    painter.font("Helvetica").fontSize(7).fillColor("#94a3b8")
    painter.text(verificationLabel, 18, 55, { lineBreak: false })
    painter.restore()
  }

  return React.createElement(Document, { title: `Storm Alert — ${data.areaName}` },
    React.createElement(Page, { size: "LETTER", style: S.page },

      // Header
      React.createElement(View, { style: S.headerBox },
        React.createElement(Text, { style: S.companyName }, contactName.toUpperCase()),
        React.createElement(Text, { style: S.contactLine }, contactDisplay),
      ),
      React.createElement(View, { style: S.dividerGreen }),

      // Headline
      React.createElement(Text, { style: S.headline },
        `${headline} ON ${eventDate.toUpperCase()}.`
      ),
      React.createElement(Text, { style: S.subhead }, subhead),

      // Impact map — drawn entirely via PDFKit Canvas (no external images needed)
      React.createElement(Canvas, {
        style: { width: PDF_MAP_W, height: PDF_MAP_H },
        paint: paintMap,
      }),

      // Caption
      React.createElement(Text, { style: S.mapCaption },
        `${eventDate}  |  ${locationLabel}, FL  |  ${verificationLabel}  |  ~${homes} Homes in Impact Radius`
      ),

      // Letter body
      React.createElement(Text, { style: S.salutation }, "Dear Homeowner,"),
      React.createElement(Text, { style: S.bodyText }, body.p1),
      React.createElement(Text, { style: S.bodyText }, body.p2),

      ...BULLETS.map((b) =>
        React.createElement(View, { key: b, style: S.bullet },
          React.createElement(Text, { style: S.bulletDot }, "•"),
          React.createElement(Text, { style: S.bulletText }, b),
        )
      ),

      // CTA
      React.createElement(View, { style: S.ctaBox },
        React.createElement(Text, { style: S.ctaText },
          `Call or text ${contactName} today: ${contactDisplay}`
        )
      ),

      // Signature
      React.createElement(Text, { style: { fontSize: 10, color: "#374151", marginBottom: 2 } }, "Sincerely,"),
      React.createElement(Text, { style: S.sigName }, contactName),
      React.createElement(Text, { style: S.sigLine }, contactDisplay),

      // Disclaimer
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
