import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';
import { Press } from '@/components/ui/Press';
import { useTheme } from '@/providers/AppProviders';
import { hapticTap } from '@/utils/haptics';

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/**
 * Animated segmented control (iOS-style) with a springy sliding pill.
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
}: {
  items: SegmentItem<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  // The control renders at full width of its parent; measured via onLayout.
  const measured = useSharedValue(0);
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );

  const pill = useAnimatedStyle(() => {
    const w = measured.value / items.length;
    const pillW = Math.max(0, w - 6);
    return {
      width: pillW,
      transform: [{ translateX: 3 + index * w }],
    };
  });

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      // Reanimated shared values are designed to be mutated from handlers.
      // eslint-disable-next-line react-hooks/immutability
      measured.value = e.nativeEvent.layout.width;
    },
    [measured],
  );

  return (
    <View
      onLayout={onLayout}
      className="flex-row bg-surface-3 rounded-full p-[3px] border border-line"
      style={{ width: '100%' }}
    >
      {index >= 0 && (
        <Animated.View
          pointerEvents="none"
          style={[pill, { elevation: 1 }]}
          className="absolute top-[3px] bottom-[3px] left-0 bg-surface rounded-full shadow-card dark:shadow-none"
        />
      )}
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <Press
            key={item.value}
            onPress={() => {
              if (!active) {
                hapticTap();
                onChange(item.value);
              }
            }}
            scale={0.96}
            className="flex-1 h-[42px] flex-row items-center justify-center gap-1.5 rounded-full"
          >
            {Icon && <Icon size={15} strokeWidth={2.2} color={active ? t.colors.ink : t.colors.ink3} />}
            <Text
              className={`text-[13px] font-semibold ${active ? 'text-ink' : 'text-ink-3'}`}
            >
              {item.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
}
