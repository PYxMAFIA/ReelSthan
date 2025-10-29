import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Prefer environment variables; fall back to existing defaults if present
const GMAIL_USER = process.env.GMAIL_USER ;
const GMAIL_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD;

// Create a Nodemailer transporter for Gmail (or any SMTP you configure)
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Optional helper you can call manually to verify/send a test email
export async function sendTestEmail(to) {
  const info = await transporter.sendMail({
    from: `"${process.env.SENDER_NAME || "ReelSthan"}" <${GMAIL_USER}>`,
    to: to || GMAIL_USER,
    subject: "Hello ✔",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
  });
  console.log("Message sent:", info.messageId);
  return info;
}

export default { transporter, sendTestEmail };