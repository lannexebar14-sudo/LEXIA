import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lexiafrance.fr"),
  title: {
    default: "LEXIA — Assistance juridique en ligne 24h/24 et 7j/7",
    template: "%s | LEXIA",
  },
  description:
    "LEXIA, plateforme française d'assistance juridique en ligne. Déposez votre situation, transmettez vos documents et obtenez une première orientation juridique rapidement, 24h/24 et 7j/7.",
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
    url: "https://lexiafrance.fr",
    siteName: "LEXIA",
    title: "LEXIA — Assistance juridique en ligne",
    description:
      "Une plateforme française d'assistance juridique accessible en ligne 24h/24 et 7j/7.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LEXIA — Assistance juridique en ligne",
    description:
      "Déposez votre situation et obtenez une première orientation juridique en ligne avec LEXIA.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LEXIA",
    url: "https://lexiafrance.fr",
    description:
      "Plateforme française d'assistance juridique en ligne accessible 24h/24 et 7j/7.",
  };

  return (
    <html lang="fr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
