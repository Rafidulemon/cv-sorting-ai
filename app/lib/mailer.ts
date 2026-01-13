import nodemailer from "nodemailer";
import type { SendMailOptions, Transporter } from "nodemailer";

const smtpUser = process.env.NEXT_PUBLIC_EMAIL_USER;
const smtpPass = process.env.NEXT_PUBLIC_EMAIL_PASS;
const smtpHost = process.env.NEXT_PUBLIC_EMAIL_HOST ?? "smtp.gmail.com";
const smtpPort = Number(process.env.NEXT_PUBLIC_EMAIL_PORT ?? 587);

let cachedTransporter: Transporter | null = null;

function buildTransporter() {
  if (cachedTransporter) return cachedTransporter;

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
  const transporter = buildTransporter();
  const from = payload.from ?? `carriX Notifications <${smtpUser}>`;

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
  if (!smtpUser || !smtpPass) {
    throw new Error("Email user or password missing from environment configuration.");
  }
  return { smtpUser };
}
