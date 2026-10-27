/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Journal Général de comptabilité marocaine
 */

import React, { useState } from 'react';
import { AccountingEntry, Company, JournalType } from '../types/accounting';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';

interface JournalTabProps {
  entries: AccountingEntry[];
  company: Company;
  onDeleteEntry: (id: string) => void;
  onExportGoogleSheets: () => void;
  onOpenNewManualModal: () => void;
}

export const JournalTab: React.FC<JournalTabProps> = ({
  entries,
  company,
  onDeleteEntry,
  onExportGoogleSheets,
  onOpenNewManualModal,
}) => {
  const [selectedJournal, setSelectedJournal] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter((e) => {
    const matchesJournal = selectedJournal === 'TOUS' || e.journal === selectedJournal;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.label.toLowerCase().includes(q) ||
      e.reference.toLowerCase().includes(q) ||
      e.lines.some((l) => l.accountCode.includes(q) || l.accountLabel.toLowerCase().includes(q));
    return matchesJournal && matchesSearch;
  });

  // Calcul des totaux Débit et Crédit
  let totalDebit = 0;
  let totalCredit = 0;
  filteredEntries.forEach((e) => {
    e.lines.forEach((l) => {
      totalDebit += l.debit;
      totalCredit += l.credit;
    });
  });

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.05;

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date;Journal;Reference;Libelle;Compte;Intitule;Debit;Credit\n';

    filteredEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        csvContent += `${entry.date};${entry.journal};"${entry.reference}";"${entry.label.replace(/"/g, '""')}";${line.accountCode};"${line.accountLabel.replace(/"/g, '""')}";${line.debit};${line.credit}\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_${company.name.replace(/\s+/g, '_')}_${company.fiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils du Journal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filtres par Journal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Journal :
          </span>
          {['TOUS', 'ACHATS', 'VENTES', 'BANQUE', 'CAISSE', 'OD'].map((j) => (
            <button
              key={j}
              onClick={() => setSelectedJournal(j)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedJournal === j
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        {/* Barre de recherche et Exports */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher compte, réf..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Exporter le journal en fichier CSV compatible Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onExportGoogleSheets}
            className="flex items-center gap-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow"
            title="Exporter directement dans votre Google Drive / Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={onOpenNewManualModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouvelle Écriture</span>
          </button>
        </div>
      </div>

      {/* Résumé de balance du journal */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span className={isBalanced ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {isBalanced ? 'Journal équilibré' : 'Écart détecté'}
            </span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">
            {filteredEntries.length} écriture{filteredEntries.length > 1 ? 's' : ''} affichée{filteredEntries.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono font-bold">
          <div>
            <span className="text-slate-400 font-sans font-normal mr-2">Total Débit :</span>
            <span className="text-slate-100">{totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
          </div>
          <div>
            <span className="text-slate-400 font-sans font-normal mr-2">Total Crédit :</span>
            <span className="text-slate-100">{totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
          </div>
        </div>
      </div>

      {/* Table du Journal Général */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Réf</th>
                <th className="py-3 px-3">Journal</th>
                <th className="py-3 px-4">Libellé & Pièce</th>
                <th className="py-3 px-3">Compte PCM</th>
                <th className="py-3 px-4">Intitulé du compte</th>
                <th className="py-3 px-4 text-right">Débit (MAD)</th>
                <th className="py-3 px-4 text-right">Crédit (MAD)</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    Aucune écriture trouvée. Cliquez sur « Charger un exemple » ou saisissez une opération dans l'onglet Saisie IA.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <React.Fragment key={entry.id}>
                    {entry.lines.map((line, idx) => (
                      <tr
                        key={`${entry.id}-${idx}`}
                        className={`hover:bg-slate-800/40 transition ${
                          idx === 0 ? 'border-t-2 border-slate-800' : ''
                        }`}
                      >
                        {idx === 0 ? (
                          <td rowSpan={entry.lines.length} className="py-3 px-4 align-top border-r border-slate-800/60 bg-slate-950/20">
                            <div className="font-semibold text-slate-200">{entry.date}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{entry.reference}</div>
                          </td>
                        ) : null}

                        {idx === 0 ? (
                          <td rowSpan={entry.lines.length} className="py-3 px-3 align-top border-r border-slate-800/60 bg-slate-950/20">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                              {entry.journal}
                            </span>
                          </td>
                        ) : null}

                        {idx === 0 ? (
                          <td rowSpan={entry.lines.length} className="py-3 px-4 align-top font-sans border-r border-slate-800/60 bg-slate-950/20">
                            <div className="font-medium text-slate-100">{entry.label}</div>
                            {entry.vatRate ? (
                              <div className="text-[10px] text-emerald-400 mt-0.5">
                                TVA {entry.vatRate}% ({entry.vatAmount?.toLocaleString('fr-FR')} MAD)
                              </div>
                            ) : null}
                          </td>
                        ) : null}

                        <td className="py-2.5 px-3 font-bold text-emerald-400 border-r border-slate-800/40">
                          {line.accountCode}
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-300 border-r border-slate-800/40">
                          {line.accountLabel}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-100 font-semibold border-r border-slate-800/40">
                          {line.debit > 0 ? line.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-100 font-semibold border-r border-slate-800/40">
                          {line.credit > 0 ? line.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                        </td>

                        {idx === 0 ? (
                          <td rowSpan={entry.lines.length} className="py-3 px-3 align-top text-center bg-slate-950/20">
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer l'écriture ${entry.reference} ?`)) {
                                  onDeleteEntry(entry.id);
                                }
                              }}
                              className="text-slate-500 hover:text-red-400 p-1 rounded transition cursor-pointer"
                              title="Supprimer cette écriture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
            {filteredEntries.length > 0 && (
              <tfoot className="bg-slate-950 font-mono font-bold text-xs border-t-2 border-slate-700">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-right font-sans text-slate-300">
                    TOTAUX GÉNÉRAUX DU JOURNAL :
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    {totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    {totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
