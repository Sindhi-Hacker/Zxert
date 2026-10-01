export const palette = {
  ink: '#111315', paper: '#F7F8F6', white: '#FFFFFF', black: '#0B0D0F',
  lime: '#9BE15D', limeDark: '#74B63B', red: '#DC4C4C', amber: '#D99A2B', blue: '#4B7BEC',
  gray50: '#F2F3F0', gray100: '#E5E7E1', gray300: '#C5C8C0', gray500: '#747970', gray700: '#3B3F3A', gray850: '#202320', gray900: '#161816',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radii = { sm: 8, md: 12, lg: 16, xl: 22, full: 999 } as const;
export const typography = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 } as const;

export type AppTheme = {
  dark: boolean;
  colors: {
    background: string; surface: string; surfaceAlt: string; text: string; textMuted: string;
    border: string; borderStrong: string; primary: string; primaryText: string; danger: string;
    input: string; overlay: string;
  };
};

export const lightTheme: AppTheme = { dark: false, colors: {
  background: palette.paper, surface: palette.white, surfaceAlt: palette.gray50, text: palette.ink,
  textMuted: palette.gray500, border: palette.gray100, borderStrong: palette.gray300, primary: palette.ink,
  primaryText: palette.white, danger: palette.red, input: palette.white, overlay: 'rgba(11,13,15,0.42)',
}};
export const darkTheme: AppTheme = { dark: true, colors: {
  background: palette.black, surface: palette.gray900, surfaceAlt: palette.gray850, text: '#F3F5EF',
  textMuted: '#9DA29A', border: '#292D29', borderStrong: '#404640', primary: palette.lime,
  primaryText: palette.black, danger: '#F06A6A', input: palette.gray900, overlay: 'rgba(0,0,0,0.66)',
}};
