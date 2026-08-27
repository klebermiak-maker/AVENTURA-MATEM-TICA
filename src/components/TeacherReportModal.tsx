import React, { useState } from 'react';
import {
  X,
  Printer,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { TeacherReportData } from '../types';
import { resetGameData } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface TeacherReportModalProps {
  reportData: TeacherReportData;
  onUpdateReportData: (data: TeacherReportData) => void;
  onClose: () => void;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({
  reportData,
  onUpdateReportData,
  onClose,
}) => {
  const [studentName, setStudentName] = useState(reportData.studentName || 'Explorador(a) Mirim');
  const [studentClass, setStudentClass] = useState(reportData.studentClass || '3º Ano B');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  const handleSaveStudentInfo = () => {
    onUpdateReportData({
      ...reportData,
      studentName,
      studentClass,
    });
  };

  const handleConfirmReset = () => {
    const cleanData = resetGameData();
    onUpdateReportData(cleanData);
    setShowResetConfirm(false);
    soundManager.playStart();
  };

  // Helper to compute accuracy
  const getOpStats = (attempts: number, correct: number) => {
    if (attempts === 0) return { pct: 0, text: 'Ainda não jogado' };
    const pct = Math.round((correct / attempts) * 100);
    return { pct, text: `${pct}% (${correct}/${attempts})` };
  };

  const opsList = [
    {
      key: 'addition' as const,
      name: 'Adição',
      icon: '➕',
      meaning: 'Juntar, acrescentar, reunir',
      stats: reportData.statsByOperation.addition,
      color: 'emerald',
    },
    {
      key: 'subtraction' as const,
      name: 'Subtração',
      icon: '➖',
      meaning: 'Tirar, comparar, quanto falta',
      stats: reportData.statsByOperation.subtraction,
      color: 'sky',
    },
    {
      key: 'multiplication' as const,
      name: 'Multiplicação',
      icon: '✖️',
      meaning: 'Grupos iguais, parcelas repetidas',
      stats: reportData.statsByOperation.multiplication,
      color: 'amber',
    },
    {
      key: 'division' as const,
      name: 'Divisão',
      icon: '➗',
      meaning: 'Repartir em partes iguais',
      stats: reportData.statsByOperation.division,
      color: 'purple',
    },
  ];

  const totalStars = (Object.values(reportData.phaseStars) as number[]).reduce(
    (a, b) => a + (b || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border-4 border-indigo-200 animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl shadow-inner">
              📊
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Relatório de Desempenho Pedagógico
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Acompanhamento para Professores, Pais e Alunos (3º Ano EF)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Fechar Relatório"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1 text-slate-800">
          {/* Student Identifiers */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">
                Nome do(a) Aluno(a):
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onBlur={handleSaveStudentInfo}
                className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">
                Turma / Ano:
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                onBlur={handleSaveStudentInfo}
                className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-500 block mb-1">
                Tempo Total de Atividade:
              </label>
              <div className="flex items-center gap-1.5 font-black text-indigo-900 text-sm bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>{formatTime(reportData.totalTimeSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] font-black uppercase text-emerald-800 block">
                Total de Acertos
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {reportData.totalCorrect}
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] font-black uppercase text-amber-800 block">
                Pontuação Total
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-700">
                {reportData.totalScore}
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] font-black uppercase text-purple-800 block">
                Estrelas de Ouro
              </span>
              <span className="text-2xl sm:text-3xl font-black text-purple-700">
                ⭐ {totalStars} / 15
              </span>
            </div>
            <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] font-black uppercase text-sky-800 block">
                Medalhas Ganhas
              </span>
              <span className="text-2xl sm:text-3xl font-black text-sky-700">
                🏆 {reportData.unlockedBadges.length}
              </span>
            </div>
          </div>

          {/* Pedagogical Breakdown by Operation */}
          <div>
            <h3 className="font-extrabold text-base text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Desempenho por Operação Matemática</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opsList.map((item) => {
                const accuracy = getOpStats(item.stats.attempts, item.stats.correctAnswers);
                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-black text-base text-slate-800">{item.name}</h4>
                          <span className="text-[10px] text-slate-500 font-bold block">
                            {item.meaning}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          accuracy.pct >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : accuracy.pct >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : item.stats.attempts === 0
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {accuracy.text}
                      </span>
                    </div>

                    {/* Mini Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Op. Identificadas</span>
                        <span className="font-extrabold text-slate-700">
                          {item.stats.correctOps}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Dicas Usadas</span>
                        <span className="font-extrabold text-amber-700">
                          {item.stats.hintsUsed}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Erros Corrigidos</span>
                        <span className="font-extrabold text-rose-700">
                          {item.stats.errors}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedagogical Observations & Tips */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
            <h4 className="font-black text-xs uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Dicas Pedagógicas para Professores e Responsáveis</span>
            </h4>
            <ul className="text-xs text-indigo-950 font-medium space-y-1.5 mt-2">
              <li>
                • Incentive o aluno a ler o problema em voz alta ou usar o botão de leitura amigável antes de calcular.
              </li>
              <li>
                • A estrutura do jogo avalia primeiro a <strong>compreensão do sentido</strong> da operação e depois a exatidão do cálculo.
              </li>
              <li>
                • Se o aluno apresentar muitas dicas em uma operação específica, reforce situações cotidianas com materiais concretos (tampinhas, palitos de picolé ou desenhos).
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-2 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1"
                title="Zerar dados e reiniciar aventura"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Progresso</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-100 p-1.5 rounded-xl border border-rose-300 animate-in fade-in">
                <span className="text-xs font-bold text-rose-900">Confirmar limpeza?</span>
                <button
                  onClick={handleConfirmReset}
                  className="px-2 py-1 text-xs font-black bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Sim, zerar
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs sm:text-sm font-black rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs sm:text-sm font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
