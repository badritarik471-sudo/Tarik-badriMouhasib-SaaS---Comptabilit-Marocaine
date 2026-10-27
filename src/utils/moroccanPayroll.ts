/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Calculateur de paie marocaine conforme au Code du Travail et Code Général des Impôts (CGI)
 */

import { PayrollRecord, AccountingEntry } from '../types/accounting';

export interface MoroccanPayrollInput {
  employeeName: string;
  cin: string;
  cnssNumber: string;
  period: string; // e.g. "01/2026"
  baseSalary: number; // Salaire de base
  seniorityBonus?: number; // Prime d'ancienneté
  overtimeBonus?: number;  // Heures supplémentaires
  otherBonuses?: number;   // Primes diverses
  familyDependents?: number; // Personnes à charge (0 à 6)
  companyId: string;
}

export function calculateMoroccanPayroll(input: MoroccanPayrollInput): PayrollRecord {
  const baseSalary = Number(input.baseSalary) || 0;
  const seniorityBonus = Number(input.seniorityBonus) || 0;
  const overtimeBonus = Number(input.overtimeBonus) || 0;
  const otherBonuses = Number(input.otherBonuses) || 0;
  const familyCount = Math.min(6, Math.max(0, Number(input.familyDependents) || 0));

  // 1. Salaire Brut Global (SBG)
  const grossSalary = baseSalary + seniorityBonus + overtimeBonus + otherBonuses;

  // 2. Cotisations Salariales Marocaines
  // CNSS Salariale: 4.48% plafonné à 6 000 DH mensuel (Plafond max = 268.80 DH)
  const cnssBase = Math.min(grossSalary, 6000);
  const cnssSalarial = Math.round(cnssBase * 0.0448 * 100) / 100;

  // AMO Salariale: 2.26% non plafonné
  const amoSalarial = Math.round(grossSalary * 0.0226 * 100) / 100;

  // 3. Frais Professionnels (35% avec plafond de 2 916,67 DH/mois = 35 000 DH/an)
  const brutPourFrais = grossSalary;
  const fraisCalcules = brutPourFrais * 0.35;
  const profCharges = Math.round(Math.min(fraisCalcules, 2916.67) * 100) / 100;

  // 4. Salaire Net Imposable (SNI)
  const netImposable = Math.max(0, grossSalary - cnssSalarial - amoSalarial - profCharges);

  // 5. Impôt sur le Revenu (IR) mensuel selon barème marocain
  let tauxIR = 0;
  let sommeADeduire = 0;

  if (netImposable <= 2500) {
    tauxIR = 0;
    sommeADeduire = 0;
  } else if (netImposable <= 4166.67) {
    tauxIR = 0.10;
    sommeADeduire = 250;
  } else if (netImposable <= 5000) {
    tauxIR = 0.20;
    sommeADeduire = 666.67;
  } else if (netImposable <= 6666.67) {
    tauxIR = 0.30;
    sommeADeduire = 1166.67;
  } else if (netImposable <= 15000) {
    tauxIR = 0.34;
    sommeADeduire = 1433.33;
  } else {
    tauxIR = 0.38;
    sommeADeduire = 2033.33;
  }

  const irBrut = Math.max(0, Math.round(((netImposable * tauxIR) - sommeADeduire) * 100) / 100);

  // Déductions pour charges de famille: 30 DH/mois par personne à charge (max 180 DH/mois)
  const familyDeductions = familyCount * 30;
  const irNet = Math.max(0, Math.round((irBrut - familyDeductions) * 100) / 100);

  // 6. Salaire Net à Payer
  const netSalary = Math.round((grossSalary - cnssSalarial - amoSalarial - irNet) * 100) / 100;

  // 7. Charges Patronales Marocaines
  // Allocations familiales CNSS: 6.40% non plafonné
  const cnssPatronaleFamille = Math.round(grossSalary * 0.064 * 100) / 100;
  // Prestations sociales court/long terme CNSS: 8.98% plafonné à 6000 DH
  const cnssPatronalePrestations = Math.round(cnssBase * 0.0898 * 100) / 100;
  // AMO patronale (2.26% + 1.85% participation solidaire = 4.11%)
  const amoPatronale = Math.round(grossSalary * 0.0411 * 100) / 100;
  // Taxe de formation professionnelle: 1.6% non plafonné
  const taxeFormation = Math.round(grossSalary * 0.016 * 100) / 100;

  const totalChargesPatronales = Math.round(
    (cnssPatronaleFamille + cnssPatronalePrestations + amoPatronale + taxeFormation) * 100
  ) / 100;

  const coutTotalEmployeur = Math.round((grossSalary + totalChargesPatronales) * 100) / 100;

  return {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId: input.companyId,
    employeeName: input.employeeName,
    cin: input.cin,
    cnssNumber: input.cnssNumber,
    period: input.period,
    baseSalary,
    seniorityBonus,
    overtimeBonus,
    otherBonuses,
    grossSalary,
    cnssSalarial,
    amoSalarial,
    profCharges,
    netImposable: Math.round(netImposable * 100) / 100,
    irBrut,
    familyDeductions,
    irNet,
    netSalary,
    cnssPatronaleFamille,
    cnssPatronalePrestations,
    amoPatronale,
    taxeFormation,
    totalChargesPatronales,
    coutTotalEmployeur,
    createdAt: new Date().toISOString()
  };
}

/**
 * Crée l'écriture comptable marocaine correspondante dans le Journal des Opérations Diverses (OD)
 */
export function generatePayrollJournalEntry(payroll: PayrollRecord): AccountingEntry {
  const totalCotisationsCNSS_AMO = Math.round(
    (payroll.cnssSalarial + payroll.amoSalarial + payroll.cnssPatronaleFamille + payroll.cnssPatronalePrestations + payroll.amoPatronale) * 100
  ) / 100;

  return {
    id: `entry_pay_${Date.now()}`,
    companyId: payroll.companyId,
    date: new Date().toISOString().split('T')[0],
    reference: `PAY-${payroll.period}-${payroll.cin}`,
    journal: 'OD',
    label: `Salaires et charges sociales ${payroll.period} - ${payroll.employeeName}`,
    status: 'validated',
    source: 'payroll',
    lines: [
      {
        accountCode: '61711',
        accountLabel: 'Appointements et salaires (Brut)',
        debit: payroll.grossSalary,
        credit: 0
      },
      {
        accountCode: '61741',
        accountLabel: 'Cotisations de sécurité sociale (Charges patronales)',
        debit: payroll.totalChargesPatronales,
        credit: 0
      },
      {
        accountCode: '4432',
        accountLabel: 'Rémunérations dues au personnel (Net à payer)',
        debit: 0,
        credit: payroll.netSalary
      },
      {
        accountCode: '4441',
        accountLabel: 'Caisse Nationale de Sécurité Sociale (CNSS + AMO)',
        debit: 0,
        credit: totalCotisationsCNSS_AMO
      },
      {
        accountCode: '44525',
        accountLabel: 'État, impôt sur le revenu retenu à la source (IR)',
        debit: 0,
        credit: payroll.irNet
      },
      {
        accountCode: '4457',
        accountLabel: 'Taxe de formation professionnelle à payer',
        debit: 0,
        credit: payroll.taxeFormation
      }
    ]
  };
}
