import React from 'react';
import { Volume2, VolumeX, Award, BarChart3, User, Eye, Sparkles, Heart } from 'lucide-react';
import { GameSettings, TeacherReportData } from '../types';

interface NavbarProps {
  reportData: TeacherReportData;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenReport: () => void;
  onOpenTrophies: () => void;
  onOpenProfile: () => void;
  onGoToMap: () => void;
  currentScreen: 'map' | 'game' | 'boss';
  lives: number;
  comboStreak: number;
  currentScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  reportData,
  settings,
  onUpdateSettings,
  onOpenReport,
  onOpenTrophies,
  onOpenProfile,
  onGoToMap,
  currentScreen,
  lives,
  comboStreak,
  currentScore,
}) => {
  return (
    <header
      id="main-game-navbar"
      className={`w-full py-2.5 px-3 md:px-6 shadow-md transition-colors ${
        settings.highContrast
          ? 'bg-black border-b-2 border-yellow-400 text-white'
          : 'bg-white/95 backdrop-blur-md border-b border-indigo-100 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 md:gap-4">
        {/* Left: Brand & Student Avatar */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            id="nav-logo-btn"
            onClick={onGoToMap}
            className="flex items-center gap-2 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1"
            title="Voltar ao Mapa da Aventura"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm md:text-lg tracking-tight text-indigo-900 flex items-center gap-1">
                  Missão das 4 Operações
                </span>
              </div>
              <span className="hidden sm:inline-block text-xs font-medium text-indigo-600">
                3º Ano do Ensino Fundamental
              </span>
            </div>
          </button>

          {/* Student Profile Pill */}
          <button
            id="nav-student-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full py-1 px-3 text-xs md:text-sm font-bold text-indigo-900 transition-all"
            title="Editar Perfil do Aluno"
          >
            <span className="text-base md:text-lg">{reportData.avatar}</span>
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{reportData.studentName}</span>
            <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full hidden md:inline">
              {reportData.studentClass}
            </span>
          </button>
        </div>

        {/* Center: In-Game Status (Score, Combo, Hearts) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hearts if in game */}
          {currentScreen !== 'map' && (
            <div
              id="nav-lives-container"
              className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-rose-600 font-extrabold text-sm"
              title={`${lives} corações restantes`}
            >
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                    heartIndex <= lives
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'text-gray-300 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Combo Indicator */}
          {comboStreak >= 2 && (
            <div
              id="nav-combo-streak"
              className="animate-bounce flex items-center gap-1 bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold px-2.5 py-0.5 rounded-full text-xs md:text-sm shadow-md"
            >
              <span>{comboStreak >= 5 ? '🔥🔥🔥' : comboStreak >= 3 ? '🔥🔥' : '🔥'}</span>
              <span>COMBO {comboStreak}x</span>
            </div>
          )}

          {/* Score Counter */}
          <div
            id="nav-score-display"
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 font-black px-3 py-1 rounded-full text-sm md:text-base shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{currentScore} pts</span>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sound Toggle */}
          <button
            id="nav-toggle-sound"
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded-xl border transition-all ${
              settings.soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
            }`}
            title={settings.soundEnabled ? 'Som Ligado (Clique para mutar)' : 'Som Mutado (Clique para ativar)'}
            aria-label="Controle de Efeitos Sonoros"
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Font Size & Accessibility */}
          <button
            id="nav-toggle-contrast"
            onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
            className={`p-2 rounded-xl border transition-all ${
              settings.highContrast
                ? 'bg-yellow-400 text-black border-yellow-500 font-black'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Alternar Modo Alto Contraste"
            aria-label="Alto Contraste"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Trophy Room Button */}
          <button
            id="nav-trophy-btn"
            onClick={onOpenTrophies}
            className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all relative"
            title="Salão de Troféus e Medalhas"
            aria-label="Troféus"
          >
            <Award className="w-5 h-5" />
            {reportData.unlockedBadges.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {reportData.unlockedBadges.length}
              </span>
            )}
          </button>

          {/* Teacher Report Button */}
          <button
            id="nav-teacher-report-btn"
            onClick={onOpenReport}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold shadow transition-all"
            title="Painel e Relatório do Professor"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Relatório Professor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
