import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./mobile-polish.css";
import "./session-polish.css";
import "./administration/mobile-header.css";
import "./administration/dashboard-polish.css";
import "./tableau-de-bord/client-mobile-header.css";
import "./nouveau-dossier/stripe-checkout.css";
import "./nouveau-dossier/mobile-header-fix.css";
import "./payment-enforcement.css";
import "./ui-corrections.css";
import "./mobile-home-alignment.css";
import "./h24-specialists.css";
import "./remove-founder-section.css";
import LiveSupport from "./components/LiveSupport";
import PwaExperience from "./components/PwaExperience";
import MaintenanceGateV2 from "./components/MaintenanceGateV2";
import AdminNavigationFix from "./components/AdminNavigationFix";
import AdminEmailNavigation from "./components/AdminEmailNavigation";
import AccessTimeoutRecovery from "./components/AccessTimeoutRecovery";
import ClientCaseConversationMount from "./components/ClientCaseConversationMount";
import RoleBasedAdminAccess from "./components/RoleBasedAdminAccess";
import FastSessionRouter from "./components/FastSessionRouter";
import CaseDraftSync from "./components/CaseDraftSync";
import H24SpecialistsHighlight from "./components/H24SpecialistsHighlight";

const SITE_URL = "https://lexiafrance.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LEXIA France | Assistance juridique en ligne 24h/24 et 7j/7",
    template: "%s | LEXIA France",
  },
  description: "LEXIA France accompagne particuliers et professionnels en ligne : assistance juridique, analyse de dossier, résolution amiable, impayés, documents et orientation vers les démarches adaptées.",
  keywords: ["LEXIA France", "assistance juridique en ligne", "aide juridique en ligne", "juriste en ligne", "résolution amiable litige", "recouvrement amiable impayé", "facture impayée", "litige logement", "droit du travail", "droit de la famille", "litige consommation", "conseil juridique en ligne"],
  applicationName: "LEXIA France",
  category: "legal services",
  alternates: { canonical: "/", languages: { "fr-FR": "/" } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "fr_FR", url: "/", siteName: "LEXIA France", title: "LEXIA France | Assistance juridique en ligne", description: "Assistance juridique en ligne, résolution amiable et accompagnement des impayés pour particuliers et professionnels." },
  twitter: { card: "summary", title: "LEXIA France | Assistance juridique en ligne", description: "Assistance juridique, dossiers, résolution amiable et impayés en ligne." },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "LEXIA", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#091d33" };

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "LEXIA France",
  alternateName: "LEXIA",
  url: SITE_URL,
  email: "contact@lexiafrance.fr",
  description: "Plateforme française d'assistance juridique en ligne pour particuliers et professionnels.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "LEXIA France",
  alternateName: "LEXIA",
  url: SITE_URL,
  inLanguage: "fr-FR",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Assistance juridique en ligne LEXIA France",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "Country", name: "France" },
  serviceType: "Assistance juridique en ligne, orientation juridique et résolution amiable",
  url: SITE_URL,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    <MaintenanceGateV2><FastSessionRouter /><CaseDraftSync /><H24SpecialistsHighlight /><Suspense fallback={null}>{children}</Suspense><AccessTimeoutRecovery /><AdminNavigationFix /><AdminEmailNavigation /><RoleBasedAdminAccess /><ClientCaseConversationMount /><PwaExperience /><LiveSupport /></MaintenanceGateV2>
  </body></html>;
}
