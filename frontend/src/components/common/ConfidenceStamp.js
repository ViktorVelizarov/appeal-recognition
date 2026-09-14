import React from 'react';
import { Box } from '@mui/material';

const tierColor = (confidence) => {
  if (confidence >= 0.75) return 'success.main';
  if (confidence >= 0.5) return 'warning.main';
  return 'text.secondary';
};

/** A rubber-stamp reading, not a generic rounded pill. */
const ConfidenceStamp = ({ confidence, sx }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.1,
      py: 0.4,
      border: '2px solid',
      borderColor: tierColor(confidence),
      borderRadius: '999px 6px 999px 6px',
      transform: 'rotate(-3deg)',
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontWeight: 700,
      fontSize: '0.75rem',
      lineHeight: 1,
      color: tierColor(confidence),
      whiteSpace: 'nowrap',
      ...sx,
    }}
  >
    {Math.round(confidence * 100)}% match
  </Box>
);

export default ConfidenceStamp;
