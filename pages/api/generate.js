import { GoogleGenerativeAI } from "@google/generative-ai";

// Rate limiting en mémoire (1 essai par IP par jour)
const ipRequests = new Map();
const DAILY_LIMIT = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now - record.firstRequest > ONE_DAY_MS) {
    ipRequests.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (record.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: DAILY_LIMIT - record.count };
}

const SYSTEM_PROMPT = `Tu es un consultant expert en montage de projets de développement en Afrique de l'Ouest, spécialisé sur le Bénin. Tu connais les bailleurs (UE, AFD, USAID, BAD, BOAD, FIDA, ONG internationales), les réalités terrain, les contraintes locales (saisonnalité, accès aux marchés, infrastructures, genre).

À partir d'un problème exprimé par l'utilisateur, tu produis un projet structuré en 4 livrables. Tu réponds UNIQUEMENT en JSON valide, sans préambule, sans markdown autour du JSON.

Format de réponse strict :
{
  "idea": "Texte en markdown : titre du projet, résumé exécutif (5-7 lignes), objectif général, objectifs spécifiques (liste), bénéficiaires directs et indirects, zone d'intervention, durée recommandée. Sois concret, ancré dans la réalité béninoise.",
  "logframe": "Cadre logique en tableau markdown avec colonnes : Niveau | Description | Indicateurs objectivement vérifiables | Sources de vérification | Hypothèses. Lignes : Objectif global, Objectif spécifique, Résultats attendus (3-4), Activités principales.",
  "budget": "Budget estimatif en tableau markdown avec colonnes : Rubrique | Description | Montant (FCFA) | % du total. Inclure : ressources humaines, équipements/matériel, fonctionnement, suivi-évaluation, frais administratifs (max 10%), imprévus (5%). Total réaliste pour le contexte béninois, généralement entre 15 000 000 et 150 000 000 FCFA selon l'ampleur. Termine par une ligne TOTAL.",
  "schedule": "Chronogramme en markdown : durée totale recommandée, 3 phases principales (préparation, mise en œuvre, clôture), puis tableau markdown avec colonnes : Activité | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 (par trimestre sur 2 ans, utilise X pour activité prévue)."
}

Important : utilise des montants réalistes en FCFA, des indicateurs SMART, et reste ancré dans le contexte béninois.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Récupération de l'IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown";

  // Vérification du rate limit
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error:
        "Tu as utilisé ton essai gratuit. Pour aller plus loin avec ton projet, contacte Hector directement sur WhatsApp.",
    });
  }

  const { problem } = req.body;
  if (!problem || problem.trim().length < 30) {
    return res
      .status(400)
      .json({ error: "Décris ton problème en au moins 30 caractères." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(
      `Voici le problème à structurer en projet :\n\n${problem}`
    );
    const text = result.response.text();
    const project = JSON.parse(text);

    return res.status(200).json({ project, remaining: limit.remaining });
  } catch (err) {
    console.error("Erreur génération:", err);
    return res.status(500).json({
      error:
        "Une erreur est survenue. Réessaie dans un instant — si le problème persiste, contacte Hector sur WhatsApp.",
    });
  }
}
