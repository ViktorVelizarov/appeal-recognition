import numpy as np
import matplotlib.pyplot as plt
import os
import cv2
import sys
import json
from ultralytics import YOLO
import io
import contextlib

# Redirect stdout to stderr for YOLO output
class StderrRedirector:
    def __init__(self):
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
        self.buffer = io.StringIO()

    def __enter__(self):
        sys.stdout = self.buffer
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self.original_stdout
        sys.stderr = self.original_stderr
        # Write buffered output to stderr
        sys.stderr.write(self.buffer.getvalue())

def load_trained_model(model_path):
    with StderrRedirector():
        model = YOLO(model_path)
        sys.stderr.write(f"Model loaded from {model_path}\n")
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

def process_image(model, image_path, conf_threshold=0.4):
    # Run prediction with stdout redirected to stderr
    with StderrRedirector():
        results = model.predict(source=image_path, conf=conf_threshold, save=True, line_width=2)
    
    # Get detection results
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = r.names[class_id]
            
            detections.append({
                'class': class_name,
                'confidence': confidence,
                'bbox': [x1, y1, x2, y2]
            })
    
    # Save the result image
    result_image_path = os.path.join('runs/detect/predict', os.path.basename(image_path))
    
    return {
        'detections': detections,
        'result_image_path': result_image_path
    }

def main():
    if len(sys.argv) != 2:
        sys.stderr.write("Usage: python object_detection_YOLO.py <image_path>\n")
        sys.exit(1)
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct absolute paths
    image_path = sys.argv[1]
    model_path = os.path.join(script_dir, 'trained_YOLO8.pt')
    data_yaml_path = os.path.join(script_dir, 'data.yaml')
    
    # Debug information to stderr
    sys.stderr.write(f"Script directory: {script_dir}\n")
    sys.stderr.write(f"Model path: {model_path}\n")
    sys.stderr.write(f"Data YAML path: {data_yaml_path}\n")
    sys.stderr.write(f"Image path: {image_path}\n")
    
    # Load or train model
    if not os.path.exists(model_path):
        sys.stderr.write(f"Model not found at {model_path}\n")
        with StderrRedirector():
            model = YOLO("yolov8m.pt")
            model.train(data=data_yaml_path, epochs=5)
            model.save(model_path)
    else:
        model = load_trained_model(model_path)
    
    # Process the image
    results = process_image(model, image_path)
    
    # Clear any remaining output
    sys.stdout.flush()
    sys.stderr.flush()
    
    # Create a new StringIO buffer for the JSON output
    json_buffer = io.StringIO()
    json.dump(results, json_buffer)
    json_str = json_buffer.getvalue()
    
    # Print only the JSON results to stderr to keep stdout clean for parsing
    sys.stderr.write("JSON_RESULT_BEGIN\n")
    sys.stderr.write(json_str + '\n')
    sys.stderr.write("JSON_RESULT_END\n")
    sys.stderr.flush()

if __name__ == "__main__":
    # Redirect all stdout to stderr
    with contextlib.redirect_stdout(sys.stderr):
        main()
