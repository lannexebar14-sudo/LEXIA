export type SeoGuide = {
  slug: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  points: { title: string; text: string }[];
  checklist: string[];
  faq: { question: string; answer: string }[];
  updatedAt: string;
};

export const seoGuides: SeoGuide[] = [
  {
    slug: "depot-de-garantie-non-restitue",
    category: "Logement",
    title: "Dépôt de garantie non restitué : que faire ?",
    description: "Les étapes à suivre si votre propriétaire ne vous rend pas votre dépôt de garantie après votre départ du logement.",
    intro: "Après la remise des clés, le bailleur dispose d'un délai encadré pour restituer le dépôt de garantie, sous réserve des retenues pouvant être justifiées. Avant d'engager une procédure, il est utile de réunir les documents du bail et de formaliser votre demande par écrit.",
    points: [
      { title: "Vérifier les délais", text: "Le délai dépend notamment de la conformité de l'état des lieux de sortie avec celui d'entrée et de l'existence éventuelle de sommes restant dues. Conservez la preuve de la date de remise des clés." },
      { title: "Contrôler les retenues", text: "Une retenue doit pouvoir être expliquée et appuyée par des éléments précis. Comparez les justificatifs avec votre état des lieux, vos quittances et les échanges avec le bailleur." },
      { title: "Formaliser votre réclamation", text: "Si la restitution tarde ou paraît injustifiée, adressez une demande écrite claire, puis une mise en demeure si nécessaire. Gardez une copie de chaque envoi." },
    ],
    checklist: ["Contrat de location", "États des lieux d'entrée et de sortie", "Preuve de remise des clés", "Quittances et décompte", "Courriers ou e-mails échangés"],
    faq: [
      { question: "Puis-je réclamer sans avocat ?", answer: "Oui. Une première réclamation et une mise en demeure peuvent être adressées directement. Une aide juridique peut toutefois être utile si le montant ou les faits sont contestés." },
      { question: "Que faire si le propriétaire ne répond pas ?", answer: "Conservez vos preuves, formalisez votre demande et étudiez les voies amiables ou judiciaires adaptées à votre situation." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "loyers-impayes-proprietaire",
    category: "Logement",
    title: "Loyers impayés : quelles démarches pour un propriétaire ?",
    description: "Comment réagir face à des loyers impayés, organiser les preuves et engager les démarches adaptées sans perdre de temps.",
    intro: "Un impayé de loyer doit être traité rapidement et méthodiquement. L'objectif est d'identifier le montant exact dû, de vérifier les garanties mobilisables et de privilégier une solution amiable lorsqu'elle reste possible.",
    points: [
      { title: "Établir un décompte précis", text: "Listez les loyers, charges, paiements reçus et dates d'échéance. Un décompte lisible évite les erreurs et facilite toutes les démarches suivantes." },
      { title: "Contacter le locataire", text: "Un échange rapide permet parfois d'identifier une difficulté ponctuelle et d'organiser un échéancier. Toute proposition importante doit être confirmée par écrit." },
      { title: "Vérifier les garanties", text: "Caution, assurance loyers impayés ou dispositifs spécifiques peuvent modifier la marche à suivre. Respectez les délais de déclaration prévus par vos contrats." },
    ],
    checklist: ["Bail signé", "Décompte des sommes dues", "Historique des paiements", "Garanties et assurances", "Échanges avec le locataire"],
    faq: [
      { question: "Faut-il agir dès le premier impayé ?", answer: "Oui, au minimum pour comprendre la situation et conserver un dossier précis. Plus le retard s'accumule, plus la résolution peut devenir complexe." },
      { question: "Un échéancier est-il possible ?", answer: "Oui si les parties sont d'accord. Il doit être réaliste, écrit et ne pas vous faire renoncer involontairement à vos droits." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "troubles-de-voisinage-recours",
    category: "Logement",
    title: "Troubles de voisinage : quels recours ?",
    description: "Bruit, odeurs, nuisances répétées : les preuves à conserver et les démarches possibles en cas de trouble de voisinage.",
    intro: "Les conflits de voisinage se règlent plus efficacement lorsque les faits sont datés, répétés et documentés. Avant une procédure, il est souvent utile de tenter une résolution amiable tout en constituant un dossier de preuves.",
    points: [
      { title: "Documenter les nuisances", text: "Notez les dates, horaires, durée et nature des troubles. Les témoignages, courriers et constats peuvent être utiles selon le contexte." },
      { title: "Privilégier un échange écrit", text: "Un message ou courrier factuel permet d'expliquer le problème sans escalade et de garder une trace de votre démarche." },
      { title: "Choisir le bon recours", text: "Selon la nature du trouble, une médiation, le bailleur, le syndic, la mairie ou une action judiciaire peuvent être concernés." },
    ],
    checklist: ["Journal des nuisances", "Photos ou vidéos utiles", "Témoignages", "Règlement de copropriété si applicable", "Courriers déjà envoyés"],
    faq: [
      { question: "Une seule nuisance suffit-elle ?", answer: "Tout dépend de sa gravité. Les troubles anormaux sont généralement appréciés au regard de leur intensité, leur durée, leur répétition et leur contexte." },
      { question: "Puis-je contacter le syndic ?", answer: "Oui lorsqu'un règlement de copropriété ou les parties communes sont concernés. Joignez des faits précis et les éléments utiles." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "contester-licenciement",
    category: "Travail",
    title: "Contester un licenciement : par où commencer ?",
    description: "Les premiers réflexes pour analyser un licenciement, conserver les preuves et vérifier les délais de contestation.",
    intro: "La contestation d'un licenciement dépend du motif invoqué, de la procédure suivie et des documents remis au salarié. Il est essentiel de conserver l'ensemble des échanges et d'agir sans attendre lorsque des délais s'appliquent.",
    points: [
      { title: "Relire la lettre de licenciement", text: "Le contenu de la lettre est central. Identifiez précisément les motifs reprochés, les dates et les faits mentionnés." },
      { title: "Reconstituer la procédure", text: "Convocation, entretien, délais, notifications et documents de fin de contrat doivent être regroupés pour vérifier la cohérence de la procédure." },
      { title: "Comparer avec les faits réels", text: "Rassemblez les e-mails, objectifs, plannings, attestations et autres éléments pouvant confirmer ou contredire les motifs invoqués." },
    ],
    checklist: ["Lettre de licenciement", "Convocation à entretien", "Contrat et avenants", "Bulletins de salaire", "E-mails et éléments de preuve"],
    faq: [
      { question: "Puis-je contester sans être encore inscrit au chômage ?", answer: "Oui. Les démarches liées au chômage et la contestation du licenciement sont distinctes." },
      { question: "Dois-je conserver mes e-mails professionnels ?", answer: "Conservez uniquement les éléments auxquels vous avez légitimement accès et qui sont utiles à votre situation, sans emporter de données confidentielles étrangères au litige." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "salaire-impaye",
    category: "Travail",
    title: "Salaire impayé ou versé en retard : que faire ?",
    description: "Les démarches utiles lorsqu'un employeur ne verse pas tout ou partie du salaire prévu.",
    intro: "Le salaire constitue une obligation essentielle de l'employeur. En cas de retard ou d'absence de paiement, commencez par vérifier vos bulletins, votre contrat et vos relevés bancaires afin d'identifier exactement les sommes manquantes.",
    points: [
      { title: "Vérifier le montant dû", text: "Comparez le salaire contractuel, les heures réalisées, primes éventuelles, retenues et montants effectivement reçus." },
      { title: "Demander une régularisation", text: "Adressez une demande écrite et factuelle à l'employeur ou au service concerné. Mentionnez les périodes et montants en cause." },
      { title: "Préserver les preuves", text: "Gardez bulletins, relevés, plannings, pointages et échanges. Ils permettent d'établir la chronologie et le montant du litige." },
    ],
    checklist: ["Contrat de travail", "Bulletins de salaire", "Relevés bancaires", "Plannings ou pointages", "Échanges avec l'employeur"],
    faq: [
      { question: "Un simple retard peut-il être contesté ?", answer: "Oui lorsqu'il s'agit d'un manquement au paiement à la date normalement prévue. La réponse appropriée dépend de la fréquence et de la gravité du retard." },
      { question: "Puis-je réclamer des heures non payées ?", answer: "Oui si vous pouvez établir les heures réalisées. Réunissez vos éléments de preuve avant toute démarche." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "rupture-conventionnelle-refus",
    category: "Travail",
    title: "Rupture conventionnelle : refus, négociation et points de vigilance",
    description: "Comprendre le principe de la rupture conventionnelle et les éléments à vérifier avant d'accepter ou de négocier.",
    intro: "La rupture conventionnelle repose sur un accord entre l'employeur et le salarié. Aucune des parties ne peut l'imposer seule. Avant de signer, il faut vérifier les conditions financières, les dates et les conséquences de l'accord.",
    points: [
      { title: "Un accord doit être libre", text: "La rupture conventionnelle suppose un consentement réel. Une pression ou une situation conflictuelle peut nécessiter une analyse particulière." },
      { title: "Vérifier les montants", text: "L'indemnité, les congés, primes et autres sommes dues doivent être examinés avant signature." },
      { title: "Anticiper le calendrier", text: "La procédure comporte plusieurs étapes et délais. Ne fixez pas votre départ définitif sans avoir vérifié le calendrier applicable." },
    ],
    checklist: ["Contrat de travail", "Ancienneté", "Bulletins récents", "Proposition de l'employeur", "Solde de congés"],
    faq: [
      { question: "L'employeur peut-il refuser ?", answer: "Oui. La rupture conventionnelle nécessite l'accord des deux parties." },
      { question: "Puis-je négocier l'indemnité ?", answer: "Oui. Le montant peut faire l'objet d'une négociation, sous réserve des minimums applicables." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "pension-alimentaire-impayee",
    category: "Famille",
    title: "Pension alimentaire impayée : quelles démarches ?",
    description: "Comment réagir lorsqu'une pension alimentaire n'est plus versée ou n'est versée que partiellement.",
    intro: "Un impayé de pension alimentaire doit être documenté précisément. Le jugement, la convention ou le titre fixant la pension, ainsi que les relevés de paiement, permettent d'identifier les sommes dues et les démarches possibles.",
    points: [
      { title: "Calculer les impayés", text: "Listez chaque échéance, les montants dus et les versements reçus afin d'obtenir un décompte clair." },
      { title: "Conserver le titre", text: "Le jugement, la convention homologuée ou tout autre titre exécutoire doit être conservé avec ses éventuelles modifications." },
      { title: "Choisir le mode de recouvrement", text: "Plusieurs mécanismes peuvent exister selon votre situation. Une analyse du dossier permet d'identifier la voie la plus adaptée." },
    ],
    checklist: ["Jugement ou convention", "Relevés bancaires", "Décompte des impayés", "Échanges entre les parents", "Éventuelles décisions plus récentes"],
    faq: [
      { question: "Puis-je agir pour un paiement partiel ?", answer: "Oui si le montant versé est inférieur à celui qui est dû. Il faut alors établir précisément la différence." },
      { question: "Que faire si la situation financière a changé ?", answer: "Une modification durable de la situation peut justifier une demande de révision, mais elle ne modifie pas automatiquement le montant déjà fixé." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "separation-garde-enfant",
    category: "Famille",
    title: "Séparation et garde des enfants : comment organiser les démarches ?",
    description: "Les éléments à préparer pour organiser résidence, droit de visite, dépenses et échanges après une séparation.",
    intro: "Après une séparation, les décisions concernant les enfants doivent être organisées de manière claire et stable. Lorsque l'accord est difficile, il est utile de distinguer les questions de résidence, de droit de visite, de contribution financière et d'autorité parentale.",
    points: [
      { title: "Lister les points à organiser", text: "Résidence habituelle, vacances, trajets, école, santé et dépenses doivent être abordés séparément pour éviter les accords imprécis." },
      { title: "Privilégier des échanges traçables", text: "Des échanges écrits et factuels facilitent la compréhension des accords et réduisent les malentendus." },
      { title: "Préparer les éléments utiles", text: "Revenus, charges, emploi du temps, logement et besoins des enfants sont souvent nécessaires pour apprécier une organisation adaptée." },
    ],
    checklist: ["Livret de famille", "Justificatifs de revenus et charges", "Calendrier des enfants", "Échanges entre parents", "Décisions déjà rendues s'il y en a"],
    faq: [
      { question: "Un accord oral suffit-il ?", answer: "Il peut fonctionner tant que les relations restent bonnes, mais un écrit précis apporte davantage de sécurité en cas de désaccord ultérieur." },
      { question: "Peut-on modifier une organisation existante ?", answer: "Oui lorsque la situation évolue, selon les modalités applicables et l'intérêt de l'enfant." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "remboursement-achat-en-ligne",
    category: "Consommation",
    title: "Achat en ligne : remboursement refusé, que faire ?",
    description: "Les vérifications et démarches utiles lorsqu'un vendeur refuse un remboursement ou ne répond plus.",
    intro: "En cas de litige après un achat en ligne, commencez par identifier la nature exacte du problème : rétractation, produit non livré, produit non conforme, retour contesté ou remboursement en retard. Les droits et délais peuvent différer selon le cas.",
    points: [
      { title: "Identifier le motif", text: "Conservez la commande, les conditions de vente et les messages pour déterminer si le litige concerne la livraison, la conformité, la rétractation ou une garantie." },
      { title: "Prouver votre démarche", text: "Gardez les preuves d'envoi, de retour, de livraison et les demandes de remboursement. Elles sont essentielles en cas de contestation." },
      { title: "Escalader progressivement", text: "Commencez par le service client, puis formalisez une réclamation écrite avant d'envisager une médiation ou une autre voie de recours." },
    ],
    checklist: ["Confirmation de commande", "Facture", "Conditions de vente", "Preuve de retour ou livraison", "Échanges avec le vendeur"],
    faq: [
      { question: "Puis-je demander un remboursement si le produit ne correspond pas ?", answer: "Selon la situation, les règles de conformité ou de rétractation peuvent s'appliquer. Il faut examiner la date, le produit et les conditions de la vente." },
      { question: "Que faire si le vendeur ne répond plus ?", answer: "Formalisez votre réclamation et conservez les preuves. Une médiation ou un recours adapté peut ensuite être envisagé." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "litige-assurance-indemnisation",
    category: "Consommation",
    title: "Assurance : indemnisation refusée ou insuffisante",
    description: "Comment analyser un refus d'assurance, préparer une contestation et rassembler les pièces utiles.",
    intro: "Un refus ou une indemnisation jugée insuffisante doit être comparé aux garanties prévues par le contrat, aux exclusions invoquées et aux éléments du sinistre. Une contestation efficace répond point par point à la position de l'assureur.",
    points: [
      { title: "Relire le contrat", text: "Identifiez les garanties, plafonds, franchises, exclusions et obligations déclaratives correspondant au sinistre." },
      { title: "Analyser la réponse de l'assureur", text: "Repérez le motif précis du refus ou du montant proposé et demandez les explications ou pièces manquantes si nécessaire." },
      { title: "Chiffrer votre préjudice", text: "Factures, devis, expertises, photos et justificatifs permettent d'étayer le montant réclamé." },
    ],
    checklist: ["Contrat et conditions générales", "Déclaration de sinistre", "Réponse de l'assureur", "Photos et justificatifs", "Devis ou expertise"],
    faq: [
      { question: "Puis-je contester une expertise ?", answer: "Oui selon les circonstances et le contrat. Une contre-expertise ou une contestation argumentée peut parfois être envisagée." },
      { question: "Le refus doit-il être expliqué ?", answer: "Vous devez pouvoir identifier le fondement de la décision afin de vérifier s'il correspond réellement au contrat et aux faits." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "facture-client-impayee",
    category: "Entreprise",
    title: "Facture client impayée : comment récupérer son argent ?",
    description: "Relance, mise en demeure et constitution du dossier : les étapes utiles pour recouvrer une facture professionnelle impayée.",
    intro: "Le recouvrement est plus efficace lorsque la créance est clairement établie. Avant toute démarche, vérifiez le contrat, la facture, la réalisation de la prestation et l'absence de contestation sérieuse du client.",
    points: [
      { title: "Vérifier la créance", text: "Regroupez devis, bon de commande, contrat, facture, preuve de livraison ou de prestation et conditions de paiement." },
      { title: "Relancer de façon structurée", text: "Une première relance peut rester commerciale. Si elle échoue, une mise en demeure précise permet de formaliser l'exigibilité de la somme." },
      { title: "Préparer le recouvrement", text: "Le choix entre recouvrement amiable et procédure dépend notamment du montant, des preuves et de la réaction du débiteur." },
    ],
    checklist: ["Devis ou contrat", "Facture", "Preuve de prestation ou livraison", "Conditions générales", "Relances déjà envoyées"],
    faq: [
      { question: "Faut-il envoyer une mise en demeure ?", answer: "Elle est souvent utile pour formaliser la demande et fixer un dernier délai avant une démarche plus contraignante." },
      { question: "Puis-je réclamer des pénalités ?", answer: "Cela dépend du contrat, de la facture et des règles applicables à votre relation commerciale. Vérifiez les mentions prévues." },
    ],
    updatedAt: "2026-08-07",
  },
  {
    slug: "mise-en-demeure-comment-faire",
    category: "Démarches",
    title: "Mise en demeure : comment la rédiger et l'envoyer ?",
    description: "À quoi sert une mise en demeure, quelles informations y faire figurer et comment conserver la preuve de son envoi.",
    intro: "La mise en demeure est un courrier formel demandant à une personne ou une entreprise d'exécuter une obligation dans un délai déterminé. Elle doit être suffisamment précise pour que le destinataire comprenne ce qui lui est demandé et pourquoi.",
    points: [
      { title: "Exposer les faits", text: "Présentez brièvement la relation, les dates importantes, l'obligation concernée et les démarches déjà effectuées." },
      { title: "Formuler une demande précise", text: "Indiquez clairement ce que vous réclamez, le montant s'il y en a un et le délai laissé au destinataire pour régulariser." },
      { title: "Conserver la preuve", text: "Gardez une copie du courrier, de ses pièces jointes et de la preuve d'envoi ou de réception." },
    ],
    checklist: ["Contrat ou document à l'origine du litige", "Chronologie des faits", "Montant réclamé", "Pièces justificatives", "Coordonnées exactes du destinataire"],
    faq: [
      { question: "Une mise en demeure doit-elle être faite par un avocat ?", answer: "Non. Elle peut être adressée directement, même si une aide à la rédaction peut être utile pour les situations complexes." },
      { question: "Quel délai donner ?", answer: "Le délai doit être cohérent avec la nature de l'obligation et les circonstances. Certains domaines peuvent prévoir des règles particulières." },
    ],
    updatedAt: "2026-08-07",
  },
];

export function getSeoGuide(slug: string) {
  return seoGuides.find((guide) => guide.slug === slug);
}
