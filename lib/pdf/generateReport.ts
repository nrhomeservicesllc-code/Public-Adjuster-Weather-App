import React from "react"
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer"
import type { ReportData } from "@/types"
import { formatDate } from "@/lib/utils"
import { STORM_COLORS } from "@/lib/stormColors"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
  header: { marginBottom: 24, borderBottom: "2px solid #1e40af", paddingBottom: 12 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#1e40af" },
  subtitle: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 8, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontFamily: "Helvetica-Bold", width: 130 },
  value: { flex: 1, color: "#374151" },
  tableHeader: { flexDirection: "row", backgroundColor: "#1e40af", padding: 6, marginBottom: 2 },
  tableHeaderCell: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow: { flexDirection: "row", padding: 5, borderBottom: "1px solid #f3f4f6" },
  tableRowAlt: { flexDirection: "row", padding: 5, backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" },
  tableCell: { fontSize: 9, color: "#374151" },
  badge: { borderRadius: 4, padding: "2 6", fontSize: 8, fontFamily: "Helvetica-Bold" },
  disclaimer: { backgroundColor: "#fef3c7", padding: 12, borderRadius: 4, border: "1px solid #fcd34d", marginTop: 20 },
  disclaimerTitle: { fontFamily: "Helvetica-Bold", color: "#92400e", marginBottom: 4 },
  disclaimerText: { color: "#78350f", fontSize: 9, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#9ca3af", fontSize: 8 },
  colType: { width: "18%" },
  colDate: { width: "20%" },
  colLocation: { width: "28%" },
  colSeverity: { width: "14%" },
  colSource: { width: "20%" },
})

function StormReportDocument({ data }: { data: ReportData }) {
  return React.createElement(Document, { title: `Storm Impact Report — ${data.areaName}` },
    React.createElement(Page, { size: "LETTER", style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, "⚡ Storm Impact Map"),
        React.createElement(Text, { style: styles.subtitle }, `Storm Exposure Report  |  Generated: ${formatDate(data.generatedAt, "long")}`)
      ),

      // Report Info
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Report Summary"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Area:"),
          React.createElement(Text, { style: styles.value }, data.areaName)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Date Range:"),
          React.createElement(Text, { style: styles.value }, data.dateRangeLabel)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Storm Events:"),
          React.createElement(Text, { style: styles.value }, `${data.stormEvents.length} confirmed events`)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Active Alerts:"),
          React.createElement(Text, { style: styles.value }, `${data.alerts.length} NWS alerts`)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Affected Locations:"),
          React.createElement(Text, { style: styles.value }, data.affectedLocations.slice(0, 10).join(", ") || "See event details")
        )
      ),

      // Summary
      data.summary && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Summary"),
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
            React.createElement(Text, { style: [styles.tableCell, styles.colType] }, STORM_COLORS[evt.eventType as keyof typeof STORM_COLORS]?.label ?? evt.eventType),
            React.createElement(Text, { style: [styles.tableCell, styles.colDate] }, formatDate(evt.startTime)),
            React.createElement(Text, { style: [styles.tableCell, styles.colLocation] }, evt.locationName + (evt.county ? `, ${evt.county}` : "")),
            React.createElement(Text, { style: [styles.tableCell, styles.colSeverity] }, evt.severity),
            React.createElement(Text, { style: [styles.tableCell, styles.colSource] }, evt.source)
          )
        )
      ),

      // Disclaimer
      React.createElement(View, { style: styles.disclaimer },
        React.createElement(Text, { style: styles.disclaimerTitle }, "⚠  IMPORTANT DISCLAIMER"),
        React.createElement(Text, { style: styles.disclaimerText },
          "This report is based on publicly available weather data from the National Weather Service (NWS) and NOAA National Centers for Environmental Information (NCEI). It is provided for informational purposes only.\n\n" +
          "This report DOES NOT confirm that any specific property has sustained damage. Storm Impact Map only indicates that the identified area was exposed to weather conditions that may cause property damage.\n\n" +
          "Data accuracy depends on third-party reporting agencies. Storm Impact Map is not liable for any decisions made based on this information. Always conduct a proper on-site inspection before making any property damage claims."
        )
      ),

      // Footer
      React.createElement(Text, { style: styles.footer },
        `Storm Impact Map  |  storm-impact-map.com  |  Report ID: ${data.id}  |  For public adjuster use only`
      )
    )
  )
}

export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(StormReportDocument, { data }) as any
  return renderToBuffer(doc)
}
