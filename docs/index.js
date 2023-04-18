let hinted=!1;const countPanel=document.getElementById("countPanel"),infoPanel=document.getElementById("infoPanel"),playPanel=document.getElementById("playPanel"),scorePanel=document.getElementById("scorePanel"),gameTime=180,canvases=[...document.getElementById("canvases").getElementsByTagName("canvas")],pads=initSignaturePads(canvases);let answers=new Array(3);const audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3"),loadAudio("incorrect","mp3/incorrect1.mp3"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}async function playAudio(b,c){const d=await loadAudio(b,audioBufferCache[b]),a=audioContext.createBufferSource();if(a.buffer=d,c){const b=audioContext.createGain();b.gain.value=c,b.connect(audioContext.destination),a.connect(b),a.start()}else a.connect(audioContext.destination),a.start()}async function loadAudio(a,c){if(audioBufferCache[a])return audioBufferCache[a];const d=await fetch(c),e=await d.arrayBuffer(),b=await audioContext.decodeAudioData(e);return audioBufferCache[a]=b,b}function unlockAudio(){audioContext.resume()}function isEqual(a,b){for(let c=0;c<a.length;c++)if(a[c]!=b[c])return!1;return!0}function getNumRange(a){switch(a){case 1:return[8,2,8,2,0,0,0,0];case 2:return[28,6,28,6,8,2,0,0];case 3:return[38,11,38,11,8,2,8,2];case 4:return[38,11,38,11,12,2,16,4];case 5:return[99,50,99,50,16,4,20,6];case 6:return[99,50,99,50,14,6,20,8];default:return[388,111,388,111,12,8,20,11]}}function generateData(){hint=!1;const g=document.getElementById("gradeOption").selectedIndex+1,h=document.getElementById("courseOption").selectedIndex-1,a=getNumRange(g);let c,b,d,e,f;switch(h<0?g==1?f=Math.floor(Math.random()*2):g==2?f=Math.floor(Math.random()*3):f=Math.floor(Math.random()*4):f=h,f){case 0:c=Math.floor(Math.random()*a[0]+a[1]),b=Math.floor(Math.random()*a[0]+a[1]),d=c+b,e="＋";break;case 1:b=Math.floor(Math.random()*a[2]+a[3]),d=Math.floor(Math.random()*a[2]+a[3]),c=b+d,e="−";break;case 2:c=Math.floor(Math.random()*a[4]+a[5]),b=Math.floor(Math.random()*a[4]+a[5]),d=c*b,e="×";break;case 3:b=Math.floor(Math.random()*a[6]+a[7]),d=Math.floor(Math.random()*a[6]+a[7]),c=b*d,e="÷";break;default:console.log("error")}const i=document.getElementById("num");i.textContent=`${c}${e}${b}＝`;const j=("   "+d).slice(-3);answers=j.split("");for(let a=0;a<canvases.length;a++)canvases[a].dataset.predict=" ",pads[a].clear()}let gameTimer;function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio("end"),infoPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"))},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}let countdownTimer;function countdown(){clearTimeout(countdownTimer),countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3,countdownTimer=setInterval(()=>{const b=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const c=parseInt(a.textContent)-1;a.style.backgroundColor=b[c],a.textContent=c}else clearTimeout(countdownTimer),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),document.getElementById("score").textContent=0,generateData(),startGameTimer()},1e3)}function initSignaturePads(a){const b=[];for(let d=0;d<a.length;d++){const e=a[d],c=new SignaturePad(e,{minWidth:5,maxWidth:5,penColor:"black",backgroundColor:"white",throttle:0});c.addEventListener("endStroke",()=>{const d=c.toData();let b=0;for(let a=0;a<d.length;a++)b+=d[a].points.length;if(5<b&&b<100){const e=a.indexOf(c.canvas);predict(c.canvas,e,d.length,b)}});const f=e.nextElementSibling;f.onclick=()=>{c.clear(),e.dataset.predict=" "},b.push(c)}return b}const canvasCache=document.createElement("canvas").getContext("2d");function getImageData(d){const b=inputHeight=28;canvasCache.drawImage(d,0,0,b,inputHeight);const c=canvasCache.getImageData(0,0,b,inputHeight),a=c.data;for(let b=0;b<a.length;b+=4)a[b]=255-a[b],a[b+1]=255-a[b+1],a[b+2]=255-a[b+2];return c}const kakusus=[1,1,1,1,2,2,1,2,1,1];function getReplies(a){const c=canvases[a.pos],b=new Array(3).fill(" ");for(let a=0;a<canvases.length;a++)b[a]=canvases[a].dataset.predict;return a.klass!=1&&a.count<15?a.klass="":a.kaku<kakusus[a.klass]&&(a.klass=""),c.dataset.predict=a.klass,b[parseInt(c.getAttribute("id").slice(-1))]=a.klass.toString(),b}function predict(a,b,c,d){const e=getImageData(a);worker.postMessage({pos:b,imageData:e,kaku:c,count:d})}function showAnswer(){hinted||(hinted=!0,document.getElementById("num").textContent+=answers.join(""),playAudio("incorrect"),playPanel.style.pointerEvents="none",setTimeout(()=>{generateData(),playPanel.style.pointerEvents="auto"},3e3))}const worker=new Worker("worker.js");worker.addEventListener("message",a=>{const b=getReplies(a.data);if(isEqual(answers,b)){playAudio("correct");const a=document.getElementById("score");hinted||(a.textContent=parseInt(a.textContent)+1),generateData()}}),generateData(),document.getElementById("hint").onclick=showAnswer,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("startButton").onclick=countdown,document.getElementById("restartButton").onclick=countdown,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})