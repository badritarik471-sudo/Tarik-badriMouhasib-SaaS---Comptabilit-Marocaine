/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Module Business Plan Prévisionnel Marocain (3 ans)
 * Idéal pour dossier bancaire, création de société et investisseurs
 */

import React, { useState } from 'react';
import { Company } from '../types/accounting';
import {
  generateBusinessPlan,
  BusinessPlanAssumptions,
  BusinessPlanOutput
} from '../utils/businessPlanEngine';
import {
  Briefcase,
  TrendingUp,
  PieChart,
  DollarSign,
  Calculator,
  ShieldCheck,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface BusinessPlanTabProps {
  company: Company;
  currentCA: number;
}

export const BusinessPlanTab: React.FC<BusinessPlanTabProps> = ({ company, currentCA }) => {
  const [assumptions, setAssumptions] = useState<BusinessPlanAssumptions>({
    baseCA: currentCA > 0 ? currentCA : 800000,
    growthRateYear1: 25,
    growthRateYear2: 20,
    growthRateYear3: 15,
    grossMarginRate: 40,
    payrollCost: 280000,
    externalCharges: 95000,
    initialInvestment: 180000,
    capitalContribution: 120000,
    bankLoanAmount: 150000,
    bankLoanInterestRate: 6.5,
    bankLoanDurationYears: 5,
    bfrDays: 45
  });

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const plan: BusinessPlanOutput = generateBusinessPlan(assumptions);

  const handleInputChange = (field: keyof BusinessPlanAssumptions, value: number) => {
    setAssumptions(prev => ({ ...prev, [field]: value }));
  };

  const handleRequestAiAudit = async () => {
    try {
      setIsLoadingAdvice(true);
      const res = await fetch('/api/accounting/audit-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          metrics: {
            ca: plan.years[0].ca,
            charges: plan.years[0].chargesPersonnel + plan.years[0].chargesExternes,
            resultatNet: plan.years[0].resultatNet,
            tresorerie: plan.years[0].tresorerieFin,
            vatDue: 0,
            currentCredit: 0
          }
        })
      });
      const data = await res.json();
      if (data.success && data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête Business Plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-950/80 border border-blue-800/60 rounded-xl text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Business Plan Prévisionnel & Dossier Bancaire (3 Ans)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Normes Financement Maroc
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Projections pluriannuelles du Compte de Résultat, Plan de Financement, Point Mort et Seuil de Rentabilité
            </p>
          </div>
        </div>

        <button
          onClick={handleRequestAiAudit}
          disabled={isLoadingAdvice}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isLoadingAdvice ? 'Analyse en cours...' : 'Audit Stratégique IA (Gemini)'}</span>
        </button>
      </div>

      {/* Recommandation stratégique IA */}
      {aiAdvice && (
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Note d'Analyse Stratégique & Bancaire (Gemini AI)</span>
          </div>
          <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {aiAdvice}
          </div>
        </div>
      )}

      {/* Cartes Clés du Business Plan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-sans uppercase mb-1">CA Prévisionnel (Année 1)</div>
          <div className="text-2xl font-bold text-emerald-400">
            {plan.years[0].ca.toLocaleString('fr-FR')} <span className="text-xs font-sans">MAD</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">Croissance : +{assumptions.growthRateYear1}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-sans uppercase mb-1">Résultat Net (Année 1)</div>
          <div className="text-2xl font-bold text-blue-400">
            {plan.years[0].resultatNet.toLocaleString('fr-FR')} <span className="text-xs font-sans">MAD</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">Marge nette : {plan.ratios.margeNetteAnnee1}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-sans uppercase mb-1">Seuil de Rentabilité (SR)</div>
          <div className="text-2xl font-bold text-amber-400">
            {plan.years[0].seuilRentabilite.toLocaleString('fr-FR')} <span className="text-xs font-sans">MAD</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">Point Mort : {plan.years[0].pointMortJours} jours</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-sans uppercase mb-1">Trésorerie Fin N+3</div>
          <div className="text-2xl font-bold text-cyan-400">
            {plan.years[2].tresorerieFin.toLocaleString('fr-FR')} <span className="text-xs font-sans">MAD</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-1">Solde de financement positif</div>
        </div>
      </div>

      {/* Paramètres & Hypothèses */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Paramètres & Hypothèses Financières de Votre Projet</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Chiffre d'Affaires de départ (MAD) :</label>
            <input
              type="number"
              value={assumptions.baseCA}
              onChange={(e) => handleInputChange('baseCA', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Taux de Marge Brute (%) :</label>
            <input
              type="number"
              value={assumptions.grossMarginRate}
              onChange={(e) => handleInputChange('grossMarginRate', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Croissance N+1 / N+2 (%) :</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={assumptions.growthRateYear1}
                onChange={(e) => handleInputChange('growthRateYear1', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
              <input
                type="number"
                value={assumptions.growthRateYear2}
                onChange={(e) => handleInputChange('growthRateYear2', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Masse Salariale Annuelle (MAD) :</label>
            <input
              type="number"
              value={assumptions.payrollCost}
              onChange={(e) => handleInputChange('payrollCost', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Charges Externes Annuelles :</label>
            <input
              type="number"
              value={assumptions.externalCharges}
              onChange={(e) => handleInputChange('externalCharges', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Investissement Initial (MAD) :</label>
            <input
              type="number"
              value={assumptions.initialInvestment}
              onChange={(e) => handleInputChange('initialInvestment', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Apport Capital Personnel :</label>
            <input
              type="number"
              value={assumptions.capitalContribution}
              onChange={(e) => handleInputChange('capitalContribution', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Emprunt Bancaire Demandé (MAD) :</label>
            <input
              type="number"
              value={assumptions.bankLoanAmount}
              onChange={(e) => handleInputChange('bankLoanAmount', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Table du Compte de Résultat Prévisionnel (3 Ans) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Compte de Produits et Charges Prévisionnel (CPC 3 Ans)
          </span>
          <span className="text-slate-400 font-mono">Exprimé en MAD Hors Taxes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-sans">Rubriques Prévisionnelles</th>
                {plan.years.map((y) => (
                  <th key={y.yearName} className="py-2.5 px-4 text-right">{y.yearName}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans font-bold text-emerald-400">Chiffre d'Affaires HT (CA)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right font-bold text-emerald-400">{y.ca.toLocaleString('fr-FR')} MAD</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans text-slate-400">- Achats de marchandises & consommables</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-400">{y.achatsConsommes.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="bg-slate-950/50 font-bold">
                <td className="py-2 px-4 font-sans text-slate-200">Marge Brute Globale</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-200">{y.margeBrute.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans text-slate-400">- Charges externes (loyers, assurances, pub)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-400">{y.chargesExternes.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="bg-slate-950/50 font-bold">
                <td className="py-2 px-4 font-sans text-slate-200">Valeur Ajoutée (V.A.)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-200">{y.valeurAjoutee.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans text-slate-400">- Charges de personnel (Salaires + CNSS/AMO)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-400">{y.chargesPersonnel.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="bg-slate-950/80 font-bold">
                <td className="py-2.5 px-4 font-sans text-emerald-400">Excédent Brut d'Exploitation (E.B.E.)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2.5 px-4 text-right text-emerald-400">{y.ebe.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans text-slate-400">- Dotations aux amortissements (annuelles)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-400">{y.dotationsAmortissements.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="bg-slate-950/50 font-bold">
                <td className="py-2 px-4 font-sans text-slate-200">Résultat d'Exploitation (R.E.X.)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-slate-200">{y.rex.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans text-slate-400">- Charges d'intérêts d'emprunt bancaire</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-amber-400">{y.chargesFinancieres.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-4 font-sans text-slate-400">- Impôt sur les Sociétés (IS Maroc 2026)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-amber-400">{y.isImpots.toLocaleString('fr-FR')}</td>
                ))}
              </tr>
              <tr className="bg-emerald-950/50 font-bold text-sm border-t-2 border-emerald-800">
                <td className="py-3 px-4 font-sans text-emerald-300">RÉSULTAT NET COMPTABLE</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-3 px-4 text-right text-emerald-300 font-bold">
                    {y.resultatNet.toLocaleString('fr-FR')} MAD
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-950/90 font-bold border-t border-slate-800">
                <td className="py-2.5 px-4 font-sans text-cyan-400">Capacité d'Autofinancement (C.A.F.)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2.5 px-4 text-right text-cyan-400">
                    {y.caf.toLocaleString('fr-FR')} MAD
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40 text-[11px] text-slate-400">
                <td className="py-2 px-4 font-sans">Seuil de Rentabilité (Point Mort en Dirhams)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-amber-300">{y.seuilRentabilite.toLocaleString('fr-FR')} MAD</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/40 text-[11px] text-slate-400">
                <td className="py-2 px-4 font-sans">Date d'Atteinte du Point Mort (Jours)</td>
                {plan.years.map((y, i) => (
                  <td key={i} className="py-2 px-4 text-right text-amber-300">{y.pointMortJours} jours</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan de Financement & Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <h4 className="font-bold text-emerald-400 text-xs uppercase font-sans border-b border-slate-800 pb-2">
            Plan de Financement Global sur 3 Ans
          </h4>
          <div className="space-y-2">
            <div className="text-slate-400 font-sans font-semibold">BESOINS TOTAUX DU PROJET :</div>
            <div className="pl-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">Investissements matériels & corporels</span>
                <span>{plan.planFinancement.besoins.investissements.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">Variation BFR (3 ans)</span>
                <span>{plan.planFinancement.besoins.variationBfr3ans.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">Remboursements capital emprunt</span>
                <span>{plan.planFinancement.besoins.remboursementEmprunt.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800 pt-1">
                <span className="font-sans">Total Besoins :</span>
                <span>{plan.planFinancement.besoins.totalBesoins.toLocaleString('fr-FR')} MAD</span>
              </div>
            </div>

            <div className="text-slate-400 font-sans font-semibold pt-2 border-t border-slate-800">
              RESSOURCES MOBILISÉES :
            </div>
            <div className="pl-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">Apport personnel (Capital)</span>
                <span>{plan.planFinancement.ressources.capitalInitial.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">Emprunt bancaire MLT</span>
                <span>{plan.planFinancement.ressources.empruntBancaire.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">Capacité d'Autofinancement cumulée</span>
                <span>{plan.planFinancement.ressources.cafCumulee.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800 pt-1">
                <span className="font-sans">Total Ressources :</span>
                <span>{plan.planFinancement.ressources.totalRessources.toLocaleString('fr-FR')} MAD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <h4 className="font-bold text-blue-400 text-xs uppercase font-sans border-b border-slate-800 pb-2">
            Ratios d'Analyse pour Banques Marocaines
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block font-sans">Rentabilité Nette (Marge Nette)</span>
                <span className="text-[10px] text-slate-500 font-sans">Résultat Net / Chiffre d'Affaires</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">{plan.ratios.margeNetteAnnee3}%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block font-sans">Retour sur Capitaux Propres (ROE)</span>
                <span className="text-[10px] text-slate-500 font-sans">Résultat Net / Capital engagé</span>
              </div>
              <span className="font-bold text-blue-400 text-sm">{plan.ratios.roeAnnee3}%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block font-sans">Délai de Remboursement Bancaire</span>
                <span className="text-[10px] text-slate-500 font-sans">Dette Nette / C.A.F. annuelle</span>
              </div>
              <span className="font-bold text-amber-400 text-sm">{plan.ratios.delaiRemboursement}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
