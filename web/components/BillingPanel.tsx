import React, { useState } from "react";
import { useApi } from "../hooks/useApi";

export function BillingPanel() {
  const api = useApi();
  const [stripeSession, setStripeSession] = useState<string | null>(null);
  const [paypalOrder, setPaypalOrder] = useState<string | null>(null);

  async function createStripe() {
    const res = await api.post("/billing/stripe/session");
    setStripeSession(res.sessionId);
    window.location.href = `https://checkout.stripe.com/pay/${res.sessionId}`;
  }

  async function createPayPal() {
    const res = await api.post("/billing/paypal/order");
    setPaypalOrder(res.orderId);
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        borderRadius: "12px",
        background: "#0b0b12"
      }}
    >
      <h3>Billing</h3>

      <button
        onClick={createStripe}
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "999px",
          background: "linear-gradient(135deg,#a1e3ff,#2eefff)",
          color: "#050509",
          border: "none",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Purchase w/ Stripe
      </button>

      <button
        onClick={createPayPal}
        style={{
          marginLeft: "1rem",
          padding: "0.6rem 1.2rem",
          borderRadius: "999px",
          background: "linear-gradient(135deg,#ffe600,#ffad00)",
          color: "#050509",
          border: "none",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Purchase w/ PayPal
      </button>

      {paypalOrder && (
        <p style={{ marginTop: "1rem" }}>PayPal Order: {paypalOrder}</p>
      )}
    </div>
  );
}
