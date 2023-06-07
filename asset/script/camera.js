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