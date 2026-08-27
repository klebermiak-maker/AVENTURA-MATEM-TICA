/**
 * Web Audio API synthesizer for rich, lag-free sound effects,
 * cheerful background music, and Web Speech API narration in Brazilian Portuguese.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private speechVoice: SpeechSynthesisVoice | null = null;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Lazy init audio context on first user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initContext();
        if (this.musicEnabled && !this.isBgmPlaying) {
          this.startBackgroundMusic();
        }
      };
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
      this.initVoice();
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private initVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Look for pt-BR voice
        const ptVoice =
          voices.find((v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR')) ||
          voices.find((v) => v.lang.startsWith('pt'));
        if (ptVoice) {
          this.speechVoice = ptVoice;
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  public playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    delay = 0,
    gainLevel = 0.2,
    pitchEnd?: number
  ) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      if (pitchEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(10, pitchEnd),
          this.ctx.currentTime + delay + duration
        );
      }

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(gainLevel, this.ctx.currentTime + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch {
      // Ignore audio context scheduling errors
    }
  }

  // 1. Som de Início de Partida (Fanfarra alegre)
  public playStart() {
    if (!this.soundEnabled) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4, E4, G4, C5, E5
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.16, idx * 0.07, 0.22);
    });
  }

  // 2. Som de Resposta / Operação Correta (Chime brilhante)
  public playCorrect() {
    if (!this.soundEnabled) return;
    // Multi-voice sparkly chords
    this.playTone(523.25, 'sine', 0.12, 0, 0.25); // C5
    this.playTone(659.25, 'triangle', 0.14, 0.06, 0.25); // E5
    this.playTone(783.99, 'sine', 0.2, 0.12, 0.28); // G5
    this.playTone(1046.5, 'sine', 0.35, 0.18, 0.3); // C6
    this.playTone(1318.51, 'triangle', 0.45, 0.25, 0.2); // E6
  }

  // 3. Som de Dica Pedagógica
  public playHint() {
    if (!this.soundEnabled) return;
    this.playTone(440, 'triangle', 0.15, 0, 0.2);
    this.playTone(554.37, 'triangle', 0.22, 0.08, 0.22);
    this.playTone(659.25, 'sine', 0.3, 0.16, 0.22);
  }

  // 4. Som de Erro Amigável / Quase lá
  public playWrong() {
    if (!this.soundEnabled) return;
    this.playTone(330, 'sawtooth', 0.16, 0, 0.15, 280);
    this.playTone(260, 'sawtooth', 0.25, 0.12, 0.15, 200);
  }

  // 5. Som de Perda de Coração / Vida
  public playHeartLost() {
    if (!this.soundEnabled) return;
    this.playTone(392, 'sawtooth', 0.15, 0, 0.2, 300);
    this.playTone(293.66, 'sawtooth', 0.25, 0.1, 0.22, 180);
    this.playTone(196, 'triangle', 0.35, 0.22, 0.25, 120);
  }

  // 6. Som de Coleta de Moedas / Pontos
  public playCoin() {
    if (!this.soundEnabled) return;
    this.playTone(987.77, 'sine', 0.08, 0, 0.25); // B5
    this.playTone(1318.51, 'sine', 0.22, 0.06, 0.28); // E6
  }

  // 7. Som de Combo Flamejante
  public playCombo(comboLevel: number) {
    if (!this.soundEnabled) return;
    const baseFreq = 400 + Math.min(comboLevel * 90, 600);
    this.playTone(baseFreq, 'triangle', 0.1, 0, 0.25);
    this.playTone(baseFreq * 1.25, 'triangle', 0.12, 0.05, 0.25);
    this.playTone(baseFreq * 1.5, 'sine', 0.18, 0.1, 0.3);
    this.playTone(baseFreq * 2, 'sine', 0.3, 0.16, 0.35);
  }

  // 8. Som de Passagem de Fase / Baú Aberto
  public playLevelPass() {
    if (!this.soundEnabled) return;
    const melody = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51];
    melody.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.22, idx * 0.09, 0.25);
    });
    this.playTone(1046.5, 'sine', 0.5, 0.6, 0.3);
  }

  // 9. Som de Conquista de Medalha
  public playBadgeUnlock() {
    if (!this.soundEnabled) return;
    this.playTone(440, 'sine', 0.12, 0, 0.2);
    this.playTone(554.37, 'sine', 0.12, 0.08, 0.22);
    this.playTone(659.25, 'sine', 0.14, 0.16, 0.25);
    this.playTone(880, 'sine', 0.22, 0.24, 0.3);
    this.playTone(1108.73, 'triangle', 0.45, 0.34, 0.35);
  }

  // 10. Som de Ataque / Dano no Boss (Monstro da Confusão)
  public playBossHit() {
    if (!this.soundEnabled) return;
    this.playTone(120, 'sawtooth', 0.18, 0, 0.35, 60);
    this.playTone(280, 'square', 0.16, 0.04, 0.28, 140);
    this.playTone(560, 'triangle', 0.28, 0.1, 0.3);
  }

  // 11. Fanfarra de Vitória Final (Grand Master)
  public playVictory() {
    if (!this.soundEnabled) return;
    const chords = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.1 },
      { f: 783.99, t: 0.2 },
      { f: 1046.5, t: 0.32 },
      { f: 880, t: 0.48 },
      { f: 1046.5, t: 0.62 },
      { f: 1318.51, t: 0.78 },
      { f: 1567.98, t: 0.98 },
    ];
    chords.forEach((c) => {
      this.playTone(c.f, 'triangle', 0.35, c.t, 0.3);
    });
  }

  // 12. Som de clique no botão
  public playClick() {
    if (!this.soundEnabled) return;
    this.playTone(580, 'sine', 0.04, 0, 0.12);
  }

  // 13. Cheerful Melodic Background Music Generator (Gentle Lofi Chimes)
  public startBackgroundMusic() {
    if (!this.musicEnabled || this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;

    // Friendly, soothing pentatonic scale in C major for children
    const melodyNotes = [
      261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 440.0, 392.0,
      329.63, 261.63, 392.0, 523.25, 659.25, 523.25, 392.0, 261.63,
    ];
    const bassNotes = [130.81, 164.81, 196.0, 130.81];

    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.soundEnabled) return;
      const note = melodyNotes[this.bgmStep % melodyNotes.length];
      const bass = bassNotes[Math.floor((this.bgmStep / 4) % bassNotes.length)];

      // Subtle, gentle music volume (0.04 - 0.05) so it never disturbs speech
      this.playTone(note, 'sine', 0.28, 0, 0.035);
      if (this.bgmStep % 4 === 0) {
        this.playTone(bass, 'triangle', 0.45, 0, 0.045);
      }

      this.bgmStep++;
    }, 450);
  }

  public stopBackgroundMusic() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }

  // Web Speech API Narration in PT-BR
  public speakText(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop prior speech

    // Clean text of emojis before reading
    const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.94; // Slightly slower, very clear for 3rd grade children
    utterance.pitch = 1.08; // Friendly and cheerful tone

    if (this.speechVoice) {
      utterance.voice = this.speechVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundManager = new SoundManager();

