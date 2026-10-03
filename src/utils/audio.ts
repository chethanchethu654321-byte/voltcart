import confetti from 'canvas-confetti';

// Sound effect toggle preference stored in localStorage
let isSoundEnabled = true;

try {
  const saved = localStorage.getItem('voltcart_sound_enabled');
  if (saved !== null) {
    isSoundEnabled = saved === 'true';
  }
} catch {
  isSoundEnabled = true;
}

export const getSoundEnabled = () => isSoundEnabled;

export const setSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
  try {
    localStorage.setItem('voltcart_sound_enabled', String(enabled));
  } catch {
    // ignore
  }
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a sparkling, delightful "Add to Cart" sound
 * Rising dual chime with sweet harmonics
 */
export function playAddToCartSound() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // slides up to A5

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: Harmonious sparkle chord slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.06); // D6 sparkle
    osc2.frequency.exponentialRampToValueAtTime(1479.98, now + 0.18); // F#6

    gain2.gain.setValueAtTime(0.01, now + 0.06);
    gain2.gain.linearRampToValueAtTime(0.14, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.06);
    osc2.stop(now + 0.38);
  } catch {
    // audio fallback silent
  }
}

/**
 * Play an energetic, authoritative "Buy Now" sound
 * Confident power sweep with warm bass resonance
 */
export function playBuyNowSound() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Sub thump
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(150, now);
    sub.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.25);

    // Bright electric zap chime
    const chordNotes = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.01, noteStart);
      gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.35);
    });
  } catch {
    // audio fallback silent
  }
}

/**
 * Play celebratory order placed fanfare
 */
export function playOrderSuccessSound() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const fanfare = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.1 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let offset = 0;
    fanfare.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + item.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + item.d);
      offset += 0.09;
    });
  } catch {
    // ignore
  }
}

/**
 * Trigger confetti explosion at specific coordinates or screen center
 */
export function triggerCartConfetti(e?: React.MouseEvent) {
  let x = 0.5;
  let y = 0.5;

  if (e) {
    x = e.clientX / window.innerWidth;
    y = e.clientY / window.innerHeight;
  }

  try {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x, y },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#6366f1'],
      ticks: 200,
      gravity: 1.2,
      scalar: 0.85,
    });
  } catch {
    // fallback
  }
}

export function triggerBuyNowConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981', '#fbbf24', '#06b6d4', '#6366f1'],
    });
  } catch {
    // fallback
  }
}
