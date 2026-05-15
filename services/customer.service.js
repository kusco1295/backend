const Customer = require('../models/Customer');

class CustomerService {
  async getAllCustomers() {
    return await Customer.find().sort({ createdAt: -1 });
  }

  async createCustomer({ name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, attachments, description, department }) {
    if (!name) throw new Error('Customer name is required');
    const count = await Customer.countDocuments();
    const inquiryNo = `INQ-${String(count + 1).padStart(3, '0')}`;
    const customer = new Customer({ inquiryNo, name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, attachments, description, department });
    await customer.save();
    return customer;
  }

  async updateCustomer(id, { name, email, phone, company, address, equipmentName, make, modelNo, liquid, temperature, pressure, attachment, description }) {
    const customer = await Customer.findById(id);
    if (!customer) throw new Error('Customer not found');
    if (name)                    customer.name          = name;
    if (email !== undefined)     customer.email         = email;
    if (phone !== undefined)     customer.phone         = phone;
    if (company !== undefined)   customer.company       = company;
    if (address !== undefined)   customer.address       = address;
    if (equipmentName !== undefined) customer.equipmentName = equipmentName;
    if (make !== undefined)      customer.make          = make;
    if (modelNo !== undefined)   customer.modelNo       = modelNo;
    if (liquid !== undefined)    customer.liquid        = liquid;
    if (temperature !== undefined) customer.temperature = temperature;
    if (pressure !== undefined)  customer.pressure      = pressure;
    if (attachment !== undefined) customer.attachment   = attachment;
    if (description !== undefined) customer.description = description;
    await customer.save();
    return customer;
  }

  async addComment(id, text, authorName, authorDept) {
    const customer = await Customer.findById(id);
    if (!customer) throw new Error('Customer not found');
    customer.comments.push({ text, authorName, authorDept });
    await customer.save();
    return customer;
  }

  async forwardInquiry(id, department, forwardedBy, comment, attachments) {
    const customer = await Customer.findById(id);
    if (!customer) throw new Error('Customer not found');
    const fromDept = customer.forwardedTo || customer.department;
    customer.forwardedTo = department;
    customer.forwardHistory.push({ fromDept, toDept: department, forwardedBy, comment, attachments });
    await customer.save();
    return customer;
  }

  async shareDocument(id, { documentType, department, sharedBy, fromDept, comment, attachment }) {
    const customer = await Customer.findById(id);
    if (!customer) throw new Error('Customer not found');
    customer.documentShares.push({
      type: documentType,
      fromDept,
      toDept: department,
      sharedBy,
      comment,
      attachment,
    });
    await customer.save();
    return customer;
  }

  async deleteCustomer(id) {
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }
}

module.exports = new CustomerService();
