/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Moteur comptable marocain (CGNC / PCM)
 */

import { AccountingEntry, EntryLine, VatSummary } from '../types/accounting';
import { findAccountByCode } from '../data/planComptableMarocain';

export interface GrandLivreAccount {
  accountCode: string;
  accountLabel: string;
  lines: Array<{
    date: string;
    entryRef: string;
    entryLabel: string;
    debit: number;
    credit: number;
    runningBalance: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  soldeDebiteur: number;
  soldeCrediteur: number;
}

export interface BalanceRow {
  accountCode: string;
  accountLabel: string;
  classe: number;
  cumulDebit: number;
  cumulCredit: number;
  soldeDebiteur: number;
  soldeCrediteur: number;
}

export interface CPCStatement {
  // Exploitation
  produitsExploitation: { [key: string]: number };
  totalProduitsExploitation: number;
  chargesExploitation: { [key: string]: number };
  totalChargesExploitation: number;
  resultatExploitation: number;

  // Financier
  produitsFinanciers: { [key: string]: number };
  totalProduitsFinanciers: number;
  chargesFinancieres: { [key: string]: number };
  totalChargesFinancieres: number;
  resultatFinancier: number;

  // Courant
  resultatCourant: number;

  // Non Courant
  produitsNonCourants: { [key: string]: number };
  totalProduitsNonCourants: number;
  chargesNonCourantes: { [key: string]: number };
  totalChargesNonCourantes: number;
  resultatNonCourant: number;

