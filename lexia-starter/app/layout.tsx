import type { Metadata } from "next";
import "./globals.css";
import "./mobile-polish.css";
import LiveSupport from "./components/LiveSupport";

export const metadata: Metadata = {
  title: "LEXIA — Assistance juridique",
  description: "Déposez votre dossier, échangez avec un professionnel et avancez dans vos démarches.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}<LiveSupport /></body>
    </html>
  );
}
