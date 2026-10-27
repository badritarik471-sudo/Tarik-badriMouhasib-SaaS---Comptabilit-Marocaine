/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tableau de Bord Principal & Visualisation 3D
 */

import React from 'react';
import { Company, AccountingEntry } from '../types/accounting';
import { ThreeCanvas } from './ThreeCanvas';
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Receipt,
  Calendar,
  Sparkles,
  Volume2,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface DashboardTabProps {
  company: Company;
  entries: AccountingEntry[];
  metrics: {
    ca: number;
    charges: number;
    resultatNet: number;
    tresorerie: number;
    vatDue: number;
    currentCredit: number;
  };
  onNavigateTab: (tabId: string) => void;
  onOpenAudioBriefing: () => void;
  onScheduleCalendar: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  company,
  entries,
  metrics,
  onNavigateTab,
  onOpenAudioBriefing,
  onScheduleCalendar,
}) => {
  const recentEntries = entries.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Grille de 4 Cartes KPIs Financiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Chiffre d'affaires */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Chiffre d'Affaires HT
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {metrics.ca.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-sans">MAD</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Comptes Classe 71 (Ventes)</div>
          </div>
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Charges d'exploitation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Charges d'Exploitation
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {metrics.charges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-sans">MAD</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Comptes Classe 61 (Achats, salaires)</div>
          </div>
          <div className="p-3 bg-amber-950/80 border border-amber-800/60 rounded-xl text-amber-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Résultat Net Provisoire */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Résultat Net (Bénéfice)
            </div>
            <div className={`text-2xl font-bold font-mono ${metrics.resultatNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.resultatNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-sans">MAD</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Compte 1191 (Solde créditeur)</div>
          </div>
          <div className="p-3 bg-blue-950/80 border border-blue-800/60 rounded-xl text-blue-400">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Trésorerie Nette Disponible */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Trésorerie Disponible
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {metrics.tresorerie.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-sans">MAD</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Banques & Caisse (5141 + 5161)</div>
          </div>
          <div className="p-3 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visualisation 3D Interactive (Three.js) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Visualisation 3D Holographique des Piliers Financiers
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Modèle Three.js PBR • Damping exponentiel • Amortissements & Actifs
          </span>
        </div>

        <ThreeCanvas metrics={metrics} />
      </div>

      {/* Calendrier Fiscal Marocain & Opérations Récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier des obligations fiscales marocaines */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Échéancier Fiscal Marocain (DGI)</h4>
                <p className="text-[11px] text-slate-400">Calendrier des télédéclarations SIMPL</p>
              </div>
            </div>

            <button
              onClick={onScheduleCalendar}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Ajouter à Google Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Déclaration TVA du mois (SIMPL-TVA)</div>
                <div className="text-[11px] text-slate-400">
                  {metrics.vatDue > 0 ? `Montant estimé : ${metrics.vatDue.toLocaleString('fr-FR')} MAD due` : `Crédit de TVA : ${metrics.currentCredit.toLocaleString('fr-FR')} MAD`}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-amber-950 text-amber-300 border border-amber-800">
                20 du mois
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">1er Acompte Provisionnel d'IS & Liasse Fiscale</div>
                <div className="text-[11px] text-slate-400">Dépôt du bilan au greffe & DGI (SIMPL-IS)</div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-blue-950 text-blue-300 border border-blue-800">
                31 Mars 2026
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">2ème Acompte Provisionnel d'IS</div>
                <div className="text-[11px] text-slate-400">Paiement du deuxième quart de l'impôt société</div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
                30 Juin 2026
              </span>
            </div>
          </div>
        </div>

        {/* Dernières Écritures du Journal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Dernières Écritures Enregistrées</h4>
                <p className="text-[11px] text-slate-400">Journal général des opérations</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('journal')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Voir tout ({entries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {recentEntries.map((e) => (
              <div
                key={e.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition"
              >
                <div>
                  <div className="font-medium text-slate-200">{e.label}</div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>{e.date}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{e.journal}</span>
                    <span>•</span>
                    <span>{e.reference}</span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-slate-100">
                  {e.lines.reduce((s, l) => s + l.debit, 0).toLocaleString('fr-FR')} MAD
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
