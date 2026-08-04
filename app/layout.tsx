import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEXIA — Assistance juridique",
  description: "Déposez votre dossier, échangez avec un professionnel et avancez dans vos démarches.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
