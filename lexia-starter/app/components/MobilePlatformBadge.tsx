"use client";

import styles from "./MobilePlatformBadge.module.css";

export default function MobilePlatformBadge() {
  function openApplicationPanel() {
    window.dispatchEvent(new Event("lexia-open-app-prompt"));
  }

  return (
    <>
      <span className={styles.spacer} aria-hidden="true" />
      <button
        type="button"
        className={styles.bar}
        onClick={openApplicationPanel}
        aria-label="Installer l’application Lexia sur iOS ou Android"
      >
        <span className={styles.logo}>LEXIA<span>.</span></span>

        <span className={styles.copy}>
          <strong>Disponible sur iOS et Android</strong>
          <small>Installer l’application</small>
        </span>

        <span className={styles.platforms} aria-hidden="true">
          <span className={styles.platform}>
            <svg viewBox="0 0 24 24" role="img">
              <path d="M16.7 12.9c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-1-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-3-1.2-3-4Zm-2.6-7.4c.7-.9 1.2-2.1 1.1-3.3-1.1 0-2.4.7-3.2 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.5-.6 3.2-1.4Z" />
            </svg>
            <b>iOS</b>
          </span>

          <span className={styles.platform}>
            <svg viewBox="0 0 24 24" role="img">
              <path d="m7.1 7.4-1.5-2.6.8-.5 1.6 2.8a9 9 0 0 1 8 0l1.6-2.8.8.5-1.5 2.6A6.8 6.8 0 0 1 20 13H4a6.8 6.8 0 0 1 3.1-5.6ZM8 10.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM4 14h16v5.5a1.5 1.5 0 0 1-1.5 1.5H17v2h-2v-2H9v2H7v-2H5.5A1.5 1.5 0 0 1 4 19.5V14Z" />
            </svg>
            <b>Android</b>
          </span>
        </span>
      </button>
    </>
  );
}
