export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type DifficultyLevel = 1 | 2 | 3; // 1: Explorador, 2: Aventureiro, 3: Mestre Matemático

export interface ProblemQuestion {
  id: string;
  phaseId: number; // 1 to 5
  level: DifficultyLevel;
  operation: OperationType;
  title: string;
  context: string;
  questionText: string;
  num1: number;
  num2: number;
  correctAnswer: number;
  unit: string; // e.g. "figurinhas", "maçãs", "reais", "alunos"
  icon: string; // emoji or icon code
  options: number[]; // 4 distinct options including correctAnswer
  hint: string;
  explanation: string;
  pedagogicalKeyWord: string; // e.g. "Juntar", "Perder", "Grupos iguais", "Repartir igualmente"
  visualAidCount?: { count1: number; count2: number; icon: string };
}

export interface PhaseConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: string;
  operation: OperationType | 'mixed';
  icon: string;
  bgGradient: string;
  accentColor: string;
  description: string;
  levelsCount: number;
  questionsPerLevel: number;
  bossFight?: boolean;
}

export interface OperationStats {
  attempts: number;
  correctOps: number;
  correctAnswers: number;
  hintsUsed: number;
  errors: number;
}

export interface TeacherReportData {
  studentName: string;
  studentClass: string;
  avatar: string;
  startDate: string;
  totalTimeSeconds: number;
  currentPhase: number;
  currentLevel: DifficultyLevel;
  totalScore: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalErrors: number;
  phaseStars: Record<number, number>; // phaseId -> stars (1-3)
  unlockedPhases: number[];
  unlockedBadges: string[];
  statsByOperation: {
    addition: OperationStats;
    subtraction: OperationStats;
    multiplication: OperationStats;
    division: OperationStats;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'phase' | 'combo' | 'perfection' | 'mastery';
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  speechEnabled: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extralarge';
  reducedMotion: boolean;
}
