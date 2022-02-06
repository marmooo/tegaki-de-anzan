let hinted = false;
const infoPanel = document.getElementById("infoPanel");
const scorePanel = document.getElementById("scorePanel");
const canvases = [
  ...document.getElementById("canvases").getElementsByTagName(
    "canvas",
  ),
];
const pads = initSignaturePads(canvases);
let answers = new Array(3);
let endAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/end.mp3"),
    loadAudio("mp3/correct3.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    endAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
  });
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
  hint = false;
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

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  timeNode.textContent = "180秒 / 180秒";
  gameTimer = setInterval(function () {
    const arr = timeNode.textContent.split("秒 /");
    const t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.textContent = (t - 1) + "秒 /" + arr[1];
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      infoPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  clearTimeout(countdownTimer);
  gameStart.classList.remove("d-none");
  infoPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  countdownTimer = setInterval(function () {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      document.getElementById("score").textContent = 0;
      generateData();
      startGameTimer();
    }
  }, 1000);
}

function initSignaturePads(canvases) {
  const pads = [];
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const pad = new SignaturePad(canvas, {
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
    eraser.onclick = () => {
      pad.clear();
      canvas.dataset.predict = " ";
    };
    pads.push(pad);
  }
  return pads;
}

const canvasCache = document.createElement("canvas").getContext("2d");
function getImageData(drawElement) {
  const inputWidth = inputHeight = 28;
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
    predicted.klass = "";
  } else if (predicted.kaku < kakusus[predicted.klass]) { // 画数が足りないものは不正解とする
    predicted.klass = "";
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
    document.getElementById("num").textContent += answers.join("");
  }
}

const worker = new Worker("worker.js");
worker.addEventListener("message", function (e) {
  const replies = getReplies(e.data);
  if (isEqual(answers, replies)) {
    playAudio(correctAudio);
    const scoreObj = document.getElementById("score");
    if (!hinted) {
      scoreObj.textContent = parseInt(scoreObj.textContent) + 1;
    }
    generateData();
  }
});
generateData();

document.getElementById("hint").onclick = showAnswer;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = countdown;
document.getElementById("restartButton").onclick = countdown;

// https://webinlet.com/2020/ios11以降でピンチインアウト拡大縮小禁止
// 手を置いた時の誤爆を防ぎつつスクロールは許可
document.body.addEventListener("touchstart", function (e) {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });
document.body.addEventListener("touchmove", function (e) {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});

// disable troublesome iOS features
// - double tap zoom
document.ondblclick = (e) => {
  e.preventDefault();
};
// - selection context menu
// TODO: need better solution
document.body.style.webkitUserSelect = "none";
