import React from 'react';
import {
  BarChart3,
  Printer,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Sparkles,
  X,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { OperationStats, TeacherReportData } from '../types';

interface TeacherReportModalProps {
  reportData: TeacherReportData;
  onResetProgress: () => void;
  onClose: () => void;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({
  reportData,
  onResetProgress,
  onClose,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const totalAttempts = reportData.totalQuestionsAttempted;
  const overallAccuracy = calculateAccuracy(reportData.totalCorrect, totalAttempts);

  const getOpAccuracy = (stats: OperationStats) => {
    if (stats.attempts === 0) return 0;
    return Math.round((stats.correctAnswers / stats.attempts) * 100);
  };

  const addAcc = getOpAccuracy(reportData.statsByOperation.addition);
  const subAcc = getOpAccuracy(reportData.statsByOperation.subtraction);
  const mulAcc = getOpAccuracy(reportData.statsByOperation.multiplication);
  const divAcc = getOpAccuracy(reportData.statsByOperation.division);

  // Pedagogical Diagnosis & Recommendations
  const getPedagogicalFeedback = () => {
    const diagnoses: string[] = [];

    if (totalAttempts < 3) {
      return ['O aluno iniciou a jornada recentemente. Conforme avançar pelas fases, o relatório apresentará análises detalhadas de fixação.'];
    }

    if (addAcc >= 80) {
      diagnoses.push('✅ Excelente domínio do conceito aditivo (juntar e acrescentar quantidades).');
    } else if (reportData.statsByOperation.addition.attempts > 0) {
      diagnoses.push('⚠️ Recomenda-se reforço em situações de acréscimo e cálculo com reserva na adição.');
    }

    if (subAcc >= 80) {
      diagnoses.push('✅ Ótima habilidade em situações subtrativas (retirar, comparar e calcular quanto falta).');
    } else if (reportData.statsByOperation.subtraction.attempts > 0) {
      diagnoses.push('⚠️ Sugere-se trabalhar situações comparativas ("quanto a mais / quanto falta") na subtração.');
    }

    if (mulAcc >= 80) {
      diagnoses.push('✅ Compreensão sólida da multiplicação como grupos iguais e organização retangular.');
    } else if (reportData.statsByOperation.multiplication.attempts > 0) {
      diagnoses.push('⚠️ Fortalecer o conceito de parcelas iguais repetidas antes da memorização de tabuadas.');
    }

    if (divAcc >= 80) {
      diagnoses.push('✅ Excelente raciocínio de partilha e distribuição em partes rigorosamente iguais.');
    } else if (reportData.statsByOperation.division.attempts > 0) {
      diagnoses.push('⚠️ Praticar divisão concreta com material manipulável (distribuição um a um).');
    }

    return diagnoses;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        id="printable-teacher-report"
        className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border-4 border-indigo-300 max-h-[92vh] overflow-y-auto flex flex-col"
      >
        {/* Header with Print and Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl shadow-inner print:hidden">
              👨‍🏫
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Relatório Pedagógico de Desempenho
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Missão das Quatro Operações • 3º Ano do Ensino Fundamental
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold border border-indigo-200 transition"
              title="Imprimir ou Salvar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Relatório</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Information Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 mb-6 print:bg-white print:border-slate-300">
          <div>
            <div className="text-[10px] font-black uppercase text-indigo-700">Aluno(a)</div>
            <div className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1">
              <span>{reportData.avatar}</span>
              <span className="truncate">{reportData.studentName}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-indigo-700">Turma</div>
            <div className="font-extrabold text-slate-800 text-sm sm:text-base">
              {reportData.studentClass}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-indigo-700">Data de Início</div>
            <div className="font-bold text-slate-700 text-xs sm:text-sm">{reportData.startDate}</div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-indigo-700">Tempo de Estudo</div>
            <div className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatTime(reportData.totalTimeSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Overall Key Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <div className="text-[10px] font-black text-slate-500 uppercase">Total de Questões</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{totalAttempts}</div>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center">
            <div className="text-[10px] font-black text-emerald-700 uppercase">Acertos Gerais</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {reportData.totalCorrect} ({overallAccuracy}%)
            </div>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-center">
            <div className="text-[10px] font-black text-rose-700 uppercase">Erros / Retentativas</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{reportData.totalErrors}</div>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center">
            <div className="text-[10px] font-black text-amber-800 uppercase">Pontuação Acumulada</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {reportData.totalScore} pts
            </div>
          </div>
        </div>

        {/* Operation Mastery Breakdown (Charts / Progress Bars) */}
        <div className="mb-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Desempenho Discriminado por Operação</span>
          </h3>

          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Adição */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span>➕</span> ADIÇÃO (Juntar / Acrescentar)
                </span>
                <span className="text-slate-600">
                  {reportData.statsByOperation.addition.correctAnswers}/
                  {reportData.statsByOperation.addition.attempts} acertos ({addAcc}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${addAcc}%` }}
                />
              </div>
            </div>

            {/* Subtração */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-sky-800">
                  <span>➖</span> SUBTRAÇÃO (Retirar / Comparar / Falta)
                </span>
                <span className="text-slate-600">
                  {reportData.statsByOperation.subtraction.correctAnswers}/
                  {reportData.statsByOperation.subtraction.attempts} acertos ({subAcc}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${subAcc}%` }}
                />
              </div>
            </div>

            {/* Multiplicação */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span>✖️</span> MULTIPLICAÇÃO (Grupos Iguais / Repetições)
                </span>
                <span className="text-slate-600">
                  {reportData.statsByOperation.multiplication.correctAnswers}/
                  {reportData.statsByOperation.multiplication.attempts} acertos ({mulAcc}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${mulAcc}%` }}
                />
              </div>
            </div>

            {/* Divisão */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-purple-800">
                  <span>➗</span> DIVISÃO (Repartir / Distribuir Igual)
                </span>
                <span className="text-slate-600">
                  {reportData.statsByOperation.division.correctAnswers}/
                  {reportData.statsByOperation.division.attempts} acertos ({divAcc}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${divAcc}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pedagogical Observations & Teacher Suggestions */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-700" />
            <span>Diagnóstico Pedagógico e Orientações para a Sala de Aula</span>
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
            {getPedagogicalFeedback().map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={onResetProgress}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Todo o Progresso do Aluno</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
