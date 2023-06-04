navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
        var video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // Create a canvas element
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');

        // Create an ImageCapture object from the video stream
        var track = stream.getVideoTracks()[0];
        var imageCapture = new ImageCapture(track);

        // Draw the webcam image on the canvas every time a new frame is available
        function drawFrame() {
            imageCapture.grabFrame()
                .then(function(imageBitmap) {
                    canvas.width = imageBitmap.width;
                    canvas.height = imageBitmap.height;
                    context.drawImage(imageBitmap, 0, 0);
                    requestAnimationFrame(drawFrame);
                })
                .catch(function(error) {
                    console.log('Error grabbing frame: ', error);
                });
        }

        drawFrame();
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
      