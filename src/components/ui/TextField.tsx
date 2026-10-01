import React, { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/providers/AppProviders';

/**
 * Text field with label, focus state (accent ring) and inline error.
 */
export function TextField({ label, error, className = '', ...props }: TextInputProps & { label?: string; error?: string; className?: string }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.colors.danger : focused ? t.colors.accent : t.colors.line;

  return (
    <View className={`gap-2 ${className}`}>
      {label && <Text className="text-[13px] font-semibold text-ink-2 px-1">{label}</Text>}
      <View
        className="rounded-2xl border bg-surface-2"
        style={{
          borderColor,
          shadowColor: focused ? t.colors.accent : 'transparent',
          shadowOpacity: focused ? 0.25 : 0,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <TextInput
          placeholderTextColor={t.colors.ink3}
          selectionColor={t.colors.accent}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={`text-[15px] text-ink px-4 ${props.multiline ? 'py-3.5 min-h-[96px]' : 'h-[50px]'}`}
          style={props.multiline ? { textAlignVertical: 'top' } : undefined}
          {...props}
        />
      </View>
      {error && <Text className="text-[12px] text-danger px-1">{error}</Text>}
    </View>
  );
}
