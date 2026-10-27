/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// Initialiser le client GoogleGenAI côté serveur avec en-tête aistudio-build
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * 1. Endpoint : Analyse d'une phrase en langage naturel pour générer une écriture PCM
 */
app.post('/api/accounting/parse-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, companyName } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requis' });
    }

    const systemInstruction = `
Tu es l'expert-comptable en chef du logiciel marocain Mouhasib SaaS.
Tu maîtrises parfaitement le Code Général de la Normalisation Comptable (CGNC) marocain et le Plan Comptable Général Marocain (PCM).
Analyse la description fournie par l'utilisateur (en français ou dialecte d'affaires marocain) et génère l'écriture comptable marocaine exacte et équilibrée (Total Débit = Total Crédit).

Règles fiscales marocaines à appliquer impérativement :
- Taux standard de TVA : 20% (marchandises ordinaires, prestations de services générales, matériel, carburant non déductible ou spécifique, loyer commercial soumis).
- Taux réduit de TVA 14% : électricité, eau, transport de voyageurs et de marchandises, thé.
- Taux réduit de TVA 10% : opérations de banque et de crédit, courtage d'assurance, honoraires d'avocats, notaires, interprètes, experts-comptables, hébergement hôtelier, restauration.
- Taux réduit de TVA 7% : eau livrée aux réseaux de distribution publique, sucre raffiné, produits pharmaceutiques de base, fournitures scolaires.
- Exonéré (0%) : ventes à l'exportation, produits de base non transformés, opérations sans TVA.
- Par défaut, si l'utilisateur ne précise pas 'TTC', le montant est considéré comme 'HT'. S'il écrit 'TTC', déduire le montant HT et la TVA correspondante.

Comptes usuels du PCM :
- Achats marchandises : 6111
- Fournitures de bureau : 61227
- Eau, électricité : 61251
- Petit outillage : 61253
- Loyer bureau : 6131
- Honoraires : 61365
- Salaires : 61711
- Cotisations CNSS patronale : 61741
- Dotations amortissements : 61935
- Matériel informatique : 2355
- Matériel transport : 2340
- Ventes marchandises au Maroc : 7111
- Prestations de services au Maroc : 71243
- État - TVA récupérable sur charges : 34552
- État - TVA récupérable sur immobilisations : 34551
- État, TVA facturée : 4455
- Fournisseurs : 4411
- Dettes sur acquisitions d'immobilisations : 4481
- Clients : 3421
- Rémunérations dues au personnel : 4432
- CNSS due : 4441
- IR Salaires retenu : 44525
- Banques (solde débiteur) : 5141
- Caisse : 5161

Génère une réponse JSON structurée strictement conforme.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Description de l'opération : "${prompt}". Société : ${companyName || 'Société marocaine'}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            journal: {
              type: Type.STRING,
              description: 'ACHATS, VENTES, BANQUE, CAISSE ou OD',
            },
            reference: { type: Type.STRING },
            label: { type: Type.STRING },
            date: { type: Type.STRING, description: 'AAAA-MM-JJ' },
            vatRate: { type: Type.NUMBER },
            vatAmount: { type: Type.NUMBER },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  accountCode: { type: Type.STRING },
                  accountLabel: { type: Type.STRING },
                  debit: { type: Type.NUMBER },
                  credit: { type: Type.NUMBER },
                },
                required: ['accountCode', 'accountLabel', 'debit', 'credit'],
              },
            },
            explanation: { type: Type.STRING },
          },
          required: ['journal', 'reference', 'label', 'lines'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error parse-prompt:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors du traitement IA' });
  }
});

/**
 * 2. Endpoint : Analyse OCR d'une facture scannée / reçu (Vision)
 */
app.post('/api/accounting/analyze-invoice', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image requise' });
    }

    const prompt = `
Tu es un expert-comptable marocain. Analyse cette facture marocaine, ticket de caisse ou reçu.
Extrait :
1. Tiers (Fournisseur ou Client)
2. ICE (Identifiant Commun de l'Entreprise marocain à 15 chiffres si présent)
3. Date de la pièce
4. Numéro de facture
5. Montant total HT
6. Taux de TVA (20%, 14%, 10%, 7% ou 0%)
7. Montant de la TVA
8. Montant Total TTC
9. L'écriture comptable marocaine selon le Plan Comptable Marocain (PCM).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            partnerName: { type: Type.STRING },
            partnerIce: { type: Type.STRING },
            invoiceNumber: { type: Type.STRING },
            date: { type: Type.STRING },
            totalHT: { type: Type.NUMBER },
            vatRate: { type: Type.NUMBER },
            vatAmount: { type: Type.NUMBER },
            totalTTC: { type: Type.NUMBER },
            journal: { type: Type.STRING },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  accountCode: { type: Type.STRING },
                  accountLabel: { type: Type.STRING },
                  debit: { type: Type.NUMBER },
                  credit: { type: Type.NUMBER },
                },
                required: ['accountCode', 'accountLabel', 'debit', 'credit'],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ['totalHT', 'totalTTC', 'lines'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyze-invoice:', error);
    return res.status(500).json({ error: error.message || "Erreur d'analyse de facture" });
  }
});

/**
 * 3. Endpoint : Synthèse vocale TTS avec le modèle gemini-3.8-flash-tts
 * Conformité : "You MUST add TTS to the app using model gemini-3.8-flash-tts"
 */
app.post('/api/accounting/tts', async (req: Request, res: Response) => {
  try {
    const { text, speaker = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texte requis pour TTS' });
    }

    // Appel à gemini-3.8-flash-tts en mode unitaire
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Lis ce bilan comptable avec une voix professionnelle, claire et bienveillante d'expert-comptable : "${text}"`,
              speechMetadata: {
                style: 'Professional, articulate financial advisor in French',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: speaker || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Aucun flux audio généré par le modèle' });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error tts:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de la génération vocale' });
  }
});

/**
 * 4. Endpoint : Audit fiscal et conformité CGNC
 */
app.post('/api/accounting/audit-advice', async (req: Request, res: Response) => {
  try {
    const { company, metrics } = req.body;
    const prompt = `
En tant qu'expert-comptable assermenté au Maroc, examine la situation de cette entreprise marocaine :
Société : ${company?.name || 'Entreprise Marocaine'} (${company?.legalForm || 'SARL'})
Chiffre d'Affaires : ${metrics?.ca || 0} MAD
Total Charges : ${metrics?.charges || 0} MAD
Résultat Net : ${metrics?.resultatNet || 0} MAD
Trésorerie disponible : ${metrics?.tresorerie || 0} MAD
TVA due / Crédit : ${metrics?.vatDue ? metrics.vatDue + ' MAD due' : metrics?.currentCredit + ' MAD crédit'}

Rédige une note synthétique d'audit et de conseils fiscaux (3-4 paragraphes) :
1. Santé financière et rentabilité (marge, trésorerie).
2. Obligations fiscales imminentes (échéances TVA au 20, calendrier des acomptes IS, cotisation minimale).
3. Recommandations de clôture et optimisations légales en vigueur au Maroc.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ success: true, advice: response.text });
  } catch (error: any) {
    console.error('Error audit-advice:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Port et démarrage du serveur
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mouhasib SaaS server running on http://localhost:${PORT}`);
  });
}

startServer();
