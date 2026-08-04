export type PrestationCategory = "Analyse" | "Échange" | "Rédaction" | "Transmission";

export type Prestation = {
  id: string;
  icon: string;
  category: PrestationCategory;
  title: string;
  shortTitle: string;
  price: number;
  description: string;
  includes: string[];
  badge?: string;
  qualifiedProfessional: boolean;
  active?: boolean;
  sortOrder?: number;
};

export type ServiceCatalogRow = {
  id: string;
  icon: string;
  category: PrestationCategory;
  title: string;
  short_title: string;
  price: number | string;
  description: string;
  includes: unknown;
  badge: string | null;
  qualified_professional: boolean;
  active: boolean;
  sort_order: number;
};

export function mapServiceCatalogRow(row: ServiceCatalogRow): Prestation {
  return {
    id: row.id,
    icon: row.icon,
    category: row.category,
    title: row.title,
    shortTitle: row.short_title,
    price: Number(row.price),
    description: row.description,
    includes: Array.isArray(row.includes) ? row.includes.filter((item): item is string => typeof item === "string") : [],
    badge: row.badge || undefined,
    qualifiedProfessional: row.qualified_professional,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export const prestations: Prestation[] = [
  {
    id: "analyse-approfondie",
    icon: "◎",
    category: "Analyse",
    title: "Analyse approfondie et plan d’action",
    shortTitle: "Analyse approfondie",
    price: 29,
    description: "Une étude complémentaire du dossier avec les démarches recommandées, les priorités et les points de vigilance.",
    includes: ["Lecture des pièces principales", "Plan d’action personnalisé", "Synthèse écrite dans la messagerie"],
    badge: "Recommandée",
    qualifiedProfessional: true,
    active: true,
    sortOrder: 10,
  },
  {
    id: "entretien-30-min",
    icon: "☎",
    category: "Échange",
    title: "Entretien téléphonique de 30 minutes",
    shortTitle: "Entretien 30 min",
    price: 39,
    description: "Un échange planifié pour reprendre les faits, répondre aux questions utiles et clarifier les prochaines étapes.",
    includes: ["Créneau de 30 minutes", "Préparation à partir du dossier", "Compte rendu dans votre espace"],
    qualifiedProfessional: true,
    active: true,
    sortOrder: 20,
  },
  {
    id: "relecture-document",
    icon: "▤",
    category: "Rédaction",
    title: "Relecture et correction d’un document",
    shortTitle: "Relecture de document",
    price: 39,
    description: "Vérification d’un courrier, d’une réponse ou d’un document court avant son envoi.",
    includes: ["Document jusqu’à 5 pages", "Corrections et reformulations", "Observations sur les passages sensibles"],
    qualifiedProfessional: true,
    active: true,
    sortOrder: 30,
  },
  {
    id: "courrier-juridique",
    icon: "✎",
    category: "Rédaction",
    title: "Rédaction d’un courrier juridique",
    shortTitle: "Courrier juridique",
    price: 49,
    description: "Préparation d’un courrier clair et structuré pour demander, contester, répondre ou formaliser une démarche.",
    includes: ["Courrier personnalisé", "Une série de corrections", "Version prête à envoyer"],
    qualifiedProfessional: true,
    active: true,
    sortOrder: 40,
  },
  {
    id: "reponse-courrier",
    icon: "↩",
    category: "Rédaction",
    title: "Réponse à un courrier reçu",
    shortTitle: "Réponse à un courrier",
    price: 59,
    description: "Analyse du courrier adverse et rédaction d’une réponse adaptée aux éléments présents dans le dossier.",
    includes: ["Analyse du courrier reçu", "Réponse argumentée", "Version modifiable et version PDF"],
    qualifiedProfessional: true,
    active: true,
    sortOrder: 50,
  },
  {
    id: "mise-en-demeure",
    icon: "!",
    category: "Rédaction",
    title: "Mise en demeure personnalisée",
    shortTitle: "Mise en demeure",
    price: 79,
    description: "Rédaction d’une mise en demeure personnalisée à partir des faits et justificatifs transmis.",
    includes: ["Vérification des informations utiles", "Rédaction personnalisée", "Document prêt pour envoi recommandé"],
    badge: "Très demandée",
    qualifiedProfessional: true,
    active: true,
    sortOrder: 60,
  },
  {
    id: "dossier-avocat",
    icon: "⚖",
    category: "Transmission",
    title: "Préparation et transmission à un avocat",
    shortTitle: "Dossier pour avocat",
    price: 89,
    description: "Organisation des éléments essentiels afin de faciliter la reprise du dossier par un avocat partenaire ou choisi par le client.",
    includes: ["Chronologie des faits", "Classement des pièces", "Synthèse de transmission"],
    qualifiedProfessional: true,
    active: true,
    sortOrder: 70,
  },
];

export const accountOpeningPrices = {
  particulier: 13,
  professionnel: 29,
} as const;

export const urgencySupplements = {
  normale: 0,
  rapide: 9,
  urgente: 20,
} as const;
