
import { BgmMode } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // BGM State
  private isBgmPlaying: boolean = false;
  private currentMode: BgmMode = 'none';
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private tempo: number = 120;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private timerID: number | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
  }

  // --- Sound Effects (SFX) ---

  public playTone(freq: number, type: OscillatorType, duration: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playClick() {
    this.playTone(800, 'sine', 0.05);
  }

  public playSuccess() {
    this.init();
    if (!this.ctx) return;
    this.playTone(600, 'sine', 0.1);
    setTimeout(() => this.playTone(1200, 'square', 0.2), 100);
  }

  public playFail() {
    this.init();
    if (!this.ctx) return;
    this.playTone(300, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.4), 200);
  }

  public playBattleHit() {
    this.playTone(100, 'sawtooth', 0.1);
  }

  public playMoney() {
    this.init();
    if (!this.ctx) return;
    this.playTone(1500, 'square', 0.1);
    setTimeout(() => this.playTone(2000, 'square', 0.1), 100);
  }

  public playLove() {
    this.init();
    if (!this.ctx) return;
    this.playTone(440, 'sine', 0.2);
    setTimeout(() => this.playTone(554, 'sine', 0.2), 200);
    setTimeout(() => this.playTone(659, 'sine', 0.4), 400);
  }

  public playHeartbreak() {
    this.init();
    if (!this.ctx) return;
    this.playTone(400, 'triangle', 0.3);
    setTimeout(() => this.playTone(200, 'triangle', 0.5), 300);
  }

  public playPour() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      // White noise for liquid sound
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
  }

  public playShake() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      // Rhythmic noise burst
      const now = this.ctx.currentTime;
      for(let i=0; i<3; i++) {
          const t = now + i*0.15;
          const osc = this.ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, t);
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t+0.1);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t+0.1);
      }
  }

  // --- BGM Sequencer ---

  public startBgm(mode: BgmMode) {
    if (this.currentMode === mode && this.isBgmPlaying) return;
    
    this.init();
    if (!this.ctx) return;

    this.currentMode = mode;
    this.tempo = mode === 'combat' ? 140 : mode === 'night' ? 110 : 90;
    
    if (!this.isBgmPlaying) {
      this.isBgmPlaying = true;
      this.currentStep = 0;
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduler();
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    this.currentMode = 'none';
    if (this.timerID) window.clearTimeout(this.timerID);
  }

  private scheduler() {
    if (!this.isBgmPlaying || !this.ctx) return;
    
    // While there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.nextNote();
    }
    
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
    this.currentStep++;
    if (this.currentStep === 16) {
      this.currentStep = 0;
    }
  }

  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // --- DAY THEME (Calm, Ambient) ---
    if (this.currentMode === 'day') {
       // Simple arpeggio on pentatonic scale
       const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // C D E G A
       if (step % 4 === 0) {
           // Pad / Chord
           const osc = this.ctx.createOscillator();
           const gain = this.ctx.createGain();
           osc.type = 'sine';
           osc.frequency.value = scale[Math.floor(Math.random() * scale.length)] / 2;
           gain.gain.setValueAtTime(0.05, time);
           gain.gain.linearRampToValueAtTime(0, time + 2);
           osc.connect(gain);
           gain.connect(this.masterGain);
           osc.start(time);
           osc.stop(time + 2);
       }
       if (Math.random() > 0.6) {
           // Random twinkles
           const osc = this.ctx.createOscillator();
           const gain = this.ctx.createGain();
           osc.type = 'triangle';
           osc.frequency.value = scale[Math.floor(Math.random() * scale.length)] * 2;
           gain.gain.setValueAtTime(0.02, time);
           gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
           osc.connect(gain);
           gain.connect(this.masterGain);
           osc.start(time);
           osc.stop(time + 0.5);
       }
    }

    // --- NIGHT THEME (Synthwave, Driving) ---
    else if (this.currentMode === 'night') {
        // Kick Drum (4/4)
        if (step % 4 === 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.5);
        }
        
        // Bassline (Offbeat)
        if (step % 4 === 2) {
             const osc = this.ctx.createOscillator();
             const gain = this.ctx.createGain();
             osc.type = 'sawtooth';
             osc.frequency.value = 65.41; // C2
             // Lowpass filter simulation (soften saw)
             gain.gain.setValueAtTime(0.1, time);
             gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
             osc.connect(gain);
             gain.connect(this.masterGain);
             osc.start(time);
             osc.stop(time + 0.4);
        }

        // Hihat (16ths)
        if (step % 2 === 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square'; // pseudo noise
            // actually just high freq square usually sounds cheap but works for 8-bit feel
            osc.frequency.value = 4000; 
            gain.gain.setValueAtTime(0.02, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.05);
        }
    }

    // --- COMBAT THEME (Fast, Urgent) ---
    else if (this.currentMode === 'combat') {
        // Rapid Bass
        if (step % 2 === 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = step % 4 === 0 ? 110 : 103.83; // A2 then G#2 (dissonant)
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.linearRampToValueAtTime(0, time + 0.1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.1);
        }
        // Random Arp
        if (Math.random() > 0.3) {
             const osc = this.ctx.createOscillator();
             const gain = this.ctx.createGain();
             osc.type = 'sawtooth';
             osc.frequency.value = 440 + Math.random() * 440;
             gain.gain.setValueAtTime(0.05, time);
             gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
             osc.connect(gain);
             gain.connect(this.masterGain);
             osc.start(time);
             osc.stop(time + 0.1);
        }
    }
  }
}

export const audioService = new AudioService();
