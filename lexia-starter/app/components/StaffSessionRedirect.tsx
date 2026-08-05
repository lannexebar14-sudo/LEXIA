"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";
import { AppRole, isAppRole } from "../../lib/roles";

function destinationForRole(role: AppRole) {
  if (role === "admin") return "/administration";
  if (role === "juriste" || role === "avocat") return "/administration/mes-dossiers";
  if (role === "developpeur") return "/administration/utilisateurs";
  return null;
}

export default function StaffSessionRedirect() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!pathname.startsWith("/tableau-de-bord")) return;
    let active = true;

    async function redirectStaff() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      const role: AppRole = isAppRole(profile?.role) ? profile.role : "client";
      const destination = destinationForRole(role);
      if (destination) window.location.replace(destination);
    }

    void redirectStaff();
    return () => { active = false; };
  }, [pathname, supabase]);

  return null;
}
