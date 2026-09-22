import React, { useState } from 'react';
import api from '../api/axios';
import DetectionResultView from '../components/upload/DetectionResultView';

const MAX_FILE_SIZE_MB = 15;

const DashboardPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const { data } = await api.post('/upload', formData);

      if (!data?.runId || !data?.originalImageUrl || !data?.detectedImageUrl) {
        throw new Error('Unexpected response from server');
      }

      setResult({
        runId: data.runId.toString(),
        originalImageUrl: data.originalImageUrl,
        detectedImageUrl: data.detectedImageUrl,
        croppedImages: data.croppedImages || [],
      });
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload a photo</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      <button type="button" onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'Uploading...' : 'Upload and detect'}
      </button>

      {error && <p role="alert">{error}</p>}

      {result && (
        <section>
          <h2>Results</h2>
          <DetectionResultView result={result} />
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
