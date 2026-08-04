"use client";

// Le statut global est revérifié régulièrement pour bloquer aussi les sessions déjà ouvertes.
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./MaintenanceGate.module.css";

const ACCESS_TOKEN_KEY = "lexia_maintenance_admin_token_v2";
const OLD_ACCESS_TOKEN_KEY = "lexia_maintenance_admin_token";

type GateState = "loading" | "open" | "maintenance";

type MaintenanceAccessResult = {
  valid?: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
};

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<GateState>("loading");
  const [code, setCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let firstCheckCompleted = false;
    let checkInProgress = false;
    window.localStorage.removeItem(OLD_ACCESS_TOKEN_KEY);

    async function hasTemporaryAccess() {
      const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return false;

      const { data, error: verifyError } = await supabase.functions.invoke<MaintenanceAccessResult>("maintenance-access", {
        body: { action: "verify", token },
      });

      if (verifyError || !data?.valid) {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        return false;
      }

      return true;
    }

    async function applyMaintenanceState(maintenanceMode: boolean) {
      if (!active) return;

      if (!maintenanceMode) {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        setState("open");
        return;
      }

      const allowed = await hasTemporaryAccess();
      if (active) setState(allowed ? "open" : "maintenance");
    }

    async function loadStatus() {
      if (checkInProgress) return;
      checkInProgress = true;

      try {
        const { data, error: statusError } = await supabase
          .from("platform_settings")
          .select("maintenance_mode")
          .eq("id", "main")
          .maybeSingle();

        if (statusError || typeof data?.maintenance_mode !== "boolean") {
          if (!firstCheckCompleted && active) setState("open");
          return;
        }

        await applyMaintenanceState(data.maintenance_mode);
      } finally {
        firstCheckCompleted = true;
        checkInProgress = false;
      }
    }

    function checkWhenVisible() {
      if (document.visibilityState === "visible") loadStatus();
    }

    async function handleSignedOut() {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(OLD_ACCESS_TOKEN_KEY);

      const { data, error: statusError } = await supabase
        .from("platform_settings")
        .select("maintenance_mode")
        .eq("id", "main")
        .maybeSingle();

      if (!active || statusError || data?.maintenance_mode !== true) return;

      setState("maintenance");
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }

    loadStatus();
    const interval = window.setInterval(loadStatus, 3000);
    window.addEventListener("focus", loadStatus);
    document.addEventListener("visibilitychange", checkWhenVisible);

    const { data: authStateListener } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      window.setTimeout(() => {
        void handleSignedOut();
      }, 0);
    });

    const channel = supabase
      .channel("lexia-platform-maintenance")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "platform_settings", filter: "id=eq.main" },
        (payload) => {
          const maintenanceMode = Boolean((payload.new as { maintenance_mode?: boolean }).maintenance_mode);
          applyMaintenanceState(maintenanceMode);
        },
      )
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadStatus);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      authStateListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function unlockAdministration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkingCode || code.length !== 6) return;

    setCheckingCode(true);
    setError("");

    try {
      const { data, error: accessError } = await supabase.functions.invoke<MaintenanceAccessResult>("maintenance-access", {
        body: { action: "unlock", code },
      });

      if (accessError) throw new Error("Vérification impossible pour le moment.");
      if (!data?.valid || !data.token) throw new Error(data?.error || "Code administrateur incorrect.");

      window.localStorage.setItem(ACCESS_TOKEN_KEY, data.token);

      const { data: authData } = await supabase.auth.getUser();
      let destination = "/connexion?redirect=/administration";

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profile?.role === "admin") destination = "/administration";
      }

      setState("open");
      window.location.replace(destination);
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : "Code administrateur incorrect.");
      setCode("");
      setCheckingCode(false);
    }
  }

  if (state === "loading") {
    return (
      <main className={styles.loading}>
        <div className={styles.loadingLogo}>LEXIA<span>.</span></div>
        <div className={styles.loadingBar}><i /></div>
      </main>
    );
  }

  if (state === "open") return <>{children}</>;

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <div className={styles.pattern} aria-hidden="true" />

      <section className={styles.content}>
        <div className={styles.brand}>LEXIA<span>.</span></div>

        <div className={styles.statusPill}><i /> Maintenance en cours</div>

        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.outerRing} />
          <div className={styles.innerRing} />
          <div className={styles.tool}>⚙</div>
          <span className={styles.sparkOne}>✦</span>
          <span className={styles.sparkTwo}>✦</span>
        </div>

        <div className={styles.copy}>
          <small>AMÉLIORATION DE NOS SERVICES</small>
          <h1>SITE EN<br /><span>MAINTENANCE</span></h1>
          <p>Revenez dans quelques minutes.</p>
          <div className={styles.separator}><i /><span>Nous préparons une meilleure expérience Lexia</span><i /></div>
        </div>

        <form className={styles.adminCard} onSubmit={unlockAdministration}>
          <div className={styles.adminIcon}>⌘</div>
          <div className={styles.adminCopy}>
            <small>ACCÈS RÉSERVÉ</small>
            <h2>Administration</h2>
            <p>Saisissez le code administrateur pour accéder au back-office pendant la maintenance.</p>
          </div>

          <label className={styles.codeField}>
            <span>Code administrateur</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="••••••"
              aria-invalid={Boolean(error)}
              autoFocus
            />
          </label>

          {error && <div className={styles.error} role="alert">! {error}</div>}

          <button type="submit" disabled={checkingCode || code.length !== 6}>
            {checkingCode ? "Ouverture…" : "Accéder à l’administration"}
            {!checkingCode && <span>→</span>}
          </button>

          <small className={styles.security}>Accès sécurisé et temporaire · Connexion administrateur requise</small>
        </form>

        <footer>© 2026 LEXIA · Assistance juridique sécurisée</footer>
      </section>
    </main>
  );
}
