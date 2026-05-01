const Inquiry = require('../models/Inquiry');

const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, productId } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'name, email, phone, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      productId: productId || null,
    });

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiryId: inquiry._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createInquiry, getAllInquiries };
