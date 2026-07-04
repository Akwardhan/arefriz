const express = require('express');
const router = express.Router();
const { createDealer, listDealers, listProducts, toggleProductStatus } = require('../controllers/adminController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/dealers', protect, adminMiddleware, createDealer);
router.get('/dealers', protect, adminMiddleware, listDealers);
router.get('/products', protect, adminMiddleware, listProducts);
router.patch('/products/:id/status', protect, adminMiddleware, toggleProductStatus);

module.exports = router;
