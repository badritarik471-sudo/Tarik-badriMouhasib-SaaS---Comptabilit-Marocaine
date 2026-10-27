/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Grand Livre & Balance Générale marocaine (4 et 6 colonnes)
 */

import React, { useState } from 'react';
import { AccountingEntry, Company } from '../types/accounting';
import { computeGrandLivre, computeBalance } from '../utils/accountingEngine';
import { BookOpen, Scale, Search, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';

interface GrandLivreBalanceTabProps {
  entries: AccountingEntry[];
  company: Company;
}

export const GrandLivreBalanceTab: React.FC<GrandLivreBalanceTabProps> = ({ entries, company }) => {
  const [viewMode, setViewMode] = useState<'balance' | 'grand-livre'>('balance');
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceColumns, setBalanceColumns] = useState<4 | 6>(4);
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});

  const grandLivre = computeGrandLivre(entries);
  const balance = computeBalance(entries);

  const toggleExpand = (code: string) => {
    setExpandedAccounts(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const filteredBalance = balance.filter(row => {
    const q = searchQuery.toLowerCase().trim();
    return !q || row.accountCode.startsWith(q) || row.accountLabel.toLowerCase().includes(q);
  });

  const filteredGL = grandLivre.filter(acc => {
    const q = searchQuery.toLowerCase().trim();
    return !q || acc.accountCode.startsWith(q) || acc.accountLabel.toLowerCase().includes(q);
  });

  // Totaux de la balance
  const totMvtDebit = balance.reduce((s, r) => s + r.cumulDebit, 0);
  const totMvtCredit = balance.reduce((s, r) => s + r.cumulCredit, 0);
  const totSoldeDebiteur = balance.reduce((s, r) => s + r.soldeDebiteur, 0);
  const totSoldeCrediteur = balance.reduce((s, r) => s + r.soldeCrediteur, 0);

  const isMvtBalanced = Math.abs(totMvtDebit - totMvtCredit) < 0.05;
  const isSoldeBalanced = Math.abs(totSoldeDebiteur - totSoldeCrediteur) < 0.05;

  return (
    <div className="space-y-6">
      {/* Barre de contrôle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('balance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              viewMode === 'balance'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balance Générale</span>
          </button>

          <button
            onClick={() => setViewMode('grand-livre')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              viewMode === 'grand-livre'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Grand Livre des Comptes</span>
          </button>

          {viewMode === 'balance' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 ml-2">
              <button
                onClick={() => setBalanceColumns(4)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                  balanceColumns === 4 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                4 colonnes
              </button>
              <button
                onClick={() => setBalanceColumns(6)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                  balanceColumns === 6 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                6 colonnes
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher numéro ou libellé de compte..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* VUE 1 : BALANCE GÉNÉRALE */}
      {viewMode === 'balance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-2">
          {/* Indicateurs d'équilibre */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">
                Balance générale à {balanceColumns} colonnes — Conforme CGNC Maroc
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className={isMvtBalanced ? 'text-emerald-400' : 'text-red-400'}>
                Mouvements Débit = Crédit : {isMvtBalanced ? 'OUI ✓' : 'NON ✗'}
              </span>
              <span className="text-slate-600">|</span>
              <span className={isSoldeBalanced ? 'text-emerald-400' : 'text-red-400'}>
                Soldes Débiteur = Créditeur : {isSoldeBalanced ? 'OUI ✓' : 'NON ✗'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Compte</th>
                  <th className="py-3 px-4 font-sans">Intitulé du Compte PCM</th>
                  {balanceColumns === 6 && (
                    <>
                      <th className="py-3 px-3 text-right bg-slate-900/60 text-slate-400">Solde Ouv. Débit</th>
                      <th className="py-3 px-3 text-right bg-slate-900/60 text-slate-400">Solde Ouv. Crédit</th>
                    </>
                  )}
                  <th className="py-3 px-3 text-right">Mouvement Débit</th>
                  <th className="py-3 px-3 text-right">Mouvement Crédit</th>
                  <th className="py-3 px-3 text-right text-emerald-300">Solde Débiteur</th>
                  <th className="py-3 px-3 text-right text-emerald-300">Solde Créditeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBalance.length === 0 ? (
                  <tr>
                    <td colSpan={balanceColumns === 6 ? 8 : 6} className="py-12 text-center text-slate-500 font-sans">
                      Aucun compte dans la balance pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredBalance.map((row) => (
                    <tr key={row.accountCode} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{row.accountCode}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-200">{row.accountLabel}</td>
                      {balanceColumns === 6 && (
                        <>
                          <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                        </>
                      )}
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {row.cumulDebit > 0 ? row.cumulDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {row.cumulCredit > 0 ? row.cumulCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                        {row.soldeDebiteur > 0 ? row.soldeDebiteur.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                        {row.soldeCrediteur > 0 ? row.soldeCrediteur.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-xs">
                <tr>
                  <td colSpan={balanceColumns === 6 ? 4 : 2} className="py-3 px-4 text-right font-sans text-slate-300">
                    TOTAUX DE LA BALANCE :
                  </td>
                  <td className="py-3 px-3 text-right text-slate-100">
                    {totMvtDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                  <td className="py-3 px-3 text-right text-slate-100">
                    {totMvtCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">
                    {totSoldeDebiteur.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">
                    {totSoldeCrediteur.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VUE 2 : GRAND LIVRE */}
      {viewMode === 'grand-livre' && (
        <div className="space-y-4">
          {filteredGL.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              Aucun compte actif dans le Grand Livre.
            </div>
          ) : (
            filteredGL.map((acc) => {
              const isExpanded = expandedAccounts[acc.accountCode] !== false;
              return (
                <div key={acc.accountCode} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  {/* En-tête du compte */}
                  <div
                    onClick={() => toggleExpand(acc.accountCode)}
                    className="p-3 bg-slate-950 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer border-b border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-mono font-bold text-sm text-emerald-400">{acc.accountCode}</span>
                      <span className="text-xs font-semibold text-slate-200">{acc.accountLabel}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({acc.lines.length} ligne{acc.lines.length > 1 ? 's' : ''})</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">Débit</span>
                        <span className="text-slate-200">{acc.totalDebit.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">Crédit</span>
                        <span className="text-slate-200">{acc.totalCredit.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="text-right pl-2 border-l border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Solde</span>
                        <span className={acc.soldeDebiteur > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {acc.soldeDebiteur > 0 ? `D: ${acc.soldeDebiteur.toLocaleString('fr-FR')}` : `C: ${acc.soldeCrediteur.toLocaleString('fr-FR')}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lignes détaillées du compte */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Référence</th>
                            <th className="py-2 px-4 font-sans">Libellé de l'opération</th>
                            <th className="py-2 px-3 text-right">Débit (MAD)</th>
                            <th className="py-2 px-3 text-right">Crédit (MAD)</th>
                            <th className="py-2 px-3 text-right">Solde Progressif</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {acc.lines.map((l, i) => (
                            <tr key={i} className="hover:bg-slate-800/30 transition text-slate-300">
                              <td className="py-2 px-3">{l.date}</td>
                              <td className="py-2 px-3 text-slate-400">{l.entryRef}</td>
                              <td className="py-2 px-4 font-sans text-slate-200">{l.entryLabel}</td>
                              <td className="py-2 px-3 text-right text-slate-100">
                                {l.debit > 0 ? l.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-100">
                                {l.credit > 0 ? l.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                              </td>
                              <td className={`py-2 px-3 text-right font-semibold ${l.runningBalance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {l.runningBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
