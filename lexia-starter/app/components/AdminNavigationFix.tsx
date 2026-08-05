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

    function applyMobileLogoutStyle(button: HTMLButtonElement) {
      button.textContent = "Déconnexion";
      button.style.margin = "0";
      button.style.flex = "0 0 auto";
      button.style.width = "auto";
      button.style.height = "42px";
      button.style.minHeight = "42px";
      button.style.padding = "10px 14px";
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.position = "static";
      button.style.borderRadius = "12px";
      button.style.border = "1px solid #d4b66e";
      button.style.background = "#d4b66e";
      button.style.color = "#10243d";
      button.style.fontSize = "12px";
      button.style.fontWeight = "900";
      button.style.lineHeight = "1";
      button.style.whiteSpace = "nowrap";
      button.style.order = "999";
      button.style.cursor = "pointer";
      button.style.boxShadow = "0 6px 16px rgba(212, 182, 110, .22)";
    }

    function restoreDesktopLogoutStyle(button: HTMLButtonElement) {
      button.textContent = "Se déconnecter";
      button.removeAttribute("style");
    }

    function arrangeSidebar(sidebar: Element) {
      const nav = sidebar.querySelector(":scope > nav");
      const logoutButton = sidebar.querySelector(":scope > button, :scope > nav > button.admin-logout-button");
      if (!(nav instanceof HTMLElement) || !(logoutButton instanceof HTMLButtonElement)) return false;

      logoutButton.classList.add("admin-logout-button");
      logoutButton.setAttribute("aria-label", "Se déconnecter de l’administration");

      if (mobileQuery.matches) {
        applyMobileLogoutStyle(logoutButton);

        // appendChild déplace aussi un élément déjà présent : le bouton reste donc
        // toujours en dernière position, après E-mails et Paramètres.
        nav.appendChild(logoutButton);
        nav.scrollLeft = 0;
      } else {
        restoreDesktopLogoutStyle(logoutButton);
        if (logoutButton.parentElement === nav) sidebar.appendChild(logoutButton);
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

    const finalOrderTimer = window.setTimeout(arrangeAllSidebars, 900);
    mobileQuery.addEventListener("change", handleViewportChange);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(finalOrderTimer);
      document.removeEventListener("click", handleAdminLogoClick, true);
      mobileQuery.removeEventListener("change", handleViewportChange);
    };
  }, [pathname, router]);

  return null;
}
