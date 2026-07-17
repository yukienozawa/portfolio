import nodemailer from "nodemailer";

// Gmail SMTP経由でメールを送信するトランスポーター
export const mailerTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});