"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";

const ACCESS_TOKEN_KEY = "lexia_maintenance_admin_token_v2";
const ADMIN_LOGIN_URL = "/connexion?redirect=%2Fadministration&maintenance=1";

export default function MaintenanceRoute() {
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function continueToAdministration() {
      const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);

      // Sans passe temporaire, le contrôle global réaffiche automatiquement
      // le formulaire avec le code administrateur.
      if (!token) {
        window.location.replace("/");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;

      if (!user) {
        window.location.replace(ADMIN_LOGIN_URL);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      window.location.replace(profile?.role === "admin" ? "/administration" : ADMIN_LOGIN_URL);
    }

    void continueToAdministration();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#091d33", color: "white", textAlign: "center" }}>
      <section>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 42, fontWeight: 800, letterSpacing: 2 }}>
          LEXIA<span style={{ color: "#d4b66e" }}>.</span>
        </div>
        <h1 style={{ marginTop: 28 }}>Ouverture de l’administration</h1>
        <p>Vérification de votre accès sécurisé…</p>
      </section>
    </main>
  );
}
