import { INITIAL_BADGES } from '../data/badges';
import { Badge, DifficultyLevel, OperationType, TeacherReportData } from '../types';

const STORAGE_KEY = 'missao_quatro_operacoes_v1';

export function getDefaultReportData(): TeacherReportData {
  return {
    studentName: 'Explorador(a) Mirim',
    studentClass: '3º Ano B',
    avatar: '🦊',
    startDate: new Date().toLocaleDateString('pt-BR'),
    totalTimeSeconds: 0,
    currentPhase: 1,
    currentLevel: 1,
    totalScore: 0,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    totalErrors: 0,
    phaseStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    unlockedPhases: [1],
    unlockedBadges: [],
    statsByOperation: {
      addition: { attempts: 0, correctOps: 0, correctAnswers: 0, hintsUsed: 0, errors: 0 },
      subtraction: { attempts: 0, correctOps: 0, correctAnswers: 0, hintsUsed: 0, errors: 0 },
      multiplication: { attempts: 0, correctOps: 0, correctAnswers: 0, hintsUsed: 0, errors: 0 },
      division: { attempts: 0, correctOps: 0, correctAnswers: 0, hintsUsed: 0, errors: 0 },
    },
  };
}

export function loadGameData(): TeacherReportData {
  if (typeof window === 'undefined') return getDefaultReportData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultReportData();
    const parsed = JSON.parse(raw);
    return { ...getDefaultReportData(), ...parsed };
  } catch {
    return getDefaultReportData();
  }
}

export function saveGameData(data: TeacherReportData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving game data', err);
  }
}

export function updateOperationStat(
  data: TeacherReportData,
  op: OperationType,
  isOpCorrect: boolean,
  isAnsCorrect: boolean,
  usedHint: boolean,
  isError: boolean
): TeacherReportData {
  const current = data.statsByOperation[op] || {
    attempts: 0,
    correctOps: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    errors: 0,
  };

  const updatedOp = {
    attempts: current.attempts + 1,
    correctOps: current.correctOps + (isOpCorrect ? 1 : 0),
    correctAnswers: current.correctAnswers + (isAnsCorrect ? 1 : 0),
    hintsUsed: current.hintsUsed + (usedHint ? 1 : 0),
    errors: current.errors + (isError ? 1 : 0),
  };

  return {
    ...data,
    totalQuestionsAttempted: data.totalQuestionsAttempted + 1,
    totalCorrect: data.totalCorrect + (isAnsCorrect ? 1 : 0),
    totalErrors: data.totalErrors + (isError ? 1 : 0),
    statsByOperation: {
      ...data.statsByOperation,
      [op]: updatedOp,
    },
  };
}

export function getBadgesStatus(unlockedIds: string[]): Badge[] {
  return INITIAL_BADGES.map((b) => ({
    ...b,
    unlocked: unlockedIds.includes(b.id),
  }));
}
