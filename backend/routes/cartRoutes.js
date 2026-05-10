const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, clearCart, updateCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addToCart);
router.get('/', protect, getCart);
router.patch('/update', protect, updateCartItem);
router.delete('/clear', protect, clearCart);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
