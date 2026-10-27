/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AccountPCM {
  code: string;
  label: string;
  classe: number; // 1 to 9, or 0
  category: string;
}

export type JournalType = 'ACHATS' | 'VENTES' | 'BANQUE' | 'CAISSE' | 'OD';

export interface EntryLine {
  accountCode: string;
  accountLabel: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface AccountingEntry {
  id: string;
  companyId: string;
  date: string;
  reference: string;
  journal: JournalType;
  label: string;
  lines: EntryLine[];
  vatRate?: number;
  vatAmount?: number;
  status: 'draft' | 'validated';
  createdAt?: string;
  source?: 'manual' | 'ai_prompt' | 'invoice_scan' | 'payroll' | 'closing' | 'sample';
}

export interface Company {
  id: string;
  name: string;
  ice: string; // 15 digits Moroccan ICE
  if: string;  // Identifiant Fiscal
  rc: string;  // Registre de Commerce
  patente: string;
  legalForm: 'SARL' | 'SARL-AU' | 'SA' | 'SNC' | 'Auto-entrepreneur' | 'Personne Physique';
  capital: number;
  fiscalYear: string;
  address: string;
  city: string;
  ownerId?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  companyId: string;
  employeeName: string;
  cin: string;
  cnssNumber: string;
  period: string; // e.g., '10/2026'
  baseSalary: number;
  seniorityBonus: number;
  overtimeBonus: number;
  otherBonuses: number;
  grossSalary: number; // SBG
  cnssSalarial: number; // 4.48% (max 268.80 DH)
  amoSalarial: number;  // 2.26%
  profCharges: number;  // Frais professionnels (35% capped)
  netImposable: number; // SBI - Cotisations - Frais
  irBrut: number;
  familyDeductions: number; // 30 DH/month per dependent (max 6)
  irNet: number;
  netSalary: number;
  // Charges patronales:
  cnssPatronaleFamille: number; // 6.40%
  cnssPatronalePrestations: number; // 8.98%
  amoPatronale: number; // 4.11%
  taxeFormation: number; // 1.6%
  totalChargesPatronales: number;
  coutTotalEmployeur: number;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  label: string;
  reference: string;
  debit: number;
  credit: number;
  matched: boolean;
  matchedEntryId?: string;
}

export interface VatSummary {
  period: string;
  vatCollected20: number;
  vatCollected14: number;
  vatCollected10: number;
  vatCollected7: number;
  totalVatCollected: number;
  vatRecoverableCharges: number;
  vatRecoverableImmo: number;
  totalVatRecoverable: number;
  priorCredit: number;
  vatDue: number;
  currentCredit: number;
}
