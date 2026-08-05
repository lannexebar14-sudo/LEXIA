"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";
import { AppRole, isAppRole } from "../../lib/roles";

function allowedDestination(role: AppRole, pathname: string) {
  if (role === "admin") return pathname;

  if (role === "juriste" || role === "avocat") {
    if (pathname.startsWith("/administration/mes-dossiers") || pathname.startsWith("/administration/messages")) return pathname;
    return "/administration/mes-dossiers";
  }

  if (role === "developpeur") {
    if (
      pathname.startsWith("/administration/utilisateurs")
      || pathname.startsWith("/administration/parametres")
      || pathname.startsWith("/administration/prestations")
      || pathname.startsWith("/administration/emails")
    ) return pathname;
    return "/administration/utilisateurs";
  }

  return "/tableau-de-bord";
}

function configureSidebar(role: AppRole, pathname: string) {
  document.querySelectorAll<HTMLElement>(".admin-sidebar nav").forEach((nav) => {
    let rolesLink = nav.querySelector<HTMLAnchorElement>('a[data-lexia-roles-link="true"]');
    if (!rolesLink && (role === "admin" || role === "developpeur")) {
      rolesLink = document.createElement("a");
      rolesLink.href = "/administration/utilisateurs";
      rolesLink.textContent = "♟ Utilisateurs & rôles";
      rolesLink.dataset.lexiaRolesLink = "true";
      const settingsLink = nav.querySelector<HTMLAnchorElement>('a[href="/administration/parametres"]');
      if (settingsLink) nav.insertBefore(rolesLink, settingsLink);
      else nav.appendChild(rolesLink);
    }

    nav.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      let visible = true;

      if (role === "juriste" || role === "avocat") {
        visible = href === "/administration/dossiers"
          || href === "/administration/mes-dossiers"
          || href.startsWith("/administration/messages");
        if (href === "/administration/dossiers") {
          link.href = "/administration/mes-dossiers";
          link.textContent = "▣ Mes dossiers";
        }
      } else if (role === "developpeur") {
        visible = href.startsWith("/administration/utilisateurs")
          || href.startsWith("/administration/parametres")
          || href.startsWith("/administration/prestations")
          || href.startsWith("/administration/emails");
      }

      link.style.display = visible ? "" : "none";
      if (href.startsWith("/administration/utilisateurs")) {
        link.classList.toggle("active", pathname.startsWith("/administration/utilisateurs"));
      }
    });
  });
}

export default function RoleBasedAdminAccess() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!pathname.startsWith("/administration")) return;
    let active = true;
    let observer: MutationObserver | null = null;

    async function applyAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        window.location.replace(`/connexion?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      const role: AppRole = isAppRole(profile?.role) ? profile.role : "client";
      const destination = allowedDestination(role, pathname);
      if (destination !== pathname) {
        window.location.replace(destination);
        return;
      }

      configureSidebar(role, pathname);
      observer = new MutationObserver(() => configureSidebar(role, pathname));
      observer.observe(document.body, { childList: true, subtree: true });
    }

    void applyAccess();
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [pathname, supabase]);

  return null;
}
