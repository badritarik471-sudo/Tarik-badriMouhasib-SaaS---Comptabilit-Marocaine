/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Saisie en une phrase assistée par IA Gemini & Scan OCR de factures
 */

import React, { useState } from 'react';
import { AccountingEntry, Company } from '../types/accounting';
import { parseNaturalLanguageOffline } from '../utils/accountingEngine';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Receipt,
  ScanLine,
  HelpCircle,
  Plus
} from 'lucide-react';

interface SmartEntryTabProps {
  company: Company;
  onAddEntry: (entry: AccountingEntry) => void;
}

export const SmartEntryTab: React.FC<SmartEntryTabProps> = ({ company, onAddEntry }) => {
  const [promptText, setPromptText] = useState('Achat de marchandises 120 000 HT fournisseur Atlas');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanningInvoice, setIsScanningInvoice] = useState(false);
  const [suggestedEntry, setSuggestedEntry] = useState<AccountingEntry | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Exemples rapides de phrases marocaines
  const samplePrompts = [
    'Achat de marchandises 120 000 HT fournisseur Atlas',
    'Facture électricité REDAL 3500 TTC',
    'Loyer de bureaux Casablanca 15 000 DH par virement bancaire',
    'Vente de prestations informatiques 65 000 HT client OCP',
    'Honoraires expert-comptable 12 000 HT fiduciaire Anfa',
    'Achat de 4 ordinateurs Dell 32 000 HT pour le bureau',
    'Règlement fournisseur Atlas 144 000 par chèque bancaire',
    'Paiement acompte IS 15 000 DH par virement'
  ];

  const handleParsePrompt = async (textToParse?: string) => {
    const text = textToParse || promptText;
    if (!text.trim()) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setAiExplanation(null);

      // 1. Appel du backend Gemini API
      const res = await fetch('/api/accounting/parse-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          companyName: company.name
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data?.lines?.length) {
          const entry: AccountingEntry = {
            id: `entry_${Date.now()}`,
            companyId: company.id,
            date: result.data.date || new Date().toISOString().split('T')[0],
            reference: result.data.reference || `FAC-${Date.now().toString().slice(-4)}`,
            journal: (result.data.journal as any) || 'ACHATS',
            label: result.data.label || text,
            vatRate: result.data.vatRate,
            vatAmount: result.data.vatAmount,
            status: 'draft',
            source: 'ai_prompt',
            lines: result.data.lines
          };
          setSuggestedEntry(entry);
          setAiExplanation(result.data.explanation || 'Écriture proposée avec succès selon le Plan Comptable Marocain.');
          return;
        }
      }

      // 2. Fallback règle locale si indisponible
      const fallback = parseNaturalLanguageOffline(text, company.id);
      if (fallback) {
        setSuggestedEntry(fallback);
        setAiExplanation('Écriture analysée avec le moteur de règles comptables marocain (hors-ligne).');
      } else {
        setErrorMessage("Impossible d'interpréter automatiquement la phrase. Vérifiez le montant et la nature de l'opération.");
      }
    } catch (err: any) {
      console.warn('API error, using fallback:', err);
      const fallback = parseNaturalLanguageOffline(text, company.id);
      if (fallback) {
        setSuggestedEntry(fallback);
        setAiExplanation('Écriture analysée avec le moteur de règles locales.');
      } else {
        setErrorMessage("Erreur d'analyse. Veuillez réessayer.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateAndSave = () => {
    if (!suggestedEntry) return;

    // Vérifier l'équilibre Débit = Crédit
    const totDebit = suggestedEntry.lines.reduce((s, l) => s + l.debit, 0);
    const totCredit = suggestedEntry.lines.reduce((s, l) => s + l.credit, 0);

    if (Math.abs(totDebit - totCredit) > 0.05) {
      setErrorMessage(`L'écriture n'est pas équilibrée (Débit: ${totDebit} ≠ Crédit: ${totCredit})`);
      return;
    }

    onAddEntry({
      ...suggestedEntry,
      status: 'validated'
    });

    setSuccessMessage(`Écriture ${suggestedEntry.reference} enregistrée avec succès dans le journal ${suggestedEntry.journal} !`);
    setSuggestedEntry(null);
  };

  // Simulation d'une facture marocaine pré-chargée pour démo OCR
  const handleLoadDemoInvoice = (type: 'electricite' | 'marchandise' | 'honoraire') => {
    setIsScanningInvoice(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    setTimeout(() => {
      let entry: AccountingEntry;
      if (type === 'electricite') {
        entry = {
          id: `entry_${Date.now()}`,
          companyId: company.id,
          date: '2026-02-04',
          reference: 'FACT-LYDEC-28491',
          journal: 'ACHATS',
          label: 'Facture électricité et eau Lydec siège social (TVA 14%)',
          vatRate: 14,
          vatAmount: 700,
          status: 'draft',
          source: 'invoice_scan',
          lines: [
            { accountCode: '61251', accountLabel: 'Achats fournitures non stockables (Eau, Électricité)', debit: 5000, credit: 0 },
            { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges (14%)', debit: 700, credit: 0 },
            { accountCode: '4411', accountLabel: 'Fournisseurs (Lydec Casablanca)', debit: 0, credit: 5700 }
          ]
        };
        setAiExplanation("OCR Réussi : Facture Lydec n° 28491 détectée. Taux de TVA réduit de 14% appliqué automatiquement selon le code fiscal marocain.");
      } else if (type === 'marchandise') {
        entry = {
          id: `entry_${Date.now()}`,
          companyId: company.id,
          date: '2026-02-06',
          reference: 'FAC-ATLAS-8910',
          journal: 'ACHATS',
          label: 'Achat de marchandises pièces détachées Atlas Négoce (TVA 20%)',
          vatRate: 20,
          vatAmount: 18000,
          status: 'draft',
          source: 'invoice_scan',
          lines: [
            { accountCode: '6111', accountLabel: 'Achats de marchandises', debit: 90000, credit: 0 },
            { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges (20%)', debit: 18000, credit: 0 },
            { accountCode: '4411', accountLabel: 'Fournisseurs (Atlas Négoce SARL)', debit: 0, credit: 108000 }
          ]
        };
        setAiExplanation("OCR Réussi : Facture Atlas Négoce n° 8910 analysée. ICE : 001928471000034 détecté. TVA standard 20% appliquée.");
      } else {
        entry = {
          id: `entry_${Date.now()}`,
          companyId: company.id,
          date: '2026-02-08',
          reference: 'NOT-HON-402',
          journal: 'ACHATS',
          label: 'Note d’honoraires conseil juridique et fiscal Maître Bennani (TVA 10%)',
          vatRate: 10,
          vatAmount: 1500,
          status: 'draft',
          source: 'invoice_scan',
          lines: [
            { accountCode: '61365', accountLabel: 'Honoraires (avocat, expert)', debit: 15000, credit: 0 },
            { accountCode: '34552', accountLabel: 'État - TVA récupérable sur charges (10%)', debit: 1500, credit: 0 },
            { accountCode: '4411', accountLabel: 'Fournisseurs (Cabinet Bennani)', debit: 0, credit: 16500 }
          ]
        };
        setAiExplanation("OCR Réussi : Note d’honoraires cabinet d'avocats. Taux de TVA réduit de 10% appliqué selon l'art. 99 du CGI marocain.");
      }

      setSuggestedEntry(entry);
      setIsScanningInvoice(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Saisie en une phrase & Intelligence Artificielle</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Modèle Gemini 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Écrivez votre opération en français libre : l'IA génère l'écriture équilibrée selon le Plan Comptable Général Marocain (PCM).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>TVA marocaine auto-détectée : 20%, 14%, 10%, 7%</span>
          </div>
        </div>

        {/* Zone de saisie principale */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParsePrompt()}
              placeholder="Ex : Achat de marchandises 120 000 HT fournisseur Atlas..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-32 shadow-inner"
            />
            <button
              onClick={() => handleParsePrompt()}
              disabled={isProcessing}
              className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <span>Générer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Exemples rapides à cliquer */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-slate-400">Exemples rapides :</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptText(p);
                  handleParsePrompt(p);
                }}
                className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-[11px] px-2.5 py-1 rounded-md transition cursor-pointer border border-slate-700/60"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Module OCR / Analyse de facture scannée */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/80 border border-blue-800/60 rounded-xl text-blue-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Analyse de Facture Scannée & Reçus (Vision IA)</h3>
              <p className="text-xs text-slate-400">
                Extraction automatique du tiers, ICE, montants HT, TVA et TTC avec génération de l'imputation comptable
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleLoadDemoInvoice('marchandise')}
            disabled={isScanningInvoice}
            className="flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-700 rounded-xl text-left transition cursor-pointer group"
          >
            <Receipt className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-semibold text-white">Scanner Facture Marchandises</div>
              <div className="text-[10px] text-slate-400">Fournisseur Atlas Négoce (TVA 20%)</div>
            </div>
          </button>

          <button
            onClick={() => handleLoadDemoInvoice('electricite')}
            disabled={isScanningInvoice}
            className="flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-700 rounded-xl text-left transition cursor-pointer group"
          >
            <Receipt className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-semibold text-white">Scanner Facture Lydec / ONEE</div>
              <div className="text-[10px] text-slate-400">Électricité & Eau (TVA 14%)</div>
            </div>
          </button>

          <button
            onClick={() => handleLoadDemoInvoice('honoraire')}
            disabled={isScanningInvoice}
            className="flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-700 rounded-xl text-left transition cursor-pointer group"
          >
            <Receipt className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-semibold text-white">Scanner Honoraires Avocat / Fiduciaire</div>
              <div className="text-[10px] text-slate-400">Conseil juridique (TVA 10%)</div>
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Prévisualisation de l'écriture proposée */}
      {suggestedEntry && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Journal : {suggestedEntry.journal}
                </span>
                <span className="text-xs font-mono text-slate-400">Réf : {suggestedEntry.reference}</span>
                <span className="text-xs text-slate-400">• Date : {suggestedEntry.date}</span>
              </div>
              <h3 className="text-base font-bold text-white">{suggestedEntry.label}</h3>
              {suggestedEntry.vatRate !== undefined && (
                <div className="text-xs text-slate-400 mt-1">
                  Taux de TVA : <span className="text-emerald-400 font-semibold">{suggestedEntry.vatRate}%</span>
                  {suggestedEntry.vatAmount ? ` (Montant TVA : ${suggestedEntry.vatAmount.toLocaleString('fr-FR')} MAD)` : ''}
                </div>
              )}
            </div>

            <button
              onClick={handleValidateAndSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg cursor-pointer self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider & Inscrire au Journal</span>
            </button>
          </div>

          {/* Explication IA */}
          {aiExplanation && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{aiExplanation}</span>
            </div>
          )}

          {/* Tableau des lignes d'écriture */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Compte PCM</th>
                  <th className="py-2.5 px-3">Intitulé du compte</th>
                  <th className="py-2.5 px-3 text-right">Débit (MAD)</th>
                  <th className="py-2.5 px-3 text-right">Crédit (MAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {suggestedEntry.lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3 font-bold text-emerald-400">{line.accountCode}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-200">{line.accountLabel}</td>
                    <td className="py-2.5 px-3 text-right text-slate-100 font-semibold">
                      {line.debit > 0 ? line.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-100 font-semibold">
                      {line.credit > 0 ? line.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950/90 font-bold border-t border-slate-700 text-xs font-mono">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 text-right font-sans text-slate-300">
                    TOTAUX ÉCRITURE :
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {suggestedEntry.lines.reduce((s, l) => s + l.debit, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {suggestedEntry.lines.reduce((s, l) => s + l.credit, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
