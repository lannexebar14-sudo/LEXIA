"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "./juristes.css";

type Specialist = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  city: string | null;
  postal_code: string | null;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialty: "",
  city: "",
  postalCode: "",
  bio: "",
};

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || "photo";
}

export default function JuristesAdministrationPage() {
  const supabase = useMemo(() => createClient(), []);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.replace("/connexion?redirect=%2Fadministration%2Fjuristes");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "admin") {
        window.location.replace("/tableau-de-bord");
        return;
      }

      const { data, error: loadError } = await supabase
        .from("legal_specialists")
        .select("id,first_name,last_name,email,phone,specialty,city,postal_code,bio,photo_url,is_active,created_at")
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (loadError) setError("La liste des juristes n’a pas pu être chargée.");
      setSpecialists((data as Specialist[]) || []);
      setLoading(false);
    }

    void load();
    return () => { mounted = false; };
  }, [supabase]);

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("La photo doit être au format JPG, PNG ou WebP et faire moins de 5 Mo.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function addSpecialist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      let photoUrl: string | null = null;

      if (photo) {
        const path = `${crypto.randomUUID()}-${safeFileName(photo.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("specialist-photos")
          .upload(path, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw new Error("La photo n’a pas pu être envoyée.");
        photoUrl = supabase.storage.from("specialist-photos").getPublicUrl(path).data.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from("legal_specialists")
        .insert({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          specialty: form.specialty.trim() || null,
          city: form.city.trim() || null,
          postal_code: form.postalCode.trim() || null,
          bio: form.bio.trim() || null,
          photo_url: photoUrl,
          is_active: true,
        })
        .select("id,first_name,last_name,email,phone,specialty,city,postal_code,bio,photo_url,is_active,created_at")
        .single();

      if (insertError) {
        if (insertError.code === "23505") throw new Error("Un juriste existe déjà avec cette adresse e-mail.");
        throw new Error("Le juriste n’a pas pu être ajouté.");
      }

      setSpecialists((current) => [data as Specialist, ...current]);
      setForm(emptyForm);
      setPhoto(null);
      setPhotoPreview("");
      setNotice("Le juriste a bien été ajouté.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(specialist: Specialist) {
    const { error: updateError } = await supabase
      .from("legal_specialists")
      .update({ is_active: !specialist.is_active, updated_at: new Date().toISOString() })
      .eq("id", specialist.id);

    if (updateError) {
      setError("Le statut du juriste n’a pas pu être modifié.");
      return;
    }

    setSpecialists((current) => current.map((item) => item.id === specialist.id ? { ...item, is_active: !item.is_active } : item));
  }

  async function removeSpecialist(specialist: Specialist) {
    if (!window.confirm(`Supprimer ${specialist.first_name} ${specialist.last_name} ?`)) return;
    const { error: deleteError } = await supabase.from("legal_specialists").delete().eq("id", specialist.id);
    if (deleteError) {
      setError("Le juriste n’a pas pu être supprimé.");
      return;
    }
    setSpecialists((current) => current.filter((item) => item.id !== specialist.id));
    setNotice("Le juriste a été supprimé.");
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link className="active" href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
      </aside>

      <section className="admin-main jurists-main">
        <header className="admin-topbar">
          <div>
            <small>ÉQUIPE JURIDIQUE</small>
            <h1>Gestion des juristes</h1>
            <p>Ajoutez manuellement les spécialistes qui interviennent sur LEXIA.</p>
          </div>
          <div className="jurists-count"><strong>{specialists.length}</strong><span>juriste{specialists.length > 1 ? "s" : ""}</span></div>
        </header>

        <div className="jurists-layout">
          <form className="jurist-form admin-card" onSubmit={addSpecialist}>
            <div className="admin-card-head"><div><small>NOUVEAU PROFIL</small><h2>Ajouter un juriste</h2></div></div>

            <label className="photo-picker">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
              {photoPreview ? <img src={photoPreview} alt="Aperçu du juriste" /> : <span>＋</span>}
              <div><b>Ajouter une photo</b><small>JPG, PNG ou WebP · 5 Mo maximum</small></div>
            </label>

            <div className="jurist-form-grid">
              <label>Prénom<input required value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} /></label>
              <label>Nom<input required value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} /></label>
              <label className="wide">Adresse e-mail<input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
              <label>Téléphone<input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
              <label>Spécialité<input placeholder="Ex. Droit du travail" value={form.specialty} onChange={(event) => updateField("specialty", event.target.value)} /></label>
              <label>Ville<input value={form.city} onChange={(event) => updateField("city", event.target.value)} /></label>
              <label>Code postal<input inputMode="numeric" value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} /></label>
              <label className="wide">Présentation<textarea rows={4} placeholder="Expérience, domaines d’intervention, disponibilités…" value={form.bio} onChange={(event) => updateField("bio", event.target.value)} /></label>
            </div>

            {error && <div className="jurist-message error">{error}</div>}
            {notice && <div className="jurist-message success">{notice}</div>}
            <button className="jurist-submit" type="submit" disabled={saving}>{saving ? "Ajout en cours…" : "Ajouter le juriste"}</button>
          </form>

          <section className="admin-card jurists-list-card">
            <div className="admin-card-head"><div><small>PROFILS ENREGISTRÉS</small><h2>Équipe LEXIA</h2></div></div>
            {loading ? (
              <div className="admin-empty"><b>Chargement des juristes…</b></div>
            ) : specialists.length === 0 ? (
              <div className="admin-empty"><b>Aucun juriste enregistré</b><p>Utilisez le formulaire pour créer le premier profil.</p></div>
            ) : (
              <div className="jurists-list">
                {specialists.map((specialist) => (
                  <article key={specialist.id} className={!specialist.is_active ? "inactive" : ""}>
                    <div className="jurist-avatar">
                      {specialist.photo_url ? <img src={specialist.photo_url} alt={`${specialist.first_name} ${specialist.last_name}`} /> : <span>{specialist.first_name[0]}{specialist.last_name[0]}</span>}
                    </div>
                    <div className="jurist-info">
                      <div className="jurist-name-row"><h3>{specialist.first_name} {specialist.last_name}</h3><em>{specialist.is_active ? "Actif" : "Désactivé"}</em></div>
                      <p>{specialist.specialty || "Spécialité non renseignée"}</p>
                      <div className="jurist-contact"><span>{specialist.email}</span>{specialist.phone && <span>{specialist.phone}</span>}{specialist.city && <span>{specialist.postal_code} {specialist.city}</span>}</div>
                      {specialist.bio && <small>{specialist.bio}</small>}
                    </div>
                    <div className="jurist-actions">
                      <button type="button" onClick={() => toggleActive(specialist)}>{specialist.is_active ? "Désactiver" : "Activer"}</button>
                      <button type="button" className="danger" onClick={() => removeSpecialist(specialist)}>Supprimer</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
