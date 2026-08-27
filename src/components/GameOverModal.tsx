import React from 'react';
import { RotateCcw, MapPin, Heart, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  onRetry: () => void;
  onGoToMap: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onGoToMap }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-rose-300 animate-in zoom-in-95 duration-200">
        {/* Encouraging Icon */}
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
          💪
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          Corações Esgotados
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 mb-2">
          NÃO DESISTA! VAMOS TENTAR NOVAMENTE!
        </h2>
        <p className="text-sm text-slate-600 font-medium mb-6">
          Errar faz parte do aprendizado matemático! Respire fundo, use as dicas com calma e você vai conseguir!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            id="btn-retry-mission"
            onClick={() => {
              soundManager.playStart();
              onRetry();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-base shadow-lg transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Tentar Novamente (3 ❤️ Restaurados)</span>
          </button>

          <button
            id="btn-gameover-map"
            onClick={() => {
              soundManager.playClick();
              onGoToMap();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Voltar ao Mapa da Aventura</span>
          </button>
        </div>
      </div>
    </div>
  );
};
