const keys = [
  "C", "Db", "D", "Eb", "E", "F",
  "F#", "G", "Ab", "A", "Bb", "B"
];

const noteToPitch = {
  C: 0, "B#": 0,
  "C#": 1, Db: 1,
  D: 2,
  "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  "E#": 5, F: 5,
  "F#": 6, Gb: 6,
  G: 7,
  "G#": 8, Ab: 8,
  A: 9,
  "A#": 10, Bb: 10,
  B: 11, Cb: 11
};

const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const flatKeys = new Set(["F", "Bb", "Eb", "Ab", "Db"]);
const chordPattern = /(^|[\s([{|])([A-Ga-g](?:#|b|B)?)([A-Za-z0-9#b()+-]*)(?:\/([A-Ga-g](?:#|b|B)?))?/g;
const chordSuffixPattern = /^((maj|min|dim|aug|sus|add|no|m)|[0-9#b()+-])*$/i;

const majorTriad = [
  ["I", 0, "", "大和弦"],
  ["ii", 2, "m", "小和弦"],
  ["iii", 4, "m", "小和弦"],
  ["IV", 5, "", "大和弦"],
  ["V", 7, "", "大和弦"],
  ["vi", 9, "m", "小和弦"],
  ["vii°", 11, "dim", "減和弦"]
];

const majorSeventh = [
  ["I", 0, "maj7", "大七"],
  ["ii", 2, "m7", "小七"],
  ["iii", 4, "m7", "小七"],
  ["IV", 5, "maj7", "大七"],
  ["V", 7, "7", "屬七"],
  ["vi", 9, "m7", "小七"],
  ["viiø", 11, "m7b5", "半減七"]
];

const minorTriad = [
  ["i", 0, "m", "小和弦"],
  ["ii°", 2, "dim", "減和弦"],
  ["III", 3, "", "大和弦"],
  ["iv", 5, "m", "小和弦"],
  ["v", 7, "m", "小和弦"],
  ["VI", 8, "", "大和弦"],
  ["VII", 10, "", "大和弦"]
];

const minorSeventh = [
  ["i", 0, "m7", "小七"],
  ["iiø", 2, "m7b5", "半減七"],
  ["III", 3, "maj7", "大七"],
  ["iv", 5, "m7", "小七"],
  ["v", 7, "m7", "小七"],
  ["VI", 8, "maj7", "大七"],
  ["VII", 10, "7", "屬七"]
];

const state = {
  diatonicType: "triads"
};

const fromKey = document.querySelector("#fromKey");
const toKey = document.querySelector("#toKey");
const scaleMode = document.querySelector("#scaleMode");
const sourceChords = document.querySelector("#sourceChords");
const resultChords = document.querySelector("#resultChords");
const intervalLabel = document.querySelector("#intervalLabel");
const scaleTitle = document.querySelector("#scaleTitle");
const diatonicList = document.querySelector("#diatonicList");
const copyResult = document.querySelector("#copyResult");
const swapKeys = document.querySelector("#swapKeys");
const detectedKey = document.querySelector("#detectedKey");
const detectedConfidence = document.querySelector("#detectedConfidence");
const applyDetectedKey = document.querySelector("#applyDetectedKey");
const capoSuggestions = document.querySelector("#capoSuggestions");
const degreeProgression = document.querySelector("#degreeProgression");
const chordModal = document.querySelector("#chordModal");
const closeChordModal = document.querySelector("#closeChordModal");
const chordModalTitle = document.querySelector("#chordModalTitle");
const chordDiagram = document.querySelector("#chordDiagram");
const chordDiagramNote = document.querySelector("#chordDiagramNote");
const chordLookupInput = document.querySelector("#chordLookupInput");
const lookupChordButton = document.querySelector("#lookupChordButton");
const openChordLookup = document.querySelector("#openChordLookup");

const majorDegrees = [
  { degree: "I", offset: 0, quality: "major" },
  { degree: "ii", offset: 2, quality: "minor" },
  { degree: "iii", offset: 4, quality: "minor" },
  { degree: "IV", offset: 5, quality: "major" },
  { degree: "V", offset: 7, quality: "major" },
  { degree: "vi", offset: 9, quality: "minor" },
  { degree: "vii°", offset: 11, quality: "dim" }
];

const minorDegrees = [
  { degree: "i", offset: 0, quality: "minor" },
  { degree: "ii°", offset: 2, quality: "dim" },
  { degree: "III", offset: 3, quality: "major" },
  { degree: "iv", offset: 5, quality: "minor" },
  { degree: "v", offset: 7, quality: "minor" },
  { degree: "VI", offset: 8, quality: "major" },
  { degree: "VII", offset: 10, quality: "major" }
];

const capoShapes = {
  major: ["C", "G", "D", "A", "E", "F"],
  minor: ["Am", "Em", "Dm"]
};

const chordDiagrams = {
  C: { base: 1, frets: ["x", 3, 2, 0, 1, 0], fingers: ["", 3, 2, "", 1, ""] },
  Cm: { base: 3, frets: ["x", 1, 3, 3, 2, 1], fingers: ["", 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  C7: { base: 1, frets: ["x", 3, 2, 3, 1, 0], fingers: ["", 3, 2, 4, 1, ""] },
  Cmaj7: { base: 1, frets: ["x", 3, 2, 0, 0, 0], fingers: ["", 3, 2, "", "", ""] },
  Cm7: { base: 3, frets: ["x", 1, 3, 1, 2, 1], fingers: ["", 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  Db: { base: 4, frets: ["x", 1, 3, 3, 3, 1], fingers: ["", 1, 3, 3, 3, 1], barre: { fret: 1, from: 2, to: 6 } },
  Dbm: { base: 4, frets: ["x", 1, 3, 3, 2, 1], fingers: ["", 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  D: { base: 1, frets: ["x", "x", 0, 2, 3, 2], fingers: ["", "", "", 1, 3, 2] },
  Dm: { base: 1, frets: ["x", "x", 0, 2, 3, 1], fingers: ["", "", "", 2, 3, 1] },
  D7: { base: 1, frets: ["x", "x", 0, 2, 1, 2], fingers: ["", "", "", 2, 1, 3] },
  Dmaj7: { base: 1, frets: ["x", "x", 0, 2, 2, 2], fingers: ["", "", "", 1, 1, 1], barre: { fret: 2, from: 4, to: 6 } },
  Dm7: { base: 1, frets: ["x", "x", 0, 2, 1, 1], fingers: ["", "", "", 2, 1, 1], barre: { fret: 1, from: 5, to: 6 } },
  Eb: { base: 6, frets: ["x", 1, 3, 3, 3, 1], fingers: ["", 1, 3, 3, 3, 1], barre: { fret: 1, from: 2, to: 6 } },
  Ebm: { base: 6, frets: ["x", 1, 3, 3, 2, 1], fingers: ["", 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  E: { base: 1, frets: [0, 2, 2, 1, 0, 0], fingers: ["", 2, 3, 1, "", ""] },
  Em: { base: 1, frets: [0, 2, 2, 0, 0, 0], fingers: ["", 2, 3, "", "", ""] },
  E7: { base: 1, frets: [0, 2, 0, 1, 0, 0], fingers: ["", 2, "", 1, "", ""] },
  Emaj7: { base: 1, frets: [0, 2, 1, 1, 0, 0], fingers: ["", 3, 1, 2, "", ""] },
  Em7: { base: 1, frets: [0, 2, 2, 0, 3, 0], fingers: ["", 1, 2, "", 3, ""] },
  F: { base: 1, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  Fm: { base: 1, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  F7: { base: 1, frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  Fmaj7: { base: 1, frets: ["x", "x", 3, 2, 1, 0], fingers: ["", "", 3, 2, 1, ""] },
  Fm7: { base: 1, frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  "F#": { base: 2, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  "F#m": { base: 2, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  "F#m7b5": { base: 1, frets: [2, "x", 2, 2, 1, "x"], fingers: [2, "", 3, 4, 1, ""] },
  G: { base: 1, frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, "", "", "", 4] },
  Gm: { base: 3, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  G7: { base: 1, frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, "", "", "", 1] },
  Gmaj7: { base: 1, frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, "", "", "", 2] },
  Gm7: { base: 3, frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  Ab: { base: 4, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  Abm: { base: 4, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 } },
  A: { base: 1, frets: ["x", 0, 2, 2, 2, 0], fingers: ["", "", 1, 2, 3, ""] },
  Am: { base: 1, frets: ["x", 0, 2, 2, 1, 0], fingers: ["", "", 2, 3, 1, ""] },
  A7: { base: 1, frets: ["x", 0, 2, 0, 2, 0], fingers: ["", "", 1, "", 2, ""] },
  Amaj7: { base: 1, frets: ["x", 0, 2, 1, 2, 0], fingers: ["", "", 2, 1, 3, ""] },
  Am7: { base: 1, frets: ["x", 0, 2, 0, 1, 0], fingers: ["", "", 2, "", 1, ""] },
  Bb: { base: 1, frets: ["x", 1, 3, 3, 3, 1], fingers: ["", 1, 3, 3, 3, 1], barre: { fret: 1, from: 2, to: 6 } },
  Bbm: { base: 1, frets: ["x", 1, 3, 3, 2, 1], fingers: ["", 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  Bb7: { base: 1, frets: ["x", 1, 3, 1, 3, 1], fingers: ["", 1, 3, 1, 4, 1], barre: { fret: 1, from: 2, to: 6 } },
  B: { base: 2, frets: ["x", 1, 3, 3, 3, 1], fingers: ["", 1, 3, 3, 3, 1], barre: { fret: 1, from: 2, to: 6 } },
  Bm: { base: 2, frets: ["x", 1, 3, 3, 2, 1], fingers: ["", 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  B7: { base: 1, frets: ["x", 2, 1, 2, 0, 2], fingers: ["", 2, 1, 3, "", 4] },
  Bm7: { base: 2, frets: ["x", 1, 3, 1, 2, 1], fingers: ["", 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 } },
  Bm7b5: { base: 1, frets: ["x", 2, 3, 2, 3, "x"], fingers: ["", 1, 3, 2, 4, ""] }
};

function option(label) {
  const item = document.createElement("option");
  item.value = label;
  item.textContent = label;
  return item;
}

function pitchOf(note) {
  return noteToPitch[note];
}

function preferFlats(key) {
  return flatKeys.has(key);
}

function nameForPitch(pitch, key) {
  const names = preferFlats(key) ? flatNames : sharpNames;
  return names[(pitch + 120) % 12];
}

function normalizeNote(note) {
  if (!note) return note;
  const letter = note[0].toUpperCase();
  const accidental = note.slice(1).replace(/B/g, "b");
  return `${letter}${accidental}`;
}

function normalizeChord(root, suffix = "", bass = "") {
  const normalizedRoot = normalizeNote(root);
  const normalizedSuffix = suffix.toLowerCase();
  const normalizedBass = bass ? `/${normalizeNote(bass)}` : "";
  return `${normalizedRoot}${normalizedSuffix}${normalizedBass}`;
}

function canonicalChordName(chord) {
  const [main] = chord.split("/");
  const match = main.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return main;
  const root = normalizeNote(match[1]);
  const suffix = match[2].toLowerCase();
  if (suffix.includes("m7b5")) return `${root}m7b5`;
  if (suffix.includes("maj7")) return `${root}maj7`;
  if (suffix.includes("m7") || suffix === "min7") return `${root}m7`;
  if (suffix === "m" || suffix.startsWith("min")) return `${root}m`;
  if (suffix.includes("7")) return `${root}7`;
  return root;
}

function normalizeChordText(text) {
  return text.replace(chordPattern, (match, prefix, root, suffix = "", bass) => {
    if (!chordSuffixPattern.test(suffix)) return match;
    if (pitchOf(normalizeNote(root)) === undefined) return match;
    if (bass && pitchOf(normalizeNote(bass)) === undefined) return match;
    return `${prefix}${normalizeChord(root, suffix, bass)}`;
  });
}

function chordQuality(suffix = "") {
  const value = suffix.toLowerCase();
  if (value.includes("dim") || value.includes("m7b5")) return "dim";
  if (value.startsWith("m") && !value.startsWith("maj")) return "minor";
  if (value.startsWith("min")) return "minor";
  return "major";
}

function extractChords(text) {
  const chords = [];
  normalizeChordText(text).replace(chordPattern, (match, prefix, root, suffix = "", bass) => {
    const normalizedRoot = normalizeNote(root);
    if (!chordSuffixPattern.test(suffix)) return match;
    if (pitchOf(normalizedRoot) === undefined) return match;
    chords.push({
      raw: normalizeChord(root, suffix, bass),
      root: normalizedRoot,
      suffix: suffix.toLowerCase(),
      quality: chordQuality(suffix)
    });
    return match;
  });
  return chords;
}

function transposeNote(note, interval, targetKey) {
  return nameForPitch(pitchOf(note) + interval, targetKey);
}

function semitoneDistance(from, to) {
  let distance = pitchOf(to) - pitchOf(from);
  if (distance > 6) distance -= 12;
  if (distance < -6) distance += 12;
  return distance;
}

function transposeText(text, from, to) {
  const interval = semitoneDistance(from, to);
  return normalizeChordText(text).replace(chordPattern, (match, prefix, root, suffix = "", bass) => {
    const normalizedRoot = normalizeNote(root);
    const normalizedBass = normalizeNote(bass);
    if (!chordSuffixPattern.test(suffix)) return match;
    if (pitchOf(normalizedRoot) === undefined) return match;
    const nextRoot = transposeNote(normalizedRoot, interval, to);
    const nextBass = bass && pitchOf(normalizedBass) !== undefined ? `/${transposeNote(normalizedBass, interval, to)}` : "";
    return `${prefix}${nextRoot}${suffix.toLowerCase()}${nextBass}`;
  });
}

function renderClickableChordText(text, container) {
  container.innerHTML = "";
  chordPattern.lastIndex = 0;
  let cursor = 0;
  let match;

  while ((match = chordPattern.exec(text)) !== null) {
    const [full, prefix, root, suffix = "", bass] = match;
    const start = match.index;
    const normalizedRoot = normalizeNote(root);
    if (!chordSuffixPattern.test(suffix) || pitchOf(normalizedRoot) === undefined) continue;

    container.append(document.createTextNode(text.slice(cursor, start)));
    container.append(document.createTextNode(prefix));

    const chordName = normalizeChord(root, suffix, bass);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chord-token";
    button.textContent = chordName;
    button.dataset.chord = chordName;
    container.append(button);

    cursor = start + full.length;
  }

  container.append(document.createTextNode(text.slice(cursor)));
}

function renderChordDiagram(chordName) {
  const lookupName = canonicalChordName(chordName);
  const diagram = chordDiagrams[lookupName];
  chordModalTitle.textContent = chordName;

  if (!diagram) {
    chordDiagram.innerHTML = `<div class="missing-diagram">暫無 ${lookupName} 的和弦圖</div>`;
    chordDiagramNote.textContent = "目前先收錄常用吉他和弦；較複雜的延伸和弦可先用基本和弦替代。";
    chordModal.hidden = false;
    return;
  }

  const stringX = [34, 70, 106, 142, 178, 214];
  const fretY = [50, 86, 122, 158, 194, 230];
  const topY = 50;
  const bottomY = 230;
  const leftX = 34;
  const rightX = 214;
  const positionY = (fret) => topY + (fret - 0.5) * 36;
  const nutWidth = diagram.base === 1 ? 7 : 2;
  let svg = `<svg class="chord-svg" viewBox="0 0 248 280" role="img" aria-label="${chordName} 和弦圖">`;
  svg += `<text x="124" y="24" text-anchor="middle" fill="#2a1a12" font-size="20" font-weight="800">${chordName}</text>`;
  if (diagram.base > 1) {
    svg += `<text x="224" y="82" fill="#7a675b" font-size="13">${diagram.base}fr</text>`;
  }
  stringX.forEach((x) => {
    svg += `<line x1="${x}" y1="${topY}" x2="${x}" y2="${bottomY}" stroke="#4d2d1c" stroke-width="2"/>`;
  });
  fretY.forEach((y, index) => {
    svg += `<line x1="${leftX}" y1="${y}" x2="${rightX}" y2="${y}" stroke="#4d2d1c" stroke-width="${index === 0 ? nutWidth : 2}" stroke-linecap="round"/>`;
  });
  diagram.frets.forEach((fret, index) => {
    const x = stringX[index];
    if (fret === "x") svg += `<text x="${x}" y="43" text-anchor="middle" fill="#7a675b" font-size="17" font-weight="800">×</text>`;
    if (fret === 0) svg += `<circle cx="${x}" cy="37" r="6" fill="none" stroke="#7a675b" stroke-width="2"/>`;
  });
  if (diagram.barre) {
    const y = positionY(diagram.barre.fret);
    const x1 = stringX[diagram.barre.from - 1];
    const x2 = stringX[diagram.barre.to - 1];
    svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#6d3f2a" stroke-width="22" stroke-linecap="round"/>`;
  }
  diagram.frets.forEach((fret, index) => {
    if (typeof fret !== "number" || fret === 0) return;
    const x = stringX[index];
    const y = positionY(fret);
    svg += `<circle cx="${x}" cy="${y}" r="12" fill="#3f2418"/>`;
    if (diagram.fingers[index]) {
      svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" fill="#fff8e8" font-size="12" font-weight="800">${diagram.fingers[index]}</text>`;
    }
  });
  svg += `<text x="124" y="262" text-anchor="middle" fill="#7a675b" font-size="13">E A D G B E</text>`;
  svg += `</svg>`;

  chordDiagram.innerHTML = svg;
  chordDiagramNote.textContent = lookupName === chordName ? "標準指型參考，可依歌曲速度與手感調整把位。" : `以 ${lookupName} 的常用指型顯示，已忽略轉位或部分延伸音。`;
  chordModal.hidden = false;
}

function lookupChordFromField() {
  const normalized = normalizeChordText(chordLookupInput.value.trim());
  const [firstChord] = extractChords(normalized);

  if (!firstChord) {
    chordLookupInput.focus();
    return;
  }

  chordLookupInput.value = firstChord.raw;
  renderChordDiagram(firstChord.raw);
}

function openLookupFromResult() {
  const resultText = resultChords.dataset.copyText || resultChords.textContent;
  const [firstChord] = extractChords(resultText);
  if (firstChord) chordLookupInput.value = firstChord.raw;
  lookupChordFromField();
}

function scoreKey(chords, key, mode) {
  const tonicPitch = pitchOf(key);
  const degrees = mode === "minor" ? minorDegrees : majorDegrees;
  let score = 0;

  chords.forEach((chord, index) => {
    const interval = (pitchOf(chord.root) - tonicPitch + 12) % 12;
    const degree = degrees.find((item) => item.offset === interval);
    if (!degree) {
      score -= 0.8;
      return;
    }

    score += 2;
    if (degree.quality === chord.quality) score += 1.2;
    if (degree.offset === 0) score += index === 0 ? 1.4 : 0.7;
    if (degree.offset === 5 || degree.offset === 7) score += 0.35;
  });

  return score;
}

function detectKey(chords) {
  if (!chords.length) return null;
  const candidates = [];
  keys.forEach((key) => {
    candidates.push({ key, mode: "major", score: scoreKey(chords, key, "major") });
    candidates.push({ key, mode: "minor", score: scoreKey(chords, key, "minor") });
  });

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const confidence = Math.max(36, Math.min(96, Math.round((best.score / (chords.length * 3.2)) * 100)));
  return { ...best, confidence };
}

function renderDetectedKey(chords) {
  const detected = detectKey(chords);
  if (!detected) {
    detectedKey.textContent = "尚未偵測";
    detectedConfidence.textContent = "輸入幾個和弦後會自動估算";
    applyDetectedKey.disabled = true;
    return;
  }

  detectedKey.dataset.key = detected.key;
  detectedKey.dataset.mode = detected.mode;
  detectedKey.textContent = `${detected.key} ${detected.mode === "minor" ? "小調" : "大調"}`;
  detectedConfidence.textContent = `信心約 ${detected.confidence}%`;
  applyDetectedKey.disabled = false;
}

function renderCapoSuggestions() {
  const mode = scaleMode.value;
  const songPitch = pitchOf(fromKey.value);
  const suggestions = capoShapes[mode]
    .map((shape) => {
      const shapeRoot = shape.replace("m", "");
      return {
        shape,
        fret: (songPitch - pitchOf(shapeRoot) + 12) % 12
      };
    })
    .filter((item) => item.fret <= 7)
    .slice(0, 3);

  capoSuggestions.innerHTML = "";
  suggestions.forEach((item) => {
    const row = document.createElement("div");
    row.className = "capo-item";
    row.innerHTML = `<span>Capo ${item.fret}</span><small>彈 ${item.shape} 指型</small>`;
    capoSuggestions.append(row);
  });

  if (!suggestions.length) {
    capoSuggestions.innerHTML = '<div class="capo-item"><span>原把位</span><small>不用 Capo</small></div>';
  }
}

function degreeForChord(chord) {
  const degrees = scaleMode.value === "minor" ? minorDegrees : majorDegrees;
  const interval = (pitchOf(chord.root) - pitchOf(fromKey.value) + 12) % 12;
  const degree = degrees.find((item) => item.offset === interval);
  return degree ? degree.degree : "?";
}

function renderDegreeProgression() {
  const normalized = normalizeChordText(sourceChords.value);
  degreeProgression.textContent = normalized.replace(chordPattern, (match, prefix, root, suffix = "", bass) => {
    const normalizedRoot = normalizeNote(root);
    if (!chordSuffixPattern.test(suffix)) return match;
    if (pitchOf(normalizedRoot) === undefined) return match;
    return `${prefix}${degreeForChord({ root: normalizedRoot, suffix })}`;
  });
}

function getDiatonicRows() {
  const mode = scaleMode.value;
  if (mode === "minor") {
    return state.diatonicType === "triads" ? minorTriad : minorSeventh;
  }
  return state.diatonicType === "triads" ? majorTriad : majorSeventh;
}

function renderDiatonic() {
  const key = toKey.value;
  const modeName = scaleMode.value === "minor" ? "小調" : "大調";
  scaleTitle.textContent = `${key} ${modeName}順階和弦`;
  diatonicList.innerHTML = "";

  getDiatonicRows().forEach(([degree, offset, suffix, quality]) => {
    const row = document.createElement("div");
    row.className = "degree-row";

    const degreeNode = document.createElement("div");
    degreeNode.className = "degree";
    degreeNode.textContent = degree;

    const chordNode = document.createElement("div");
    chordNode.className = "chord";
    chordNode.innerHTML = `<span>${nameForPitch(pitchOf(key) + offset, key)}${suffix}</span><span class="quality">${quality}</span>`;

    row.append(degreeNode, chordNode);
    diatonicList.append(row);
  });
}

function normalizeInputField() {
  const start = sourceChords.selectionStart;
  const end = sourceChords.selectionEnd;
  const normalized = normalizeChordText(sourceChords.value);
  if (normalized !== sourceChords.value) {
    sourceChords.value = normalized;
    sourceChords.setSelectionRange(start, end);
  }
}

function update() {
  const interval = semitoneDistance(fromKey.value, toKey.value);
  const chords = extractChords(sourceChords.value);
  const transposed = transposeText(sourceChords.value, fromKey.value, toKey.value);
  intervalLabel.textContent = `${interval > 0 ? "+" : ""}${interval} 半音`;
  resultChords.dataset.copyText = transposed;
  renderClickableChordText(transposed, resultChords);
  renderDetectedKey(chords);
  renderCapoSuggestions();
  renderDegreeProgression();
  renderDiatonic();
}

keys.forEach((key) => {
  fromKey.append(option(key));
  toKey.append(option(key));
});

fromKey.value = "C";
toKey.value = "A";

document.querySelectorAll("[data-from][data-to]").forEach((button) => {
  button.addEventListener("click", () => {
    fromKey.value = button.dataset.from;
    toKey.value = button.dataset.to;
    update();
  });
});

document.querySelectorAll("[data-diatonic]").forEach((button) => {
  button.addEventListener("click", () => {
    state.diatonicType = button.dataset.diatonic;
    document.querySelectorAll("[data-diatonic]").forEach((item) => item.classList.toggle("active", item === button));
    renderDiatonic();
  });
});

sourceChords.addEventListener("input", () => {
  normalizeInputField();
  update();
});

[fromKey, toKey, scaleMode].forEach((element) => {
  element.addEventListener("input", update);
});

swapKeys.addEventListener("click", () => {
  const nextFrom = toKey.value;
  toKey.value = fromKey.value;
  fromKey.value = nextFrom;
  update();
});

applyDetectedKey.addEventListener("click", () => {
  if (!detectedKey.dataset.key) return;
  fromKey.value = detectedKey.dataset.key;
  scaleMode.value = detectedKey.dataset.mode;
  update();
});

copyResult.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultChords.dataset.copyText || resultChords.textContent);
  copyResult.textContent = "Copied";
  window.setTimeout(() => {
    copyResult.textContent = "Copy";
  }, 1000);
});

resultChords.addEventListener("click", (event) => {
  const button = event.target.closest(".chord-token");
  if (!button) return;
  chordLookupInput.value = button.dataset.chord;
  renderChordDiagram(button.dataset.chord);
});

lookupChordButton.addEventListener("click", lookupChordFromField);

openChordLookup.addEventListener("click", openLookupFromResult);

chordLookupInput.addEventListener("input", () => {
  const start = chordLookupInput.selectionStart;
  const end = chordLookupInput.selectionEnd;
  const normalized = normalizeChordText(chordLookupInput.value);
  if (normalized !== chordLookupInput.value) {
    chordLookupInput.value = normalized;
    chordLookupInput.setSelectionRange(start, end);
  }
});

chordLookupInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  lookupChordFromField();
});

closeChordModal.addEventListener("click", () => {
  chordModal.hidden = true;
});

chordModal.addEventListener("click", (event) => {
  if (event.target === chordModal) chordModal.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") chordModal.hidden = true;
});

normalizeInputField();
update();
