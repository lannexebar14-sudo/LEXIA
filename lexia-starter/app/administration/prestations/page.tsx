"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "../admin-console.css";

type Service = {
  id: string;
  icon: string;
  category: string;
  title: string;
  short_title: string;
  price: number | string;
  description: string;
  includes: string[];
  badge: string | null;
  qualified_professional: boolean;
  active: boolean;
  sort_order: number;
};

type ServiceForm = {
  id: string;
  icon: string;
  category: string;
  title: string;
  shortTitle: string;
  price: string;
  description: string;
  includes: string;
  badge: string;
  qualifiedProfessional: boolean;
  active: boolean;
  sortOrder: string;
};

const emptyForm: ServiceForm = {
  id: "",
  icon: "⚖",
  category: "Analyse",
  title: "",
  shortTitle: "",
  price: "29.00",
  description: "",
  includes: "",
  badge: "",
  qualifiedProfessional: true,
  active: true,
  sortOrder: "80",
};

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value));
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export default function AdminPrestationsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");

      await loadServices();
      setLoading(false);
    }

    loadPage();
  }, [router, supabase]);

  async function loadServices() {
    const { data, error } = await supabase
      .from("service_catalog")
      .select("id,icon,category,title,short_title,price,description,includes,badge,qualified_professional,active,sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      setNotice("Impossible de charger les prestations.");
      return;
    }
    setServices((data as Service[]) || []);
  }

  const filteredServices = services.filter((service) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [service.title, service.short_title, service.category, service.description]
      .some((value) => value.toLowerCase().includes(search));
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? service.active : !service.active);
    return matchesQuery && matchesStatus;
  });

  const activeCount = services.filter((service) => service.active).length;
  const averagePrice = services.length
    ? services.reduce((total, service) => total + Number(service.price), 0) / services.length
    : 0;

  function openCreateForm() {
    const nextOrder = services.length ? Math.max(...services.map((service) => service.sort_order)) + 10 : 10;
    setForm({ ...emptyForm, sortOrder: String(nextOrder) });
    setShowForm(true);
  }

  function openEditForm(service: Service) {
    setForm({
      id: service.id,
      icon: service.icon,
      category: service.category,
      title: service.title,
      shortTitle: service.short_title,
      price: Number(service.price).toFixed(2),
      description: service.description,
      includes: (service.includes || []).join("\n"),
      badge: service.badge || "",
      qualifiedProfessional: service.qualified_professional,
      active: service.active,
      sortOrder: String(service.sort_order),
    });
    setShowForm(true);
  }

  function updateForm<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    const id = form.id || createSlug(form.shortTitle || form.title);
    const payload = {
      id,
      icon: form.icon.trim() || "⚖",
      category: form.category,
      title: form.title.trim(),
      short_title: (form.shortTitle || form.title).trim(),
      price: Number(form.price),
      description: form.description.trim(),
      includes: form.includes.split("\n").map((item) => item.trim()).filter(Boolean),
      badge: form.badge.trim() || null,
      qualified_professional: form.qualifiedProfessional,
      active: form.active,
      sort_order: Number(form.sortOrder) || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("service_catalog").upsert(payload, { onConflict: "id" });
    setSaving(false);

    if (error) {
      setNotice(`Enregistrement impossible : ${error.message}`);
      return;
    }

    await loadServices();
    setShowForm(false);
    setNotice(form.id ? "La prestation a été modifiée." : "La nouvelle prestation a été créée.");
  }

  async function toggleService(service: Service) {
    const { error } = await supabase
      .from("service_catalog")
      .update({ active: !service.active, updated_at: new Date().toISOString() })
      .eq("id", service.id);

    if (error) {
      setNotice("Le statut n’a pas pu être modifié.");
      return;
    }

    setServices((current) => current.map((item) => item.id === service.id ? { ...item, active: !item.active } : item));
    setNotice(!service.active ? "La prestation est maintenant visible pour les clients." : "La prestation a été masquée du catalogue client.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement des prestations…</main>;

  return (
    <main className="admin-app">
      <AdminSidebar active="prestations" onLogout={logout} />

      <section className="admin-main console-main">
        <header className="console-hero">
          <div>
            <small>CATALOGUE COMMERCIAL</small>
            <h1>Prestations</h1>
            <p>Gérez les services proposés, leurs tarifs et leur visibilité dans l’espace client.</p>
          </div>
          <button className="console-primary" onClick={openCreateForm}>＋ Ajouter une prestation</button>
        </header>

        {notice && <div className="console-notice">{notice}</div>}

        <section className="console-stats">
          <article><span>Prestations créées</span><strong>{services.length}</strong><small>Catalogue complet</small></article>
          <article><span>Actives</span><strong>{activeCount}</strong><small>Visibles par les clients</small></article>
          <article><span>Masquées</span><strong>{services.length - activeCount}</strong><small>Non proposées</small></article>
          <article><span>Prix moyen</span><strong>{formatPrice(averagePrice)}</strong><small>Hors ouverture du dossier</small></article>
        </section>

        <section className="console-panel catalog-panel">
          <div className="console-panel-head">
            <div><small>OFFRES PAYANTES</small><h2>Catalogue des prestations</h2></div>
            <span className="console-count">{filteredServices.length}</span>
          </div>

          <div className="catalog-toolbar">
            <label className="catalog-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une prestation…" /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Masquées</option>
            </select>
          </div>

          <div className="service-admin-grid">
            {filteredServices.map((service) => (
              <article key={service.id} className={`service-admin-card ${service.active ? "" : "inactive"}`}>
                <div className="service-admin-top">
                  <span className="service-admin-icon">{service.icon}</span>
                  <div className="service-admin-heading">
                    <div><span>{service.category}</span>{service.badge && <em>{service.badge}</em>}</div>
                    <h3>{service.title}</h3>
                  </div>
                  <strong>{formatPrice(service.price)}</strong>
                </div>
                <p>{service.description}</p>
                <ul>{(service.includes || []).map((item) => <li key={item}>{item}</li>)}</ul>
                <div className="service-admin-footer">
                  <button className={`status-button ${service.active ? "active" : ""}`} onClick={() => toggleService(service)}>
                    <i /> {service.active ? "Active" : "Masquée"}
                  </button>
                  <span>{service.qualified_professional ? "Validation professionnelle requise" : "Service standard"}</span>
                  <button className="edit-button" onClick={() => openEditForm(service)}>Modifier</button>
                </div>
              </article>
            ))}
          </div>

          {filteredServices.length === 0 && <div className="console-empty"><span>€</span><b>Aucune prestation ne correspond à la recherche.</b></div>}
        </section>
      </section>

      {showForm && (
        <div className="console-modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="console-modal service-modal" onSubmit={saveService} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="console-modal-close" onClick={() => setShowForm(false)}>×</button>
            <small>{form.id ? "MODIFIER L’OFFRE" : "NOUVELLE OFFRE"}</small>
            <h2>{form.id ? "Modifier la prestation" : "Créer une prestation"}</h2>
            <p>Le prix et le statut seront immédiatement utilisés dans le catalogue.</p>

            <div className="service-form-grid">
              <label>Icône<input value={form.icon} onChange={(event) => updateForm("icon", event.target.value)} maxLength={3} /></label>
              <label>Catégorie<select value={form.category} onChange={(event) => updateForm("category", event.target.value)}><option>Analyse</option><option>Échange</option><option>Rédaction</option><option>Transmission</option><option>Autre</option></select></label>
              <label className="wide">Titre complet<input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Ex. Rédaction d’un courrier juridique" /></label>
              <label>Nom court<input required value={form.shortTitle} onChange={(event) => updateForm("shortTitle", event.target.value)} /></label>
              <label>Prix TTC (€)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateForm("price", event.target.value)} /></label>
              <label>Badge facultatif<input value={form.badge} onChange={(event) => updateForm("badge", event.target.value)} placeholder="Recommandée" /></label>
              <label>Ordre d’affichage<input type="number" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", event.target.value)} /></label>
              <label className="wide">Description<textarea required rows={4} value={form.description} onChange={(event) => updateForm("description", event.target.value)} /></label>
              <label className="wide">Éléments inclus <small>Un élément par ligne</small><textarea rows={5} value={form.includes} onChange={(event) => updateForm("includes", event.target.value)} /></label>
            </div>

            <div className="service-form-switches">
              <label><input type="checkbox" checked={form.active} onChange={(event) => updateForm("active", event.target.checked)} /><span><b>Prestation active</b><small>Visible et proposée aux clients</small></span></label>
              <label><input type="checkbox" checked={form.qualifiedProfessional} onChange={(event) => updateForm("qualifiedProfessional", event.target.checked)} /><span><b>Validation professionnelle</b><small>Réservée à un professionnel habilité</small></span></label>
            </div>

            <div className="console-modal-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer la prestation"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}

function AdminSidebar({ active, onLogout }: { active: string; onLogout: () => void }) {
  return <aside className="admin-sidebar">
    <Link href="/" className="admin-logo">LEXIA<span>.</span></Link>
    <div className="admin-badge">ADMINISTRATION</div>
    <nav>
      <Link href="/administration">◫ Vue d’ensemble</Link>
      <Link href="/administration/dossiers">▣ Dossiers</Link>
      <Link href="/administration/messages">✉ Messagerie</Link>
      <Link href="/administration/clients">♙ Clients</Link>
      <Link href="/administration/juristes">⚖ Juristes</Link>
      <Link className={active === "prestations" ? "active" : ""} href="/administration/prestations">€ Prestations</Link>
      <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
      <Link className={active === "parametres" ? "active" : ""} href="/administration/parametres">⚙ Paramètres</Link>
    </nav>
    <button onClick={onLogout}>Se déconnecter</button>
  </aside>;
}
