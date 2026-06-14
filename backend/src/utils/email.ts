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
