const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');  // Replace with your database connection

const { generateEndUserId } = require('../utils/helperFunctions');
const Subscription = sequelize.define('Subscription', {
  subscription_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING
  },
  customer_id: {
    type: DataTypes.STRING
  },
  price_id: {
    type: DataTypes.STRING
  },
  product_id: {
    type: DataTypes.STRING
  },
  product_name: {
    type: DataTypes.STRING
  },
  product_description: {
    type: DataTypes.TEXT
  },
  price_unit_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  price_currency: {
    type: DataTypes.STRING
  },
  interval: {
    type: DataTypes.STRING
  },
  created_at: {
    type: DataTypes.DATE
  },
  current_period_start: {
    type: DataTypes.DATE
  },
  current_period_end: {
    type: DataTypes.DATE
  },
  next_renewal_date: {
    type: DataTypes.DATE
  },
  metadata: {
    type: DataTypes.JSON
  },
  invoice_url: {
    type: DataTypes.STRING
  },
  payment_intent_id: {
    type: DataTypes.STRING
  } ,
  	hasAgent : {
        type: DataTypes.BOOLEAN , 
        defaultValue : false
    } , 
    agentId : {
        type: DataTypes.STRING , 
        defaultValue : null
    } , 
      billing_line1: {
    type: DataTypes.STRING,
  },
  billing_line2: {
    type: DataTypes.STRING,
  },
  billing_city: {
    type: DataTypes.STRING,
  },
  billing_state: {
    type: DataTypes.STRING,
  },
  billing_postal_code: {
    type: DataTypes.STRING,
  },
  billing_country: {
    type: DataTypes.STRING,
  },

  plan_mins: {
  type: DataTypes.STRING,  // or INTEGER if you want to convert
  allowNull: true,
},
}, {
  tableName: 'subscriptions',
  timestamps: false  // Disable timestamps since we're manually handling them
});
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const userDb = new Map(); // Simulated DB

async function getProductsAndPrices() {
  const products  = await stripe.products.list({ active: true });
  const prices = await stripe.prices.list({ active: true });

  return products.data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    images: product.images,
    prices: prices.data
      .filter(price => price.product === product.id)
      .map(price => ({
        id: price.id,
        currency: price.currency,
        unit_amount: price.unit_amount,
        interval: price.recurring?.interval,
      })),
      data : products
  }));
}

async function getOrCreateCustomer(email) {
  if (userDb.has(email)) return userDb.get(email);
  const customer = await stripe.customers.create({ email });
  userDb.set(email, customer.id);
  return customer.id;
}

// New function: create PaymentIntent for upfront payment
async function createPaymentIntent(customerId, priceId) {
  const price = await stripe.prices.retrieve(priceId);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: price.unit_amount,
    currency: price.currency,
    customer: customerId,
    payment_method_types: ['card'],
    setup_future_usage: 'off_session', 
  });

  return paymentIntent.client_secret;
}


async function createOrUpdateSubscription(customerId, priceId, paymentMethodId, userId, companyName, gstNumber, billingAddress) {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    // Set default payment method + update address + metadata
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      address: {
        line1: billingAddress.line1,
        line2: billingAddress.line2,
        city: billingAddress.city,
        state: billingAddress.state,
        postal_code: billingAddress.postalCode,
        country: billingAddress.country,
      },
      metadata: {
        companyName: companyName || '',
        gstNumber: gstNumber || '',
      },
    });

    const agentId = await generateEndUserId();

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],

      metadata: {
        userId: userId,
        randomAgentId: agentId,
        companyName: companyName || '',
        gstNumber: gstNumber || '',
      },
    });

    const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);
    console.log("fullSubscription", fullSubscription)

    // Retrieve product
    const item = subscription.items.data[0];
    const product = await stripe.products.retrieve(item.price.product);
    console.log("subscription", subscription)
    console.log("product", product) // includes minutes 


    const interval = fullSubscription.plan.interval; // 'month' or 'year' etc.

    const currentPeriodStartDate = new Date(fullSubscription.start_date * 1000);

    let currentPeriodEndDate;

    if (interval === 'month') {
      currentPeriodEndDate = new Date(currentPeriodStartDate);
      currentPeriodEndDate.setMonth(currentPeriodEndDate.getMonth() + 1);
    } else if (interval === 'year') {
      currentPeriodEndDate = new Date(currentPeriodStartDate);
      currentPeriodEndDate.setFullYear(currentPeriodEndDate.getFullYear() + 1);
    } else {
      // handle other intervals or default fallback
      currentPeriodEndDate = new Date(fullSubscription.billing_cycle_anchor * 1000);
    }

    const nextRenewalDate = currentPeriodEndDate;

    let invoiceUrl = null;
