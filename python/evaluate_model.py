import os
import sys
import json
from pathlib import Path
from ultralytics import YOLO
import numpy as np
from tqdm import tqdm
import matplotlib.pyplot as plt
from datetime import datetime

def evaluate_model(model_path, test_data_yaml, conf_threshold=0.25, iou_threshold=0.5):
    """
    Evaluate the YOLOv8 model on a test dataset and calculate various metrics.
    
    Args:
        model_path (str): Path to the trained YOLO model
        test_data_yaml (str): Path to the YAML file containing test dataset configuration
        conf_threshold (float): Confidence threshold for detections
        iou_threshold (float): IoU threshold for NMS
    """
    # Load the model
    model = YOLO(model_path)
    
    # Run validation
    results = model.val(
        data=test_data_yaml,
        conf=conf_threshold,
        iou=iou_threshold,
        plots=True,
        save_json=True
    )
    
    # Create evaluation results directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    eval_dir = Path(f"evaluation_results_{timestamp}")
    eval_dir.mkdir(exist_ok=True)
    
    # Save metrics to a JSON file
    metrics = {
        'mAP50': float(results.box.map50),  # mAP at IoU 0.5
        'mAP50-95': float(results.box.map),  # mAP at IoU 0.5:0.95
        'mean_precision': float(results.box.mp),  # Mean precision
        'mean_recall': float(results.box.mr),  # Mean recall
        'conf_threshold': conf_threshold,
        'iou_threshold': iou_threshold
    }
    
    with open(eval_dir / 'metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
    
    # Generate class-wise metrics
    class_metrics = {}
    for i, class_name in enumerate(model.names.values()):
        p, r, ap50, ap = results.box.class_result(i)
        class_metrics[class_name] = {
            'precision': float(p),
            'recall': float(r),
            'mAP50': float(ap50),
            'mAP50-95': float(ap)
        }
    
    with open(eval_dir / 'class_metrics.json', 'w') as f:
        json.dump(class_metrics, f, indent=4)
    
    # Print summary
    print("\nEvaluation Results:")
    print(f"mAP50: {metrics['mAP50']:.4f}")
    print(f"mAP50-95: {metrics['mAP50-95']:.4f}")
    print(f"Mean Precision: {metrics['mean_precision']:.4f}")
    print(f"Mean Recall: {metrics['mean_recall']:.4f}")
    
    print("\nClass-wise Results:")
    for class_name, class_metric in class_metrics.items():
        print(f"\n{class_name}:")
        print(f"  Precision: {class_metric['precision']:.4f}")
        print(f"  Recall: {class_metric['recall']:.4f}")
        print(f"  mAP50: {class_metric['mAP50']:.4f}")
        print(f"  mAP50-95: {class_metric['mAP50-95']:.4f}")
    
    print(f"\nDetailed results saved in: {eval_dir}")
    return metrics, class_metrics

def main():
    if len(sys.argv) != 3:
        print("Usage: python evaluate_model.py <model_path> <test_data_yaml>")
        sys.exit(1)
    
    model_path = sys.argv[1]
    test_data_yaml = sys.argv[2]
    
    evaluate_model(model_path, test_data_yaml)

if __name__ == "__main__":
    main() 