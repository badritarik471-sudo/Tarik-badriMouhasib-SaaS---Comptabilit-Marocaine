/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Intégrations Google Workspace : Sheets, Calendar, Slides, Contacts
 * avec dialogue de confirmation utilisateur explicite.
 */

import React, { useState } from 'react';
import { Company, AccountingEntry } from '../types/accounting';
import {
  exportJournalToGoogleSheets,
  scheduleMoroccanFiscalDeadlines,
  createExecutiveSlideDeck,
  syncContactToGoogle,
} from '../services/workspace';
import { getCachedToken, loginWithGoogle } from '../services/firebase';
import {
  FileSpreadsheet,
  Calendar,
  Presentation,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface WorkspaceTabProps {
  company: Company;
  entries: AccountingEntry[];
  metrics: {
    ca: number;
    charges: number;
    resultatNet: number;
    tresorerie: number;
  };
}

export const WorkspaceTab: React.FC<WorkspaceTabProps> = ({ company, entries, metrics }) => {
  const [activeModal, setActiveModal] = useState<'sheets' | 'calendar' | 'slides' | 'contacts' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pour ajout de contact
  const [contactName, setContactName] = useState('Atlas Négoce SARL');
  const [contactEmail, setContactEmail] = useState('contact@atlas-negoce.ma');
  const [contactPhone, setContactPhone] = useState('+212 522 90 40 50');

  const token = getCachedToken();

  const handleExecuteSheets = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setResultMessage(null);
      setResultUrl(null);

      const res = await exportJournalToGoogleSheets(company, entries);
      setResultMessage(`Journal exporté avec succès dans Google Sheets (${entries.length} écritures) !`);
      setResultUrl(res.spreadsheetUrl);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Échec de l'export Google Sheets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCalendar = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setResultMessage(null);

      const count = await scheduleMoroccanFiscalDeadlines(company);
      setResultMessage(`${count} échéances fiscales marocaines (TVA du 20, Acomptes IS, Liasse Fiscale) ajoutées à votre Google Calendar !`);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Échec de la synchronisation Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSlides = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setResultMessage(null);
      setResultUrl(null);

      const res = await createExecutiveSlideDeck(company, metrics);
      setResultMessage(`Présentation financière créée avec succès dans Google Slides !`);
      setResultUrl(res.presentationUrl);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Échec de création Google Slides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteContact = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setResultMessage(null);

      await syncContactToGoogle({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        companyName: company.name,
        jobTitle: 'Fournisseur Agréé Maroc'
      });
      setResultMessage(`Le contact ${contactName} a été synchronisé avec succès dans votre Google Contacts !`);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Échec de l'ajout dans Google Contacts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête Google Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-950/80 border border-blue-800/60 rounded-xl text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Intégrations Google Workspace Officielles</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Sheets • Calendar • Slides • Contacts
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronisation directe et sécurisée avec votre espace de travail Google Cloud
            </p>
          </div>
        </div>

        {!token && (
          <button
            onClick={() => loginWithGoogle()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <span>Connexion Google requise pour synchroniser</span>
          </button>
        )}
      </div>

      {/* Messages de résultat */}
      {resultMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMessage}</span>
          </div>
          {resultUrl && (
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <span>Ouvrir dans Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Les 4 cartes de services Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Google Sheets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Sheets</h3>
                <p className="text-xs text-slate-400">Export du journal et grand livre</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Crée une nouvelle feuille de calcul dans votre Google Drive contenant toutes les écritures du journal de {company.name}, avec en-têtes fiscaux et totaux équilibrés.
            </p>
          </div>

          <button
            onClick={() => setActiveModal('sheets')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter vers Google Sheets</span>
          </button>
        </div>

        {/* 2. Google Calendar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-950/80 border border-blue-800/60 rounded-xl text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Calendar</h3>
                <p className="text-xs text-slate-400">Calendrier fiscal marocain</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Planifie automatiquement les 5 échéances fiscales clés dans votre agenda Google : télédéclarations SIMPL-TVA au 20 de chaque mois, calendrier des 4 acomptes IS, et dépôt de la liasse fiscale au 31 Mars.
            </p>
          </div>

          <button
            onClick={() => setActiveModal('calendar')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <Calendar className="w-4 h-4" />
            <span>Synchroniser le Calendrier Fiscal</span>
          </button>
        </div>

        {/* 3. Google Slides */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl text-amber-400">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Slides</h3>
                <p className="text-xs text-slate-400">Présentation Assemblée Générale (AGO)</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Génère une présentation professionnelle de synthèse financière pour les associés et actionnaires de {company.name} : Bilan, Chiffre d'Affaires, EBE et Trésorerie.
            </p>
          </div>

          <button
            onClick={() => setActiveModal('slides')}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <Presentation className="w-4 h-4" />
            <span>Créer le Diaporama Financier</span>
          </button>
        </div>

        {/* 4. Google Contacts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-950/80 border border-sky-800/60 rounded-xl text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Contacts</h3>
                <p className="text-xs text-slate-400">Répertoire Tiers Clients & Fournisseurs</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synchronise les coordonnées de vos tiers partenaires (clients, fournisseurs, fiduciaires) directement dans votre carnet d'adresses Google Contacts.
            </p>
          </div>

          <button
            onClick={() => setActiveModal('contacts')}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <Users className="w-4 h-4" />
            <span>Ajouter / Synchroniser un Tiers</span>
          </button>
        </div>
      </div>

      {/* MODALE DE CONFIRMATION OBLIGATOIRE (MANDATORY CONFIRMATION DIALOG) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Confirmation d'action Google Workspace</span>
            </h3>

            {activeModal === 'sheets' && (
              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Êtes-vous sûr de vouloir créer une nouvelle feuille de calcul dans votre <strong>Google Sheets</strong> pour la société <strong>{company.name}</strong> ?
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                  • Nombre d'écritures : {entries.length} lignes
                  <br />• Exercice : {company.fiscalYear}
                </div>
              </div>
            )}

            {activeModal === 'calendar' && (
              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Confirmez-vous l'ajout de <strong>5 événements d'échéances fiscales marocaines</strong> dans votre <strong>Google Calendar</strong> principal ?
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                  • 20 du mois : Télédéclaration SIMPL-TVA
                  <br />• 31 Mars : Liasse fiscale & 1er acompte IS
                  <br />• 30 Juin, 30 Sept, 31 Déc : 2e, 3e, 4e acomptes IS
                </div>
              </div>
            )}

            {activeModal === 'slides' && (
              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Souhaitez-vous générer un nouveau diaporama <strong>Google Slides</strong> pour la présentation de l'Assemblée Générale Ordinaire (AGO) de <strong>{company.name}</strong> ?
                </p>
              </div>
            )}

            {activeModal === 'contacts' && (
              <div className="text-xs text-slate-300 space-y-3">
                <p>Renseignez les coordonnées du tiers à inscrire dans votre <strong>Google Contacts</strong> :</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nom du tiers ou société..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email professionnel..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Téléphone..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  if (activeModal === 'sheets') handleExecuteSheets();
                  else if (activeModal === 'calendar') handleExecuteCalendar();
                  else if (activeModal === 'slides') handleExecuteSlides();
                  else if (activeModal === 'contacts') handleExecuteContact();
                }}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer flex items-center gap-2 shadow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synchronisation...</span>
                  </>
                ) : (
                  <span>Confirmer l'opération</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
