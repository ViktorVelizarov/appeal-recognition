import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, CircularProgress, Typography, Paper, Grid, Card, CardContent, CardMedia } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [detectionRuns, setDetectionRuns] = useState([]);

    useEffect(() => {
        // Fetch user's detection runs on component mount
        fetchDetectionRuns();
    }, []);

    const fetchDetectionRuns = async () => {
        try {
            const response = await axios.get('/api/detection-runs');
            if (response.data) {
                setDetectionRuns(response.data);
            } else {
                console.error('No data received from detection runs endpoint');
                setDetectionRuns([]);
            }
        } catch (error) {
            console.error('Error fetching detection runs:', error);
            setError('Failed to fetch detection history');
            setDetectionRuns([]);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Full response:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Response data keys:', Object.keys(response.data));

            // Validate response data structure
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid response format from server');
            }

            const requiredFields = ['runId', 'originalImageUrl', 'detectedImageUrl'];
            const missingFields = requiredFields.filter(field => !response.data[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields in response: ${missingFields.join(', ')}`);
            }

            // Set the detection result with the response data
            const result = {
                runId: response.data.runId.toString(), // Convert ObjectId to string
                originalImageUrl: response.data.originalImageUrl,
                detectedImageUrl: response.data.detectedImageUrl,
                croppedImages: response.data.croppedImages || []
            };
            
            console.log('Processed result:', result);
            setDetectionResult(result);

            // Refresh detection runs after successful upload
            fetchDetectionRuns();
        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error response:', error.response);
            setError(error.response?.data?.error || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Upload Image for Detection
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                    >
                        Select Image
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </Button>
                    {selectedFile && (
                        <Typography variant="body1">
                            Selected: {selectedFile.name}
                        </Typography>
                    )}
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Upload and Detect'}
                </Button>
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            {detectionResult && (
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Detection Results
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Original Image
                                    </Typography>
                                </CardContent>
                                <CardMedia
                                    component="img"
                                    image={detectionResult.originalImageUrl}
                                    alt="Original"
                                    sx={{ maxHeight: 400, objectFit: 'contain' }}
                                />
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Detected Image
                                    </Typography>
                                </CardContent>
                                <CardMedia
                                    component="img"
                                    image={detectionResult.detectedImageUrl}
                                    alt="Detected"
                                    sx={{ maxHeight: 400, objectFit: 'contain' }}
                                />
                            </Card>
                        </Grid>
                    </Grid>
                    {detectionResult.croppedImages && detectionResult.croppedImages.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Detected Objects
                            </Typography>
                            <Grid container spacing={2}>
                                {detectionResult.croppedImages.map((detection, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="subtitle1">
                                                    Class: {detection.class}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Confidence: {(detection.confidence * 100).toFixed(2)}%
                                                </Typography>
                                            </CardContent>
                                            <CardMedia
                                                component="img"
                                                image={detection.imageUrl}
                                                alt={`Detected ${detection.class}`}
                                                sx={{ height: 200, objectFit: 'contain' }}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Paper>
            )}

            {detectionRuns.length > 0 && (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Detection History
                    </Typography>
                    <Grid container spacing={2}>
                        {detectionRuns.map((run) => (
                            <Grid item xs={12} sm={6} md={4} key={run._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle1">
                                            Date: {new Date(run.timestamp).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Status: {run.status}
                                        </Typography>
                                        {run.error && (
                                            <Typography variant="body2" color="error">
                                                Error: {run.error}
                                            </Typography>
                                        )}
                                    </CardContent>
                                    {run.detectedImageUrl && (
                                        <CardMedia
                                            component="img"
                                            image={run.detectedImageUrl}
                                            alt="Detection Result"
                                            sx={{ height: 200, objectFit: 'contain' }}
                                        />
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}
        </Box>
    );
};

export default ImageUpload; 