const brand = {
  name: "carriX",
  footer: "This is an automated notification from the carriX team. Please do not reply to this email.",
};

const formatDate = (value: Date) =>
  value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function buildSignupConfirmationEmail(params: {
  name?: string | null;
  companyName: string;
  confirmUrl: string;
  expiresAt: Date;
}) {
  const subject = "Confirm your carriX workspace setup";
  const greeting = params.name?.trim().length ? `Dear ${params.name},` : "Hello,";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc;">
      <div style="background:#0f172a;border-radius:16px;padding:20px 24px;">
        <p style="color:#e2e8f0;font-size:16px;margin:0;">${greeting}</p>
        <h2 style="color:#f8fafc;margin:12px 0 8px;font-size:22px;">Verify your email to finish creating ${params.companyName}</h2>
        <p style="color:#cbd5e1;margin:0 0 12px;font-size:14px;line-height:1.6;">
          We received your request to open a carriX workspace for <strong>${params.companyName}</strong>. Please confirm your email to continue with plan selection and invoicing.
        </p>
        <div style="margin:16px 0;">
          <a href="${params.confirmUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#f8fafc;text-decoration:none;border-radius:10px;font-weight:700;">
            Complete signup
          </a>
        </div>
        <p style="color:#cbd5e1;margin:0 0 8px;font-size:13px;">This link expires on ${formatDate(params.expiresAt)}.</p>
      </div>
      <p style="color:#475569;font-size:12px;margin:16px 0 0;">${brand.footer}</p>
    </div>
  `;

  const text = `${greeting}\n\nPlease confirm your email to finish creating ${params.companyName} on carriX.\nLink: ${params.confirmUrl}\nThis link expires on ${formatDate(params.expiresAt)}.\n\n${brand.footer}`;

  return { subject, html, text };
}

export function buildSignupInvoiceEmail(params: {
  name?: string | null;
  companyName: string;
  planName: string;
  planPrice: number;
  billingEmail: string;
  seats: number;
  invoiceNumber: string;
}) {
  const subject = `Invoice ${params.invoiceNumber} for your carriX workspace`;
  const greeting = params.name?.trim().length ? `Dear ${params.name},` : "Hello,";
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(params.planPrice);
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:22px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="margin:0;font-size:20px;color:#0f172a;">Invoice ${params.invoiceNumber}</h2>
          <span style="background:#e0f2fe;color:#075985;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700;">Pending</span>
        </div>
        <p style="margin:0 0 12px;color:#334155;">${greeting}</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
          Thank you for choosing carriX. Below is the summary of your selected plan for <strong>${params.companyName}</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          <tr>
            <td style="padding:10px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;">Plan</td>
            <td style="padding:10px;border:1px solid #e2e8f0;">${params.planName}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;">Seats</td>
            <td style="padding:10px;border:1px solid #e2e8f0;">${params.seats}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;">Billing contact</td>
            <td style="padding:10px;border:1px solid #e2e8f0;">${params.billingEmail}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;">Amount</td>
            <td style="padding:10px;border:1px solid #e2e8f0;">${currency}</td>
          </tr>
        </table>
        <p style="margin:12px 0 0;color:#475569;font-size:13px;">If you have already settled this invoice, please disregard this notice.</p>
      </div>
      <p style="color:#475569;font-size:12px;margin:14px 0 0;">${brand.footer}</p>
    </div>
  `;

  const text = `${greeting}\n\nInvoice ${params.invoiceNumber}\nPlan: ${params.planName}\nSeats: ${params.seats}\nBilling contact: ${params.billingEmail}\nAmount: ${currency}\n\n${brand.footer}`;

  return { subject, html, text };
}