if (subscription.latest_invoice) {
  const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
  invoiceUrl = invoice.invoice_pdf;
}

    const planMins = product.metadata?.minutes || null;


    // Save to DB
    await Subscription.create({
      subscription_id: subscription.id,
      status: subscription.status,
      customer_id: customerId,
      price_id: priceId,
      product_id: product.id,
      product_name: product.name,
      product_description: product.description,
      price_unit_amount: item.price.unit_amount / 100,
      price_currency: item.price.currency,
      interval: item.price.recurring?.interval,
      created_at: new Date(subscription.created * 1000),
      current_period_start: currentPeriodStartDate,
      current_period_end: currentPeriodEndDate,
      next_renewal_date: nextRenewalDate,
      metadata: subscription.metadata,
      invoice_url: invoiceUrl,
      payment_intent_id: subscription.latest_invoice ? subscription.latest_invoice.payment_intent : null,

      // Add billing address fields here:
      billing_line1: billingAddress.line1,
      billing_line2: billingAddress.line2,
      billing_city: billingAddress.city,
      billing_state: billingAddress.state,
      billing_postal_code: billingAddress.postalCode,
      billing_country: billingAddress.country,

      plan_mins: planMins,
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      price: {
        id: item.price.id,
        unit_amount: item.price.unit_amount / 100,
        currency: item.price.currency,
        interval: item.price.recurring?.interval,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
        },
      },
      metadata: subscription.metadata,
      nextRenewalDate: nextRenewalDate,
    };

  } catch (error) {
    console.error('Error creating or updating subscription:', error);
    throw new Error('Failed to create or update subscription');
  }
}




async function getFullSubscriptionDetails(customerId) {
  try {
    // Retrieve all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.items.data.price.product'],
    });

    console.log('Subscriptions:', subscriptions);  // Log full subscription response for debugging

    // Find the subscription that is active, trialing, or incomplete
    const sub = subscriptions.data.find(sub => ['active', 'trialing', 'incomplete'].includes(sub.status));
    
    if (!sub) {
      return { error: 'No active or incomplete subscription found for this customer' };
    }

    // Get subscription item and product details
    const item = sub.items.data[0]; // Subscription item
    const product = item.price.product;  // Product details, already expanded
    const nextRenewalDate = new Date(sub.current_period_end * 1000).toLocaleDateString(); // Convert Unix timestamp to readable date

    // Prepare the response with full subscription details
    return {
      subscriptionId: sub.id,  // Subscription ID
      status: sub.status,  // Subscription status (active, trialing, etc.)
      current_period_end: nextRenewalDate,  // Next renewal date
      price: {
        id: item.price.id,  // Price ID
        unit_amount: item.price.unit_amount / 100,  // Price in USD (assuming Stripe uses cents)
        currency: item.price.currency,  // Currency (e.g., 'usd')
        interval: item.price.recurring?.interval,  // Recurring interval (monthly, yearly)
        product: {
          id: product.id,  // Product ID
          name: product.name,  // Product name
          description: product.description,  // Product description
        },
      },
      metadata: sub.metadata,  // Subscription metadata (e.g., userId)
      nextRenewalDate,  // Next renewal date formatted
      invoiceUrl: sub.latest_invoice ? `https://invoice.stripe.com/i/${sub.latest_invoice}` : null,  // Invoice URL (if available)
      paymentIntentId: sub.latest_invoice ? sub.latest_invoice.payment_intent : null,  // Payment intent ID
    };
  } catch (error) {
    console.error('Error retrieving subscription details:', error);
    return { error: 'Failed to retrieve subscription details' };
  }
}



