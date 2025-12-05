import React, { useState } from "react";
import { useApi } from "../hooks/useApi";

export function VoicePanel() {
  const api = useApi();
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await api.post("/voice/command", { text });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
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
      <h3 style={{ marginTop: 0 }}>Voice / Command Input</h3>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          borderRadius: "8px",
          padding: "0.6rem",
          background: "#111",
          color: "#fff",
          border: "1px solid #222"
        }}
      />

      <button
        onClick={send}
        disabled={loading}
        style={{
          marginTop: "0.8rem",
          padding: "0.6rem 1.2rem",
          borderRadius: "999px",
          background: "linear-gradient(135deg,#ffcc33,#ff3366)",
          fontWeight: 600,
          color: "#050509",
          border: "none",
          cursor: "pointer"
        }}
      >
        {loading ? "Sending…" : "Send to AI"}
      </button>

      {error && (
        <p style={{ color: "#ff8c66", marginTop: "0.8rem" }}>{error}</p>
      )}
      {result && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#111",
            borderRadius: "8px",
            fontSize: "0.85rem"
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
