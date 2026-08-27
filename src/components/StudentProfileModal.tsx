import React, { useState, useEffect } from 'react';
import { User, X, Check, Volume2, Sparkles, Rocket } from 'lucide-react';
import { TeacherReportData } from '../types';
import { soundManager } from '../utils/audio';

interface StudentProfileModalProps {
  reportData: TeacherReportData;
  isFirstTime?: boolean;
  onSave: (name: string, studentClass: string, avatar: string) => void;
  onClose: () => void;
}

const AVATARS = [
  { emoji: '🦊', label: 'Raposa Curiosa' },
  { emoji: '🦁', label: 'Leão Valente' },
  { emoji: '🐼', label: 'Panda Sábio' },
  { emoji: '🦄', label: 'Unicórnio Mágico' },
  { emoji: '🚀', label: 'Astronauta' },
  { emoji: '🧙‍♂️', label: 'Mago dos Números' },
  { emoji: '🧝‍♀️', label: 'Fada Guardiã' },
  { emoji: '👑', label: 'Rei/Rainha' },
  { emoji: '🦉', label: 'Coruja Inteligente' },
  { emoji: '🐯', label: 'Tigre Veloz' },
  { emoji: '🤖', label: 'Robô Calculador' },
  { emoji: '🦖', label: 'Dino Matemático' },
];

const CLASS_SUGGESTIONS = ['3º Ano A', '3º Ano B', '3º Ano C', '3º Ano D', '3º Ano'];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  reportData,
  isFirstTime = false,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(
    reportData.studentName === 'Explorador(a) Mirim' ? '' : reportData.studentName
  );
  const [studentClass, setStudentClass] = useState(reportData.studentClass || '3º Ano A');
  const [avatar, setAvatar] = useState(reportData.avatar || '🦊');
  const [errorMsg, setErrorMsg] = useState('');

  const speakWelcome = () => {
    soundManager.speakText(
      'Olá, jovem explorador! Digite seu nome e escolha seu mascote favorito para iniciar a Missão das Quatro Operações!'
    );
  };

  useEffect(() => {
    if (isFirstTime) {
      speakWelcome();
    }
  }, [isFirstTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim();
    if (!finalName) {
      setErrorMsg('Por favor, digite seu nome ou apelido para começar!');
      soundManager.playWrong();
      return;
    }
    soundManager.playLevelPass();
    onSave(finalName, studentClass.trim() || '3º Ano', avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border-4 border-indigo-300 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl shadow-inner">
              {avatar}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-1.5">
                <span>{isFirstTime ? '🌟 Bem-vindo(a) à Aventura!' : '👤 Identificação do Aluno'}</span>
              </h2>
              <p className="text-xs text-indigo-600 font-semibold">
                {isFirstTime ? 'Qual é o seu nome, jovem campeão(ã)?' : 'Atualize seu nome, turma ou mascote'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={speakWelcome}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition"
              title="Ouvir instrução por voz"
              aria-label="Ouvir instrução"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name Input */}
          <div>
            <label
              htmlFor="input-student-name"
              className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Digite o seu Nome ou Apelido:</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-student-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ex: Maria Clara, Pedro, Sofia..."
              maxLength={30}
              autoFocus
              className={`w-full px-4 py-3 rounded-2xl border-3 font-extrabold text-base sm:text-lg text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition ${
                errorMsg
                  ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500'
                  : 'border-indigo-200 bg-indigo-50/30 focus:border-indigo-600 focus:bg-white'
              }`}
              required
            />
            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 animate-bounce">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Escolha o seu Mascote Favorito:</span>
              <span className="text-[11px] text-indigo-600 font-bold lowercase">
                {AVATARS.find((a) => a.emoji === avatar)?.label || 'Mascote selecionado'}
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2.5 bg-slate-50 rounded-2xl border-2 border-slate-200">
              {AVATARS.map((item) => {
                const isSelected = avatar === item.emoji;
                return (
                  <button
                    type="button"
                    key={item.emoji}
                    onClick={() => {
                      soundManager.playClick();
                      setAvatar(item.emoji);
                    }}
                    title={item.label}
                    className={`text-2xl sm:text-3xl p-2 rounded-2xl transition transform flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-lg scale-110 ring-4 ring-indigo-300 z-10'
                        : 'hover:bg-slate-200 hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Class / Turma */}
          <div>
            <label
              htmlFor="input-student-class"
              className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Sua Turma / Sala do 3º Ano:
            </label>
            <input
              id="input-student-class"
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="Ex: 3º Ano A"
              maxLength={25}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-200 bg-white font-bold text-slate-800 text-sm focus:border-indigo-600 focus:outline-none"
            />
            {/* Quick chips for classes */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CLASS_SUGGESTIONS.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setStudentClass(sug)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition ${
                    studentClass === sug
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-black'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100">
            <button
              id="btn-save-student-profile"
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Rocket className="w-5 h-5" />
              <span>{isFirstTime ? 'Salvar Nome e Começar Missão!' : 'Confirmar e Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

