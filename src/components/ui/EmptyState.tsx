import React from 'react';
import { Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/AppProviders';

/**
 * Friendly empty state: glowing icon chip, display title, muted body copy
 * and an optional action rendered below.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  iconTint = 'accent',
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  iconTint?: 'accent' | 'danger' | 'neutral';
}) {
  const t = useTheme();
  const chipBg = iconTint === 'danger' ? t.colors.dangerSoft : iconTint === 'neutral' ? t.colors.surface3 : t.colors.accentSoft;
  const chipFg = iconTint === 'danger' ? t.colors.danger : iconTint === 'neutral' ? t.colors.ink2 : t.colors.accent;

  return (
    <View className="items-center gap-3.5 px-8 py-6">
      <View
        className="w-[68px] h-[68px] rounded-[22px] items-center justify-center"
        style={{ backgroundColor: chipBg }}
      >
        <Icon size={27} strokeWidth={1.8} color={chipFg} />
      </View>
      <Text className="text-[19px] font-bold font-display text-ink tracking-[-0.3] text-center">{title}</Text>
      {body && (
        <Text className="text-[13.5px] leading-[20px] text-ink-2 text-center max-w-[320px]">{body}</Text>
      )}
      {action && <View className="mt-2">{action}</View>}
    </View>
  );
}
