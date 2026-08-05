"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AccessTimeoutRecovery() {
  const pathname = usePathname();

  useEffect(() => {
    // L’administration possède désormais sa propre récupération de session.
    // Ce secours reste actif pour l’espace client historique.
    const protectedRoute = pathname.startsWith("/tableau-de-bord");
    if (!protectedRoute) return;

    const recoveryKey = `lexia_access_recovery:${pathname}`;
    const timer = window.setTimeout(() => {
      const blockedLoader = document.querySelector(".app-loading");
      if (!blockedLoader) {
        window.sessionStorage.removeItem(recoveryKey);
        return;
      }

      if (!window.sessionStorage.getItem(recoveryKey)) {
        window.sessionStorage.setItem(recoveryKey, "1");
        window.location.reload();
        return;
      }

      window.sessionStorage.removeItem(recoveryKey);
      const redirect = encodeURIComponent(`${pathname}${window.location.search}`);
      window.location.replace(`/connexion?redirect=${redirect}&recovery=1`);
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
