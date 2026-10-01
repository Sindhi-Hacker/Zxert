import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';

/**
 * Haptic feedback helpers. All of them respect the user's "haptics" setting
 * and silently no-op on platforms without haptic support.
 */

function enabled() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function allowed() {
  return enabled() && useAppStore.getState().settings.haptics;
}

/** Tiny confirmation for taps (send, copy, toggle, tab switch). */
export function hapticTap() {
  if (!allowed()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Heavier feedback for destructive or state-changing actions (delete, stop). */
export function hapticImpact() {
  if (!allowed()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Success notification (provider connected, saved). */
export function hapticSuccess() {
  if (!allowed()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Warning notification (failures). */
export function hapticWarning() {
  if (!allowed()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
