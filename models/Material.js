const mongoose = require('mongoose');

const toCapital = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, set: toCapital },
    nameKey: { type: String, required: true, unique: true, index: true },
    materialType: { type: String, trim: true, set: toCapital },
    description: { type: String, trim: true, default: '' },
    quantity: { type: Number, default: 0, min: 0 },
    transactions: [
      {
        type: { type: String, enum: ['add', 'withdraw'], required: true },
        quantity: { type: Number, required: true },
        description: { type: String, default: '' },
        performedBy: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

materialSchema.pre('validate', function materialNormalizeHook(next) {
  this.name = toCapital(this.name);
  this.materialType = toCapital(this.materialType);
  this.nameKey = [this.name, this.materialType].map((value) => String(value || '').trim().toLowerCase()).join('|');
  next();
});

module.exports = mongoose.model('Material', materialSchema);
