/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * États Financiers de Synthèse : CPC, ESG & Bilan (CGNC Maroc)
 */

import React, { useState } from 'react';
import { AccountingEntry, Company } from '../types/accounting';
import { computeCPC, computeESG, computeBilan } from '../utils/accountingEngine';
import { FileText, TrendingUp, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

interface FinancialStatementsTabProps {
  entries: AccountingEntry[];
  company: Company;
}

export const FinancialStatementsTab: React.FC<FinancialStatementsTabProps> = ({ entries, company }) => {
  const [activeStatement, setActiveStatement] = useState<'cpc' | 'esg' | 'bilan'>('cpc');

  const cpc = computeCPC(entries);
  const esg = computeESG(entries);
  const bilan = computeBilan(entries);

  return (
    <div className="space-y-6">
      {/* Navigation des États */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStatement('cpc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeStatement === 'cpc'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CPC (Compte de Produits & Charges)</span>
          </button>

          <button
            onClick={() => setActiveStatement('esg')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeStatement === 'esg'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ESG & CAF (Soldes de Gestion)</span>
          </button>

          <button
            onClick={() => setActiveStatement('bilan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeStatement === 'bilan'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Bilan (Actif & Passif)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
          <span>{company.name}</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Exercice {company.fiscalYear}</span>
        </div>
      </div>

      {/* 1. COMPTE DE PRODUITS ET CHARGES (CPC) */}
      {activeStatement === 'cpc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">COMPTE DE PRODUITS ET CHARGES (C.P.C.)</h3>
              <p className="text-xs text-slate-400">Modèle normal marocain établi conformément au CGNC (hors taxes)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">RÉSULTAT NET DE L'EXERCICE</span>
              <span className={`text-base font-bold font-mono ${cpc.resultatNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {cpc.resultatNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PRODUITS */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-bold text-emerald-400 text-xs uppercase mb-2">
                  <span>I. PRODUITS D'EXPLOITATION</span>
                  <span className="font-mono">{cpc.totalProduitsExploitation.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {Object.entries(cpc.produitsExploitation).map(([lbl, val]) => (
                    <div key={lbl} className="py-2 flex justify-between text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-100">{val.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-bold text-emerald-400 text-xs uppercase mb-2">
                  <span>IV. PRODUITS FINANCIERS</span>
                  <span className="font-mono">{cpc.totalProduitsFinanciers.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {Object.entries(cpc.produitsFinanciers).map(([lbl, val]) => (
                    <div key={lbl} className="py-2 flex justify-between text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-100">{val.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-bold text-emerald-400 text-xs uppercase mb-2">
                  <span>VIII. PRODUITS NON COURANTS</span>
                  <span className="font-mono">{cpc.totalProduitsNonCourants.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {Object.entries(cpc.produitsNonCourants).map(([lbl, val]) => (
                    <div key={lbl} className="py-2 flex justify-between text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-100">{val.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CHARGES */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-bold text-amber-400 text-xs uppercase mb-2">
                  <span>II. CHARGES D'EXPLOITATION</span>
                  <span className="font-mono">{cpc.totalChargesExploitation.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {Object.entries(cpc.chargesExploitation).map(([lbl, val]) => (
                    <div key={lbl} className="py-2 flex justify-between text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-100">{val.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-bold text-amber-400 text-xs uppercase mb-2">
                  <span>V. CHARGES FINANCIÈRES</span>
                  <span className="font-mono">{cpc.totalChargesFinancieres.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {Object.entries(cpc.chargesFinancieres).map(([lbl, val]) => (
                    <div key={lbl} className="py-2 flex justify-between text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-100">{val.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-bold text-amber-400 text-xs uppercase mb-2">
                  <span>IX. CHARGES NON COURANTES</span>
                  <span className="font-mono">{cpc.totalChargesNonCourantes.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {Object.entries(cpc.chargesNonCourantes).map(([lbl, val]) => (
                    <div key={lbl} className="py-2 flex justify-between text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-100">{val.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU RÉCAPITULATIF DES RÉSULTATS DU CPC */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span className="font-sans font-medium">III. RÉSULTAT D'EXPLOITATION (I - II) :</span>
              <span className="font-bold text-slate-100">{cpc.resultatExploitation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span className="font-sans font-medium">VI. RÉSULTAT FINANCIER (IV - V) :</span>
              <span className="font-bold text-slate-100">{cpc.resultatFinancier.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span className="font-sans font-medium">VII. RÉSULTAT COURANT (III + VI) :</span>
              <span className="font-bold text-emerald-400">{cpc.resultatCourant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span className="font-sans font-medium">X. RÉSULTAT NON COURANT (VIII - IX) :</span>
              <span className="font-bold text-slate-100">{cpc.resultatNonCourant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span className="font-sans font-medium">XI. RÉSULTAT AVANT IMPÔTS (VII + X) :</span>
              <span className="font-bold text-slate-100">{cpc.resultatAvantImpot.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span className="font-sans font-medium">XII. IMPÔTS SUR LES RÉSULTATS (IS) :</span>
              <span className="font-bold text-amber-400">{cpc.impotsSurResultat.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold">
              <span className="font-sans text-white">XIII. RÉSULTAT NET (XI - XII) :</span>
              <span className={cpc.resultatNet >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {cpc.resultatNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. ÉTAT DES SOLDES DE GESTION (ESG) & CAF */}
      {activeStatement === 'esg' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">ÉTAT DES SOLDES DE GESTION (E.S.G.)</h3>
              <p className="text-xs text-slate-400">Tableau de formation du résultat et Capacité d'Autofinancement (C.A.F.)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">VALEUR AJOUTÉE (V.A.)</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {esg.valeurAjoutee.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-sans">Indicateur de Gestion</th>
                  <th className="py-2.5 px-4 text-right">Montant (MAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">1. Ventes de marchandises (en l'état)</td>
                  <td className="py-2 px-4 text-right">{esg.ventesMarchandises.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">- Achats revendus de marchandises</td>
                  <td className="py-2 px-4 text-right">{esg.achatsRevendusMarchandises.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="bg-slate-950 font-bold">
                  <td className="py-2.5 px-4 font-sans text-emerald-400">I. MARGE BRUTE SUR VENTES EN L'ÉTAT</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">{esg.margeBrute.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">+ Production de l'exercice</td>
                  <td className="py-2 px-4 text-right">{esg.productionExercice.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">- Consommation de l'exercice</td>
                  <td className="py-2 px-4 text-right">{esg.consommationExercice.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="bg-slate-950 font-bold">
                  <td className="py-2.5 px-4 font-sans text-emerald-400">II. VALEUR AJOUTÉE (V.A.)</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">{esg.valeurAjoutee.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">- Impôts et taxes</td>
                  <td className="py-2 px-4 text-right">{esg.impotsTaxes.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">- Charges de personnel</td>
                  <td className="py-2 px-4 text-right">{esg.chargesPersonnel.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="bg-slate-950 font-bold">
                  <td className="py-2.5 px-4 font-sans text-emerald-400">III. EXCÉDENT BRUT D'EXPLOITATION (E.B.E.)</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">{esg.excedentBrutExploitation.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">IV. RÉSULTAT D'EXPLOITATION</td>
                  <td className="py-2 px-4 text-right">{esg.resultatExploitation.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">V. RÉSULTAT FINANCIER</td>
                  <td className="py-2 px-4 text-right">{esg.resultatFinancier.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">VI. RÉSULTAT COURANT</td>
                  <td className="py-2 px-4 text-right">{esg.resultatCourant.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">VII. RÉSULTAT NON COURANT</td>
                  <td className="py-2 px-4 text-right">{esg.resultatNonCourant.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">VIII. IMPÔTS SUR LES RÉSULTATS (IS)</td>
                  <td className="py-2 px-4 text-right">{esg.impotsSurResultat.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="bg-slate-950 font-bold text-sm">
                  <td className="py-3 px-4 font-sans text-white">IX. RÉSULTAT NET DE L'EXERCICE</td>
                  <td className="py-3 px-4 text-right text-emerald-400">{esg.resultatNet.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="bg-emerald-950/40 font-bold border-t-2 border-emerald-800">
                  <td className="py-3 px-4 font-sans text-emerald-300">
                    CAPACITÉ D'AUTOFINANCEMENT (C.A.F.) :
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-300">
                    {esg.capaciteAutofinancement.toLocaleString('fr-FR')} MAD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BILAN SIMPLIFIÉ (ACTIF & PASSIF) */}
      {activeStatement === 'bilan' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">BILAN COMPTABLE MAROCAIN (ACTIF & PASSIF)</h3>
              <p className="text-xs text-slate-400">Présentation des masses bilantielles selon le Code Général de Normalisation Comptable</p>
            </div>
            <div className="flex items-center gap-2">
              {bilan.equilibre ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bilan équilibré (Actif = Passif)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>Écart de {bilan.ecart.toLocaleString('fr-FR')} MAD</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ACTIF */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-emerald-400">ACTIF (Emplois)</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {bilan.actif.totalActif.toLocaleString('fr-FR')} MAD
                </span>
              </div>

              {/* Actif Immobilisé */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-200">ACTIF IMMOBILISÉ :</div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Immobilisations corporelles (brut)</span>
                    <span className="font-mono text-slate-200">{bilan.actif.immobilise.corporelles.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moins : Amortissements cumulés (28)</span>
                    <span className="font-mono text-amber-400">- {bilan.actif.immobilise.amortissements.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-900">
                    <span>Total Actif Immobilisé Net</span>
                    <span className="font-mono text-emerald-400">{bilan.actif.immobilise.totalNet.toLocaleString('fr-FR')} MAD</span>
                  </div>
                </div>
              </div>

              {/* Actif Circulant */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                <div className="font-semibold text-slate-200">ACTIF CIRCULANT (HORS TRÉSORERIE) :</div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Créances clients et comptes rattachés (3421)</span>
                    <span className="font-mono text-slate-200">{bilan.actif.circulant.creancesClients.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>État débiteur (TVA récupérable & acomptes)</span>
                    <span className="font-mono text-slate-200">{bilan.actif.circulant.etatDebiteur.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-900">
                    <span>Total Actif Circulant Net</span>
                    <span className="font-mono text-emerald-400">{bilan.actif.circulant.totalNet.toLocaleString('fr-FR')} MAD</span>
                  </div>
                </div>
              </div>

              {/* Trésorerie Actif */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                <div className="font-semibold text-slate-200">TRÉSORERIE - ACTIF :</div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Banques (5141)</span>
                    <span className="font-mono text-slate-200">{bilan.actif.tresorerie.banques.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-900">
                    <span>Total Trésorerie Actif</span>
                    <span className="font-mono text-cyan-400">{bilan.actif.tresorerie.totalNet.toLocaleString('fr-FR')} MAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PASSIF */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-emerald-400">PASSIF (Ressources)</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {bilan.passif.totalPassif.toLocaleString('fr-FR')} MAD
                </span>
              </div>

              {/* Financement Permanent */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-200">FINANCEMENT PERMANENT (CAPITAUX PROPRES) :</div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Capital social (1111)</span>
                    <span className="font-mono text-slate-200">{bilan.passif.financementPermanent.capitalSocial.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Résultat net de l'exercice (1191/1199)</span>
                    <span className={`font-mono font-bold ${bilan.passif.financementPermanent.resultatNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {bilan.passif.financementPermanent.resultatNet.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-900">
                    <span>Total Financement Permanent</span>
                    <span className="font-mono text-emerald-400">{bilan.passif.financementPermanent.totalNet.toLocaleString('fr-FR')} MAD</span>
                  </div>
                </div>
              </div>

              {/* Passif Circulant */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                <div className="font-semibold text-slate-200">PASSIF CIRCULANT (HORS TRÉSORERIE) :</div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Fournisseurs et comptes rattachés (4411)</span>
                    <span className="font-mono text-slate-200">{bilan.passif.passifCirculant.fournisseurs.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dettes fiscales et sociales (TVA, CNSS, IR)</span>
                    <span className="font-mono text-slate-200">{bilan.passif.passifCirculant.dettesFiscalesSociales.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-900">
                    <span>Total Passif Circulant</span>
                    <span className="font-mono text-emerald-400">{bilan.passif.passifCirculant.totalNet.toLocaleString('fr-FR')} MAD</span>
                  </div>
                </div>
              </div>

              {/* Trésorerie Passif */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                <div className="font-semibold text-slate-200">TRÉSORERIE - PASSIF :</div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Banques solde créditeur / découverts (5541)</span>
                    <span className="font-mono text-slate-200">{bilan.passif.tresorerie.decouvertsBanques.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-900">
                    <span>Total Trésorerie Passif</span>
                    <span className="font-mono text-emerald-400">{bilan.passif.tresorerie.totalNet.toLocaleString('fr-FR')} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
