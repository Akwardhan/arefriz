const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, sendToDealer, getMyOrders } = require('../controllers/orderController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);

// GET — admin gets all orders, buyer gets their own
router.get('/', protect, getOrders);
router.get('/my', protect, getMyOrders);

// PATCH update order status — admin only
router.patch('/:id/status', protect, adminMiddleware, updateOrderStatus);

// POST send order details to dealer via email — admin only
router.post('/send-to-dealer', protect, adminMiddleware, sendToDealer);

module.exports = router;
