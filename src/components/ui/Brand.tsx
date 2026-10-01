import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Zxert brand mark: a lime gradient tile with the Z glyph (Space Grotesk),
 * optionally followed by the wordmark.
 */
export function Brand({ compact = false, size = 34 }: { compact?: boolean; size?: number }) {
  const glyph = Math.round(size * 0.52);
  return (
    <View className="flex-row items-center gap-3">
      <LinearGradient
        colors={['#B8F37E', '#7ECC3E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.3),
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#9BE15D',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Text
          style={{ fontSize: glyph, lineHeight: glyph + 2 }}
          className="font-display font-bold text-[#111A06]"
        >
          Z
        </Text>
      </LinearGradient>
      {!compact && (
        <Text className="font-display font-bold text-ink" style={{ fontSize: size * 0.62, letterSpacing: -0.5 }}>
          Zxert
        </Text>
      )}
    </View>
  );
}
