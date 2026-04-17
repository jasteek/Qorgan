// ═══════════════════════════════════════════════════════════
// QORGAN SOUND SERVICE — Web Audio API Sound Engine
// ═══════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) {
    // Silently fail if audio not supported
  }
}

/** SOS Morse Code Pattern: ... --- ... */
export function playSOSAlarm() {
  try {
    const ctx = getAudioCtx();
    let t = ctx.currentTime + 0.05;
    const dot = 0.15;
    const dash = 0.45;
    const gap = 0.12;
    const letterGap = 0.35;

    // S: ...
    for (let i = 0; i < 3; i++) {
      playTone(880, t, dot, 'square', 0.35);
      t += dot + gap;
    }
    t += letterGap;
    // O: ---
    for (let i = 0; i < 3; i++) {
      playTone(660, t, dash, 'square', 0.35);
      t += dash + gap;
    }
    t += letterGap;
    // S: ...
    for (let i = 0; i < 3; i++) {
      playTone(880, t, dot, 'square', 0.35);
      t += dot + gap;
    }
  } catch (e) {}
}

/** UI Click — subtle tap */
export function playUIClick() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    playTone(1200, t, 0.04, 'sine', 0.08);
  } catch (e) {}
}

/** Breath In — ascending soft tone */
export function playBreathIn() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 3);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3.5);
  } catch (e) {}
}

/** Breath Hold — steady soft pad */
export function playBreathHold() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.06, ctx.currentTime + 3.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 4.2);
  } catch (e) {}
}

/** Breath Out — descending soft tone */
export function playBreathOut() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 4.5);
  } catch (e) {}
}

/** Success chime — pleasant 3-note rising arpeggio */
export function playSuccess() {
  try {
    const ctx = getAudioCtx();
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      playTone(freq, ctx.currentTime + i * 0.18, 0.4, 'sine', 0.2);
    });
  } catch (e) {}
}

/** Notification bell */
export function playNotification() {
  try {
    const ctx = getAudioCtx();
    playTone(987, ctx.currentTime, 0.15, 'sine', 0.2);
    playTone(1318, ctx.currentTime + 0.18, 0.3, 'sine', 0.15);
  } catch (e) {}
}

let bgMusic: HTMLAudioElement | null = null;
export function toggleBackgroundMusic() {
  if (!bgMusic) {
    // Royalty free calming lofi/ambient track
    bgMusic = new Audio("https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
  }
  
  if (bgMusic.paused) {
    bgMusic.play().catch(e => console.error("Audio play failed", e));
  } else {
    bgMusic.pause();
  }
}

