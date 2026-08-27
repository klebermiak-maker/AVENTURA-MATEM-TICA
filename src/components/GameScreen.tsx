import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Calculator,
  Grid3X3,
} from 'lucide-react';
import { DifficultyLevel, GameSettings, OperationType, PhaseConfig, ProblemQuestion } from '../types';
import { soundManager } from '../utils/audio';

interface GameScreenProps {
  phase: PhaseConfig;
  level: DifficultyLevel;
  questions: ProblemQuestion[];
  currentIndex: number;
  currentScore: number;
  lives: number;
  comboStreak: number;
  settings: GameSettings;
  onCorrectAnswer: (points: number, usedHint: boolean, op: OperationType) => void;
  onWrongAnswer: (op: OperationType) => void;
  onNextQuestion: () => void;
  onQuitToMap: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  phase,
  level,
  questions,
  currentIndex,
  currentScore,
  lives,
  comboStreak,
  settings,
  onCorrectAnswer,
  onWrongAnswer,
  onNextQuestion,
  onQuitToMap,
}) => {
  const currentQ = questions[currentIndex];

  // Game step state
  // step 1: Choosing operation ('addition', 'subtraction', 'multiplication', 'division')
  // step 2: Calculating numeric answer
  // step 3: Question resolved with explanation & next button
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOp, setSelectedOp] = useState<OperationType | null>(null);
  const [opFeedback, setOpFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [ansFeedback, setAnsFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'options' | 'keypad'>('options');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [usedHintThisQuestion, setUsedHintThisQuestion] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [floatingNotification, setFloatingNotification] = useState<{ text: string; color: string; id: number } | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger floating visual score/heart notification
  const showFloat = (text: string, color = 'text-emerald-500') => {
    setFloatingNotification({ text, color, id: Date.now() });
    setTimeout(() => {
      setFloatingNotification(null);
    }, 1400);
  };

  // Trigger brief screen shake on mistake
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Reset states when question changes
  useEffect(() => {
    setStep(1);
    setSelectedOp(null);
    setOpFeedback(null);
    setAnsFeedback(null);
    setSelectedAns(null);
    setCustomInput('');
    setShowHint(false);
    setUsedHintThisQuestion(false);
    setIsSpeaking(false);

    // Auto narration if enabled
    if (settings.speechEnabled && currentQ) {
      handleReadQuestion();
    }
  }, [currentIndex, currentQ]);

  // Read question aloud using Web Speech API in Portuguese
  const handleReadQuestion = () => {
    if (!currentQ) return;
    setIsSpeaking(true);
    const speechText = `${currentQ.title}. ${currentQ.context} ${currentQ.questionText}`;
    soundManager.speakText(speechText);
  };

  const handleStopSpeech = () => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
  };

  // Keyboard navigation shortcuts (1,2,3,4 or Enter, H for hint, S for sound)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 1 && !opFeedback) {
        if (e.key === '1') handleSelectOp('addition');
        if (e.key === '2') handleSelectOp('subtraction');
        if (e.key === '3') handleSelectOp('multiplication');
        if (e.key === '4') handleSelectOp('division');
      } else if (step === 2 && !ansFeedback) {
        if (['1', '2', '3', '4'].includes(e.key) && inputMode === 'options' && currentQ) {
          const idx = parseInt(e.key, 10) - 1;
          if (currentQ.options[idx] !== undefined) {
            handleSelectAnswer(currentQ.options[idx]);
          }
        }
      } else if (step === 3 && e.key === 'Enter') {
        onNextQuestion();
      }

      if (e.key.toLowerCase() === 'h') {
        handleTriggerHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, opFeedback, ansFeedback, inputMode, currentQ]);

  // Step 1: Operation Selection Handler
  const handleSelectOp = (op: OperationType) => {
    if (!currentQ) return;
    soundManager.playClick();
    setSelectedOp(op);

    if (op === currentQ.operation) {
      soundManager.playCorrect();
      setOpFeedback('correct');
      showFloat('✨ OPERAÇÃO CORRETA! (+10 pts)', 'text-emerald-600 bg-emerald-100 border-emerald-300');

      if (!settings.reducedMotion) {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      }

      // Advance to step 2 after brief celebration
      setTimeout(() => {
        setStep(2);
      }, 950);
    } else {
      soundManager.playWrong();
      triggerShake();
      setOpFeedback('wrong');
      setShowHint(true);
      setUsedHintThisQuestion(true);
      showFloat('🤔 Tente outra operação! Olhe a dica!', 'text-amber-700 bg-amber-100 border-amber-300');
      onWrongAnswer(currentQ.operation);
    }
  };

  // Step 2: Answer Selection Handler
  const handleSelectAnswer = (ans: number) => {
    if (!currentQ) return;
    soundManager.playClick();
    setSelectedAns(ans);

    if (ans === currentQ.correctAnswer) {
      soundManager.playCorrect();
      setAnsFeedback('correct');
      setStep(3);

      // Points calculation
      const opPoints = 10;
      const ansPoints = 20;
      const noHintBonus = usedHintThisQuestion ? 0 : 5;
      const totalPoints = opPoints + ansPoints + noHintBonus;

      if (!settings.reducedMotion) {
        // Multi-directional celebratory confetti cannons
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0.2, y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 0.8, y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        });
      }

      showFloat(`🎉 +${totalPoints} PONTOS! ${noHintBonus > 0 ? '⭐ BÔNUS!' : ''}`, 'text-indigo-900 bg-amber-100 border-amber-400');
      onCorrectAnswer(totalPoints, usedHintThisQuestion, currentQ.operation);
    } else {
      soundManager.playWrong();
      triggerShake();
      setAnsFeedback('wrong');
      setShowHint(true);
      setUsedHintThisQuestion(true);
      showFloat('💔 Ops! -1 Coração. Tente de novo!', 'text-rose-800 bg-rose-100 border-rose-300');
      onWrongAnswer(currentQ.operation);
    }
  };

  // Trigger hint
  const handleTriggerHint = () => {
    soundManager.playHint();
    setShowHint(true);
    setUsedHintThisQuestion(true);
    showFloat('💡 Dica do Mestre Ativada!', 'text-amber-800 bg-amber-100 border-amber-300');
  };

  const getOpSymbol = (op: OperationType) => {
    switch (op) {
      case 'addition':
        return '+';
      case 'subtraction':
        return '−';
      case 'multiplication':
        return '×';
      case 'division':
        return '÷';
    }
  };

  const getOpName = (op: OperationType) => {
    switch (op) {
      case 'addition':
        return 'Adição';
      case 'subtraction':
        return 'Subtração';
      case 'multiplication':
        return 'Multiplicação';
      case 'division':
        return 'Divisão';
    }
  };

  if (!currentQ) return null;

  return (
    <div
      ref={containerRef}
      id="game-screen-arena"
      className={`min-h-[calc(100vh-68px)] p-3 sm:p-6 flex flex-col items-center justify-start ${
        settings.highContrast
          ? 'bg-zinc-950 text-white'
          : 'bg-gradient-to-b from-indigo-50/60 via-purple-50/40 to-slate-100 text-slate-800'
      }`}
    >
      {/* Top Mission Header & Progress Bar */}
      <div className="w-full max-w-4xl flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onQuitToMap}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              title="Voltar ao mapa"
            >
              ⬅️ Sair
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{phase.icon}</span>
              <span className="font-extrabold text-sm md:text-base text-indigo-900">
                {phase.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                Nível {level === 1 ? '1 🟢' : level === 2 ? '2 🟡' : '3 🔴'}
              </span>
            </div>
          </div>

          <div className="text-xs md:text-sm font-black text-indigo-800">
            Questão {currentIndex + 1} de {questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Floating Animated Notification Toast */}
      {floatingNotification && (
        <div
          key={floatingNotification.id}
          className={`fixed top-20 z-50 px-5 py-2.5 rounded-2xl font-black text-sm sm:text-base shadow-2xl border-2 animate-bounce transition-all ${floatingNotification.color}`}
        >
          {floatingNotification.text}
        </div>
      )}

      {/* Main Problem Situation Card */}
      <div
        className={`w-full max-w-4xl bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-2 border-indigo-100 mb-6 relative overflow-hidden transition-all duration-300 ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Top Badges & Narration Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl shadow-sm">
              {currentQ.icon}
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-800 leading-tight">
                {currentQ.title}
              </h2>
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                Situação-Problema do Cotidiano
              </span>
            </div>
          </div>

          {/* Web Speech Narration & Hint Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-listen-question"
              onClick={isSpeaking ? handleStopSpeech : handleReadQuestion}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title="Ouvir a leitura da questão com voz amigável"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Parar Voz' : 'Ouvir Questão'}</span>
            </button>

            <button
              id="btn-repeat-question"
              onClick={handleReadQuestion}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-sm"
              title="Repetir Leitura"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="btn-need-hint"
              onClick={handleTriggerHint}
              className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all shadow-sm ${
                showHint
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
              title="Dica pedagógica para ajudar no raciocínio"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Dica</span>
            </button>
          </div>
        </div>

        {/* Question Enunciation */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4 sm:p-6 rounded-2xl border border-indigo-100 mb-4">
          <p
            className={`text-slate-800 leading-relaxed font-medium mb-3 ${
              settings.fontSize === 'extralarge'
                ? 'text-xl sm:text-2xl'
                : settings.fontSize === 'large'
                ? 'text-lg sm:text-xl'
                : 'text-base sm:text-lg'
            }`}
          >
            {currentQ.context}
          </p>
          <div className="p-3 bg-white rounded-xl border border-indigo-200 text-indigo-950 font-black text-base sm:text-lg flex items-center gap-2">
            <span>❓</span>
            <span>{currentQ.questionText}</span>
          </div>
        </div>

        {/* Visual Aid (Counted Icons for 3rd grade learners) */}
        {currentQ.visualAidCount && (
          <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-amber-900">
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl shadow-sm">
              <span>{currentQ.visualAidCount.icon}</span>
              <span>1º Grupo: {currentQ.visualAidCount.count1}</span>
            </div>
            <span className="text-base text-amber-600 font-black">↔️</span>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl shadow-sm">
              <span>{currentQ.visualAidCount.icon}</span>
              <span>2º Grupo: {currentQ.visualAidCount.count2}</span>
            </div>
          </div>
        )}

        {/* Pedagogical Hint Drawer (if active) */}
        {showHint && (
          <div
            id="pedagogical-hint-box"
            className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 mb-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
          >
            <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 fill-amber-500" />
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-800 mb-0.5">
                💡 Dica do Mestre da Matemática
              </h4>
              <p className="text-sm sm:text-base font-semibold">{currentQ.hint}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: QUAL OPERAÇÃO DEVEMOS USAR? */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="mt-6">
            <div className="text-center mb-4">
              <h3 className="text-lg sm:text-2xl font-black text-indigo-950 flex items-center justify-center gap-2">
                <span>🧠</span>
                <span>Qual operação devemos usar?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Pense no significado da situação: estamos juntando, tirando, multiplicando ou dividindo?
              </p>
            </div>

            {/* 4 Big Tactile Operation Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Adição */}
              <button
                id="btn-op-addition"
                onClick={() => handleSelectOp('addition')}
                className={`py-4 sm:py-6 px-3 rounded-2xl font-black text-sm sm:text-lg flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-md active:scale-95 ${
                  selectedOp === 'addition'
                    ? opFeedback === 'correct'
                      ? 'bg-emerald-500 border-emerald-600 text-white animate-bounce'
                      : 'bg-rose-500 border-rose-600 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800 hover:-translate-y-1'
                }`}
              >
                <span className="text-3xl sm:text-4xl">➕</span>
                <span>ADIÇÃO</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Juntar / Ganhar
                </span>
              </button>

              {/* Subtração */}
              <button
                id="btn-op-subtraction"
                onClick={() => handleSelectOp('subtraction')}
                className={`py-4 sm:py-6 px-3 rounded-2xl font-black text-sm sm:text-lg flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-md active:scale-95 ${
                  selectedOp === 'subtraction'
                    ? opFeedback === 'correct'
                      ? 'bg-sky-500 border-sky-600 text-white animate-bounce'
                      : 'bg-rose-500 border-rose-600 text-white'
                    : 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800 hover:-translate-y-1'
                }`}
              >
                <span className="text-3xl sm:text-4xl">➖</span>
                <span>SUBTRAÇÃO</span>
                <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  Tirar / Diferença
                </span>
              </button>

              {/* Multiplicação */}
              <button
                id="btn-op-multiplication"
                onClick={() => handleSelectOp('multiplication')}
                className={`py-4 sm:py-6 px-3 rounded-2xl font-black text-sm sm:text-lg flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-md active:scale-95 ${
                  selectedOp === 'multiplication'
                    ? opFeedback === 'correct'
                      ? 'bg-amber-500 border-amber-600 text-white animate-bounce'
                      : 'bg-rose-500 border-rose-600 text-white'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 hover:-translate-y-1'
                }`}
              >
                <span className="text-3xl sm:text-4xl">✖️</span>
                <span>MULTIPLICAÇÃO</span>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Grupos Iguais
                </span>
              </button>

              {/* Divisão */}
              <button
                id="btn-op-division"
                onClick={() => handleSelectOp('division')}
                className={`py-4 sm:py-6 px-3 rounded-2xl font-black text-sm sm:text-lg flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-md active:scale-95 ${
                  selectedOp === 'division'
                    ? opFeedback === 'correct'
                      ? 'bg-purple-500 border-purple-600 text-white animate-bounce'
                      : 'bg-rose-500 border-rose-600 text-white'
                    : 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-800 hover:-translate-y-1'
                }`}
              >
                <span className="text-3xl sm:text-4xl">➗</span>
                <span>DIVISÃO</span>
                <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Repartir Igual
                </span>
              </button>
            </div>

            {/* Immediate Feedback Banner for Step 1 */}
            {opFeedback === 'correct' && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black text-center text-sm sm:text-base flex items-center justify-center gap-2 animate-in zoom-in-95">
                <span>🎉</span>
                <span>MUITO BEM! VOCÊ DESCOBRIU A OPERAÇÃO! (+10 pts)</span>
              </div>
            )}

            {opFeedback === 'wrong' && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-950 font-black text-center text-sm sm:text-base flex items-center justify-center gap-2 animate-in shake">
                <span>🤔</span>
                <span>QUASE! VAMOS PENSAR JUNTOS! Olhe a dica acima e tente novamente!</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2 & 3: RESOLVA O CÁLCULO NUMÉRICO */}
        {/* ========================================================================= */}
        {(step === 2 || step === 3) && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-3">
            {/* Numerical Equation Header */}
            <div className="bg-indigo-950 text-white rounded-2xl p-4 sm:p-6 mb-6 text-center shadow-lg border-2 border-indigo-400">
              <div className="text-xs uppercase font-extrabold text-indigo-300 mb-1">
                Operação Escolhida: {getOpName(currentQ.operation)}
              </div>
              <div className="text-3xl sm:text-5xl font-black tracking-wider flex items-center justify-center gap-3">
                <span>{currentQ.num1}</span>
                <span className="text-amber-400">{getOpSymbol(currentQ.operation)}</span>
                <span>{currentQ.num2}</span>
                <span className="text-indigo-300">=</span>
                <span className="text-amber-300 font-extrabold">
                  {step === 3 ? currentQ.correctAnswer : '?'}
                </span>
              </div>
              <div className="text-xs text-indigo-200 mt-2 font-medium">
                Unidade da resposta: {currentQ.unit}
              </div>
            </div>

            {/* Mode Toggle (Alternativas ou Teclado Numérico) */}
            {step === 2 && (
              <div className="flex justify-end gap-2 mb-3">
                <button
                  onClick={() => setInputMode('options')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                    inputMode === 'options'
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" /> Alternativas
                </button>
                <button
                  onClick={() => setInputMode('keypad')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                    inputMode === 'keypad'
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" /> Digitar Conta
                </button>
              </div>
            )}

            {/* Choice Alternatives Mode */}
            {step === 2 && inputMode === 'options' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      id={`btn-calc-opt-${idx}`}
                      onClick={() => handleSelectAnswer(opt)}
                      className={`py-5 px-4 rounded-2xl font-black text-xl sm:text-2xl border-4 transition-all shadow-md flex flex-col items-center justify-center gap-1 active:scale-95 ${
                        selectedAns === opt
                          ? opt === currentQ.correctAnswer
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'bg-rose-500 border-rose-600 text-white animate-shake'
                          : 'bg-white hover:bg-indigo-50 border-indigo-300 text-indigo-900 hover:border-indigo-500'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">{opt}</span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {currentQ.unit}
                      </span>
                    </button>
                  ))}
                </div>

                {ansFeedback === 'wrong' && (
                  <div className="mt-4 p-3 bg-rose-100 border border-rose-300 text-rose-900 font-bold rounded-2xl text-center text-sm flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Não é bem esse valor. Faça a continha com calma e tente de novo!</span>
                  </div>
                )}
              </div>
            )}

            {/* Direct Number Input / Keypad Mode */}
            {step === 2 && inputMode === 'keypad' && (
              <div className="max-w-xs mx-auto text-center">
                <input
                  id="direct-number-input"
                  type="number"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Digite o resultado..."
                  className="w-full text-center text-3xl font-black py-3 px-4 rounded-2xl border-4 border-indigo-300 focus:border-indigo-600 focus:outline-none mb-3 shadow-inner"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput) {
                      handleSelectAnswer(parseInt(customInput, 10));
                    }
                  }}
                />
                <button
                  id="btn-submit-custom-calc"
                  disabled={!customInput}
                  onClick={() => handleSelectAnswer(parseInt(customInput, 10))}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-lg shadow-lg transition"
                >
                  Conferir Resposta
                </button>
              </div>
            )}

            {/* Step 3: Success Explanation & Next Button */}
            {step === 3 && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 sm:p-6 text-center animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg animate-bounce">
                  ✨
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-900 mb-2">
                  🎉 EXCELENTE! VOCÊ ACERTOU!
                </h3>
                <p className="text-sm sm:text-base text-emerald-800 font-semibold max-w-xl mx-auto mb-4">
                  {currentQ.explanation}
                </p>

                {/* Score and Streak Recap */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <span className="bg-white border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    ⭐ +30 Pontos Conquistados
                  </span>
                  {!usedHintThisQuestion && (
                    <span className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                      💡 Bônus Sem Dica (+5 pts)
                    </span>
                  )}
                  {comboStreak >= 2 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-white" /> COMBO {comboStreak}x
                    </span>
                  )}
                </div>

                {/* Next Question / Finish Button */}
                <button
                  id="btn-next-question"
                  onClick={() => {
                    soundManager.playClick();
                    onNextQuestion();
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'Próxima Questão' : 'Concluir Nível!'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
