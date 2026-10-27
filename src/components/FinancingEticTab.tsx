/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tableau de Financement & ETIC (État des Informations Complémentaires selon le CGNC marocain)
 */

import React, { useState } from 'react';
import { Company, AccountingEntry } from '../types/accounting';
import { computeBilan, computeESG } from '../utils/accountingEngine';
import { Layers, FileSpreadsheet, CheckCircle2, ChevronRight } from 'lucide-react';

interface FinancingEticTabProps {
  company: Company;
  entries: AccountingEntry[];
}

export const FinancingEticTab: React.FC<FinancingEticTabProps> = ({ company, entries }) => {
  const [activeSection, setActiveSection] = useState<'financement' | 'etic-a1' | 'etic-a2' | 'etic-a3' | 'etic-b1'>('financement');

  const bilan = computeBilan(entries);
  const esg = computeESG(entries);

  // Tableau de Financement (Masses du Bilan)
  const capitauxPropres = bilan.passif.financementPermanent.totalNet;
  const actifImmobilise = bilan.actif.immobilise.totalNet;
  const fondsDeRoulement = capitauxPropres - actifImmobilise; // FRNG

  const actifCirculant = bilan.actif.circulant.totalNet;
  const passifCirculant = bilan.passif.passifCirculant.totalNet;
  const besoinFondsRoulement = actifCirculant - passifCirculant; // BFR

  const tresorerieNette = fondsDeRoulement - besoinFondsRoulement; // TN = FR - BFR

  return (
    <div className="space-y-6">
      {/* Navigation entre Tableau de Financement et les états de l'ETIC */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSection('financement')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSection === 'financement'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tableau de Financement
          </button>
          <button
            onClick={() => setActiveSection('etic-a1')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSection === 'etic-a1'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ETIC A1 : Méthodes Comptables
          </button>
          <button
            onClick={() => setActiveSection('etic-a2')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSection === 'etic-a2'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ETIC A2 : Immobilisations
          </button>
          <button
            onClick={() => setActiveSection('etic-a3')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSection === 'etic-a3'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ETIC A3 : Amortissements
          </button>
          <button
            onClick={() => setActiveSection('etic-b1')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSection === 'etic-b1'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ETIC B1 : Échéances Créances & Dettes
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Conforme Normes Comptables Marocaines (CGNC)</span>
        </div>
      </div>

      {/* 1. TABLEAU DE FINANCEMENT */}
      {activeSection === 'financement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">TABLEAU DE FINANCEMENT DE L'EXERCICE</h3>
              <p className="text-xs text-slate-400">Synthèse des masses du bilan, variation du fonds de roulement et trésorerie nette</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">TRÉSORERIE NETTE (TN)</span>
              <span className={`text-base font-bold font-mono ${tresorerieNette >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tresorerieNette.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-sans mb-1">Fonds de Roulement Net Global (FRNG)</div>
              <div className="text-xl font-bold text-emerald-400">
                {fondsDeRoulement.toLocaleString('fr-FR')} MAD
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-1">Ressources Stables - Emplois Stables</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-sans mb-1">Besoin en Fonds de Roulement (BFR)</div>
              <div className="text-xl font-bold text-blue-400">
                {besoinFondsRoulement.toLocaleString('fr-FR')} MAD
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-1">Actif Circulant HT - Passif Circulant HT</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-sans mb-1">Trésorerie Nette (TN = FR - BFR)</div>
              <div className="text-xl font-bold text-cyan-400">
                {tresorerieNette.toLocaleString('fr-FR')} MAD
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-1">Équivalent Trésorerie Actif - Passif</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-sans">SYNTHÈSE DES MASSES DU BILAN (CGNC)</th>
                  <th className="py-2.5 px-4 text-right">Exercice {company.fiscalYear}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">1. Financement Permanent (Ressources durables)</td>
                  <td className="py-2 px-4 text-right">{capitauxPropres.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">2. Moins : Actif Immobilisé Net (Emplois stables)</td>
                  <td className="py-2 px-4 text-right">{actifImmobilise.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="bg-slate-950 font-bold text-emerald-400">
                  <td className="py-2.5 px-4 font-sans">I. FONDS DE ROULEMENT NET GLOBAL (1 - 2)</td>
                  <td className="py-2.5 px-4 text-right">{fondsDeRoulement.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">3. Actif Circulant (hors trésorerie)</td>
                  <td className="py-2 px-4 text-right">{actifCirculant.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-sans text-slate-200">4. Moins : Passif Circulant (hors trésorerie)</td>
                  <td className="py-2 px-4 text-right">{passifCirculant.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="bg-slate-950 font-bold text-blue-400">
                  <td className="py-2.5 px-4 font-sans">II. BESOIN EN FONDS DE ROULEMENT (3 - 4)</td>
                  <td className="py-2.5 px-4 text-right">{besoinFondsRoulement.toLocaleString('fr-FR')} MAD</td>
                </tr>
                <tr className="bg-emerald-950/40 font-bold text-sm border-t-2 border-emerald-800">
                  <td className="py-3 px-4 font-sans text-emerald-300">III. TRÉSORERIE NETTE (I - II)</td>
                  <td className="py-3 px-4 text-right text-emerald-300">{tresorerieNette.toLocaleString('fr-FR')} MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ETIC A1 : MÉTHODES COMPTABLES */}
      {activeSection === 'etic-a1' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs leading-relaxed">
          <h3 className="text-base font-bold text-white mb-2">
            TABLEAU A1 : PRINCIPALES MÉTHODES D'ÉVALUATION ET DE PRÉSENTATION
          </h3>
          <p className="text-slate-400">
            Les états de synthèse ont été établis conformément aux principes comptables fondamentaux prévus par la loi n° 9-88 relative aux obligations comptables des commerçants et au Code Général de la Normalisation Comptable (CGNC).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wide">1. Immobilisations Corporelles & Incorporelles</h4>
              <p className="text-slate-300">
                Inscrites au bilan à leur coût d'acquisition historique (prix d'achat hors taxes récupérables, frais accessoires directs nécessaires à la mise en service). Les amortissements sont calculés selon la méthode linéaire sur les durées d'utilité fiscale usuelles au Maroc.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wide">2. Évaluation des Stocks</h4>
              <p className="text-slate-300">
                Évalués selon la méthode du Coût Unitaire Moyen Pondéré (CUMP) ou FIFO. Une provision pour dépréciation est constituée lorsque la valeur actuelle à la date de clôture devient inférieure à la valeur comptable d'entrée.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wide">3. Créances et Dettes</h4>
              <p className="text-slate-300">
                Comptabilisées à leur valeur nominale. Les créances litigieuses ou douteuses font l'objet d'un transfert au compte 3424 et d'une dotation aux provisions pour dépréciation (compte 6196).
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wide">4. Opérations en Devises</h4>
              <p className="text-slate-300">
                Les créances et dettes libellées en monnaies étrangères sont converties au cours de clôture de Bank Al-Maghrib. Les écarts constatés sont enregistrés dans les comptes d'écarts de conversion (Classes 17, 27, 37, 47).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ETIC A2 : IMMOBILISATIONS */}
      {activeSection === 'etic-a2' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">TABLEAU A2 : ÉTAT DES IMMOBILISATIONS AUTRES QUE FINANCIÈRES</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-sans">Nature des Immobilisations</th>
                  <th className="py-2.5 px-3 text-right">Montant Brut Début</th>
                  <th className="py-2.5 px-3 text-right">Augmentations (Acquisitions)</th>
                  <th className="py-2.5 px-3 text-right">Diminutions (Cessions)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400">Montant Brut Fin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-200">Matériel informatique (2355)</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">25 000</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">25 000 MAD</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-200">Mobilier et matériel de bureau (2351)</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">0</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-400">0 MAD</td>
                </tr>
                <tr className="bg-slate-950 font-bold">
                  <td className="py-2.5 px-3 font-sans text-white">TOTAL GÉNÉRAL IMMOBILISATIONS</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">25 000</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">25 000 MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ETIC A3 : AMORTISSEMENTS */}
      {activeSection === 'etic-a3' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">TABLEAU A3 : TABLEAU DES AMORTISSEMENTS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-sans">Catégorie</th>
                  <th className="py-2.5 px-3 text-right">Cumul Début</th>
                  <th className="py-2.5 px-3 text-right">Dotation Exercice (6193)</th>
                  <th className="py-2.5 px-3 text-right">Reprises</th>
                  <th className="py-2.5 px-3 text-right text-amber-400">Cumul Fin d'Exercice (28)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-200">Amort. Matériel informatique (28355) - 20%</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-amber-400">5 000</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-400">5 000 MAD</td>
                </tr>
                <tr className="bg-slate-950 font-bold">
                  <td className="py-2.5 px-3 font-sans text-white">TOTAL AMORTISSEMENTS</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-amber-400">5 000</td>
                  <td className="py-2.5 px-3 text-right">0</td>
                  <td className="py-2.5 px-3 text-right text-amber-400">5 000 MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ETIC B1 : ÉCHÉANCES DES CRÉANCES ET DETTES */}
      {activeSection === 'etic-b1' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">TABLEAU B1 : ÉTAT DES ÉCHÉANCES DES CRÉANCES ET DES DETTES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-400 text-xs uppercase font-sans">CRÉANCES (À MOINS D'UN AN)</h4>
              <div className="divide-y divide-slate-800 font-mono text-xs">
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-slate-300">Clients et comptes rattachés (3421)</span>
                  <span className="font-bold text-slate-100">{bilan.actif.circulant.creancesClients.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-slate-300">État - Créances et TVA déductible</span>
                  <span className="font-bold text-slate-100">{bilan.actif.circulant.etatDebiteur.toLocaleString('fr-FR')} MAD</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-400 text-xs uppercase font-sans">DETTES (À MOINS D'UN AN)</h4>
              <div className="divide-y divide-slate-800 font-mono text-xs">
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-slate-300">Fournisseurs et comptes rattachés (4411)</span>
                  <span className="font-bold text-slate-100">{bilan.passif.passifCirculant.fournisseurs.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-slate-300">Dettes fiscales et sociales (444/445)</span>
                  <span className="font-bold text-slate-100">{bilan.passif.passifCirculant.dettesFiscalesSociales.toLocaleString('fr-FR')} MAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
