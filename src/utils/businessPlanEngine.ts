/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Moteur de Business Plan Prévisionnel Marocain (3 à 5 ans)
 * Conforme aux exigences bancaires marocaines (Dossier Crédit d'Investissement & Création)
 */

export interface BusinessPlanAssumptions {
  baseCA: number;
  growthRateYear1: number; // e.g. 25%
  growthRateYear2: number; // e.g. 20%
  growthRateYear3: number; // e.g. 15%
  grossMarginRate: number; // e.g. 40%
  payrollCost: number;     // e.g. 350 000 MAD / year
  externalCharges: number; // e.g. 120 000 MAD / year
  initialInvestment: number; // e.g. 200 000 MAD
  capitalContribution: number; // e.g. 150 000 MAD
  bankLoanAmount: number;   // e.g. 150 000 MAD
  bankLoanInterestRate: number; // e.g. 6.5%
  bankLoanDurationYears: number; // e.g. 5
  bfrDays: number; // Besoins en Fonds de Roulement en jours de CA (ex: 45 jours)
}

export interface BusinessPlanYear {
  yearName: string;
  ca: number;
  achatsConsommes: number;
  margeBrute: number;
  chargesExternes: number;
  chargesPersonnel: number;
  valeurAjoutee: number;
  ebe: number; // Excédent Brut d'Exploitation
  dotationsAmortissements: number;
  rex: number; // Résultat d'Exploitation
  chargesFinancieres: number;
  rc: number; // Résultat Courant
  isImpots: number; // Impôt sur les Sociétés selon barème marocain
  resultatNet: number;
  caf: number; // Capacité d'Autofinancement
  seuilRentabilite: number; // Point Mort en MAD
  pointMortJours: number;   // Point Mort en jours
  bfr: number;
  tresorerieFin: number;
}

export interface BusinessPlanOutput {
  years: BusinessPlanYear[];
  planFinancement: {
    besoins: {
      investissements: number;
      variationBfr3ans: number;
      remboursementEmprunt: number;
      totalBesoins: number;
    };
    ressources: {
      capitalInitial: number;
      empruntBancaire: number;
      cafCumulee: number;
      totalRessources: number;
    };
    soldeGlobal: number;
  };
  ratios: {
    margeNetteAnnee1: number;
    margeNetteAnnee3: number;
    roeAnnee1: number;
    roeAnnee3: number;
    delaiRemboursement: string;
  };
}

/**
 * Calcule l'Impôt sur les Sociétés (IS) au Maroc
 * Barème 2026 :
 * - Bénéfice fiscal <= 300 000 DH : 10% (ou taux transitoire LF 2023-2026 selon grille DGI)
 * - 300 001 à 1 000 000 DH : 20%
 * - Au-delà de 1 000 000 DH : 35% (ou 20% standard PME selon statut)
 */
export function calculateMoroccanIS(beneficeFiscal: number): number {
  if (beneficeFiscal <= 0) return 0;
  if (beneficeFiscal <= 300000) {
    return Math.round(beneficeFiscal * 0.10);
  } else if (beneficeFiscal <= 1000000) {
    return Math.round(300000 * 0.10 + (beneficeFiscal - 300000) * 0.20);
  } else {
    return Math.round(300000 * 0.10 + 700000 * 0.20 + (beneficeFiscal - 1000000) * 0.35);
  }
}

export function generateBusinessPlan(assumptions: BusinessPlanAssumptions): BusinessPlanOutput {
  const currentYear = new Date().getFullYear();
  const rates = [
    assumptions.growthRateYear1 / 100,
    assumptions.growthRateYear2 / 100,
    assumptions.growthRateYear3 / 100
  ];

  let prevCA = assumptions.baseCA > 0 ? assumptions.baseCA : 800000;
  const years: BusinessPlanYear[] = [];

  const amortAnnual = assumptions.initialInvestment > 0 ? assumptions.initialInvestment / 5 : 20000;
  let remainingLoan = assumptions.bankLoanAmount;
  const annualLoanPrincipal = assumptions.bankLoanAmount / (assumptions.bankLoanDurationYears || 5);

  let cumulativeTresorerie = assumptions.capitalContribution + assumptions.bankLoanAmount - assumptions.initialInvestment;

  for (let i = 0; i < 3; i++) {
    const yearLabel = `Année N+${i + 1} (${currentYear + i + 1})`;
    const growth = rates[i];
    const ca = Math.round(prevCA * (1 + growth));
    prevCA = ca;

    const margeBrute = Math.round(ca * (assumptions.grossMarginRate / 100));
    const achatsConsommes = ca - margeBrute;

    // Évolution des charges
    const chargesPersonnel = Math.round(assumptions.payrollCost * (1 + 0.05 * i));
    const chargesExternes = Math.round(assumptions.externalCharges * (1 + 0.04 * i));

    const valeurAjoutee = margeBrute - chargesExternes;
    const ebe = valeurAjoutee - chargesPersonnel;

    const rex = ebe - amortAnnual;

    // Intérêts de l'emprunt bancaire
    const interets = Math.round(remainingLoan * (assumptions.bankLoanInterestRate / 100));
    remainingLoan = Math.max(0, remainingLoan - annualLoanPrincipal);

    const rc = rex - interets;
    const isImpots = calculateMoroccanIS(rc);
    const resultatNet = rc - isImpots;

    const caf = resultatNet + amortAnnual;

    // Seuil de Rentabilité (SR)
    // Charges fixes = Charges personnel + Charges externes + Amortissements + Intérêts
    const chargesFixes = chargesPersonnel + chargesExternes + amortAnnual + interets;
    const tauxMargeSurCoutVariable = margeBrute / (ca || 1);
    const seuilRentabilite = Math.round(chargesFixes / (tauxMargeSurCoutVariable || 0.4));
    const pointMortJours = Math.min(365, Math.round((seuilRentabilite / (ca || 1)) * 365));

    // BFR en jours de CA
    const bfr = Math.round((ca * assumptions.bfrDays) / 365);

    cumulativeTresorerie += (caf - annualLoanPrincipal);

    years.push({
      yearName: yearLabel,
      ca,
      achatsConsommes,
      margeBrute,
      chargesExternes,
      chargesPersonnel,
      valeurAjoutee,
      ebe,
      dotationsAmortissements: amortAnnual,
      rex,
      chargesFinancieres: interets,
      rc,
      isImpots,
      resultatNet,
      caf,
      seuilRentabilite,
      pointMortJours,
      bfr,
      tresorerieFin: cumulativeTresorerie
    });
  }

  // Plan de Financement pluriannuel
  const variationBFR = years[2].bfr - (assumptions.baseCA * assumptions.bfrDays / 365);
  const totalBesoins = assumptions.initialInvestment + Math.max(0, variationBFR) + (annualLoanPrincipal * 3);
  const totalCafCumul = years.reduce((s, y) => s + y.caf, 0);
  const totalRessources = assumptions.capitalContribution + assumptions.bankLoanAmount + totalCafCumul;

  const margeNetteAnnee1 = Math.round((years[0].resultatNet / years[0].ca) * 1000) / 10;
  const margeNetteAnnee3 = Math.round((years[2].resultatNet / years[2].ca) * 1000) / 10;

  const roeAnnee1 = Math.round((years[0].resultatNet / (assumptions.capitalContribution || 1)) * 1000) / 10;
  const roeAnnee3 = Math.round((years[2].resultatNet / (assumptions.capitalContribution || 1)) * 1000) / 10;

  return {
    years,
    planFinancement: {
      besoins: {
        investissements: assumptions.initialInvestment,
        variationBfr3ans: Math.max(0, variationBFR),
        remboursementEmprunt: Math.round(annualLoanPrincipal * 3),
        totalBesoins: Math.round(totalBesoins)
      },
      ressources: {
        capitalInitial: assumptions.capitalContribution,
        empruntBancaire: assumptions.bankLoanAmount,
        cafCumulee: Math.round(totalCafCumul),
        totalRessources: Math.round(totalRessources)
      },
      soldeGlobal: Math.round(totalRessources - totalBesoins)
    },
    ratios: {
      margeNetteAnnee1,
      margeNetteAnnee3,
      roeAnnee1,
      roeAnnee3,
      delaiRemboursement: assumptions.bankLoanAmount > 0
        ? `${Math.round((assumptions.bankLoanAmount / (years[0].caf || 1)) * 10) / 10} ans`
        : 'Autofinancé'
    }
  };
}
