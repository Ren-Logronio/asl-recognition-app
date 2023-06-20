import numpy as np
import cv2 as cv
image_index = 1
image_low = 80
image_high = 130


orb = cv.ORB_create()

cap = cv.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open camera")
    exit()
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    frame_height, frame_width, _ = frame.shape
    frame_size = min(frame_height, frame_width)
    frame_x = (frame_width - frame_size) // 2
    frame_y = (frame_height - frame_size) // 2
    cropped_frame = frame[frame_y:frame_y+frame_size, frame_x:frame_x+frame_size]
    resized_frame = cv.resize(cropped_frame, (220, 220), interpolation= cv.INTER_LINEAR)
    normalized_image = np.zeros((220, 220))
    normalized_image = cv.normalize(resized_frame,  normalized_image, 0, 255, cv.NORM_MINMAX)
    grayed_image = cv.cvtColor(normalized_image, cv.COLOR_BGR2GRAY)
    orb_detection = orb.detect(grayed_image, None)
    orb_detection, orb_descriptors = orb.compute(grayed_image, orb_detection)
    output = cv.drawKeypoints(grayed_image, orb_detection, None, color=(0, 255, 0), flags=0)
    # if frame is read correctly ret is True
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break
    # Our operations on the frame come here
    

    # Display the resulting frame
    cv.imshow('frame', output)
    '''
    if cv.waitKey(10) == ord('w'):
        image_low +=1
    if cv.waitKey(10) == ord('s'):
        image_low -=1
    if cv.waitKey(10) == ord('e'):
        image_high +=1
    if cv.waitKey(10) == ord('d'):
        image_high -=1
    if cv.waitKey(10) == ord('c'):
        print(f"Low Threshold: {image_low}, High Threshold: {image_high}")
    '''
    if cv.waitKey(25) == ord('r'):
        cv.imwrite(f'{image_index}.jpg', output)
        image_index += 1
    if cv.waitKey(1) == ord('q'):
        break
cap.release()
cv.destroyAllWindows()