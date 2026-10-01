import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Press } from '@/components/ui/Press';
import { useTheme } from '@/providers/AppProviders';

type Variant = 'plain' | 'tonal' | 'solid';

const variantClasses: Record<Variant, string> = {
  plain: 'bg-transparent border-transparent',
  tonal: 'bg-surface-2 border-line',
  solid: 'bg-btn border-transparent',
};

export function IconButton({
  icon: Icon,
  label,
  onPress,
  selected = false,
  size = 44,
  variant = 'plain',
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  selected?: boolean;
  size?: number;
  variant?: Variant;
  disabled?: boolean;
}) {
  const t = useTheme();
  const iconColor =
    variant === 'solid' ? t.colors.btnInk : selected ? t.colors.accent : t.colors.ink2;

  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={{ width: size, height: size }}
      scale={0.9}
      className={`items-center justify-center border rounded-2xl ${variantClasses[variant]} ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <Icon size={Math.round(size * 0.45)} strokeWidth={2.1} color={iconColor} />
    </Press>
  );
}
