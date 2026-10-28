/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Onglet d'importation universel de fichiers Excel (.xls, .xlsx, .csv)
 * Génère automatiquement la comptabilité marocaine complète
 */

import React, { useState, useRef } from 'react';
import { Company, AccountingEntry } from '../types/accounting';
import { parseExcelAccountingFile, generateExcelTemplate, ExcelImportResult } from '../utils/excelAccountingImporter';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Layers,
  Database
} from 'lucide-react';

interface ExcelImportTabProps {
  company: Company;
  onImportEntries: (newEntries: AccountingEntry[], replaceExisting: boolean) => void;
  onNavigateTab: (tabId: string) => void;
}

export const ExcelImportTab: React.FC<ExcelImportTabProps> = ({
  company,
  onImportEntries,
  onNavigateTab,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setStatusMessage(null);
      setSelectedFile(file);

      const result = await parseExcelAccountingFile(file, company);
      setImportResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erreur lors de la lecture du fichier Excel.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyImport = () => {
    if (!importResult || importResult.entries.length === 0) return;
    onImportEntries(importResult.entries, replaceExisting);
    setStatusMessage(
      `Succès : ${importResult.entries.length} écritures importées ! La comptabilité complète (Journal, Grand Livre, Balance, CPC, ESG, Bilan, TVA) a été recalculée.`
    );
  };

  // Démo instantanée avec fichier d'exemple pré-généré
  const handleLoadDemoExcel = async () => {
    // Créer un blob Excel réel et le parser
    const templateData = [
      { 'Date': '2026-01-05', 'Journal': 'ACHATS', 'Référence': 'FAC-ATLAS-101', 'Compte PCM': '6111', 'Intitulé du compte': 'Achats de marchandises', 'Débit (MAD)': 120000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'Achat marchandises Atlas' },
      { 'Date': '2026-01-05', 'Journal': 'ACHATS', 'Référence': 'FAC-ATLAS-101', 'Compte PCM': '34552', 'Intitulé du compte': 'État - TVA récupérable sur charges', 'Débit (MAD)': 24000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'TVA 20%' },
      { 'Date': '2026-01-05', 'Journal': 'ACHATS', 'Référence': 'FAC-ATLAS-101', 'Compte PCM': '4411', 'Intitulé du compte': 'Fournisseurs', 'Débit (MAD)': 0, 'Crédit (MAD)': 144000, 'Libellé de l\'opération': 'Dette Fournisseur Atlas' },
      { 'Date': '2026-01-10', 'Journal': 'VENTES', 'Référence': 'VTE-CASA-01', 'Compte PCM': '3421', 'Intitulé du compte': 'Clients', 'Débit (MAD)': 216000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'Client Casablanca' },
      { 'Date': '2026-01-10', 'Journal': 'VENTES', 'Référence': 'VTE-CASA-01', 'Compte PCM': '7111', 'Intitulé du compte': 'Ventes de marchandises au Maroc', 'Débit (MAD)': 0, 'Crédit (MAD)': 180000, 'Libellé de l\'opération': 'Vente HT' },
      { 'Date': '2026-01-10', 'Journal': 'VENTES', 'Référence': 'VTE-CASA-01', 'Compte PCM': '4455', 'Intitulé du compte': 'État, TVA facturée', 'Débit (MAD)': 0, 'Crédit (MAD)': 36000, 'Libellé de l\'opération': 'TVA 20%' },
      { 'Date': '2026-01-15', 'Journal': 'BANQUE', 'Référence': 'LOY-ANFA', 'Compte PCM': '6131', 'Intitulé du compte': 'Locations et charges locatives', 'Débit (MAD)': 15000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'Loyer bureau Anfa' },
      { 'Date': '2026-01-15', 'Journal': 'BANQUE', 'Référence': 'LOY-ANFA', 'Compte PCM': '34552', 'Intitulé du compte': 'État - TVA récupérable sur charges', 'Débit (MAD)': 3000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'TVA loyer' },
      { 'Date': '2026-01-15', 'Journal': 'BANQUE', 'Référence': 'LOY-ANFA', 'Compte PCM': '5141', 'Intitulé du compte': 'Banques', 'Débit (MAD)': 0, 'Crédit (MAD)': 18000, 'Libellé de l\'opération': 'Paiement banque CIH' },
      { 'Date': '2026-01-20', 'Journal': 'OD', 'Référence': 'DELL-IMM', 'Compte PCM': '2355', 'Intitulé du compte': 'Matériel informatique', 'Débit (MAD)': 25000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'Serveurs et PC' },
      { 'Date': '2026-01-20', 'Journal': 'OD', 'Référence': 'DELL-IMM', 'Compte PCM': '34551', 'Intitulé du compte': 'État - TVA récupérable sur immobilisations', 'Débit (MAD)': 5000, 'Crédit (MAD)': 0, 'Libellé de l\'opération': 'TVA immo' },
      { 'Date': '2026-01-20', 'Journal': 'OD', 'Référence': 'DELL-IMM', 'Compte PCM': '4481', 'Intitulé du compte': 'Dettes sur acquisitions d\'immobilisations', 'Débit (MAD)': 0, 'Crédit (MAD)': 30000, 'Libellé de l\'opération': 'Fournisseur Dell' }
    ];

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comptabilite');
    const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([u8], 'Comptabilite_Complete_Maroc_2026.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    handleFileProcess(file);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Importation de Fichiers Excel (.xls, .xlsx, .csv)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Génération Automatique
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Déposez votre fichier Excel : Mouhasib calcule instantanément le Journal, le Grand Livre, la Balance, le CPC, l'ESG, le Bilan et la TVA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateExcelTemplate}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
            title="Télécharger un modèle type au format Excel .xlsx"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Télécharger Modèle Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleLoadDemoExcel}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow"
            title="Charger directement un jeu d'essai Excel"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Charger Fichier Excel Démo</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {statusMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('journal')}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition cursor-pointer"
            >
              Voir le Journal
            </button>
            <button
              onClick={() => onNavigateTab('etats-financiers')}
              className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg font-semibold hover:bg-slate-700 transition cursor-pointer"
            >
              Voir le Bilan & CPC
            </button>
            <button
              onClick={() => onNavigateTab('business-plan')}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer"
            >
              Voir le Business Plan
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Zone de Drag and Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-950/30'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="p-4 rounded-full bg-slate-800/80 text-emerald-400">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-1">
            Glissez-déposez votre document Excel ici, ou cliquez pour parcourir
          </h3>
          <p className="text-xs text-slate-400">
            Prend en charge tous les formats : <span className="text-slate-200 font-mono">.XLSX, .XLS, .CSV</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
          <span>✓ Journal comptable</span>
          <span>✓ Relevés de factures</span>
          <span>✓ Relevés bancaires</span>
          <span>✓ Balance d'ouverture</span>
        </div>
      </div>

      {/* Prévisualisation des données extraites du fichier Excel */}
      {importResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Fichier analysé avec succès
                </span>
                <span className="text-xs font-mono text-slate-300">{selectedFile?.name}</span>
              </div>
              <p className="text-xs text-slate-400">
                {importResult.totalRows} lignes lues • {importResult.entries.length} écritures comptables PCM identifiées
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                />
                <span>Remplacer les écritures actuelles</span>
              </label>

              <button
                onClick={handleApplyImport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Générer Bilan, CPC & Journal</span>
              </button>
            </div>
          </div>

          {/* Tableau d'aperçu des premières écritures */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Journal</th>
                  <th className="py-2.5 px-3">Réf</th>
                  <th className="py-2.5 px-4 font-sans">Libellé</th>
                  <th className="py-2.5 px-3">Compte PCM</th>
                  <th className="py-2.5 px-4 font-sans">Intitulé</th>
                  <th className="py-2.5 px-3 text-right">Débit</th>
                  <th className="py-2.5 px-3 text-right">Crédit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {importResult.entries.slice(0, 10).map((entry, eIdx) =>
                  entry.lines.map((l, lIdx) => (
                    <tr key={`${eIdx}-${lIdx}`} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-300">{lIdx === 0 ? entry.date : ''}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">{lIdx === 0 ? entry.journal : ''}</td>
                      <td className="py-2 px-3 text-slate-400">{lIdx === 0 ? entry.reference : ''}</td>
                      <td className="py-2 px-4 font-sans text-slate-200">{lIdx === 0 ? entry.label : ''}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">{l.accountCode}</td>
                      <td className="py-2 px-4 font-sans text-slate-300">{l.accountLabel}</td>
                      <td className="py-2 px-3 text-right text-slate-100">{l.debit > 0 ? l.debit.toLocaleString('fr-FR') : '-'}</td>
                      <td className="py-2 px-3 text-right text-slate-100">{l.credit > 0 ? l.credit.toLocaleString('fr-FR') : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guide des colonnes reconnues */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Comment préparer votre fichier Excel pour un import parfait :</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 leading-relaxed">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Option 1 : Format Journal Standard (Recommandé)</span>
            Colonnes : <code className="text-emerald-400 font-mono">Date</code>, <code className="text-emerald-400 font-mono">Journal</code> (ACHATS, VENTES, BANQUE, OD), <code className="text-emerald-400 font-mono">Compte PCM</code> (ex: 6111, 4411), <code className="text-emerald-400 font-mono">Libellé</code>, <code className="text-emerald-400 font-mono">Débit</code>, <code className="text-emerald-400 font-mono">Crédit</code>.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Option 2 : Liste de Dépenses ou Factures</span>
            Colonnes : <code className="text-blue-400 font-mono">Date</code>, <code className="text-blue-400 font-mono">Description / Tiers</code> (ex: Achat fournitures, Loyer, Vente client), <code className="text-blue-400 font-mono">Montant</code>, <code className="text-blue-400 font-mono">Taux TVA</code> (20, 14, 10, 7). L'algorithme Mouhasib affectera automatiquement les comptes marocains correspondants.
          </div>
        </div>
      </div>
    </div>
  );
};
