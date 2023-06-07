function backspace(){
}

function enter(){
}

const STATUS = document.getElementById('status');
const VIDEO = document.getElementById('camera');
const ENABLE_CAM_BUTTON = document.getElementById('enableCam');
const RESET_BUTTON = document.getElementById('reset');
const TRAIN_BUTTON = document.getElementById('train');
const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = [];

const MODEL_URL = '?';

let mobilenet = undefined;
let gatherDataState = STOP_DATA_GATHER;
let videoPlaying = false;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];
let predict = false;

let dataCollectorButtons = document.querySelectorAll('button.dataCollector');

ENABLE_CAM_BUTTON.addEventListener('click', enableCam);
TRAIN_BUTTON.addEventListener('click', trainAndPredict);
RESET_BUTTON.addEventListener('click', reset);

function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  function enableCam() {
    if (hasGetUserMedia()) {
      // getUsermedia parameters.
      const constraints = {
        video: true,
        width: 640, 
        height: 480 
      };
  
      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        VIDEO.srcObject = stream;
        VIDEO.addEventListener('loadeddata', function() {
          videoPlaying = true;
          ENABLE_CAM_BUTTON.classList.add('removed');
        });
      });
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }
  }

/**
 * Loads the MobileNet model and warms it up so ready for use.
 **/
async function loadMobileNetFeatureModel() {
    const URL = MODEL_URL;
    
    mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
    STATUS.innerText = 'Model loaded successfully';
    
    // Warm up the model by passing zeros through it once.
    tf.tidy(function () {
      let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
      console.log(answer.shape);
    });
}
  
  // Call the function immediately to start loading.
loadMobileNetFeatureModel();

function predictLoop() {
    if (predict) {
      tf.tidy(function() {
        let videoFrameAsTensor = tf.browser.fromPixels(VIDEO).div(255);
        let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor,[MOBILE_NET_INPUT_HEIGHT, 
            MOBILE_NET_INPUT_WIDTH], true);
  
        let imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
        let prediction = model.predict(imageFeatures).squeeze();
        let highestIndex = prediction.argMax().arraySync();
        let predictionArray = prediction.arraySync();

        STATUS.innerText = 'Prediction: ' + CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
      });
  
      window.requestAnimationFrame(predictLoop);
    }
  }