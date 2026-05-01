const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { Resend } = require('resend');
const { EMAIL_CONFIG } = require('../config/email');

const resend = new Resend(process.env.RESEND_API_KEY);

const createOrder = async (req, res) => {
  try {
    console.log("Order Payload:", req.body);
    console.log("REQ.USER:", req.user);

    const {
      products,
      shippingDetails,
      subtotal,
      logisticsCost,
      installationCost,
      techSurcharge,
      taxes,
    } = req.body;

    // --- Validate required fields ---
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'products must be a non-empty array' });
    }

    if (!shippingDetails || !shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
      return res.status(400).json({ message: 'shippingDetails must include name, phone, and address' });
    }

    const { name, phone, address } = shippingDetails;

    // --- Build product snapshot from DB ---
    const populatedProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      populatedProducts.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || '',
      });
    }

    // --- Compute total in backend ---
    const calculatedTotal =
      subtotal +
      logisticsCost +
      (installationCost || 0) +
      (techSurcharge || 0) +
      taxes;

    console.log("Calculated total:", calculatedTotal);

    // --- Save order ---
    const order = new Order({
      userId: req.user.userId,
      products: populatedProducts,
      shippingDetails: { name, phone, address },
      subtotal,
      logisticsCost,
      installationCost: installationCost || 0,
      techSurcharge,
      taxes,
      totalAmount: calculatedTotal,
      paymentStatus: 'pending',
      orderStatus: 'placed',
    });

    await order.save();

    await Cart.updateMany({}, {
      $set: {
        products: [],
        totalAmount: 0,
      },
    });
    console.log("Cart cleared after order");

    res.status(201).json({ orderId: order._id });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await Order.find()
        .populate("products.productId", "name price image")
        .sort({ createdAt: -1 });
      console.log(JSON.stringify(orders, null, 2));
      return res.json(orders);
    }

    const orders = await Order.find({ userId: req.user.id })
      .populate("products.productId", "name price image")
      .sort({ createdAt: -1 });
    console.log(JSON.stringify(orders, null, 2));
    res.json(orders);
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const VALID_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendToDealer = async (req, res) => {
  try {
    const { orderId, dealerEmail } = req.body;

    console.log('Sending order:', orderId, 'to', dealerEmail);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: dealerEmail,
        subject: `New Order - ${order.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
            <div style="background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e0e0e0;">

              <h2 style="margin: 0 0 4px 0; color: #1a1a1a;">New Order Assigned</h2>
              <p style="margin: 0 0 24px 0; color: #888; font-size: 14px;">Order ID: <strong>${order.orderId}</strong></p>

              <h3 style="margin: 0 0 12px 0; color: #333; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Buyer Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 12px; background: #f4f4f4; font-weight: bold; width: 30%; border: 1px solid #e0e0e0;">Name</td>
                  <td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${order.shippingDetails?.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; background: #f4f4f4; font-weight: bold; border: 1px solid #e0e0e0;">Phone</td>
                  <td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${order.shippingDetails?.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; background: #f4f4f4; font-weight: bold; border: 1px solid #e0e0e0;">Address</td>
                  <td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${order.shippingDetails?.address}</td>
                </tr>
              </table>

              <h3 style="margin: 0 0 12px 0; color: #333; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background: #f4f4f4;">
                    <th style="padding: 10px 12px; text-align: left; border: 1px solid #e0e0e0;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; border: 1px solid #e0e0e0;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; border: 1px solid #e0e0e0;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.products.map(p => `
                  <tr>
                    <td style="padding: 10px 12px; border: 1px solid #e0e0e0;">${p.name}</td>
                    <td style="padding: 10px 12px; text-align: center; border: 1px solid #e0e0e0;">${p.quantity}</td>
                    <td style="padding: 10px 12px; text-align: right; border: 1px solid #e0e0e0;">₹${p.price}</td>
                  </tr>`).join('')}
                </tbody>
              </table>

              <div style="text-align: right; font-size: 16px; font-weight: bold; color: #1a1a1a; margin-bottom: 32px;">
                Total: ₹${order.totalAmount}
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 16px; color: #888; font-size: 13px; text-align: center;">
                ARefriz Team
              </div>

            </div>
          </div>
        `,
      });
      console.log('Email sent:', response);
      console.log("Order sent to dealer:", dealerEmail);
      console.log("Order ID:", order._id);
      order.dealerEmail = dealerEmail;
      await order.save();
    } catch (emailError) {
      console.error('Email failed — orderId:', orderId, '| dealerEmail:', dealerEmail, '| error:', emailError);
    }

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('sendToDealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, sendToDealer, getMyOrders };
