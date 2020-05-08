const webcam = document.getElementById('webcam')
let predictedAges = []

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(start())

// start webcam
function start() {
  navigator.getUserMedia(
    {
      video: {},
    },
    (stream) => (webcam.srcObject = stream),
    (error) => console.error(error)
  )
}

// on webcam start
webcam.addEventListener('play', () => {
  // controls
  const landmarks = document.getElementById('landmarks')
  const faceExpression = document.getElementById('faceExpression')
  const agePrediction = document.getElementById('agePrediction')

  // add canvas for detections to html
  const canvas = document.getElementById('canvas')

  // match canvas to webcamSize
  const webcamSize = { height: webcam.height, width: webcam.width }
  faceapi.matchDimensions(canvas, webcamSize)

  setInterval(async () => {
    // detect faces
    const detection = await faceapi
      .detectAllFaces(webcam, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()

    // resize detections to webcamSize
    const resizedDetections = faceapi.resizeResults(detection, webcamSize)

    // clear canvas to before drawing new detection
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    // draw detection
    if (detection.checked == true) {
      faceapi.draw.drawDetections(canvas, resizedDetections)
    }

    // draw face landmarks
    if (landmarks.checked == true) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    }

    // draw face expressions
    if (faceExpression.checked == true) {
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }

    // predict age
    if (agePrediction.checked == true) {
      const age = resizedDetections[0].age
      const interpolatedAge = interpolatedAgePredictions(age)
      const topRight = {
        x: resizedDetections[0].detection.box.topRight.x - 50,
        y: resizedDetections[0].detection.box.topRight.y,
      }

      new faceapi.draw.DrawTextField(
        [`${faceapi.utils.round(interpolatedAge, 0)} years`],
        topRight
      ).draw(canvas)
    }
  }, 100)
})

function interpolatedAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30)
  const avgAge = predictedAges.reduce(
    (total, a) => total + a / predictedAges.length
  )
  return avgAge
}
