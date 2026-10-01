import React, { useState } from 'react';
import { Keyboard, Platform, TextInput, View } from 'react-native';
import { ArrowUp, Square } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/providers/AppProviders';
import { Press } from '@/components/ui/Press';
import { hapticTap } from '@/utils/haptics';

/**
 * Composer pill: autofocus ring, springy send button that morphs into a
 * stop control while the assistant is streaming.
 */
export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  generating,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string) => void;
  onStop: () => void;
  generating: boolean;
  disabled?: boolean;
}) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const send = () => {
    if (!value.trim() || disabled || generating) return;
    onSend(value);
    Keyboard.dismiss();
  };

  const canSend = !!value.trim() && !disabled && !generating;

  return (
    <View className="px-4 pt-1.5 pb-3">
      <View
        className="flex-row items-end gap-2.5 rounded-[28px] border bg-surface-2 px-4 py-2"
        style={{
          borderColor: focused ? t.colors.accentLine : t.colors.line,
          shadowColor: focused ? t.colors.accent : '#000',
          shadowOpacity: focused ? 0.18 : t.dark ? 0.35 : 0.08,
          shadowRadius: focused ? 16 : 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <TextInput
          accessibilityLabel="Message"
          multiline
          value={value}
          onChangeText={onChange}
          placeholder={disabled ? 'Select a model to start' : 'Message Zxert…'}
          placeholderTextColor={t.colors.ink3}
          selectionColor={t.colors.accent}
          editable={!disabled}
          maxLength={100000}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyPress={(e) => {
            if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !(e.nativeEvent as any).shiftKey) {
              e.preventDefault?.();
              send();
            }
          }}
          className="flex-1 text-[15.5px] leading-[22px] text-ink pt-2.5 pb-2.5 max-h-[132px] min-h-[42px]"
        />
        {generating ? (
          <Animated.View entering={ZoomIn.springify().damping(14)}>
            <Press
              accessibilityRole="button"
              accessibilityLabel="Stop generation"
              onPress={() => {
                hapticTap();
                onStop();
              }}
              scale={0.88}
              className="w-[42px] h-[42px] rounded-full items-center justify-center mb-0.5"
              style={{ backgroundColor: t.colors.danger, elevation: 4 }}
            >
              <Square size={15} fill={t.colors.dangerInk} color={t.colors.dangerInk} strokeWidth={2.5} />
            </Press>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(120)}>
            <Press
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={!canSend}
              onPress={() => {
                hapticTap();
                send();
              }}
              scale={0.88}
              className={`w-[42px] h-[42px] rounded-full items-center justify-center mb-0.5 ${
                canSend ? 'bg-btn dark:shadow-glow-accent' : 'bg-surface-3 border border-line'
              }`}
              style={canSend ? { elevation: 4 } : undefined}
            >
              <ArrowUp size={20} strokeWidth={2.6} color={canSend ? t.colors.btnInk : t.colors.ink3} />
            </Press>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
