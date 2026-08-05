import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mobile-polish.css";
import "./administration/mobile-header.css";
import "./tableau-de-bord/client-mobile-header.css";
import "./nouveau-dossier/stripe-checkout.css";
import LiveSupport from "./components/LiveSupport";
import PwaExperience from "./components/PwaExperience";
import MobilePlatformBadge from "./components/MobilePlatformBadge";
import MaintenanceGate from "./components/MaintenanceGate";
import AdminNavigationFix from "./components/AdminNavigationFix";
import ClientCaseConversationMount from "./components/ClientCaseConversationMount";

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
        <MaintenanceGate>
          {children}
          <AdminNavigationFix />
          <ClientCaseConversationMount />
          <MobilePlatformBadge />
          <PwaExperience />
          <LiveSupport />
        </MaintenanceGate>
      </body>
    </html>
  );
}
