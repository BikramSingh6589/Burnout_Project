import nodemailer from "nodemailer";

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASSWORD must be configured to send emails");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

const fromAddress = (): string => process.env.EMAIL_FROM || `Burnout Wellness <${process.env.EMAIL_USER}>`;

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: "Verify your Burnout Wellness account",
    text: `Your verification code is ${otp}. It expires in 10 minutes. If you did not create an account, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">  
        <h2>Verify your account</h2>
        <p>Your verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string): Promise<void> => {
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: "Reset your Burnout Wellness password",
    text: `Your password reset code is ${token}. It expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">  
        <h2>Reset your password</h2>
        <p>Your password reset code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${token}</p>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
};

export const sendWeeklyReminderEmail = async (to: string, name: string): Promise<void> => {
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: "Weekly Assessment Reminder - Burnout Wellness",
    text: `Hi ${name},\n\nIt's time for your weekly burnout assessment! Click the button below to take it now:\n\n${appUrl}\n\nBest regards,\nBurnout Wellness Team`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:600px;margin:0 auto">
        <h2 style="color:#4F46E5">Hi ${name},</h2>
        <p>It's time for your weekly burnout assessment! Taking it regularly helps you track your well-being.</p>
        <div style="margin:30px 0;text-align:center">
          <a href="${appUrl}" style="background-color:#4F46E5;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">
            Take Assessment Now
          </a>
        </div>
        <p style="color:#6B7280;font-size:14px">Best regards,<br>Burnout Wellness Team</p>
      </div>
    `,
  });
};

export const sendSupportEmail = async (to: string, name: string, subject: string, message: string): Promise<void> => {
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject,
    text: `Dear ${name},\n\n${message}\n\nBest regards,\nBurnout Wellness Team`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;margin:0 auto;max-width:680px;color:#111827;line-height:1.6;padding:20px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
          <h2 style="margin:0 0 18px;font-size:24px;color:#1f2937;font-weight:700;">${subject}</h2>
          <p style="margin:0 0 18px;color:#374151;font-size:16px;">Dear ${name},</p>
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:22px;white-space:pre-wrap;color:#334155;font-size:15px;">
            ${message}
          </div>
          <p style="margin:0 0 4px;color:#475569;font-size:14px;">Remember, your wellbeing is important. If you need additional support, please reach out to your counselor or support services.</p>
          <p style="margin:0;color:#475569;font-size:14px;">Best regards,<br/>Burnout Wellness Team</p>
        </div>
      </div>
    `,
  });
};

export type WellnessRiskTier = "high" | "moderate" | "low";

export interface WellnessEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const wellnessEmailShell = (subject: string, studentName: string, bodyHtml: string): string => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background:#e0f2fe;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#e0f2fe;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #bae6fd;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(14,116,144,0.12);">
              <tr>
                <td style="background:linear-gradient(135deg,#38bdf8 0%,#0ea5e9 100%);padding:24px 28px;">
                  <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e0f2fe;">Student Wellness Platform</p>
                  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">${subject}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;color:#0f172a;font-size:16px;line-height:1.7;">
                  <p style="margin:0 0 16px;">Hello ${studentName},</p>
                  ${bodyHtml}
                  <p style="margin:24px 0 0;color:#475569;font-size:14px;">Student Wellness Platform</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

export const getWellnessEmailTemplate = (
  tier: WellnessRiskTier,
  studentName: string
): WellnessEmailTemplate => {
  if (tier === "high") {
    const subject = "Wellness Support Reminder";
    const paragraphs = [
      "Your recent wellness assessments indicate a high burnout risk level.",
      "We encourage you to review your recommendations, improve sleep quality, reduce academic stress where possible, and regularly use the Wellness Assistant for guidance.",
      "Small consistent improvements can significantly improve your wellbeing.",
      "Please take care of yourself and reach out when needed.",
    ];
    const bodyHtml = paragraphs
      .map((p) => `<p style="margin:0 0 16px;color:#334155;">${p}</p>`)
      .join("");
    const text = `Hello ${studentName},\n\n${paragraphs.join("\n\n")}\n\nStudent Wellness Platform`;
    return { subject, text, html: wellnessEmailShell(subject, studentName, bodyHtml) };
  }

  if (tier === "moderate") {
    const subject = "Wellness Progress Reminder";
    const paragraphs = [
      "Your current burnout indicators fall within the moderate range.",
      "You are making progress, but there is still room for improvement.",
      "Maintaining healthy study habits, managing stress, and following platform recommendations can help improve your wellbeing further.",
      "Keep moving forward consistently.",
    ];
    const bodyHtml = paragraphs
      .map((p) => `<p style="margin:0 0 16px;color:#334155;">${p}</p>`)
      .join("");
    const text = `Hello ${studentName},\n\n${paragraphs.join("\n\n")}\n\nStudent Wellness Platform`;
    return { subject, text, html: wellnessEmailShell(subject, studentName, bodyHtml) };
  }

  const subject = "Congratulations on Your Progress";
  const paragraphs = [
    "Your recent assessments indicate a healthy wellness status.",
    "You are maintaining positive habits and managing your academic wellbeing effectively.",
    "Continue following your current routine and regularly monitor your wellness progress.",
    "Keep up the excellent work.",
  ];
  const bodyHtml = paragraphs
    .map((p) => `<p style="margin:0 0 16px;color:#334155;">${p}</p>`)
    .join("");
  const text = `Hello ${studentName},\n\n${paragraphs.join("\n\n")}\n\nStudent Wellness Platform`;
  return { subject, text, html: wellnessEmailShell(subject, studentName, bodyHtml) };
};

export const sendWellnessTemplateEmail = async (
  to: string,
  template: WellnessEmailTemplate
): Promise<void> => {
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
};

export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactFormEmail = async (payload: ContactFormPayload): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  await getTransporter().sendMail({
    from: fromAddress(),
    to: adminEmail,
    replyTo: payload.email,
    subject: `Contact Form: ${payload.subject}`,
    text: `From: ${payload.name} (${payload.email})\n\n${payload.message}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;margin:0 auto;max-width:680px;color:#111827;line-height:1.6;padding:20px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
          <h2 style="margin:0 0 18px;font-size:24px;color:#1f2937;font-weight:700;">New Contact Form Submission</h2>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;"><strong>From:</strong> ${payload.name}</p>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;"><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;"><strong>Subject:</strong> ${payload.subject}</p>
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-top:22px;white-space:pre-wrap;color:#334155;font-size:15px;">
            ${payload.message}
          </div>
        </div>
      </div>
    `,
  });
};
