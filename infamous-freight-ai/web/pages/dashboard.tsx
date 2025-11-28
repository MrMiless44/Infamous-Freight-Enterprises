import { useEffect, useState } from "react";

type Status = {
    ok: boolean;
    api?: boolean;
    db?: boolean;
    time?: string;
};

export default function Dashboard() {
    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/api";
                const res = await fetch(base + "/health");
                const json = await res.json();
                setStatus({ ok: true, api: true, db: true, time: json.time });
            } catch {
                setStatus({ ok: false, api: false, db: false });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "2rem 1.5rem",
                background: "#050509",
                color: "#f9fafb"
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
                Control Tower
            </h1>
            {loading && <p>Loading status…</p>}
            {!loading && status && (
                <pre
                    style={{
                        background: "#0b0b12",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "0.9rem"
                    }}
                >
                    {JSON.stringify(status, null, 2)}
                </pre>
            )}
        </main>
    );
}
