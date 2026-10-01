import React, { useCallback } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressProps = PressableProps & {
  /** Scale applied while pressed. 1 disables the effect. */
  scale?: number;
  children?: React.ReactNode;
};

/**
 * Pressable with a springy scale-down while pressed (UI-thread animated).
 * Use anywhere tactile feedback matters: buttons, rows, chips.
 */
export function Press({ scale = 0.97, disabled, onPressIn, onPressOut, ...rest }: PressProps) {
  const s = useSharedValue(1);

  const handleIn = useCallback(
    (e: any) => {
      // Reanimated shared values are designed to be mutated from handlers.
      // eslint-disable-next-line react-hooks/immutability
      if (scale !== 1 && !disabled) s.value = withSpring(scale, { damping: 20, stiffness: 450, mass: 0.7 });
      onPressIn?.(e as never);
    },
    [scale, disabled, onPressIn, s],
  );

  const handleOut = useCallback(
    (e: any) => {
      // eslint-disable-next-line react-hooks/immutability
      if (scale !== 1) s.value = withSpring(1, { damping: 20, stiffness: 450, mass: 0.7 });
      onPressOut?.(e as never);
    },
    [scale, onPressOut, s],
  );

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <AnimatedPressable
      hitSlop={6}
      {...rest}
      disabled={disabled}
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[rest.style, animated]}
    />
  );
}
