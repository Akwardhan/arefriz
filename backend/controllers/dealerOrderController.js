const Order = require('../models/Order');

const DEALER_VALID_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

const LIST_FIELDS = 'orderId products shippingDetails totalAmount dealerAmount commissionPercent orderStatus paymentStatus dealerPaid dealerId dealerName createdAt';

const getDealerOrders = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const filter = { dealerId: req.dealer.id };
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select(LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getDealerOrders error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updateDealerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!DEALER_VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${DEALER_VALID_STATUSES.join(', ')}` });
    }

    const order = await Order.findOne({ _id: req.params.id, dealerId: req.dealer.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('updateDealerOrderStatus error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = { getDealerOrders, updateDealerOrderStatus };
