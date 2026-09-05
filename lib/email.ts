import "server-only";

// Minimal email sender built on Resend's HTTP API (https://resend.com) — no
// SDK/dependency, just `fetch`. Configuration lives in environment variables:
//
//   RESEND_API_KEY   API key from the Resend dashboard (starts with "re_")
//   EMAIL_FROM       the "From" address, e.g. "Mr. Cash Auto Sales
//                    <leads@yourdomain.com>". Defaults to Resend's shared
//                    "onboarding@resend.dev" sender, which only delivers to
//                    the address that owns the Resend account — fine for a
//                    first test, but verify a domain for real use.
//
// The *destination* address is NOT an env var — it's set in the admin panel
// (Business Settings → "Lead notification email") and passed in as `to`.

export type LeadNotificationType = "GENERAL_INQUIRY" | "TEST_DRIVE" | "FINANCING";

const TYPE_LABEL: Record<LeadNotificationType, string> = {
  GENERAL_INQUIRY: "General inquiry",
  TEST_DRIVE: "Test drive request",
  FINANCING: "Financing application",
};

export type LeadNotification = {
  type: LeadNotificationType;
  name: string;
  email: string;
  phone?: string | null;
  vehicle?: string | null;
  preferredDate?: Date | null;
  message?: string | null;
};

/**
 * Emails a "new lead" notification. Never throws — a failed send is logged and
 * swallowed so it can't break the visitor's form submission. Silently no-ops
 * when `to` is blank (not configured yet) or `RESEND_API_KEY` is missing.
 */
export async function sendLeadNotification(
  to: string | null | undefined,
  lead: LeadNotification
): Promise<void> {
  const recipient = to?.trim();
  if (!recipient) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] RESEND_API_KEY not set — skipping lead notification to ${recipient}`
      );
    }
    return;
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const label = TYPE_LABEL[lead.type];

  const rows: Array<[string, string | null | undefined]> = [
    ["Type", label],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Vehicle", lead.vehicle],
    [
      "Preferred date/time",
      lead.preferredDate ? lead.preferredDate.toLocaleString() : null,
    ],
  ];

  const textBody = [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    ...(lead.message ? ["", "Message:", lead.message] : []),
  ].join("\n");

  const htmlBody = `
    <div style="font:14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
      <h2 style="margin:0 0 12px">New ${escapeHtml(label.toLowerCase())}</h2>
      <table style="border-collapse:collapse">
        ${rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="padding:2px 12px 2px 0;color:#64748b">${escapeHtml(
                k
              )}</td><td style="padding:2px 0">${escapeHtml(String(v))}</td></tr>`
          )
          .join("")}
      </table>
      ${
        lead.message
          ? `<p style="margin:16px 0 4px;color:#64748b">Message</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(
              lead.message
            )}</p>`
          : ""
      }
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: lead.email,
        subject: `${label} — ${lead.name}`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend returned ${res.status}: ${detail}`);
    }
  } catch (error) {
    console.error("[email] Failed to send lead notification:", error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c
  );
}
