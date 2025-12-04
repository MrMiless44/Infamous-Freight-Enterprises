import { useEffect, useState } from "react";
import { VoicePanel } from "../components/VoicePanel";
import { BillingPanel } from "../components/BillingPanel";

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_BASE || "http://localhost/api") + "/health")
      .then(r => r.json())
      .then(j => setStatus(j))
      .catch(() => setStatus({ ok: false }))
      .finally(() => setLoading(false));
  }, []);

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
