"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function message(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(formData: FormData) {
  const email = message(formData.get("email")).toLowerCase();
  const password = message(formData.get("password"));

  if (!email || !password) {
    redirect("/connexion?erreur=Veuillez%20remplir%20tous%20les%20champs");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/connexion?erreur=${encodeURIComponent("Adresse e-mail ou mot de passe incorrect")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(profile?.role === "admin" ? "/administration" : "/tableau-de-bord");
}

export async function signUp(formData: FormData) {
  const fullName = message(formData.get("full_name"));
  const email = message(formData.get("email")).toLowerCase();
  const password = message(formData.get("password"));
  const accountType = message(formData.get("account_type")) === "professionnel" ? "professionnel" : "particulier";
  const companyName = message(formData.get("company_name"));
  const siret = message(formData.get("siret"));

  if (!fullName || !email || password.length < 8) {
    redirect(`/inscription?erreur=${encodeURIComponent("Renseignez votre nom, votre e-mail et un mot de passe de 8 caractères minimum")}`);
  }

  if (accountType === "professionnel" && !siret) {
    redirect(`/inscription?erreur=${encodeURIComponent("Le numéro SIRET est requis pour un compte professionnel")}`);
  }

  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        account_type: accountType,
        company_name: companyName || null,
        siret: siret || null,
      },
    },
  });

  if (error) {
    redirect(`/inscription?erreur=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(`/connexion?message=${encodeURIComponent("Compte créé. Vérifiez votre boîte e-mail avant de vous connecter.")}`);
  }

  redirect("/tableau-de-bord");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
