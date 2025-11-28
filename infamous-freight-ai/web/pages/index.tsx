import Link from "next/link";
import { AvatarGrid } from "../components/AvatarGrid";

export default function Home() {
    const brand = process.env.NEXT_PUBLIC_APP_NAME || "Infæmous Freight";

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "3rem 1.5rem",
                background: "radial-gradient(circle at top,#1a1a33 0,#050509 55%,#010103 100%)",
                color: "#f9fafb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >
            <div style={{ maxWidth: "960px", width: "100%" }}>
                <header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "2.5rem"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div
                            style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "12px",
                                background:
                                    "conic-gradient(from 220deg,#ffcc33,#ff3366,#ffcc33)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "1.1rem",
                                color: "#050509"
                            }}
                        >
                            IF
                        </div>
                        <span
                            style={{
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                fontSize: "0.8rem",
                                textTransform: "uppercase",
                                color: "rgba(249,250,251,0.75)"
                            }}
                        >
                            {brand}
                        </span>
                    </div>
                    <nav style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
                        <Link href="/dashboard">Dashboard</Link>
                    </nav>
                </header>

                <section style={{ maxWidth: "640px" }}>
                    <h1
                        style={{
                            fontSize: "2.4rem",
                            lineHeight: 1.1,
                            marginBottom: "1rem"
                        }}
                    >
                        AI SYNTHETIC INTELLIGENCE ♊ for global freight and fleets.
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            color: "rgba(249,250,251,0.76)",
                            lineHeight: 1.7,
                            marginBottom: "1.6rem"
                        }}
                    >
                        Infæmous Freight coordinates shippers, brokers and drivers with
                        avatar co-pilots that learn lanes, behavior and risk in real time.
                    </p>
                    <div style={{ display: "flex", gap: "0.9rem" }}>
                        <Link
                            href="/dashboard"
                            style={{
                                padding: "0.7rem 1.4rem",
                                borderRadius: "999px",
                                background:
                                    "linear-gradient(135deg,#ffcc33,#ff3366)",
                                color: "#050509",
                                fontWeight: 600,
                                textDecoration: "none",
                                fontSize: "0.95rem"
                            }}
                        >
                            Open Control Tower
                        </Link>
                    </div>
                </section>

                <AvatarGrid />
            </div>
        </main>
    );
}
