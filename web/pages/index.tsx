import { AvatarGrid } from "../components/AvatarGrid";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: 800,
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg,#ffcc33,#ff3366)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        Infæmous Freight AI
      </h1>
      <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)" }}>
        Next-generation logistics intelligence platform
      </p>

      <AvatarGrid />

      <div style={{ marginTop: "3rem" }}>
        <Link href="/dashboard">
          <button
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "999px",
              background: "linear-gradient(135deg,#ffcc33,#ff3366)",
              fontWeight: 600,
              color: "#050509",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Enter Control Tower →
          </button>
        </Link>
      </div>
    </main>
  );
}
