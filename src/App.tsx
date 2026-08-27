import React, { useState, useEffect } from 'react';
import {
  DifficultyLevel,
  GameSettings,
  OperationType,
  PhaseConfig,
  ProblemQuestion,
  TeacherReportData,
} from './types';
import { PHASES } from './data/phases';
import { getQuestionsForPhase, generateProceduralQuestion } from './data/questions';
import { loadGameData, saveGameData, updateOperationStat } from './utils/storage';
import { soundManager } from './utils/audio';

import { Navbar } from './components/Navbar';
import { WorldMap } from './components/WorldMap';
import { GameScreen } from './components/GameScreen';
import { BossBattleScreen } from './components/BossBattleScreen';
import { RewardModal } from './components/RewardModal';
import { GameOverModal } from './components/GameOverModal';
import { TrophyRoomModal } from './components/TrophyRoomModal';
import { TeacherReportModal } from './components/TeacherReportModal';
import { ParticleCanvas } from './components/ParticleCanvas';

export default function App() {
  // Persistence state
  const [reportData, setReportData] = useState<TeacherReportData>(loadGameData);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    speechEnabled: true,
    highContrast: false,
    fontSize: 'normal',
    reducedMotion: false,
  });

  // Navigation and active mission state
  const [currentScreen, setCurrentScreen] = useState<'map' | 'game' | 'boss'>('map');
  const [activePhase, setActivePhase] = useState<PhaseConfig>(PHASES[0]);
  const [activeLevel, setActiveLevel] = useState<DifficultyLevel>(1);
  const [questions, setQuestions] = useState<ProblemQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  // Session stats for current mission
  const [lives, setLives] = useState<number>(3);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [consecutiveNoHints, setConsecutiveNoHints] = useState<number>(0);
  const [livesLostInLevel, setLivesLostInLevel] = useState<number>(0);

  // Modals state
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [rewardStars, setRewardStars] = useState<number>(3);
  const [newBadgeTitle, setNewBadgeTitle] = useState<string | undefined>(undefined);
  const [isGrandMasterVictory, setIsGrandMasterVictory] = useState<boolean>(false);

  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showTrophyModal, setShowTrophyModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Auto-save whenever reportData changes
  useEffect(() => {
    saveGameData(reportData);
  }, [reportData]);

  // Sync sound settings with SoundManager
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Timer: increment total study time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setReportData((prev) => ({
        ...prev,
        totalTimeSeconds: prev.totalTimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      if (newSettings.soundEnabled !== undefined) {
        soundManager.setSoundEnabled(newSettings.soundEnabled);
        soundManager.setMusicEnabled(newSettings.soundEnabled);
      }
      return next;
    });
  };

  // Start a specific Phase and Level
  const handleSelectLevel = (phase: PhaseConfig, level: DifficultyLevel, isBoss = false) => {
    setActivePhase(phase);
    setActiveLevel(level);
    setLives(3);
    setComboStreak(0);
    setSessionScore(0);
    setQuestionIndex(0);
    setLivesLostInLevel(0);

    if (isBoss) {
      // Gather 7 varied questions from all 4 operations for the boss
      const mixedQ: ProblemQuestion[] = [
        generateProceduralQuestion(5, 1, 'addition'),
        generateProceduralQuestion(5, 2, 'subtraction'),
        generateProceduralQuestion(5, 2, 'multiplication'),
        generateProceduralQuestion(5, 2, 'division'),
        generateProceduralQuestion(5, 3, 'addition'),
        generateProceduralQuestion(5, 3, 'multiplication'),
        generateProceduralQuestion(5, 3, 'division'),
      ];
      setQuestions(mixedQ);
      setCurrentScreen('boss');
      soundManager.playStart();
    } else {
      const qList = getQuestionsForPhase(phase.id, level, 8);
      setQuestions(qList);
      setCurrentScreen('game');
      soundManager.playStart();
    }
  };

  // Correct answer handler
  const handleCorrectAnswer = (points: number, usedHint: boolean, op: OperationType) => {
    const newStreak = comboStreak + 1;
    setComboStreak(newStreak);

    // Play combo audio at milestones
    if (newStreak === 2 || newStreak === 3 || newStreak >= 5) {
      soundManager.playCombo(newStreak);
    }

    // Update consecutive no hints
    const newNoHints = usedHint ? 0 : consecutiveNoHints + 1;
    setConsecutiveNoHints(newNoHints);

    // Update global report data
    setReportData((prev) => {
      const updated = updateOperationStat(prev, op, true, true, usedHint, false);
      const newBadges = [...updated.unlockedBadges];

      // Check combo badges
      if (newStreak >= 3 && !newBadges.includes('badge-combo-3')) {
        newBadges.push('badge-combo-3');
        soundManager.playBadgeUnlock();
      }
      if (newStreak >= 5 && !newBadges.includes('badge-combo-5')) {
        newBadges.push('badge-combo-5');
        soundManager.playBadgeUnlock();
      }

      // Check no-hint badge
      if (newNoHints >= 3 && !newBadges.includes('badge-no-hint')) {
        newBadges.push('badge-no-hint');
        soundManager.playBadgeUnlock();
      }

      return {
        ...updated,
        totalScore: updated.totalScore + points,
        unlockedBadges: newBadges,
      };
    });

    setSessionScore((prev) => prev + points);
  };

  // Wrong answer handler (Friendly feedback, lose 1 heart)
  const handleWrongAnswer = (op: OperationType) => {
    setComboStreak(0);
    setConsecutiveNoHints(0);
    setLivesLostInLevel((prev) => prev + 1);

    const nextLives = Math.max(0, lives - 1);
    setLives(nextLives);
    soundManager.playHeartLost();

    setReportData((prev) => updateOperationStat(prev, op, false, false, true, true));

    if (nextLives <= 0) {
      setShowGameOverModal(true);
    }
  };

  // Next Question or Level Complete
  const handleNextQuestion = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      // Level completed! Calculate stars
      let stars = 3;
      if (livesLostInLevel >= 2) stars = 1;
      else if (livesLostInLevel === 1) stars = 2;

      setRewardStars(stars);
      setIsGrandMasterVictory(false);

      // Check phase badge and unlocked phases
      setReportData((prev) => {
        const nextUnlocked = new Set(prev.unlockedPhases);
        // Unlock next phase if not already unlocked
        if (activePhase.id < 5) {
          nextUnlocked.add(activePhase.id + 1);
        }

        const newBadges = [...prev.unlockedBadges];
        let newlyUnlockedTitle: string | undefined = undefined;

        // Phase specific badges
        if (activePhase.id === 1 && !newBadges.includes('badge-addition')) {
          newBadges.push('badge-addition');
          newlyUnlockedTitle = 'Mestre da Adição';
        } else if (activePhase.id === 2 && !newBadges.includes('badge-subtraction')) {
          newBadges.push('badge-subtraction');
          newlyUnlockedTitle = 'Mestre da Subtração';
        } else if (activePhase.id === 3 && !newBadges.includes('badge-multiplication')) {
          newBadges.push('badge-multiplication');
          newlyUnlockedTitle = 'Mestre da Multiplicação';
        } else if (activePhase.id === 4 && !newBadges.includes('badge-division')) {
          newBadges.push('badge-division');
          newlyUnlockedTitle = 'Mestre da Divisão';
        }

        // Flawless run badge (3 hearts preserved)
        if (livesLostInLevel === 0 && !newBadges.includes('badge-flawless')) {
          newBadges.push('badge-flawless');
          newlyUnlockedTitle = 'Guardião Imbatível';
        }

        if (newlyUnlockedTitle) {
          setNewBadgeTitle(newlyUnlockedTitle);
          soundManager.playBadgeUnlock();
        } else {
          setNewBadgeTitle(undefined);
        }

        const currentBestStars = prev.phaseStars[activePhase.id] || 0;

        return {
          ...prev,
          unlockedPhases: Array.from(nextUnlocked),
          unlockedBadges: newBadges,
          phaseStars: {
            ...prev.phaseStars,
            [activePhase.id]: Math.max(currentBestStars, stars),
          },
        };
      });

      setShowRewardModal(true);
    }
  };

  // Boss Defeated Handler
  const handleDefeatBoss = () => {
    setRewardStars(3);
    setIsGrandMasterVictory(true);

    setReportData((prev) => {
      const newBadges = [...prev.unlockedBadges];
      if (!newBadges.includes('badge-grand-master')) {
        newBadges.push('badge-grand-master');
      }
      return {
        ...prev,
        phaseStars: {
          ...prev.phaseStars,
          5: 3,
        },
        unlockedBadges: newBadges,
      };
    });

    setNewBadgeTitle('Mestre das Quatro Operações');
    setShowRewardModal(true);
  };

  // Retry from Game Over
  const handleRetry = () => {
    setShowGameOverModal(false);
    setLives(3);
    setComboStreak(0);
    setQuestionIndex(0);
    setLivesLostInLevel(0);
    if (currentScreen === 'boss') {
      const mixedQ: ProblemQuestion[] = [
        generateProceduralQuestion(5, 1, 'addition'),
        generateProceduralQuestion(5, 2, 'subtraction'),
        generateProceduralQuestion(5, 2, 'multiplication'),
        generateProceduralQuestion(5, 2, 'division'),
        generateProceduralQuestion(5, 3, 'addition'),
        generateProceduralQuestion(5, 3, 'multiplication'),
        generateProceduralQuestion(5, 3, 'division'),
      ];
      setQuestions(mixedQ);
    }
  };

  const handleGoToMap = () => {
    setShowRewardModal(false);
    setShowGameOverModal(false);
    setShowReportModal(false);
    setShowTrophyModal(false);
    setCurrentScreen('map');
  };

  // Advance to next level or phase
  const handleNextLevel = () => {
    setShowRewardModal(false);
    if (activeLevel < 3) {
      handleSelectLevel(activePhase, (activeLevel + 1) as DifficultyLevel);
    } else if (activePhase.id < 5) {
      const nextPhase = PHASES.find((p) => p.id === activePhase.id + 1) || PHASES[0];
      handleSelectLevel(nextPhase, 1);
    } else {
      setCurrentScreen('map');
    }
  };

  return (
    <div
      id="app-root-container"
      className={`min-h-screen flex flex-col font-sans select-none ${
        settings.highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 2D/3D Particle Celebration Canvas Layer */}
      <ParticleCanvas />

      {/* Top Main Navigation */}
      <Navbar
        reportData={reportData}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenTrophies={() => setShowTrophyModal(true)}
        onOpenReport={() => setShowReportModal(true)}
        onGoToMap={handleGoToMap}
        currentScreen={currentScreen}
        lives={lives}
        comboStreak={comboStreak}
        currentScore={reportData.totalScore}
      />

      {/* Main Dynamic View */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'map' && (
          <WorldMap
            reportData={reportData}
            onSelectLevel={handleSelectLevel}
            highContrast={settings.highContrast}
          />
        )}

        {currentScreen === 'game' && (
          <GameScreen
            phase={activePhase}
            level={activeLevel}
            questions={questions}
            currentIndex={questionIndex}
            currentScore={reportData.totalScore}
            lives={lives}
            comboStreak={comboStreak}
            settings={settings}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            onNextQuestion={handleNextQuestion}
            onQuitToMap={handleGoToMap}
          />
        )}

        {currentScreen === 'boss' && (
          <BossBattleScreen
            questions={questions}
            currentScore={reportData.totalScore}
            lives={lives}
            comboStreak={comboStreak}
            settings={settings}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            onDefeatBoss={handleDefeatBoss}
            onQuitToMap={handleGoToMap}
          />
        )}
      </main>

      {/* Reward & Level Completed Modal */}
      {showRewardModal && (
        <RewardModal
          phaseName={activePhase.name}
          levelNum={activeLevel}
          starsEarned={rewardStars}
          scoreEarned={sessionScore}
          newBadgeTitle={newBadgeTitle}
          isGrandMaster={isGrandMasterVictory}
          onNextLevel={handleNextLevel}
          onGoToMap={handleGoToMap}
        />
      )}

      {/* Encouraging Game Over / Retry Modal */}
      {showGameOverModal && (
        <GameOverModal onRetry={handleRetry} onGoToMap={handleGoToMap} />
      )}

      {/* Trophy Room Modal */}
      {showTrophyModal && (
        <TrophyRoomModal
          unlockedBadgeIds={reportData.unlockedBadges}
          onClose={() => setShowTrophyModal(false)}
        />
      )}

      {/* Pedagogical Performance Report Modal */}
      {showReportModal && (
        <TeacherReportModal
          reportData={reportData}
          onUpdateReportData={(updated) => setReportData(updated)}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
