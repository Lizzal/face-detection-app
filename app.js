const webcam = document.getElementById('webcam')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
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

// after webcam start
webcam.addEventListener('play', () => {
  // add canvas for detections to html
  const canvas = faceapi.createCanvasFromMedia(webcam)
  document.body.append(canvas)

  // match canvas to webcamSize
  const webcamSize = { height: webcam.height, width: webcam.width }
  faceapi.matchDimensions(canvas, webcamSize)

  setInterval(async () => {
    // detect faces
    const detection = await faceapi
      .detectAllFaces(webcam, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    // resize detections to webcamSize
    const resizedDetections = faceapi.resizeResults(detection, webcamSize)

    // clear canvas to before drawing new detection
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    // draw detection
    faceapi.draw.drawDetections(canvas, resizedDetections)

    // draw face landmarks
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

    // draw face expressions
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})
