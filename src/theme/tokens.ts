/**
 * JS-side mirror of the design tokens declared in `global.css`.
 *
 * `global.css` is the source of truth for styling (NativeWind classNames).
 * This mirror exists only for the few places that need real color values in
 * JS (react-native-markdown-display style objects, Switch track colors,
 * legacy StyleSheet code). Keep both files in sync.
 */

export const palette = {
  // Shared brand hues
  lime: '#9BE15D',
  teal: '#40CDB2',
  violet: '#8B7CF6',
} as const;

export type AppTheme = {
  dark: boolean;
  colors: {
    canvas: string; canvas2: string;
    surface: string; surface2: string; surface3: string;
    ink: string; ink2: string; ink3: string;
    line: string; line2: string;
    accent: string; accentInk: string; accentSoft: string; accentLine: string;
    btn: string; btnInk: string;
    danger: string; dangerSoft: string; dangerInk: string;
    bubble: string; bubbleInk: string;
    header: string; glass: string; veil: string;
    glow1: string; glow2: string; glow3: string;
  };
};

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    canvas: '#F4F6EF', canvas2: '#EBEFE2',
    surface: '#FFFFFF', surface2: '#FAFBF5', surface3: '#EFF2E6',
    ink: '#171C12', ink2: '#56604B', ink3: '#8B9680',
    line: '#E2E7D6', line2: '#CFD6BF',
    accent: '#3F7D1E', accentInk: '#F4FFEA', accentSoft: '#E7F3D6', accentLine: '#C3DFA0',
    btn: '#171C12', btnInk: '#F7FAF0',
    danger: '#C0392B', dangerSoft: '#FBEAE6', dangerInk: '#FFFFFF',
    bubble: '#E4EFD2', bubbleInk: '#1B2410',
    header: 'rgba(244,246,239,0.88)', glass: 'rgba(255,255,255,0.72)', veil: 'rgba(20,26,14,0.45)',
    glow1: 'rgba(155,225,93,0.20)', glow2: 'rgba(64,205,178,0.13)', glow3: 'rgba(139,124,246,0.10)',
  },
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    canvas: '#0B0D09', canvas2: '#0E110B',
    surface: '#131611', surface2: '#1A1E17', surface3: '#22271E',
    ink: '#F1F5E9', ink2: '#A5B097', ink3: '#6F7A64',
    line: '#242A20', line2: '#333B2C',
    accent: '#9BE15D', accentInk: '#111A06', accentSoft: '#1D2A13', accentLine: '#41602A',
    btn: '#9BE15D', btnInk: '#111A06',
    danger: '#FF8578', dangerSoft: '#3A1D18', dangerInk: '#24100C',
    bubble: '#26331A', bubbleInk: '#EAF4DC',
    header: 'rgba(11,13,9,0.86)', glass: 'rgba(19,22,17,0.72)', veil: 'rgba(0,0,0,0.60)',
    glow1: 'rgba(155,225,93,0.16)', glow2: 'rgba(64,205,178,0.10)', glow3: 'rgba(139,124,246,0.09)',
  },
};

/** Shared spacing/radius/typography references for StyleSheet-based code. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radii = { sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, full: 999 } as const;
export const typography = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 } as const;
