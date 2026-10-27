/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Import de relevés bancaires et Rapprochement Bancaire (Maroc)
 */

import React, { useState } from 'react';
import { Company, AccountingEntry, BankTransaction } from '../types/accounting';
import { Landmark, Upload, CheckCircle2, AlertCircle, RefreshCw, Sparkles, FileText } from 'lucide-react';

interface BankReconciliationTabProps {
  company: Company;
  entries: AccountingEntry[];
}

export const BankReconciliationTab: React.FC<BankReconciliationTabProps> = ({ company, entries }) => {
  // Liste des transactions du relevé bancaire
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([
    { id: 'tx_01', date: '2026-01-02', label: 'Virement entrant constitution capital', reference: 'VIR-9021', debit: 0, credit: 300000, matched: true, matchedEntryId: 'entry_01' },
    { id: 'tx_02', date: '2026-01-10', label: 'Virement Loyer bureau Casablanca', reference: 'VIR-LOY-01', debit: 18000, credit: 0, matched: true, matchedEntryId: 'entry_04' },
    { id: 'tx_03', date: '2026-01-12', label: 'Prélèvement automatique Lydec', reference: 'PRLV-892', debit: 3990, credit: 0, matched: true, matchedEntryId: 'entry_05' },
    { id: 'tx_04', date: '2026-01-30', label: 'Chèque n° 849201 Fournisseur Atlas', reference: 'CHQ-849201', debit: 144000, credit: 0, matched: true, matchedEntryId: 'entry_09' },
    { id: 'tx_05', date: '2026-01-31', label: 'Virement reçu Casablanca Trading', reference: 'VIR-ENC-44', debit: 0, credit: 216000, matched: true, matchedEntryId: 'entry_10' },
    { id: 'tx_06', date: '2026-01-31', label: 'Frais de tenue de compte & commissions CIH', reference: 'COM-CIH-01', debit: 165, credit: 0, matched: false }
  ]);

  const [bankName, setBankName] = useState('CIH Bank - Agence Anfa Casablanca');
  const [rib, setRib] = useState('230 780 0001234567890123 45');

  // Mouvements du compte 5141 Banques dans le journal
  const bankBookEntries = entries.flatMap(e =>
    e.lines.filter(l => l.accountCode === '5141').map(l => ({
      entryId: e.id,
      date: e.date,
      ref: e.reference,
      label: e.label,
      debit: l.debit,
      credit: l.credit
    }))
  );

  const soldeGrandLivre5141 = bankBookEntries.reduce((s, e) => s + (e.debit - e.credit), 0);
  const soldeExtraitBancaire = bankTransactions.reduce((s, t) => s + (t.credit - t.debit), 0);
  const ecartRapprochement = soldeGrandLivre5141 - soldeExtraitBancaire;

  const toggleMatch = (txId: string) => {
    setBankTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, matched: !t.matched } : t))
    );
  };

  const handleSimulateAutoReconciliation = () => {
    // Rapprochement automatique par montant
    setBankTransactions(prev =>
      prev.map(t => {
        const corresponding = bankBookEntries.find(e =>
          (t.debit > 0 && Math.abs(e.credit - t.debit) < 0.01) ||
          (t.credit > 0 && Math.abs(e.debit - t.credit) < 0.01)
        );
        return {
          ...t,
          matched: !!corresponding,
          matchedEntryId: corresponding?.entryId
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête Rapprochement */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Import de Relevés & Rapprochement Bancaire</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Compte 5141 Banques
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Pointage des opérations entre l'extrait de compte bancaire marocain et le journal de trésorerie
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateAutoReconciliation}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Pointage & Lettrage Automatique</span>
        </button>
      </div>

      {/* Cartes d'État de Rapprochement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-sans mb-1">Solde selon Extrait Bancaire (Banque)</div>
          <div className="text-xl font-bold text-slate-100">
            {soldeExtraitBancaire.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </div>
          <div className="text-[11px] text-slate-500 font-sans mt-1">{bankName}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-sans mb-1">Solde selon Grand Livre (Compte 5141)</div>
          <div className="text-xl font-bold text-emerald-400">
            {soldeGrandLivre5141.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </div>
          <div className="text-[11px] text-slate-500 font-sans mt-1">Comptabilité interne Mouhasib</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-sans mb-1">Écart de Rapprochement à Justifier</div>
          <div className={`text-xl font-bold ${Math.abs(ecartRapprochement) < 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {ecartRapprochement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </div>
          <div className="text-[11px] text-slate-400 font-sans mt-1">
            {Math.abs(ecartRapprochement) < 0.05 ? '✓ Parfaitement rapproché' : 'Opérations en suspens / commissions non saisies'}
          </div>
        </div>
      </div>

      {/* Tableau des transactions bancaires */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-slate-200 uppercase">Lignes du Relevé Bancaire Importé</span>
            <span className="text-slate-400 ml-2 font-mono">RIB: {rib}</span>
          </div>
          <span className="text-slate-400 font-mono">
            {bankTransactions.filter(t => t.matched).length} / {bankTransactions.length} rapprochées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-center">Pointage</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Réf</th>
                <th className="py-2.5 px-4 font-sans">Libellé Bancaire</th>
                <th className="py-2.5 px-3 text-right">Débit (Sortie)</th>
                <th className="py-2.5 px-3 text-right">Crédit (Entrée)</th>
                <th className="py-2.5 px-3 text-center font-sans">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bankTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={tx.matched}
                      onChange={() => toggleMatch(tx.id)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{tx.date}</td>
                  <td className="py-2.5 px-3 text-slate-400">{tx.reference}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-200">{tx.label}</td>
                  <td className="py-2.5 px-3 text-right text-slate-100">
                    {tx.debit > 0 ? tx.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-100">
                    {tx.credit > 0 ? tx.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    {tx.matched ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Rapproché ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                        À imputer
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