async function getFullSubscriptionDetails(customerId) {
  try {
    // Retrieve all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.items.data.price.product'],
    });

  

    // Look for the first active, trialing, or incomplete subscription
    const sub = subscriptions.data.find(sub => ['active', 'trialing', 'incomplete'].includes(sub.status));
    if (!sub) {
      return { error: 'No active subscription found for this customer' };
    }

    // Get the product and price details from the subscription
    const item = sub.items.data[0]; // Subscription item
    const product = item.price.product;  // Expand already includes price and product
    console.log('Product:', product);  // Log the expanded product object

    const nextRenewalDate = new Date(sub.current_period_end * 1000).toLocaleDateString(); // Convert Unix timestamp to readable date

    // Prepare the response with all relevant subscription details
    return {
      subscriptionId: sub.id,
      status: sub.status,
      current_period_end: nextRenewalDate,
      price: {
        id: item.price.id,
        unit_amount: item.price.unit_amount,
        currency: item.price.currency,
        interval: item.price.recurring?.interval,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
        },
      },
      metadata: sub.metadata,  
      nextRenewalDate,
    };
  } catch (error) {
    console.error('Error retrieving subscription details:', error);
    return { error: 'Failed to retrieve subscription details' };
  }
}
async function getSubscriptionInfo(customerId) {
  try {
    // Retrieve all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.items.data.price'],
    });

    console.log('Subscriptions:', subscriptions);  // Log full subscription response for debugging

    // Find the subscription that is active, trialing, or incomplete
    const sub = subscriptions.data.find(sub => ['active', 'trialing', 'incomplete'].includes(sub.status));
    
    if (!sub) {
      return { error: 'No active or incomplete subscription found for this customer' };
    }

    // Get subscription item and price details
    const item = sub.items.data[0]; // Subscription item
    const productId = item.price.product;  // Product ID (need to fetch product details)
    
    // Fetch product details using the product ID
    const product = await stripe.products.retrieve(productId);

    // Convert Unix timestamps to readable dates
    const nextRenewalDate = new Date(sub.current_period_end * 1000).toLocaleDateString(); // Next renewal date
    const createdDate = new Date(sub.created * 1000).toLocaleDateString(); // Subscription creation date
    const currentPeriodStartDate = new Date(sub.current_period_start * 1000).toLocaleDateString(); // Current period start date

    // Prepare the response with full subscription details
    return {
      subscriptionId: sub.id,  // Subscription ID
      status: sub.status,  // Subscription status (active, trialing, etc.)
      createdDate,  // Subscription creation date
      currentPeriodStartDate,  // Current period start date
      current_period_end: nextRenewalDate,  // Next renewal date
      price: {
        id: item.price.id,  // Price ID
        unit_amount: item.price.unit_amount / 100,  // Price in USD (assuming Stripe uses cents)
        currency: item.price.currency,  // Currency (e.g., 'usd')
        interval: item.price.recurring?.interval,  // Recurring interval (monthly, yearly)
        product: {
          id: product.id,  // Product ID
          name: product.name,  // Product name
          description: product.description,  // Product description
          images: product.images,  // Product images (if available)
        },
      },
      metadata: sub.metadata,  // Subscription metadata (e.g., userId)
      nextRenewalDate,  // Next renewal date formatted
      paymentIntentId: sub.latest_invoice ? sub.latest_invoice.payment_intent : null, // Payment Intent ID
      invoiceUrl: sub.latest_invoice ? `https://invoice.stripe.com/i/${sub.latest_invoice.id}` : null, // Invoice URL
      item: {  // Subscription item details
        itemId: item.id,
        quantity: item.quantity,
        billingThresholds: item.billing_thresholds,
        plan: item.plan,
        price: item.price,
      } // Adding `item` object to the response
    };
  } catch (error) {
    console.error('Error retrieving subscription details:', error);
    return { error: 'Failed to retrieve subscription details' };
  }
}



module.exports = {
  getProductsAndPrices,
  getOrCreateCustomer,
  createPaymentIntent,         
  createOrUpdateSubscription,
  getSubscriptionInfo,
  getFullSubscriptionDetails , 
  Subscription
};
