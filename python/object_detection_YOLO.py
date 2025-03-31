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


    def load_trained_model(model_path='trained_YOLO8.pt'):
        model = YOLO(model_path)
        print(f"Model loaded from {model_path}")
        return model

    def convert(size,x,y,w,h):
        box = np.zeros(4)
        dw = 1./size[0]
        dh = 1./size[1]
        x = x/dw
        w = w/dw
        y = y/dh
        h = h/dh
        box[0] = x-(w/2.0)
        box[1] = x+(w/2.0)
        box[2] = y-(h/2.0)
        box[3] = y+(h/2.0)

        return (box)

    def plot_annotations(img, filename):
        with open(annotations_path+filename, 'r') as f:
            for line in f:
                value = line.split()
                cls = int(value[0])
                x = float(value[1])
                y = float(value[2])
                w = float(value[3])
                h = float(value[4])
                
                img_h, img_w = img.shape[:2]
                bb = convert((img_w, img_h), x,y,w,h)
                cv2.rectangle(img, (int(round(bb[0])),int(round(bb[2]))),(int(round(bb[1])),int(round(bb[3]))),(255,0,0),2)
                plt.axis('off')
                plt.imshow(img)

        model = YOLO("yolov8m.pt")
        model.train(data='data.yaml', epochs=5)
        # Save the trained model
        save_path='trained_YOLO8.pt'
        model.save(save_path)
        print(f"Model saved to {save_path}")


