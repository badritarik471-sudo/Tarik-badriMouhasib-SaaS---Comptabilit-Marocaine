/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mouhasib SaaS - Application Complète de Comptabilité Marocaine
 * Conforme au Plan Comptable Marocain (PCM) & Code Général de Normalisation Comptable (CGNC)
 */

import React, { useState, useEffect } from 'react';
import { Company, AccountingEntry, PayrollRecord } from './types/accounting';
import { SAMPLE_COMPANY, SAMPLE_ENTRIES } from './data/sampleEntries';
import { computeCPC, computeBilan, computeVatSummary } from './utils/accountingEngine';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { SmartEntryTab } from './components/SmartEntryTab';
import { JournalTab } from './components/JournalTab';
import { GrandLivreBalanceTab } from './components/GrandLivreBalanceTab';
import { FinancialStatementsTab } from './components/FinancialStatementsTab';
import { VatTab } from './components/VatTab';
import { FinancingEticTab } from './components/FinancingEticTab';
import { PayrollTab } from './components/PayrollTab';
import { BankReconciliationTab } from './components/BankReconciliationTab';
import { PcmDirectoryTab } from './components/PcmDirectoryTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { AudioBriefingModal } from './components/AudioBriefingModal';
import { CommandPalette } from './components/CommandPalette';
import { NewEntryModal } from './components/NewEntryModal';
import { subscribeToAuth, testFirestoreConnection } from './services/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [company, setCompany] = useState<Company>(() => {
    const saved = localStorage.getItem('mouhasib_company');
    return saved ? JSON.parse(saved) : SAMPLE_COMPANY;
  });

  const [entries, setEntries] = useState<AccountingEntry[]>(() => {
    const saved = localStorage.getItem('mouhasib_entries');
    return saved ? JSON.parse(saved) : SAMPLE_ENTRIES;
  });

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('mouhasib_payrolls');
    return saved ? JSON.parse(saved) : [];
  });

  const [fiscalYear, setFiscalYear] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  // Modales
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  // Sauvegarde locale automatique
  useEffect(() => {
    localStorage.setItem('mouhasib_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('mouhasib_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('mouhasib_payrolls', JSON.stringify(payrolls));
  }, [payrolls]);

  // Initialisation Auth Firebase et test connexion Firestore
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = subscribeToAuth(
      (currentUser) => setUser(currentUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Raccourcis clavier (Cmd+K pour palette de commandes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calcul des métriques financières en temps réel
  const cpc = computeCPC(entries);
  const bilan = computeBilan(entries);
  const vatSummary = computeVatSummary(entries);

  const metrics = {
    ca: cpc.totalProduitsExploitation,
    charges: cpc.totalChargesExploitation,
    resultatNet: cpc.resultatNet,
    tresorerie: bilan.actif.tresorerie.totalNet,
    vatDue: vatSummary.vatDue,
    currentCredit: vatSummary.currentCredit,
  };

  // Actions
  const handleLoadSample = () => {
    setCompany(SAMPLE_COMPANY);
    setEntries(SAMPLE_ENTRIES);
  };

  const handleAddEntry = (entry: AccountingEntry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddPayroll = (record: PayrollRecord) => {
    setPayrolls((prev) => [...prev, record]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Barre de navigation et titre Desktop SaaS */}
      <Navbar
        currentCompany={company}
        onCompanyChange={setCompany}
        fiscalYear={fiscalYear}
        onFiscalYearChange={setFiscalYear}
        onLoadSample={handleLoadSample}
        onOpenAudioBriefing={() => setIsAudioOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        user={user}
        onRefreshData={() => {}}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenu principal selon l'onglet actif */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            company={company}
            entries={entries}
            metrics={metrics}
            onNavigateTab={setActiveTab}
            onOpenAudioBriefing={() => setIsAudioOpen(true)}
            onScheduleCalendar={() => setActiveTab('workspace')}
          />
        )}

        {activeTab === 'smart-entry' && (
          <SmartEntryTab company={company} onAddEntry={handleAddEntry} />
        )}

        {activeTab === 'journal' && (
          <JournalTab
            entries={entries}
            company={company}
            onDeleteEntry={handleDeleteEntry}
            onExportGoogleSheets={() => setActiveTab('workspace')}
            onOpenNewManualModal={() => setIsNewEntryOpen(true)}
          />
        )}

        {activeTab === 'grand-livre' && (
          <GrandLivreBalanceTab entries={entries} company={company} />
        )}

        {activeTab === 'etats-financiers' && (
          <FinancialStatementsTab entries={entries} company={company} />
        )}

        {activeTab === 'tva' && (
          <VatTab entries={entries} company={company} onAddEntry={handleAddEntry} />
        )}

        {activeTab === 'etic' && (
          <FinancingEticTab company={company} entries={entries} />
        )}

        {activeTab === 'paie' && (
          <PayrollTab
            company={company}
            payrolls={payrolls}
            onAddPayroll={handleAddPayroll}
            onAddEntry={handleAddEntry}
          />
        )}

        {activeTab === 'banque' && (
          <BankReconciliationTab company={company} entries={entries} />
        )}

        {activeTab === 'pcm' && <PcmDirectoryTab />}

        {activeTab === 'workspace' && (
          <WorkspaceTab company={company} entries={entries} metrics={metrics} />
        )}
      </main>

      {/* Modale Audio Briefing TTS (Gemini 3.8 Flash TTS) */}
      <AudioBriefingModal
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        company={company}
        metrics={metrics}
      />

      {/* Palette de commandes (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* Saisie Manuelle d'une écriture */}
      <NewEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        company={company}
        onAddEntry={handleAddEntry}
      />
    </div>
  );
}
