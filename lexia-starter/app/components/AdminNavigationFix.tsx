"use client";

import { useEffect } from "react";

export default function AdminNavigationFix() {
  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 1050px)");

    function handleAdminLogoClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const logo = target.closest(".admin-sidebar .admin-logo");
      if (!logo) return;

      event.preventDefault();
      window.location.assign("/administration");
    }

    function arrangeSidebar(sidebar: Element) {
      const nav = sidebar.querySelector(":scope > nav");
      const logoutButton = sidebar.querySelector(":scope > button, :scope > nav > button.admin-logout-button");
      if (!(nav instanceof HTMLElement) || !(logoutButton instanceof HTMLButtonElement)) return;

      logoutButton.textContent = "Déconnexion";
      logoutButton.classList.add("admin-logout-button");
      logoutButton.setAttribute("aria-label", "Se déconnecter de l’administration");

      if (mobileQuery.matches) {
        if (logoutButton.parentElement !== nav) nav.appendChild(logoutButton);
      } else if (logoutButton.parentElement === nav) {
        sidebar.appendChild(logoutButton);
      }
    }

    function arrangeAllSidebars() {
      document.querySelectorAll(".admin-app > .admin-sidebar").forEach(arrangeSidebar);
    }

    document.addEventListener("click", handleAdminLogoClick, true);
    arrangeAllSidebars();

    const observer = new MutationObserver(arrangeAllSidebars);
    observer.observe(document.body, { childList: true, subtree: true });
    mobileQuery.addEventListener("change", arrangeAllSidebars);

    return () => {
      document.removeEventListener("click", handleAdminLogoClick, true);
      mobileQuery.removeEventListener("change", arrangeAllSidebars);
      observer.disconnect();
    };
  }, []);

  return null;
}
