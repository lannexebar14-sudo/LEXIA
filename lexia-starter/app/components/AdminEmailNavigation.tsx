"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminEmailNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/administration")) return;

    function installLink() {
      const nav = document.querySelector<HTMLElement>(".admin-sidebar nav");
      if (!nav) return;

      let emailLink = nav.querySelector<HTMLAnchorElement>("a[data-lexia-email-link]");
      if (!emailLink) {
        emailLink = document.createElement("a");
        emailLink.href = "/administration/emails";
        emailLink.textContent = "＠ E-mails";
        emailLink.dataset.lexiaEmailLink = "true";

        const settingsLink = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a"))
          .find((link) => link.getAttribute("href") === "/administration/parametres");
        if (settingsLink) nav.insertBefore(emailLink, settingsLink);
        else nav.appendChild(emailLink);
      }

      emailLink.classList.toggle("active", pathname === "/administration/emails");
      if (pathname !== "/administration/emails") {
        const currentActive = nav.querySelector<HTMLAnchorElement>("a.active:not([data-lexia-email-link])");
        if (currentActive) emailLink.classList.remove("active");
      }
    }

    installLink();
    const observer = new MutationObserver(installLink);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
