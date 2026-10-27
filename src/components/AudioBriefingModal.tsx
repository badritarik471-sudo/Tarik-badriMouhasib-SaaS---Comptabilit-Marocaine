/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Synthèse vocale TTS pour l'audit comptable et fiscal avec le modèle gemini-3.8-flash-tts
 */

import React, { useState } from 'react';
import { Volume2, Play, Square, Loader2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Company } from '../types/accounting';

interface AudioBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  metrics: {
    ca: number;
    charges: number;
    resultatNet: number;
    tresorerie: number;
    vatDue: number;
    currentCredit: number;
  };
}

export const AudioBriefingModal: React.FC<AudioBriefingModalProps> = ({
  isOpen,
  onClose,
  company,
  metrics,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [speakerVoice, setSpeakerVoice] = useState<'Kore' | 'Puck' | 'Zephyr' | 'Fenrir'>('Kore');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const briefingText = `
Bonjour. Voici le point de situation comptable et fiscale de la société ${company.name} pour l'exercice ${company.fiscalYear}.
Le chiffre d'affaires cumulé s'élève à ${metrics.ca.toLocaleString('fr-FR')} dirhams.
Le total des charges d'exploitation enregistrées atteint ${metrics.charges.toLocaleString('fr-FR')} dirhams.
Votre résultat net provisoire ressort ainsi avec un solde bénéficiaire de ${metrics.resultatNet.toLocaleString('fr-FR')} dirhams.
Au niveau de votre trésorerie bancaire disponible, vos comptes affichent un total de ${metrics.tresorerie.toLocaleString('fr-FR')} dirhams.
Concernant la TVA marocaine : ${
    metrics.vatDue > 0
      ? `vous avez une TVA due nette de ${metrics.vatDue.toLocaleString('fr-FR')} dirhams à télédéclarer avant le 20 du mois prochain.`
      : `vous bénéficiez d'un crédit de TVA reportable de ${metrics.currentCredit.toLocaleString('fr-FR')} dirhams.`
  }
Tous les comptes sont conformes aux dispositions du Plan Comptable Général Marocain.
`.trim();

  const handleGenerateAndPlay = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }

      const res = await fetch('/api/accounting/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: briefingText,
          speaker: speakerVoice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur de génération vocale');
      }

      const blobUrl = `data:audio/wav;base64,${data.audioBase64}`;
      setAudioUrl(blobUrl);

      const audio = new Audio(blobUrl);
      setAudioElement(audio);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setErrorMessage("Erreur lors de la lecture audio");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Impossible de joindre le service vocal Gemini TTS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={() => {
            handleStop();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Point de Situation Audio (TTS)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                gemini-3.8-flash-tts
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synthèse vocale IA de votre audit financier et fiscal selon le CGNC marocain
            </p>
          </div>
        </div>

        {/* Sélection de la voix */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Voix de l'expert-comptable :</span>
          <div className="flex gap-2">
            {(['Kore', 'Puck', 'Zephyr', 'Fenrir'] as const).map((voice) => (
              <button
                key={voice}
                onClick={() => setSpeakerVoice(voice)}
                className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  speakerVoice === voice
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {voice}
              </button>
            ))}
          </div>
        </div>

        {/* Transcription texte */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto mb-4 font-sans">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Texte de la synthèse :
          </div>
          {briefingText}
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Actions de lecture */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {isPlaying ? 'Lecture en cours...' : audioUrl ? 'Prêt à écouter' : 'Cliquez pour écouter'}
          </span>
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Arrêter</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateAndPlay}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération audio...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{audioUrl ? 'Réécouter le briefing' : 'Générer & Écouter'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
