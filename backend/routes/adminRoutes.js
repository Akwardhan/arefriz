const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Dealer = require('../models/Dealer');
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

module.exports = router;
