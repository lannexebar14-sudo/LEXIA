"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import styles from "./MaintenanceControl.module.css";

type ControlState = "loading" | "ready" | "saving" | "error";

export default function MaintenanceControl() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [target, setTarget] = useState<Element | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<ControlState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (pathname !== "/administration/parametres") {
      setTarget(null);
      return;
    }

    let slot: HTMLDivElement | null = null;
    let cancelled = false;

    function mountControl() {
      const grid = document.querySelector(".settings-grid");
      if (!grid || cancelled) return false;
      slot = document.createElement("div");
      slot.className = "lexia-maintenance-control-slot";
      grid.appendChild(slot);
      setTarget(slot);
      return true;
    }

    if (!mountControl()) {
      const observer = new MutationObserver(() => {
        if (mountControl()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        cancelled = true;
        observer.disconnect();
        slot?.remove();
      };
    }

    return () => {
      cancelled = true;
      slot?.remove();
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/administration/parametres") return;

    async function loadStatus() {
      setState("loading");
      const { data, error } = await supabase
        .from("platform_settings")
        .select("maintenance_mode")
        .eq("id", "main")
        .maybeSingle();

      if (error || typeof data?.maintenance_mode !== "boolean") {
        setState("error");
        setMessage("Impossible de lire l’état global du site.");
        return;
      }

      setEnabled(data.maintenance_mode);
      syncLocalSettings(data.maintenance_mode);
      setState("ready");
    }

    loadStatus();

    const channel = supabase
      .channel("admin-maintenance-control")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "platform_settings", filter: "id=eq.main" },
        (payload) => {
          const nextValue = Boolean((payload.new as { maintenance_mode?: boolean }).maintenance_mode);
          setEnabled(nextValue);
          syncLocalSettings(nextValue);
          setState("ready");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname, supabase]);

  function syncLocalSettings(value: boolean) {
    try {
      const saved = window.localStorage.getItem("lexia_admin_settings");
      const parsed = saved ? JSON.parse(saved) : {};
      window.localStorage.setItem("lexia_admin_settings", JSON.stringify({ ...parsed, maintenanceMode: value }));
    } catch {
      window.localStorage.setItem("lexia_admin_settings", JSON.stringify({ maintenanceMode: value }));
    }
  }

  async function changeStatus(value: boolean) {
    if (state === "saving") return;

    const previousValue = enabled;
    setEnabled(value);
    setState("saving");
    setMessage(value ? "Activation du blocage global…" : "Réouverture du site…");

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("platform_settings")
      .upsert({
        id: "main",
        maintenance_mode: value,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      }, { onConflict: "id" });

    if (error) {
      setEnabled(previousValue);
      setState("error");
      setMessage("Le changement n’a pas pu être appliqué. Le site conserve son état précédent.");
      return;
    }

    syncLocalSettings(value);
    setState("ready");
    setMessage(value
      ? "Mode maintenance activé. Tous les visiteurs voient désormais la page de maintenance."
      : "Mode maintenance désactivé. Le site est de nouveau ouvert à tous.");

    window.setTimeout(() => window.location.reload(), 900);
  }

  if (!target || pathname !== "/administration/parametres") return null;

  return createPortal(
    <section className={`${styles.card} ${enabled ? styles.active : ""}`}>
      <div className={styles.head}>
        <div className={styles.icon}>{enabled ? "⚙" : "✓"}</div>
        <div>
          <small>DISPONIBILITÉ DU SERVICE</small>
          <h2>Mode maintenance global</h2>
          <p>Bloque immédiatement l’ensemble du site pour les visiteurs.</p>
        </div>
      </div>

      <div className={styles.control}>
        <div className={styles.status}>
          <i />
          <div>
            <b>{state === "loading" ? "Vérification…" : enabled ? "Site en maintenance" : "Site accessible"}</b>
            <span>{enabled
              ? "Seuls les administrateurs autorisés peuvent continuer à accéder au site."
              : "Les clients et visiteurs peuvent utiliser Lexia normalement."}</span>
          </div>
        </div>

        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={enabled}
            disabled={state === "loading" || state === "saving"}
            onChange={(event) => changeStatus(event.target.checked)}
          />
          <span><i /></span>
          <b>{enabled ? "ACTIVÉ" : "DÉSACTIVÉ"}</b>
        </label>
      </div>

      {message && <div className={`${styles.message} ${state === "error" ? styles.messageError : ""}`}>{message}</div>}

      <div className={styles.preview}>
        <span>APERÇU VISITEUR</span>
        <p><b>SITE EN MAINTENANCE.</b> Revenez dans quelques minutes.</p>
        <small>Accès administration protégé par le code configuré.</small>
      </div>
    </section>,
    target,
  );
}
