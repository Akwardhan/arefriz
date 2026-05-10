const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Dealer = require('../models/Dealer');

const registerDealer = async (req, res) => {
  try {
    const { name, companyName, email, password, phone } = req.body;

    const existing = await Dealer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const dealer = await Dealer.create({ name, companyName, email, password: hashedPassword, phone });

    res.status(201).json({ message: 'Dealer registered successfully', dealerId: dealer._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginDealer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const dealer = await Dealer.findOne({ email });
    if (!dealer) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, dealer.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!dealer.isActive) return res.status(403).json({ message: 'Account is inactive' });

    const token = jwt.sign(
      { dealerId: dealer._id, role: 'dealer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      dealer: {
        id: dealer._id,
        name: dealer.name,
        companyName: dealer.companyName,
        email: dealer.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const adminCreateDealer = async (req, res) => {
  try {
    const { name, companyName, email, password, phone } = req.body;

    const existing = await Dealer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const dealer = await Dealer.create({ name, companyName, email, password: hashedPassword, phone });

    res.status(201).json({ message: 'Dealer created successfully', dealerId: dealer._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerDealer, loginDealer, adminCreateDealer };
