const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus, payDealer, emailOrderToDealer } = require('../controllers/orderController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// GET /api/admin/orders — all orders, latest first
router.get('/', protect, adminMiddleware, getOrders);

// PATCH /api/admin/orders/:id — update orderStatus
router.patch('/:id', protect, adminMiddleware, updateOrderStatus);

// PATCH /api/admin/orders/:id/pay-dealer — mark dealer as paid
router.patch('/:id/pay-dealer', protect, adminMiddleware, payDealer);

// POST /api/admin/orders/:id/send-to-dealer
router.post('/:id/send-to-dealer', protect, adminMiddleware, emailOrderToDealer);

module.exports = router;
