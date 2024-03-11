const countPanel=document.getElementById("countPanel"),infoPanel=document.getElementById("infoPanel"),playPanel=document.getElementById("playPanel"),scorePanel=document.getElementById("scorePanel"),canvases=document.getElementById("canvases").getElementsByTagName("canvas"),canvasCache=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),pads=initSignaturePads(canvases),gameTime=180;let gameTimer,answers=new Array(3),hinted=!1,correctCount=0;const audioContext=new globalThis.AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3"),loadAudio("incorrect","mp3/incorrect1.mp3"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function isEqual(e,t){for(let n=0;n<e.length;n++)if(e[n]!=t[n])return!1;return!0}function getNumRange(e){switch(e){case 1:return[8,2,8,2,0,0,0,0];case 2:return[28,6,28,6,8,2,0,0];case 3:return[38,11,38,11,8,2,8,2];case 4:return[38,11,38,11,12,2,16,4];case 5:return[99,50,99,50,16,4,20,6];case 6:return[99,50,99,50,14,6,20,8];default:return[388,111,388,111,12,8,20,11]}}function generateData(){hint=!1;const a=document.getElementById("gradeOption").selectedIndex+1,r=document.getElementById("courseOption").selectedIndex-1,e=getNumRange(a);let n,t,s,o,i;switch(r<0?a==1?i=Math.floor(Math.random()*2):a==2?i=Math.floor(Math.random()*3):i=Math.floor(Math.random()*4):i=r,i){case 0:n=Math.floor(Math.random()*e[0]+e[1]),t=Math.floor(Math.random()*e[0]+e[1]),s=n+t,o="＋";break;case 1:t=Math.floor(Math.random()*e[2]+e[3]),s=Math.floor(Math.random()*e[2]+e[3]),n=t+s,o="−";break;case 2:n=Math.floor(Math.random()*e[4]+e[5]),t=Math.floor(Math.random()*e[4]+e[5]),s=n*t,o="×";break;case 3:t=Math.floor(Math.random()*e[6]+e[7]),s=Math.floor(Math.random()*e[6]+e[7]),n=t*s,o="÷";break;default:console.log("error")}const c=document.getElementById("num");c.textContent=`${n}${o}${t}＝`;const l=("   "+s).slice(-3);answers=l.split("");for(let e=0;e<canvases.length;e++)canvases[e].dataset.predict=" ",pads[e].clear()}function countdown(){correctCount=0,countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const e=document.getElementById("counter");e.textContent=3;const t=setInterval(()=>{const n=["skyblue","greenyellow","violet","tomato"];if(parseInt(e.textContent)>1){const t=parseInt(e.textContent)-1;e.style.backgroundColor=n[t],e.textContent=t}else clearTimeout(t),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),generateData(),startGameTimer()},1e3)}function startGame(){clearInterval(gameTimer),initTime(),countdown()}function startGameTimer(){const e=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){document.getElementById("score").textContent=correctCount}function initSignaturePads(e){const t=[];for(let s=0;s<e.length;s++){const o=e[s],n=new SignaturePad(o,{minWidth:5,maxWidth:5,penColor:"black",backgroundColor:"white",throttle:0});n.addEventListener("endStroke",()=>{const s=n.toData();let t=0;for(let e=0;e<s.length;e++)t+=s[e].points.length;if(5<t&&t<100){const o=e.indexOf(n.canvas);predict(n.canvas,o,s.length,t)}});const i=o.nextElementSibling;i.onclick=()=>{n.clear(),o.dataset.predict=" "},t.push(n)}return t}function getImageData(e){const n=inputHeight=28;canvasCache.drawImage(e,0,0,n,inputHeight);const s=canvasCache.getImageData(0,0,n,inputHeight),t=s.data;for(let e=0;e<t.length;e+=4)t[e]=255-t[e],t[e+1]=255-t[e+1],t[e+2]=255-t[e+2];return s}const kakusus=[1,1,1,1,2,2,1,2,1,1];function getReplies(e){const n=canvases[e.pos],t=new Array(3).fill(" ");for(let e=0;e<canvases.length;e++)t[e]=canvases[e].dataset.predict;return e.klass!=1&&e.count<15?e.klass="":e.kaku<kakusus[e.klass]&&(e.klass=""),n.dataset.predict=e.klass,t[parseInt(n.getAttribute("id").slice(-1))]=e.klass.toString(),t}function predict(e,t,n,s){const o=getImageData(e);worker.postMessage({pos:t,imageData:o,kaku:n,count:s})}function showAnswer(){hinted||(hinted=!0,document.getElementById("num").textContent+=answers.join(""),playAudio("incorrect",.3),setTimeout(()=>{hinted=!1,generateData()},3e3))}const worker=new Worker("worker.js");worker.addEventListener("message",e=>{const t=getReplies(e.data);isEqual(answers,t)&&(playAudio("correct",.3),hinted||(correctCount+=1),generateData())}),generateData(),document.getElementById("hint").onclick=showAnswer,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("startButton").onclick=startGame,document.getElementById("restartButton").onclick=startGame,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})