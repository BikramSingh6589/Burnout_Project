import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const { EMAIL_USER, EMAIL_PASSWORD, TEST_EMAIL_RECIPIENT } = process.env;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error('Missing EMAIL_USER or EMAIL_PASSWORD in environment. Copy backend/.env.example to .env and set values.');
  process.exit(1);
}

const recipient = TEST_EMAIL_RECIPIENT || EMAIL_USER;

async function sendTest() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to: recipient,
      subject: 'Burnout Platform — Test Email',
      text: `This is a test email from your Burnout Platform backend. Recipient: ${recipient}`,
    });
    console.log('Test email sent:', info.messageId ?? info.response);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(1);
  }
}

sendTest();
