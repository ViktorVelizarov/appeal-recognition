import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import SellIcon from '@mui/icons-material/Sell';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SwingTag from '../common/SwingTag';

const statusMeta = {
  completed: { color: 'success', label: 'Completed' },
  processing: { color: 'warning', label: 'Processing' },
  failed: { color: 'error', label: 'Failed' },
};

const HistoryCard = ({ run, onClick }) => {
  const meta = statusMeta[run.status] || statusMeta.processing;
  const itemCount = run.croppedImages?.length || 0;
  const clickable = run.status === 'completed';

  return (
    <SwingTag
      accentColor="text.primary"
      onClick={clickable ? onClick : undefined}
      sx={{
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease',
        '&:hover': clickable ? { transform: 'translateY(-2px)' } : undefined,
      }}
    >
      <Box
        sx={{
          aspectRatio: '4 / 3',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {run.detectedImageUrl ? (
          <Box
            component="img"
            src={run.detectedImageUrl}
            alt="Detection result"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : run.status === 'failed' ? (
          <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />
        ) : run.status === 'processing' ? (
          <HourglassEmptyIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        ) : (
          <SellIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        )}
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {new Date(run.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Typography>
          <Chip size="small" color={meta.color} label={meta.label} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {run.status === 'completed'
            ? `${itemCount} item${itemCount === 1 ? '' : 's'} tagged`
            : run.error || new Date(run.timestamp).toLocaleTimeString()}
        </Typography>
      </Box>
    </SwingTag>
  );
};

export default HistoryCard;
