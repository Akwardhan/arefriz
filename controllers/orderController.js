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
          <h2>New Order Received</h2>
          <p><b>Name:</b> ${order.shippingDetails?.name}</p>
          <p><b>Phone:</b> ${order.shippingDetails?.phone}</p>
          <p><b>Address:</b> ${order.shippingDetails?.address}</p>
          <p><b>Total:</b> ₹${order.totalAmount}</p>
        `,
      });
      console.log('Email sent:', response);
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
