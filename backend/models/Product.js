const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    sku: { type: String },
    type: { type: String },
    shortDescription: { type: String },
    description: { type: String },
    specs: [{ key: { type: String }, value: { type: String } }],
    stock: { type: Boolean, default: true },
    installationCost: { type: Number },
    image: { type: String },
    images: [{ type: String }],
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', default: null },
    dealerName: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved'], default: 'approved' },
  },
  { timestamps: true }
);

productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, category: 1 });
productSchema.index({ dealerId: 1, createdAt: -1 });
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
