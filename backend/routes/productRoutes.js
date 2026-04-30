const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProductById } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, upload.single('image'), addProduct);

module.exports = router;
