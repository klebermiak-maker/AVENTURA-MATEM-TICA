import React from 'react';
import { Trophy, CheckCircle, Lock, X } from 'lucide-react';
import { Badge } from '../types';
import { getBadgesStatus } from '../utils/storage';

interface TrophyRoomModalProps {
  unlockedBadgeIds: string[];
  onClose: () => void;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({ unlockedBadgeIds, onClose }) => {
  const allBadges: Badge[] = getBadgesStatus(unlockedBadgeIds);
  const unlockedCount = allBadges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
              🏆
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Salão de Troféus & Medalhas
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {unlockedCount} de {allBadges.length} conquistas desbloqueadas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 overflow-y-auto pr-1">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                badge.unlocked
                  ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                  badge.unlocked ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {badge.unlocked ? badge.icon : '🔒'}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-800">{badge.title}</h4>
                  {badge.unlocked ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Conquistada
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Lock className="w-3 h-3" /> Bloqueada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition"
          >
            Fechar Salão de Troféus
          </button>
        </div>
      </div>
    </div>
  );
};
