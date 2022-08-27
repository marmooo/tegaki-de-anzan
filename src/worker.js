function getAccuracyScores(imageData) {
  const score = tf.tidy(() => {
    const channels = 1;
    let input = tf.browser.fromPixels(imageData, channels);
    input = tf.cast(input, "float32").div(tf.scalar(255));
    // input = input.flatten();  // mlp
    input = input.expandDims();
    return model.predict(input).dataSync();
  });
  return score;
}

function predict(imageData) {
  const scores = getAccuracyScores(imageData);
  const klass = scores.indexOf(Math.max.apply(null, scores));
  return klass;
}

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.20.0/dist/tf.min.js");

let model;
(async () => {
  model = await tf.loadGraphModel("model/model.json");
})();

self.addEventListener("message", (e) => {
  e.data.klass = predict(e.data.imageData);
  delete e.data.imageData;
  postMessage(e.data);
});
