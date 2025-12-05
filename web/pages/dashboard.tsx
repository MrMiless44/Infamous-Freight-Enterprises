import { useEffect, useState } from "react";
import { VoicePanel } from "../components/VoicePanel";
import { BillingPanel } from "../components/BillingPanel";
import { useApi } from "../hooks/useApi";

type HealthStatus = {
  ok: boolean;
  service?: string;
  timestamp?: string;
  version?: string;
  error?: string;
  [key: string]: any;
};

export default function Dashboard() {
  const api = useApi();
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await api.get("/health");
        if (active) setStatus(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load API status";
        if (active) setStatus({ ok: false, error: message });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [api]);

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
