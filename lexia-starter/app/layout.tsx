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
import MobilePlatformBadge from "./components/MobilePlatformBadge";
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
    default: "LEXIA | Assistance juridique en ligne 24h/24",
    template: "%s | LEXIA",
  },
  description: "LEXIA est une plateforme française d'assistance juridique en ligne pour particuliers et professionnels : dépôt de dossier, documents, messagerie et orientation adaptée.",
  keywords: [
    "assistance juridique en ligne",
    "aide juridique",
    "conseil juridique",
    "juriste en ligne",
    "litige logement",
    "droit du travail",
    "droit de la famille",
    "litige consommation",
    "recouvrement facture",
    "LEXIA",
  ],
  applicationName: "LEXIA",
  category: "legal services",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "LEXIA",
    title: "LEXIA | Assistance juridique en ligne",
    description: "Décrivez votre situation, transmettez vos documents et échangez depuis un espace sécurisé.",
  },
  twitter: {
    card: "summary",
    title: "LEXIA | Assistance juridique en ligne",
    description: "Assistance juridique en ligne pour particuliers et professionnels.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LEXIA",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#091d33",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LEXIA",
  url: SITE_URL,
  email: "contact@lexiafrance.fr",
  description: "Plateforme française d'assistance juridique en ligne pour particuliers et professionnels.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LEXIA",
  url: SITE_URL,
  inLanguage: "fr-FR",
  publisher: {
    "@type": "Organization",
    name: "LEXIA",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <MaintenanceGateV2>
          <FastSessionRouter />
          <CaseDraftSync />
          <H24SpecialistsHighlight />
          <Suspense fallback={null}>{children}</Suspense>
          <AccessTimeoutRecovery />
          <AdminNavigationFix />
          <AdminEmailNavigation />
          <RoleBasedAdminAccess />
          <ClientCaseConversationMount />
          <MobilePlatformBadge />
          <PwaExperience />
          <LiveSupport />
        </MaintenanceGateV2>
      </body>
    </html>
  );
}
