import React, { useState } from 'react';
import { Lock, Star, Play, CheckCircle, Flame, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { DifficultyLevel, PhaseConfig, TeacherReportData } from '../types';
import { PHASES } from '../data/phases';
import { soundManager } from '../utils/audio';

interface WorldMapProps {
  reportData: TeacherReportData;
  onSelectLevel: (phase: PhaseConfig, level: DifficultyLevel, isBoss?: boolean) => void;
  highContrast: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({ reportData, onSelectLevel, highContrast }) => {
  const [selectedPhase, setSelectedPhase] = useState<PhaseConfig | null>(null);

  const isUnlocked = (phaseId: number) => {
    return reportData.unlockedPhases.includes(phaseId) || phaseId === 1;
  };

  const getPhaseStars = (phaseId: number) => {
    return reportData.phaseStars[phaseId] || 0;
  };

  const isCompleted = (phaseId: number) => {
    return getPhaseStars(phaseId) > 0;
  };

  const handlePhaseClick = (phase: PhaseConfig) => {
    if (!isUnlocked(phase.id)) {
      soundManager.playWrong();
      return;
    }
    soundManager.playClick();
    setSelectedPhase(phase);
  };

  return (
    <div
      id="world-map-container"
      className={`min-h-[calc(100vh-68px)] p-4 md:p-8 flex flex-col items-center relative overflow-hidden ${
        highContrast ? 'bg-zinc-950 text-white' : 'bg-gradient-to-b from-sky-100 via-indigo-50 to-emerald-50 text-slate-900'
      }`}
    >
      {/* Decorative background clouds / elements */}
      <div className="absolute top-6 left-8 text-5xl opacity-40 select-none animate-pulse">☁️</div>
      <div className="absolute top-16 right-12 text-6xl opacity-30 select-none animate-pulse">☁️</div>
      <div className="absolute bottom-10 left-10 text-4xl opacity-50 select-none">🌲</div>
      <div className="absolute bottom-12 right-16 text-4xl opacity-50 select-none">🌳</div>

      {/* Main Map Header */}
      <div className="text-center max-w-2xl mb-8 z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-100/90 border border-indigo-200 text-indigo-900 px-4 py-1.5 rounded-full font-black text-xs md:text-sm mb-3 shadow-sm">
          <span>🗺️ MAPA DA AVENTURA MATEMÁTICA</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
          Escolha uma Fase para Explorar!
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-medium">
          Resolva situações-problema, descubra a operação correta e conquiste todas as medalhas e estrelas!
        </p>
      </div>

      {/* Grid of Worlds / Phases */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
        {PHASES.map((phase, idx) => {
          const unlocked = isUnlocked(phase.id);
          const completed = isCompleted(phase.id);
          const stars = getPhaseStars(phase.id);
          const isBossPhase = phase.bossFight;

          return (
            <div
              key={phase.id}
              id={`phase-card-${phase.id}`}
              onClick={() => handlePhaseClick(phase)}
              className={`group relative rounded-3xl p-5 md:p-6 transition-all duration-300 transform cursor-pointer border-4 flex flex-col justify-between ${
                unlocked
                  ? completed
                    ? 'bg-white border-emerald-400 shadow-xl hover:-translate-y-2 hover:shadow-2xl'
                    : 'bg-white border-amber-400 shadow-lg hover:-translate-y-2 hover:shadow-xl'
                  : 'bg-slate-100 border-slate-300 opacity-75 cursor-not-allowed'
              } ${highContrast ? '!bg-zinc-900 !border-yellow-400 !text-white' : ''}`}
            >
              {/* Badge Status Pill */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    unlocked
                      ? completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {unlocked ? (
                    completed ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Concluída
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Em Andamento
                      </>
                    )
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Bloqueada
                    </>
                  )}
                </span>

                {/* Stars Rating */}
                {unlocked && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-4 h-4 md:w-5 md:h-5 ${
                          starNum <= stars
                            ? 'text-amber-400 fill-amber-400 drop-shadow'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* World Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-inner shrink-0 ${
                    unlocked ? `bg-gradient-to-br ${phase.bgGradient} text-white` : 'bg-slate-300 text-slate-500'
                  }`}
                >
                  {phase.icon}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                    Fase {phase.id}
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
                    {phase.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{phase.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-600 mb-4 line-clamp-2">
                {phase.description}
              </p>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {unlocked ? (
                  <button
                    id={`enter-phase-btn-${phase.id}`}
                    className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                      isBossPhase
                        ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-700 hover:to-rose-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isBossPhase ? (
                      <>
                        <ShieldAlert className="w-4 h-4" /> Desafio do Templo
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" /> Jogar Níveis
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Conclua a fase anterior para desbloquear
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Selection Modal */}
      {selectedPhase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border-4 border-indigo-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{selectedPhase.icon}</div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Fase {selectedPhase.id}
              </span>
              <h2 className="text-2xl font-black text-slate-800">{selectedPhase.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedPhase.description}</p>
            </div>

            <div className="space-y-3 mb-6">
              {/* Level 1 */}
              <button
                id="btn-level-1"
                onClick={() => {
                  soundManager.playClick();
                  onSelectLevel(selectedPhase, 1);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-lg shadow">
                    🟢
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 group-hover:text-emerald-800">
                      Nível 1 — Explorador
                    </h4>
                    <p className="text-xs text-slate-600">Problemas simples com números menores e enunciados curtos.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Level 2 */}
              <button
                id="btn-level-2"
                onClick={() => {
                  soundManager.playClick();
                  onSelectLevel(selectedPhase, 2);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-lg shadow">
                    🟡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 group-hover:text-amber-800">
                      Nível 2 — Aventureiro
                    </h4>
                    <p className="text-xs text-slate-600">Números maiores e enunciados que exigem mais atenção.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Level 3 */}
              <button
                id="btn-level-3"
                onClick={() => {
                  soundManager.playClick();
                  onSelectLevel(selectedPhase, 3);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white font-black flex items-center justify-center text-lg shadow">
                    🔴
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 group-hover:text-rose-800">
                      Nível 3 — Mestre Matemático
                    </h4>
                    <p className="text-xs text-slate-600">Desafio avançado de interpretação, dados e cálculo.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Boss Fight Option for Phase 5 */}
              {selectedPhase.bossFight && (
                <button
                  id="btn-boss-battle"
                  onClick={() => {
                    soundManager.playClick();
                    onSelectLevel(selectedPhase, 3, true);
                  }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-purple-500 bg-gradient-to-r from-purple-900 to-indigo-900 text-white hover:from-purple-800 hover:to-indigo-800 transition-all flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xl shadow animate-bounce">
                      👾
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-300 flex items-center gap-1.5">
                        Batalha Final: Monstro da Confusão! <Flame className="w-4 h-4 text-red-400" />
                      </h4>
                      <p className="text-xs text-purple-200">
                        Use todas as 4 operações para salvar o Reino da Matemática!
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            <button
              id="btn-close-level-modal"
              onClick={() => setSelectedPhase(null)}
              className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-2xl transition-colors"
            >
              Voltar ao Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
