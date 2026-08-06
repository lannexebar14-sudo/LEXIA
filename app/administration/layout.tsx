import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdmin2FACookieName, verifyAdmin2FAToken } from "@/lib/admin-2fa";

export default async function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?redirect=/administration");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/tableau-de-bord");

  const token = cookies().get(getAdmin2FACookieName())?.value;
  if (!verifyAdmin2FAToken(user.id, token)) redirect("/verification-admin");

  return children;
}
