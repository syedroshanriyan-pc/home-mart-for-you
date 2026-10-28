import React from "react";

export default function BackendStatusPage() {
  return (
    <main style={{ padding: "3rem", fontFamily: "system-ui, sans-serif", textAlign: "center", lineHeight: "1.6" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Homemart4u Backend API Engine</h1>
      <p style={{ color: "#16a34a", fontWeight: "bold" }}>● Service Status: Operational</p>
      <p style={{ color: "#666" }}>Running on Render with Supabase PostgreSQL & Prisma 6</p>
      <div style={{ marginTop: "1.5rem" }}>
        <a 
          href="/api/health" 
          style={{ padding: "0.5rem 1rem", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "6px", textDecoration: "none", color: "#111827" }}
        >
          Check /api/health
        </a>
      </div>
    </main>
  );
}
