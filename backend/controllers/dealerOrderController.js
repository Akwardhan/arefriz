const Order = require('../models/Order');

const DEALER_VALID_STATUSES = ['processing', 'shipped', 'delivered'];

const getDealerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ dealerId: req.dealer.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDealerOrders, updateDealerOrderStatus };
