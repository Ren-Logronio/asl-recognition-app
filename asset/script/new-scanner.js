let video = document.querySelector('#video');
let configuration;
let facing = "environment";
let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
let android = "Android";
let typeOfOS = navigator.userAgentData.platform;

// check uri content parameter named facing in url
function checkOrientation() {
    let url = new URL(window.location.href);
    let facingParam = url.searchParams.get("facing");
    if (facingParam != null) {
        // facingParam can only either be user or environment
        if (facingParam == "user" || facingParam == "environment") {
            return facingParam;
        } else {
            return "environment";
        }
    }
}

function checkPlatform() {
    if (windowsPlatforms.includes(typeOfOS)) {
        return { video: true };
    } else if (typeOfOS == android) {
        return { video: { facingMode: { exact: facing } } };
    } else {
        return { video: true };
    }
}

function initialize(){
    facing = checkOrientation();
    configuration = checkPlatform();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(configuration)
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            });
    }
}

function toggleCamera() {
    location.href = "scan.html?facing=" + (facing == "environment" ? "user" : "environment");
}

// on load
document.onload = initialize();