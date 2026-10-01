import AsyncStorage from '@react-native-async-storage/async-storage';

const key = 'zxert.settings.v1';
export type ThemePreference = 'system' | 'light' | 'dark';
export interface AppSettings { theme: ThemePreference; streaming: boolean; haptics: boolean; sendOnEnter: boolean; privacyMode: boolean; }
export const defaults: AppSettings = { theme: 'system', streaming: true, haptics: true, sendOnEnter: false, privacyMode: true };
export const settingsRepository = {
  async load(): Promise<AppSettings> { try { return { ...defaults, ...JSON.parse((await AsyncStorage.getItem(key)) ?? '{}') }; } catch { return defaults; } },
  async save(settings: AppSettings) { await AsyncStorage.setItem(key, JSON.stringify(settings)); },
};
