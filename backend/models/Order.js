const mongoose = require('mongoose');

const generateOrderId = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `ARF${num}`;
};

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: generateOrderId,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    products: [
      {
        productId: { type: String, default: null },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, default: '' },
      },
    ],
    subtotal: { type: Number, required: true },
    logisticsCost: { type: Number, required: true },
    installationCost: { type: Number, required: true },
    taxes: { type: Number, required: true },
    techSurcharge: { type: Number, default: 0 },
    totalAmount: { type: Number },
    shippingDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'released'], default: 'pending' },
    paymentId: { type: String, default: null },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    commissionAmount: { type: Number, default: 0 },
    dealerPayoutStatus: { type: String, enum: ['pending', 'released'], default: 'pending' },
    paymentMethod: { type: String, enum: ['upi', 'card', 'cod'], default: null },
    orderStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered'],
      default: 'placed',
    },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String, default: '' },
    dealerEmail: { type: String, default: null },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
