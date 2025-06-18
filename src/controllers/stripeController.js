const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// exports.getProducts = async (req, res) => {
//   try {
//     // Optionally, you can filter by customer or status
//     const products = await stripe.products.list({
//       limit: 10 // adjust as needed
//     });

//      res.status(200).json({
//       success: true,
//       data: products.data
//     });
//   } catch (error) {
//     console.error('Error fetching subscriptions:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch subscriptions',
//       error: error.message,
//     });
//   }
// };
// exports.subscription = async (req, res) => {
//   const priceId = req.query.priceId; // fix toLowerCase()
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       line_items: [{ price: priceId, quantity: 1 }],
//       success_url: "http://localhost:3001/success",
//       cancel_url: "http://localhost:3001/cancel", // optional
//     });
//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe error:", error);
//     res.status(500).json({ error: "Failed to create Stripe session" });
//   }
// };



// controllers/subscriptionController.js
const stripeModel = require('../models/stripeModel');

async function getProducts(req, res) {
  try {
    const products = await stripeModel.getProductsAndPrices();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCustomer(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const customerId = await stripeModel.getOrCreateCustomer(email);
    res.json({ customerId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async function subscribe(req, res) {
  const { 
    customerId, 
    priceId, 
    paymentMethodId, 
    userId, 
    companyName, 
    gstNumber, 
    billingAddress 
  } = req.body;

  if (!customerId || !priceId || !paymentMethodId || !userId) {
    return res.status(400).json({ error: 'customerId, priceId, paymentMethodId, and userId are required' });
  }

  try {
    const subscription = await stripeModel.createOrUpdateSubscription(
      customerId, 
      priceId, 
      paymentMethodId, 
      userId, 
      companyName, 
      gstNumber, 
      billingAddress
    );

    res.json(subscription);
  } catch (error) {
    console.error('Subscription creation failed:', error);
    res.status(500).json({ error: error.message });
  }
}



async function getSubscription(req, res) {
  const { customerId } = req.params;
  if (!customerId) return res.status(400).json({ error: 'customerId required' });

  try {
    const subscription = await stripeModel.getSubscriptionInfo(customerId);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async function createPaymentIntent(req, res) {
  const { customerId, priceId } = req.body;
  if (!customerId || !priceId) {
    return res.status(400).json({ error: 'customerId and priceId are required' });
  }

  try {
    const clientSecret = await stripeModel.createPaymentIntent(customerId, priceId);
    res.json({ clientSecret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProducts,
  getCustomer,
  subscribe,
  getSubscription,
  createPaymentIntent , 
  getSubscription
};


