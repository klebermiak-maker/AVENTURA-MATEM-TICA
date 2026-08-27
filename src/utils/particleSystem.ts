// Particle Engine for Dynamic Canvas Celebrations: Coins, Sparkles, Stars, and Confetti

export type ParticleType = 'coin' | 'sparkle' | 'confetti' | 'star' | 'dust';

export interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  secondaryColor?: string;
  rotation: number;
  vRotation: number;
  flipAngle: number;
  vFlip: number;
  alpha: number;
  decay: number;
  gravity: number;
  drag: number;
  sparklePhase?: number;
}

class ParticleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animId: number | null = null;
  private nextId = 1;
  private width = 0;
  private height = 0;

  constructor() {
    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    if (!this.animId) {
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  public destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }

  private handleResize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // --- CELEBRATION PRESETS ---

  // 1. Acerto de Operação (Step 1): Brilhos mágicos e confetes leves
  public burstCorrectOperation(x?: number, y?: number) {
    const originX = x ?? this.width / 2;
    const originY = y ?? this.height * 0.55;

    this.spawnSparkles(originX, originY, 20);
    this.spawnConfetti(originX, originY, 25);
    this.spawnCoins(originX, originY, 4);
  }

  // 2. Acerto do Cálculo (Step 2): Chuva de moedas douradas 3D saltando, estrelas e confetes
  public burstCorrectCalculation(x?: number, y?: number, bonus = false) {
    const originX = x ?? this.width / 2;
    const originY = y ?? this.height * 0.55;

    // Coins jumping high in an arc
    this.spawnCoins(originX, originY, bonus ? 16 : 10);
    // Radiating sparkles
    this.spawnSparkles(originX, originY, 30);
    // Colorful confetti
    this.spawnConfetti(originX - 100, originY, 30, -Math.PI / 3);
    this.spawnConfetti(originX + 100, originY, 30, -Math.PI / 1.5);
  }

  // 3. Golpe no Chefe (Boss Battle Hit)
  public burstBossHit(x?: number, y?: number) {
    const originX = x ?? this.width / 2;
    const originY = y ?? this.height * 0.4;

    this.spawnSparkles(originX, originY, 35, ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981']);
    this.spawnCoins(originX, originY, 8);
    this.spawnConfetti(originX, originY, 40);
  }

  // 4. Conclusão de Nível / Vitória Suprema (Reward Modal)
  public burstLevelVictory() {
    const centerX = this.width / 2;
    const centerY = this.height * 0.45;

    // Side cannons of coins and confetti
    this.spawnCoins(this.width * 0.2, this.height * 0.7, 12, -Math.PI / 3);
    this.spawnCoins(this.width * 0.8, this.height * 0.7, 12, -Math.PI / 1.5);
    this.spawnCoins(centerX, centerY, 15);

    this.spawnSparkles(centerX, centerY, 40);
    this.spawnConfetti(this.width * 0.2, this.height * 0.7, 50, -Math.PI / 3);
    this.spawnConfetti(this.width * 0.8, this.height * 0.7, 50, -Math.PI / 1.5);

    // Follow-up bursts for continuous celebration
    setTimeout(() => {
      this.spawnCoins(centerX, centerY - 50, 10);
      this.spawnSparkles(centerX, centerY - 50, 25);
    }, 400);

    setTimeout(() => {
      this.spawnConfetti(centerX - 150, centerY, 35);
      this.spawnConfetti(centerX + 150, centerY, 35);
    }, 800);
  }

  // --- PARTICLE EMITTERS ---

  public spawnCoins(x: number, y: number, count = 8, baseAngle?: number) {
    for (let i = 0; i < count; i++) {
      const angle = baseAngle !== undefined
        ? baseAngle + (Math.random() - 0.5) * 0.8
        : -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 9 + Math.random() * 8;

      this.particles.push({
        id: this.nextId++,
        type: 'coin',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 14 + Math.random() * 8, // Coin radius
        color: '#F59E0B',
        secondaryColor: '#FDE047',
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.1,
        flipAngle: Math.random() * Math.PI,
        vFlip: 0.12 + Math.random() * 0.15, // 3D Coin spin speed
        alpha: 1,
        decay: 0.008 + Math.random() * 0.006,
        gravity: 0.35,
        drag: 0.985,
      });
    }
  }

  public spawnSparkles(x: number, y: number, count = 20, colors?: string[]) {
    const palette = colors || ['#FDE047', '#38BDF8', '#F472B6', '#34D399', '#A78BFA', '#FBBF24'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      const color = palette[Math.floor(Math.random() * palette.length)];

      this.particles.push({
        id: this.nextId++,
        type: 'sparkle',
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 10,
        color: color,
        rotation: Math.random() * Math.PI,
        vRotation: (Math.random() - 0.5) * 0.2,
        flipAngle: 0,
        vFlip: 0,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.015,
        gravity: 0.08,
        drag: 0.95,
        sparklePhase: Math.random() * Math.PI * 2,
      });

      // Spawn subtle dust trail
      if (Math.random() > 0.4) {
        this.particles.push({
          id: this.nextId++,
          type: 'dust',
          x: x + (Math.random() - 0.5) * 25,
          y: y + (Math.random() - 0.5) * 25,
          vx: Math.cos(angle) * (speed * 0.5),
          vy: Math.sin(angle) * (speed * 0.5),
          size: 2 + Math.random() * 3,
          color: '#FEF08A',
          rotation: 0,
          vRotation: 0,
          flipAngle: 0,
          vFlip: 0,
          alpha: 0.9,
          decay: 0.025 + Math.random() * 0.02,
          gravity: 0.05,
          drag: 0.93,
        });
      }
    }
  }

  public spawnConfetti(x: number, y: number, count = 25, baseAngle?: number) {
    const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'];
    for (let i = 0; i < count; i++) {
      const angle = baseAngle !== undefined
        ? baseAngle + (Math.random() - 0.5) * 1.0
        : -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 7 + Math.random() * 9;
      const color = palette[Math.floor(Math.random() * palette.length)];

      this.particles.push({
        id: this.nextId++,
        type: 'confetti',
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 6,
        color: color,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.15,
        flipAngle: Math.random() * Math.PI * 2,
        vFlip: 0.08 + Math.random() * 0.15,
        alpha: 1,
        decay: 0.009 + Math.random() * 0.008,
        gravity: 0.22,
        drag: 0.97,
      });
    }
  }

  // --- RENDER LOOP ---

  private loop() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        // Update physics
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRotation;
        p.flipAngle += p.vFlip;
        p.alpha -= p.decay;

        if (p.sparklePhase !== undefined) {
          p.sparklePhase += 0.15;
        }

        if (p.alpha <= 0 || p.y > this.height + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        // Draw particle
        this.renderParticle(p);
      }
    }

    this.animId = requestAnimationFrame(this.loop);
  }

  private renderParticle(p: Particle) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    switch (p.type) {
      case 'coin':
        this.draw3DCoin(ctx, p);
        break;
      case 'sparkle':
        this.drawSparkle(ctx, p);
        break;
      case 'confetti':
        this.drawConfetti(ctx, p);
        break;
      case 'dust':
        this.drawDust(ctx, p);
        break;
    }

    ctx.restore();
  }

  // Draw 3D Spinning Gold Coin with Metallic Gradient & Star Stamp
  private draw3DCoin(ctx: CanvasRenderingContext2D, p: Particle) {
    const scaleX = Math.cos(p.flipAngle);
    ctx.scale(scaleX, 1);

    const radius = p.size;

    // Outer Rim / Shadow
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#D97706';
    ctx.fill();

    // Inner Gold Gradient Face
    const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#B45309');

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center Star Symbol ⭐ on Coin
    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    const spikes = 5;
    const outerR = radius * 0.38;
    const innerR = radius * 0.18;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      let x = Math.cos(rot) * outerR;
      let y = Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerR;
      y = Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(0, -outerR);
    ctx.closePath();
    ctx.fill();

    // Specular Highlight Glint
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();
  }

  // Draw 4-Pointed Radiating Magic Sparkle Star
  private drawSparkle(ctx: CanvasRenderingContext2D, p: Particle) {
    const pulse = p.sparklePhase ? 0.8 + 0.3 * Math.sin(p.sparklePhase) : 1;
    const r = p.size * pulse;

    // Glowing core
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    // Concave 4-pointed star
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill();

    // Bright white center
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw 3D Flipping Confetti Ribbon / Rectangle
  private drawConfetti(ctx: CanvasRenderingContext2D, p: Particle) {
    const scaleY = Math.sin(p.flipAngle);
    ctx.scale(1, scaleY);

    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
  }

  // Draw Magic Dust particle
  private drawDust(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const particleEngine = new ParticleEngine();
