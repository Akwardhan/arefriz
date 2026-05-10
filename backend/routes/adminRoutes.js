const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Dealer = require('../models/Dealer');
const Product = require('../models/Product');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/dealers', protect, adminMiddleware, async (req, res) => {
  try {
    const { name, companyName, email, password, phone } = req.body;

    const existing = await Dealer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Dealer already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const dealer = new Dealer({ name, companyName, email, password: hashedPassword, phone });
    await dealer.save();

    res.json({ message: 'Dealer created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dealers', protect, adminMiddleware, async (req, res) => {
  try {
    const dealers = await Dealer.find().select('-password');
    res.json({ dealers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products', protect, adminMiddleware, async (req, res) => {
  try {
    const { company, status, sort } = req.query;

    const filter = {};
    if (company && company !== 'all') filter.dealerName = company;
    if (status  && status  !== 'all') filter.status = status;

    let sortOpt = { createdAt: -1 };
    if (sort === 'oldest')     sortOpt = { createdAt: 1 };
    if (sort === 'price_high') sortOpt = { price: -1 };
    if (sort === 'price_low')  sortOpt = { price: 1 };

    const [products, rawCompanies] = await Promise.all([
      Product.find(filter).sort(sortOpt).lean(),
      Product.distinct('dealerName'),
    ]);

    res.json({ products, companies: rawCompanies.filter(Boolean) });
  } catch (err) {
    console.error('admin getProducts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/products/:id/status', protect, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.status = product.status === 'approved' ? 'pending' : 'approved';
    await product.save();

    res.json({ _id: product._id, status: product.status });
  } catch (err) {
    console.error('admin toggleProductStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
