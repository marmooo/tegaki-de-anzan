import signaturePad from "https://cdn.jsdelivr.net/npm/signature_pad@5.0.10/+esm";

const countPanel = document.getElementById("countPanel");
const infoPanel = document.getElementById("infoPanel");
const playPanel = document.getElementById("playPanel");
const scorePanel = document.getElementById("scorePanel");
const canvasContainer = document.getElementById("canvasContainer");
const canvases = [...canvasContainer.getElementsByTagName("canvas")];
const canvasCache = document.createElement("canvas")
  .getContext("2d", { willReadFrequently: true });
const pads = initSignaturePads(canvases);
const gameTime = 180;
let gameTimer;
let answers = new Array(3);
let hinted = false;
let correctCount = 0;
let audioContext;
const audioBufferCache = {};
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("end", "mp3/end.mp3");
    loadAudio("correct", "mp3/correct3.mp3");
    loadAudio("incorrect", "mp3/incorrect1.mp3");
  }
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function isEqual(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

// +-*/のテストデータ生成範囲を返却
function getNumRange(grade) {
  switch (grade) {
    case 1:
      return [8, 2, 8, 2, 0, 0, 0, 0];
    case 2:
      return [28, 6, 28, 6, 8, 2, 0, 0];
    case 3:
      return [38, 11, 38, 11, 8, 2, 8, 2];
    case 4:
      return [38, 11, 38, 11, 12, 2, 16, 4];
    case 5:
      return [99, 50, 99, 50, 16, 4, 20, 6];
    case 6:
      return [99, 50, 99, 50, 14, 6, 20, 8];
    default:
      return [388, 111, 388, 111, 12, 8, 20, 11];
  }
}

function generateData() {
  const grade = document.getElementById("gradeOption").selectedIndex + 1;
  const course = document.getElementById("courseOption").selectedIndex - 1;
  const range = getNumRange(grade);
  let a, b, c, x, s;
  if (course < 0) {
    if (grade == 1) {
      s = Math.floor(Math.random() * 2);
    } else if (grade == 2) {
      s = Math.floor(Math.random() * 3);
    } else {
      s = Math.floor(Math.random() * 4);
    }
  } else {
    s = course;
  }
  switch (s) {
    case 0:
      a = Math.floor(Math.random() * range[0] + range[1]);
      b = Math.floor(Math.random() * range[0] + range[1]);
      c = a + b;
      x = "＋";
      break;
    case 1:
      b = Math.floor(Math.random() * range[2] + range[3]);
      c = Math.floor(Math.random() * range[2] + range[3]);
      a = b + c;
      x = "−";
      break;
    case 2:
      a = Math.floor(Math.random() * range[4] + range[5]);
      b = Math.floor(Math.random() * range[4] + range[5]);
      c = a * b;
      x = "×";
      break;
    case 3:
      b = Math.floor(Math.random() * range[6] + range[7]);
      c = Math.floor(Math.random() * range[6] + range[7]);
      a = b * c;
      x = "÷";
      break;
    default:
      console.log("error");
  }
  const num = document.getElementById("num");
  num.textContent = `${a}${x}${b}＝`;
  const cStr = ("   " + c).slice(-3); // whitespae padding
  answers = cStr.split("");
  for (let i = 0; i < canvases.length; i++) {
    canvases[i].dataset.predict = " ";
    pads[i].clear();
  }
}

function countdown() {
  countPanel.classList.remove("d-none");
  infoPanel.classList.add("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearInterval(timer);
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      playPanel.classList.remove("d-none");
      correctCount = 0;
      hinted = false;
      generateData();
      startGameTimer();
    }
  }, 1000);
}

function startGame() {
  clearInterval(gameTimer);
  initTime();
  countdown();
}

function startGameTimer() {
  const timeNode = document.getElementById("time");
  initTime();
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      playAudio("end");
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      scoring();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function scoring() {
  document.getElementById("score").textContent = correctCount;
}

function eraserEvent(pad) {
  pad.clear();
  pad.canvas.dataset.predict = " ";
}

function initSignaturePads(canvases) {
  const pads = [];
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const pad = new signaturePad(canvas, {
      minWidth: 5,
      maxWidth: 5,
      penColor: "black",
      backgroundColor: "white",
      throttle: 0,
    });
    pad.addEventListener("endStroke", () => {
      const data = pad.toData();
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        count += data[i].points.length;
      }
      if (5 < count && count < 100) {
        const pos = canvases.indexOf(pad.canvas);
        predict(pad.canvas, pos, data.length, count);
      }
    });
    const eraser = canvas.nextElementSibling;
    if (navigator.maxTouchPoints > 0) {
      eraser.ontouchstart = () => eraserEvent(pad);
    } else {
      eraser.onclick = () => eraserEvent(pad);
    }
    pads.push(pad);
  }
  return pads;
}

function getImageData(drawElement) {
  const inputWidth = 28;
  const inputHeight = 28;
  // resize
  canvasCache.drawImage(drawElement, 0, 0, inputWidth, inputHeight);
  // invert color
  const imageData = canvasCache.getImageData(0, 0, inputWidth, inputHeight);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

const kakusus = [1, 1, 1, 1, 2, 2, 1, 2, 1, 1]; // japanese style
function getReplies(predicted) {
  const canvas = canvases[predicted.pos];
  const predicts = new Array(3).fill(" ");
  for (let i = 0; i < canvases.length; i++) {
    predicts[i] = canvases[i].dataset.predict;
  }
  if (predicted.klass != 1 && predicted.count < 15) {
    // 短すぎる線は無視する
    predicted.klass = " ";
  } else if (predicted.kaku < kakusus[predicted.klass]) {
    // 画数不足は不正解とする
    predicted.klass = " ";
  }
  canvas.dataset.predict = predicted.klass;
  predicts[parseInt(canvas.getAttribute("id").slice(-1))] = predicted.klass
    .toString();
  return predicts;
}

function predict(canvas, pos, kaku, count) {
  const imageData = getImageData(canvas);
  worker.postMessage({
    pos: pos,
    imageData: imageData,
    kaku: kaku,
    count: count,
  });
}

function showAnswer() {
  if (!hinted) {
    hinted = true;
    document.getElementById("num").textContent += answers.join("").trimStart();
    playAudio("incorrect", 0.3);
    setTimeout(() => {
      hinted = false;
      generateData();
    }, 3000);
  }
}

const worker = new Worker("worker.js");
worker.addEventListener("message", (event) => {
  const replies = getReplies(event.data);
  if (isEqual(answers, replies)) {
    playAudio("correct", 0.3);
    if (!hinted) correctCount += 1;
    hinted = false;
    generateData();
  }
});
generateData();

document.getElementById("hint").onclick = showAnswer;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = startGame;
document.getElementById("restartButton").onclick = startGame;
document.addEventListener("pointerdown", () => {
  predict(pads[0].canvas, 0, 0, 0);
}, { once: true });
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });

if (CSS.supports("-webkit-touch-callout: default")) { // iOS
  // prevent double click zoom
  document.addEventListener("dblclick", (event) => event.preventDefault());
  // prevent text selection
  const preventDefault = (event) => event.preventDefault();
  const canvasContainer = document.getElementById("canvasContainer");
  canvasContainer.addEventListener("touchstart", () => {
    document.addEventListener("touchstart", preventDefault, {
      passive: false,
    });
  });
  canvasContainer.addEventListener("touchend", () => {
    document.removeEventListener("touchstart", preventDefault, {
      passive: false,
    });
  });
}
