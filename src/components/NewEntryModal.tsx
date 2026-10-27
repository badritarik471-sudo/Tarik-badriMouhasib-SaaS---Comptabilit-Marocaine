/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de saisie manuelle d'une écriture comptable au Journal
 */

import React, { useState } from 'react';
import { Company, AccountingEntry, EntryLine, JournalType } from '../types/accounting';
import { PLAN_COMPTABLE_MAROCAIN, findAccountByCode } from '../data/planComptableMarocain';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onAddEntry: (entry: AccountingEntry) => void;
}

export const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  onClose,
  company,
  onAddEntry,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journal, setJournal] = useState<JournalType>('ACHATS');
  const [reference, setReference] = useState(`PIECE-${Date.now().toString().slice(-4)}`);
  const [label, setLabel] = useState('');
  const [lines, setLines] = useState<EntryLine[]>([
    { accountCode: '6111', accountLabel: 'Achats de marchandises', debit: 0, credit: 0 },
    { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges', debit: 0, credit: 0 },
    { accountCode: '4411', accountLabel: 'Fournisseurs', debit: 0, credit: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLineChange = (index: number, field: keyof EntryLine, value: any) => {
    const updated = [...lines];
    if (field === 'accountCode') {
      const acc = findAccountByCode(value);
      updated[index].accountCode = value;
      if (acc) updated[index].accountLabel = acc.label;
    } else {
      (updated[index] as any)[field] = value;
    }
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { accountCode: '5141', accountLabel: 'Banques (solde débiteur)', debit: 0, credit: 0 }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const totDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totDebit - totCredit) < 0.05 && totDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Veuillez renseigner le libellé de la pièce.');
      return;
    }
    if (!isBalanced) {
      setError(`L'écriture doit être équilibrée : Débit (${totDebit}) ≠ Crédit (${totCredit})`);
      return;
    }

    const entry: AccountingEntry = {
      id: `manual_${Date.now()}`,
      companyId: company.id,
      date,
      journal,
      reference,
      label,
      lines: lines.map(l => ({
        accountCode: l.accountCode,
        accountLabel: l.accountLabel,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
      status: 'validated',
      source: 'manual',
      createdAt: new Date().toISOString()
    };

    onAddEntry(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-4">Nouvelle Écriture Comptable au Journal</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Date d'opération :</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Journal auxiliaire :</label>
              <select
                value={journal}
                onChange={(e) => setJournal(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ACHATS">ACHATS</option>
                <option value="VENTES">VENTES</option>
                <option value="BANQUE">BANQUE</option>
                <option value="CAISSE">CAISSE</option>
                <option value="OD">OPÉRATIONS DIVERSES (OD)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">N° Pièce / Réf. :</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Libellé de l'écriture :</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex : Règlement facture fournisseur par virement CIH..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Lignes Débit / Crédit */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 w-28">Compte PCM</th>
                  <th className="py-2 px-3">Intitulé</th>
                  <th className="py-2 px-3 text-right w-28">Débit (MAD)</th>
                  <th className="py-2 px-3 text-right w-28">Crédit (MAD)</th>
                  <th className="py-2 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {lines.map((line, idx) => (
                  <tr key={idx} className="bg-slate-900/50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={line.accountCode}
                        onChange={(e) => handleLineChange(idx, 'accountCode', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold focus:outline-none"
                      />
                    </td>
                    <td className="p-2 font-sans">
                      <input
                        type="text"
                        value={line.accountLabel}
                        onChange={(e) => handleLineChange(idx, 'accountLabel', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.debit || ''}
                        onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-semibold focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.credit || ''}
                        onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-semibold focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950 font-mono font-bold text-xs border-t border-slate-700">
                <tr>
                  <td colSpan={2} className="py-2 px-3 text-right font-sans text-slate-400">
                    Totaux :
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400">{totDebit.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{totCredit.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une ligne</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isBalanced}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition cursor-pointer shadow"
              >
                Enregistrer l'écriture
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
