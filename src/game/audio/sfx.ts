// Procedural Web Audio SFX — original synthesized sounds, no external assets.
export class Sfx {
  private ctx: AudioContext | null = null;
  private volume = 0.6;
  private voices=new Set<OscillatorNode>();
  private lastTone=new Map<string,number>();

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
      const key=freq+":"+type;
      if(this.voices.size>=8 || t0-(this.lastTone.get(key)??-Infinity)<0.05 || this.volume===0)return;
      this.lastTone.set(key,t0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slide !== 0) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
      g.gain.setValueAtTime(0.0001,t0);
      g.gain.linearRampToValueAtTime(Math.min(0.12,gain)*this.volume,t0+0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(this.ctx.destination);
      this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  enemyAttack(kind:"rush"|"burst"):void {this.tone(kind==="rush"?160:360,0.06,"square",0.05,-60);}
  enemyWarning(kind:"rush"|"burst"):void {this.tone(kind==="rush"?240:520,0.16,"triangle",0.08,kind==="rush"?-80:100);}
  energy():void {this.tone(900,0.08,"sine",0.06,180);}
  weapon(family:"kinetic"|"energy"|"defense"|"field",origin=""):void {
    if(family==="kinetic")this.tone(origin==="hunters"?230:170,.06,origin==="hunters"?"triangle":"sawtooth",.055,-110);
    else if(family==="defense")this.tone(480,.1,"triangle",.05,120);
    else if(family==="field")this.tone(95,.18,"sawtooth",.06,-65);
    else if(origin==="sentinels")this.tone(560,.1,"triangle",.05,-260);
    else this.energy();
  }
  beam(energy: boolean): void {
    this.tone(energy ? 720 : 190, 0.1, energy ? "triangle" : "sawtooth", 0.06, energy ? -480 : -100);
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
  /** Breakthrough reward beat: bright two-tone chime (original). */
  breakthrough(): void { this.tone(523, 0.12, "triangle", 0.2, 0); this.tone(784, 0.22, "triangle", 0.2, 0); }
  /** Age-transition sting: rising two-tone fanfare (original). */
  ageSting(): void { this.tone(392, 0.15, "triangle", 0.22, 196); this.tone(587, 0.28, "triangle", 0.2, 196); }
}

export const sfx = new Sfx();
