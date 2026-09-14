import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SellIcon from '@mui/icons-material/Sell';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import HistoryCard from '../components/history/HistoryCard';
import DetectionResultView from '../components/upload/DetectionResultView';
import EmptyState from '../components/common/EmptyState';

const SkeletonGrid = () => (
  <Grid container spacing={2}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
        <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 3', width: '100%' }} />
        <Skeleton width="60%" sx={{ mt: 1 }} />
      </Grid>
    ))}
  </Grid>
);

const HistoryPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/api/detection-runs')
      .then(({ data }) => {
        if (isMounted) setRuns(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.error || 'Failed to load detection history');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Detection history
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Every photo you&apos;ve run through detection, in one place.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <SkeletonGrid />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<SellIcon />}
          title="No tags yet"
          description="Upload your first photo and it will show up here."
          action={
            <Button component={RouterLink} to="/app" variant="contained">
              Upload a photo
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {runs.map((run) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={run._id}>
              <HistoryCard run={run} onClick={() => setSelectedRun(run)} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(selectedRun)} onClose={() => setSelectedRun(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {selectedRun && new Date(selectedRun.timestamp).toLocaleString()}
          <IconButton onClick={() => setSelectedRun(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRun && (
            <DetectionResultView
              result={{
                runId: selectedRun._id,
                originalImageUrl: selectedRun.originalImageUrl,
                detectedImageUrl: selectedRun.detectedImageUrl,
                croppedImages: selectedRun.croppedImages,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HistoryPage;
