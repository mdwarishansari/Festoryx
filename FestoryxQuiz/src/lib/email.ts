import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return cachedTransporter;
}// ─── Branding Config ──────────────────────────────────────────────────────────
export interface EmailBranding {
  logoUrl: string;
  siteName: string;
  contactEmail: string;
  footerText: string;
  youtubeUrl?: string;
}

export async function getEmailBranding(organizationId?: string, isPlatformOnly: boolean = false): Promise<EmailBranding> {
  try {
    if (!isPlatformOnly && organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { settings: true },
      });
      if (org) {
        const orgSettings = org.settings;
        const socialLinks = orgSettings?.socialLinks as any;
        return {
          logoUrl: org.logoUrl || "https://festoryx.vercel.app/Logo.gif",
          siteName: org.name,
          contactEmail: orgSettings?.contactEmail || org.email,
          footerText: `© ${new Date().getFullYear()} ${org.name}. All rights reserved.`,
          youtubeUrl: socialLinks?.youtube || "https://www.youtube.com/@Festoryx",
        };
      }
    }

    // Platform settings fallback
    let siteSettings = await prisma.siteSettings.findUnique({
      where: { id: "global" },
    });
    if (!siteSettings) {
      return {
        logoUrl: "https://festoryx.vercel.app/Logo.gif",
        siteName: "Festoryx",
        contactEmail: "warishprojects@gmail.com",
        footerText: `© ${new Date().getFullYear()} Festoryx. All rights reserved.`,
        youtubeUrl: "https://www.youtube.com/@Festoryx",
      };
    }

    return {
      logoUrl: siteSettings.logoUrl || "https://festoryx.vercel.app/Logo.gif",
      siteName: siteSettings.siteName || "Festoryx",
      contactEmail: siteSettings.contactEmail || "warishprojects@gmail.com",
      footerText: siteSettings.footerText || `© ${new Date().getFullYear()} Festoryx. All rights reserved.`,
      youtubeUrl: siteSettings.youtubeUrl || "https://www.youtube.com/@Festoryx",
    };
  } catch {
    return {
      logoUrl: "https://festoryx.vercel.app/Logo.gif",
      siteName: "Festoryx",
      contactEmail: "warishprojects@gmail.com",
      footerText: "© 2026 Festoryx. All rights reserved.",
      youtubeUrl: "https://www.youtube.com/@Festoryx",
    };
  }
}

export async function getOrganizerCardHtml(organizationId?: string): Promise<string> {
  if (!organizationId) return "";
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { settings: true },
    });
    if (!org) return "";

    const settings = org.settings;
    const socialLinks = settings?.socialLinks as any;
    const websiteUrl = org.websiteUrl || "";
    const youtubeUrl = socialLinks?.youtube || "";
    const contactPhone = settings?.contactPhone || org.phone || "";
    const isWhatsapp = socialLinks?.contactPhoneIsWhatsapp || false;

    let upiHtml = "";
    if (settings?.paymentUpiId) {
      upiHtml = `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Organizer UPI Payment ID</p>
          <p style="color:#e0e7ff;font-size:15px;font-weight:700;margin:0;font-family:monospace;">${settings.paymentUpiId}</p>
          ${settings.paymentInstructions ? `<p style="color:#64748b;font-size:11px;margin:4px 0 0;line-height:1.4;">${settings.paymentInstructions}</p>` : ""}
        </div>
      `;
    }

    let linksHtml = "";
    const links = [];
    if (websiteUrl) links.push(`<a href="${websiteUrl}" target="_blank" style="color:#818cf8;text-decoration:none;font-weight:600;margin-right:12px;">Website</a>`);
    if (youtubeUrl) links.push(`<a href="${youtubeUrl}" target="_blank" style="color:#ef4444;text-decoration:none;font-weight:600;margin-right:12px;">YouTube</a>`);
    if (contactPhone) {
      if (isWhatsapp) {
        links.push(`<a href="https://wa.me/${contactPhone.replace(/\D/g, '')}" target="_blank" style="color:#10b981;text-decoration:none;font-weight:600;margin-right:12px;">WhatsApp</a>`);
      } else {
        links.push(`<a href="tel:${contactPhone}" style="color:#3b82f6;text-decoration:none;font-weight:600;margin-right:12px;">Call</a>`);
      }
    }

    if (links.length > 0) {
      linksHtml = `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Connect with Organizer</p>
          <div style="font-size:13px;">${links.join(" &nbsp;•&nbsp; ")}</div>
        </div>
      `;
    }

    return `
      <!-- Organizer Highlighted Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1b4b;border:1.5px solid rgba(129,140,248,0.3);border-radius:16px;margin:28px 0;width:100%;text-align:left;">
        <tr>
          <td style="padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:top;width:48px;">
                  <img src="${org.logoUrl || "https://festoryx.vercel.app/Logo.gif"}" alt="${org.name}" width="40" height="40" style="border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,0.15);" />
                </td>
                <td style="vertical-align:top;padding-left:14px;text-align:left;">
                  <h4 style="color:#ffffff;font-size:16px;font-weight:700;margin:0;">Organized by ${org.name}</h4>
                  <p style="color:#a5b4fc;font-size:12px;margin:2px 0 0;">Official event host partner</p>
                </td>
              </tr>
            </table>
            ${upiHtml}
            ${linksHtml}
          </td>
        </tr>
      </table>
    `;
  } catch (error) {
    console.error("Error generating organizer card HTML:", error);
    return "";
  }
}

