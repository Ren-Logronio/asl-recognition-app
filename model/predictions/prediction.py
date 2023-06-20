# import opencv
import cv2 as cv
# import tensorflow
import tensorflow as tf
import numpy as np

with open('labels.txt', 'r') as f:
    labels = f.read().splitlines()

threshold = 0.95

# import tflite model
interpreter = tf.lite.Interpreter(model_path="model_unquant.tflite")
interpreter.allocate_tensors()

# get input and output tensors

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
    resized_frame = cv.resize(cropped_frame, (224, 224), interpolation= cv.INTER_LINEAR)
    normalized_image = np.zeros((224, 224))
    normalized_image = cv.normalize(resized_frame,  normalized_image, 0, 255, cv.NORM_MINMAX)
    grayed_image = cv.cvtColor(normalized_image, cv.COLOR_BGR2GRAY)
    orb_detection = orb.detect(grayed_image, None)
    orb_detection, orb_descriptors = orb.compute(grayed_image, orb_detection)
    output = cv.drawKeypoints(grayed_image, orb_detection, None, color=(0, 255, 0), flags=0)

    # if frame is read correctly ret is True
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break

    # load the frame into the model
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    interpreter.set_tensor(input_details[0]['index'], np.expand_dims(normalized_image.astype(np.float32), axis=0))
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    # print the predicted label
    predicted_label_index = np.argmax(output_data)
    predicted_label = labels[predicted_label_index]
    print(predicted_label)

    # show output with the text showing prediction
    # display = cv.putText(output, str(predicted_labels), (50, 50), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv.LINE_AA)
    cv.imshow('frame', normalized_image)

    if cv.waitKey(1000) == ord('q'):
        break

# When everything done, release the capture
cap.release()
cv.destroyAllWindows()