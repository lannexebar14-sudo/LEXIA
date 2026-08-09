import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Tu es LEXIA Assistant, l'assistant d'orientation de la plateforme LEXIA.
Ta mission est d'accueillir, clarifier la situation et orienter vers le bon parcours LEXIA.
Tu ne dois jamais te présenter comme avocat, juriste humain, tribunal ou commissaire de justice.
Tu ne dois pas promettre un résultat, trancher définitivement un litige ou inventer une règle de droit.
Quand l'information manque, pose une question courte et utile.
Réponds en français, de façon claire, rassurante, concise et pratique.
Quand c'est pertinent, recommande l'un de ces parcours :
- /orientation : orientation juridique express
- /inscription : créer un espace et déposer une demande
- /impayes : factures, loyers, prestations ou créances impayées
- /conseils-juridiques : guides juridiques
- /connexion : accès client existant
Si la situation semble urgente, implique un danger immédiat, des violences ou une échéance judiciaire très proche, indique que l'assistant ne remplace pas une aide d'urgence ou un professionnel compétent et invite l'utilisateur à agir sans attendre.
Ne demande jamais de données bancaires, mot de passe ou numéro de carte.
Termine si possible par une prochaine étape concrète en une phrase.`;

function localOrientation(message: string) {
  const text = message.toLowerCase();
  if (/impay|facture|loyer|créance|creance|dette|paiement/.test(text)) {
    return "Votre situation semble relever d’un impayé. Le parcours le plus adapté est LEXIA Impayés : vous pourrez renseigner le montant, l’échéance, le débiteur et vos justificatifs. Prochaine étape : ouvrez le service Impayés depuis le menu ou rendez-vous sur /impayes.";
  }
  if (/travail|employeur|licenci|salaire|contrat|prud/.test(text)) {
    return "Votre demande semble concerner le droit du travail. Je vous conseille de passer par l’Orientation juridique express pour préciser le problème, puis de créer un dossier si une étude est nécessaire. Prochaine étape : /orientation.";
  }
  if (/logement|bail|propriétaire|proprietaire|locataire|dépôt|depot|expulsion/.test(text)) {
    return "Votre situation semble concerner le logement. L’Orientation juridique express peut vous guider selon qu’il s’agit d’un bail, d’un dépôt de garantie, de travaux ou d’un différend avec le propriétaire ou le locataire. Prochaine étape : /orientation.";
  }
  if (/famille|divorce|séparation|separation|pension|enfant|garde/.test(text)) {
    return "Votre demande semble relever du droit de la famille. Pour éviter de vous orienter trop vite, utilisez l’Orientation juridique express puis décrivez les faits et votre objectif. Prochaine étape : /orientation.";
  }
  if (/achat|commande|rembours|assurance|banque|abonnement|consomm/.test(text)) {
    return "Votre situation semble relever de la consommation, de la banque ou de l’assurance. L’Orientation juridique express vous permettra d’identifier le parcours adapté avant le dépôt d’un dossier. Prochaine étape : /orientation.";
  }
  return "Je peux vous aider à identifier le bon parcours. Dites-moi simplement ce qui s’est passé, avec qui vous êtes en litige et ce que vous souhaitez obtenir. Vous pouvez aussi utiliser directement l’Orientation juridique express depuis /orientation.";
}

function extractText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const parts: string[] = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message || "").trim().slice(0, 4000);
    const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];
    if (!message) return NextResponse.json({ error: "Message requis" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: localOrientation(message), mode: "orientation" });
    }

    const input = [
      ...history.map((item: any) => ({
        role: item?.role === "assistant" ? "assistant" : "user",
        content: String(item?.content || "").slice(0, 2000),
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions: SYSTEM_PROMPT,
        input,
        store: false,
        max_output_tokens: 450,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ reply: localOrientation(message), mode: "orientation" });
    }

    const data = await response.json();
    const reply = extractText(data) || localOrientation(message);
    return NextResponse.json({ reply, mode: "ai" });
  } catch {
    return NextResponse.json({ reply: "Je peux vous orienter. Décrivez brièvement votre situation ou utilisez l’Orientation juridique express depuis /orientation.", mode: "orientation" });
  }
}
