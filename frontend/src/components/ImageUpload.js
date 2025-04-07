import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ImageUpload.css';

const ImageUpload = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError(null);
        }
    };

    const checkImageExists = async (type, filename) => {
        try {
            const response = await fetch(`http://localhost:5000/check-image/${type}/${filename}`);
            const data = await response.json();
            console.log(`Checking ${type} image ${filename}:`, data);
            return data.exists;
        } catch (error) {
            console.error(`Error checking ${type} image:`, error);
            return false;
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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            console.log('Upload response:', data);
            
            // Debug: Check directory structure
            try {
                const debugResponse = await fetch('http://localhost:5000/debug/directory');
                const debugData = await debugResponse.json();
                console.log('Directory structure:', debugData);
            } catch (debugErr) {
                console.error('Error fetching directory structure:', debugErr);
            }
            
            // Debug: Check run directory contents
            if (data.run_directory) {
                const runId = data.run_directory.split('/').pop();
                try {
                    const debugResponse = await fetch(`http://localhost:5000/debug/run/${runId}`);
                    const debugData = await debugResponse.json();
                    console.log('Run directory contents:', debugData);
                } catch (debugErr) {
                    console.error('Error fetching debug info:', debugErr);
                }
            }

            // Check if result image exists
            const resultImageFilename = data.result_image_path.split('/').pop();
            const resultImageExists = await checkImageExists('result', resultImageFilename);
            if (!resultImageExists) {
                console.error('Result image not found');
            }

            // Check if cropped images exist
            for (const detection of data.detections) {
                const croppedExists = await checkImageExists('cropped', detection.cropped_image);
                if (!croppedExists) {
                    console.error(`Cropped image not found: ${detection.cropped_image}`);
                }
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
            <h2>Cloting Detection</h2>
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
                            onError={(e) => {
                                console.error('Error loading result image');
                                console.error(`Attempted URL: http://localhost:5000${results.result_image_url}`);
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className="detections-list">
                            <h4>Detected Objects:</h4>
                            <div className="detections-grid">
                                {results.detections.map((detection, index) => (
                                    <div key={index} className="detection-item">
                                        <div className="detection-info">
                                            <h5>{detection.class}</h5>
                                            <p>Confidence: {(detection.confidence * 100).toFixed(2)}%</p>
                                        </div>
                                        <img 
                                            src={`http://localhost:5000/runs/${results.run_id}/cropped/${detection.cropped_image}`}
                                            alt={`${detection.class} detection`}
                                            className="cropped-image"
                                            onError={(e) => {
                                                console.error(`Error loading cropped image: ${detection.cropped_image}`);
                                                console.error(`Attempted URL: http://localhost:5000/runs/${results.run_id}/cropped/${detection.cropped_image}`);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload; 