const express = require("express");
const { z } = require("zod");
const Stripe = require("stripe");
const paypal = require("@paypal/checkout-server-sdk");

const router = express.Router();
const captureSchema = z.object({ orderId: z.string().min(1) });

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
router.post("/stripe/session", async (req, res, next) => {
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
    next(e);
  }
});

// ========= PayPal Checkout ===========
router.post("/paypal/order", async (req, res, next) => {
  if (!paypalClient) return res.status(500).json({ error: "PayPal not configured" });

  try {
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
  } catch (error) {
    next(error);
  }
});

router.post("/paypal/capture", async (req, res, next) => {
  if (!paypalClient) return res.status(500).json({ error: "PayPal not configured" });

  let payload;
  try {
    payload = captureSchema.parse(req.body || {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return next(error);
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(payload.orderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    res.json({ ok: true, capture });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
