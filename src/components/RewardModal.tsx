import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { particleEngine } from '../utils/particleSystem';

interface RewardModalProps {
  phaseName: string;
  levelNum: number;
  starsEarned: number; // 1, 2, or 3
  scoreEarned: number;
  newBadgeTitle?: string;
  isGrandMaster?: boolean;
  onNextLevel: () => void;
  onGoToMap: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  phaseName,
  levelNum,
  starsEarned,
  scoreEarned,
  newBadgeTitle,
  isGrandMaster,
  onNextLevel,
  onGoToMap,
}) => {
  useEffect(() => {
    soundManager.playLevelPass();
    particleEngine.burstLevelVictory();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.4 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 animate-in zoom-in-95 duration-200">
        {/* Animated Chest / Trophy */}
        <div className="relative inline-block mb-3">
          <div className="text-6xl sm:text-7xl animate-bounce">
            {isGrandMaster ? '👑' : '🎁'}
          </div>
          <div className="absolute -bottom-2 -right-2 text-2xl">✨</div>
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
          {isGrandMaster ? 'VITÓRIA SUPREMA!' : 'NÍVEL CONCLUÍDO COM SUCESSO!'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 mb-1">
          {isGrandMaster ? '🏆 MESTRE DAS QUATRO OPERAÇÕES!' : `Parabéns, Campeão(ã)!`}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Você desvendou todos os desafios de {phaseName} (Nível {levelNum})!
        </p>

        {/* Stars Celebration */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transform transition-all duration-500 ${
                starIdx <= starsEarned ? 'scale-110' : 'scale-90 opacity-40'
              }`}
            >
              <Star
                className={`w-10 h-10 sm:w-12 sm:h-12 ${
                  starIdx <= starsEarned
                    ? 'text-amber-400 fill-amber-400 drop-shadow-lg'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Unlocked Badge Alert (if any) */}
        {newBadgeTitle && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl mb-4 flex items-center justify-center gap-2 text-amber-900 font-black text-sm">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span>Nova Conquista: {newBadgeTitle}!</span>
          </div>
        )}

        {/* Score Recap Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 flex items-center justify-around">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Pontuação do Nível</div>
            <div className="text-2xl font-black text-indigo-700">+{scoreEarned} pts</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Desempenho</div>
            <div className="text-2xl font-black text-emerald-600">
              {starsEarned === 3 ? '⭐⭐⭐ Excelente!' : starsEarned === 2 ? '⭐⭐ Muito Bom!' : '⭐ Concluído!'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="btn-reward-map"
            onClick={() => {
              soundManager.playClick();
              onGoToMap();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Voltar ao Mapa</span>
          </button>

          <button
            id="btn-reward-next"
            onClick={() => {
              soundManager.playClick();
              onNextLevel();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Continuar Aventura</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
