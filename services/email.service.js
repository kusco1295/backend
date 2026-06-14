const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { getUploadDir } = require('../utils/upload-path');

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
      connectionTimeout: 30000,
      greetingTimeout: 30000,
    });

    const emails = [];
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = getUploadDir();

    try {
      await client.connect();
      
      const mailbox = await client.getMailboxLock('INBOX');
      try {
        const totalMessages = client.mailbox.exists;
        const startRange = Math.max(1, totalMessages - 9); // Fetch latest 10
        const range = `${startRange}:*`;

        const list = await client.fetch(range, {
          envelope: true,
          source: true,
          uid: true,
        });

        for await (let msg of list) {
          try {
            const parsed = await simpleParser(msg.source);
            const attachments = [];

            if (parsed.attachments && parsed.attachments.length > 0) {
              for (let att of parsed.attachments) {
                // Save attachment if it's a PDF
                if (att.contentType === 'application/pdf' || att.filename?.toLowerCase().endsWith('.pdf')) {
                  const safeFilename = `${Date.now()}-${msg.uid}-${att.filename}`;
                  const filePath = path.join(uploadsDir, safeFilename);
                  fs.writeFileSync(filePath, att.content);
                  attachments.push({
                    filename: att.filename,
                    path: safeFilename,
                    contentType: att.contentType
                  });
                }
              }
            }

            emails.push({
              id: msg.uid,
              subject: parsed.subject || '(No Subject)',
              from: parsed.from?.text || 'Unknown Sender',
              to: parsed.to?.text || '',
              date: parsed.date || new Date(),
              body: parsed.text || '',
              html: parsed.html || '',
              attachments: attachments,
              attachment: attachments.length > 0 ? attachments[0].path : '', // For frontend compatibility
              type: 'incoming'
            });
          } catch (parseError) {
            console.error(`Error parsing message ${msg.uid}:`, parseError);
          }
        }
      } finally {
        mailbox.release();
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      try {
        await client.logout();
      } catch (logoutError) {
        // Ignore logout errors
      }
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
