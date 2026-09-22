import React, { useState } from 'react';
import DetectionCard from './DetectionCard';

// bbox is [x1, y1, x2, y2] in pixel coordinates of the ORIGINAL image
// (see python/object_detection_YOLO.py). The stage image renders at its
// natural aspect ratio (no cropping), so percent-of-natural-size lines up
// exactly with percent-of-rendered-size regardless of container width.
const toBoxStyle = (bbox, naturalSize) => {
  if (!bbox || bbox.length !== 4 || !naturalSize) return null;
  const [x1, y1, x2, y2] = bbox;
  const { w, h } = naturalSize;
  return {
    left: `${(x1 / w) * 100}%`,
    top: `${(y1 / h) * 100}%`,
    width: `${((x2 - x1) / w) * 100}%`,
    height: `${((y2 - y1) / h) * 100}%`,
  };
};

const DetectionResultView = ({ result }) => {
  const [naturalSize, setNaturalSize] = useState(null);
  const items = result.croppedImages || [];

  return (
    <div className="app-grid">
      <div className="app-stage">
        <img
          src={result.originalImageUrl}
          alt="Your upload"
          onLoad={(e) => setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
        />
        <div className="boxes">
          {naturalSize &&
            items.map((detection, index) => {
              const style = toBoxStyle(detection.bbox, naturalSize);
              if (!style) return null;
              return (
                <div className="box" key={detection.imageUrl || index} style={style}>
                  <span className="box-tag">
                    D-0{index + 1} &middot; {(detection.confidence || 0).toFixed(2)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="out">
        <dl className="tele">
          <div>
            <dt>Run</dt>
            <dd>{result.runId}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Result</dd>
          </div>
          <div>
            <dt>Found</dt>
            <dd>{items.length} items</dd>
          </div>
        </dl>

        {items.length === 0 ? (
          <p className="empty">No garments were detected in this photo.</p>
        ) : (
          <div className="results">
            {items.map((detection, index) => (
              <DetectionCard key={detection.imageUrl || index} detection={detection} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionResultView;
