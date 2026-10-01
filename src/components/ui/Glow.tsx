import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/AppProviders';
import { palette } from '@/theme/tokens';

/**
 * Aurora backdrop — soft diagonal gradient washes plus layered "onion" orbs.
 * Renders as an absolutely positioned, non-interactive layer behind content.
 */
export function Glow({ intensity = 1 }: { intensity?: number }) {
  const t = useTheme();
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      {/* Diagonal washes */}
      <LinearGradient
        colors={[t.colors.glow1, 'rgba(0,0,0,0)']}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.75, y: 0.55 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: intensity }}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', t.colors.glow2]}
        start={{ x: 0.4, y: 1 }}
        end={{ x: 1, y: 0.35 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: intensity }}
      />
      {/* Onion orbs — concentric circles fading outward */}
      <Orb
        size={340}
        color={palette.lime}
        maxOpacity={0.10 * intensity}
        style={{ position: 'absolute', top: -120, left: -90 }}
      />
      <Orb
        size={300}
        color={palette.violet}
        maxOpacity={0.09 * intensity}
        style={{ position: 'absolute', bottom: -110, right: -80 }}
      />
    </View>
  );
}

function Orb({
  size,
  color,
  maxOpacity,
  style,
}: {
  size: number;
  color: string;
  maxOpacity: number;
  style?: object;
}) {
  const layers = [1, 0.72, 0.48, 0.26];
  return (
    <View style={[{ width: size, height: size }, style]}>
      {layers.map((f, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: (size * (1 - f)) / 2,
            left: (size * (1 - f)) / 2,
            width: size * f,
            height: size * f,
            borderRadius: (size * f) / 2,
            backgroundColor: color,
            opacity: maxOpacity * (0.35 + 0.65 * (1 - f)),
          }}
        />
      ))}
    </View>
  );
}
