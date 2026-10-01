import React, { useCallback } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Plus, Server } from 'lucide-react-native';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/AppProviders';
import { useAppStore } from '@/store/appStore';
import { providerRepository } from '@/repositories/providerRepository';
import { hapticTap } from '@/utils/haptics';

function adapterLabel(adapter: string) {
  return adapter
    .replaceAll('-', ' ')
    .replace('openai chat', 'Chat Completions')
    .replace('openai responses', 'Responses')
    .replace('anthropic', 'Messages')
    .replace('generic', 'Custom HTTP');
}

export default function Providers() {
  const t = useTheme();
  const { providers, reloadProviders } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      void reloadProviders();
    }, [reloadProviders]),
  );

  const toggle = async (id: string, enabled: boolean) => {
    hapticTap();
    const p = providers.find((x) => x.id === id);
    if (!p) return;
    await providerRepository.save({ ...p, enabled });
    await reloadProviders();
  };

  return (
    <Screen
      stickyHeader={
        <View className="border-b border-line pb-4 px-6" style={{ backgroundColor: t.colors.header }}>
          <Text className="font-display-bold text-[30px] text-ink tracking-[-1px] mt-3">Providers</Text>
          <Text className="text-[13px] text-ink-2 mt-0.5">Your endpoints, your credentials, your rules</Text>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {providers.length === 0 ? (
          <View className="flex-1 justify-center py-24 px-6">
            <EmptyState
              icon={Server}
              title="No providers yet"
              body="Connect any compatible endpoint — no vendor account required."
              action={<Button label="Add provider" icon={Plus} onPress={() => router.push('/providers/new')} />}
            />
          </View>
        ) : (
          <View className="px-5 pt-5 gap-3">
            {providers.map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Edit provider ${p.name}`}
                onPress={() => router.push(`/providers/${p.id}` as never)}
                className="bg-surface border border-line rounded-3xl p-4 shadow-card dark:shadow-dark-card"
                style={({ pressed }) => (pressed ? { opacity: 0.7, transform: [{ scale: 0.99 }] } : undefined)}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-[46px] h-[46px] rounded-2xl items-center justify-center shrink-0"
                    style={{ backgroundColor: p.enabled ? t.colors.accentSoft : t.colors.surface3 }}
                  >
                    <Server size={21} strokeWidth={1.9} color={p.enabled ? t.colors.accent : t.colors.ink3} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center gap-2">
                      <Text numberOfLines={1} className="font-display font-semibold text-[16.5px] text-ink flex-shrink">
                        {p.name || 'Untitled provider'}
                      </Text>
                      <View
                        className={`w-2 h-2 rounded-full ${p.enabled ? 'bg-accent' : 'bg-ink-3'}`}
                        accessibilityLabel={p.enabled ? 'Enabled' : 'Disabled'}
                      />
                    </View>
                    <Text numberOfLines={1} className="text-[12px] text-ink-2 mt-0.5">
                      {safeHost(p.baseUrl)}
                    </Text>
                  </View>
                  <Switch
                    value={p.enabled}
                    onValueChange={(v) => void toggle(p.id, v)}
                    trackColor={{ false: t.colors.line, true: t.colors.accent }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={t.colors.line}
                    accessibilityLabel={`${p.enabled ? 'Disable' : 'Enable'} ${p.name}`}
                  />
                </View>
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-line">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[10px] font-bold uppercase tracking-[1px] text-ink-3">
                      {adapterLabel(p.adapter)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[12.5px] font-semibold text-accent">Configure</Text>
                    <ChevronRight size={15} color={t.colors.accent} strokeWidth={2.3} />
                  </View>
                </View>
              </Pressable>
            ))}
            <Button label="Add provider" icon={Plus} variant="secondary" full onPress={() => router.push('/providers/new')} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
