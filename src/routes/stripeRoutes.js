// routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/stripeController');

router.get('/products', subscriptionController.getProducts);
router.post('/customer', subscriptionController.getCustomer);
router.post('/subscribe', subscriptionController.subscribe);
router.get('/subscription/:customerId', subscriptionController.getSubscription);
router.post('/create-payment-intent' ,subscriptionController.createPaymentIntent )
router.post('/subscription/:customerId' ,subscriptionController.getSubscription )

module.exports = router;
