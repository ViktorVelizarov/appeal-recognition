import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Stack } from '@mui/material';
import SellIcon from '@mui/icons-material/Sell';
import SwingTag from '../components/common/SwingTag';
import ConfidenceStamp from '../components/common/ConfidenceStamp';

const steps = [
  {
    number: '1',
    title: 'Upload a photo',
    description: 'Drop in any outfit shot — yours, a screenshot, or inspo you saved.',
  },
  {
    number: '2',
    title: 'Get it tagged',
    description: 'Our model finds every piece in frame and grades its own confidence.',
  },
  {
    number: '3',
    title: 'Shop the look',
    description: 'Jump straight to visually similar pieces you can actually buy.',
  },
];

const previewTags = [
  { label: 'Jacket', confidence: 0.92, top: '0%', left: '6%', rotate: -7 },
  { label: 'Shoe', confidence: 0.87, top: '40%', left: '38%', rotate: 5 },
  { label: 'Bag', confidence: 0.74, top: '74%', left: '2%', rotate: -4 },
];

const HomePage = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Container maxWidth="lg">
      <Box component="header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SellIcon sx={{ color: 'primary.main', transform: 'rotate(-8deg)' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AppealFinder
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button component={RouterLink} to="/login" color="inherit">
            Sign in
          </Button>
          <Button component={RouterLink} to="/register" variant="contained">
            Get started
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={6} alignItems="center" sx={{ py: { xs: 4, md: 9 } }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.5rem' },
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
              mb: 3,
            }}
          >
            Snap it.
            <br />
            Tag it.
            <br />
            Shop it.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 460 }}>
            Upload a photo of any outfit. We tag every piece — jacket, shoes, bag, whatever&apos;s
            in frame — and point you to where you can buy it.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button component={RouterLink} to="/register" variant="contained" size="large">
              Get started free
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large" color="inherit">
              Sign in
            </Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              position: 'relative',
              height: { xs: 240, sm: 380, md: 440 },
              mt: { xs: 2, md: 0 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: '8% 4%',
                bgcolor: 'secondary.main',
                opacity: 0.16,
                borderRadius: '48% 52% 54% 46% / 52% 46% 54% 48%',
              }}
            />
            {previewTags.map((item) => (
              <SwingTag
                key={item.label}
                rotate={item.rotate}
                accentColor="text.primary"
                sx={{ position: 'absolute', top: item.top, left: item.left, width: { xs: 148, sm: 190 } }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, mb: 1 }}>
                    {item.label}
                  </Typography>
                  <ConfidenceStamp confidence={item.confidence} />
                </Box>
              </SwingTag>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 5 }}>
          How it works
        </Typography>
        <Grid container spacing={4}>
          {steps.map((step) => (
            <Grid size={{ xs: 12, md: 4 }} key={step.title}>
              <Box sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    color: 'primary.main',
                    mb: 1,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          mb: 8,
          bgcolor: 'text.primary',
          color: 'background.default',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Ready to tag your closet?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.75 }}>
              It&apos;s free to get started — no card needed.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              color="primary"
            >
              Create free account
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box component="footer" sx={{ pb: 4, color: 'text.secondary' }}>
        <Typography variant="body2">© {new Date().getFullYear()} AppealFinder</Typography>
      </Box>
    </Container>
  </Box>
);

export default HomePage;
