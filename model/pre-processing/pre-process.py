import cv2
import os
import numpy as np

orb = cv2.ORB_create()
total_images = 0
# prompt target path
target_path = input("Enter target path: ")

def process_image(image):
    frame_height, frame_width, _ = image.shape
    frame_size = min(frame_height, frame_width)
    frame_x = (frame_width - frame_size) // 2
    frame_y = (frame_height - frame_size) // 2
    cropped_frame = image[frame_y:frame_y+frame_size, frame_x:frame_x+frame_size]
    resized_frame = cv2.resize(cropped_frame, (220, 220), interpolation= cv2.INTER_LINEAR)
    normalized_image = np.zeros((220, 220))
    normalized_image = cv2.normalize(resized_frame,  normalized_image, 0, 255, cv2.NORM_MINMAX)
    grayed_image = cv2.cvtColor(normalized_image, cv2.COLOR_BGR2GRAY)
    orb_detection = orb.detect(grayed_image, None)
    orb_detection, orb_descriptors = orb.compute(grayed_image, orb_detection)
    output = cv2.drawKeypoints(grayed_image, orb_detection, None, color=(0, 255, 0), flags=0)
    return output

# delete path in the target folder with any '!' at the end, include the files in the folder
for folder in os.listdir(target_path):
    if folder.endswith('!'):
        for file in os.listdir(os.path.join(target_path, folder)):
            os.remove(os.path.join(target_path, folder, file))
        os.rmdir(os.path.join(target_path, folder))

# for every folder in path\
for folder in os.listdir(target_path):
    # print that you are selecting the folder
    print(f'Selecting folder {folder}')
    image_number = 1
    # add ! at the end of output path and create it
    output_path = os.path.join(target_path, f'{folder}!')
    # check if output_path exists
    if not os.path.exists(output_path):
        os.mkdir(output_path)
    # for every image in folder
    for file in os.listdir(os.path.join(target_path, folder)):
        if not file.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
            continue
        image = cv2.imread(os.path.join(target_path, folder, file))
        processed_image = process_image(image)
        cv2.imwrite(os.path.join(output_path, f'{image_number}.jpg'), processed_image)
        # print the image_number and the image path
        print(f'Processed image {image_number} in {output_path}')
        image_number += 1
        total_images += 1
        
'''
for file in os.listdir(target_path):
    image = cv2.imread(os.path.join(target_path, file))
    processed_image = process_image(image)
    cv2.imwrite(os.path.join(output_path, f'{image_number}.jpg'), processed_image)
    image_number += 1
'''
print(f'Processed {total_images} images')
