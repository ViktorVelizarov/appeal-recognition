import { createTheme } from '@mui/material/styles';

const display = "'Bricolage Grotesque', 'Inter', sans-serif";
const body = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// A garment always has a tag: that's the visual system this whole app is
// built from (detection cards, confidence stamps, the brand mark) rather
// than a generic rounded-card kit. Colors are a tag-stamp palette, not a
// single SaaS gradient.
const tagPalette = {
  ink: '#16171B',
  paper: '#FAF6EF',
  paperDark: '#1C1D22',
  punch: '#FF2D6E',
  cobalt: '#3654FF',
  zest: '#FFC933',
  grass: '#22C55E',
};

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: tagPalette.punch,
        light: '#FF6E9B',
        dark: '#C40047',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: tagPalette.cobalt,
        light: '#7C90FF',
        dark: '#1830B8',
        contrastText: '#FFFFFF',
      },
      warning: { main: tagPalette.zest, contrastText: tagPalette.ink },
      success: { main: tagPalette.grass, contrastText: '#08320F' },
      error: { main: '#E11D48' },
      background:
        mode === 'dark'
          ? { default: '#101114', paper: tagPalette.paperDark }
          : { default: tagPalette.paper, paper: '#FFFFFF' },
      text:
        mode === 'dark'
          ? { primary: '#F5F1E8', secondary: 'rgba(245,241,232,0.68)' }
          : { primary: tagPalette.ink, secondary: 'rgba(22,23,27,0.64)' },
    },
    tag: tagPalette,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: body,
      h1: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontFamily: display, fontWeight: 600 },
      h6: { fontFamily: display, fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shadows: Array(25).fill('none').map((_, i) => {
      if (i === 0) return 'none';
      const alpha = mode === 'dark' ? 0.5 : 0.1;
      return `0 ${Math.min(i, 8)}px ${Math.min(i * 2, 24)}px rgba(15, 17, 23, ${alpha})`;
    }),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.2s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingTop: 9,
            paddingBottom: 9,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(245,241,232,0.12)' : 'rgba(22,23,27,0.1)'}`,
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(16,17,20,0.85)'
                : 'rgba(250,246,239,0.85)',
            backdropFilter: 'blur(10px)',
            color: theme.palette.text.primary,
            borderBottom: `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(245,241,232,0.1)' : 'rgba(22,23,27,0.08)'}`,
          }),
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  });
