import { Injectable, signal } from '@angular/core';

/** Haptic kinds, mirroring UIKit's feedback generators. */
export type Haptic = 'selection' | 'light' | 'medium' | 'success' | 'warning' | 'error';
export type Sound = 'success' | 'error';

const HAPTICS_KEY = 'feedback.haptics';
const SOUNDS_KEY = 'feedback.sounds';

/** Android (Vibration API) patterns, in ms. */
const VIBRATION: Record<Haptic, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 18,
  success: [12, 70, 18],
  warning: [22, 90, 22],
  error: [30, 60, 30, 60, 30],
};

/** iPhone: how many Taptic ticks (and the gap between them) stand in for each kind. */
const IOS_TICKS: Record<Haptic, { count: number; gap: number }> = {
  selection: { count: 1, gap: 0 },
  light: { count: 1, gap: 0 },
  medium: { count: 1, gap: 0 },
  success: { count: 2, gap: 110 },
  warning: { count: 2, gap: 160 },
  error: { count: 3, gap: 90 },
};

/**
 * iOS-style haptic and sound feedback, used the way Apple uses it: ticks on
 * selection changes, a bump when something pops up, success / warning /
 * error patterns — never on plain button taps. Sounds are rare signature
 * moments only, off unless switched on in Settings.
 *
 * iPhone has no Vibration API. Safari (iOS 18+) plays the system haptic when
 * an `<input type="checkbox" switch>` is toggled, so a hidden one is toggled
 * from code. It only gives one kind of light tick, and only during a user
 * gesture; elsewhere it's a silent no-op.
 */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly hapticsOn = signal(read(HAPTICS_KEY, true));
  readonly soundsOn = signal(read(SOUNDS_KEY, false));

  private audio: AudioContext | null = null;
  private lastTick = 0;

  setHaptics(on: boolean): void {
    this.hapticsOn.set(on);
    write(HAPTICS_KEY, on);
    if (on) this.haptic('selection');
  }

  setSounds(on: boolean): void {
    this.soundsOn.set(on);
    write(SOUNDS_KEY, on);
    if (on) this.sound('success');
  }

  haptic(kind: Haptic): void {
    if (!this.hapticsOn()) return;
    if (typeof navigator.vibrate === 'function' && !isIos()) {
      navigator.vibrate(VIBRATION[kind]);
      return;
    }
    const { count, gap } = IOS_TICKS[kind];
    for (let i = 0; i < count; i++) {
      if (i === 0) this.iosTick();
      else setTimeout(() => this.iosTick(), gap * i);
    }
  }

  /** A short synthesized cue (no audio files). Quiet in silent mode on iPhone. */
  sound(kind: Sound): void {
    if (!this.soundsOn()) return;
    const ctx = this.audioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    if (kind === 'success') {
      // Soft two-note "pop", like a sent message.
      this.tone(ctx, 880, now, 0.07, 0.07);
      this.tone(ctx, 1320, now + 0.06, 0.09, 0.06);
    } else {
      // Low double "bonk".
      this.tone(ctx, 300, now, 0.09, 0.08);
      this.tone(ctx, 220, now + 0.11, 0.12, 0.08);
    }
  }

  private iosTick(): void {
    // Several ticks within a few ms collapse into one; space them out.
    const now = performance.now();
    if (now - this.lastTick < 40) return;
    this.lastTick = now;
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    label.remove();
  }

  private audioContext(): AudioContext | null {
    if (this.audio) return this.audio;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    // Safari 17+: "ambient" follows the ring / silent switch, like native app sounds.
    const session = (navigator as any).audioSession;
    if (session) {
      try {
        session.type = 'ambient';
      } catch {
        /* older Safari */
      }
    }
    this.audio = new Ctor();
    return this.audio;
  }

  private tone(ctx: AudioContext, frequency: number, start: number, length: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + length + 0.02);
  }
}

function isIos(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function read(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
}

function write(key: string, on: boolean): void {
  try {
    localStorage.setItem(key, on ? '1' : '0');
  } catch {
    /* storage unavailable: setting lasts this session */
  }
}
