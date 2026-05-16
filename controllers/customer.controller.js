const Customer = require('../models/Customer');
const customerService = require('../services/customer.service');
const adminService    = require('../services/admin.service');
const emailService    = require('../services/email.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class CustomerController {
  async getAll(req, res) {
    try {
      const customers = await customerService.getAllCustomers();
      return successResponse(res, { customers }, 'Customers fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async create(req, res) {
    try {
      const { name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, description } = req.body;
      const attachment = req.file ? req.file.filename : undefined;
      const customer = await customerService.createCustomer({ name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, attachment, description });
      return successResponse(res, { customer }, 'Customer created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async inquiry(req, res) {
    try {
      const { name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, description } = req.body;
      if (!name) return errorResponse(res, 'Name is required', 400);
      if (!company) return errorResponse(res, 'Company name is required', 400);
      if (!phone) return errorResponse(res, 'Phone no is required', 400);
      if (!email) return errorResponse(res, 'Email is required', 400);
      if (!address) return errorResponse(res, 'Address is required', 400);
      const attachments = req.files ? req.files.map(f => f.filename) : [];
      const customer = await customerService.createCustomer({ name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, attachments, description, department: 'Sales Coordinator' });

      // Send confirmation email to customer
      try {
        await emailService.sendEmail({
          to: email,
          subject: 'Inquiry Received - KUSCO',
          text: `Dear ${name},\n\nThank you for contacting KUSCO. We have received your inquiry regarding ${equipmentName || 'our services'} and will get back to you shortly.\n\nBest regards,\nKUSCO Team`,
          html: `
            <h1>Inquiry Received</h1>
            <p>Dear ${name},</p>
            <p>Thank you for contacting <strong>KUSCO</strong>. We have received your inquiry regarding <strong>${equipmentName || 'our services'}</strong> and will get back to you shortly.</p>
            <p>Best regards,<br>KUSCO Team</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // We don't want to fail the inquiry submission if email fails
      }

      return successResponse(res, { customer }, 'Inquiry submitted successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, description } = req.body;
      const attachment = req.file ? req.file.filename : undefined;
      const customer = await customerService.updateCustomer(id, { name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, attachment, description });
      return successResponse(res, { customer }, 'Customer updated successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      if (!text) return errorResponse(res, 'Comment text is required', 400);
      const admin = await adminService.getAdminById(req.user.id);
      const customer = await customerService.addComment(id, text, admin.name, admin.department || '');
      return successResponse(res, { customer }, 'Comment added', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async forwardInquiry(req, res) {
    try {
      const { id } = req.params;
      const { department, comment } = req.body;
      if (!department) return errorResponse(res, 'Department is required', 400);
      const admin = await adminService.getAdminById(req.user.id);
      const attachments = req.files ? req.files.map(f => f.filename) : [];
      const customer = await customerService.forwardInquiry(id, department, admin.name, comment, attachments);
      return successResponse(res, { customer }, 'Inquiry forwarded', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async shareDocument(req, res) {
    try {
      const { id } = req.params;
      const { department, documentType, comment } = req.body;
      if (!department) return errorResponse(res, 'Department is required', 400);
      if (!documentType) return errorResponse(res, 'Document type is required', 400);
      if (!req.file) return errorResponse(res, 'PDF attachment is required', 400);

      const admin = await adminService.getAdminById(req.user.id);
      const customer = await customerService.shareDocument(id, {
        department,
        documentType,
        sharedBy: admin.name,
        fromDept: admin.department || '',
        comment,
        attachment: req.file.filename,
      });

      return successResponse(res, { customer }, 'Document shared', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async sendDocumentEmail(req, res) {
    try {
      const { id } = req.params;
      const { filename, type, subject, message, cc } = req.body;
      if (!filename) return errorResponse(res, 'Filename is required', 400);

      const customer = await customerService.getCustomerById(id);
      if (!customer) return errorResponse(res, 'Customer not found', 404);
      if (!customer.email) return errorResponse(res, 'Customer has no email address', 400);

      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '../uploads', filename);

      if (!fs.existsSync(filePath)) {
        return errorResponse(res, 'File not found on server', 404);
      }

      const docLabel = type === 'quotation' ? 'Quotation' : 'Proforma Invoice';
      
      // Use provided subject/message or fallback to defaults
      const emailSubject = (subject && subject.trim()) ? subject : `${docLabel} from KUSCO - ${customer.inquiryNo || ''}`;
      const emailText = (message && message.trim()) ? message : `Dear ${customer.name},\n\nPlease find attached the ${docLabel} for your inquiry.\n\nBest regards,\nKUSCO Team`;
      
      // Clean CC field: remove whitespace and ignore if empty
      const emailCc = (cc && cc.trim()) ? cc.trim() : undefined;

      console.log('Final email content being sent:', { 
        to: customer.email, 
        cc: emailCc,
        subject: emailSubject 
      });

      await emailService.sendEmail({
        to: customer.email,
        cc: emailCc,
        subject: emailSubject,
        text: emailText,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333; white-space: pre-wrap;">${emailText}</div>`,
        attachments: [
          {
            filename: filename.replace(/^\d+-\d+-/, ''), // clean filename for receiver
            path: filePath
          }
        ]
      });

      // Log to email history
      const admin = await adminService.getAdminById(req.user.id);
      customer.emailHistory.push({
        subject: emailSubject,
        body: emailText,
        cc: emailCc,
        attachment: filename,
        sentBy: admin.name,
      });
      await customer.save();

      return successResponse(res, {}, 'Email sent successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async getIncomingEmails(req, res) {
    try {
      const emails = await emailService.fetchIncomingEmails();
      return successResponse(res, { emails }, 'Incoming emails fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async forwardEmail(req, res) {
    try {
      const { toDept, comment, originalEmail } = req.body;
      if (!toDept) return errorResponse(res, 'Target department is required', 400);
      if (!comment) return errorResponse(res, 'Comment is required', 400);
      if (!originalEmail) return errorResponse(res, 'Original email content is required', 400);

      const admin = await adminService.getAdminById(req.user.id);
      
      // Find a customer by email to link this forward, or create a placeholder if needed
      // For now, we try to find the customer from the "from" address of the email
      const fromEmailMatch = originalEmail.from?.match(/<(.+)>/)?.[1] || originalEmail.from;
      let customer = await Customer.findOne({ email: fromEmailMatch?.toLowerCase() });

      if (!customer) {
        // Create a minimal placeholder customer if not found to store the document share
        customer = new Customer({
          name: originalEmail.from?.split('<')[0]?.trim() || 'Unknown Sender',
          email: fromEmailMatch?.toLowerCase() || 'unknown@example.com',
          company: 'Email Forward',
          department: 'Sales Dept'
        });
        await customer.save();
      }

      // Add to documentShares as an email_forward type
      customer.documentShares.push({
        type: 'email_forward',
        fromDept: admin.department || 'Sales Dept',
        toDept: toDept,
        sharedBy: admin.name || 'Admin',
        comment: `${comment}\n\n--- Forwarded Email ---\nSubject: ${originalEmail.subject}\nFrom: ${originalEmail.from}\n\n${originalEmail.body}`,
        attachment: originalEmail.attachment || '', // Keep original attachment reference if any
      });

      await customer.save();
      return successResponse(res, { customer }, 'Email forwarded to department successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);
      return successResponse(res, {}, 'Customer deleted successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }
}

module.exports = new CustomerController();
