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
    status: { type: String, enum: ['pending', 'approved'], default: 'approved' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
