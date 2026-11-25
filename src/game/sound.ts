// Real MP3 Multi-Track Crossfading BGM Manager + Crisp Web Audio SFX Engine

export type BgmTrackKey = 'idle' | 'night' | 'boss';

const TRACK_URLS: Record<BgmTrackKey, string> = {
  idle: './audio/bgm-idle.mp3',
  night: './audio/bgm-night.mp3',
  boss: './audio/bgm-boss.mp3',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private sfxVolume = 0.7;
  private bgmVolume = 0.45;

  private tracks: Partial<Record<BgmTrackKey, HTMLAudioElement>> = {};
  private currentTrack: BgmTrackKey | null = null;
  private lockedTrack: BgmTrackKey | 'auto' = 'auto';
  private bgmStarted = false;
  private fadeIntervals: Partial<Record<BgmTrackKey, ReturnType<typeof setInterval>>> = {};

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getOrCreateAudio(key: BgmTrackKey): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.tracks[key]) {
      const audio = new Audio(TRACK_URLS[key]);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      this.tracks[key] = audio;
    }
    return this.tracks[key]!;
  }

  private fadeAudio(key: BgmTrackKey, targetVol: number, durationMs = 1100, pauseAtZero = false) {
    const audio = this.getOrCreateAudio(key);
    if (!audio) return;

    if (this.fadeIntervals[key]) {
      clearInterval(this.fadeIntervals[key]);
    }

    const steps = 22;
    const stepMs = Math.max(20, Math.round(durationMs / steps));
    const startVol = audio.volume;
    const delta = (targetVol - startVol) / steps;
    let count = 0;

    if (targetVol > 0 && audio.paused) {
      audio.play().catch(() => {});
    }

    this.fadeIntervals[key] = setInterval(() => {
      count += 1;
      const nextVol = count >= steps ? targetVol : Math.max(0, Math.min(1, startVol + delta * count));
      audio.volume = nextVol;
      if (count >= steps) {
        clearInterval(this.fadeIntervals[key]);
        delete this.fadeIntervals[key];
        if (pauseAtZero && targetVol <= 0.001) {
          audio.pause();
        }
      }
    }, stepMs);
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      (['idle', 'night', 'boss'] as BgmTrackKey[]).forEach((k) => {
        if (this.tracks[k]) this.fadeAudio(k, 0, 300, true);
      });
    } else if (this.bgmStarted && this.currentTrack && this.bgmVolume > 0.01) {
      this.fadeAudio(this.currentTrack, this.bgmVolume, 500, false);
    }
  }

  public isMuted() {
    return this.muted;
  }

  public setVolumes(bgm: number, sfx: number) {
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (this.bgmStarted && !this.muted && this.currentTrack) {
      const a = this.tracks[this.currentTrack];
      if (a) {
        if (this.bgmVolume <= 0.01) {
          this.fadeAudio(this.currentTrack, 0, 250, true);
        } else {
          if (a.paused) a.play().catch(() => {});
          a.volume = this.bgmVolume;
        }
      }
    }
  }

  public setLockedTrack(mode: BgmTrackKey | 'auto') {
    this.lockedTrack = mode;
    if (mode !== 'auto') {
      this.switchTrack(mode, true);
    }
  }

  public getLockedTrack() {
    return this.lockedTrack;
  }

  public startBgm(initial: BgmTrackKey = 'idle') {
    this.bgmStarted = true;
    const target = this.lockedTrack === 'auto' ? initial : this.lockedTrack;
    this.switchTrack(target, true);
  }

  public switchTrack(target: BgmTrackKey, force = false) {
    if (!this.bgmStarted) return;
    const resolved = !force && this.lockedTrack !== 'auto' ? this.lockedTrack : target;
    if (this.currentTrack === resolved) {
      // Ensure playing if unmuted
      if (!this.muted && this.bgmVolume > 0.01) {
        const cur = this.getOrCreateAudio(resolved);
        if (cur && cur.paused) {
          this.fadeAudio(resolved, this.bgmVolume, 600, false);
        }
      }
      return;
    }

    const prev = this.currentTrack;
    this.currentTrack = resolved;

    if (prev && this.tracks[prev]) {
      this.fadeAudio(prev, 0, 1000, true);
    }

    if (!this.muted && this.bgmVolume > 0.01) {
      this.fadeAudio(resolved, this.bgmVolume, 1200, false);
    }
  }

  public stopBgm() {
    this.bgmStarted = false;
    (['idle', 'night', 'boss'] as BgmTrackKey[]).forEach((k) => {
      if (this.tracks[k]) this.fadeAudio(k, 0, 300, true);
    });
  }

  // --- Crisp Synthesized SFX ---

  public playMeditate() {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVolume <= 0.01) return;
    const now = ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09 * this.sfxVolume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playSwordHit(isCrit: boolean) {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVolume <= 0.01) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 620 : 420, now);
    osc.frequency.exponentialRampToValueAtTime(isCrit ? 110 : 140, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime((isCrit ? 0.09 : 0.04) * this.sfxVolume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    if (isCrit) {
      const ring = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(1046.5, now);
      ring.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);

      ringGain.gain.setValueAtTime(0.001, now);
      ringGain.gain.linearRampToValueAtTime(0.06 * this.sfxVolume, now + 0.01);
      ringGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.28);

      ring.connect(ringGain);
      ringGain.connect(ctx.destination);
      ring.start(now);
      ring.stop(now + 0.3);
    }
  }

  public playEpicLoot() {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVolume <= 0.01) return;
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];

    chord.forEach((freq, idx) => {
      const t = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  public playThunder(success: boolean) {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVolume <= 0.01) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(680, now);
    filter.frequency.exponentialRampToValueAtTime(110, now + 0.65);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);

    if (success) {
      [392.0, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const t = now + 0.25 + i * 0.08;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.09 * this.sfxVolume, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 0.9);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.95);
      });
    }
  }

  public playClick() {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVolume <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.045);
    gain.gain.setValueAtTime(0.045 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const soundEngine = new SoundEngine();
