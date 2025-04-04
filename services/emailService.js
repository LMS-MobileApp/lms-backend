import nodemailer from "nodemailer";
import { config } from "../config.js";

// Log email configuration
console.log("Email Config:", {
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  user: config.EMAIL_USER,
  pass: config.EMAIL_PASS,
});

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: parseInt(config.EMAIL_PORT, 10),
  secure: false, // Use TLS for port 587
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  family: 4, // Force IPv4
  tls: {
    rejectUnauthorized: true,
  },
  logger: true,
  debug: true,
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    if (!config.EMAIL_USER || !config.EMAIL_PASS) {
      throw new Error("Email credentials are not configured");
    }

    const mailOptions = {
      from: config.EMAIL_USER,
      to,
      subject,
      text,
    };

    console.log("Sending email with options:", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (err) {
    console.error("Email sending error:", err);
    throw err;
  }
};

export default sendEmail;