import React from "react"
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer"
import type { ReportData } from "@/types"
import { formatDate } from "@/lib/utils"
import { STORM_COLORS } from "@/lib/stormColors"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
  header: { marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #1e40af" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1e40af" },
  titleSub: { fontSize: 9, color: "#6b7280", marginTop: 3 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 8, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { fontFamily: "Helvetica-Bold", width: 150 },
  value: { flex: 1, color: "#374151" },
  // Severity badge
  sevBox: { borderRadius: 4, padding: "3 8", fontSize: 9, fontFamily: "Helvetica-Bold" },
  sevEXTREME: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  sevHIGH: { backgroundColor: "#ffedd5", color: "#c2410c" },
  sevMODERATE: { backgroundColor: "#fef9c3", color: "#a16207" },
  sevLOW: { backgroundColor: "#f1f5f9", color: "#475569" },
  // Impact stats box
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 10 },
  statLabel: { fontSize: 8, color: "#94a3b8", marginBottom: 3 },
  statValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  statUnit: { fontSize: 8, color: "#64748b", marginTop: 2 },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#1e40af", padding: 6, marginBottom: 2 },
  tableHeaderCell: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow: { flexDirection: "row", padding: 5, borderBottom: "1px solid #f3f4f6" },
  tableRowAlt: { flexDirection: "row", padding: 5, backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" },
  tableCell: { fontSize: 9, color: "#374151" },
  colType: { width: "18%" },
  colDate: { width: "20%" },
  colLocation: { width: "26%" },
  colSeverity: { width: "14%" },
  colSource: { width: "22%" },
  // Disclaimer
  disclaimer: { backgroundColor: "#fef3c7", padding: 12, borderRadius: 4, border: "1px solid #fcd34d", marginTop: 16 },
  disclaimerTitle: { fontFamily: "Helvetica-Bold", color: "#92400e", marginBottom: 4 },
  disclaimerText: { color: "#78350f", fontSize: 9, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#9ca3af", fontSize: 8 },
})

function sevStyle(sev: string) {
  if (sev === "EXTREME") return styles.sevEXTREME
  if (sev === "HIGH") return styles.sevHIGH
  if (sev === "LOW") return styles.sevLOW
  return styles.sevMODERATE
}

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

function parseSeverity(summary: string, areaName: string): string {
  const m = summary.match(/severity[:\s]+([A-Z]+)/i)
  if (m) return m[1].toUpperCase()
  const name = areaName.toLowerCase()
  if (name.includes("tornado") || name.includes("hurricane")) return "HIGH"
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
  const radiusMi = radiusM / 1609.34
  const homes = Math.round(Math.PI * radiusMi * radiusMi * 1200)
  if (homes >= 1_000_000) return `${(homes / 1_000_000).toFixed(1)}M`
  if (homes >= 1_000) return `${Math.round(homes / 1_000)}k`
  return homes.toString()
}

function StormReportDocument({ data }: { data: ReportData }) {
  const stormType = parseStormType(data.areaName)
  const severity = parseSeverity(data.summary, data.areaName)
  const radiusM = impactRadiusM(stormType, severity)
  const radiusMiLabel = (radiusM / 1609.34).toFixed(1)
  const homes = estimateHomes(radiusM)

  return React.createElement(Document, { title: `ClaimCast Storm Report — ${data.areaName}` },
    React.createElement(Page, { size: "LETTER", style: styles.page },

      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, { style: styles.headerTop },
          React.createElement(View, null,
            React.createElement(Text, { style: styles.title }, "⚡ ClaimCast"),
            React.createElement(Text, { style: styles.titleSub },
              `Storm Exposure Report  |  Generated: ${formatDate(data.generatedAt, "long")}`
            )
          ),
          React.createElement(View, { style: [styles.sevBox, sevStyle(severity)] },
            React.createElement(Text, null, `${severity} SEVERITY`)
          )
        )
      ),

      // Impact Stats
      React.createElement(View, { style: styles.statsRow },
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statLabel }, "AFFECTED AREA"),
          React.createElement(Text, { style: styles.statValue }, radiusMiLabel),
          React.createElement(Text, { style: styles.statUnit }, "mile radius")
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statLabel }, "EST. HOMES AFFECTED"),
          React.createElement(Text, { style: styles.statValue }, `~${homes}`),
          React.createElement(Text, { style: styles.statUnit }, "housing units in impact zone")
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statLabel }, "STORM EVENTS"),
          React.createElement(Text, { style: styles.statValue }, String(data.stormEvents.length)),
          React.createElement(Text, { style: styles.statUnit }, "confirmed events")
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statLabel }, "NWS ALERTS"),
          React.createElement(Text, { style: styles.statValue }, String(data.alerts.length)),
          React.createElement(Text, { style: styles.statUnit }, "active/archived alerts")
        )
      ),

      // Report Summary
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Report Summary"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Area:"),
          React.createElement(Text, { style: styles.value }, data.areaName)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Storm Type:"),
          React.createElement(Text, { style: styles.value },
            STORM_COLORS[stormType as keyof typeof STORM_COLORS]?.label ?? stormType
          )
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Severity:"),
          React.createElement(Text, { style: styles.value }, severity)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Impact Radius:"),
          React.createElement(Text, { style: styles.value }, `${radiusMiLabel} miles (~${radiusM.toLocaleString()} meters)`)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Est. Homes Affected:"),
          React.createElement(Text, { style: styles.value },
            `~${homes} housing units (based on FL avg 1,200 units/sq mi within impact radius)`
          )
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Affected Locations:"),
          React.createElement(Text, { style: styles.value },
            data.affectedLocations.slice(0, 10).join(", ") || "See event details"
          )
        )
      ),

      // Narrative Summary
      data.summary && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Storm Summary"),
        React.createElement(Text, { style: { lineHeight: 1.6, color: "#374151" } }, data.summary)
      ),

      // Storm Events Table
      data.stormEvents.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Storm Events"),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableHeaderCell, styles.colType] }, "Type"),
          React.createElement(Text, { style: [styles.tableHeaderCell, styles.colDate] }, "Date/Time"),
          React.createElement(Text, { style: [styles.tableHeaderCell, styles.colLocation] }, "Location"),
          React.createElement(Text, { style: [styles.tableHeaderCell, styles.colSeverity] }, "Severity"),
          React.createElement(Text, { style: [styles.tableHeaderCell, styles.colSource] }, "Source")
        ),
        ...data.stormEvents.slice(0, 30).map((evt, i) =>
          React.createElement(View, { key: evt.id, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
            React.createElement(Text, { style: [styles.tableCell, styles.colType] },
              STORM_COLORS[evt.eventType as keyof typeof STORM_COLORS]?.label ?? evt.eventType
            ),
            React.createElement(Text, { style: [styles.tableCell, styles.colDate] }, formatDate(evt.startTime)),
            React.createElement(Text, { style: [styles.tableCell, styles.colLocation] },
              evt.locationName + (evt.county ? `, ${evt.county}` : "")
            ),
            React.createElement(Text, { style: [styles.tableCell, styles.colSeverity] }, evt.severity ?? "—"),
            React.createElement(Text, { style: [styles.tableCell, styles.colSource] }, evt.source)
          )
        )
      ),

      // NWS Alerts
      data.alerts.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "NWS Alerts"),
        ...data.alerts.slice(0, 10).map((alert, i) =>
          React.createElement(View, { key: alert.id, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
            React.createElement(Text, { style: [styles.tableCell, { flex: 1 }] },
              `${alert.title}  |  ${alert.areaDesc}  |  Exp: ${formatDate(alert.expires)}`
            )
          )
        )
      ),

      // Disclaimer
      React.createElement(View, { style: styles.disclaimer },
        React.createElement(Text, { style: styles.disclaimerTitle }, "⚠  IMPORTANT DISCLAIMER"),
        React.createElement(Text, { style: styles.disclaimerText },
          "This report is based on publicly available weather data from the National Weather Service (NWS) and NOAA National Centers for Environmental Information (NCEI). Homes affected is an ESTIMATE based on Florida average housing density — it does not confirm actual damage.\n\n" +
          "This report DOES NOT confirm that any specific property has sustained damage. ClaimCast only indicates that the identified area was exposed to weather conditions that may cause property damage.\n\n" +
          "Always conduct a proper on-site inspection before making any property damage claims. ClaimCast is not liable for decisions made based on this information."
        )
      ),

      // Footer
      React.createElement(Text, { style: styles.footer },
        `ClaimCast  |  Report ID: ${data.id}  |  For public adjuster use only`
      )
    )
  )
}

export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(StormReportDocument, { data }) as any
  return renderToBuffer(doc)
}
