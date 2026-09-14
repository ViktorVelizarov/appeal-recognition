import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState = ({ icon, title, description, action }) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 8,
      px: 3,
      color: 'text.secondary',
    }}
  >
    {icon && (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: '2px dashed',
          borderColor: 'primary.main',
          color: 'primary.main',
          mb: 2,
          '& svg': { fontSize: 30 },
        }}
      >
        {icon}
      </Box>
    )}
    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 360, mx: 'auto' }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 3 }}>{action}</Box>}
  </Box>
);

export default EmptyState;
