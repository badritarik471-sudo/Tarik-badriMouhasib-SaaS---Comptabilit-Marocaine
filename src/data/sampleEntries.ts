/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountingEntry, Company } from '../types/accounting';

export const SAMPLE_COMPANY: Company = {
  id: 'comp_maroc_demo_01',
  name: 'ATLAS TECH SOLUTIONS SARL-AU',
  ice: '002938475000042',
  if: '45892147',
  rc: '528914 Casa',
  patente: '34567890',
  legalForm: 'SARL-AU',
  capital: 300000,
  fiscalYear: '2026',
  address: 'Boulevard d’Anfa, Quartier Gauthier',
  city: 'Casablanca',
  createdAt: '2026-01-01T09:00:00.000Z'
};

export const SAMPLE_ENTRIES: AccountingEntry[] = [
  {
    id: 'entry_01',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-02',
    reference: 'CAP-2026-001',
    journal: 'BANQUE',
    label: 'Constitution du capital social par virement bancaire CIH',
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 300000, credit: 0 },
      { accountCode: '1111', accountLabel: 'Capital social', debit: 0, credit: 300000 }
    ]
  },
  {
    id: 'entry_02',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-05',
    reference: 'FAC-ATLAS-901',
    journal: 'ACHATS',
    label: 'Achat de marchandises 120 000 HT fournisseur Atlas Maroc',
    vatRate: 20,
    vatAmount: 24000,
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '6111', accountLabel: 'Achats de marchandises', debit: 120000, credit: 0 },
      { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: 24000, credit: 0 },
      { accountCode: '4411', accountLabel: 'Fournisseurs (Atlas Maroc)', debit: 0, credit: 144000 }
    ]
  },
  {
    id: 'entry_03',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-08',
    reference: 'VTE-2026-001',
    journal: 'VENTES',
    label: 'Vente de marchandises au Maroc client Casablanca Trading',
    vatRate: 20,
    vatAmount: 36000,
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '3421', accountLabel: 'Clients (Casablanca Trading)', debit: 216000, credit: 0 },
      { accountCode: '7111', accountLabel: 'Ventes de marchandises au Maroc', debit: 0, credit: 180000 },
      { accountCode: '4455', accountLabel: 'État, TVA facturée (20%)', debit: 0, credit: 36000 }
    ]
  },
  {
    id: 'entry_04',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-10',
    reference: 'LOY-JAN-26',
    journal: 'BANQUE',
    label: 'Paiement loyer des bureaux Casablanca par virement',
    vatRate: 20,
    vatAmount: 3000,
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '6131', accountLabel: 'Locations et charges locatives', debit: 15000, credit: 0 },
      { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: 3000, credit: 0 },
      { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 0, credit: 18000 }
    ]
  },
  {
    id: 'entry_05',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-12',
    reference: 'LYDEC-0126',
    journal: 'BANQUE',
    label: 'Facture électricité et eau Lydec siège social (TVA 14%)',
    vatRate: 14,
    vatAmount: 490,
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '61251', accountLabel: 'Achats de fournitures non stockables (Eau, Électricité)', debit: 3500, credit: 0 },
      { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: 490, credit: 0 },
      { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 0, credit: 3990 }
    ]
  },
  {
    id: 'entry_06',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-15',
    reference: 'DELL-IMM-01',
    journal: 'OD',
    label: 'Acquisition serveurs et ordinateurs portables Dell Maroc',
    vatRate: 20,
    vatAmount: 5000,
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '2355', accountLabel: 'Matériel informatique', debit: 25000, credit: 0 },
      { accountCode: '34551', accountLabel: 'État - TVA récupérable sur immobilisations', debit: 5000, credit: 0 },
      { accountCode: '4481', accountLabel: "Dettes sur acquisitions d'immobilisations", debit: 0, credit: 30000 }
    ]
  },
  {
    id: 'entry_07',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-20',
    reference: 'HON-EXP-01',
    journal: 'ACHATS',
    label: 'Honoraires fiduciaire et expert-comptable (TVA 10%)',
    vatRate: 10,
    vatAmount: 1000,
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '61365', accountLabel: 'Honoraires (expert-comptable, avocat)', debit: 10000, credit: 0 },
      { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: 1000, credit: 0 },
      { accountCode: '4411', accountLabel: 'Fournisseurs (Cabinet Fiduciaire)', debit: 0, credit: 11000 }
    ]
  },
  {
    id: 'entry_08',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-28',
    reference: 'PAYE-0126',
    journal: 'OD',
    label: 'Comptabilisation des salaires de janvier et charges sociales',
    status: 'validated',
    source: 'payroll',
    lines: [
      { accountCode: '61711', accountLabel: 'Appointements et salaires', debit: 45000, credit: 0 },
      { accountCode: '61741', accountLabel: 'Cotisations de sécurité sociale (CNSS patronale)', debit: 9450, credit: 0 },
      { accountCode: '4432', accountLabel: 'Rémunérations dues au personnel (salaires nets)', debit: 0, credit: 38720 },
      { accountCode: '4441', accountLabel: 'Caisse Nationale de Sécurité Sociale (CNSS due)', debit: 0, credit: 11466 },
      { accountCode: '44525', accountLabel: 'État, IR retenu à la source', debit: 0, credit: 4264 }
    ]
  },
  {
    id: 'entry_09',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-30',
    reference: 'CHQ-REG-01',
    journal: 'BANQUE',
    label: 'Règlement fournisseur Atlas Maroc par virement',
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '4411', accountLabel: 'Fournisseurs (Atlas Maroc)', debit: 144000, credit: 0 },
      { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 0, credit: 144000 }
    ]
  },
  {
    id: 'entry_10',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-31',
    reference: 'ENC-CLI-01',
    journal: 'BANQUE',
    label: 'Encaissement facture client Casablanca Trading par virement',
    status: 'validated',
    source: 'sample',
    lines: [
      { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 216000, credit: 0 },
      { accountCode: '3421', accountLabel: 'Clients (Casablanca Trading)', debit: 0, credit: 216000 }
    ]
  },
  {
    id: 'entry_11',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-31',
    reference: 'DOT-AMORT-01',
    journal: 'OD',
    label: 'Dotation aux amortissements matériel informatique (20% annuel)',
    status: 'validated',
    source: 'closing',
    lines: [
      { accountCode: '61935', accountLabel: 'D.E.A. du matériel informatique', debit: 5000, credit: 0 },
      { accountCode: '28355', accountLabel: 'Amortissements du matériel informatique', debit: 0, credit: 5000 }
    ]
  },
  {
    id: 'entry_12',
    companyId: 'comp_maroc_demo_01',
    date: '2026-01-31',
    reference: 'TVA-DECL-0126',
    journal: 'OD',
    label: 'Déclaration TVA janvier (Facturée: 36 000, Récup charges: 28 490, Récup immo: 5 000)',
    status: 'validated',
    source: 'closing',
    lines: [
      { accountCode: '4455', accountLabel: 'État, TVA facturée', debit: 36000, credit: 0 },
      { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: 0, credit: 28490 },
      { accountCode: '34551', accountLabel: 'État - TVA récupérable sur immobilisations', debit: 0, credit: 5000 },
      { accountCode: '4456', accountLabel: 'État, TVA due (à payer avant le 20 février)', debit: 0, credit: 2510 }
    ]
  }
];
