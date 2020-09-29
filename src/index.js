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
  var grade = document.getElementById('grade').selectedIndex + 1;
  var type = document.getElementById('type').selectedIndex - 1;
  var range = getNumRange(grade);
  let a, b, c, x, s;
  if (type < 0) {
    if (grade == 1) {
      s = Math.floor(Math.random() * 2);
    } else if (grade == 2) {
      s = Math.floor(Math.random() * 3);
    } else {
      s = Math.floor(Math.random() * 4);
    }
  } else {
    s = type;
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
  var canvases = document.getElementById('canvases').getElementsByTagName('canvas');
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
      new Audio('mp3/end.mp3').play();
      playPanel.classList.add('d-none');
      scorePanel.classList.remove('d-none');
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  clearTimeout(countdownTimer);
  gameStart.classList.remove('d-none');
  playPanel.classList.add('d-none');
  // scorePanel.classList.add('d-none');
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
      playPanel.classList.remove('d-none');
      document.getElementById('score').innerText = 0;
      generateData();
      startGameTimer();
    }
  }, 1000);
}

let signaturePads = [];
function initSignaturePad() {
  const canvases = document.getElementById('canvases').getElementsByTagName('canvas');
  const scoreObj = document.getElementById('score');
  for (var i=0; i<canvases.length; i++) {
    const signaturePad = new SignaturePad(canvases[i], {
      minWidth: 5,
      maxWidth: 5,
      penColor: 'black',
      backgroundColor: 'white',
    });
    signaturePad.onEnd = function() {
      var data = signaturePad.toData();
      var count = 0;
      for (var i=0; i<data.length; i++) {
        count += data[i].length;
      }
      if (10 < count && count < 50) {
        var replies = predict(this._canvas, data.length);
        if (isEqual(answers, replies)) {
          new Audio('mp3/correct3.mp3').play();
          scoreObj.innerText = parseInt(scoreObj.innerText) + 1;
          generateData();
        }
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

function getAccuracyScores(imageData) {
  const score = tf.tidy(() => {
    const channels = 1;
    let input = tf.browser.fromPixels(imageData, channels);
    input = tf.cast(input, 'float32').div(tf.scalar(255));
    // input = input.flatten();  // mlp
    input = input.expandDims();
    return model.predict(input).dataSync();
  });
  return score;
}

const kakusus = [1, 1, 1, 1, 2, 2, 1, 2, 1, 1];
function predict(canvas, kaku) {
  var canvases = document.getElementById('canvases').getElementsByTagName('canvas');
  var predicts = new Array(3).fill(' ');
  for (var i=0; i<canvases.length; i++) {
    predicts[i] = canvases[i].dataset.predict;
  }
  var imageData = getImageData(canvas);
  var data = imageData.data;
  var accuracyScores = getAccuracyScores(imageData);
  var maxAccuracy = accuracyScores.indexOf(Math.max.apply(null, accuracyScores));
  if (kaku < kakusus[maxAccuracy]) {  // 画数が足りないものは不正解とする
    maxAccuracy = ' ';
  }
  canvas.dataset.predict = maxAccuracy;
  predicts[parseInt(canvas.getAttribute('id').slice(-1))] = maxAccuracy.toString();
  return predicts;
}


let model;
(async() => {
  initSignaturePad();
  generateData();
  // model = await tf.loadLayersModel('/tegaki-de-anzan/model/model.json');
  model = await tf.loadLayersModel('model/model.json');
})();

