const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    inquiryNo:  { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    address: { type: String, trim: true },
    equipmentName: { type: String, trim: true },
    make: { type: String, trim: true },
    modelNo: { type: String, trim: true },
    liquid: { type: String, trim: true },
    temperature: { type: String, trim: true },
    pressure: { type: String, trim: true },
    attachments: [{ type: String }],
    description: { type: String, trim: true },
    department: { type: String, trim: true },
    forwardedTo: { type: String, trim: true },
    forwardHistory: [
      {
        fromDept:    { type: String, trim: true },
        toDept:      { type: String, trim: true },
        forwardedBy: { type: String, trim: true },
        comment:     { type: String, trim: true },
        attachments: [{ type: String }],
        createdAt:   { type: Date, default: Date.now },
      },
    ],
    documentShares: [
      {
        type:        { type: String, trim: true },
        fromDept:    { type: String, trim: true },
        toDept:      { type: String, trim: true },
        sharedBy:    { type: String, trim: true },
        comment:     { type: String, trim: true },
        attachment:  { type: String, trim: true },
        createdAt:   { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        text:       { type: String, trim: true },
        authorName: { type: String, trim: true },
        authorDept: { type: String, trim: true },
        createdAt:  { type: Date, default: Date.now },
      },
    ],
    emailHistory: [
      {
        subject:   { type: String, trim: true },
        body:      { type: String, trim: true },
        cc:        { type: String, trim: true },
        attachment: { type: String, trim: true },
        sentBy:    { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
