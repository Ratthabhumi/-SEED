// Procedural Web Audio SFX — original synthesized sounds, no external assets.
export class Sfx {
  private ctx: AudioContext | null = null;
  private volume = 0.6;

  setVolume(v: number): void {
    this.volume = Math.min(1, Math.max(0, v));
  }

  /** Must be called from a user gesture at least once (browser autoplay policy). */
  unlock(): void {
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain = 0.2, slide = 0): void {
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slide !== 0) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
      g.gain.setValueAtTime(gain * this.volume, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  hit(): void { this.tone(220, 0.07, "square", 0.10, -80); }
  kill(): void { this.tone(330, 0.12, "sawtooth", 0.12, -180); }
  pickup(): void { this.tone(660, 0.08, "sine", 0.10, 220); }
  levelup(): void { this.tone(523, 0.16, "triangle", 0.18, 260); }
  select(): void { this.tone(440, 0.12, "triangle", 0.16, 120); }
  dash(): void { this.tone(180, 0.14, "sine", 0.14, 240); }
  age(): void { this.tone(392, 0.5, "triangle", 0.2, 392); }
  boss(): void { this.tone(110, 0.6, "sawtooth", 0.2, -40); }
  ascend(): void { this.tone(523, 0.8, "sine", 0.2, 523); }
  hurt(): void { this.tone(140, 0.15, "square", 0.14, -60); }
}

export const sfx = new Sfx();
