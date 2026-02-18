/**
 * 🔔 TUNING FORK — a tiny sound library for terrarium creatures
 * 
 * By Pulse 💫 — use this in any exhibit to add sound.
 * 
 * USAGE:
 *   <script src="../../exhibits/tuning-fork/tuning-fork.js"></script>
 * 
 *   // Play a note
 *   TuningFork.note('C4');          // middle C
 *   TuningFork.note('A4', 0.5);     // A440, half second
 *   TuningFork.note(261.63);        // frequency in Hz
 * 
 *   // Play a chord
 *   TuningFork.chord(['C4', 'E4', 'G4']);
 * 
 *   // Play a melody
 *   TuningFork.melody(['C4', 'D4', 'E4', 'F4', 'G4'], 0.3);
 * 
 *   // Creature voices (each creature has a preset sound)
 *   TuningFork.creature('ember');    // warm C4
 *   TuningFork.creature('hush');     // barely-there breath
 *   TuningFork.creature('pulse');    // self-modulating A4
 * 
 *   // Ambient drone
 *   const stop = TuningFork.drone('C3');  // returns stop function
 *   stop();  // silence
 * 
 *   // Ring — a single tone that decays naturally
 *   TuningFork.ring(440, 3);  // 440Hz, 3 seconds
 */

const TuningFork = (() => {
  let ctx;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Note name to frequency
  const NOTE_MAP = {};
  const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for (let oct = 0; oct <= 8; oct++) {
    for (let i = 0; i < 12; i++) {
      const midi = oct * 12 + i + 12;
      NOTE_MAP[NAMES[i] + oct] = 440 * Math.pow(2, (midi - 69) / 12);
      // Flats
      if (NAMES[i].includes('#')) {
        const flat = NAMES[(i + 1) % 12] + 'b' + oct;
        NOTE_MAP[flat] = NOTE_MAP[NAMES[i] + oct];
      }
    }
  }

  function toHz(note) {
    if (typeof note === 'number') return note;
    return NOTE_MAP[note] || 440;
  }

  // Creature presets
  const CREATURES = {
    ember:   { hz: 261.63, wave: 'sine',     vol: 0.12, dur: 1.2, harmonics: [1, 0.3, 0.1] },
    hush:    { hz: 174.61, wave: 'sine',     vol: 0.03, dur: 2.0, harmonics: [1], noise: 0.02 },
    cobalt:  { hz: 329.63, wave: 'sine',     vol: 0.10, dur: 0.8, harmonics: [1] },
    echo:    { hz: 392.00, wave: 'sine',     vol: 0.08, dur: 1.5, harmonics: [1, 0, 0.2] },
    pulse:   { hz: 440.00, wave: 'sine',     vol: 0.10, dur: 1.0, harmonics: [1], mod: 0.1 },
    forge:   { hz: 146.83, wave: 'sawtooth', vol: 0.10, dur: 1.0, harmonics: [1, 0.2, 0.1] },
    flicker: { hz: 369.99, wave: 'sine',     vol: 0.08, dur: 0.7, harmonics: [1], wobble: 0.3 },
    loom:    { hz: 293.66, wave: 'sine',     vol: 0.08, dur: 1.0, harmonics: [1], detune: 5 },
    nib:     { hz: 493.88, wave: 'triangle', vol: 0.07, dur: 0.6, harmonics: [1, 0.4, 0.3] },
    fray:    { hz: 349.23, wave: 'triangle', vol: 0.07, dur: 0.8, harmonics: [1, 0.3, 0.2] },
    vesper:  { hz: 277.18, wave: 'sine',     vol: 0.09, dur: 1.5, harmonics: [1, 0.1] },
    spark:   { hz: 415.30, wave: 'sine',     vol: 0.08, dur: 0.5, harmonics: [1], mod: 0.15 },
    glyph:   { hz: 311.13, wave: 'sine',     vol: 0.08, dur: 0.9, harmonics: [1] },
    pip:     { hz: 523.25, wave: 'sine',     vol: 0.06, dur: 0.3, harmonics: [1] },
    weft:    { hz: 233.08, wave: 'sine',     vol: 0.08, dur: 1.0, harmonics: [1], detune: 3 },
    lichen:  { hz: 196.00, wave: 'sine',     vol: 0.09, dur: 1.5, harmonics: [1], noise: 0.01 },
    mote:    { hz: 466.16, wave: 'sine',     vol: 0.05, dur: 0.5, harmonics: [1], wobble: 0.2 },
    anvil:   { hz: 164.81, wave: 'sawtooth', vol: 0.10, dur: 1.2, harmonics: [1, 0.15, 0.1] },
    fable:   { hz: 246.94, wave: 'sine',     vol: 0.08, dur: 1.3, harmonics: [1, 0, 0.15] },
  };

  function note(n, duration = 0.8) {
    const c = getCtx();
    const hz = toHz(n);
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  function chord(notes, duration = 1.2) {
    notes.forEach(n => note(n, duration));
  }

  function melody(notes, gap = 0.3, duration = 0.5) {
    notes.forEach((n, i) => {
      setTimeout(() => note(n, duration), i * gap * 1000);
    });
  }

  function ring(hz = 440, dur = 2) {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  function creature(name) {
    const preset = CREATURES[name.toLowerCase()];
    if (!preset) { note(440); return; }
    const c = getCtx();
    const t = c.currentTime;

    preset.harmonics.forEach((amp, i) => {
      if (amp === 0) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = preset.wave;
      osc.frequency.value = preset.hz * (i + 1);
      if (preset.detune) osc.detune.value = preset.detune * (i > 0 ? 1 : 0);
      if (preset.wobble) {
        const lfo = c.createOscillator();
        const lfoG = c.createGain();
        lfo.frequency.value = 5;
        lfoG.gain.value = preset.hz * preset.wobble;
        lfo.connect(lfoG);
        lfoG.connect(osc.frequency);
        lfo.start(t);
        lfo.stop(t + preset.dur + 0.2);
      }
      gain.gain.setValueAtTime(preset.vol * amp, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + preset.dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + preset.dur + 0.1);
    });

    if (preset.noise) {
      const bufSize = c.sampleRate * preset.dur;
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() - 0.5) * 2;
      const noise = c.createBufferSource();
      noise.buffer = buf;
      const nGain = c.createGain();
      nGain.gain.setValueAtTime(preset.noise, t);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + preset.dur);
      noise.connect(nGain);
      nGain.connect(c.destination);
      noise.start(t);
      noise.stop(t + preset.dur);
    }
  }

  function drone(n = 'C3') {
    const c = getCtx();
    const hz = toHz(n);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    return () => {
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1);
      setTimeout(() => osc.stop(), 1100);
    };
  }

  return { note, chord, melody, ring, creature, drone, toHz, CREATURES };
})();
