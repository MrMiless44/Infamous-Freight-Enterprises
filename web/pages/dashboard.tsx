import { useEffect, useState } from "react";
import { VoicePanel } from "../components/VoicePanel";
import { BillingPanel } from "../components/BillingPanel";

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";
  const healthUrl = `${apiBase.replace(/\/$/, "")}/health`;

  useEffect(() => {
    fetch(healthUrl)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(j => setStatus(j))
      .catch(err =>
        setStatus({ ok: false, error: err.message || "Health check failed" })
      )
      .finally(() => setLoading(false));
  }, [healthUrl]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem" }}>Control Tower</h1>

      {loading && <p>Loading status…</p>}
      {!loading && (
        <pre
          style={{
            background: "#0b0b12",
            padding: "1rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          {JSON.stringify(status, null, 2)}
        </pre>
      )}

      <VoicePanel />
      <BillingPanel />
    </main>
  );
}
