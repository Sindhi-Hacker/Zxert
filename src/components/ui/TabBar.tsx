import React, { useCallback, useEffect } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticTap } from '@/utils/haptics';
import { useTheme } from '@/providers/AppProviders';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BAR_HEIGHT = 66;
const PILL_WIDTH = 52;

interface TabBarRoute {
  key: string;
  name: string;
}

export interface TabBarDescriptor {
  options: { title?: string; tabBarAccessibilityLabel?: string };
}

export interface TabBarProps {
  state: { index: number; routes: TabBarRoute[] };
  descriptors: Record<string, TabBarDescriptor>;
  navigation: {
    emit: (e: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented?: boolean };
    navigate: (name: string) => void;
  };
}

export interface TabSpec {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

/**
 * Floating "pill" tab bar with a springy sliding indicator.
 * Collapses away while the keyboard is open so the composer can hug the keys.
 */
export function TabBar({ state, descriptors, navigation, tabs }: TabBarProps & { tabs: TabSpec[] }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bottomExtra = Math.max(insets.bottom, 10);

  const measured = useSharedValue(0);
  // 1 = bar visible, 0 = collapsed for keyboard. Animated for smooth collapse.
  const shown = useSharedValue(1);
  const activeIndex = state.index;

  useEffect(() => {
    const showName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showName, () => {
      shown.value = withTiming(0, { duration: 200 });
    });
    const hide = Keyboard.addListener(hideName, () => {
      shown.value = withTiming(1, { duration: 220 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [shown]);

  const collapse = useAnimatedStyle(() => ({
    height: shown.value * (BAR_HEIGHT + bottomExtra),
    opacity: shown.value,
  }));

  const indicator = useAnimatedStyle(() => {
    const itemW = measured.value / Math.max(1, tabs.length);
    const left = (itemW - PILL_WIDTH) / 2 + activeIndex * itemW;
    return { transform: [{ translateX: withSpring(left, { damping: 18, stiffness: 260 }) }] };
  });

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      // Reanimated shared values are designed to be mutated from handlers.
      // eslint-disable-next-line react-hooks/immutability
      measured.value = e.nativeEvent.layout.width;
    },
    [measured],
  );

  const tabPress = (route: TabBarRoute, index: number) => {
    const isFocused = state.index === index;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      hapticTap();
      navigation.navigate(route.name);
    }
  };

  return (
    <Animated.View style={[collapse]} className="overflow-hidden">
      <View
        className="mx-3 flex-row border border-line rounded-[30px] bg-glass overflow-hidden"
        style={{
          height: BAR_HEIGHT,
          marginBottom: bottomExtra,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: t.dark ? 0.5 : 0.14,
          shadowRadius: 28,
          elevation: 14,
        }}
        onLayout={onLayout}
      >
        <Animated.View
          pointerEvents="none"
          style={[indicator]}
          className="absolute top-[16px] left-0 h-[32px] w-[52px] bg-accent-soft rounded-full"
        />
        {state.routes.map((route, index) => {
          const spec = tabs[index];
          if (!spec) return null;
          const Icon = spec.icon;
          const isFocused = state.index === index;
          const label = descriptors[route.key]?.options.title ?? spec.name;
          return (
            <AnimatedPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
              onPress={() => tabPress(route, index)}
              className="flex-1 items-center justify-center gap-[3px]"
            >
              <View className="h-[32px] items-center justify-center">
                <Icon
                  size={21}
                  strokeWidth={isFocused ? 2.3 : 2}
                  color={isFocused ? t.colors.accent : t.colors.ink3}
                />
              </View>
              <Text
                className={`text-[10px] font-semibold ${isFocused ? 'text-ink' : 'text-ink-3'}`}
                style={{ letterSpacing: 0.2 }}
              >
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
