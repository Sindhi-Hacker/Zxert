import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const prefix = 'zxert.provider.';
const volatileWebVault = new Map<string, string>();
export const secureCredentials = {
  async set(providerId: string, secret: string): Promise<void> {
    const key = prefix + providerId;
    if (Platform.OS === 'web') { volatileWebVault.set(key, secret); return; }
    await SecureStore.setItemAsync(key, secret, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  },
  async get(providerId: string): Promise<string | null> {
    const key = prefix + providerId;
    return Platform.OS === 'web' ? volatileWebVault.get(key) ?? null : SecureStore.getItemAsync(key);
  },
  async remove(providerId: string): Promise<void> {
    const key = prefix + providerId;
    if (Platform.OS === 'web') volatileWebVault.delete(key); else await SecureStore.deleteItemAsync(key);
  },
};
