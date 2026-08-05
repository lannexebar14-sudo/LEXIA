"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ADMIN_ROUTES = [
  "/administration",
  "/administration/dossiers",
  "/administration/messages",
  "/administration/clients",
  "/administration/juristes",
  "/administration/prestations",
  "/administration/avocats",
  "/administration/emails",
  "/administration/parametres",
  "/administration/utilisateurs",
] as const;

export default function AdminEmailNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname.startsWith("/administration")) return;

    let stopped = false;
    let attempts = 0;

    ADMIN_ROUTES.forEach((route) => router.prefetch(route));

    function installLinks() {
      const navs = document.querySelectorAll<HTMLElement>(".admin-sidebar nav");
      if (navs.length === 0) return false;

      navs.forEach((nav) => {
        let emailLink = nav.querySelector<HTMLAnchorElement>('a[href="/administration/emails"]');

        if (!emailLink) {
          emailLink = document.createElement("a");
          emailLink.href = "/administration/emails";
          emailLink.textContent = "＠ E-mails";
          emailLink.dataset.lexiaEmailLink = "true";

          const settingsLink = nav.querySelector<HTMLAnchorElement>('a[href="/administration/parametres"]');
          if (settingsLink) nav.insertBefore(emailLink, settingsLink);
          else nav.appendChild(emailLink);
        }

        emailLink.dataset.lexiaEmailLink = "true";
        emailLink.classList.toggle("active", pathname === "/administration/emails");
      });

      return true;
    }

    function handleNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(".admin-sidebar nav a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href?.startsWith("/administration")) return;

      event.preventDefault();
      if (href === pathname) return;
      router.push(href);
    }

    installLinks();
    const retryTimer = window.setInterval(() => {
      attempts += 1;
      const installed = installLinks();
      if (stopped || installed || attempts >= 100) window.clearInterval(retryTimer);
    }, 120);

    document.addEventListener("click", handleNavigation, true);

    return () => {
      stopped = true;
      window.clearInterval(retryTimer);
      document.removeEventListener("click", handleNavigation, true);
    };
  }, [pathname, router]);

  return null;
}