export function buildSignupCompleteEmail(params: {
  name?: string | null;
  companyName: string;
  dashboardUrl: string;
}) {
  const subject = "Your carriX workspace is ready";
  const greeting = params.name?.trim().length ? `Dear ${params.name},` : "Hello,";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc;">
      <div style="background:#0f172a;border-radius:16px;padding:20px 24px;">
        <p style="color:#e2e8f0;font-size:16px;margin:0;">${greeting}</p>
        <h2 style="color:#f8fafc;margin:12px 0 8px;font-size:22px;">${params.companyName} is now live</h2>
        <p style="color:#cbd5e1;margin:0 0 14px;font-size:14px;line-height:1.6;">
          Your workspace has been provisioned. You can invite teammates, publish roles, and start sorting CVs immediately.
        </p>
        <div style="margin:16px 0;">
          <a href="${params.dashboardUrl}" style="display:inline-block;padding:12px 18px;background:#22c55e;color:#0f172a;text-decoration:none;border-radius:10px;font-weight:700;">
            Go to dashboard
          </a>
        </div>
      </div>
      <p style="color:#475569;font-size:12px;margin:16px 0 0;">${brand.footer}</p>
    </div>
  `;

  const text = `${greeting}\n\nYour workspace for ${params.companyName} is ready. Visit ${params.dashboardUrl} to get started.\n\n${brand.footer}`;

  return { subject, html, text };
}

export function buildPasswordResetEmail(params: { name?: string | null; resetUrl: string; expiresAt: Date }) {
  const subject = "Reset your carriX password";
  const greeting = params.name?.trim().length ? `Hi ${params.name},` : "Hi there,";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px 22px;">
        <p style="color:#0f172a;font-size:15px;margin:0 0 8px;">${greeting}</p>
        <h2 style="color:#0f172a;margin:0 0 12px;font-size:20px;">Reset your password</h2>
        <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 14px;">
          We received a request to reset your carriX password. Click the button below to choose a new one. If you didn&apos;t make this request, you can safely ignore this email.
        </p>
        <div style="margin:18px 0;">
          <a href="${params.resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#f8fafc;text-decoration:none;border-radius:10px;font-weight:700;">
            Reset password
          </a>
        </div>
        <p style="color:#475569;margin:0 0 6px;font-size:13px;">This link expires on ${formatDate(params.expiresAt)}.</p>
        <p style="color:#475569;margin:0;font-size:13px;">If the button doesn&apos;t work, copy and paste this URL into your browser:</p>
        <p style="color:#2563eb;margin:6px 0 0;font-size:13px;word-break:break-all;">${params.resetUrl}</p>
      </div>
      <p style="color:#475569;font-size:12px;margin:14px 0 0;">${brand.footer}</p>
    </div>
  `;

  const text = `${greeting}\n\nWe received a request to reset your carriX password. Use the link below to set a new one. If you didn't request this, you can ignore this email.\nLink: ${params.resetUrl}\nThis link expires on ${formatDate(params.expiresAt)}.\n\n${brand.footer}`;

  return { subject, html, text };
}

export function buildMemberInvitationEmail(params: {
  inviteeEmail: string;
  inviterName?: string | null;
  organizationName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
  note?: string;
}) {
  const subject = `Invitation to join ${params.organizationName} on carriX`;
  const greeting = "Hello,";
  const roleLabel = params.role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px 22px;">
        <p style="color:#0f172a;font-size:15px;margin:0 0 8px;">${greeting}</p>
        <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 12px;">
          ${params.inviterName ?? "A workspace owner"} has invited you to join <strong>${params.organizationName}</strong> on carriX as a <strong>${roleLabel}</strong>.
        </p>
        ${
          params.note && params.note.trim().length
            ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin:12px 0;">
                 <p style="color:#0f172a;font-size:13px;font-weight:700;margin:0 0 6px;">Note from the inviter</p>
                 <p style="color:#334155;font-size:13px;line-height:1.5;margin:0;">${params.note
                   .trim()
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")}</p>
               </div>`
            : ""
        }
        <div style="margin:16px 0;">
          <a href="${params.inviteUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#f8fafc;text-decoration:none;border-radius:10px;font-weight:700;">
            Accept invitation
          </a>
        </div>
        <p style="color:#475569;margin:0;font-size:13px;">This link expires on ${formatDate(params.expiresAt)}.</p>
      </div>
      <p style="color:#475569;font-size:12px;margin:14px 0 0;">${brand.footer}</p>
    </div>
  `;

  const noteBlock =
    params.note && params.note.trim().length
      ? `\n\nNote from inviter:\n${params.note.trim()}`
      : "";

  const text = `${greeting}\n\n${params.inviterName ?? "A workspace owner"} invited you to join ${
    params.organizationName
  } as ${roleLabel}.${noteBlock}\nLink: ${params.inviteUrl}\nThis link expires on ${formatDate(
    params.expiresAt,
  )}.\n\n${brand.footer}`;

  return { subject, html, text };
}
