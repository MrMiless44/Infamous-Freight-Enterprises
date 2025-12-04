const express = require("express");
const Stripe = require("stripe");
const paypal = require("@paypal/checkout-server-sdk");

const router = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// PayPal environment
let paypalClient = null;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET) {
  const env = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
  );
  paypalClient = new paypal.core.PayPalHttpClient(env);
}

// ========= Stripe Checkout ===========
router.post("/billing/stripe/session", async (req, res) => {
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Infæmous Freight AI" },
            unit_amount: 4900
          },
          quantity: 1
        }
      ]
    });

    res.json({ ok: true, sessionId: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ========= PayPal Checkout ===========
router.post("/billing/paypal/order", async (req, res) => {
  if (!paypalClient) return res.status(500).json({ error: "PayPal not configured" });

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: "USD", value: "49.00" }
      }
    ]
  });

  const order = await paypalClient.execute(request);
  res.json({ ok: true, orderId: order.result.id });
});

router.post("/billing/paypal/capture", async (req, res) => {
  const { orderId } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const capture = await paypalClient.execute(request);
  res.json({ ok: true, capture });
});

module.exports = router;