// ─── Base Template Wrapper ─────────────────────────────────────────────────────
function wrapEmailTemplate(
  contentHtml: string,
  accentColor: string,
  branding: EmailBranding,
  organizerCardHtml: string = ""
): string {
  const gradientMap: Record<string, string> = {
    "#4F46E5": "linear-gradient(135deg,#4F46E5,#7C3AED)",
    "#059669": "linear-gradient(135deg,#059669,#10b981)",
    "#dc2626": "linear-gradient(135deg,#dc2626,#ef4444)",
    "#D97706": "linear-gradient(135deg,#D97706,#f59e0b)",
    "#0891b2": "linear-gradient(135deg,#0891b2,#06b6d4)",
  };
  const gradient = gradientMap[accentColor] || gradientMap["#4F46E5"];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${branding.siteName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${gradient};border-radius:20px 20px 0 0;padding:40px 40px 36px;text-align:center;">
              ${
                branding.logoUrl
                  ? `<img src="${branding.logoUrl}" alt="${branding.siteName}" width="70" height="70" style="border-radius:16px;border:2px solid rgba(255,255,255,0.25);margin-bottom:16px;object-fit:cover;" /><br/>`
                  : ""
              }
              <h1 style="color:#ffffff;font-size:30px;font-weight:800;margin:0;letter-spacing:3px;text-transform:uppercase;">${branding.siteName}</h1>
              <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:6px 0 0;letter-spacing:1px;">University Event & Hackathon Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131f;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);padding:40px;text-align:left;">
              ${contentHtml}
              ${organizerCardHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d1a;border:1px solid rgba(255,255,255,0.06);border-top:1px solid rgba(255,255,255,0.08);border-radius:0 0 20px 20px;padding:28px 40px;text-align:center;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">
                ${branding.footerText}
              </p>
              <p style="color:#6b7280;font-size:11px;margin:0 0 8px;">
                Questions? Contact us at 
                <a href="mailto:${branding.contactEmail}" style="color:#818cf8;text-decoration:none;">${branding.contactEmail}</a>
              </p>
              ${branding.youtubeUrl ? `
              <p style="color:#94a3b8;font-size:11px;margin:8px 0 8px;">
                📺 Subscribe to our YouTube Channel for event videos & highlights: 
                <a href="${branding.youtubeUrl}" target="_blank" style="color:#ef4444;text-decoration:none;font-weight:600;">@Festoryx</a>
              </p>
              ` : ""}
              <p style="color:#374151;font-size:10px;margin:8px 0 0;">
                This is an automated message. Please do not reply directly to this email.
              </p>
              ${
                organizerCardHtml
                  ? `<p style="color:#374151;font-size:9px;margin:16px 0 0;border-top:1px solid rgba(255,255,255,0.05);padding-top:12px;">
                       Powered by <strong>Festoryx</strong> - The ultimate techfest and quiz arena platform.
                     </p>`
                  : `<img src="${branding.logoUrl}" alt="${branding.siteName}" width="32" height="32" style="border-radius:8px;margin-top:16px;opacity:0.5;" />`
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
// ─── Core Send Function ────────────────────────────────────────────────────────
interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const fromName = process.env.SMTP_FROM_NAME || "Festoryx Hackathon Team";
  const fromEmail = process.env.SMTP_EMAIL;

  if (!fromEmail) {
    console.warn("[Email] SMTP_EMAIL is not configured. Email not sent.");
    return;
  }

  const recipients = Array.isArray(to) ? to.join(", ") : to;
  const transporter = getTransporter();

  let lastError: any = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[Email] Sending attempt ${attempt} for "${subject}" to ${recipients}...`);
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipients,
        subject,
        html,
      });
      console.log(`[Email] ✅ Sent successfully on attempt ${attempt}: "${subject}" → ${recipients}`);
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`[Email] Attempt ${attempt} failed for "${subject}":`, error.message || error);
      if (attempt < 3) {
        const delay = attempt * 2000;
        console.log(`[Email] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`[Email] All 3 send attempts failed. Last error: ${lastError?.message || lastError}`);
}

export async function getQuizSessionLiveEmail(params: {
  participantName: string;
  sessionName: string;
  accessCode: string;
  registrationId: string;
  joinUrl: string;
  organizationId?: string;
}): Promise<{ subject: string; html: string }> {
  const { participantName, sessionName, accessCode, registrationId, joinUrl, organizationId } = params;
  const branding = await getEmailBranding(organizationId);
  const organizerCardHtml = await getOrganizerCardHtml(organizationId);

  const contentHtml = `
    <h2 style="color:#e0e7ff;font-size:24px;font-weight:700;margin:0 0 6px;">
      Live Quiz Arena Ready! 🚀
    </h2>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#e0e7ff;">${participantName}</strong>, the live session for <strong style="color:#818cf8;">${sessionName}</strong> is now live and waiting for you to join!
    </p>

    <!-- Session Details Card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Registration ID</td>
              <td align="right" style="color:#a5b4fc;font-size:16px;font-weight:700;letter-spacing:1px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05); font-family:monospace;">${registrationId}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Session</td>
              <td align="right" style="color:#f1f5f9;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">${sessionName}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:10px 0;">Access Code</td>
              <td align="right" style="color:#e0e7ff;font-size:22px;font-weight:800;letter-spacing:3px;padding:10px 0; font-family:monospace;">${accessCode}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;text-align:center;">
      <tr>
        <td align="center">
          <a href="${joinUrl}" target="_blank" style="background:#4F46E5;color:#ffffff;display:inline-block;padding:14px 30px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 10px 15px -3px rgba(79,70,229,0.3);">
            Join Live Lobby Directly 🚀
          </a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(79,70,229,0.08);border:1px solid rgba(79,70,229,0.25);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="color:#a5b4fc;font-size:12px;margin:0;line-height:1.7;">
            💡 <strong>Direct Join:</strong> The button above will automatically autofill your Registration ID and Access Code, taking you directly into the lobby room.
          </p>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `Live Quiz Active: ${sessionName} | ${branding.siteName}`,
    html: wrapEmailTemplate(contentHtml, "#4F46E5", branding, organizerCardHtml),
  };
}

// ─── Live Quiz Results Email ──────────────────────────────────────────────
export async function getQuizSessionResultEmail(params: {
  participantName: string;
  sessionName: string;
  score: number;
  leaderboardUrl: string;
  organizationId?: string;
}): Promise<{ subject: string; html: string }> {
  const { participantName, sessionName, score, leaderboardUrl, organizationId } = params;
  const branding = await getEmailBranding(organizationId);
  const organizerCardHtml = await getOrganizerCardHtml(organizationId);

  const contentHtml = `
    <h2 style="color:#e0e7ff;font-size:24px;font-weight:700;margin:0 0 6px;">
      Quiz Results Released! 🏆
    </h2>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#e0e7ff;">${participantName}</strong>, the final scores and leaderboard for the live quiz session <strong style="color:#a5b4fc;">${sessionName}</strong> are officially out!
    </p>

    <!-- Score Card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,rgba(5,150,105,0.15),rgba(16,185,129,0.08));border:1px solid rgba(5,150,105,0.3);border-radius:16px;margin-bottom:28px;">
      <tr>
        <td style="padding:28px;text-align:center;">
          <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Your Total Score</p>
          <p style="color:#6ee7b7;font-size:42px;font-weight:800;margin:0;">${score} <span style="font-size:20px;font-weight:500;color:#6b7280;">pts</span></p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;text-align:center;">
      <tr>
        <td align="center">
          <a href="${leaderboardUrl}" target="_blank" style="background:#059669;color:#ffffff;display:inline-block;padding:14px 30px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 10px 15px -3px rgba(5,150,105,0.3);">
            View Live Leaderboard 📊
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0;text-align:center;">
      Thank you for participating! Stay tuned for more competitions. 🚀
    </p>
  `;

  return {
    subject: `Quiz Results: ${sessionName} | ${branding.siteName}`,
    html: wrapEmailTemplate(contentHtml, "#059669", branding, organizerCardHtml),
  };
}

// ─── Helper Functions to Trigger Emails ──────────────────────────────────────────

export async function sendSessionLiveEmails(sessionId: string): Promise<void> {
  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          select: {
            eventId: true,
            organizationId: true,
          },
        },
      },
    });

    if (!session || !session.quiz.eventId) {
      console.warn(`[Email] Session ${sessionId} has no associated eventId. No emails sent.`);
      return;
    }

    // Query registrations for the event
    const registrations = await prisma.registration.findMany({
      where: {
        eventId: session.quiz.eventId,
        OR: [
          { paymentStatus: "APPROVED" },
          { status: "APPROVED" },
        ],
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://festoryx-quiz.vercel.app";

    console.log(`[Email] Launching live session emails for session ${session.name} to ${registrations.length} registrations...`);

    for (const reg of registrations) {
      if (!reg.email) continue;
      
      const regCode = reg.registrationId || reg.id;
      const joinUrl = `${siteUrl}/join?regCode=${encodeURIComponent(regCode)}&accessCode=${encodeURIComponent(session.accessCode)}`;
      
      const { subject, html } = await getQuizSessionLiveEmail({
        participantName: reg.participantName,
        sessionName: session.name,
        accessCode: session.accessCode,
        registrationId: regCode,
        joinUrl,
        organizationId: session.quiz.organizationId,
      });

      sendEmail({ to: reg.email, subject, html }).catch((err) => {
        console.error(`[Email] Failed to send live email to ${reg.email}:`, err);
      });
    }
  } catch (error) {
    console.error("[Email] Error in sendSessionLiveEmails:", error);
  }
}

export async function sendSessionResultEmails(sessionId: string): Promise<void> {
  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        quiz: true,
        participants: {
          include: {
            registration: true,
          },
        },
      },
    });

    if (!session) {
      console.warn(`[Email] Session ${sessionId} not found for results email.`);
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://festoryx-quiz.vercel.app";
    const leaderboardUrl = `${siteUrl}/leaderboard/${session.id}`;

    console.log(`[Email] Sending result emails for session ${session.name} to ${session.participants.length} participants...`);

    for (const participant of session.participants) {
      const email = participant.registration?.email;
      if (!email) continue;

      const { subject, html } = await getQuizSessionResultEmail({
        participantName: participant.displayName,
        sessionName: session.name,
        score: participant.totalScore,
        leaderboardUrl,
        organizationId: session.quiz.organizationId,
      });

      sendEmail({ to: email, subject, html }).catch((err) => {
        console.error(`[Email] Failed to send results email to ${email}:`, err);
      });
    }
  } catch (error) {
    console.error("[Email] Error in sendSessionResultEmails:", error);
  }
}
