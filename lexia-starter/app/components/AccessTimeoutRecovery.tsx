"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AccessTimeoutRecovery() {
  const pathname = usePathname();

  useEffect(() => {
    const protectedRoute = pathname.startsWith("/administration") || pathname.startsWith("/tableau-de-bord");
    if (!protectedRoute) return;

    const timer = window.setTimeout(() => {
      const blockedLoader = document.querySelector(".admin-loading, .app-loading");
      if (!blockedLoader) return;

      const redirect = encodeURIComponent(`${pathname}${window.location.search}`);
      window.location.replace(`/connexion?redirect=${redirect}&recovery=1`);
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
