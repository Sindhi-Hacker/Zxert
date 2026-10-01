import React from 'react';
import { Switch, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/AppProviders';

/**
 * Settings row with a switch, optional leading icon chip, and hairline
 * separators for use inside a CardGroup.
 */
export function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
  icon: Icon,
  last = false,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: LucideIcon;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View className={`flex-row items-center gap-3.5 pl-4 pr-4 py-3 ${last ? '' : 'border-b border-line'}`}>
      {Icon && (
        <View
          className="w-[38px] h-[38px] rounded-xl items-center justify-center shrink-0"
          style={{ backgroundColor: t.colors.accentSoft }}
        >
          <Icon size={17} strokeWidth={2.1} color={t.colors.accent} />
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-ink">{title}</Text>
        {subtitle && <Text className="text-[12.5px] leading-[17px] text-ink-2">{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: t.colors.line, true: t.colors.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={t.colors.line}
        accessibilityLabel={title}
      />
    </View>
  );
}
