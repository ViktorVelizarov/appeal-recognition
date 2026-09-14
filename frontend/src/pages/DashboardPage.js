import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Fade } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api/axios';
import UploadDropzone from '../components/upload/UploadDropzone';
import DetectionResultView from '../components/upload/DetectionResultView';
import SwingTag from '../components/common/SwingTag';

const DashboardPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setError(null);
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
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Upload a photo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        We&apos;ll tag every item we find and point you to where to buy it.
      </Typography>

      <SwingTag accentColor="text.primary" contentSx={{ p: { xs: 2, sm: 3 } }} sx={{ mb: 4 }}>
        <UploadDropzone
          file={selectedFile}
          onFileChange={handleFileChange}
          disabled={uploading}
          onValidationError={setError}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={!uploading && <CloudUploadIcon />}
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? <CircularProgress size={22} color="inherit" /> : 'Upload and detect'}
        </Button>
      </SwingTag>

      {result && (
        <Fade in>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Results
            </Typography>
            <DetectionResultView result={result} />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default DashboardPage;
