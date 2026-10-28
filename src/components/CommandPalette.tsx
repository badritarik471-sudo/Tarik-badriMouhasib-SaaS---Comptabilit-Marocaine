/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Palette de commandes rapide (Cmd+K / Ctrl+K)
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, BookOpen, FileText, Scale, Users, Landmark, Receipt } from 'lucide-react';
import { PLAN_COMPTABLE_MAROCAIN } from '../data/planComptableMarocain';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onSelectAccountCode?: (code: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectAccountCode
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'excel-import', label: 'Importer un fichier Excel (.xls / .xlsx / .csv)', icon: FileText },
    { id: 'business-plan', label: 'Business Plan Prévisionnel & Dossier Bancaire (3 ans)', icon: Landmark },
    { id: 'smart-entry', label: 'Saisie intelligente par IA (une phrase)', icon: Sparkles },
    { id: 'journal', label: 'Consulter le Journal Général', icon: FileText },
    { id: 'grand-livre', label: 'Consulter la Balance et Grand Livre', icon: Scale },
    { id: 'etats-financiers', label: 'Voir le CPC, ESG et Bilan marocain', icon: Landmark },
    { id: 'tva', label: 'Déclaration de TVA (SIMPL-TVA DGI)', icon: Receipt },
    { id: 'paie', label: 'Calculer un bulletin de paie marocaine', icon: Users },
    { id: 'pcm', label: 'Consulter le Plan Comptable Marocain (PCM)', icon: BookOpen },
  ];

  const filteredAccounts = query.trim()
    ? PLAN_COMPTABLE_MAROCAIN.filter(
        a => a.code.startsWith(query.trim()) || a.label.toLowerCase().includes(query.toLowerCase().trim())
      ).slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Champ de recherche */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Taper un numéro de compte (ex: 6111) ou une commande..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Résultats */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3">
          {/* Comptes trouvés */}
          {filteredAccounts.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Comptes PCM correspondants
              </div>
              <div className="space-y-1">
                {filteredAccounts.map(acc => (
                  <div
                    key={acc.code}
                    onClick={() => {
                      onNavigateTab('pcm');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{acc.code}</span>
                      <span className="text-slate-200">{acc.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{acc.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Raccourcis & Navigation
            </div>
            <div className="space-y-1">
              {quickActions.map(act => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      onNavigateTab(act.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer text-xs text-slate-200"
                  >
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{act.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Navigation : Flèches haut/bas • Sélection : Entrée</span>
          <span>Fermer : Échap</span>
        </div>
      </div>
    </div>
  );
};
