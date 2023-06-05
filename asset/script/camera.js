let activeCamera = 'user';

// Function to toggle between the front and rear cameras
function toggleCamera() {
  const constraints = { video: true };

  if (activeCamera === 'user') {
    constraints.video = { facingMode: 'environment' };
    activeCamera = 'environment';
  } else {
    constraints.video = { facingMode: 'user' };
    activeCamera = 'user';
  }

  // Stop the current video stream
  video.srcObject.getTracks().forEach(track => track.stop());

  // Get the new video stream with the updated constraints
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
      video.srcObject = stream;
      video.play();

      // Create an ImageCapture object from the new video stream
      var track = stream.getVideoTracks()[0];
      imageCapture = new ImageCapture(track);
    })
    .catch(function(error) {
      console.log('Error accessing camera: ', error);
    });
}

navigator.mediaDevices.getUserMedia({ video: true })
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
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            context.drawImage(imageBitmap, 0, 0);
          })
          .catch(function(error) {
            console.log('Error grabbing frame: ', error);
          });

        // Schedule the next frame
        setTimeout(drawFrame, 0);
      }

      drawFrame();
    });

    // Start playing the video
    video.play()
      .catch(function(error) {
        console.log('Error playing video: ', error);
      });

    // Add a button or trigger to swap the camera
    var swapCameraButton = document.getElementById('swapCameraButton');
    swapCameraButton.addEventListener('click', toggleCamera);
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
      