"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./PwaExperience.module.css";

const VAPID_PUBLIC_KEY = "BOdrcJWUiI2QnukZGMo9rjSiWqb6NKWqNOcqoEVyQJ9VwUZW-EIyQVfgpI3c-zx06kXiKdbFya9SVBwt8QYWzos";
const DISMISSED_KEY = "lexia_pwa_prompt_dismissed_at";

type PromptMode = "hidden" | "install" | "instructions" | "notifications" | "working" | "success" | "error";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type AppNavigator = Navigator & {
  standalone?: boolean;
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }
  return output;
}

function isStandalone() {
  const navigatorWithStandalone = window.navigator as AppNavigator;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(navigatorWithStandalone.standalone);
}

export default function PwaExperience() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<PromptMode>("hidden");
  const [message, setMessage] = useState("");
  const [isIos, setIsIos] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const installed = isStandalone();
    setIsIos(iosDevice);

    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY) || 0);
    const recentlyDismissed = dismissedAt > 0 && Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000;

    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const existingSubscription = await registration.pushManager.getSubscription().catch(() => null);
      if (existingSubscription) return;

      timer = setTimeout(() => {
        if (installed && "Notification" in window && "PushManager" in window) {
          setMode("notifications");
        } else if (iosDevice && !recentlyDismissed) {
          setMode("install");
        }
      }, 1200);
    }).catch(() => undefined);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      if (!recentlyDismissed) setMode("install");
    };

    const onInstalled = () => {
      window.localStorage.removeItem(DISMISSED_KEY);
      setMode("notifications");
    };

    const clearBadge = () => {
      if (document.visibilityState !== "visible") return;
      const appNavigator = navigator as AppNavigator;
      appNavigator.clearAppBadge?.().catch(() => undefined);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", clearBadge);
    clearBadge();

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", clearBadge);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setMode("hidden");
  }

  async function installApplication() {
    if (isIos || !installPrompt) {
      setMode("instructions");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setMode("notifications");
    } else {
      dismiss();
    }
    setInstallPrompt(null);
  }

  async function activateNotifications() {
    if (!isStandalone() && isIos) {
      setMode("instructions");
      return;
    }

    if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) {
      setMessage("Les notifications ne sont pas prises en charge sur cet appareil.");
      setMode("error");
      return;
    }

    setMode("working");
    setMessage("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Autorisation refusée. Vous pourrez la réactiver dans Réglages > Notifications > LEXIA.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Connectez-vous à votre compte Lexia avant d’activer les notifications.");

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh;
      const authKey = subscriptionJson.keys?.auth;
      if (!p256dh || !authKey) throw new Error("L’iPhone n’a pas retourné les clés de notification attendues.");

      const { error: saveError } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh,
        auth_key: authKey,
        user_agent: navigator.userAgent,
      }, { onConflict: "user_id,endpoint" });

      if (saveError) throw saveError;

      const { error: testError } = await supabase.functions.invoke("send-push", {
        body: {
          title: "LEXIA est installée",
          body: "Vos notifications sont actives. Vous serez prévenu lors d’un nouveau message ou d’une évolution de dossier.",
          url: "/tableau-de-bord",
          tag: "lexia-welcome",
          badge: 1,
        },
      });

      if (testError) {
        setMessage("Les notifications sont activées. Le message de test n’a simplement pas pu être envoyé.");
      } else {
        setMessage("Une notification de test vient d’être envoyée sur votre iPhone.");
      }
      window.localStorage.removeItem(DISMISSED_KEY);
      setMode("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Activation impossible pour le moment.");
      setMode("error");
    }
  }

  if (mode === "hidden") return null;

  const title = mode === "install" || mode === "instructions"
    ? "Installer l’application"
    : mode === "success"
      ? "Notifications activées"
      : "Activer les notifications";

  const description = mode === "install" || mode === "instructions"
    ? "Ajoutez Lexia à votre écran d’accueil pour l’utiliser comme une véritable application iPhone."
    : "Recevez les nouveaux messages, propositions payantes et changements de statut de vos dossiers.";

  return (
    <aside className={styles.wrapper} aria-live="polite">
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.logo}>L<span>.</span></div>
          <div className={styles.heading}>
            <small>APPLICATION LEXIA</small>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <button className={styles.close} type="button" onClick={dismiss} aria-label="Fermer">×</button>
        </div>

        <div className={styles.content}>
          {mode === "install" && (
            <div className={styles.actions}>
              <button className={styles.primary} type="button" onClick={installApplication}>Installer Lexia</button>
              <button className={styles.secondary} type="button" onClick={dismiss}>Plus tard</button>
            </div>
          )}

          {mode === "instructions" && (
            <>
              <div className={styles.steps}>
                <div className={styles.step}><b>1</b><span>Dans Safari, touchez le bouton <strong>Partager</strong>.</span></div>
                <div className={styles.step}><b>2</b><span>Choisissez <strong>Sur l’écran d’accueil</strong>.</span></div>
                <div className={styles.step}><b>3</b><span>Ouvrez ensuite Lexia depuis sa nouvelle icône.</span></div>
              </div>
              <div className={styles.actions}><button className={styles.primary} type="button" onClick={dismiss}>J’ai compris</button></div>
            </>
          )}

          {mode === "notifications" && (
            <>
              <div className={styles.notice}>Sur iPhone, Apple demande que l’autorisation soit déclenchée par votre appui sur le bouton ci-dessous.</div>
              <div className={styles.actions}>
                <button className={styles.primary} type="button" onClick={activateNotifications}>Autoriser les notifications</button>
                <button className={styles.secondary} type="button" onClick={dismiss}>Plus tard</button>
              </div>
            </>
          )}

          {mode === "working" && (
            <div className={styles.actions}><button className={styles.primary} type="button" disabled>Activation en cours…</button></div>
          )}

          {mode === "success" && (
            <>
              <div className={styles.success}><i>✓</i><span>{message}</span></div>
              <div className={styles.actions}><button className={styles.primary} type="button" onClick={() => setMode("hidden")}>Terminer</button></div>
            </>
          )}

          {mode === "error" && (
            <>
              <div className={styles.error}>{message}</div>
              <div className={styles.actions}>
                <button className={styles.primary} type="button" onClick={activateNotifications}>Réessayer</button>
                <button className={styles.secondary} type="button" onClick={dismiss}>Fermer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
