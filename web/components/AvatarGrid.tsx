import React from "react";

const cards = [
  {
    id: "genesis",
    title: "GĘŊÏŮ§ Core",
    subtitle: "Logistics AI Navigator",
    description: "Optimizes routes, loads, ETAs and capacity across fleets.",
    color: "linear-gradient(135deg,#ffcc33,#ff3366)"
  },
  {
    id: "aurum",
    title: "AURUM Dispatch",
    subtitle: "Dispatcher Co-pilot",
    description: "Monitors lanes, suggests bids and protects margins in real time.",
    color: "linear-gradient(135deg,#ff9966,#ff5e62)"
  },
  {
    id: "noir",
    title: "NOIR Guardian",
    subtitle: "Risk and Compliance",
    description: "Watches for anomalies, fraud and safety risks across the network.",
    color: "linear-gradient(135deg,#3a1c71,#d76d77)"
  }
];

export function AvatarGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "1.5rem",
        marginTop: "2rem"
      }}
    >
      {cards.map(card => (
        <div
          key={card.id}
          style={{
            borderRadius: "18px",
            padding: "1.5rem",
            background: "#050509",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-40%",
              background: card.color,
              opacity: 0.2,
              filter: "blur(30px)"
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "14px",
                background: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "0.9rem",
                color: "#050509"
              }}
            >
              {card.title[0]}
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: 700
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                margin: "0.2rem 0 0.9rem",
                fontSize: "0.85rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)"
              }}
            >
              {card.subtitle}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5
              }}
            >
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
