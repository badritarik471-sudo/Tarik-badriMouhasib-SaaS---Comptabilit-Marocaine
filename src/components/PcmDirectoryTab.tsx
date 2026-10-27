/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Consultation et Recherche dans le Plan Comptable Général Marocain (PCM)
 * Issu de l'ouvrage de référence (Professeur Mohammed ABOUTAHIR - ENSET Mohammedia)
 */

import React, { useState } from 'react';
import { PLAN_COMPTABLE_MAROCAIN, searchAccounts } from '../data/planComptableMarocain';
import { BookOpen, Search, Filter, Hash, CheckCircle2 } from 'lucide-react';

export const PcmDirectoryTab: React.FC = () => {
  const [selectedClasse, setSelectedClasse] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const classes = [
    { num: 'ALL', name: 'Toutes les classes' },
    { num: 1, name: 'Classe 1 : Financement permanent' },
    { num: 2, name: 'Classe 2 : Actif immobilisé' },
    { num: 3, name: 'Classe 3 : Actif circulant (hors trésorerie)' },
    { num: 4, name: 'Classe 4 : Passif circulant (hors trésorerie)' },
    { num: 5, name: 'Classe 5 : Comptes de trésorerie' },
    { num: 6, name: 'Classe 6 : Comptes de charges' },
    { num: 7, name: 'Classe 7 : Comptes de produits' },
    { num: 8, name: 'Classe 8 : Comptes de résultats' },
    { num: 9, name: 'Classe 9 : Produits et charges réfléchis' },
    { num: 0, name: 'Classe 0 : Comptes spéciaux' },
  ];

  const filtered = PLAN_COMPTABLE_MAROCAIN.filter(acc => {
    const matchesClasse = selectedClasse === 'ALL' || acc.classe === selectedClasse;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      acc.code.startsWith(q) ||
      acc.label.toLowerCase().includes(q) ||
      acc.category.toLowerCase().includes(q);
    return matchesClasse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* En-tête du PCM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Plan Comptable Général Marocain (PCM)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Classes 1 à 9 et Classe 0
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Répertoire intégral conforme au Code Général de Normalisation Comptable (CGNC) marocain
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
          <span>{filtered.length} compte{filtered.length > 1 ? 's' : ''} répertorié{filtered.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Barre de filtre et de recherche */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Sélecteur de classe */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {classes.map(c => (
              <option key={c.num} value={c.num}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Recherche instantanée */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par code (ex: 6111) ou libellé..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table des comptes du PCM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-28">N° de Compte</th>
                <th className="py-3 px-3 w-24">Classe</th>
                <th className="py-3 px-4">Intitulé du compte (CGNC)</th>
                <th className="py-3 px-4">Rubrique / Catégorie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Aucun compte ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">
                      {acc.code}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Classe {acc.classe}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-100">
                      {acc.label}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {acc.category}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
