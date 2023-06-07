import cv2

test_path = "C:\\xampp\\htdocs\\asl-recognition-app\\model\\pre-processing\\test_image4.jpg"

image = cv2.imread(test_path, cv2.IMREAD_COLOR)

if image is None:
    print('Could not open or find the image: ', test_path)
    exit(0)
else:
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    canny_image = cv2.Canny(gray_image, threshold1=20, threshold2=50)
    cv2.imshow('frame', canny_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
