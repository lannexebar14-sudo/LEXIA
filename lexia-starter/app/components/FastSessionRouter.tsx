"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";
import { AppRole, isAppRole } from "../../lib/roles";

const ROLE_CACHE_KEY = "lexia_current_role_v1";

function destinationForRole(role: AppRole) {
  if (role === "admin") return "/administration";
  if (role === "juriste" || role === "avocat") return "/administration/mes-dossiers";
  if (role === "developpeur") return "/administration/utilisateurs";
  return "/tableau-de-bord";
}

export default function FastSessionRouter() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (pathname !== "/tableau-de-bord" && pathname !== "/connexion") return;

    let active = true;
    const cachedValue = window.sessionStorage.getItem(ROLE_CACHE_KEY);
    const cachedRole = isAppRole(cachedValue) ? cachedValue : null;

    if (pathname === "/tableau-de-bord" && cachedRole && cachedRole !== "client") {
      router.replace(destinationForRole(cachedRole));
    }

    async function resolveSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session?.user) {
        window.sessionStorage.removeItem(ROLE_CACHE_KEY);
        if (pathname === "/tableau-de-bord") router.replace("/connexion");
        return;
      }

      const { data: context, error } = await supabase
        .rpc("get_my_access_context")
        .maybeSingle();

      if (!active || error || !isAppRole(context?.role)) return;

      const role = context.role;
      window.sessionStorage.setItem(ROLE_CACHE_KEY, role);
      const destination = destinationForRole(role);

      if (pathname === "/connexion" || destination !== pathname) {
        router.replace(destination);
      }
    }

    void resolveSession();
    return () => {
      active = false;
    };
  }, [pathname, router, supabase]);

  return null;
}
