import React from 'react';
import DetectionCard from './DetectionCard';

const DetectionResultView = ({ result }) => (
  <div>
    <figure>
      <img src={result.originalImageUrl} alt="Original upload" width="320" />
      <figcaption>Original</figcaption>
    </figure>
    <figure>
      <img src={result.detectedImageUrl} alt="Detection result" width="320" />
      <figcaption>Detected</figcaption>
    </figure>

    {result.croppedImages && result.croppedImages.length > 0 && (
      <section>
        <h3>Detected items ({result.croppedImages.length})</h3>
        {result.croppedImages.map((detection, index) => (
          <DetectionCard key={detection.imageUrl || index} detection={detection} />
        ))}
      </section>
    )}
  </div>
);

export default DetectionResultView;
