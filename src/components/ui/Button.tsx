import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Press } from '@/components/ui/Press';
import { useTheme } from '@/providers/AppProviders';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-btn border-transparent shadow-card dark:shadow-glow-accent',
  secondary: 'bg-surface-2 border-line',
  ghost: 'bg-transparent border-transparent',
  danger: 'bg-danger border-transparent',
};

const textClasses: Record<Variant, string> = {
  primary: 'text-btn-ink',
  secondary: 'text-ink',
  ghost: 'text-ink-2',
  danger: 'text-danger-ink',
};

/** Icon color, per variant, as raw values (lucide needs the `color` prop). */
const iconColors: Record<Variant, 'btnInk' | 'ink' | 'ink2' | 'dangerInk'> = {
  primary: 'btnInk',
  secondary: 'ink',
  ghost: 'ink2',
  danger: 'dangerInk',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-11 px-4 rounded-xl',
  md: 'h-[52px] px-6 rounded-2xl',
};

const sizeText: Record<Size, string> = { sm: 'text-[14px]', md: 'text-[15px]' };

export function Button({
  label,
  onPress,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  full = false,
}: {
  label: string;
  onPress?: () => void;
  icon?: LucideIcon;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
}) {
  const t = useTheme();
  const dim = disabled || loading;
  const iconColor = t.colors[iconColors[variant]];

  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: dim, busy: !!loading }}
      disabled={dim}
      onPress={onPress}
      scale={dim ? 1 : 0.97}
      className={`flex-row items-center justify-center gap-2.5 border ${variantClasses[variant]} ${sizeClasses[size]} ${
        full ? 'flex-1' : ''
      } ${dim ? 'opacity-40' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? t.colors.ink2 : iconColor} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : 18} strokeWidth={2.2} color={iconColor} />}
          <Text className={`font-semibold ${textClasses[variant]} ${sizeText[size]}`}>{label}</Text>
        </>
      )}
    </Press>
  );
}
