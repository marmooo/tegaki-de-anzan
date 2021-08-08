const infoPanel = document.getElementById('infoPanel');
const canvases = document.getElementById('canvases').getElementsByTagName('canvas');
let endAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();


function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.documentElement.dataset.theme = 'dark';
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
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
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
    loadAudio('mp3/end.mp3'),
    loadAudio('mp3/correct3.mp3'),
  ];
  Promise.all(promises).then(audioBuffers => {
    endAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
  });
}

function isEqual(arr1, arr2) {
  for (var i=0; i<arr1.length; i++) {
    if (arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

// +-*/のテストデータ生成範囲を返却
function getNumRange(grade) {
  switch(grade) {
    case 1: return [ 8,2,      8, 2,    0,0,   0,0];
    case 2: return [28,6,     28, 6,    8,2,   0,0];
    case 3: return [38,11,    38,11,    8,2,   8,2];
    case 4: return [38,11,    38,11,   12,2,  16,4];
    case 5: return [99,50,    99,50,   16,4,  20,6];
    case 6: return [99,50,    99,50,   14,6,  20,8];
    default:return [388,111, 388,111,  12,8,  20,11];
  }
}

let answers = new Array(3);
function generateData() {
  const grade = document.getElementById('gradeOption').selectedIndex + 1;
  const course = document.getElementById('courseOption').selectedIndex - 1;
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
  switch(s) {
    case 0:
      a = Math.floor(Math.random() * range[0] + range[1]);
      b = Math.floor(Math.random() * range[0] + range[1]);
      c = a + b;
      x = '＋';
      break;
    case 1:
      b = Math.floor(Math.random() * range[2] + range[3]);
      c = Math.floor(Math.random() * range[2] + range[3]);
      a = b + c;
      x = '−';
      break;
    case 2:
      a = Math.floor(Math.random() * range[4] + range[5]);
      b = Math.floor(Math.random() * range[4] + range[5]);
      c = a * b;
      x = '×';
      break;
    case 3:
      b = Math.floor(Math.random() * range[6] + range[7]);
      c = Math.floor(Math.random() * range[6] + range[7]);
      a = b * c;
      x = '÷';
      break;
    default:
      console.log('error');
  }
  var num = document.getElementById('num');
  num.innerText = `${a}${x}${b}＝`;
  var cStr = ('   ' + c).slice(-3);  // whitespae padding
  answers = cStr.split('');
  for (var i=0; i<canvases.length; i++) {
    canvases[i].dataset.predict = ' ';
    signaturePads[i].clear();
  }
}

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  var timeNode = document.getElementById('time');
  timeNode.innerText = '180秒 / 180秒';
  gameTimer = setInterval(function() {
    var arr = timeNode.innerText.split('秒 /');
    var t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.innerText = (t-1) + '秒 /' + arr[1];
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      infoPanel.classList.add('d-none');
      scorePanel.classList.remove('d-none');
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  clearTimeout(countdownTimer);
  gameStart.classList.remove('d-none');
  infoPanel.classList.add('d-none');
  scorePanel.classList.add('d-none');
  var counter = document.getElementById('counter');
  counter.innerText = 3;
  countdownTimer = setInterval(function(){
    var colors = ['skyblue', 'greenyellow', 'violet', 'tomato'];
    if (parseInt(counter.innerText) > 1) {
      var t = parseInt(counter.innerText) - 1;
      counter.style.backgroundColor = colors[t];
      counter.innerText = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add('d-none');
      infoPanel.classList.remove('d-none');
      document.getElementById('score').innerText = 0;
      generateData();
      startGameTimer();
    }
  }, 1000);
}

let signaturePads = [];
function initSignaturePad() {
  for (var i=0; i<canvases.length; i++) {
    const signaturePad = new SignaturePad(canvases[i], {
      minWidth: 5,
      maxWidth: 5,
      penColor: 'black',
      backgroundColor: 'white',
      throttle: 0,
    });
    signaturePad.onEnd = function() {
      var data = signaturePad.toData();
      var count = 0;
      for (var i=0; i<data.length; i++) {
        count += data[i].points.length;
      }
      if (5 < count && count < 100) {
        const pos = [...canvases].indexOf(this.canvas);
        predict(this.canvas, pos, data.length, count);
      }
    };
    signaturePads.push(signaturePad);
    var canvas = canvases[i];
    var eraser = canvases[i].nextElementSibling;
    eraser.onclick = function() {
      signaturePad.clear();
      canvas.dataset.predict = ' ';
    };
  }
}

let canvasCache = document.createElement('canvas').getContext('2d');
function getImageData(drawElement) {
  const inputWidth = inputHeight = 28;
  // resize
  canvasCache.drawImage(drawElement, 0, 0, inputWidth, inputHeight);
  // invert color
  var imageData = canvasCache.getImageData(0, 0, inputWidth, inputHeight);
  var data = imageData.data;
  for (var i = 0; i < data.length; i+=4) {
    data[i] = 255 - data[i];
    data[i+1] = 255 - data[i+1];
    data[i+2] = 255 - data[i+2];
  }
  return imageData;
}

const kakusus = [1, 1, 1, 1, 2, 2, 1, 2, 1, 1];  // japanese style
function getReplies(predicted) {
  var canvas = canvases[predicted.pos];
  var predicts = new Array(3).fill(' ');
  for (var i=0; i<canvases.length; i++) {
    predicts[i] = canvases[i].dataset.predict;
  }
  if (predicted.klass != 1 && predicted.count < 15) {
    predicted.klass = '';
  } else if (predicted.kaku < kakusus[predicted.klass]) {  // 画数が足りないものは不正解とする
    predicted.klass = '';
  }
  canvas.dataset.predict = predicted.klass;
  predicts[parseInt(canvas.getAttribute('id').slice(-1))] = predicted.klass.toString();
  return predicts;
}

function predict(canvas, pos, kaku, count) {
  const imageData = getImageData(canvas);
  worker.postMessage({ pos:pos, imageData:imageData, kaku:kaku, count:count });
}


const worker = new Worker('worker.js');
worker.addEventListener('message', function(e) {
  var replies = getReplies(e.data);
  if (isEqual(answers, replies)) {
    playAudio(correctAudio);
    const scoreObj = document.getElementById('score');
    scoreObj.innerText = parseInt(scoreObj.innerText) + 1;
    generateData();
  }
});
initSignaturePad();
generateData();

// https://webinlet.com/2020/ios11以降でピンチインアウト拡大縮小禁止
// 手を置いた時の誤爆を防ぎつつスクロールは許可
document.body.addEventListener("touchstart", function(e) {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive:false });
document.body.addEventListener("touchmove", function(e) {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive:false });
document.addEventListener('click', unlockAudio, { once:true, useCapture:true });

