// Email utility using Resend REST API.
// Set RESEND_API_KEY + EMAIL_FROM in .env to enable.
// When the key is absent, emails are logged to console only (dev mode).

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? "ClaimCast <alerts@claimcast.app>"

  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set — would send to ${to}: ${subject}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[email] Resend error ${res.status}: ${text}`)
    }
  } catch (err) {
    console.error("[email] Failed to send:", err)
  }
}

export function buildStormAlertEmail(opts: {
  userName: string | null
  savedAreaName: string
  alertTitle: string
  alertSeverity: string
  alertAreaDesc: string
  alertExpires: string
  mapUrl: string
}): string {
  const { userName, savedAreaName, alertTitle, alertSeverity, alertAreaDesc, alertExpires, mapUrl } = opts
  const greeting = userName ? `Hi ${userName},` : "Hi there,"
  const severityColor =
    alertSeverity === "EXTREME" ? "#dc2626"
    : alertSeverity === "HIGH" ? "#ea580c"
    : "#d97706"

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;background:#f8fafc;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0A0F1E;padding:20px 24px;display:flex;align-items:center;gap:12px;">
      <span style="color:#60a5fa;font-size:22px;font-weight:800;letter-spacing:-0.5px;">⚡ ClaimCast</span>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">${greeting}</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;">
        A new NWS weather alert has been issued near your saved area <strong>${savedAreaName}</strong>.
      </p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-weight:700;color:#0f172a;font-size:15px;">${alertTitle}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#64748b;">${alertAreaDesc}</p>
        <span style="display:inline-block;background:${severityColor};color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;margin-top:6px;">
          ${alertSeverity}
        </span>
        <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Expires: ${alertExpires}</p>
      </div>
      <p style="margin:0 0 16px;font-size:13px;color:#64748b;">
        As a public adjuster, this area may have storm-related property damage worth investigating.
      </p>
      <a href="${mapUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">
        View on ClaimCast Map →
      </a>
      <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;">
        <strong>Disclaimer:</strong> This alert reflects storm exposure data only and does not confirm property damage.
        Always conduct a proper on-site inspection before making claims.<br /><br />
        You&apos;re receiving this because you have saved areas in ClaimCast. Manage your saved areas in the app.
      </p>
    </div>
  </div>
</body>
</html>`
}
