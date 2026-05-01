const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, clearCart } = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/clear', clearCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
