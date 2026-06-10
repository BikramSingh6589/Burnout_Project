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
const fromAddress = () => process.env.EMAIL_FROM || `Burnout Wellness <${process.env.EMAIL_USER}>`;
export const sendOtpEmail = async (to, otp) => {
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
export const sendPasswordResetEmail = async (to, token) => {
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
//# sourceMappingURL=email.js.map