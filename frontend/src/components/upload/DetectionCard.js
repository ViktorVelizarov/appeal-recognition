import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../api/axios';
import ShoppingResults from './ShoppingResults';
import SwingTag from '../common/SwingTag';
import ConfidenceStamp from '../common/ConfidenceStamp';

const DetectionCard = ({ runId, detection }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState(null);

  const handleOpen = async () => {
    setOpen(true);
    if (items || loading) return;

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/similar-items/${runId}`, {
        params: { filename: detection.imageUrl },
      });
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search for similar items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwingTag accentColor="text.primary" sx={{ height: '100%' }} contentSx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ aspectRatio: '4 / 3', bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box
          component="img"
          src={detection.imageUrl}
          alt={`Detected ${detection.class}`}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
            {detection.class}
          </Typography>
          <ConfidenceStamp confidence={detection.confidence} />
        </Box>

        <Button fullWidth variant="contained" startIcon={<ShoppingCartIcon />} onClick={handleOpen} sx={{ mt: 'auto' }}>
          Find similar items
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            Similar to this <span style={{ textTransform: 'capitalize' }}>{detection.class}</span>
          </span>
          <IconButton onClick={() => setOpen(false)} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && items && <ShoppingResults items={items} />}
        </DialogContent>
      </Dialog>
    </SwingTag>
  );
};

export default DetectionCard;
