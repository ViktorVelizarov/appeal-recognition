import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const MAX_FILE_SIZE_MB = 15;

const UploadDropzone = ({ file, onFileChange, disabled, onValidationError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const validateAndSet = useCallback(
    (candidate) => {
      if (!candidate) return;
      if (!candidate.type.startsWith('image/')) {
        onValidationError?.('Please choose an image file (JPG, PNG, WEBP...)');
        return;
      }
      if (candidate.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        onValidationError?.(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      onFileChange(candidate);
    },
    [onFileChange, onValidationError]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  if (file) {
    return (
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 280,
        }}
      >
        <Box
          component="img"
          src={previewUrl}
          alt="Selected preview"
          sx={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain' }}
        />
        {!disabled && (
          <IconButton
            onClick={() => onFileChange(null)}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
            aria-label="Remove selected image"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      sx={{
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : 'divider',
        borderRadius: 3,
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        cursor: disabled ? 'default' : 'pointer',
        bgcolor: isDragOver ? 'action.hover' : 'transparent',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.6 : 1,
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloudUploadIcon />
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Drag & drop a photo here
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to browse from your device
      </Typography>
      <Button variant="outlined" component="span" sx={{ mt: 1 }} disabled={disabled}>
        Select Image
      </Button>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        disabled={disabled}
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />
    </Box>
  );
};

export default UploadDropzone;
