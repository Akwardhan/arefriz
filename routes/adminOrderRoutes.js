const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// GET /api/admin/orders — all orders, latest first
router.get('/', protect, adminMiddleware, getOrders);

// PATCH /api/admin/orders/:id — update orderStatus
router.patch('/:id', protect, adminMiddleware, updateOrderStatus);

module.exports = router;
