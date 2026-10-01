import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft, Heart, Plus, RefreshCw, Search, Server } from 'lucide-react-native';
import { Screen } from '@/components/ui/Screen';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/providers/AppProviders';
import { useAppStore } from '@/store/appStore';
import { providerService } from '@/services/providerService';
import { providerRepository } from '@/repositories/providerRepository';
import type { AIModel } from '@/types/provider';
import { hapticSuccess, hapticTap } from '@/utils/haptics';

export default function Models() {
  const t = useTheme();
  const store = useAppStore();
  const enabled = store.providers.filter((p) => p.enabled);
  const [providerId, setProviderId] = useState(store.selectedProviderId ?? enabled[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [custom, setCustom] = useState(false);
  const [customId, setCustomId] = useState('');

  const provider = enabled.find((p) => p.id === providerId);
  const models = useMemo(
    () =>
      store.models
        .filter(
          (m) =>
            m.providerId === providerId &&
            `${m.displayName} ${m.id}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort(
          (a, b) =>
            Number(b.favorite) - Number(a.favorite) ||
            a.displayName.localeCompare(b.displayName),
        ),
    [store.models, providerId, query],
  );

  const refresh = async () => {
    if (!provider) return;
    setBusy(true);
    setError('');
    try {
      const found = await providerService.models(provider);
      await providerRepository.saveModels(provider.id, found);
      await store.reloadProviders();
      hapticSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to fetch models');
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async (m: AIModel) => {
    hapticTap();
    await providerRepository.saveModel({ ...m, favorite: !m.favorite });
    await store.reloadProviders();
  };

  const addCustom = async () => {
    if (!provider || !customId.trim()) return;
    const model: AIModel = {
      id: customId.trim(),
      displayName: customId.trim(),
      providerId: provider.id,
      custom: true,
      favorite: false,
      capabilities: ['text', ...(provider.streaming ? ['streaming' as const] : [])],
      inputModalities: ['text'],
      outputModalities: ['text'],
    };
    await providerRepository.saveModel(model);
    await store.reloadProviders();
    setCustom(false);
    setCustomId('');
    hapticSuccess();
  };

  return (
    <Screen
      stickyHeader={
        <View className="border-b border-line px-3 pb-3" style={{ backgroundColor: t.colors.header }}>
          <View className="flex-row items-center gap-1.5">
            <IconButton icon={ChevronLeft} label="Close" onPress={() => router.back()} size={40} />
            <View className="flex-1">
              <Text className="font-display font-semibold text-[19px] text-ink tracking-[-0.3px]">Choose a model</Text>
              <Text className="text-[11.5px] text-ink-2 mt-0.5">Models come straight from your providers</Text>
            </View>
            <IconButton icon={RefreshCw} label="Refresh models" onPress={() => void refresh()} size={40} />
          </View>
        </View>
      }
    >
      {enabled.length === 0 ? (
        <View className="flex-1 justify-center px-6">
          <EmptyState
            icon={Server}
            title="Connect a provider first"
            body="Models are discovered from your configured endpoints."
            action={<Button label="Add provider" icon={Plus} onPress={() => router.replace('/providers/new')} />}
          />
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Provider chips */}
          <View className="flex-row flex-wrap gap-2 mb-3.5">
            {enabled.map((p) => {
              const active = providerId === p.id;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    hapticTap();
                    setProviderId(p.id);
                  }}
                  className={`rounded-full px-4 h-9 justify-center border ${
                    active ? 'bg-accent-soft border-accent-line' : 'bg-surface-2 border-line'
                  }`}
                >
                  <Text className={`text-[13px] font-semibold ${active ? 'text-ink' : 'text-ink-2'}`}>{p.name}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Search */}
          <View className="flex-row items-center gap-2.5 rounded-full border border-line bg-surface-2 h-11 px-4 mb-3.5">
            <Search size={16} color={t.colors.ink3} strokeWidth={2.2} />
            <TextInput
              accessibilityLabel="Search models"
              value={query}
              onChangeText={setQuery}
              placeholder="Search models"
              placeholderTextColor={t.colors.ink3}
              selectionColor={t.colors.accent}
              className="flex-1 text-[14px] text-ink py-0"
              style={{ height: '100%' }}
            />
          </View>

          {busy && (
            <View className="flex-row items-center justify-center gap-3 py-6">
              <ActivityIndicator color={t.colors.accent} />
              <Text className="text-[13.5px] text-ink-2">Discovering models…</Text>
            </View>
          )}

          {error && (
            <View
              className="rounded-2xl border p-3.5 mb-3.5 flex-row items-center gap-2.5"
              style={{ borderColor: t.colors.danger, backgroundColor: t.colors.dangerSoft }}
            >
              <Text className="flex-1 text-[13px] leading-[18px] font-medium" style={{ color: t.colors.danger }}>
                {error}
              </Text>
              <Button label="Retry" variant="ghost" size="sm" onPress={() => void refresh()} />
            </View>
          )}

          {/* Model cards */}
          <View className="gap-2.5 mb-3.5">
            {models.map((m) => {
              const selected = m.id === store.selectedModelId && m.providerId === store.selectedProviderId;
              return (
                <Pressable
                  key={`${m.providerId}:${m.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    hapticTap();
                    store.selectModel(m.providerId, m.id);
                    router.back();
                  }}
                  className={`flex-row items-center gap-3 rounded-3xl border p-3.5 ${
                    selected ? 'border-accent bg-accent-soft' : 'border-line bg-surface'
                  }`}
                  style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
                >
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center gap-2">
                      <Text numberOfLines={1} className="text-[15px] font-semibold text-ink flex-shrink">
                        {m.displayName}
                      </Text>
                      {m.favorite && <Heart size={13} fill={t.colors.accent} color={t.colors.accent} />}
                    </View>
                    <Text numberOfLines={1} className="text-[11.5px] text-ink-3 mt-0.5">
                      {m.id}
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                      {m.custom && <Badge label="CUSTOM" accent />}
                      {m.capabilities.slice(0, 3).map((x) => (
                        <Badge key={x} label={x.toUpperCase()} />
                      ))}
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={m.favorite ? `Unfavorite ${m.displayName}` : `Favorite ${m.displayName}`}
                    onPress={() => void toggleFavorite(m)}
                    hitSlop={10}
                    className="w-9 h-9 rounded-full items-center justify-center"
                  >
                    <Heart
                      size={17}
                      strokeWidth={2.2}
                      fill={m.favorite ? t.colors.accent : 'transparent'}
                      color={m.favorite ? t.colors.accent : t.colors.ink3}
                    />
                  </Pressable>
                  {selected && <Check size={20} color={t.colors.accent} strokeWidth={2.6} />}
                </Pressable>
              );
            })}
          </View>

          {!busy && models.length === 0 && !custom && (
            <View className="py-6">
              <EmptyState
                icon={Search}
                title={query ? 'No matching models' : 'No discovered models'}
                body="Refresh discovery, or add the exact model ID supported by this provider."
                action={
                  <View className="flex-row gap-2.5">
                    <Button label="Refresh" icon={RefreshCw} variant="secondary" size="sm" onPress={() => void refresh()} />
                    <Button label="Add manually" icon={Plus} size="sm" onPress={() => setCustom(true)} />
                  </View>
                }
              />
            </View>
          )}

          {/* Custom model */}
          {!custom ? (
            <Button
              label={models.length ? 'Add custom model' : 'Add a model ID manually'}
              icon={Plus}
              variant="secondary"
              size="sm"
              full
              onPress={() => setCustom(true)}
            />
          ) : (
            <View className="rounded-3xl border border-line bg-surface p-4 gap-3.5">
              <Text className="font-display font-semibold text-[16px] text-ink">Custom model</Text>
              <TextField
                label="Model ID"
                value={customId}
                onChangeText={setCustomId}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Exact provider model ID"
              />
              <View className="flex-row gap-2.5">
                <Button label="Cancel" variant="ghost" size="sm" full onPress={() => setCustom(false)} />
                <Button label="Add model" size="sm" full onPress={() => void addCustom()} disabled={!customId.trim()} />
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function Badge({ label, accent = false }: { label: string; accent?: boolean }) {
  const t = useTheme();
  return (
    <View
      className="rounded-md border px-1.5 py-[3px]"
      style={{
        borderColor: accent ? t.colors.accentLine : t.colors.line,
        backgroundColor: accent ? t.colors.accentSoft : t.colors.surface2,
      }}
    >
      <Text
        className="text-[9px] font-bold tracking-[0.8px]"
        style={{ color: accent ? t.colors.accent : t.colors.ink2 }}
      >
        {label}
      </Text>
    </View>
  );
}
