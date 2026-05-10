const express = require('express');
const router = express.Router();
const { adminCreateDealer } = require('../controllers/dealerController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', protect, adminMiddleware, adminCreateDealer);

module.exports = router;
