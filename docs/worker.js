function getAccuracyScores(e){const t=tf.tidy(()=>{const n=1;let t=tf.browser.fromPixels(e,n);return t=tf.cast(t,"float32").div(tf.scalar(255)),t=t.expandDims(),model.predict(t).dataSync()});return t}function predict(e){const t=getAccuracyScores(e),n=t.indexOf(Math.max.apply(null,t));return n}async function loadModel(){model=await tf.loadGraphModel("model/model.json")}async function loadModelAndPredict(e){model||await loadModel(),e.data.klass=predict(e.data.imageData),delete e.data.imageData,postMessage(e.data)}importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js");let model;self.addEventListener("message",loadModelAndPredict)