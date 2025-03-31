if __name__ == "__main__":
    import numpy as np
    import matplotlib.pyplot as plt
    import random
    import os
    import cv2  
    import shutil
    import tqdm
    import glob

    import torch

    images_path = 'colorful_fashion_dataset_for_object_detection/JPEGImages/'
    annotations_path  = 'colorful_fashion_dataset_for_object_detection/Annotations_txt/'
    path = 'colorful_fashion_dataset_for_object_detection/'

    from ultralytics import YOLO


    # load pre-trained model
    detection_model = YOLO("yolov8m.pt")

    # choose random image
    img = random.choice(images_path)

    i=detection_model.predict(source='https://i.stack.imgur.com/GRdCC.jpg', conf=0.5, save=True, line_thickness=2, hide_labels=False)

    im = plt.imread('https://i.stack.imgur.com/GRdCC.jpg')
    plt.figure(figsize=(20,10))
    plt.axis('off')
    plt.imshow(im)