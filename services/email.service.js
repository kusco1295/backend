const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

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

  async fetchIncomingEmails() {
    const client = new ImapFlow({
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT),
      secure: process.env.IMAP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: false,
    });

    const emails = [];
    try {
      await client.connect();
      let lock = await client.getMailboxLock('INBOX');
      try {
        // Search for all messages in INBOX
        const list = await client.fetch('1:*', {
          envelope: true,
          source: true,
          uid: true,
        }, {
          max: 50 // Fetch more to be sure
        });

        for await (let msg of list) {
          try {
            const parsed = await simpleParser(msg.source);
            emails.push({
              id: msg.uid,
              subject: parsed.subject || '(No Subject)',
              from: parsed.from?.text || 'Unknown Sender',
              to: parsed.to?.text || '',
              date: parsed.date || new Date(),
              body: parsed.text || '',
              html: parsed.html || '',
              type: 'incoming'
            });
          } catch (parseError) {
            console.error(`Error parsing message ${msg.uid}:`, parseError);
          }
        }
      } finally {
        lock.release();
      }
      await client.logout();
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
    return emails.sort((a, b) => new Date(b.date) - new Date(a.date));
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
