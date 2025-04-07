import React, { useState } from 'react';
import './ImageUpload.css';

const ImageUpload = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setResults(data);
        } catch (err) {
            setError(err.message);
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="image-upload-container">
            <h2>Object Detection</h2>
            
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input"
                />
                <button 
                    onClick={handleUpload}
                    disabled={!selectedImage || loading}
                    className="upload-button"
                >
                    {loading ? 'Processing...' : 'Upload and Detect'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <strong>Error:</strong> {error}
                    <p>Please check the console for more details.</p>
                </div>
            )}

            <div className="results-container">
                {previewUrl && (
                    <div className="image-preview">
                        <h3>Original Image</h3>
                        <img src={previewUrl} alt="Preview" />
                    </div>
                )}

                {results && (
                    <div className="detection-results">
                        <h3>Detection Results</h3>
                        <img 
                            src={`http://localhost:5000${results.result_image_url}`} 
                            alt="Detection Results" 
                        />
                        <div className="detections-list">
                            <h4>Detected Objects:</h4>
                            <ul>
                                {results.detections.map((detection, index) => (
                                    <li key={index}>
                                        {detection.class} (Confidence: {(detection.confidence * 100).toFixed(2)}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload; 