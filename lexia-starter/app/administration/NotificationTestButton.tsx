"use client";

import { useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./NotificationTestButton.module.css";

type BroadcastResult = {
  sent?: number;
  removed?: number;
  devices?: number;
  recipients?: number;
  failedRecipients?: number;
  message?: string;
  error?: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function NotificationTestButton() {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function openConfirmation() {
    setFeedback(null);
    setStep(1);
  }

  function closeConfirmation() {
    if (sending) return;
    setStep(0);
  }

  async function sendTestNotification() {
    setSending(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke<BroadcastResult>("broadcast-push", {
        body: {
          confirmation: "ENVOYER_A_TOUS",
          secondConfirmation: "JE_CONFIRME_L_ENVOI",
        },
      });

      if (error) throw new Error(error.message || "L’envoi a échoué.");
      if (data?.error) throw new Error(data.error);

      const sent = Number(data?.sent || 0);
      const recipients = Number(data?.recipients || 0);
      const devices = Number(data?.devices || 0);
      const failedRecipients = Number(data?.failedRecipients || 0);

      if (devices === 0) {
        setFeedback({
          type: "error",
          message: data?.message || "Aucun appareil n’a encore activé les notifications Lexia.",
        });
      } else if (sent === 0) {
        setFeedback({
          type: "error",
          message: "Aucune notification n’a pu être livrée. Vérifiez les appareils inscrits.",
        });
      } else {
        const failedText = failedRecipients > 0
          ? ` ${failedRecipients} destinataire(s) n’ont pas pu être joints.`
          : "";
        setFeedback({
          type: "success",
          message: `Notification test envoyée à ${sent} appareil(s), pour ${recipients} utilisateur(s).${failedText}`,
        });
      }

      setStep(0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "L’envoi groupé est impossible pour le moment.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button type="button" className={styles.testButton} onClick={openConfirmation}>
        <span aria-hidden="true">🔔</span>
        Notification test
      </button>

      {feedback && (
        <div className={`${styles.feedback} ${feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`} role="status">
          <span>{feedback.type === "success" ? "✓" : "!"}</span>
          <p>{feedback.message}</p>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Fermer le message">×</button>
        </div>
      )}

      {step > 0 && (
        <div className={styles.overlay} role="presentation" onMouseDown={closeConfirmation}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-test-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              onClick={closeConfirmation}
              disabled={sending}
              aria-label="Fermer"
            >
              ×
            </button>

            <div className={styles.modalIcon} aria-hidden="true">🔔</div>
            <small>CONFIRMATION {step} SUR 2</small>

            {step === 1 ? (
              <>
                <h2 id="notification-test-title">Envoyer une notification test à tous ?</h2>
                <p>
                  Tous les utilisateurs ayant installé Lexia et autorisé les notifications recevront immédiatement un message test.
                </p>
                <div className={styles.warning}>
                  <b>Premier contrôle</b>
                  <span>Aucun envoi ne sera effectué à cette étape.</span>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.secondary} onClick={closeConfirmation}>Annuler</button>
                  <button type="button" className={styles.primary} onClick={() => setStep(2)}>Continuer</button>
                </div>
              </>
            ) : (
              <>
                <h2 id="notification-test-title">Dernière confirmation</h2>
                <p>
                  L’envoi sera immédiat sur tous les appareils inscrits et sera conservé dans le suivi de transparence des clients.
                </p>
                <div className={`${styles.warning} ${styles.danger}`}>
                  <b>Action groupée</b>
                  <span>Confirmez uniquement si vous souhaitez réellement prévenir tous les utilisateurs.</span>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.secondary} onClick={() => setStep(1)} disabled={sending}>Retour</button>
                  <button type="button" className={styles.dangerButton} onClick={sendTestNotification} disabled={sending}>
                    {sending ? "Envoi en cours…" : "Confirmer l’envoi à tous"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
