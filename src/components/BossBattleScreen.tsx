import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldAlert, Zap, Volume2, RotateCcw, Lightbulb, Flame, Award, ArrowRight } from 'lucide-react';
import { GameSettings, OperationType, ProblemQuestion } from '../types';
import { soundManager } from '../utils/audio';

interface BossBattleScreenProps {
  questions: ProblemQuestion[];
  currentScore: number;
  lives: number;
  comboStreak: number;
  settings: GameSettings;
  onCorrectAnswer: (points: number, usedHint: boolean, op: OperationType) => void;
  onWrongAnswer: (op: OperationType) => void;
  onDefeatBoss: () => void;
  onQuitToMap: () => void;
}

export const BossBattleScreen: React.FC<BossBattleScreenProps> = ({
  questions,
  currentScore,
  lives,
  comboStreak,
  settings,
  onCorrectAnswer,
  onWrongAnswer,
  onDefeatBoss,
  onQuitToMap,
}) => {
  const maxBossHp = 5;
  const [bossHp, setBossHp] = useState<number>(maxBossHp);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOp, setSelectedOp] = useState<OperationType | null>(null);
  const [opFeedback, setOpFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [ansFeedback, setAnsFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  const [bossAnimationState, setBossAnimationState] = useState<'idle' | 'hit' | 'defeated'>('idle');
  const [floatingDamage, setFloatingDamage] = useState<{ text: string; color: string; id: number } | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const currentQ = questions[currentQIndex % questions.length];

  const showDamageToast = (text: string, color = 'text-amber-400 bg-amber-950/80 border-amber-500') => {
    setFloatingDamage({ text, color, id: Date.now() });
    setTimeout(() => setFloatingDamage(null), 1400);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  useEffect(() => {
    setStep(1);
    setSelectedOp(null);
    setOpFeedback(null);
    setAnsFeedback(null);
    setSelectedAns(null);
    setShowHint(false);
    setUsedHint(false);

    if (settings.speechEnabled && currentQ) {
      soundManager.speakText(`Desafio do Monstro. ${currentQ.title}. ${currentQ.context} ${currentQ.questionText}`);
    }
  }, [currentQIndex]);

  const handleSelectOp = (op: OperationType) => {
    if (!currentQ) return;
    soundManager.playClick();
    setSelectedOp(op);

    if (op === currentQ.operation) {
      soundManager.playCorrect();
      setOpFeedback('correct');
      showDamageToast('⚡ OPERAÇÃO DESTRUTIVA CORRETA!', 'text-amber-300 bg-amber-950/90 border-amber-500');
      setTimeout(() => setStep(2), 900);
    } else {
      soundManager.playWrong();
      triggerShake();
      setOpFeedback('wrong');
      setShowHint(true);
      setUsedHint(true);
      showDamageToast('💥 O Monstro desviou! Veja a dica!', 'text-rose-400 bg-rose-950/90 border-rose-600');
      onWrongAnswer(currentQ.operation);
    }
  };

  const handleSelectAnswer = (ans: number) => {
    if (!currentQ) return;
    soundManager.playClick();
    setSelectedAns(ans);

    if (ans === currentQ.correctAnswer) {
      soundManager.playCorrect();
      soundManager.playBossHit();
      setAnsFeedback('correct');
      setBossAnimationState('hit');

      const nextHp = Math.max(0, bossHp - 1);
      setBossHp(nextHp);

      if (!settings.reducedMotion) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#ef4444', '#f59e0b', '#8b5cf6'],
        });
      }

      showDamageToast('💥 GOLPE CRÍTICO! -1 HP DO MONSTRO (+35 pts)', 'text-emerald-400 bg-emerald-950/90 border-emerald-500');
      onCorrectAnswer(35, usedHint, currentQ.operation);

      if (nextHp <= 0) {
        setBossAnimationState('defeated');
        soundManager.playVictory();
        if (!settings.reducedMotion) {
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.3 },
          });
        }
        setTimeout(() => {
          onDefeatBoss();
        }, 1800);
      } else {
        setStep(3);
        setTimeout(() => {
          setBossAnimationState('idle');
        }, 800);
      }
    } else {
      soundManager.playWrong();
      triggerShake();
      setAnsFeedback('wrong');
      setShowHint(true);
      setUsedHint(true);
      showDamageToast('💔 Ataque Falhou! -1 Coração.', 'text-rose-400 bg-rose-950/90 border-rose-600');
      onWrongAnswer(currentQ.operation);
    }
  };

  const handleNextBossQuestion = () => {
    setCurrentQIndex((prev) => prev + 1);
  };

  return (
    <div
      id="boss-battle-screen"
      className="min-h-[calc(100vh-68px)] p-3 sm:p-6 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white flex flex-col items-center justify-start relative overflow-hidden"
    >
      {/* Floating Animated Damage / Alert Toast */}
      {floatingDamage && (
        <div
          key={floatingDamage.id}
          className={`fixed top-20 z-50 px-5 py-2.5 rounded-2xl font-black text-sm sm:text-base shadow-2xl border-2 animate-bounce transition-all ${floatingDamage.color}`}
        >
          {floatingDamage.text}
        </div>
      )}

      {/* Top Header Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <button
          onClick={onQuitToMap}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          ⬅️ Abandonar Batalha
        </button>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="font-black text-sm md:text-lg text-amber-400 uppercase tracking-wide">
            Batalha Final — Monstro da Confusão
          </span>
        </div>
      </div>

      {/* Monster Boss Card with Health Bar */}
      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 border-2 border-red-500/50 shadow-2xl mb-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Animated Monster Avatar */}
        <div className="relative shrink-0">
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-red-600 via-purple-700 to-indigo-900 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl border-4 border-red-400 transition-all duration-300 ${
              bossAnimationState === 'hit'
                ? 'scale-110 rotate-6 bg-rose-700 animate-shake'
                : bossAnimationState === 'defeated'
                ? 'scale-75 rotate-45 opacity-40 grayscale'
                : 'animate-pulse'
            }`}
          >
            {bossAnimationState === 'defeated' ? '😵' : bossHp <= 2 ? '😡' : '👾'}
          </div>
          {bossAnimationState === 'hit' && (
            <div className="absolute -top-3 -right-3 bg-yellow-400 text-black font-black text-xs px-2 py-1 rounded-full animate-ping">
              POW! -1 HP
            </div>
          )}
        </div>

        {/* Boss HP & Title */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg sm:text-2xl font-black text-red-400">
              Monstro da Confusão Matemática
            </h2>
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {bossHp} / {maxBossHp} ENERGIA
            </span>
          </div>

          {/* HP Bar */}
          <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden p-1 border border-red-500/40 mb-3">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            Resolva as situações-problema para enfraquecer o monstro e dissipar toda a confusão do reino!
          </p>
        </div>
      </div>

      {/* Problem Challenge Card */}
      {currentQ && (
        <div
          className={`w-full max-w-4xl bg-slate-900/95 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl transition-all duration-300 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Top Question Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentQ.icon}</span>
              <div>
                <h3 className="text-base sm:text-xl font-black text-white">{currentQ.title}</h3>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Enigma do Templo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  soundManager.speakText(`${currentQ.title}. ${currentQ.context} ${currentQ.questionText}`)
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition"
              >
                <Volume2 className="w-4 h-4" /> Ouvir
              </button>
              <button
                onClick={() => {
                  soundManager.playHint();
                  setShowHint(true);
                  setUsedHint(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition"
              >
                <Lightbulb className="w-4 h-4" /> Dica
              </button>
            </div>
          </div>

          {/* Context & Question */}
          <div className="bg-slate-800/80 p-4 sm:p-6 rounded-2xl border border-indigo-400/30 mb-5">
            <p className="text-base sm:text-lg text-slate-200 font-medium mb-3">
              {currentQ.context}
            </p>
            <div className="p-3 bg-indigo-950 rounded-xl border border-indigo-500/40 text-amber-300 font-black text-base sm:text-lg flex items-center gap-2">
              <span>❓</span>
              <span>{currentQ.questionText}</span>
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-3.5 rounded-2xl bg-amber-950/80 border border-amber-400 text-amber-200 text-sm font-semibold mb-5 flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>{currentQ.hint}</span>
            </div>
          )}

          {/* Step 1: Operation Selection */}
          {step === 1 && (
            <div>
              <div className="text-center mb-4">
                <h4 className="text-base sm:text-xl font-black text-amber-300">
                  Qual operação devemos usar para atingir o monstro?
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleSelectOp('addition')}
                  className={`py-4 rounded-2xl font-black text-sm sm:text-base border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedOp === 'addition'
                      ? opFeedback === 'correct'
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600/50 text-emerald-300'
                  }`}
                >
                  <span className="text-3xl">➕</span>
                  <span>ADIÇÃO</span>
                </button>

                <button
                  onClick={() => handleSelectOp('subtraction')}
                  className={`py-4 rounded-2xl font-black text-sm sm:text-base border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedOp === 'subtraction'
                      ? opFeedback === 'correct'
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-sky-950/80 hover:bg-sky-900 border-sky-600/50 text-sky-300'
                  }`}
                >
                  <span className="text-3xl">➖</span>
                  <span>SUBTRAÇÃO</span>
                </button>

                <button
                  onClick={() => handleSelectOp('multiplication')}
                  className={`py-4 rounded-2xl font-black text-sm sm:text-base border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedOp === 'multiplication'
                      ? opFeedback === 'correct'
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-amber-950/80 hover:bg-amber-900 border-amber-600/50 text-amber-300'
                  }`}
                >
                  <span className="text-3xl">✖️</span>
                  <span>MULTIPLICAÇÃO</span>
                </button>

                <button
                  onClick={() => handleSelectOp('division')}
                  className={`py-4 rounded-2xl font-black text-sm sm:text-base border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedOp === 'division'
                      ? opFeedback === 'correct'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-purple-950/80 hover:bg-purple-900 border-purple-600/50 text-purple-300'
                  }`}
                >
                  <span className="text-3xl">➗</span>
                  <span>DIVISÃO</span>
                </button>
              </div>

              {opFeedback === 'correct' && (
                <div className="mt-4 p-3 bg-emerald-950 border border-emerald-400 text-emerald-300 text-center font-black rounded-2xl">
                  ⚡ OPERAÇÃO CORRETA! Prepare o golpe matemático!
                </div>
              )}
            </div>
          )}

          {/* Step 2: Answer Alternatives */}
          {step === 2 && (
            <div>
              <div className="text-center mb-4">
                <div className="text-2xl sm:text-4xl font-black text-amber-400 tracking-wider mb-2">
                  {currentQ.num1} {currentQ.operation === 'addition' ? '+' : currentQ.operation === 'subtraction' ? '−' : currentQ.operation === 'multiplication' ? '×' : '÷'} {currentQ.num2} = ?
                </div>
                <p className="text-xs text-slate-300">Escolha o resultado correto para lançar o ataque!</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(opt)}
                    className="py-4 rounded-2xl bg-indigo-950 hover:bg-indigo-900 border-2 border-indigo-400 text-white font-black text-2xl shadow-lg transition active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <span>{opt}</span>
                    <span className="text-[10px] text-indigo-300 font-normal">{currentQ.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Round Won, Next Attack */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mb-2">
                💥 ATAQUE CERTEIRO! O MONSTRO SENTIU O GOLPE!
              </div>
              <p className="text-sm text-slate-300 mb-4">{currentQ.explanation}</p>
              <button
                onClick={handleNextBossQuestion}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 mx-auto"
              >
                <span>Próximo Golpe Mágico</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
