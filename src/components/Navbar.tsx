/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Company } from '../types/accounting';
import { loginWithGoogle, logoutUser } from '../services/firebase';
import { User } from 'firebase/auth';
import {
  Building2,
  Calendar,
  Sparkles,
  Volume2,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Laptop,
  Layers,
  ChevronDown,
  LogOut,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentCompany: Company;
  onCompanyChange: (company: Company) => void;
  fiscalYear: string;
  onFiscalYearChange: (year: string) => void;
  onLoadSample: () => void;
  onOpenAudioBriefing: () => void;
  onOpenCommandPalette: () => void;
  user: User | null;
  onRefreshData: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCompany,
  onCompanyChange,
  fiscalYear,
  onFiscalYearChange,
  onLoadSample,
  onOpenAudioBriefing,
  onOpenCommandPalette,
  user,
  onRefreshData,
  activeTab,
  onTabChange
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord & 3D' },
    { id: 'smart-entry', label: 'Saisie IA & Scan' },
    { id: 'journal', label: 'Journal' },
    { id: 'grand-livre', label: 'Grand Livre & Balance' },
    { id: 'etats-financiers', label: 'CPC • ESG • Bilan' },
    { id: 'tva', label: 'TVA Maroc' },
    { id: 'etic', label: 'Financement & ETIC' },
    { id: 'paie', label: 'Paie Marocaine' },
    { id: 'banque', label: 'Banque & Lettrage' },
    { id: 'pcm', label: 'Plan Comptable (PCM)' },
    { id: 'workspace', label: 'Google Workspace' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none">
      {/* Barre supérieure style application Desktop SaaS (Linux, Windows, macOS) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 text-xs text-slate-400">
        {/* Contrôles de fenêtre macOS / Linux */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block hover:opacity-100 transition" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-100 transition" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-100 transition" />
          </div>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">MOUHASIB SAAS</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[10px]">
              PCM 2026 • CGNC MAROC
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
              <Laptop className="w-3 h-3 text-slate-400" />
              Desktop Multiplateforme (Linux • Windows • macOS)
            </span>
          </div>
        </div>

        {/* Outils rapides et actions */}
        <div className="flex items-center gap-2">
          {/* Bouton Charger un exemple (mis en avant selon la demande de l'utilisateur) */}
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-3 py-1 rounded text-xs transition shadow-sm cursor-pointer"
            title="Charge le jeu d'écritures réelles de démonstration (achats, ventes, salaires, TVA, loyer, amortissements)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Charger un exemple</span>
          </button>

          {/* Synthèse audio Gemini TTS */}
          <button
            onClick={onOpenAudioBriefing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition cursor-pointer border border-slate-700"
            title="Écouter le point d'étape audio via gemini-3.8-flash-tts"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Briefing Audio IA</span>
          </button>

          {/* Palette de commande Cmd+K */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs transition cursor-pointer border border-slate-700"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Rechercher</span>
            <kbd className="bg-slate-900 px-1 py-0.2 rounded text-[10px] text-slate-400 border border-slate-700 font-mono">⌘K</kbd>
          </button>

          {/* Connexion Google / Statut Auth */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-200 text-xs truncate max-w-[120px]">{user.displayName || user.email}</span>
              <button
                onClick={() => logoutUser()}
                title="Déconnexion"
                className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition border border-slate-700 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isLoggingIn ? 'Connexion...' : 'Compte Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Barre principale Société, Exercice et Navigation par onglets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 py-2.5 gap-3">
        {/* Sélecteur de Société et Exercice */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 cursor-pointer">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white tracking-wide">{currentCompany.name}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>ICE: {currentCompany.ice}</span>
                <span>•</span>
                <span>IF: {currentCompany.if}</span>
                <span>•</span>
                <span>{currentCompany.city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Exercice :</span>
            <select
              value={fiscalYear}
              onChange={(e) => onFiscalYearChange(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold font-mono focus:outline-none cursor-pointer"
            >
              <option value="2026" className="bg-slate-900 text-white">2026 (En cours)</option>
              <option value="2025" className="bg-slate-900 text-white">2025</option>
              <option value="2024" className="bg-slate-900 text-white">2024</option>
            </select>
          </div>
        </div>

        {/* Barre d'onglets de navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
