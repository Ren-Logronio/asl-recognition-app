import cv2
import glob

# select path
path = ''
image_number = 1

def process_image(image):
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(image_gray, threshold1=100, threshold2=200) 

# THE BATCH PROCESSING PART
for file in enumerate(glob.glob(path), start=1):
    image = cv2.imread(file, flags=0) 
    print(f"Reading Image: {file} @ {image_number}")

    image_processed = process_image(image) 
    print(f'Successfully processed image: {file} @ {image_number}')
    
    cv2.imwrite(f"{str(image_number)}.jpg", image_processed) 
    print(f'Successfully saved processed image: {file} @ {image_number}')
    image_number +=1

print(f'Processed {image_number} images')