import axios from 'axios';
import { logger } from './logger.js';

// Brevo API Configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper to send emails via Brevo API
const sendEmailViaBrevo = async (
  to: string | string[],
  subject: string,
  text: string,
  html: string,
  fromName: string = 'Burnout Wellness'
): Promise<void> => {
  logger.info('[Brevo] Starting email send via API');

  try {
    const fromEmail = process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || 'no-reply@burnoutwellness.app';
    const fromAddress = { email: fromEmail, name: fromName };
    const toAddresses = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];

    logger.info('[Brevo] From email:', fromEmail);
    logger.info('[Brevo] To email(s):', to);
    logger.info('[Brevo] Subject:', subject);

    const response = await axios.post(BREVO_API_URL, {
      sender: fromAddress,
      to: toAddresses,
      subject: subject,
      htmlContent: html,
      textContent: text,
    }, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds
    });

    logger.info('[Brevo] Email sent successfully! Response:', response.data);
  } catch (error: any) {
    logger.error('[Brevo] Error sending email via API:', error.response?.data || error.message);
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Account</title>
        </head>
        <body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #E5E7EB;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(79,70,229,0.08);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:32px 28px;text-align:center;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#C7D2FE;">Student Wellness Platform</p>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">Verify Your Account</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 28px;color:#0f172a;font-size:16px;line-height:1.7;">
                      <p style="margin:0 0 24px;color:#374151;">Hello,</p>
                      <p style="margin:0 0 20px;color:#374151;">Your verification code is below. This code expires in 10 minutes.</p>
                      
                      <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin:28px 0;text-align:center;">
                        <p style="margin:0 0 12px;color:#6B7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Your Code</p>
                        <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:12px;color:#4F46E5;font-family:'Courier New',Courier,monospace;">${otp}</p>
                      </div>

                      <p style="margin:0 0 20px;color:#374151;">If you didn't create an account, you can safely ignore this email.</p>

                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E5E7EB;text-align:center;">
                        <p style="margin:0;color:#9CA3AF;font-size:13px;">Burnout Wellness Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Your Password</title>
        </head>
        <body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #E5E7EB;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(79,70,229,0.08);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#059669 0%,#10B981 100%);padding:32px 28px;text-align:center;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#A7F3D0;">Student Wellness Platform</p>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 28px;color:#0f172a;font-size:16px;line-height:1.7;">
                      <p style="margin:0 0 24px;color:#374151;">Hello,</p>
                      <p style="margin:0 0 20px;color:#374151;">You requested to reset your password. Use the code below to set a new password.</p>
                      
                      <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin:28px 0;text-align:center;">
                        <p style="margin:0 0 12px;color:#6B7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Reset Code</p>
                        <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:12px;color:#059669;font-family:'Courier New',Courier,monospace;">${token}</p>
                      </div>

                      <p style="margin:0 0 20px;color:#374151;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>

                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E5E7EB;text-align:center;">
                        <p style="margin:0;color:#9CA3AF;font-size:13px;">Burnout Wellness Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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

export const sendWeeklyStreakSummaryEmail = async (
  to: string,
  name: string,
  currentStreak: number,
  longestStreak: number,
  daysCompletedThisWeek: number
): Promise<void> => {
  logger.info('[Email] sendWeeklyStreakSummaryEmail called for:', to);

  try {
    const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
    const subject = 'Your Weekly Wellness Check-In - Burnout Wellness';
    const text = `Hi ${name},\n\nGreat job this week! Here's your streak summary:\n\nCurrent Streak: ${currentStreak} days\nLongest Streak: ${longestStreak} days\nDays Completed This Week: ${daysCompletedThisWeek}/7\n\nKeep up the amazing work! Check your dashboard for more insights:\n\n${appUrl}\n\nBest regards,\nBurnout Wellness Team`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Your Weekly Wellness Check-In</title>
        </head>
        <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Arial',sans-serif">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:32px 16px">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(79,70,229,0.1)">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#4F46E5 0%,#8B5CF6 100%);padding:40px 32px;text-align:center">
                      <h1 style="margin:0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:800">Your Weekly Streak</h1>
                      <p style="margin:8px 0 0;font-size:14px;line-height:1.4;color:#C7D2FE;font-weight:600">Keep up the amazing work, ${name}!</p>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding:32px">
                      <div style="display:flex;flex-direction:column;gap:24px">
                        <!-- Streak Cards -->
                        <div style="display:flex;gap:16px;flex-wrap:wrap">
                          <div style="flex:1;min-width:150px;background:linear-gradient(135deg,#4F46E5 0%,#8B5CF6 100%);border-radius:16px;padding:20px;text-align:center;box-shadow:0 4px 16px rgba(79,70,229,0.2)">
                            <p style="margin:0;color:#C7D2FE;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">Current</p>
                            <p style="margin:8px 0 0;color:#ffffff;font-size:40px;font-weight:800;line-height:1">${currentStreak} <span style="font-size:20px;font-weight:600">days</span></p>
                          </div>
                          <div style="flex:1;min-width:150px;background:linear-gradient(135deg,#10B981 0%,#059669 100%);border-radius:16px;padding:20px;text-align:center;box-shadow:0 4px 16px rgba(16,185,129,0.2)">
                            <p style="margin:0;color:#A7F3D0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">Longest</p>
                            <p style="margin:8px 0 0;color:#ffffff;font-size:40px;font-weight:800;line-height:1">${longestStreak} <span style="font-size:20px;font-weight:600">days</span></p>
                          </div>
                        </div>
                        <!-- This Week's Progress -->
                        <div style="background:#F3F4F6;border-radius:16px;padding:24px">
                          <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700">This Week</p>
                          <!-- Progress Bar -->
                          <div style="height:16px;background:#D1D5DB;border-radius:999px;overflow:hidden;margin-bottom:16px">
                            <div style="height:100%;width:${(daysCompletedThisWeek / 7) * 100}%;background:linear-gradient(90deg,#4F46E5 0%,#8B5CF6 100%);border-radius:999px;transition:width 0.5s ease-out"></div>
                          </div>
                          <p style="margin:0;color:#4F46E5;font-size:24px;font-weight:800;text-align:right">${daysCompletedThisWeek} <span style="color:#6B7280;font-size:16px;font-weight:600">/ 7 days</span></p>
                        </div>
                        <!-- CTA -->
                        <div style="text-align:center">
                          <a href="${appUrl}" style="background:linear-gradient(135deg,#4F46E5 0%,#8B5CF6 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;box-shadow:0 4px 12px rgba(79,70,229,0.3)">
                            Check Your Dashboard
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 32px;background:#F9FAFB;border-top:1px solid #E5E7EB;text-align:center">
                      <p style="margin:0;color:#6B7280;font-size:14px">Best regards,<br><span style="color:#4F46E5;font-weight:700">Burnout Wellness Team</span></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendWeeklyStreakSummaryEmail completed successfully!');
  } catch (error) {
    logger.error('[Email] sendWeeklyStreakSummaryEmail FAILED:', error);
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

// --- Assessment Reminder Emails ---

const getAppUrl = (): string => {
  return process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
};

export const sendJustLoggedInReminder = async (to: string, name: string): Promise<void> => {
  logger.info('[Email] sendJustLoggedInReminder called for:', to);
  try {
    const appUrl = getAppUrl();
    const subject = 'Welcome! Start Your Wellness Journey 🚀';
    const text = `Hi ${name},\n\nWelcome to Burnout Wellness! We noticed you haven't taken your first assessment yet. It only takes a few minutes and will help us personalize your wellness recommendations.\n\nTake your initial assessment now: ${appUrl}\n\nBest regards,\nBurnout Wellness Team`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
        </head>
        <body style="margin:0;padding:0;background:#EFF6FF;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EFF6FF;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #BFDBFE;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(59,130,246,0.12);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:32px 28px;text-align:center;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#C7D2FE;">Student Wellness Platform</p>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">Welcome, ${name}! 🚀</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 28px;color:#0f172a;font-size:16px;line-height:1.7;">
                      <p style="margin:0 0 20px;color:#374151;">We noticed you haven't taken your first assessment yet! It only takes a few minutes and will help us personalize your wellness recommendations.</p>
                      <p style="margin:0 0 28px;color:#374151;">Taking the initial assessment is the first step in understanding and managing your academic burnout levels effectively!</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);">
                            <a href="${appUrl}" style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                              Start Your First Assessment
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E5E7EB;text-align:center;">
                        <p style="margin:0;color:#9CA3AF;font-size:13px;">Burnout Wellness Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendJustLoggedInReminder completed!');
  } catch (error) {
    logger.error('[Email] sendJustLoggedInReminder failed:', error);
    throw error;
  }
};

export const sendOnlyInitialReminder = async (to: string, name: string): Promise<void> => {
  logger.info('[Email] sendOnlyInitialReminder called for:', to);
  try {
    const appUrl = getAppUrl();
    const subject = 'Time for Your Daily Wellness Check-in ✅';
    const text = `Hi ${name},\n\nGreat job on completing your initial assessment! Now it's time to start checking in daily to track your progress. Daily assessments help you stay on top of your wellness journey.\n\nTake today's assessment now: ${appUrl}\n\nBest regards,\nBurnout Wellness Team`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
        </head>
        <body style="margin:0;padding:0;background:#FFFBEB;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFFBEB;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #FDE68A;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(245,158,11,0.12);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);padding:32px 28px;text-align:center;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#FEF3C7;">Student Wellness Platform</p>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">Great Start, ${name}! ✅</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 28px;color:#0f172a;font-size:16px;line-height:1.7;">
                      <p style="margin:0 0 20px;color:#374151;">Awesome job on completing your initial assessment! Now it's time to start your daily check-ins!</p>
                      <p style="margin:0 0 28px;color:#374151;">Daily assessments help you keep track of your progress and build a streak of consistent wellness habits!</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);">
                            <a href="${appUrl}" style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                              Take Today's Assessment
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E5E7EB;text-align:center;">
                        <p style="margin:0;color:#9CA3AF;font-size:13px;">Burnout Wellness Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendOnlyInitialReminder completed!');
  } catch (error) {
    logger.error('[Email] sendOnlyInitialReminder failed:', error);
    throw error;
  }
};

export const sendStreakMaintainerReminder = async (to: string, name: string): Promise<void> => {
  logger.info('[Email] sendStreakMaintainerReminder called for:', to);
  try {
    const appUrl = getAppUrl();
    const subject = 'Don\'t Break Your Streak! 🔥';
    const text = `Hi ${name},\n\nYou're doing amazing! We noticed you've built up a streak. Keep it going and don't let it break! A daily check-in only takes a few minutes and keeps you on top of your wellness game.\n\nCheck your dashboard and take today's assessment: ${appUrl}\n\nBest regards,\nBurnout Wellness Team`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
        </head>
        <body style="margin:0;padding:0;background:#ECFDF5;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ECFDF5;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #A7F3D0;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(16,185,129,0.12);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#10B981 0%,#059669 100%);padding:32px 28px;text-align:center;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#A7F3D0;">Student Wellness Platform</p>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">Don't Break That Streak, ${name}! 🔥</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 28px;color:#0f172a;font-size:16px;line-height:1.7;">
                      <p style="margin:0 0 20px;color:#374151;">You're doing amazing! We noticed you've been building a streak of consistent check-ins — keep it going!</p>
                      <p style="margin:0 0 28px;color:#374151;">A daily check-in only takes a few minutes and keeps you on top of your wellness journey!</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#10B981 0%,#059669 100%);">
                            <a href="${appUrl}" style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                              Check Your Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E5E7EB;text-align:center;">
                        <p style="margin:0;color:#9CA3AF;font-size:13px;">Burnout Wellness Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    await sendEmailViaBrevo(to, subject, text, html);
    logger.info('[Email] sendStreakMaintainerReminder completed!');
  } catch (error) {
    logger.error('[Email] sendStreakMaintainerReminder failed:', error);
    throw error;
  }
};
