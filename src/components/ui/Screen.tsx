import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/AppProviders';
import { Glow } from '@/components/ui/Glow';

/**
 * Page scaffold: themed canvas, safe-area aware, content constrained to a
 * comfortable reading width on tablets and web. Optionally renders the
 * aurora backdrop and a sticky glass header.
 */
export function Screen({
  children,
  scroll = false,
  style,
  glow = false,
  bottomPadding = 0,
  stickyHeader,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  glow?: boolean;
  bottomPadding?: number;
  stickyHeader?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: t.colors.canvas }}>
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.canvas }}>
        {stickyHeader}
        <View className="flex-1">
          {glow && <Glow />}
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: bottomPadding }}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.body, style]}>{children}</View>
            </ScrollView>
          ) : (
            <View style={[styles.body, style]} className="flex-1">
              {children}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles: { body: ViewStyle } = {
  body: { width: '100%', maxWidth: 720, alignSelf: 'center' },
};
