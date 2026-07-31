import { createTransport } from 'nodemailer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export interface InvoiceLine {
  product_name: string;
  product_price: number;
  quantity: number;
  product_image?: string | null;
}

export interface InvoiceOrder {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  country?: string | null;
  total: number;
  payment_method?: string | null;
  terms_version?: string | null;
  created_at?: string | null;
  order_items?: InvoiceLine[];
}

export interface WalletEntry {
  coin: string;
  network: string;
  address: string;
}

export interface PaymentDetails {
  wallet_addresses?: WalletEntry[];
  bank?: {
    account_name?: string;
    account_number?: string;
    iban?: string;
    swift?: string;
    bank_name?: string;
  };
  moneygram?: {
    receiver_name?: string;
    receiver_details?: string;
  };
  instructions?: string;
}

const COMPANY = {
  name: SITE_NAME,
  legal: 'Unified Commercial Register 7012655093 · Precious Metals License 30500601/11',
  address: 'Dubai, United Arab Emirates',
  contact: 'sales@amira-gdi.live',
  url: SITE_URL,
};

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function paymentInstructions(order: InvoiceOrder, details: PaymentDetails): string {
  const ref = order.id.slice(0, 8).toUpperCase();
  const email = order.email;
  const extra = details.instructions ? `<br/><br/>${esc(details.instructions)}` : '';

  switch (order.payment_method) {
    case 'bank-transfer': {
      const bank = details.bank || {};
      if (bank.iban || bank.account_number) {
        const rows = [
          bank.account_name ? ['Account name', bank.account_name] : null,
          bank.account_number ? ['Account number', bank.account_number] : null,
          bank.iban ? ['IBAN', bank.iban] : null,
          bank.swift ? ['SWIFT / BIC', bank.swift] : null,
          bank.bank_name ? ['Bank', bank.bank_name] : null,
        ].filter(Boolean) as [string, string][];
        const list = rows
          .map(([label, value]) => `<div style="margin-top:6px;"><span style="color:#8a7a4a;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${label}:</span> <span style="font-weight:600;color:#232323;">${esc(value)}</span></div>`)
          .join('');
        return `Please transfer the total amount to our bank account using the details below. Use order reference <strong>${ref}</strong> as the payment reference.${list}${extra}`;
      }
      return `Please transfer the total amount to our bank account. Our bank details will be sent to ${email}. Use order reference <strong>${ref}</strong> as the payment reference. Your order will be dispatched once payment has cleared.${extra}`;
    }
    case 'cryptocurrency': {
      const wallets = (details.wallet_addresses || []).filter((w) => w.coin && w.address);
      if (wallets.length) {
        const list = wallets
          .map(
            (w) =>
              `<div style="margin-top:10px;background:#ffffff;border:1px solid #eadfc4;border-radius:6px;padding:10px 12px;"><div style="color:#8a7a4a;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${esc(w.coin)}${w.network ? ` · ${esc(w.network)}` : ''}</div><div style="font-family:monospace;font-weight:600;color:#232323;word-break:break-all;margin-top:3px;">${esc(w.address)}</div></div>`
          )
          .join('');
        return `Please send the exact amount due in cryptocurrency to the wallet address below for the correct network. Use order reference <strong>${ref}</strong> as the payment reference. Please complete the transfer within 1 hour. Your order will be dispatched once the transaction is confirmed on-chain.${list}${extra}`;
      }
      return `Our crypto wallet address and the exact amount due will be sent to ${email}. Please complete the transfer within 1 hour. Your order will be dispatched once the transaction is confirmed on-chain.${extra}`;
    }
    case 'moneygram': {
      const mg = details.moneygram || {};
      if (mg.receiver_name) {
        const detail = mg.receiver_details ? `<div style="margin-top:6px;color:#555;">${esc(mg.receiver_details)}</div>` : '';
        return `Please complete the MoneyGram transfer to <strong>${esc(mg.receiver_name)}</strong>. Include your order reference <strong>${ref}</strong> to match the payment to your order.${detail}${extra}`;
      }
      return `Please complete the MoneyGram transfer using the details sent to ${email}. Include your order reference <strong>${ref}</strong> to match the payment to your order.${extra}`;
    }
    default:
      return `Our team will contact you shortly with payment instructions for ${order.payment_method ?? 'your selected method'}.${extra}`;
  }
}

