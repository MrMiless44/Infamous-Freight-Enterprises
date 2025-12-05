import React, { useState } from "react";
import { useApi } from "../hooks/useApi";

export function BillingPanel() {
  const api = useApi();
  const [stripeSession, setStripeSession] = useState<string | null>(null);
  const [paypalOrder, setPaypalOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createStripe() {
    setError(null);
    try {
      const res = await api.post("/billing/stripe/session");
      if (!res?.sessionId) {
        throw new Error("Failed to create Stripe session");
      }
      setStripeSession(res.sessionId);
      window.location.href = `https://checkout.stripe.com/pay/${res.sessionId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stripe checkout failed");
    }
  }

  async function createPayPal() {
    setError(null);
    try {
      const res = await api.post("/billing/paypal/order");
      if (!res?.orderId) {
        throw new Error("Failed to create PayPal order");
      }
      setPaypalOrder(res.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayPal order failed");
    }
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
      {error && (
        <p style={{ marginTop: "1rem", color: "#ff8c66" }}>{error}</p>
      )}
    </div>
  );
}
