import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Paiement sécurisé — LEXIA",
  description: "Confirmation sécurisée du paiement de votre dossier Lexia.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaiementSuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
