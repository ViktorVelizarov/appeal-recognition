import React from 'react';
import { Box, Typography } from '@mui/material';
import SellIcon from '@mui/icons-material/Sell';
import SwingTag from '../common/SwingTag';

const AuthLayout = ({ title, subtitle, children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      bgcolor: 'background.default',
    }}
  >
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
        <SellIcon sx={{ color: 'primary.main', fontSize: 30, transform: 'rotate(-8deg)' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          AppealFinder
        </Typography>
      </Box>

      <SwingTag accentColor="text.primary" contentSx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </SwingTag>
    </Box>
  </Box>
);

export default AuthLayout;
