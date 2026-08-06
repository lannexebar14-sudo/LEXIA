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
import "./founder-highlight.css";
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
import FounderHighlight from "./components/FounderHighlight";

export const metadata: Metadata = {
  title: "LEXIA — Assistance juridique",
  description: "Déposez votre dossier, échangez avec un professionnel et avancez dans vos démarches.",
  applicationName: "LEXIA",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <MaintenanceGateV2>
          <FastSessionRouter />
          <CaseDraftSync />
          <H24SpecialistsHighlight />
          <FounderHighlight />
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
