import nodemailer from "nodemailer";
import type { SendMailOptions, Transporter } from "nodemailer";

const smtpUser = process.env.NEXT_PUBLIC_EMAIL_USER;
const smtpPass = process.env.NEXT_PUBLIC_EMAIL_PASS;
const smtpHost = process.env.NEXT_PUBLIC_EMAIL_HOST ?? "smtp.gmail.com";
const smtpPort = Number(process.env.NEXT_PUBLIC_EMAIL_PORT ?? 587);

const gmailClientId = process.env.GMAIL_CLIENT_ID;
const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
const gmailRedirectUri = process.env.GMAIL_REDIRECT_URI;
const gmailSender = process.env.GMAIL_SENDER ?? smtpUser;

let cachedTransporter: Transporter | null = null;

async function fetchGmailAccessToken(): Promise<string> {
  if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
    throw new Error("Gmail OAuth credentials are missing.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: gmailClientId,
      client_secret: gmailClientSecret,
      refresh_token: gmailRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch Gmail access token: ${response.status} ${body}`);
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Gmail access token missing in response.");
  }
  return json.access_token;
}

async function buildTransporter(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;

  // Prefer Gmail OAuth if available, otherwise fallback to SMTP user/pass.
  if (gmailClientId && gmailClientSecret && gmailRefreshToken && gmailSender) {
    const accessToken = await fetchGmailAccessToken();
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmailSender,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
        accessToken,
      },
    });
    return cachedTransporter;
  }

  if (!smtpUser || !smtpPass) {
    throw new Error("Email credentials are not configured.");
  }

  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return cachedTransporter;
}

export type EmailPayload = Pick<SendMailOptions, "subject" | "html" | "text"> & {
  to: string;
  from?: string;
};

export async function sendEmail(payload: EmailPayload) {
  const transporter = await buildTransporter();
  const sender = payload.from ?? gmailSender ?? smtpUser;
  if (!sender) {
    throw new Error("Sender email is not configured.");
  }
  const from = payload.from ?? `carriX Notifications <${sender}>`;

  try {
    await transporter.sendMail({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      from,
    });
  } catch (error) {
    console.error("[mailer] Failed to send email", error);
    throw new Error("Unable to send email right now.");
  }
}

export function assertMailerConfig() {
  const hasOAuth = gmailClientId && gmailClientSecret && gmailRefreshToken && gmailSender;
  const hasSmtp = smtpUser && smtpPass;

  if (!hasOAuth && !hasSmtp) {
    throw new Error("No email credentials configured. Provide Gmail OAuth envs or SMTP user/pass.");
  }

  return {
    mode: hasOAuth ? "gmail-oauth" : "smtp",
    sender: gmailSender ?? smtpUser,
  };
}
