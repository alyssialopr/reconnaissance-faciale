const video = document.getElementById("webcam");
const status = document.getElementById("status");
const alertImage = document.getElementById("alert-image");
let model;
const predictionBuffer = [];
const bufferSize = 25; // 5 secondes à 200 ms d'intervalle

// Charger le modèle entraîné
async function loadModel() {
  status.textContent = "Chargement du modèle...";
  model = await tf.loadLayersModel("model/model.json");
  status.textContent = "Modèle chargé !";
}

// Démarrer la webcam
async function startWebcam() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

// Prendre une photo et l'afficher
function capturePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageDataUrl = canvas.toDataURL("image/png");
  alertImage.src = imageDataUrl;
  alertImage.style.display = "block";
  return imageDataUrl;
}
async function predict() {
  if (!model) return;

  const webcamImage = tf.browser
    .fromPixels(video)
    .resizeBilinear([224, 224])
    .div(255.0)
    .expandDims(0);

  const prediction = await model.predict(webcamImage).data();
  predictionBuffer.push(prediction[0]);

  // Garder uniquement les dernières prédictions pour faire une moyenne
  if (predictionBuffer.length > bufferSize) {
    predictionBuffer.shift();
  }

  // Calculer la moyenne des prédictions
  const averagePrediction =
    predictionBuffer.reduce((a, b) => a + b, 0) / predictionBuffer.length;

  if (averagePrediction < 0.5) {
    const photoUrl = capturePhoto();
    console.log("Photo capturée : ", photoUrl);
    status.textContent = `Visage non reconnu (moyenne: ${averagePrediction.toFixed(
      2
    )}) - Verrouillage...`;
    lockComputer();
  } else {
    status.textContent = `Visage reconnu (moyenne: ${averagePrediction.toFixed(
      2
    )})`;
  }
}

// Verrouiller l'ordinateur (fonction à adapter)
function lockComputer() {
  alert("Verrouillage de l'ordinateur !");
}

loadModel();
startWebcam();

// Boucle de prédiction toutes les 200 ms (~5 secondes pour 25 images)
setInterval(predict, 200);
