const BEAT = 60 / 88;
const LOOP_BEATS = 32;

const MELODY = [
  [0, 1, 76], [1, 1, 79], [2, 2, 81],
  [4, 1, 79], [5, 1, 76], [6, 2, 74],
  [8, 1, 76], [9, 1, 81], [10, 2, 84],
  [12, 1, 83], [13, 1, 81], [14, 2, 79],
  [16, 1, 74], [17, 1, 76], [18, 2, 79],
  [20, 1, 81], [21, 0.5, 79], [21.5, 0.5, 76], [22, 2, 74],
  [24, 1, 76], [25, 1, 79], [26, 2, 81],
  [28, 1, 84], [29, 1, 81], [30, 2, 76],
];

const BASS = [
  [0, 2, 45], [2, 2, 52], [4, 2, 43], [6, 2, 50],
  [8, 2, 45], [10, 2, 48], [12, 2, 43], [14, 2, 40],
  [16, 2, 38], [18, 2, 45], [20, 2, 43], [22, 2, 50],
  [24, 2, 45], [26, 2, 52], [28, 2, 40], [30, 2, 45],
];

function convertMidiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function playVoice(context, destination, config) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.frequency, config.start);
  envelope.gain.setValueAtTime(0, config.start);
  envelope.gain.linearRampToValueAtTime(config.volume, config.start + 0.04);
  envelope.gain.exponentialRampToValueAtTime(0.001, config.start + config.duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(config.start);
  oscillator.stop(config.start + config.duration + 0.03);
}

function scheduleLoop(context, master, origin) {
  MELODY.forEach(([beat, length, note]) => {
    playVoice(context, master, {
      type: "triangle",
      frequency: convertMidiToFrequency(note),
      start: origin + beat * BEAT,
      duration: length * BEAT,
      volume: 0.08,
    });
  });
  BASS.forEach(([beat, length, note]) => {
    playVoice(context, master, {
      type: "sine",
      frequency: convertMidiToFrequency(note),
      start: origin + beat * BEAT,
      duration: length * BEAT,
      volume: 0.05,
    });
  });
}

function createVillageMidi() {
  let context = null;
  let master = null;
  let timer = 0;
  let nextLoop = 0;
  let isPlaying = false;
  function startLoop() {
    const loopLength = LOOP_BEATS * BEAT;
    const now = context.currentTime;
    if (nextLoop < now + 0.1) {
      nextLoop = now + 0.08;
    }
    scheduleLoop(context, master, nextLoop);
    nextLoop += loopLength;
  }
  async function start() {
    if (isPlaying) {
      return;
    }
    context = context || new window.AudioContext();
    await context.resume();
    master = master || context.createGain();
    master.gain.value = 1;
    master.connect(context.destination);
    nextLoop = context.currentTime + 0.05;
    startLoop();
    timer = window.setInterval(startLoop, LOOP_BEATS * BEAT * 1000 - 120);
    isPlaying = true;
  }
  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (context && context.state !== "closed") {
      context.close();
    }
    context = null;
    master = null;
    timer = 0;
    isPlaying = false;
  }
  function isActive() {
    return isPlaying;
  }
  return { start, stop, isActive };
}
