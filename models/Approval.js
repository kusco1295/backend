const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Quotation', 'Proforma Invoice', 'Purchase Order', 'for approval material request', 'Other'], default: 'Other' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    requestedBy: { type: String, required: true },
    department: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    description: { type: String, trim: true },
    attachment: { type: String }, // Filename of the PDF/image
    comments: [
      {
        text: { type: String, trim: true },
        authorName: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    approvedBy: { type: String },
    approvedAt: { type: Date },
    materialData: {
      name: { type: String },
      materialType: { type: String },
      quantity: { type: Number },
      description: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Approval', approvalSchema);
