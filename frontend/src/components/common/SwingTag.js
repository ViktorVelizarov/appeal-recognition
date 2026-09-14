import React from 'react';
import { Box } from '@mui/material';

/**
 * Every garment has a tag - this is that tag, reused as the app's core shape
 * language instead of a generic uniform-radius card. The grommet sits in one
 * corner (radius stays tight there, opens up elsewhere), rotate is reserved
 * for decorative/hero use - functional grids keep rotate=0 for legibility.
 */
const SwingTag = ({
  children,
  rotate = 0,
  corner = 'topLeft',
  accentColor = 'text.primary',
  holeColor = 'background.default',
  grommet = true,
  sx,
  contentSx,
  ...props
}) => {
  const isTopRight = corner === 'topRight';
  const grommetPosition = isTopRight ? { top: -9, right: 18 } : { top: -9, left: 18 };
  const radius = isTopRight ? '18px 3px 18px 18px' : '3px 18px 18px 18px';

  return (
    <Box sx={{ position: 'relative', transform: rotate ? `rotate(${rotate}deg)` : 'none', ...sx }} {...props}>
      {grommet && (
        <Box
          sx={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: accentColor,
            bgcolor: holeColor,
            zIndex: 2,
            ...grommetPosition,
          }}
        />
      )}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          border: '1.5px solid',
          borderColor: accentColor,
          borderRadius: radius,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SwingTag;
