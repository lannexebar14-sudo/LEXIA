import Link from "next/link";

export default function MaintenanceRoute() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#091d33", color: "white", textAlign: "center" }}>
      <section>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 42, fontWeight: 800, letterSpacing: 2 }}>LEXIA<span style={{ color: "#d4b66e" }}>.</span></div>
        <h1 style={{ marginTop: 28 }}>Site en maintenance</h1>
        <p>Revenez dans quelques minutes.</p>
        <Link href="/administration" style={{ display: "inline-block", marginTop: 22, color: "#d4b66e", fontWeight: 800 }}>Administration</Link>
      </section>
    </main>
  );
}
