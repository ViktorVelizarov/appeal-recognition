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
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

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
    <div className="app-wrap">
      <div className="app-head">
        <h1 className="mega">
          Upload a photo
          <b>.</b>
        </h1>
        <p className="auth-sub">AI vision finds every garment in the photo and shows where to buy it.</p>
      </div>

      <div className="dropzone" data-disabled={uploading || undefined}>
        <label className="dropzone-in">
          <input
            className="dropzone-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <span className="dropzone-t">
            {uploading ? 'Scanning…' : 'Drop a photo'}
            {!uploading && <b>.</b>}
          </span>
          <span className="dropzone-s mono">
            {selectedFile ? selectedFile.name : 'or choose a file · JPG PNG WEBP'}
          </span>
        </label>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <>
          <h2 className="sr">Detected garments</h2>
          <DetectionResultView result={result} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
