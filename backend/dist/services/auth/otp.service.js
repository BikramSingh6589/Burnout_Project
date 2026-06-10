import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { config } from "../../config/env.js";
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_SALT_ROUNDS = 10;
export class OtpError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
export const saveOTP = async (student, otp, purpose) => {
    student.otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
    student.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    student.otpAttempts = 0;
    student.otpPurpose = purpose;
    await student.save();
};
export const clearOTP = async (student) => {
    student.otpHash = undefined;
    student.otpExpiresAt = undefined;
    student.otpAttempts = 0;
    student.otpPurpose = undefined;
    await student.save();
};
export const verifyOTP = async (student, otp, purpose) => {
    if (!student.otpHash || !student.otpExpiresAt || student.otpPurpose !== purpose) {
        throw new OtpError("Invalid OTP");
    }
    if (student.otpAttempts >= MAX_OTP_ATTEMPTS) {
        await clearOTP(student);
        throw new OtpError("Invalid OTP");
    }
    if (student.otpExpiresAt.getTime() < Date.now()) {
        await clearOTP(student);
        throw new OtpError("OTP expired");
    }
    const isMatch = await bcrypt.compare(otp, student.otpHash);
    if (!isMatch) {
        student.otpAttempts += 1;
        if (student.otpAttempts >= MAX_OTP_ATTEMPTS) {
            await clearOTP(student);
        }
        else {
            await student.save();
        }
        throw new OtpError("Invalid OTP");
    }
};
export const sendOTPEmail = async (email, otp, purpose) => {
    if (!config.emailUser || !config.emailPassword) {
        throw new OtpError("Email service is not configured", 500);
    }
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.emailUser,
            pass: config.emailPassword,
        },
    });
    const isPasswordReset = purpose === "password_reset";
    const subject = isPasswordReset ? "Reset your Burnout Wellness password" : "Verify your Burnout Wellness account";
    const headline = isPasswordReset ? "Reset your password" : "Verify your email";
    const lead = isPasswordReset
        ? "Use this one-time code to reset your password securely."
        : "Use this one-time code to finish creating your student wellness account.";
    const note = isPasswordReset
        ? "If you did not request a password reset, you can safely ignore this email."
        : "If you did not create an account, you can safely ignore this email.";
    const text = `${headline}: ${otp}. This code expires in ${OTP_EXPIRY_MINUTES} minutes. ${note}`;
    const html = `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#152033">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5ebf3;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(21,32,51,0.10)">
              <tr>
                <td style="background:#0f766e;padding:26px 30px;color:#ffffff">
                  <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.9">Burnout Wellness</div>
                  <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:800">${headline}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px">
                  <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#475569">${lead}</p>
                  <div style="background:#eefcf8;border:1px solid #b7eee2;border-radius:14px;text-align:center;padding:22px 14px;margin:20px 0">
                    <div style="font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Your OTP Code</div>
                    <div style="font-size:38px;line-height:1;font-weight:800;letter-spacing:10px;color:#102a43">${otp}</div>
                  </div>
                  <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569">This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Please do not share it with anyone.</p>
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">${note}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e5ebf3;font-size:12px;color:#64748b;text-align:center">
                  Academic Burnout Detection and Wellness Monitoring
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
    await transporter.sendMail({
        from: `Burnout Wellness <${config.emailUser}>`,
        to: email,
        subject,
        text,
        html,
    });
};
//# sourceMappingURL=otp.service.js.map