/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Google Workspace client services (Sheets, Calendar, Slides, Contacts)
 */

import { getCachedToken } from './firebase';
import { AccountingEntry, Company } from '../types/accounting';

/**
 * Exporte le Journal général dans une nouvelle feuille Google Sheets
 */
export async function exportJournalToGoogleSheets(
  company: Company,
  entries: AccountingEntry[]
): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> {
  const token = getCachedToken();
  if (!token) throw new Error("Veuillez vous connecter avec votre compte Google pour accéder à Google Sheets.");

  const title = `Mouhasib - Journal Général - ${company.name} (${new Date().toLocaleDateString('fr-FR')})`;

  // 1. Créer la feuille de calcul
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Échec de création de la feuille Google Sheets.");
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // 2. Préparer les données
  const rows: any[][] = [
    ['MOUHASIB SAAS - LOGICIEL DE COMPTABILITÉ MAROCAINE (PCM)'],
    [`Société: ${company.name}`, `ICE: ${company.ice}`, `IF: ${company.if}`, `Exercice: ${company.fiscalYear}`],
    ['Date d\'exportation:', new Date().toLocaleString('fr-FR')],
    [],
    ['Date', 'Journal', 'Référence', 'Libellé', 'Compte PCM', 'Intitulé Compte', 'Débit (MAD)', 'Crédit (MAD)', 'Statut']
  ];

  entries.forEach(entry => {
    entry.lines.forEach((line, idx) => {
      rows.push([
        idx === 0 ? entry.date : '',
        idx === 0 ? entry.journal : '',
        idx === 0 ? entry.reference : '',
        idx === 0 ? entry.label : '',
        line.accountCode,
        line.accountLabel,
        line.debit > 0 ? line.debit : '',
        line.credit > 0 ? line.credit : '',
        idx === 0 ? entry.status : ''
      ]);
    });
  });

  // 3. Écrire les lignes
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: 'Sheet1!A1',
        majorDimension: 'ROWS',
        values: rows
      })
    }
  );

  if (!updateRes.ok) {
    console.warn("Could not insert rows into sheet");
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}

/**
 * Planifie les échéances fiscales marocaines dans Google Calendar
 */
export async function scheduleMoroccanFiscalDeadlines(company: Company): Promise<number> {
  const token = getCachedToken();
  if (!token) throw new Error("Veuillez vous connecter avec votre compte Google pour accéder à Google Calendar.");

  const year = new Date().getFullYear();
  const deadlines = [
    {
      summary: `[Mouhasib] Déclaration TVA Mensuelle - ${company.name}`,
      description: `Échéance fiscale marocaine légale : télédéclaration et télépaiement de la TVA du mois précédent (Portail SIMPL-TVA DGI).`,
      startDate: `${year}-02-20T09:00:00`,
      endDate: `${year}-02-20T10:00:00`
    },
    {
      summary: `[Mouhasib] Dépôt Liasse Fiscale & 1er Acompte IS - ${company.name}`,
      description: `Échéance marocaine majeure (31 Mars) : Dépôt du bilan et liasse fiscale annuelle + Paiement du 1er acompte provisionnel d'IS.`,
      startDate: `${year}-03-31T09:00:00`,
      endDate: `${year}-03-31T12:00:00`
    },
    {
      summary: `[Mouhasib] 2ème Acompte Provisionnel IS - ${company.name}`,
      description: `Paiement du 2ème acompte trimestriel d'Impôt sur les Sociétés (IS) au Trésor Marocain (DGI).`,
      startDate: `${year}-06-30T09:00:00`,
      endDate: `${year}-06-30T10:00:00`
    },
    {
      summary: `[Mouhasib] 3ème Acompte Provisionnel IS - ${company.name}`,
      description: `Paiement du 3ème acompte trimestriel d'Impôt sur les Sociétés (IS) au Trésor Marocain.`,
      startDate: `${year}-09-30T09:00:00`,
      endDate: `${year}-09-30T10:00:00`
    },
    {
      summary: `[Mouhasib] 4ème Acompte Provisionnel IS - ${company.name}`,
      description: `Paiement du 4ème et dernier acompte de l'exercice pour l'Impôt sur les Sociétés (IS).`,
      startDate: `${year}-12-31T09:00:00`,
      endDate: `${year}-12-31T10:00:00`
    }
  ];

  let addedCount = 0;
  for (const item of deadlines) {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: item.summary,
        description: item.description,
        start: { dateTime: `${item.startDate}Z` },
        end: { dateTime: `${item.endDate}Z` },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 1440 }, // 1 day before
            { method: 'email', minutes: 2880 }  // 2 days before
          ]
        }
      })
    });
    if (res.ok) addedCount++;
  }

  return addedCount;
}

/**
 * Crée une présentation Google Slides pour l'Assemblée Générale Ordinaire (AGO)
 */
export async function createExecutiveSlideDeck(
  company: Company,
  stats: { ca: number; charges: number; resultatNet: number; tresorerie: number }
): Promise<{ presentationId: string; presentationUrl: string }> {
  const token = getCachedToken();
  if (!token) throw new Error("Veuillez vous connecter avec votre compte Google pour accéder à Google Slides.");

  const title = `Mouhasib - Rapport Financier AGO - ${company.name}`;

  // 1. Créer la présentation
  const res = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Échec de création de la présentation Google Slides.");
  }

  const data = await res.json();
  const presentationId = data.presentationId;

  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`
  };
}

/**
 * Ajoute un tiers (client ou fournisseur marocain) dans Google Contacts
 */
export async function syncContactToGoogle(contact: {
  name: string;
  email?: string;
  phone?: string;
  companyName: string;
  jobTitle?: string;
}): Promise<string> {
  const token = getCachedToken();
  if (!token) throw new Error("Veuillez vous connecter avec votre compte Google pour accéder à Google Contacts.");

  const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      names: [{ givenName: contact.name }],
      organizations: [{ name: contact.companyName, title: contact.jobTitle || 'Tiers Comptable' }],
      emailAddresses: contact.email ? [{ value: contact.email, type: 'work' }] : [],
      phoneNumbers: contact.phone ? [{ value: contact.phone, type: 'work' }] : []
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Échec de l'ajout dans Google Contacts.");
  }

  const data = await res.json();
  return data.resourceName;
}
