import Link from "next/link";
import type { ReactNode } from "react";

export default function DossiersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Link
        href="/administration/mes-dossiers/courriers"
        aria-label="Ouvrir les courriers amiables LEXIA"
        style={{
          position: "fixed",
          right: "18px",
          bottom: "88px",
          zIndex: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "9px",
          minHeight: "52px",
          padding: "0 18px",
          borderRadius: "16px",
          background: "#0c2340",
          color: "#fff",
          border: "1px solid rgba(215,181,101,.7)",
          boxShadow: "0 12px 30px rgba(12,35,64,.22)",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 900,
          letterSpacing: ".1px",
        }}
      >
        <span aria-hidden="true" style={{ color: "#e1bd68", fontSize: "18px" }}>✉</span>
        Courriers amiables
      </Link>
    </>
  );
}
