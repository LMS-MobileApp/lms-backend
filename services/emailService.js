import nodemailer from "nodemailer";
import { config } from "../config.js";
import fs from "fs/promises"; // For reading the template file
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  secure: false, 
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  family: 4, 
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

// Function to render the email template
const renderTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, "..", "templates", `${templateName}.html`);
  let template = await fs.readFile(templatePath, "utf-8");

  // Replace placeholders with data
  for (const [key, value] of Object.entries(data)) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return template;
};

const sendEmail = async (to, subject, data) => {
  try {
    if (!config.EMAIL_USER || !config.EMAIL_PASS) {
      throw new Error("Email credentials are not configured");
    }

    const html = await renderTemplate("assignmentNotification", {
      title: subject,
      message: data.message,
      course: data.course,
      subject: data.subject,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      priority: data.priority,
    });

    const mailOptions = {
      from: config.EMAIL_USER,
      to,
      subject,
      html, // Use HTML instead of plain text
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