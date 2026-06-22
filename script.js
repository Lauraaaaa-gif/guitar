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

function normalizeChordText(text) {
  return text.replace(chordPattern, (match, prefix, root, suffix = "", bass) => {
    if (!chordSuffixPattern.test(suffix)) return match;
    if (pitchOf(normalizeNote(root)) === undefined) return match;
    if (bass && pitchOf(normalizeNote(bass)) === undefined) return match;
    return `${prefix}${normalizeChord(root, suffix, bass)}`;
  });
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
  intervalLabel.textContent = `${interval > 0 ? "+" : ""}${interval} 半音`;
  resultChords.textContent = transposeText(sourceChords.value, fromKey.value, toKey.value);
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

copyResult.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultChords.textContent);
  copyResult.textContent = "Copied";
  window.setTimeout(() => {
    copyResult.textContent = "Copy";
  }, 1000);
});

normalizeInputField();
update();
