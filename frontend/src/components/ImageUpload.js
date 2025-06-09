import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Box, Button, Chip, CircularProgress, Typography, Paper, Grid, Card, CardContent, CardMedia, CardActions, Link } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [detectionRuns, setDetectionRuns] = useState([]);
    const [shoppingResults, setShoppingResults] = useState({});
    const [loadingShopping, setLoadingShopping] = useState({});

    useEffect(() => {
        // Fetch user's detection runs on component mount
        fetchDetectionRuns();
    }, []);

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
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
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
            if (error.response?.status === 401) {
                setError('Please log in to upload images');
            } else {
                setError(error.response?.data?.error || 'Failed to upload image');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDetectionRuns = async () => {
        try {
            const response = await api.get('/api/detection-runs');
            console.log('Detection runs response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setDetectionRuns(response.data);
            } else {
                console.error('Invalid detection runs data:', response.data);
                setDetectionRuns([]);
            }
        } catch (error) {
            console.error('Error fetching detection runs:', error);
            if (error.response?.status === 401) {
                setError('Please log in to view detection history');
            } else {
                setError('Failed to fetch detection history');
            }
            setDetectionRuns([]);
        }
    };

    const searchSimilarItems = async (runId, filename) => {
        const key = `${runId}-${filename}`;
        if (shoppingResults[key]) return; // Don't search again if we already have results

        setLoadingShopping(prev => ({ ...prev, [key]: true }));
        try {
            const response = await api.get(`/api/similar-items/${runId}/${encodeURIComponent(filename)}`);
            setShoppingResults(prev => ({ ...prev, [key]: response.data }));
        } catch (error) {
            console.error('Error searching for similar items:', error);
            setError('Failed to search for similar items');
        } finally {
            setLoadingShopping(prev => ({ ...prev, [key]: false }));
        }
    };

    const renderDetectionResults = () => (
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
                                    <CardActions sx={{ p: 2 }}>image.png
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<ShoppingCartIcon />}
                                            onClick={() => searchSimilarItems(detectionResult.runId, detection.imageUrl)}
                                            disabled={loadingShopping[`${detectionResult.runId}-${detection.imageUrl}`]}
                                            sx={{
                                                background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                py: 1.5,
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #7B1FA2 30%, #C2185B 90%)',
                                                    transform: 'scale(1.02)'
                                                },
                                                '&:disabled': {
                                                    background: 'rgba(0,0,0,0.12)',
                                                    color: 'rgba(0,0,0,0.26)'
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            {loadingShopping[`${detectionResult.runId}-${detection.imageUrl}`] ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                                                    Searching...
                                                </>
                                            ) : (
                                                'Find Similar Items'
                                            )}
                                        </Button>
                                    </CardActions>
                                    {shoppingResults[`${detectionResult.runId}-${detection.imageUrl}`] && (
                                        <Box sx={{ mt: 2 }}>
                                            <Box sx={{ 
                                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                borderRadius: 1,
                                                p: 2,
                                                mb: 2,
                                                color: 'white'
                                            }}>
                                                <Typography variant="h6" sx={{ 
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                    🛍️ Similar Items Found ({shoppingResults[`${detectionResult.runId}-${detection.imageUrl}`].length})
                                                </Typography>
                                            </Box>
                                            <Box sx={{ 
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: 'repeat(2, 1fr)',
                                                    sm: 'repeat(3, 1fr)', 
                                                    md: 'repeat(4, 1fr)'
                                                },
                                                gap: 2,
                                                alignItems: 'stretch'
                                            }}>
                                                {shoppingResults[`${detectionResult.runId}-${detection.imageUrl}`].map((item, idx) => (
                                                        <Card sx={{ 
                                                            width: '100%',
                                                            height: '480px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            transition: 'all 0.3s ease-in-out',
                                                            overflow: 'hidden',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)',
                                                                boxShadow: 6,
                                                                border: '2px solid #2196F3'
                                                            },
                                                            border: '1px solid rgba(0,0,0,0.12)',
                                                            borderRadius: 2
                                                        }}>
                                                            {/* Image Section - Fixed 160px */}
                                                            <Box sx={{ 
                                                                height: '160px',
                                                                flexShrink: 0,
                                                                backgroundColor: '#f5f5f5',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: '8px 8px 0 0',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {item.imageUrl ? (
                                                                    <CardMedia
                                                                        component="img"
                                                                        height="160"
                                                                        image={item.imageUrl}
                                                                        alt={item.title}
                                                                        sx={{ 
                                                                            objectFit: 'cover',
                                                                            width: '100%',
                                                                            height: '160px'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.parentElement.innerHTML = `
                                                                                <div style="
                                                                                    width: 100%; 
                                                                                    height: 160px; 
                                                                                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                                                                                    display: flex;
                                                                                    align-items: center;
                                                                                    justify-content: center;
                                                                                    font-size: 48px;
                                                                                ">👕</div>
                                                                            `;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Box sx={{ 
                                                                        width: '100%', 
                                                                        height: '160px', 
                                                                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '48px'
                                                                    }}>
                                                                        👕
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                            
                                                            {/* Content Section - Flexible */}
                                                            <CardContent sx={{ 
                                                                flex: 1,
                                                                p: 2,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'space-between'
                                                            }}>
                                                                {/* Title */}
                                                                <Typography 
                                                                    variant="subtitle2" 
                                                                    sx={{ 
                                                                        fontWeight: 'bold',
                                                                        lineHeight: 1.2,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        fontSize: '0.875rem',
                                                                        mb: 2,
                                                                        minHeight: '2.5rem'
                                                                    }}
                                                                    title={item.title}
                                                                >
                                                                    {item.title || 'Similar Item'}
                                                                </Typography>

                                                                {/* Bottom content */}
                                                                <Box>
                                                                    {/* Price */}
                                                                    <Box sx={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        p: 1,
                                                                        backgroundColor: '#f5f5f5',
                                                                        borderRadius: 1,
                                                                        mb: 1,
                                                                        minHeight: '2.5rem'
                                                                    }}>
                                                                        <Typography 
                                                                            variant="h6" 
                                                                            color="primary" 
                                                                            sx={{ 
                                                                                fontWeight: 'bold', 
                                                                                fontSize: '1rem',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap'
                                                                            }}
                                                                        >
                                                                            💰 {item.price ? (
                                                                                typeof item.price === 'object' 
                                                                                    ? `${item.price.extracted_value || item.price.value || 'N/A'} ${item.price.currency || ''}`.trim()
                                                                                    : `${item.price} ${item.currency || ''}`.trim()
                                                                            ) : 'Price not available'}
                                                                        </Typography>
                                                                    </Box>
                                                                    
                                                                    {/* Chips */}
                                                                    <Box sx={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        justifyContent: 'space-between',
                                                                        gap: 1,
                                                                        minHeight: '2rem'
                                                                    }}>
                                                                        <Chip 
                                                                            label={typeof item.platform === 'string' ? item.platform : (item.source || 'Shopping')}
                                                                            size="small"
                                                                            color="secondary"
                                                                            sx={{ 
                                                                                fontSize: '0.75rem', 
                                                                                maxWidth: '120px'
                                                                            }}
                                                                        />
                                                                        <Chip 
                                                                            label={item.confidence ? `${Math.round(item.confidence * 100)}% Match` : '90% Match'}
                                                                            size="small"
                                                                            color="success"
                                                                            sx={{ fontSize: '0.75rem' }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </CardContent>
                                                            
                                                            {/* Button Section - Fixed 65px */}
                                                            <CardActions sx={{ 
                                                                height: '65px',
                                                                flexShrink: 0,
                                                                px: 2,
                                                                pb: 2,
                                                                pt: 0
                                                            }}>
                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    href={item.itemUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)',
                                                                            transform: 'scale(1.02)'
                                                                        },
                                                                        transition: 'all 0.2s ease-in-out'
                                                                    }}
                                                                    startIcon={<ShoppingCartIcon />}
                                                                >
                                                                    Shop Now
                                                                </Button>
                                                            </CardActions>
                                                        </Card>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Paper>
    );

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

            {detectionResult && renderDetectionResults()}

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