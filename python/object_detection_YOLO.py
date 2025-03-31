if __name__ == "__main__":
    import numpy as np
    import matplotlib.pyplot as plt
    import os
    import cv2  

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

    def test_single_image(model, image_path, conf_threshold=0.4):
        # Run prediction
        results = model.predict(source=image_path, conf=conf_threshold, save=True, line_width=2)
        
        # Load and display the image with predictions
        plt.figure(figsize=(12, 10))
        
        # Original image
        img = plt.imread(image_path)
        plt.subplot(1, 2, 1)
        plt.title("Original Image")
        plt.axis('off')
        plt.imshow(img)
        
        # Image with predictions
        # The results[0].plot() method returns the image with detections drawn on it
        result_img = results[0].plot()
        plt.subplot(1, 2, 2)
        plt.title("Detected Objects")
        plt.axis('off')
        plt.imshow(cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB))
        
        plt.tight_layout()
        plt.show()

    # Check if a trained model exists
    if not os.path.exists('trained_YOLO8.pt'):
        # If no saved model, train the model
        model = YOLO("yolov8m.pt")
        model.train(data='data.yaml', epochs=5)
        # Save the trained model
        save_path='trained_YOLO8.pt'
        model.save(save_path)
        print(f"Model saved to {save_path}")
    else:
        # Load the existing trained model
        model = load_trained_model()

        # Test on a specific image
        test_image_path = 'myimage.jpg'  
        test_single_image(model, test_image_path)
