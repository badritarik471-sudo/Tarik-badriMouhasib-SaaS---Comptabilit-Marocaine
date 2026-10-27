/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Déclaration et Récapitulatif de TVA Marocaine (Portail SIMPL-TVA)
 */

import React from 'react';
import { AccountingEntry, Company, VatSummary } from '../types/accounting';
import { computeVatSummary } from '../utils/accountingEngine';
import { Receipt, CheckCircle2, AlertCircle, Calendar, Plus, Sparkles } from 'lucide-react';

interface VatTabProps {
  entries: AccountingEntry[];
  company: Company;
  onAddEntry: (entry: AccountingEntry) => void;
}

export const VatTab: React.FC<VatTabProps> = ({ entries, company, onAddEntry }) => {
  const vatSummary = computeVatSummary(entries);

  // Générer l'écriture comptable de régularisation / déclaration de TVA
  const handleGenerateVatDeclarationEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const lines = [];

    // Débit du compte 4455 (pour le solder)
    if (vatSummary.totalVatCollected > 0) {
      lines.push({
        accountCode: '4455',
        accountLabel: 'État, TVA facturée (Solde pour déclaration)',
        debit: vatSummary.totalVatCollected,
        credit: 0
      });
    }

    // Crédit du compte 34552 (pour le solder)
    if (vatSummary.vatRecoverableCharges > 0) {
      lines.push({
        accountCode: '34552',
        accountLabel: 'État - TVA récupérable sur charges',
        debit: 0,
        credit: vatSummary.vatRecoverableCharges
      });
    }

    // Crédit du compte 34551 (pour le solder)
    if (vatSummary.vatRecoverableImmo > 0) {
      lines.push({
        accountCode: '34551',
        accountLabel: 'État - TVA récupérable sur immobilisations',
        debit: 0,
        credit: vatSummary.vatRecoverableImmo
      });
    }

    // Si TVA Due > 0 -> Crédit 4456 (État, TVA due)
    if (vatSummary.vatDue > 0) {
      lines.push({
        accountCode: '4456',
        accountLabel: 'État, TVA due (suivant déclaration mensuelle)',
        debit: 0,
        credit: vatSummary.vatDue
      });
    } else if (vatSummary.currentCredit > 0) {
      // Si Crédit de TVA > 0 -> Débit 3456 (État, crédit de TVA)
      lines.push({
        accountCode: '3456',
        accountLabel: 'État - Crédit de TVA à reporter',
        debit: vatSummary.currentCredit,
        credit: 0
      });
    }

    const newEntry: AccountingEntry = {
      id: `vat_decl_${Date.now()}`,
      companyId: company.id,
      date: today,
      reference: `TVA-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      journal: 'OD',
      label: `Déclaration mensuelle de TVA - ${company.name}`,
      status: 'validated',
      source: 'closing',
      lines
    };

    onAddEntry(newEntry);
  };

  return (
    <div className="space-y-6">
      {/* En-tête TVA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Déclaration Fiscale de TVA Marocaine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                SIMPL-TVA DGI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Régime du droit commun (encaissement / débit) conforme au Code Général des Impôts marocain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg font-medium">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Échéance légale : 20 du mois suivant</span>
          </div>

          <button
            onClick={handleGenerateVatDeclarationEntry}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Générer l'Écriture de Clôture TVA</span>
          </button>
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total TVA Facturée */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs text-slate-400 font-medium mb-1">TVA Facturée Collectée (4455)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {vatSummary.totalVatCollected.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-2">
            <span>20%: {vatSummary.vatCollected20.toLocaleString('fr-FR')}</span>
            <span>• 14%: {vatSummary.vatCollected14.toLocaleString('fr-FR')}</span>
            <span>• 10%: {vatSummary.vatCollected10.toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {/* Total TVA Récupérable */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs text-slate-400 font-medium mb-1">TVA Déductible Récupérable (3455)</div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {vatSummary.totalVatRecoverable.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex gap-2">
            <span>Sur charges (34552) : {vatSummary.vatRecoverableCharges.toLocaleString('fr-FR')}</span>
            <span>• Sur immos (34551) : {vatSummary.vatRecoverableImmo.toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {/* Résultat : TVA Due ou Crédit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs text-slate-400 font-medium mb-1">Situation Nette de la Période</div>
          {vatSummary.vatDue > 0 ? (
            <div>
              <div className="text-2xl font-bold font-mono text-red-400">
                {vatSummary.vatDue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </div>
              <div className="mt-2 text-[11px] text-red-300 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>TVA NETTE À PAYER (Compte 4456)</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {vatSummary.currentCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </div>
              <div className="mt-2 text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CRÉDIT DE TVA À REPORTER (Compte 3456)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau détaillé de la déclaration SIMPL-TVA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 p-4 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Bordereau Récapitulatif SIMPL-TVA Maroc
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-sans">Rubrique Fiscale</th>
                <th className="py-2.5 px-3">Compte PCM</th>
                <th className="py-2.5 px-3">Taux Applicable</th>
                <th className="py-2.5 px-4 text-right">Montant (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-sans text-slate-200">TVA Facturée au taux normal (20%)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">4455</td>
                <td className="py-2.5 px-3 text-slate-300">20%</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-100">{vatSummary.vatCollected20.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-sans text-slate-200">TVA Facturée au taux réduit (14% - Électricité/Transport)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">4455</td>
                <td className="py-2.5 px-3 text-slate-300">14%</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-100">{vatSummary.vatCollected14.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-sans text-slate-200">TVA Facturée au taux réduit (10% - Honoraires/Banque)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">4455</td>
                <td className="py-2.5 px-3 text-slate-300">10%</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-100">{vatSummary.vatCollected10.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-slate-950 font-bold">
                <td className="py-2.5 px-4 font-sans text-emerald-400">TOTAL TVA COLLECTÉE FACTURÉE</td>
                <td className="py-2.5 px-3 text-emerald-400">4455</td>
                <td className="py-2.5 px-3">-</td>
                <td className="py-2.5 px-4 text-right text-emerald-400">{vatSummary.totalVatCollected.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-sans text-slate-200">- TVA récupérable sur charges d'exploitation</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">34552</td>
                <td className="py-2.5 px-3 text-slate-300">Mixte</td>
                <td className="py-2.5 px-4 text-right text-slate-100">{vatSummary.vatRecoverableCharges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-sans text-slate-200">- TVA récupérable sur immobilisations</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">34551</td>
                <td className="py-2.5 px-3 text-slate-300">20%</td>
                <td className="py-2.5 px-4 text-right text-slate-100">{vatSummary.vatRecoverableImmo.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-sans text-slate-200">- Crédit de TVA antérieur reporté</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">3456</td>
                <td className="py-2.5 px-3 text-slate-300">-</td>
                <td className="py-2.5 px-4 text-right text-slate-100">{vatSummary.priorCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-slate-950 font-bold text-sm border-t-2 border-slate-700">
                <td className="py-3 px-4 font-sans text-white">
                  {vatSummary.vatDue > 0 ? 'TVA DUE À TÉLÉPÉAYER À L’ÉTAT MAROCAIN (DGI) :' : 'CRÉDIT DE TVA À REPORTER SUR LA PÉRIODE SUIVANTE :'}
                </td>
                <td className="py-3 px-3 text-emerald-400">{vatSummary.vatDue > 0 ? '4456' : '3456'}</td>
                <td className="py-3 px-3">-</td>
                <td className={`py-3 px-4 text-right ${vatSummary.vatDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {vatSummary.vatDue > 0
                    ? `${vatSummary.vatDue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`
                    : `${vatSummary.currentCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
