"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";
import { AppRole, isAppRole } from "../../lib/roles";

const ROLE_CACHE_KEY = "lexia_current_role_v1";

function allowedDestination(role: AppRole, pathname: string) {
  if (role === "admin") return pathname;

  if (role === "juriste" || role === "avocat") {
    if (pathname.startsWith("/administration/mes-dossiers") || pathname.startsWith("/administration/mes-messages")) return pathname;
    return "/administration/mes-dossiers";
  }

  if (role === "developpeur") {
    if (pathname.startsWith("/administration/utilisateurs") || pathname.startsWith("/administration/developpement")) return pathname;
    return "/administration/developpement";
  }

  return "/tableau-de-bord";
}

function configureSidebar(role: AppRole, pathname: string) {
  const sidebars = document.querySelectorAll<HTMLElement>(".admin-sidebar nav");
  if (sidebars.length === 0) return false;

  sidebars.forEach((nav) => {
    let rolesLink = nav.querySelector<HTMLAnchorElement>('a[href="/administration/utilisateurs"]');
    if (!rolesLink && (role === "admin" || role === "developpeur")) {
      rolesLink = document.createElement("a");
      rolesLink.href = "/administration/utilisateurs";
      rolesLink.textContent = "♟ Utilisateurs & rôles";
      const settingsLink = nav.querySelector<HTMLAnchorElement>('a[href="/administration/parametres"]');
      if (settingsLink) nav.insertBefore(rolesLink, settingsLink);
      else nav.appendChild(rolesLink);
    }
    if (rolesLink) rolesLink.dataset.lexiaRolesLink = "true";

    let developerLink = nav.querySelector<HTMLAnchorElement>('a[href="/administration/developpement"]');
    if (!developerLink && role === "developpeur") {
      developerLink = document.createElement("a");
      developerLink.href = "/administration/developpement";
      developerLink.textContent = "⌘ Centre technique";
      nav.insertBefore(developerLink, nav.firstChild);
    }

    nav.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      let visible = true;

      if (role === "juriste" || role === "avocat") {
        visible = href === "/administration/dossiers"
          || href === "/administration/mes-dossiers"
          || href.startsWith("/administration/messages")
          || href.startsWith("/administration/mes-messages");
        if (href === "/administration/dossiers") {
          link.href = "/administration/mes-dossiers";
          link.textContent = "▣ Mes dossiers";
        }
        if (href.startsWith("/administration/messages")) {
          link.href = "/administration/mes-messages";
          link.textContent = "✉ Ma messagerie";
        }
      } else if (role === "developpeur") {
        visible = href.startsWith("/administration/utilisateurs") || href.startsWith("/administration/developpement");
      }

      link.hidden = !visible;
      if (href.startsWith("/administration/utilisateurs")) {
        link.classList.toggle("active", pathname.startsWith("/administration/utilisateurs"));
      }
      if (href.startsWith("/administration/developpement")) {
        link.classList.toggle("active", pathname.startsWith("/administration/developpement"));
      }
    });
  });

  return true;
}

export default function RoleBasedAdminAccess() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!pathname.startsWith("/administration")) return;

    let active = true;
    let observer: MutationObserver | null = null;

    const cachedValue = window.sessionStorage.getItem(ROLE_CACHE_KEY);
    const cachedRole = isAppRole(cachedValue) ? cachedValue : null;
    if (cachedRole) configureSidebar(cachedRole, pathname);

    async function applyAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session?.user) {
        window.sessionStorage.removeItem(ROLE_CACHE_KEY);
        router.replace(`/connexion?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const { data: context, error } = await supabase
        .rpc("get_my_access_context")
        .maybeSingle();

      if (!active) return;

      const role: AppRole = !error && isAppRole(context?.role)
        ? context.role
        : cachedRole || "client";

      window.sessionStorage.setItem(ROLE_CACHE_KEY, role);

      const destination = allowedDestination(role, pathname);
      if (destination !== pathname) {
        router.replace(destination);
        return;
      }

      if (configureSidebar(role, pathname)) return;

      observer = new MutationObserver(() => {
        if (!configureSidebar(role, pathname)) return;
        observer?.disconnect();
        observer = null;
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    void applyAccess();

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [pathname, router, supabase]);

  return null;
}
