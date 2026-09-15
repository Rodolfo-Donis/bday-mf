import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ticksPerQuarter = 480;

function writeVariableLength(value) {
  const bytes = [];
  let buffer = value & 0x7f;
  value >>= 7;
  while (value > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
    value >>= 7;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if ((buffer & 0x80) === 0) {
      break;
    }
    buffer >>= 8;
  }
  return Buffer.from(bytes);
}

function writeChunk(type, data) {
  const header = Buffer.alloc(8);
  header.write(type, 0, 4, "ascii");
  header.writeUInt32BE(data.length, 4);
  return Buffer.concat([header, data]);
}

function createNoteEvents(notes, channel) {
  const events = [];
  let lastTick = 0;
  const sorted = [...notes].sort((a, b) => a.tick - b.tick || a.type.localeCompare(b.type));
  for (const note of sorted) {
    const delta = note.tick - lastTick;
    const status = (note.type === "on" ? 0x90 : 0x80) | channel;
    events.push(
      Buffer.concat([
        writeVariableLength(delta),
        Buffer.from([status, note.pitch, note.velocity]),
      ])
    );
    lastTick = note.tick;
  }
  return { events, lastTick };
}

function createTrack(channel, notes, extraStartEvents = []) {
  const { events, lastTick } = createNoteEvents(notes, channel);
  const end = Buffer.concat([
    writeVariableLength(480),
    Buffer.from([0xff, 0x2f, 0x00]),
  ]);
  const trackData = Buffer.concat([...extraStartEvents, ...events, end]);
  return writeChunk("MTrk", trackData);
}

function addNote(notes, tick, duration, pitch, velocity) {
  notes.push({ type: "on", tick, pitch, velocity });
  notes.push({ type: "off", tick: tick + duration, pitch, velocity: 0 });
}

function createTempoTrack(microseconds) {
  const tempo = Buffer.from([
    0x00, 0xff, 0x51, 0x03,
    (microseconds >> 16) & 0xff,
    (microseconds >> 8) & 0xff,
    microseconds & 0xff,
    0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08,
    0x00, 0xff, 0x2f, 0x00,
  ]);
  return writeChunk("MTrk", tempo);
}

const q = ticksPerQuarter;
const h = q * 2;
const e = q / 2;
const melody = [];
const bass = [];
const phrase = [
  [0, q, 76, 92],
  [q, q, 79, 88],
  [h, h, 81, 90],
  [q * 4, q, 79, 86],
  [q * 5, q, 76, 84],
  [q * 6, h, 74, 82],
  [q * 8, q, 76, 90],
  [q * 9, q, 81, 88],
  [q * 10, h, 84, 92],
  [q * 12, q, 83, 86],
  [q * 13, q, 81, 84],
  [q * 14, h, 79, 82],
  [q * 16, q, 74, 84],
  [q * 17, q, 76, 88],
  [q * 18, h, 79, 86],
  [q * 20, q, 81, 90],
  [q * 21, e, 79, 84],
  [q * 21 + e, e, 76, 82],
  [q * 22, h, 74, 80],
  [q * 24, q, 76, 92],
  [q * 25, q, 79, 88],
  [q * 26, h, 81, 90],
  [q * 28, q, 84, 86],
  [q * 29, q, 81, 84],
  [q * 30, h, 76, 88],
];
const bassPhrase = [
  [0, h, 45, 70],
  [h, h, 52, 66],
  [q * 4, h, 43, 68],
  [q * 6, h, 50, 64],
  [q * 8, h, 45, 70],
  [q * 10, h, 48, 66],
  [q * 12, h, 43, 68],
  [q * 14, h, 40, 72],
  [q * 16, h, 38, 68],
  [q * 18, h, 45, 64],
  [q * 20, h, 43, 68],
  [q * 22, h, 50, 64],
  [q * 24, h, 45, 72],
  [q * 26, h, 52, 66],
  [q * 28, h, 40, 70],
  [q * 30, h, 45, 74],
];
for (let loop = 0; loop < 2; loop += 1) {
  const offset = loop * q * 32;
  for (const [tick, duration, pitch, velocity] of phrase) {
    addNote(melody, tick + offset, duration, pitch, velocity);
  }
  for (const [tick, duration, pitch, velocity] of bassPhrase) {
    addNote(bass, tick + offset, duration, pitch, velocity);
  }
}
const programLead = Buffer.from([0x00, 0xc0, 73]);
const programBass = Buffer.from([0x00, 0xc1, 32]);
const header = Buffer.alloc(14);
header.write("MThd", 0, 4, "ascii");
header.writeUInt32BE(6, 4);
header.writeUInt16BE(1, 8);
header.writeUInt16BE(3, 10);
header.writeUInt16BE(ticksPerQuarter, 12);
const midi = Buffer.concat([
  header,
  createTempoTrack(681818),
  createTrack(0, melody, [programLead]),
  createTrack(1, bass, [programBass]),
]);
const outputPath = join(dirname(fileURLToPath(import.meta.url)), "hidden-leaf-theme.mid");
writeFileSync(outputPath, midi);
console.log(`Wrote ${outputPath}`);
