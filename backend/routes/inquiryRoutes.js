const express = require('express');
const router = express.Router();
const { createInquiry, getAllInquiries } = require('../controllers/inquiryController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', createInquiry);
router.get('/', protect, adminMiddleware, getAllInquiries);

module.exports = router;
