const express = require('express');
const router = express.Router();
const { registerDealer, loginDealer } = require('../controllers/dealerController');
const { addDealerProduct, getDealerProducts, updateDealerProduct, deleteDealerProduct } = require('../controllers/dealerProductController');
const { getDealerOrders, updateDealerOrderStatus } = require('../controllers/dealerOrderController');
const dealerAuth = require('../middleware/dealerAuthMiddleware');
const upload = require('../middleware/upload');

router.post('/register', registerDealer);
router.post('/login', loginDealer);

router.post('/products', dealerAuth, upload.single('image'), addDealerProduct);
router.get('/products', dealerAuth, getDealerProducts);
router.put('/products/:id', dealerAuth, upload.single('image'), updateDealerProduct);
router.delete('/products/:id', dealerAuth, deleteDealerProduct);

router.get('/orders', dealerAuth, getDealerOrders);
router.patch('/orders/:id/status', dealerAuth, updateDealerOrderStatus);

module.exports = router;
