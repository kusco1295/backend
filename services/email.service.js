const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, cc, subject, text, html, attachments }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        cc,
        subject,
        text,
        html,
        attachments,
      });

      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to KUSCO';
    const html = `
      <h1>Welcome, ${userName}!</h1>
      <p>We're glad to have you with us.</p>
    `;
    return this.sendEmail({ to: userEmail, subject, html });
  }
}

module.exports = new EmailService();