  // Résultat Final
  resultatAvantImpot: number;
  impotsSurResultat: number;
  resultatNet: number;
}

export interface ESGStatement {
  ventesMarchandises: number;
  achatsRevendusMarchandises: number;
  margeBrute: number;
  productionExercice: number;
  consommationExercice: number;
  valeurAjoutee: number;
  subventionsExploitation: number;
  impotsTaxes: number;
  chargesPersonnel: number;
  excedentBrutExploitation: number; // EBE ou IBE
  autresProduitsExploitation: number;
  autresChargesExploitation: number;
  reprisesExploitation: number;
  dotationsExploitation: number;
  resultatExploitation: number;
  resultatFinancier: number;
  resultatCourant: number;
  resultatNonCourant: number;
  impotsSurResultat: number;
  resultatNet: number;
  // Capacité d'autofinancement
  capaciteAutofinancement: number; // CAF
}

export interface BilanStatement {
  actif: {
    immobilise: {
      nonValeur: number;
      incorporelles: number;
      corporelles: number;
      financieres: number;
      amortissements: number;
      totalNet: number;
    };
    circulant: {
      stocks: number;
      creancesClients: number;
      etatDebiteur: number;
      autresDebiteurs: number;
      totalNet: number;
    };
    tresorerie: {
      banques: number;
      caisse: number;
      totalNet: number;
    };
    totalActif: number;
  };
  passif: {
    financementPermanent: {
      capitalSocial: number;
      reserves: number;
      reportANouveau: number;
      resultatNet: number;
      dettesFinancement: number;
      totalNet: number;
    };
    passifCirculant: {
      fournisseurs: number;
      dettesFiscalesSociales: number;
      autresCreanciers: number;
      totalNet: number;
    };
    tresorerie: {
      decouvertsBanques: number;
      creditsTresorerie: number;
      totalNet: number;
    };
    totalPassif: number;
  };
  equilibre: boolean;
  ecart: number;
}

/**
 * Calcule le Grand Livre complet
 */
export function computeGrandLivre(entries: AccountingEntry[]): GrandLivreAccount[] {
  const accountsMap = new Map<string, {
    label: string;
    lines: Array<{
      date: string;
      entryRef: string;
      entryLabel: string;
      debit: number;
      credit: number;
      runningBalance: number;
    }>;
    totalDebit: number;
    totalCredit: number;
  }>();

  // Filtrer les écritures validées (ou toutes si non drafts)
  const validEntries = entries.filter(e => e.status !== 'draft');

  validEntries.forEach(entry => {
    entry.lines.forEach(line => {
      if (!accountsMap.has(line.accountCode)) {
        const info = findAccountByCode(line.accountCode);
        accountsMap.set(line.accountCode, {
          label: info?.label || line.accountLabel,
          lines: [],
          totalDebit: 0,
          totalCredit: 0
        });
      }

      const acc = accountsMap.get(line.accountCode)!;
      acc.totalDebit += line.debit;
      acc.totalCredit += line.credit;
      const currentBalance = acc.totalDebit - acc.totalCredit;

      acc.lines.push({
        date: entry.date,
        entryRef: entry.reference,
        entryLabel: entry.label,
        debit: line.debit,
        credit: line.credit,
        runningBalance: currentBalance
      });
    });
  });

  const result: GrandLivreAccount[] = [];

  accountsMap.forEach((val, code) => {
    const diff = val.totalDebit - val.totalCredit;
    result.push({
      accountCode: code,
      accountLabel: val.label,
      lines: val.lines.sort((a, b) => a.date.localeCompare(b.date)),
      totalDebit: Math.round(val.totalDebit * 100) / 100,
      totalCredit: Math.round(val.totalCredit * 100) / 100,
      soldeDebiteur: diff > 0 ? Math.round(diff * 100) / 100 : 0,
      soldeCrediteur: diff < 0 ? Math.round(Math.abs(diff) * 100) / 100 : 0
    });
  });

  return result.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
}

/**
 * Calcule la Balance générale
 */
export function computeBalance(entries: AccountingEntry[]): BalanceRow[] {
  const gl = computeGrandLivre(entries);
  return gl.map(acc => ({
    accountCode: acc.accountCode,
    accountLabel: acc.accountLabel,
    classe: Number(acc.accountCode[0]) || 0,
    cumulDebit: acc.totalDebit,
    cumulCredit: acc.totalCredit,
    soldeDebiteur: acc.soldeDebiteur,
    soldeCrediteur: acc.soldeCrediteur
  }));
}

/**
 * Calcule le Compte de Produits et Charges (CPC) marocain
 */
export function computeCPC(entries: AccountingEntry[]): CPCStatement {
  const balance = computeBalance(entries);

  const getSoldeCharge = (prefix: string) => {
    return balance
      .filter(r => r.accountCode.startsWith(prefix))
      .reduce((sum, r) => sum + (r.cumulDebit - r.cumulCredit), 0);
  };

  const getSoldeProduit = (prefix: string) => {
    return balance
      .filter(r => r.accountCode.startsWith(prefix))
      .reduce((sum, r) => sum + (r.cumulCredit - r.cumulDebit), 0);
  };

  // 1. Produits d'exploitation (71)
  const ventesMarchandises = getSoldeProduit('711');
  const ventesBiensServices = getSoldeProduit('712');
  const variationStocksProduits = getSoldeProduit('713');
  const immoProduites = getSoldeProduit('714');
  const subventionsExploitation = getSoldeProduit('716');
  const autresProduitsExploitation = getSoldeProduit('718');
  const reprisesExploitation = getSoldeProduit('719');

  const produitsExploitation = {
    'Ventes de marchandises': ventesMarchandises,
    'Ventes de biens et services produits': ventesBiensServices,
    'Variation des stocks de produits': variationStocksProduits,
    'Immobilisations produites par l’entreprise': immoProduites,
    'Subventions d’exploitation': subventionsExploitation,
    'Autres produits d’exploitation': autresProduitsExploitation,
    'Reprises d’exploitation & transferts': reprisesExploitation
  };
  const totalProduitsExploitation = Object.values(produitsExploitation).reduce((a, b) => a + b, 0);

  // 2. Charges d'exploitation (61)
  const achatsRevendusMarchandises = getSoldeCharge('611');
  const achatsConsommesMatieres = getSoldeCharge('612');
  const autresChargesExternes = getSoldeCharge('613') + getSoldeCharge('614');
  const impotsEtTaxes = getSoldeCharge('616');
  const chargesPersonnel = getSoldeCharge('617');
  const autresChargesExploitation = getSoldeCharge('618');
  const dotationsExploitation = getSoldeCharge('619');

  const chargesExploitation = {
    'Achats revendus de marchandises': achatsRevendusMarchandises,
    'Achats consommés de matières et fournitures': achatsConsommesMatieres,
    'Autres charges externes (loyers, honoraires, etc.)': autresChargesExternes,
    'Impôts et taxes': impotsEtTaxes,
    'Charges de personnel (salaires, CNSS)': chargesPersonnel,
    'Autres charges d’exploitation': autresChargesExploitation,
    'Dotations d’exploitation (amortissements)': dotationsExploitation
  };
  const totalChargesExploitation = Object.values(chargesExploitation).reduce((a, b) => a + b, 0);

  const resultatExploitation = totalProduitsExploitation - totalChargesExploitation;

  // 3. Financier (73 & 63)
  const produitsFinanciers = {
    'Produits des titres de participation': getSoldeProduit('732'),
    'Gains de change': getSoldeProduit('733'),
    'Intérêts et autres produits financiers': getSoldeProduit('738'),
    'Reprises financières': getSoldeProduit('739')
  };
  const totalProduitsFinanciers = Object.values(produitsFinanciers).reduce((a, b) => a + b, 0);

  const chargesFinancieres = {
    'Charges d’intérêts': getSoldeCharge('631'),
    'Pertes de change': getSoldeCharge('633'),
    'Autres charges financières': getSoldeCharge('638'),
    'Dotations financières': getSoldeCharge('639')
  };
  const totalChargesFinancieres = Object.values(chargesFinancieres).reduce((a, b) => a + b, 0);
  const resultatFinancier = totalProduitsFinanciers - totalChargesFinancieres;

  // 4. Courant
  const resultatCourant = resultatExploitation + resultatFinancier;

  // 5. Non Courant (75 & 65)
  const produitsNonCourants = {
    'Produits des cessions d’immobilisations': getSoldeProduit('751'),
    'Subventions d’équilibre': getSoldeProduit('756'),
    'Autres produits non courants': getSoldeProduit('758'),
    'Reprises non courantes': getSoldeProduit('759')
  };
  const totalProduitsNonCourants = Object.values(produitsNonCourants).reduce((a, b) => a + b, 0);

  const chargesNonCourantes = {
    'Valeurs nettes d’amortissements des immobilisations cédées': getSoldeCharge('651'),
    'Subventions accordées': getSoldeCharge('656'),
    'Autres charges non courantes (amendes, pénalités)': getSoldeCharge('658'),
    'Dotations non courantes': getSoldeCharge('659')
  };
  const totalChargesNonCourantes = Object.values(chargesNonCourantes).reduce((a, b) => a + b, 0);
  const resultatNonCourant = totalProduitsNonCourants - totalChargesNonCourantes;

  // 6. Impôts et Résultat Net
  const resultatAvantImpot = resultatCourant + resultatNonCourant;
  const impotsSurResultat = getSoldeCharge('6701') + getSoldeCharge('6705');
  const resultatNet = resultatAvantImpot - impotsSurResultat;

  return {
    produitsExploitation,
    totalProduitsExploitation: Math.round(totalProduitsExploitation * 100) / 100,
    chargesExploitation,
    totalChargesExploitation: Math.round(totalChargesExploitation * 100) / 100,
    resultatExploitation: Math.round(resultatExploitation * 100) / 100,
    produitsFinanciers,
    totalProduitsFinanciers: Math.round(totalProduitsFinanciers * 100) / 100,
    chargesFinancieres,
    totalChargesFinancieres: Math.round(totalChargesFinancieres * 100) / 100,
    resultatFinancier: Math.round(resultatFinancier * 100) / 100,
    resultatCourant: Math.round(resultatCourant * 100) / 100,
    produitsNonCourants,
    totalProduitsNonCourants: Math.round(totalProduitsNonCourants * 100) / 100,
    chargesNonCourantes,
    totalChargesNonCourantes: Math.round(totalChargesNonCourantes * 100) / 100,
    resultatNonCourant: Math.round(resultatNonCourant * 100) / 100,
    resultatAvantImpot: Math.round(resultatAvantImpot * 100) / 100,
    impotsSurResultat: Math.round(impotsSurResultat * 100) / 100,
    resultatNet: Math.round(resultatNet * 100) / 100
  };
}

/**
 * Calcule l'État des Soldes de Gestion (ESG) marocain et la CAF
 */
export function computeESG(entries: AccountingEntry[]): ESGStatement {
  const cpc = computeCPC(entries);
  const balance = computeBalance(entries);

  const ventesMarchandises = cpc.produitsExploitation['Ventes de marchandises'] || 0;
  const achatsRevendusMarchandises = cpc.chargesExploitation['Achats revendus de marchandises'] || 0;
  const margeBrute = ventesMarchandises - achatsRevendusMarchandises;

  const productionExercice = (cpc.produitsExploitation['Ventes de biens et services produits'] || 0)
    + (cpc.produitsExploitation['Variation des stocks de produits'] || 0)
    + (cpc.produitsExploitation['Immobilisations produites par l’entreprise'] || 0);

  const consommationExercice = (cpc.chargesExploitation['Achats consommés de matières et fournitures'] || 0)
    + (cpc.chargesExploitation['Autres charges externes (loyers, honoraires, etc.)'] || 0);

  const valeurAjoutee = margeBrute + productionExercice - consommationExercice;

  const subventionsExploitation = cpc.produitsExploitation['Subventions d’exploitation'] || 0;
  const impotsTaxes = cpc.chargesExploitation['Impôts et taxes'] || 0;
  const chargesPersonnel = cpc.chargesExploitation['Charges de personnel (salaires, CNSS)'] || 0;

  const excedentBrutExploitation = valeurAjoutee + subventionsExploitation - impotsTaxes - chargesPersonnel;

  // Calcul CAF (Capacité d'Autofinancement)
  const dotationsExploitation = cpc.chargesExploitation['Dotations d’exploitation (amortissements)'] || 0;
  const reprisesExploitation = cpc.produitsExploitation['Reprises d’exploitation & transferts'] || 0;
  const vna = cpc.chargesNonCourantes['Valeurs nettes d’amortissements des immobilisations cédées'] || 0;
  const produitsCession = cpc.produitsNonCourants['Produits des cessions d’immobilisations'] || 0;

  const capaciteAutofinancement = cpc.resultatNet + dotationsExploitation - reprisesExploitation + vna - produitsCession;

  return {
    ventesMarchandises,
    achatsRevendusMarchandises,
    margeBrute: Math.round(margeBrute * 100) / 100,
    productionExercice: Math.round(productionExercice * 100) / 100,
    consommationExercice: Math.round(consommationExercice * 100) / 100,
    valeurAjoutee: Math.round(valeurAjoutee * 100) / 100,
    subventionsExploitation,
    impotsTaxes,
    chargesPersonnel,
    excedentBrutExploitation: Math.round(excedentBrutExploitation * 100) / 100,
    autresProduitsExploitation: cpc.produitsExploitation['Autres produits d’exploitation'] || 0,
    autresChargesExploitation: cpc.chargesExploitation['Autres charges d’exploitation'] || 0,
    reprisesExploitation,
    dotationsExploitation,
    resultatExploitation: cpc.resultatExploitation,
    resultatFinancier: cpc.resultatFinancier,
    resultatCourant: cpc.resultatCourant,
    resultatNonCourant: cpc.resultatNonCourant,
    impotsSurResultat: cpc.impotsSurResultat,
    resultatNet: cpc.resultatNet,
    capaciteAutofinancement: Math.round(capaciteAutofinancement * 100) / 100
  };
}

/**
 * Calcule le Bilan (Actif & Passif) conforme au modèle marocain
 */
export function computeBilan(entries: AccountingEntry[]): BilanStatement {
  const balance = computeBalance(entries);
  const cpc = computeCPC(entries);

  const getSoldeNet = (prefix: string, debitPositive = true) => {
    return balance
      .filter(r => r.accountCode.startsWith(prefix))
      .reduce((sum, r) => {
        const net = r.cumulDebit - r.cumulCredit;
        return sum + (debitPositive ? net : -net);
      }, 0);
  };

  // ACTIF
  const nonValeur = Math.max(0, getSoldeNet('21', true));
  const incorporelles = Math.max(0, getSoldeNet('22', true));
  const corporelles = Math.max(0, getSoldeNet('23', true));
  const financieres = Math.max(0, getSoldeNet('24', true) + getSoldeNet('25', true));
  const amortissements = Math.abs(getSoldeNet('28', false));
  const totalActifImmobilise = nonValeur + incorporelles + corporelles + financieres - amortissements;

  const stocks = Math.max(0, getSoldeNet('31', true));
  const creancesClients = Math.max(0, getSoldeNet('342', true));
  const etatDebiteur = Math.max(0, getSoldeNet('345', true));
  const autresDebiteurs = Math.max(0, getSoldeNet('341', true) + getSoldeNet('343', true) + getSoldeNet('348', true) + getSoldeNet('35', true));
  const totalActifCirculant = stocks + creancesClients + etatDebiteur + autresDebiteurs;

  const banques = Math.max(0, getSoldeNet('514', true));
  const caisse = Math.max(0, getSoldeNet('516', true));
  const totalTresorerieActif = banques + caisse;

  const totalActif = totalActifImmobilise + totalActifCirculant + totalTresorerieActif;

  // PASSIF
  const capitalSocial = Math.max(0, getSoldeNet('111', false));
  const reserves = Math.max(0, getSoldeNet('114', false) + getSoldeNet('115', false));
  const reportANouveau = getSoldeNet('1161', false) - getSoldeNet('1169', true);
  const resultatNetExercice = cpc.resultatNet; // Intégration du résultat du CPC
  const dettesFinancement = Math.max(0, getSoldeNet('14', false));
  const totalFinancementPermanent = capitalSocial + reserves + reportANouveau + resultatNetExercice + dettesFinancement;

  const fournisseurs = Math.max(0, getSoldeNet('441', false));
  const dettesFiscalesSociales = Math.max(0, getSoldeNet('443', false) + getSoldeNet('444', false) + getSoldeNet('445', false));
  const autresCreanciers = Math.max(0, getSoldeNet('446', false) + getSoldeNet('448', false));
  const totalPassifCirculant = fournisseurs + dettesFiscalesSociales + autresCreanciers;

  const decouvertsBanques = Math.max(0, getSoldeNet('554', false));
  const creditsTresorerie = Math.max(0, getSoldeNet('553', false));
  const totalTresoreriePassif = decouvertsBanques + creditsTresorerie;

  const totalPassif = totalFinancementPermanent + totalPassifCirculant + totalTresoreriePassif;

  const ecart = Math.round((totalActif - totalPassif) * 100) / 100;

  return {
    actif: {
      immobilise: {
        nonValeur: Math.round(nonValeur * 100) / 100,
        incorporelles: Math.round(incorporelles * 100) / 100,
        corporelles: Math.round(corporelles * 100) / 100,
        financieres: Math.round(financieres * 100) / 100,
        amortissements: Math.round(amortissements * 100) / 100,
        totalNet: Math.round(totalActifImmobilise * 100) / 100
      },
      circulant: {
        stocks: Math.round(stocks * 100) / 100,
        creancesClients: Math.round(creancesClients * 100) / 100,
        etatDebiteur: Math.round(etatDebiteur * 100) / 100,
        autresDebiteurs: Math.round(autresDebiteurs * 100) / 100,
        totalNet: Math.round(totalActifCirculant * 100) / 100
      },
      tresorerie: {
        banques: Math.round(banques * 100) / 100,
        caisse: Math.round(caisse * 100) / 100,
        totalNet: Math.round(totalTresorerieActif * 100) / 100
      },
      totalActif: Math.round(totalActif * 100) / 100
    },
    passif: {
      financementPermanent: {
        capitalSocial: Math.round(capitalSocial * 100) / 100,
        reserves: Math.round(reserves * 100) / 100,
        reportANouveau: Math.round(reportANouveau * 100) / 100,
        resultatNet: Math.round(resultatNetExercice * 100) / 100,
        dettesFinancement: Math.round(dettesFinancement * 100) / 100,
        totalNet: Math.round(totalFinancementPermanent * 100) / 100
      },
      passifCirculant: {
        fournisseurs: Math.round(fournisseurs * 100) / 100,
        dettesFiscalesSociales: Math.round(dettesFiscalesSociales * 100) / 100,
        autresCreanciers: Math.round(autresCreanciers * 100) / 100,
        totalNet: Math.round(totalPassifCirculant * 100) / 100
      },
      tresorerie: {
        decouvertsBanques: Math.round(decouvertsBanques * 100) / 100,
        creditsTresorerie: Math.round(creditsTresorerie * 100) / 100,
        totalNet: Math.round(totalTresoreriePassif * 100) / 100
      },
      totalPassif: Math.round(totalPassif * 100) / 100
    },
    equilibre: Math.abs(ecart) < 0.05,
    ecart
  };
}

/**
 * Calcule l'État récapitulatif de TVA marocaine
 */
export function computeVatSummary(entries: AccountingEntry[]): VatSummary {
  let vat20 = 0;
  let vat14 = 0;
  let vat10 = 0;
  let vat7 = 0;
  let vatRecoverableCharges = 0;
  let vatRecoverableImmo = 0;
  let priorCredit = 0;

  entries.filter(e => e.status !== 'draft').forEach(entry => {
    entry.lines.forEach(line => {
      if (line.accountCode === '4455') {
        const amt = line.credit - line.debit;
        if (entry.vatRate === 14) vat14 += amt;
        else if (entry.vatRate === 10) vat10 += amt;
        else if (entry.vatRate === 7) vat7 += amt;
        else vat20 += amt;
      }
      if (line.accountCode === '34552') {
        vatRecoverableCharges += (line.debit - line.credit);
      }
      if (line.accountCode === '34551') {
        vatRecoverableImmo += (line.debit - line.credit);
      }
      if (line.accountCode === '3456') {
        priorCredit += (line.debit - line.credit);
      }
    });
  });

  const totalVatCollected = Math.round((vat20 + vat14 + vat10 + vat7) * 100) / 100;
  const totalVatRecoverable = Math.round((vatRecoverableCharges + vatRecoverableImmo) * 100) / 100;
  const netDue = totalVatCollected - totalVatRecoverable - priorCredit;

  return {
    period: 'Exercice 2026',
    vatCollected20: Math.round(vat20 * 100) / 100,
    vatCollected14: Math.round(vat14 * 100) / 100,
    vatCollected10: Math.round(vat10 * 100) / 100,
    vatCollected7: Math.round(vat7 * 100) / 100,
    totalVatCollected,
    vatRecoverableCharges: Math.round(vatRecoverableCharges * 100) / 100,
    vatRecoverableImmo: Math.round(vatRecoverableImmo * 100) / 100,
    totalVatRecoverable,
    priorCredit: Math.round(priorCredit * 100) / 100,
    vatDue: netDue > 0 ? Math.round(netDue * 100) / 100 : 0,
    currentCredit: netDue < 0 ? Math.round(Math.abs(netDue) * 100) / 100 : 0
  };
}

/**
 * Analyseur d'écriture en langage naturel hors-ligne (Fallback)
 * Reconnait les phrases types : "Achat de marchandises 120 000 HT fournisseur Atlas", "Vente conseil 45000", etc.
 */
export function parseNaturalLanguageOffline(text: string, companyId: string): AccountingEntry | null {
  const lower = text.toLowerCase();

  // Extraction montant (ex: 120 000 ou 120000 ou 45,50)
  const amountMatch = text.match(/(\d[\d\s.,]*\d|\d+)/);
  if (!amountMatch) return null;
  const rawNumber = amountMatch[0].replace(/\s/g, '').replace(',', '.');
  const amount = parseFloat(rawNumber);
  if (isNaN(amount) || amount <= 0) return null;

  // Détection TTC vs HT
  const isTTC = lower.includes('ttc');

  // Détection Taux de TVA (20%, 14%, 10%, 7%, ou exonéré)
  let vatRate = 20; // Par défaut au Maroc
  if (lower.includes('14%') || lower.includes('14 %') || lower.includes('électricité') || lower.includes('eau') || lower.includes('onee') || lower.includes('lydec') || lower.includes('redal')) {
    vatRate = 14;
  } else if (lower.includes('10%') || lower.includes('10 %') || lower.includes('avocat') || lower.includes('notaire') || lower.includes('expert') || lower.includes('fiduciaire') || lower.includes('banque')) {
    vatRate = 10;
  } else if (lower.includes('7%') || lower.includes('7 %') || lower.includes('médicament') || lower.includes('sucre') || lower.includes('lait')) {
    vatRate = 7;
  } else if (lower.includes('exonéré') || lower.includes('sans tva') || lower.includes('0%') || lower.includes('export')) {
    vatRate = 0;
  }

  let amountHT = amount;
  let vatAmount = 0;
  let amountTTC = amount;

  if (isTTC) {
    amountHT = Math.round((amount / (1 + vatRate / 100)) * 100) / 100;
    vatAmount = Math.round((amount - amountHT) * 100) / 100;
    amountTTC = amount;
  } else {
    vatAmount = Math.round((amount * (vatRate / 100)) * 100) / 100;
    amountTTC = Math.round((amount + vatAmount) * 100) / 100;
  }

  const today = new Date().toISOString().split('T')[0];
  const ref = `OD-${Date.now().toString().slice(-4)}`;

  // Détection du type d'opération
  if (lower.includes('achat') || lower.includes('fournisseur') || lower.includes('facture reçu')) {
    let chargeCode = '6111';
    let chargeLabel = 'Achats de marchandises';

    if (lower.includes('matière') || lower.includes('mp')) {
      chargeCode = '6121';
      chargeLabel = 'Achats de matières premières';
    } else if (lower.includes('électricité') || lower.includes('eau') || lower.includes('lydec') || lower.includes('onee')) {
      chargeCode = '61251';
      chargeLabel = 'Achats fournitures non stockables (Eau, Électricité)';
    } else if (lower.includes('fourniture') || lower.includes('papier') || lower.includes('bureau')) {
      chargeCode = '61227';
      chargeLabel = 'Fournitures de bureau';
    } else if (lower.includes('outillage') || lower.includes('outil')) {
      chargeCode = '61253';
      chargeLabel = 'Petit outillage et équipement';
    } else if (lower.includes('loyer') || lower.includes('location')) {
      chargeCode = '6131';
      chargeLabel = 'Locations et charges locatives';
    } else if (lower.includes('honoraire') || lower.includes('avocat') || lower.includes('fiduciaire') || lower.includes('expert')) {
      chargeCode = '61365';
      chargeLabel = 'Honoraires (expert-comptable, avocat)';
    } else if (lower.includes('ordinateur') || lower.includes('matériel informatique') || lower.includes('pc') || lower.includes('serveur')) {
      // Immobilisation
      return {
        id: `entry_${Date.now()}`,
        companyId,
        date: today,
        reference: ref,
        journal: 'OD',
        label: text,
        vatRate,
        vatAmount,
        status: 'draft',
        source: 'ai_prompt',
        lines: [
          { accountCode: '2355', accountLabel: 'Matériel informatique', debit: amountHT, credit: 0 },
          { accountCode: '34551', accountLabel: 'État - TVA récupérable sur immobilisations', debit: vatAmount, credit: 0 },
          { accountCode: '4481', accountLabel: "Dettes sur acquisitions d'immobilisations", debit: 0, credit: amountTTC }
        ]
      };
    }

    return {
      id: `entry_${Date.now()}`,
      companyId,
      date: today,
      reference: ref,
      journal: 'ACHATS',
      label: text,
      vatRate,
      vatAmount,
      status: 'draft',
      source: 'ai_prompt',
      lines: [
        { accountCode: chargeCode, accountLabel: chargeLabel, debit: amountHT, credit: 0 },
        ...(vatAmount > 0 ? [{ accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: vatAmount, credit: 0 }] : []),
        { accountCode: '4411', accountLabel: 'Fournisseurs', debit: 0, credit: amountTTC }
      ]
    };
  }

  if (lower.includes('vente') || lower.includes('client') || lower.includes('facture émise') || lower.includes('prestation')) {
    let produitCode = '7111';
    let produitLabel = 'Ventes de marchandises au Maroc';

    if (lower.includes('prestation') || lower.includes('service') || lower.includes('conseil') || lower.includes('développement')) {
      produitCode = '71243';
      produitLabel = 'Prestations de services au Maroc';
    } else if (lower.includes('export') || lower.includes('étranger')) {
      produitCode = '7113';
      produitLabel = "Ventes de marchandises à l'étranger";
    }

    return {
      id: `entry_${Date.now()}`,
      companyId,
      date: today,
      reference: ref,
      journal: 'VENTES',
      label: text,
      vatRate,
      vatAmount,
      status: 'draft',
      source: 'ai_prompt',
      lines: [
        { accountCode: '3421', accountLabel: 'Clients', debit: amountTTC, credit: 0 },
        { accountCode: produitCode, accountLabel: produitLabel, debit: 0, credit: amountHT },
        ...(vatAmount > 0 ? [{ accountCode: '4455', accountLabel: 'État, TVA facturée', debit: 0, credit: vatAmount }] : [])
      ]
    };
  }

  if (lower.includes('règlement') || lower.includes('paiement fournisseur') || lower.includes('payé fournisseur')) {
    return {
      id: `entry_${Date.now()}`,
      companyId,
      date: today,
      reference: ref,
      journal: 'BANQUE',
      label: text,
      status: 'draft',
      source: 'ai_prompt',
      lines: [
        { accountCode: '4411', accountLabel: 'Fournisseurs', debit: amount, credit: 0 },
        { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 0, credit: amount }
      ]
    };
  }

  if (lower.includes('encaissement') || lower.includes('reçu client') || lower.includes('règlement client')) {
    return {
      id: `entry_${Date.now()}`,
      companyId,
      date: today,
      reference: ref,
      journal: 'BANQUE',
      label: text,
      status: 'draft',
      source: 'ai_prompt',
      lines: [
        { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: amount, credit: 0 },
        { accountCode: '3421', accountLabel: 'Clients', debit: 0, credit: amount }
      ]
    };
  }

  return null;
}
