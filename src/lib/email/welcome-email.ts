import { createTransport } from 'nodemailer';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildWelcomeEmailHtml(name: string, confirmationUrl: string): string {
  const firstName = (name || '').trim().split(/\s+/)[0] || 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to ${esc(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Georgia,serif;color:#232323;">
  <div style="max-width:600px;margin:0 auto;padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e6e1d6;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="background:#16130e;padding:28px 32px;text-align:center;">
          <img src="${SITE_URL}/images/logo.png" alt="${SITE_NAME}" width="64" height="64" style="border-radius:8px;vertical-align:middle;" />
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 16px;font-size:24px;color:#232323;">Welcome, ${esc(firstName)} 👋</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#555;">
            Thank you for creating an account with ${esc(SITE_NAME)}. Please confirm your email address
            to activate your account so you can view and track your orders.
          </p>
          <p style="margin:0 0 24px;text-align:center;">
            <a href="${esc(confirmationUrl)}" style="display:inline-block;background:#c9a961;color:#16130e;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;">Confirm my email</a>
          </p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#777;">
            If the button above does not work, copy and paste this link into your browser:
          </p>
          <p style="margin:0 0 24px;font-size:12px;line-height:1.5;color:#8a7a4a;word-break:break-all;font-family:monospace;">
            ${esc(confirmationUrl)}
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#555;">
            This link will expire shortly. If you did not create this account, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f8f5ee;padding:20px 32px;border-top:1px solid #e6e1d6;text-align:center;font-size:12px;color:#a89f8d;line-height:1.6;">
          ${esc(SITE_NAME)} · Dubai, United Arab Emirates<br />
          <a href="${esc(SITE_URL)}" style="color:#8a7a4a;text-decoration:none;">${esc(SITE_URL)}</a>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Send a branded welcome/confirmation email to a newly created account via Zoho SMTP.
 * Never throws — failures are logged so they never block an order.
 */
export async function sendWelcomeEmail(
  to: string,
  fullName: string | null | undefined,
  confirmationUrl: string
): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[email] SMTP not configured — skipping welcome email to', to);
    return;
  }

  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.EMAIL_FROM || `${SITE_NAME} <${process.env.SMTP_USER}>`;

  try {
    const info = await transport.sendMail({
      from,
      to,
      subject: `Welcome to ${SITE_NAME} — confirm your email`,
      html: buildWelcomeEmailHtml(fullName || '', confirmationUrl),
    });
    console.log('[email] Welcome email sent to', to, '| messageId:', info.messageId);
  } catch (err) {
    console.error('[email] Failed to send welcome email:', err);
  } finally {
    transport.close();
  }
}
