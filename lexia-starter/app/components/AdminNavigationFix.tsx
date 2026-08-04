"use client";

import { useEffect } from "react";

export default function AdminNavigationFix() {
  useEffect(() => {
    function handleAdminLogoClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const logo = target.closest(".admin-sidebar .admin-logo");
      if (!logo) return;

      event.preventDefault();
      window.location.assign("/administration");
    }

    document.addEventListener("click", handleAdminLogoClick, true);
    return () => document.removeEventListener("click", handleAdminLogoClick, true);
  }, []);

  return null;
}
