const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    requirement: { type: String, trim: true },
    attachment: { type: String },
    status: {
      type: String,
      enum: ['ordered', 'in progress', 'pending', 'delivered', 'finished'],
      default: 'pending',
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
