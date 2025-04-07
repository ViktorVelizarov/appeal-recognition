import numpy as np
import matplotlib.pyplot as plt
import os
import cv2
import sys
import json
from ultralytics import YOLO
import io
import contextlib
import datetime
import shutil

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
    original_image = cv2.imread(image_path)
    
    # Get the script directory for absolute paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create a timestamp-based directory for this prediction
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = os.path.join(script_dir, 'runs', timestamp)
    os.makedirs(run_dir, exist_ok=True)
    
    # Save the original image
    original_filename = os.path.basename(image_path)
    original_path = os.path.join(run_dir, 'original_' + original_filename)
    cv2.imwrite(original_path, original_image)
    
    # Create directory for cropped images
    cropped_dir = os.path.join(run_dir, 'cropped')
    os.makedirs(cropped_dir, exist_ok=True)
    
    # Find the YOLO detection result image
    yolo_result_dir = os.path.join(script_dir, 'runs', 'detect', 'predict')
    yolo_result_path = os.path.join(yolo_result_dir, original_filename)
    
    # Copy the YOLO detection result to our new directory
    detected_path = os.path.join(run_dir, 'detected_' + original_filename)
    if os.path.exists(yolo_result_path):
        shutil.copy2(yolo_result_path, detected_path)
        sys.stderr.write(f"Copied detection image from {yolo_result_path} to {detected_path}\n")
    else:
        # If YOLO didn't save the image, we'll create a copy of the original
        cv2.imwrite(detected_path, original_image)
        sys.stderr.write(f"Warning: YOLO detection image not found at {yolo_result_path}\n")
    
    # Draw bounding boxes on the detection image
    detection_image = cv2.imread(detected_path)
    for i, r in enumerate(results):
        boxes = r.boxes
        for j, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = r.names[class_id]
            
            # Draw bounding box
            cv2.rectangle(detection_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(detection_image, f"{class_name} {confidence:.2f}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # Crop the detected object
            cropped_image = original_image[y1:y2, x1:x2]
            cropped_filename = f'cropped_{i}_{j}_{class_name}.jpg'
            cropped_path = os.path.join(cropped_dir, cropped_filename)
            cv2.imwrite(cropped_path, cropped_image)
            sys.stderr.write(f"Saved cropped image to {cropped_path}\n")
            
            detections.append({
                'class': class_name,
                'confidence': confidence,
                'bbox': [x1, y1, x2, y2],
                'cropped_image': cropped_filename
            })
    
    # Save the detection image with bounding boxes
    cv2.imwrite(detected_path, detection_image)
    
    return {
        'detections': detections,
        'result_image_path': detected_path,
        'original_image_path': original_path,
        'run_directory': run_dir
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
