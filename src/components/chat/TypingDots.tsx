import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/providers/AppProviders';

function Dot({ delay, color }: { delay: number; color: string }) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 340 }), withTiming(0, { duration: 340 })), -1, false),
    );
  }, [delay, phase]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * phase.value,
    transform: [{ translateY: -3 * phase.value }],
  }));
  return (
    <Animated.View
      style={[style, { backgroundColor: color, width: 7, height: 7, borderRadius: 4 }]}
    />
  );
}

/**
 * Three gently bouncing dots — the assistant's "thinking" indicator.
 */
export function TypingDots() {
  const t = useTheme();
  return (
    <View className="flex-row items-center gap-[5px] h-[22px] px-0.5">
      <Dot delay={0} color={t.colors.accent} />
      <Dot delay={160} color={t.colors.accent} />
      <Dot delay={320} color={t.colors.accent} />
    </View>
  );
}
