const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// GET /api/admin/orders — all orders, latest first
router.get('/', protect, adminMiddleware, getOrders);

// PATCH /api/admin/orders/:id — update orderStatus
router.patch('/:id', protect, adminMiddleware, updateOrderStatus);

// POST /api/admin/orders/:id/send-to-dealer
router.post('/:id/send-to-dealer', protect, adminMiddleware, async (req, res) => {
  try {
    const { dealerEmail } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const itemsHtml = order.products.map(item => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${item.name}</td>
        <td style="padding: 8px 12px; text-align: center; border: 1px solid #e0e0e0;">${item.quantity}</td>
        <td style="padding: 8px 12px; text-align: right; border: 1px solid #e0e0e0;">₹${item.price}</td>
      </tr>`).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <div style="background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e0e0e0;">

          <h2 style="margin: 0 0 4px 0; color: #1a1a1a;">New Order Assigned - ARefriz</h2>
          <p style="color: #888; font-size: 14px;">You have received a new order.</p>

          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Buyer Details</h3>
          <p><strong>Name:</strong> ${order.shippingDetails.name}</p>
          <p><strong>Phone:</strong> ${order.shippingDetails.phone}</p>
          <p><strong>Address:</strong> ${order.shippingDetails.address}</p>

          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Details</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f4f4f4;">
              <tr>
                <th style="padding: 10px 12px; text-align: left; border: 1px solid #e0e0e0;">Product</th>
                <th style="padding: 10px 12px; text-align: center; border: 1px solid #e0e0e0;">Quantity</th>
                <th style="padding: 10px 12px; text-align: right; border: 1px solid #e0e0e0;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <p style="font-size: 16px; font-weight: bold; margin-top: 16px;">Total: ₹${order.totalAmount}</p>
          <p>Please process this order.</p>

          <div style="border-top: 1px solid #eee; padding-top: 16px; color: #888; font-size: 13px; text-align: center;">
            ARefriz Team
          </div>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ARefriz" <${process.env.EMAIL_USER}>`,
      to: dealerEmail,
      subject: 'New Order Assigned - ARefriz',
      html,
    });

    console.log('ORDER EMAIL SENT:', order._id, dealerEmail);

    order.dealerEmail = dealerEmail;
    order.emailSent = true;
    order.emailSentAt = new Date();
    await order.save();

    res.json({ message: 'Order sent to dealer successfully' });
  } catch (error) {
    console.error('send-to-dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
