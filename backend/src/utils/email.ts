import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Brevo SMTP Configuration (https://www.brevo.com/)
const createTransporter = () => {
  const user = process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || process.env.user_email;
  const pass = process.env.BREVO_SMTP_PASS || process.env.BREVO_API_KEY;

  logger.info('[Brevo] Initializing SMTP transporter with user:', user ? user : 'NOT SET');

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: user,
      pass: pass,
    },
  });
};

// Helper to send emails via Brevo SMTP
const sendEmailViaBrevo = async (
  to: string | string[],
  subject: string,
  text: string,
  html: string,
  fromName: string = 'Burnout Wellness'
): Promise<void> => {
  logger.info('[Brevo] Starting email send');

  try {
    const transporter = createTransporter();
    const fromEmail = process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || process.env.user_email || 'no-reply@burnoutwellness.app';
    const fromAddress = `${fromName} <${fromEmail}>`;

    logger.info('[Brevo] From email:', fromEmail);
    logger.info('[Brevo] To email(s):', to);
    logger.info('[Brevo] Subject:', subject);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });

    logger.info('[Brevo] Email sent successfully! Message ID:', info.messageId);
  } catch (error: any) {
    logger.error('[Brevo] Error sending email:', error.message);
    logger.error('[Brevo] Full error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  logger.info('[Email] sendOtpEmail called for:', to);

  try {
    const subject = 'Verify your Burnout Wellness account';
    const text = `Your verification code is ${otp}. It expires in 10 minutes. If you did not create an account, ignore this email.`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2>Verify your account</h2>
        <p>Your verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendOtpEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendOtpEmail FAILED:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to: string, token: string): Promise<void> => {
  logger.info('[Email] sendPasswordResetEmail called for:', to);

  try {
    const subject = 'Reset your Burnout Wellness password';
    const text = `Your password reset code is ${token}. It expires in 15 minutes. If you did not request this, ignore this email.`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2>Reset your password</h2>
        <p>Your password reset code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${token}</p>
        <p>This code expires in 15 minutes.</p>
      </div>
    `;

    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendPasswordResetEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendPasswordResetEmail FAILED:', error);
    throw error;
  }
};

export const sendWeeklyReminderEmail = async (to: string, name: string): Promise<void> => {
  logger.info('[Email] sendWeeklyReminderEmail called for:', to);

  try {
    const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
    const subject = 'Weekly Assessment Reminder - Burnout Wellness';
    const text = `Hi ${name},\n\nIt's time for your weekly burnout assessment! Click the button below to take it now:\n\n${appUrl}\n\nBest regards,\nBurnout Wellness Team`;
    const html = `
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
    `;

    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendWeeklyReminderEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendWeeklyReminderEmail FAILED:', error);
    throw error;
  }
};

export const sendSupportEmail = async (to: string, name: string, subject: string, message: string): Promise<void> => {
  logger.info('[Email] sendSupportEmail called for:', to);

  try {
    const emailSubject = subject || 'New Contact Form Submission';
    const text = `Dear ${name},\n\n${message}\n\nBest regards,\nBurnout Wellness Team`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;margin:0 auto;max-width:680px;color:#111827;line-height:1.6;padding:20px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
          <h2 style="margin:0 0 18px;font-size:24px;color:#1f2937;font-weight:700;">${emailSubject}</h2>
          <p style="margin:0 0 18px;color:#374151;font-size:16px;">Dear ${name},</p>
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:22px;white-space:pre-wrap;color:#334155;font-size:15px;">
            ${message}
          </div>
          <p style="margin:0 0 4px;color:#475569;font-size:14px;">Remember, your wellbeing is important. If you need additional support, please reach out to your counselor or support services.</p>
          <p style="margin:0;color:#475569;font-size:14px;">Best regards,<br/>Burnout Wellness Team</p>
        </div>
      </div>
    `;

    await sendEmailViaBrevo(to, emailSubject, text, html);
    logger.info('[Email] sendSupportEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendSupportEmail FAILED:', error);
    throw error;
  }
};

export type WellnessRiskTier = 'high' | 'moderate' | 'low';

export interface WellnessEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface WellnessEmailTheme {
  outerBg: string;
  borderColor: string;
  headerGradient: string;
  headerSubtitleColor: string;
  guidanceBg: string;
  guidanceBorder: string;
  buttonBg: string;
  boxShadow: string;
}

const wellnessEmailThemes: Record<WellnessRiskTier, WellnessEmailTheme> = {
  high: {
    outerBg: '#FEE2E2',
    borderColor: '#FECACA',
    headerGradient: 'linear-gradient(135deg,#EF4444 0%,#DC2626 100%)',
    headerSubtitleColor: '#FEE2E2',
    guidanceBg: '#FEE2E2',
    guidanceBorder: '#FECACA',
    buttonBg: '#DC2626',
    boxShadow: '0 8px 24px rgba(220,38,38,0.14)',
  },
  moderate: {
    outerBg: '#FEF3C7',
    borderColor: '#FDE68A',
    headerGradient: 'linear-gradient(135deg,#FBBF24 0%,#F59E0B 100%)',
    headerSubtitleColor: '#FEF3C7',
    guidanceBg: '#FEF3C7',
    guidanceBorder: '#FDE68A',
    buttonBg: '#F59E0B',
    boxShadow: '0 8px 24px rgba(245,158,11,0.14)',
  },
  low: {
    outerBg: '#D1FAE5',
    borderColor: '#A7F3D0',
    headerGradient: 'linear-gradient(135deg,#34D399 0%,#10B981 100%)',
    headerSubtitleColor: '#D1FAE5',
    guidanceBg: '#D1FAE5',
    guidanceBorder: '#A7F3D0',
    buttonBg: '#10B981',
    boxShadow: '0 8px 24px rgba(16,185,129,0.14)',
  },
};

const getDashboardUrl = (): string => {
  const base = (process.env.FRONTEND_URL || process.env.APP_URL || '').replace(/\/$/, '');
  return base ? `${base}/dashboard` : '';
};

const wellnessEmailShell = (
  tier: WellnessRiskTier,
  subject: string,
  studentName: string,
  messageHtml: string,
  guidanceHtml: string
): string => {
  const theme = wellnessEmailThemes[tier];
  const dashboardUrl = getDashboardUrl();
  const dashboardButtonHtml = dashboardUrl
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0;">
        <tr>
          <td align="center" style="border-radius:10px;background:${theme.buttonBg};">
            <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;background:${theme.buttonBg};">
              View My Dashboard
            </a>
          </td>
        </tr>
      </table>`
    : '';

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background:${theme.outerBg};font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${theme.outerBg};padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid ${theme.borderColor};border-radius:16px;overflow:hidden;box-shadow:${theme.boxShadow};">
              <tr>
                <td style="background:${theme.headerGradient};padding:24px 28px;">
                  <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${theme.headerSubtitleColor};">Student Wellness Platform</p>
                  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">${subject}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;color:#0f172a;font-size:16px;line-height:1.7;">
                  <p style="margin:0 0 16px;color:#334155;">Hello ${studentName},</p>
                  ${messageHtml}
                  <div style="margin:20px 0 0;padding:18px 20px;background:${theme.guidanceBg};border:1px solid ${theme.guidanceBorder};border-radius:12px;">
                    ${guidanceHtml}
                  </div>
                  ${dashboardButtonHtml}
                  <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;text-align:center;">
                    Student Wellness Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;
};

const paragraphHtml = (text: string): string =>
  `<p style="margin:0 0 12px;color:#334155;">${text}</p>`;

const guidanceParagraphHtml = (text: string, isLast: boolean = false): string =>
  `<p style="margin:0${isLast ? '' : ' 0 10px'};color:#334155;font-size:15px;line-height:1.6;">${text}</p>`;

export const getWellnessEmailTemplate = (
  tier: WellnessRiskTier,
  studentName: string
): WellnessEmailTemplate => {
  const dashboardUrl = getDashboardUrl();
  const dashboardText = dashboardUrl ? `\n\nView your dashboard: ${dashboardUrl}` : '';

  if (tier === 'high') {
    const subject = 'Wellness Support Reminder';
    const messageParagraphs = [
      'Your recent wellness assessments indicate a high burnout risk level.',
      'We encourage you to review your recommendations, improve sleep quality, reduce academic stress where possible, and regularly use the Wellness Assistant for guidance.',
    ];
    const guidanceParagraphs = [
      'Small consistent improvements can significantly improve your wellbeing.',
      'Please take care of yourself and reach out when needed.',
    ];
    const messageHtml = messageParagraphs.map(paragraphHtml).join('');
    const guidanceHtml = guidanceParagraphs
      .map((p, i) => guidanceParagraphHtml(p, i === guidanceParagraphs.length - 1))
      .join('');
    const text = `Hello ${studentName},\n\n${[...messageParagraphs, ...guidanceParagraphs].join('\n\n')}${dashboardText}\n\nStudent Wellness Platform`;
    return {
      subject,
      text,
      html: wellnessEmailShell(tier, subject, studentName, messageHtml, guidanceHtml),
    };
  }

  if (tier === 'moderate') {
    const subject = 'Wellness Progress Reminder';
    const messageParagraphs = [
      'Your current burnout indicators fall within the moderate range.',
      'You are making progress, but there is still room for improvement.',
    ];
    const guidanceParagraphs = [
      'Maintaining healthy study habits, managing stress, and following platform recommendations can help improve your wellbeing further.',
      'Keep moving forward consistently.',
    ];
    const messageHtml = messageParagraphs.map(paragraphHtml).join('');
    const guidanceHtml = guidanceParagraphs
      .map((p, i) => guidanceParagraphHtml(p, i === guidanceParagraphs.length - 1))
      .join('');
    const text = `Hello ${studentName},\n\n${[...messageParagraphs, ...guidanceParagraphs].join('\n\n')}${dashboardText}\n\nStudent Wellness Platform`;
    return {
      subject,
      text,
      html: wellnessEmailShell(tier, subject, studentName, messageHtml, guidanceHtml),
    };
  }

  const subject = 'Congratulations on Your Progress';
  const messageParagraphs = [
    'Your recent assessments indicate a healthy wellness status.',
    'You are maintaining positive habits and managing your academic wellbeing effectively.',
  ];
  const guidanceParagraphs = [
    'Continue following your current routine and regularly monitor your wellness progress.',
    'Keep up the excellent work.',
  ];
  const messageHtml = messageParagraphs.map(paragraphHtml).join('');
  const guidanceHtml = guidanceParagraphs
    .map((p, i) => guidanceParagraphHtml(p, i === guidanceParagraphs.length - 1))
    .join('');
  const text = `Hello ${studentName},\n\n${[...messageParagraphs, ...guidanceParagraphs].join('\n\n')}${dashboardText}\n\nStudent Wellness Platform`;
  return {
    subject,
    text,
    html: wellnessEmailShell(tier, subject, studentName, messageHtml, guidanceHtml),
  };
};

export const sendWellnessTemplateEmail = async (
  to: string,
  template: WellnessEmailTemplate
): Promise<void> => {
  logger.info('[Email] sendWellnessTemplateEmail called for:', to);
  try {
    await sendEmailViaBrevo(to, template.subject, template.text, template.html);
    logger.info('[Email] sendWellnessTemplateEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendWellnessTemplateEmail FAILED:', error);
    throw error;
  }
};

export interface ContactFormPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const sendContactFormEmail = async (payload: ContactFormPayload): Promise<void> => {
  logger.info('[Email] sendContactFormEmail called with payload:', JSON.stringify(payload));

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.user_email;
    logger.info('[Email] Admin email:', adminEmail);

    if (!adminEmail) {
      logger.warn('[Email] No admin email found, skipping contact form email not sent!');
      return;
    }

    const subject = payload.subject || 'New Contact Form Submission';

    const text = `From: ${payload.name} (${payload.email})\n\n${payload.message}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;margin:0 auto;max-width:680px;color:#111827;line-height:1.6;padding:20px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
          <h2 style="margin:0 0 18px;font-size:24px;color:#1f2937;font-weight:700;">New Contact Form Submission</h2>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;"><strong>From:</strong> ${payload.name}</p>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;"><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
          <p style="margin:0 0 12px;color:#475569;font-size:14px;"><strong>Subject:</strong> ${subject}</p>
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-top:22px;white-space:pre-wrap;color:#334155;font-size:15px;">
            ${payload.message}
          </div>
        </div>
      </div>
    `;

    await sendEmailViaBrevo(adminEmail, `Contact Form: ${subject}`, text, html);
    logger.info('[Email] sendContactFormEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendContactFormEmail FAILED:', error);
    throw error;
  }
};