export function buildOrderInvoiceHtml(order: InvoiceOrder, details: PaymentDetails = {}): string {
  const ref = order.id.slice(0, 8).toUpperCase();
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const items = order.order_items ?? [];
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-size:13px;color:#232323;">${it.product_name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-size:13px;color:#555;text-align:center;">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-size:13px;color:#555;text-align:right;">${fmt(Number(it.product_price))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e6e1d6;font-size:13px;font-weight:600;color:#232323;text-align:right;">${fmt(Number(it.product_price) * Number(it.quantity))}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f1ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e,#23233a);padding:28px 32px;">
              <table role="presentation" width="100%">
                <tr>
                  <td valign="middle">
                    <img src="${SITE_URL}/images/logo.png" alt="${SITE_NAME}" width="52" height="52" style="border-radius:8px;vertical-align:middle;margin-right:12px;" />
                    <span style="font-size:17px;font-weight:700;color:#e8c66a;letter-spacing:0.5px;">${SITE_NAME}</span>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size:11px;color:#b9b9cf;text-transform:uppercase;letter-spacing:1px;">Invoice / Order confirmation</div>
                    <div style="font-size:20px;font-weight:800;color:#ffffff;margin-top:2px;">#${ref}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meta -->
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <table role="presentation" width="100%">
                <tr>
                  <td valign="top" style="font-size:12px;color:#777;">
                    <div style="font-weight:700;color:#232323;font-size:13px;">${SITE_NAME}</div>
                    <div style="margin-top:3px;">${COMPANY.address}</div>
                    <div>${COMPANY.contact}</div>
                    <div style="color:#999;">${COMPANY.legal}</div>
                  </td>
                  <td valign="top" align="right" style="font-size:12px;color:#777;">
                    <div style="font-weight:700;color:#232323;font-size:13px;">Billed to</div>
                    <div style="margin-top:3px;">${order.full_name ?? '—'}</div>
                    <div>${order.email}</div>
                    ${order.phone ? `<div>${order.phone}</div>` : ''}
                    <div>${order.address_line1 ?? ''}${order.address_line2 ? `, ${order.address_line2}` : ''}</div>
                    <div>${order.city ?? ''}${order.country ? `, ${order.country}` : ''}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="font-size:12px;color:#999;">
                    Order date: <span style="color:#555;">${date}</span>
                  </td>
                  <td align="right" style="font-size:12px;color:#999;">
                    Terms version: <span style="color:#555;">${order.terms_version ?? '1.0'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:16px 32px;">
              <table role="presentation" width="100%" style="border:1px solid #e6e1d6;border-radius:8px;border-collapse:collapse;">
                <thead>
                  <tr style="background:#faf8f3;">
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#8a7a4a;text-align:left;">Item</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#8a7a4a;text-align:center;">Qty</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#8a7a4a;text-align:right;">Price</th>
                    <th style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#8a7a4a;text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                  <tr>
                    <td colspan="3" style="padding:12px;text-align:right;font-size:14px;font-weight:700;color:#232323;">Total</td>
                    <td style="padding:12px;text-align:right;font-size:16px;font-weight:800;color:#b8860b;">${fmt(Number(order.total))}</td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size:11px;color:#999;margin:10px 2px 0 2px;">
                Investment-grade gold (99% purity or higher, bar or coin) is subject to 0% VAT under UAE Cabinet Decision No. 25 of 2018. Jewellery and lower-purity items are subject to the standard 5% VAT rate.
              </p>
            </td>
          </tr>

          <!-- Payment -->
          <tr>
            <td style="padding:8px 32px 20px 32px;">
              <table role="presentation" width="100%" style="background:#fbf8f1;border:1px solid #eadfc4;border-radius:8px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-size:12px;font-weight:700;color:#8a7a4a;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">Payment instructions</div>
                    <div style="font-size:13px;color:#444;line-height:1.6;">${paymentInstructions(order, details)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#faf8f3;padding:20px 32px;text-align:center;border-top:1px solid #e6e1d6;">
              <div style="font-size:12px;color:#777;line-height:1.7;">
                Thank you for your order. Your acceptance of the Terms of Sale has been recorded (version ${order.terms_version ?? '1.0'}).
              </div>
              <div style="font-size:11px;color:#999;margin-top:10px;">
                ${SITE_NAME} · ${COMPANY.address} · ${COMPANY.legal}
                <br/>© ${new Date().getFullYear()} ${SITE_NAME} · <a href="${SITE_URL}" style="color:#b8860b;text-decoration:none;">${SITE_URL}</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send the branded order invoice email to the buyer via Zoho SMTP.
 * Never throws — failures are logged so they never block an order.
 */
export async function sendOrderInvoiceEmail(order: InvoiceOrder): Promise<void> {
  const to = order.email;

  // No SMTP config → skip quietly (e.g. local dev without .env.local).
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[email] SMTP not configured — skipping invoice email to', to);
    return;
  }

  // Load the payment method's stored details (wallet addresses, bank details, etc.)
  // so the invoice always reflects the current admin configuration.
  let details: PaymentDetails = {};
  try {
    if (order.payment_method && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data } = await sb
        .from('payment_methods')
        .select('details')
        .eq('slug', order.payment_method)
        .maybeSingle();
      if (data?.details) details = data.details as PaymentDetails;
    }
  } catch (err) {
    console.error('[email] Failed to load payment details for invoice:', err);
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

  const from =
    process.env.EMAIL_FROM || `${SITE_NAME} <${process.env.SMTP_USER}>`;

  try {
    const info = await transport.sendMail({
      from,
      to,
      subject: `Your order #${order.id.slice(0, 8).toUpperCase()} — Invoice & payment details`,
      html: buildOrderInvoiceHtml(order, details),
    });
    console.log('[email] Invoice sent to', to, '| messageId:', info.messageId);
  } catch (err) {
    console.error('[email] Failed to send invoice:', err);
  } finally {
    transport.close();
  }
}
