import React from 'react';
import { Box, Card, Typography, Chip, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';

const formatPrice = (item) => {
  if (!item.price) return null;
  if (typeof item.price === 'object') {
    const value = item.price.extracted_value || item.price.value;
    return value ? `${value} ${item.price.currency || ''}`.trim() : null;
  }
  return `${item.price} ${item.currency || ''}`.trim();
};

const ShoppingResultCard = ({ item }) => {
  const price = formatPrice(item);

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '3px 14px 14px 14px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
      }}
    >
      <Box
        sx={{
          aspectRatio: '1 / 1',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.title || 'Similar item'}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <CheckroomIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        )}
      </Box>

      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
        <Typography
          variant="body2"
          title={item.title}
          sx={{
            fontWeight: 600,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.4em',
          }}
        >
          {item.title || 'Similar item'}
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {price || 'Price unavailable'}
        </Typography>

        <Chip
          label={typeof item.platform === 'string' ? item.platform : item.source || 'Shopping'}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
        />

        <Button
          fullWidth
          size="small"
          variant="contained"
          href={item.itemUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<ShoppingCartIcon />}
          sx={{ mt: 'auto' }}
          disabled={!item.itemUrl}
        >
          Shop now
        </Button>
      </Box>
    </Card>
  );
};

const ShoppingResults = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No similar items found.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 1.5,
      }}
    >
      {items.map((item, idx) => (
        <ShoppingResultCard key={item.itemUrl || idx} item={item} />
      ))}
    </Box>
  );
};

export default ShoppingResults;
