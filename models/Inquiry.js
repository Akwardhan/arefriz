const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
