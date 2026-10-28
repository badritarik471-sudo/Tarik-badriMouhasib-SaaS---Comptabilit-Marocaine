/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Moteur d'importation universel de fichiers Excel (.xls, .xlsx, .csv)
 * pour la comptabilité marocaine
 */

import * as XLSX from 'xlsx';
import { AccountingEntry, Company } from '../types/accounting';
import { parseNaturalLanguageOffline } from './accountingEngine';

export interface ExcelImportResult {
  entries: AccountingEntry[];
  totalRows: number;
  successRows: number;
  errors: string[];
  detectedColumns: string[];
  sheetNames: string[];
}

/**
 * Lit un fichier Excel et extrait les lignes comptables
 */
export async function parseExcelAccountingFile(
  file: File,
  company: Company
): Promise<ExcelImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    throw new Error("Le fichier Excel ne contient aucune feuille de calcul.");
  }

  // Première feuille par défaut
  const sheet = workbook.Sheets[sheetNames[0]];
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  if (rawRows.length === 0) {
    throw new Error("La feuille Excel sélectionnée est vide.");
  }

  const detectedColumns = Object.keys(rawRows[0]);
  const entries: AccountingEntry[] = [];
  const errors: string[] = [];

  // Détection du mode :
  // Mode A : Format Journal classique (avec colonnes Date, Journal, Compte, Libellé, Débit, Crédit)
  // Mode B : Format Transactions / Factures (Date, Tiers/Description, Montant HT ou TTC, TVA)
  const colKeysLower = detectedColumns.map(c => c.toLowerCase());
  const hasDebitCol = colKeysLower.some(c => c.includes('debit') || c.includes('débit'));
  const hasCreditCol = colKeysLower.some(c => c.includes('credit') || c.includes('crédit'));
  const hasCompteCol = colKeysLower.some(c => c.includes('compte') || c.includes('pcm') || c.includes('code'));

  if (hasDebitCol && hasCreditCol && hasCompteCol) {
    // MODE A : JOURNAL CLASSIQUE
    const dateKey = detectedColumns.find(c => /date/i.test(c)) || detectedColumns[0];
    const journalKey = detectedColumns.find(c => /journal/i.test(c));
    const refKey = detectedColumns.find(c => /r[eé]f|pi[eè]ce|facture|num|n°/i.test(c));
    const labelKey = detectedColumns.find(c => /libell[eé]|description|intitul[eé]/i.test(c)) || detectedColumns[1];
    const accountKey = detectedColumns.find(c => /compte|pcm|code/i.test(c)) || 'Compte';
    const debitKey = detectedColumns.find(c => /d[eé]bit/i.test(c)) || 'Debit';
    const creditKey = detectedColumns.find(c => /cr[eé]dit/i.test(c)) || 'Credit';

    // Regrouper par référence ou date
    const grouped = new Map<string, any[]>();
    rawRows.forEach((row, idx) => {
      const ref = String(row[refKey || ''] || `ROW-${idx + 1}`).trim();
      const groupKey = ref || `GRP-${row[dateKey] || idx}`;
      if (!grouped.has(groupKey)) grouped.set(groupKey, []);
      grouped.get(groupKey)!.push(row);
    });

    grouped.forEach((rowsInEntry, gKey) => {
      const firstRow = rowsInEntry[0];
      const entryDate = parseExcelDate(firstRow[dateKey]);
      const entryJournal = firstRow[journalKey || ''] ? String(firstRow[journalKey || '']).toUpperCase() : 'OD';
      const entryLabel = String(firstRow[labelKey] || `Opération ${gKey}`);

      const lines = rowsInEntry.map(r => {
        const rawCode = String(r[accountKey] || '4411').replace(/\D/g, '');
        const debit = parseFloat(String(r[debitKey]).replace(/[\s,]/g, '.')) || 0;
        const credit = parseFloat(String(r[creditKey]).replace(/[\s,]/g, '.')) || 0;
        return {
          accountCode: rawCode || '6111',
          accountLabel: String(r[labelKey] || `Compte ${rawCode}`),
          debit,
          credit
        };
      }).filter(l => l.debit > 0 || l.credit > 0);

      if (lines.length > 0) {
        entries.push({
          id: `excel_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          companyId: company.id,
          date: entryDate,
          reference: gKey,
          journal: ['ACHATS', 'VENTES', 'BANQUE', 'CAISSE', 'OD'].includes(entryJournal) ? (entryJournal as any) : 'OD',
          label: entryLabel,
          status: 'validated',
          source: 'manual',
          lines
        });
      }
    });
  } else {
    // MODE B : LISTE DE TRANSACTIONS OU FACTURES (conversion automatique PCM marocain)
    const dateKey = detectedColumns.find(c => /date/i.test(c)) || detectedColumns[0];
    const descKey = detectedColumns.find(c => /libelle|libellé|description|tiers|fournisseur|client|nature/i.test(c)) || detectedColumns[1];
    const amountKey = detectedColumns.find(c => /montant|total|ttc|ht|valeur/i.test(c)) || detectedColumns[2];
    const tvaKey = detectedColumns.find(c => /tva|taxe/i.test(c));

    rawRows.forEach((row, idx) => {
      const desc = String(row[descKey] || '').trim();
      const rawAmt = String(row[amountKey] || '').replace(/[^\d.,]/g, '').replace(',', '.');
      const amount = parseFloat(rawAmt);

      if (!desc || isNaN(amount) || amount <= 0) {
        errors.push(`Ligne ${idx + 2} : montant ou libellé invalide.`);
        return;
      }

      // Construction d'une phrase pour le moteur d'imputation comptable marocain
      const vatRateStr = tvaKey && row[tvaKey] ? `${row[tvaKey]}%` : '20%';
      const sentence = `${desc} ${amount} HT TVA ${vatRateStr}`;
      const parsed = parseNaturalLanguageOffline(sentence, company.id);

      if (parsed) {
        parsed.date = parseExcelDate(row[dateKey]);
        parsed.reference = `XLS-${(idx + 1).toString().padStart(4, '0')}`;
        parsed.status = 'validated';
        entries.push(parsed);
      } else {
        // Fallback d'écriture par défaut
        entries.push({
          id: `excel_${Date.now()}_${idx}`,
          companyId: company.id,
          date: parseExcelDate(row[dateKey]),
          reference: `XLS-${idx + 1}`,
          journal: 'ACHATS',
          label: desc,
          status: 'validated',
          source: 'manual',
          lines: [
            { accountCode: '6111', accountLabel: 'Achats de marchandises', debit: amount, credit: 0 },
            { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: Math.round(amount * 0.2 * 100) / 100, credit: 0 },
            { accountCode: '4411', accountLabel: 'Fournisseurs', debit: 0, credit: Math.round(amount * 1.2 * 100) / 100 }
          ]
        });
      }
    });
  }

  return {
    entries,
    totalRows: rawRows.length,
    successRows: entries.length,
    errors,
    detectedColumns,
    sheetNames
  };
}

function parseExcelDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) return val.toISOString().split('T')[0];

  const str = String(val).trim();
  // Format DD/MM/YYYY
  const frMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (frMatch) {
    const d = frMatch[1].padStart(2, '0');
    const m = frMatch[2].padStart(2, '0');
    const y = frMatch[3];
    return `${y}-${m}-${d}`;
  }
  // Format YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Génère et télécharge un modèle Excel type (.xlsx) pour l'utilisateur
 */
export function generateExcelTemplate(): void {
  const templateData = [
    {
      'Date': '2026-01-05',
      'Journal': 'ACHATS',
      'Référence': 'FAC-ATLAS-101',
      'Compte PCM': '6111',
      'Intitulé du compte': 'Achats de marchandises',
      'Débit (MAD)': 120000,
      'Crédit (MAD)': 0,
      'Libellé de l\'opération': 'Achat marchandises fournisseur Atlas'
    },
    {
      'Date': '2026-01-05',
      'Journal': 'ACHATS',
      'Référence': 'FAC-ATLAS-101',
      'Compte PCM': '34552',
      'Intitulé du compte': 'État - TVA récupérable sur charges',
      'Débit (MAD)': 24000,
      'Crédit (MAD)': 0,
      'Libellé de l\'opération': 'TVA 20% Facture Atlas'
    },
    {
      'Date': '2026-01-05',
      'Journal': 'ACHATS',
      'Référence': 'FAC-ATLAS-101',
      'Compte PCM': '4411',
      'Intitulé du compte': 'Fournisseurs',
      'Débit (MAD)': 0,
      'Crédit (MAD)': 144000,
      'Libellé de l\'opération': 'Dette fournisseur Atlas Maroc'
    },
    {
      'Date': '2026-01-10',
      'Journal': 'VENTES',
      'Référence': 'VTE-CASATRADE-01',
      'Compte PCM': '3421',
      'Intitulé du compte': 'Clients',
      'Débit (MAD)': 216000,
      'Crédit (MAD)': 0,
      'Libellé de l\'opération': 'Créance client Casablanca Trading'
    },
    {
      'Date': '2026-01-10',
      'Journal': 'VENTES',
      'Référence': 'VTE-CASATRADE-01',
      'Compte PCM': '7111',
      'Intitulé du compte': 'Ventes de marchandises au Maroc',
      'Débit (MAD)': 0,
      'Crédit (MAD)': 180000,
      'Libellé de l\'opération': 'Vente marchandises Maroc'
    },
    {
      'Date': '2026-01-10',
      'Journal': 'VENTES',
      'Référence': 'VTE-CASATRADE-01',
      'Compte PCM': '4455',
      'Intitulé du compte': 'État, TVA facturée',
      'Débit (MAD)': 0,
      'Crédit (MAD)': 36000,
      'Libellé de l\'opération': 'TVA facturée 20%'
    },
    {
      'Date': '2026-01-15',
      'Journal': 'BANQUE',
      'Référence': 'LOY-ANFA-01',
      'Compte PCM': '6131',
      'Intitulé du compte': 'Locations et charges locatives',
      'Débit (MAD)': 15000,
      'Crédit (MAD)': 0,
      'Libellé de l\'opération': 'Loyer bureau Boulevard Anfa'
    },
    {
      'Date': '2026-01-15',
      'Journal': 'BANQUE',
      'Référence': 'LOY-ANFA-01',
      'Compte PCM': '34552',
      'Intitulé du compte': 'État - TVA récupérable sur charges',
      'Débit (MAD)': 3000,
      'Crédit (MAD)': 0,
      'Libellé de l\'opération': 'TVA loyer commercial 20%'
    },
    {
      'Date': '2026-01-15',
      'Journal': 'BANQUE',
      'Référence': 'LOY-ANFA-01',
      'Compte PCM': '5141',
      'Intitulé du compte': 'Banques',
      'Débit (MAD)': 0,
      'Crédit (MAD)': 18000,
      'Libellé de l\'opération': 'Paiement virement bancaire CIH'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Comptabilité');

  XLSX.writeFile(workbook, 'Modele_Comptabilite_Marocaine_Mouhasib.xlsx');
}
