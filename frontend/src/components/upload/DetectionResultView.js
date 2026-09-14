import React from 'react';
import { Box, Grid, Typography, Divider } from '@mui/material';
import DetectionCard from './DetectionCard';
import SwingTag from '../common/SwingTag';

const ImagePane = ({ label, src, alt, rotate }) => (
  <SwingTag accentColor="text.primary" rotate={rotate}>
    <Box sx={{ px: 2, pt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
    <Box
      sx={{
        aspectRatio: '4 / 3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.hover',
        m: 2,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box component="img" src={src} alt={alt} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </Box>
  </SwingTag>
);

const DetectionResultView = ({ result }) => (
  <Box>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ImagePane label="Original" src={result.originalImageUrl} alt="Original upload" />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ImagePane label="Detected" src={result.detectedImageUrl} alt="Detection result" />
      </Grid>
    </Grid>

    {result.croppedImages && result.croppedImages.length > 0 && (
      <Box sx={{ mt: 5 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tagged items ({result.croppedImages.length})
        </Typography>
        <Grid container spacing={3} alignItems="flex-start">
          {result.croppedImages.map((detection, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={detection.imageUrl || index}>
              <DetectionCard runId={result.runId} detection={detection} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )}
  </Box>
);

export default DetectionResultView;
