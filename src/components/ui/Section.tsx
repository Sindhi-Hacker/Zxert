import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/AppProviders';

export function SectionHeader({
  title,
  caption,
  className = '',
}: {
  title: string;
  caption?: string;
  className?: string;
}) {
  return (
    <View className={`gap-1 mb-3 ${className}`}>
      <Text className="text-[19px] font-bold font-display text-ink tracking-[-0.3]">{title}</Text>
      {caption && <Text className="text-[13px] leading-[18px] text-ink-2">{caption}</Text>}
    </View>
  );
}

export function NavRow({
  title,
  subtitle,
  icon: Icon,
  iconTint = 'accent',
  onPress,
  trailing,
  last = false,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconTint?: 'accent' | 'danger' | 'neutral';
  onPress?: () => void;
  trailing?: React.ReactNode;
  last?: boolean;
  danger?: boolean;
}) {
  const t = useTheme();
  const chipBg = iconTint === 'danger' ? t.colors.dangerSoft : iconTint === 'neutral' ? t.colors.surface3 : t.colors.accentSoft;
  const chipFg = iconTint === 'danger' ? t.colors.danger : iconTint === 'neutral' ? t.colors.ink2 : t.colors.accent;

  const border = last ? '' : 'border-b border-line';

  const body = (
    <View className="flex-1 flex-row items-center gap-3.5 py-3.5 pr-4">
      {Icon && (
        <View
          className="w-[38px] h-[38px] rounded-xl items-center justify-center shrink-0"
          style={{ backgroundColor: chipBg }}
        >
          <Icon size={18} strokeWidth={2.1} color={chipFg} />
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className={`text-[15px] font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text numberOfLines={2} className="text-[12.5px] leading-[17px] text-ink-2">
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ?? (onPress ? <ChevronRight size={17} color={t.colors.ink3} strokeWidth={2.2} /> : null)}
    </View>
  );

  if (!onPress) {
    return <View className={`flex-row items-center pl-4 ${border}`}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center pl-4 ${border}`}
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
    >
      {body}
    </Pressable>
  );
}
