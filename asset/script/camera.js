function getStream() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    return navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        var rearCamera = devices.find(function(device) {
          return device.kind === 'videoinput' && device.facingMode === 'environment';
        });

        var constraints = { video: true };
        if (rearCamera) {
          constraints.video = { deviceId: rearCamera.deviceId };
        }

        return navigator.mediaDevices.getUserMedia(constraints);
      });
  } else {
    console.log('getUserMedia is not supported');
    return Promise.reject(new Error('getUserMedia is not supported'));
  }
}

getStream()
  .then(function(stream) {
    var video = document.createElement('video');
    video.srcObject = stream;

    // Listen for the 'play' event to start drawing frames
    video.addEventListener('play', function() {
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');
      var track = stream.getVideoTracks()[0];
      var imageCapture = new ImageCapture(track);

      function drawFrame() {
        imageCapture.grabFrame()
          .then(function(imageBitmap) {
              let screen_ratio = imageBitmap.width / imageBitmap.height;
              canvas.width = window.height;
              canvas.height = window.width * screen_ratio;
              context.drawImage(imageBitmap, 0, 0);
          })
          .catch(function(error) {
            console.log('Error grabbing frame: ', error);
          });

        // Schedule the next frame
        requestAnimationFrame(drawFrame);
      }

      drawFrame();
    });

    // Start playing the video
    video.play()
      .catch(function(error) {
        console.log('Error playing video: ', error);
      });
  })
  .catch(function(error) {
    console.log('Error accessing webcam: ', error);
  });


    function checkVideoInput() {
        return new Promise(function(resolve, reject) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
              // Video input retrieved successfully
              resolve(true);
              stream.getTracks().forEach(function(track) {
                track.stop(); // Stop the media stream tracks
              });
            })
            .catch(function(error) {
              // Failed to retrieve video input
              resolve(false);
            });
        });
      }
    
    // Usage example
checkVideoInput()
    .then(function(hasVideoInput) {
        hasVideoInput ?  
        document.querySelector('#camLoading').style.display = 'none' : 
        document.querySelector('#camLoading').style.display = 'inherit';
});
      