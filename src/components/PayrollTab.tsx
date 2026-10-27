/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Module Paie Marocaine (Code du Travail, CNSS, AMO & IR)
 */

import React, { useState } from 'react';
import { Company, PayrollRecord, AccountingEntry } from '../types/accounting';
import { calculateMoroccanPayroll, generatePayrollJournalEntry } from '../utils/moroccanPayroll';
import { Users, Calculator, FileText, CheckCircle2, Plus, Sparkles, Printer } from 'lucide-react';

interface PayrollTabProps {
  company: Company;
  payrolls: PayrollRecord[];
  onAddPayroll: (payroll: PayrollRecord) => void;
  onAddEntry: (entry: AccountingEntry) => void;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({
  company,
  payrolls,
  onAddPayroll,
  onAddEntry,
}) => {
  const [employeeName, setEmployeeName] = useState('Omar El Fassi');
  const [cin, setCin] = useState('BE458921');
  const [cnssNumber, setCnssNumber] = useState('184920481');
  const [period, setPeriod] = useState('01/2026');
  const [baseSalary, setBaseSalary] = useState(12000);
  const [seniorityBonus, setSeniorityBonus] = useState(600);
  const [overtimeBonus, setOvertimeBonus] = useState(0);
  const [familyDependents, setFamilyDependents] = useState(2);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calcul en direct pour prévisualisation
  const preview = calculateMoroccanPayroll({
    employeeName,
    cin,
    cnssNumber,
    period,
    baseSalary,
    seniorityBonus,
    overtimeBonus,
    familyDependents,
    companyId: company.id
  });

  const handleSaveAndGenerateEntry = () => {
    onAddPayroll(preview);
    const accountingEntry = generatePayrollJournalEntry(preview);
    onAddEntry(accountingEntry);
    setSuccessMessage(`Bulletin de paie de ${preview.employeeName} (${preview.period}) et écriture comptable enregistrés avec succès !`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête Paie */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Gestion de la Paie Marocaine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                CNSS • AMO • IR 2026
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Calcul des cotisations salariales & patronales, barème IR marocain et comptabilisation automatique
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndGenerateEntry}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Valider & Générer l'Écriture Comptable</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulaire & Décompte côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulaire Saisie Salarié */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Paramètres du Bulletin de Salaire</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Nom & Prénom du salarié :</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">N° CIN :</label>
                <input
                  type="text"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">N° Immatriculation CNSS :</label>
                <input
                  type="text"
                  value={cnssNumber}
                  onChange={(e) => setCnssNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Période (Mois/Année) :</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Personnes à charge (IR) :</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={familyDependents}
                  onChange={(e) => setFamilyDependents(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Salaire de Base Brut (MAD) :</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Prime Ancienneté :</label>
                  <input
                    type="number"
                    value={seniorityBonus}
                    onChange={(e) => setSeniorityBonus(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Heures Supp. :</label>
                  <input
                    type="number"
                    value={overtimeBonus}
                    onChange={(e) => setOvertimeBonus(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulletin de Paie Détaillé */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Bulletin de Paie Prévisionnel
              </span>
              <div className="text-[11px] text-slate-400">
                {preview.employeeName} • CIN: {preview.cin} • CNSS: {preview.cnssNumber}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Net à Payer (Virement)</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {preview.netSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-sans">Rubrique</th>
                  <th className="py-2 px-3 text-right">Base</th>
                  <th className="py-2 px-3 text-right">Taux</th>
                  <th className="py-2 px-3 text-right text-emerald-400">Gains</th>
                  <th className="py-2 px-3 text-right text-amber-400">Retenues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="py-2 px-3 font-sans text-slate-200">Salaire de Base</td>
                  <td className="py-2 px-3 text-right text-slate-400">{preview.baseSalary.toLocaleString('fr-FR')}</td>
                  <td className="py-2 px-3 text-right text-slate-400">-</td>
                  <td className="py-2 px-3 text-right text-slate-100">{preview.baseSalary.toLocaleString('fr-FR')}</td>
                  <td className="py-2 px-3 text-right">-</td>
                </tr>
                {preview.seniorityBonus > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-200">Prime d'ancienneté</td>
                    <td className="py-2 px-3 text-right text-slate-400">{preview.baseSalary.toLocaleString('fr-FR')}</td>
                    <td className="py-2 px-3 text-right text-slate-400">5%</td>
                    <td className="py-2 px-3 text-right text-slate-100">{preview.seniorityBonus.toLocaleString('fr-FR')}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>
                )}
                <tr className="bg-slate-950/60 font-bold">
                  <td className="py-2 px-3 font-sans text-white">Salaire Brut Global (SBG)</td>
                  <td colSpan={2}></td>
                  <td className="py-2 px-3 text-right text-emerald-400">{preview.grossSalary.toLocaleString('fr-FR')}</td>
                  <td></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans text-slate-300">Cotisation CNSS Salariale</td>
                  <td className="py-2 px-3 text-right text-slate-400">{Math.min(preview.grossSalary, 6000).toLocaleString('fr-FR')}</td>
                  <td className="py-2 px-3 text-right text-slate-400">4.48% (plafonné)</td>
                  <td></td>
                  <td className="py-2 px-3 text-right text-amber-300">{preview.cnssSalarial.toLocaleString('fr-FR')}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans text-slate-300">Cotisation AMO Salariale</td>
                  <td className="py-2 px-3 text-right text-slate-400">{preview.grossSalary.toLocaleString('fr-FR')}</td>
                  <td className="py-2 px-3 text-right text-slate-400">2.26%</td>
                  <td></td>
                  <td className="py-2 px-3 text-right text-amber-300">{preview.amoSalarial.toLocaleString('fr-FR')}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans text-slate-300">Impôt sur le Revenu (IR Salaires)</td>
                  <td className="py-2 px-3 text-right text-slate-400">Net Imp. {preview.netImposable.toLocaleString('fr-FR')}</td>
                  <td className="py-2 px-3 text-right text-slate-400">Barème CGI</td>
                  <td></td>
                  <td className="py-2 px-3 text-right text-amber-300">{preview.irNet.toLocaleString('fr-FR')}</td>
                </tr>
                <tr className="bg-emerald-950/50 font-bold text-sm border-t-2 border-emerald-800">
                  <td className="py-2.5 px-3 font-sans text-emerald-300">SALAIRE NET À PAYER</td>
                  <td colSpan={3}></td>
                  <td className="py-2.5 px-3 text-right text-emerald-300">
                    {preview.netSalary.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charges patronales et coût employeur */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-slate-300 mb-1 font-sans">
              Charges Patronales Marocaines (Entreprise) :
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 font-mono text-[11px]">
              <div>Famille (6.40%) : <span className="text-slate-200">{preview.cnssPatronaleFamille.toLocaleString('fr-FR')}</span></div>
              <div>Prestations (8.98%) : <span className="text-slate-200">{preview.cnssPatronalePrestations.toLocaleString('fr-FR')}</span></div>
              <div>AMO (4.11%) : <span className="text-slate-200">{preview.amoPatronale.toLocaleString('fr-FR')}</span></div>
              <div>Formation (1.6%) : <span className="text-slate-200">{preview.taxeFormation.toLocaleString('fr-FR')}</span></div>
            </div>
            <div className="border-t border-slate-900 pt-2 flex justify-between font-bold text-slate-200">
              <span className="font-sans">Coût Total pour l'Employeur :</span>
              <span className="font-mono text-cyan-400">{preview.coutTotalEmployeur.toLocaleString('fr-FR')} MAD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des bulletins de paie */}
      {payrolls.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Bulletins de Salaires Enregistrés ({payrolls.length})
          </h3>
          <div className="divide-y divide-slate-800 text-xs">
            {payrolls.map((p) => (
              <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3 font-mono">
                <div>
                  <span className="font-bold text-slate-100 font-sans mr-2">{p.employeeName}</span>
                  <span className="text-slate-400">Période: {p.period}</span>
                  <span className="text-slate-500 ml-2">CIN: {p.cin}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-sans">Brut: {p.grossSalary.toLocaleString('fr-FR')} MAD</span>
                  <span className="text-emerald-400 font-bold">Net: {p.netSalary.toLocaleString('fr-FR')} MAD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
