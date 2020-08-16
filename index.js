function initSignaturePad(id){const problems=document.getElementById(id).getElementsByClassName('problem');for(var i=0;i<problems.length;i++){let signaturePads=[];const drawElements=problems[i].getElementsByTagName('CANVAS');for(var j=0;j<drawElements.length;j++){const signaturePad=new SignaturePad(drawElements[j],{minWidth:5,maxWidth:5,penColor:'white',backgroundColor:'black',});signaturePads.push(signaturePad);signaturePad.onEnd=function(){prediction(this._canvas);};}
const clearElement=problems[i].getElementsByClassName('clear');for(var j=0;j<signaturePads.length;j++){(function(signaturePad){clearElement[j].addEventListener('click',function(){signaturePad.clear();prediction(signaturePad._canvas);});}(signaturePads[j]));}
if(i==0){prediction(signaturePads[0]._canvas);}
const nextElement=problems[i].getElementsByClassName('next')[0];if(nextElement){nextElement.addEventListener('click',function(){this.parentNode.parentNode.scrollIntoView(true);});}}}
function getLevels(level){switch(level){case 1:return[8,2,8,2,0,0,0,0];case 2:return[28,6,28,6,8,2,0,0];case 3:return[38,11,38,11,8,2,8,2];case 4:return[38,11,38,11,12,2,16,4];case 5:return[99,50,99,50,16,4,20,6];case 6:return[99,50,99,50,14,6,20,8];default:return[388,111,388,111,12,8,20,11];}}
function generateData(){var age=document.getElementById('age').selectedIndex;var type=document.getElementById('type').selectedIndex-2;var levels=getLevels(age);for(var i=0;i<20;i++){var problem=document.getElementById('problem').cloneNode(true);var a_=problem.getElementsByClassName('a')[0];var b_=problem.getElementsByClassName('b')[0];var x_=problem.getElementsByClassName('x')[0];var y_=problem.getElementsByClassName('y')[0];var z_=problem.getElementsByClassName('z')[0];let a,b,c,x,s;if(type<0){if(age==1){s=Math.floor(Math.random()*2);}else if(age==2){s=Math.floor(Math.random()*3);}else{s=Math.floor(Math.random()*4);}}else{s=type;}
switch(s){case 0:a=Math.floor(Math.random()*levels[0]+levels[1]);b=Math.floor(Math.random()*levels[0]+levels[1]);c=a+b;x='＋';break;case 1:a=Math.floor(Math.random()*levels[2]+levels[3]);b=Math.floor(Math.random()*(a-levels[3])+levels[3]);c=a-b;x='−';break;case 2:a=Math.floor(Math.random()*levels[4]+levels[5]);b=Math.floor(Math.random()*levels[4]+levels[5]);c=a*b;x='×';break;case 3:b=Math.floor(Math.random()*levels[6]+levels[7]);c=Math.floor(Math.random()*levels[6]+levels[7]);a=b*c;x='÷';break;default:console.log('error');}
var vals=[a,b,c];a_.innerText=vals[0];b_.innerText=vals[1];x_.innerText=x;y_.innerText='＝';z_.innerText=c;problem.removeAttribute('id');document.getElementById('problems').appendChild(problem);}
initSignaturePad('problems');}
function generateAnswer(){let correctNum=0;const answers1=document.getElementById('answers1').getElementsByTagName('TABLE')[0];const answers2=document.getElementById('answers2').getElementsByTagName('TABLE')[0];const problems=document.getElementById('problems').getElementsByClassName('problem');for(var i=0;i<problems.length;i++){const answer=problems[i].getElementsByClassName('next')[0].cloneNode(true);const a=answer.getElementsByClassName('a')[0].innerText;const b=answer.getElementsByClassName('b')[0].innerText;const c=answer.getElementsByClassName('c')[0].innerText;const x=answer.getElementsByClassName('x')[0].innerText;const y=answer.getElementsByClassName('y')[0].innerText;let z=answer.getElementsByClassName('z')[0].innerText;if(z==c){z='◯';correctNum+=1}else{z='× '+z;}
if(i<problems.length/2){var tds=answers1.getElementsByTagName('TR')[i].children;}else{var tds=answers2.getElementsByTagName('TR')[i-10].children;}
tds[0].innerText=a;tds[1].innerText=x;tds[2].innerText=b;tds[3].innerText=y;tds[4].innerText=c;tds[5].innerText=z;tds[5].style.display='initial';}
document.getElementById('problems').style.display='none';document.getElementById('gameEnd').style.display='none';document.getElementById('timer').style.display='none';return correctNum;}
function getImageData(drawElement){const inputWidth=inputHeight=28;const tmpCanvas=document.createElement('canvas').getContext('2d');tmpCanvas.drawImage(drawElement,0,0,inputWidth,inputHeight);let imageData=tmpCanvas.getImageData(0,0,inputWidth,inputHeight);return imageData;}
function getAccuracyScores(imageData){const score=tf.tidy(()=>{const channels=1;let input=tf.browser.fromPixels(imageData,channels);input=tf.cast(input,'float32').div(tf.scalar(255));input=input.expandDims();return model.predict(input).dataSync();});return score;}
function prediction(drawElement){const drawElements=drawElement.parentNode.parentNode.getElementsByTagName('CANVAS');const c=drawElement.parentNode.parentNode.parentNode.getElementsByClassName('c')[0];if(c){let result='';for(var i=0;i<drawElements.length;i++){const imageData=getImageData(drawElements[i]);let sum=0;let data=imageData.data;for(var j=0;j<data.length;j+=4){sum+=data[j]+data[j+1]+data[j+2];}
if(sum!=0){const accuracyScores=getAccuracyScores(imageData);const maxAccuracy=accuracyScores.indexOf(Math.max.apply(null,accuracyScores));if(accuracyScores[maxAccuracy]>0.5){result+=maxAccuracy.toString();}}}
c.innerText=result;}}
let model;(async()=>{model=await tf.loadLayersModel('/tegaki-de-anzan/model/model.json');initSignaturePad('preview');})();let playing=true;document.getElementById('end').addEventListener('click',function(){playing=false;const correctNum=generateAnswer();const lap=parseFloat(document.getElementById('lap').innerText);const age=document.getElementById('age').selectedIndex;document.getElementById('finalLap').innerText=Math.round(lap);document.getElementById('finalCorrect').innerText=correctNum;document.getElementById('score').innerText=Math.round(1/(lap+(20-correctNum)*5)*correctNum*(age+10)*1000);const mofumofu=document.getElementById('mofumofu');mofumofu.style.display='block';mofumofu.scrollIntoView(true);});let introduction=document.getElementById('introduction');let gameStart=document.getElementById('gameStart');document.getElementById('start').addEventListener('click',function(){introduction.style.display='none';gameStart.style.display='initial';var timer=setInterval(function(){var counter=document.getElementById('counter');var colors=['skyblue','greenyellow','violet','tomato'];if(parseInt(counter.innerText)>1){var t=parseInt(counter.innerText)-1;counter.style.backgroundColor=colors[t];counter.innerText=t;}else{clearTimeout(timer);counter.style.fontSize='5rem';counter.style.backgroundColor=colors[0];counter.innerText='GO!';var testTimer=setInterval(function(){clearTimeout(testTimer);document.getElementById('countdown').style.display='none';counter.innerText=4;counter.style.backgroundColor=colors[4];generateData();gameEnd.style.display='initial';const startTime=Date.now();const lap=document.getElementById('lap');var lapTimer=setInterval(function(){if(playing){lap.innerText=Math.round((Date.now()-startTime)/1000);}else{clearTimeout(lapTimer);}},100);},1000);}},1000);});