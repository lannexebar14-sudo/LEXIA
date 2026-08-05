"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminNavigationFix() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname.startsWith("/administration")) return;

    const mobileQuery = window.matchMedia("(max-width: 1050px)");
    let attempts = 0;

    function handleAdminLogoClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const logo = target.closest(".admin-sidebar .admin-logo");
      if (!logo) return;

      event.preventDefault();
      router.push("/administration");
    }

    function arrangeSidebar(sidebar: Element) {
      const nav = sidebar.querySelector(":scope > nav");
      const logoutButton = sidebar.querySelector(":scope > button, :scope > nav > button.admin-logout-button");
      if (!(nav instanceof HTMLElement) || !(logoutButton instanceof HTMLButtonElement)) return false;

      logoutButton.textContent = "Déconnexion";
      logoutButton.classList.add("admin-logout-button");
      logoutButton.setAttribute("aria-label", "Se déconnecter de l’administration");

      if (mobileQuery.matches) {
        if (logoutButton.parentElement !== nav) nav.appendChild(logoutButton);
      } else if (logoutButton.parentElement === nav) {
        sidebar.appendChild(logoutButton);
      }

      return true;
    }

    function arrangeAllSidebars() {
      const sidebars = document.querySelectorAll(".admin-app > .admin-sidebar");
      let arranged = false;
      sidebars.forEach((sidebar) => {
        arranged = arrangeSidebar(sidebar) || arranged;
      });
      return arranged;
    }

    function handleViewportChange() {
      arrangeAllSidebars();
    }

    document.addEventListener("click", handleAdminLogoClick, true);
    arrangeAllSidebars();

    const retryTimer = window.setInterval(() => {
      attempts += 1;
      const arranged = arrangeAllSidebars();
      if (arranged || attempts >= 100) window.clearInterval(retryTimer);
    }, 120);

    mobileQuery.addEventListener("change", handleViewportChange);

    return () => {
      window.clearInterval(retryTimer);
      document.removeEventListener("click", handleAdminLogoClick, true);
      mobileQuery.removeEventListener("change", handleViewportChange);
    };
  }, [pathname, router]);

  return null;
}
