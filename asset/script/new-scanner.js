const probabilityThreshold = 90;
const video = document.querySelector('#video');
const loading = document.querySelector('#loading');
const output = document.querySelector('#output-prediction');
const debug_detection = document.querySelector('#detection');
const debug_prediction = document.querySelector('#prediction');
const wait = document.querySelector('#wait');
const expressionButton = document.querySelector('#expression-button');
const alphabetButton = document.querySelector('#alphabet-button');
const cameraToggleButton = document.querySelector('#toggle-camera');
const scannerFrame = document.querySelector('#scanner-frame');
const predictionThreshold = 0.9;
let predictionEnabled = false;
let facing = "environment";
let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
let android = "Android";
let typeOfOS = navigator.userAgentData.platform || navigator.platform;
let handDetection_Model;
let handAlphabet_Model;
let handExpression_Model;
let constraints;
let mode = "alphabet";
let webcam;
let flipped; // for android only

async function loadHandExpressionModel(){
    let handExpressionModel;
    const modelURL = "./model/expressions/model.json";
    const metadataURL = "./model/expressions/metadata.json";
    handExpressionModel = await tmImage.load(modelURL, metadataURL);
    return handExpressionModel;
}

async function loadHandAlphabetModel(){
    let handAlphabetModel;
    const modelURL = "./model/alphabets/model.json";
    const metadataURL = "./model/alphabets/metadata.json";
    handAlphabetModel = await tmImage.load(modelURL, metadataURL);
    return handAlphabetModel;
}

async function loadHandDetectionModel(){
    let handDetectionModel;
    const modelURL = "./model/detections/model.json";
    const metadataURL = "./model/detections/metadata.json";
    handDetectionModel = await tmImage.load(modelURL, metadataURL);
    return handDetectionModel;
}

async function handDetect(){
    let maxPrediction = predictionThreshold;
    let maxClassname = "";
    const prediction = await handDetection_Model.predict(webcam.canvas);
    prediction.forEach((element) => {
        if(element.probability > maxPrediction){
            maxPrediction = element.probability;
            maxClassname = element.className;
        }
    });
    return maxClassname;
}

async function handPredict(){
    let maxPrediction = predictionThreshold;
    let maxClassname = "";
    if(mode == "expression"){
        const prediction = await handExpression_Model.predict(webcam.canvas);
        prediction.forEach((element) => {
            if(element.probability > maxPrediction){
                maxPrediction = element.probability;
                maxClassname = element.className;
            }
        });
    } else if (mode == "alphabet"){
        const prediction = await handAlphabet_Model.predict(webcam.canvas);
        prediction.forEach((element) => {
            if(element.probability > maxPrediction ){
                maxPrediction = element.probability;
                maxClassname = element.className;
            }
        });
    }
    return maxClassname;
}

// check uri content parameter named facing in url
function checkOrientation() {
    let url = new URL(window.location.href);
    let facingParam = url.searchParams.get("facing");
    if (facingParam != null) {
        // facingParam can only either be user or environment
        if (facingParam == "user" || facingParam == "environment") {
            flipped = (facingParam == "user");
            return facingParam;
        } else {
            return "environment";
        }
    }
}

function checkPlatform() {
    if (windowsPlatforms.includes(typeOfOS)) {
        cameraToggleButton.remove();
        return { video: {mandatory: {minWidth: 224, minHeight: 224, maxWidth: 512, maxHeight: 512} } };
    } else if (typeOfOS == android) {
        return { video: { 
            facingMode: { exact: facing }, 
            mandatory: {minWidth: 224, minHeight: 224, maxWidth: 512, maxHeight: 512} }
        };
    } else {
        
        return { video: {mandatory: {minWidth: 224, minHeight: 224, maxWidth: 512, maxHeight: 512} } };
    }
}

function isAndroid() {
    return (typeOfOS == android)
}

async function initialize(){
    facing = checkOrientation();
    changeModeToExpression();
    changeModeToAlphabet();
    // constraints = checkPlatform();
    if(isAndroid()){
        webcam = new tmImage.Webcam(348, 348, flipped);
        cameraToggleButton.classList.remove("d-none");
        await webcam.setup({ facingMode: facing });
    } else {
        webcam = new tmImage.Webcam(512, 512, true);
        cameraToggleButton.remove();
        await webcam.setup();
    }
    webcam.play();
    loading.remove();
    document.getElementById("camera-container").appendChild(webcam.canvas);

    handDetection_Model = await loadHandDetectionModel();
    handExpression_Model = await loadHandExpressionModel();
    handAlphabet_Model = await loadHandAlphabetModel();
    
    webcamLoop();
    setInterval(() => {
        detectLoop();
    }, 1000);

    scannerFrame.classList.remove("d-none");
}

function toggleCamera() {
    location.href = "scan.html?facing=" + (facing == "environment" ? "user" : "environment");
}

function changeModeToExpression() {
    if (mode == "alphabet") {
        mode = "expression";
        alphabetButton.classList.remove("btn-light");
        alphabetButton.classList.add("btn-outline-light");
        expressionButton.classList.remove("btn-outline-light");
        expressionButton.classList.add("btn-light");
    }
}

function changeModeToAlphabet() {
    if (mode == "expression") {
        mode = "alphabet";
        expressionButton.classList.remove("btn-light");
        expressionButton.classList.add("btn-outline-light");
        alphabetButton.classList.remove("btn-outline-light");
        alphabetButton.classList.add("btn-light");
    }
}

function webcamLoop(){
    webcam.update();
    predictLoop();
    requestAnimationFrame(webcamLoop);
}

async function detectLoop(){
    await handDetect().then((result) => {
        if(result == "true"){
            predictionEnabled = true;
            scannerFrame.style.opacity = 0.75;
            scannerFrame.style.width = "215px";
        } else {
            predictionEnabled = false;
            scannerFrame.style.opacity = 0.25;
            scannerFrame.style.width = "200px";
        }
    });
}

async function predictLoop(){
    if(predictionEnabled){
        wait.style.display = "inline-block";
        await handPredict().then((result) => {
            if(result != "none" || result.length > 0){
                wait.classList.add("d-none");
                output.innerHTML = result.toUpperCase();
            }
        });
    } else {
        wait.style.display = "none";
        wait.classList.remove("d-none");
        output.innerHTML = "";
    }
}

document.onload = initialize();