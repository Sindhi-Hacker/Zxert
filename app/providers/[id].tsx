import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Bot,
  Braces,
  Check,
  ChevronDown,
  ChevronLeft,
  FlaskConical,
  Layers,
  Lock,
  MessagesSquare,
  Save,
  Trash,
} from 'lucide-react-native';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { TextField } from '@/components/ui/TextField';
import { SectionHeader } from '@/components/ui/Section';
import { useTheme } from '@/providers/AppProviders';
import { useAppStore } from '@/store/appStore';
import { providerRepository } from '@/repositories/providerRepository';
import { secureCredentials } from '@/services/secureCredentials';
import { providerService } from '@/services/providerService';
import { providerSchema } from '@/models/schemas';
import { createId } from '@/utils/id';
import type { AdapterKind, ProviderConfig } from '@/types/provider';
import { hapticSuccess, hapticTap, hapticWarning } from '@/utils/haptics';

const adapters: { id: AdapterKind; label: string; detail: string; path: string; icon: typeof Bot }[] = [
  { id: 'openai-chat', label: 'Chat Completions', detail: 'OpenAI-compatible', path: '/v1/chat/completions', icon: MessagesSquare },
  { id: 'openai-responses', label: 'Responses', detail: 'OpenAI Responses API', path: '/v1/responses', icon: Layers },
  { id: 'anthropic', label: 'Messages', detail: 'Anthropic-compatible', path: '/v1/messages', icon: Bot },
  { id: 'generic', label: 'Custom HTTP', detail: 'Configurable JSON endpoint', path: '/chat', icon: Braces },
];

function fresh(): ProviderConfig {
  const now = Date.now();
  return {
    id: createId('provider'),
    name: '',
    baseUrl: 'https://',
    adapter: 'openai-chat',
    enabled: true,
    order: 0,
    authStyle: 'bearer',
    customHeaders: {},
    endpoint: { chatPath: '/v1/chat/completions', modelsPath: '/v1/models', method: 'POST' },
    timeoutMs: 60000,
    streaming: true,
    allowInsecureHttp: false,
    createdAt: now,
    updatedAt: now,
  };
}

export default function ProviderEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const t = useTheme();
  const { providers, reloadProviders } = useAppStore();
  const [form, setForm] = useState<ProviderConfig>(() => fresh());
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = providers.find((x) => x.id === id);
    if (p) {
      setForm(p);
      secureCredentials.get(p.id).then((k) => setApiKey(k ? '••••••••••••' : ''));
    }
  }, [id, providers]);

  const set = <K extends keyof ProviderConfig>(key: K, value: ProviderConfig[K]) =>
    setForm((v) => ({ ...v, [key]: value, updatedAt: Date.now() }));

  const choose = (kind: AdapterKind) => {
    hapticTap();
    const a = adapters.find((x) => x.id === kind)!;
    setForm((v) => ({
      ...v,
      adapter: kind,
      endpoint: { ...v.endpoint, chatPath: a.path },
      authStyle: kind === 'anthropic' ? 'api-key' : 'bearer',
    }));
  };

  const validation = useMemo(() => providerSchema.safeParse(form), [form]);

  const save = async () => {
    const parsed = providerSchema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((x) => {
        e[String(x.path[0])] = x.message;
      });
      setErrors(e);
      hapticWarning();
      return;
    }
    setBusy(true);
    try {
      await providerRepository.save(parsed.data as ProviderConfig, apiKey && apiKey !== '••••••••••••' ? apiKey : undefined);
      await reloadProviders();
      hapticSuccess();
      router.replace('/(tabs)/providers');
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    if (!validation.success) {
      Alert.alert('Check configuration', 'Enter a valid provider name and secure base URL first.');
      return;
    }
    setBusy(true);
    setStatus(null);
    const r = await providerService.test(form, apiKey && apiKey !== '••••••••••••' ? apiKey : undefined);
    setStatus(r);
    setBusy(false);
    if (r.ok) hapticSuccess();
    else hapticWarning();
  };

  const remove = () =>
    Alert.alert('Delete provider?', `This removes ${form.name || 'this provider'}, its secure key, and cached models.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await providerRepository.remove(form.id);
          await reloadProviders();
          router.replace('/(tabs)/providers');
        },
      },
    ]);

  return (
    <Screen
      stickyHeader={
        <View
          className="flex-row items-center gap-2 px-3 border-b border-line"
          style={{ backgroundColor: t.colors.header, paddingBottom: 12 }}
        >
          <IconButton icon={ChevronLeft} label="Close" onPress={() => router.back()} size={40} />
          <View className="flex-1">
            <Text className="font-display font-semibold text-[19px] text-ink tracking-[-0.3px]">
              {isNew ? 'New provider' : 'Edit provider'}
            </Text>
            <View className="flex-row items-center gap-1">
              <Lock size={10} color={t.colors.ink3} strokeWidth={2.4} />
              <Text className="text-[11px] text-ink-2">Credentials stored in the device vault</Text>
            </View>
          </View>
        </View>
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
      >
        {/* Connection */}
        <SectionHeader title="Connection" caption="Where Zxert should send requests." />
        <View className="gap-4 mb-8">
          <TextField
            label="Display name"
            value={form.name}
            onChangeText={(v) => set('name', v)}
            placeholder="My AI provider"
            error={errors.name}
          />
          <TextField
            label="Base URL"
            value={form.baseUrl}
            onChangeText={(v) => set('baseUrl', v.trim())}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://api.example.com"
            error={errors.baseUrl}
          />
          <TextField
            label="API key"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={apiKey !== '••••••••••••'}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={form.authStyle === 'none' ? 'Not required' : 'Stored securely on this device'}
          />
        </View>

        {/* API format */}
        <SectionHeader title="API format" caption="Choose the protocol implemented by this endpoint." />
        <View className="gap-2.5 mb-6">
          {adapters.map((a) => {
            const selected = form.adapter === a.id;
            const Icon = a.icon;
            return (
              <Pressable
                key={a.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => choose(a.id)}
                className={`flex-row items-center gap-3.5 rounded-3xl border p-3.5 ${
                  selected ? 'border-accent bg-accent-soft' : 'border-line bg-surface'
                }`}
                style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
              >
                <View
                  className="w-[42px] h-[42px] rounded-2xl items-center justify-center shrink-0"
                  style={{ backgroundColor: selected ? t.colors.accent : t.colors.surface3 }}
                >
                  <Icon size={20} strokeWidth={1.9} color={selected ? t.colors.accentInk : t.colors.ink2} />
                </View>
                <View className="flex-1">
                  <Text className={`text-[15px] font-semibold ${selected ? 'text-ink' : 'text-ink'}`}>{a.label}</Text>
                  <Text className="text-[12px] text-ink-2 mt-0.5">{a.detail}</Text>
                </View>
                {selected && <Check size={19} color={t.colors.accent} strokeWidth={2.6} />}
              </Pressable>
            );
          })}
        </View>

        {/* Advanced */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hapticTap();
            setAdvanced((v) => !v);
          }}
          className="flex-row items-center gap-2 py-2 mb-2"
        >
          <Text className="flex-1 text-[14px] font-semibold text-ink-2">
            {advanced ? 'Hide advanced configuration' : 'Show advanced configuration'}
          </Text>
          <ChevronDown
            size={17}
            color={t.colors.ink3}
            strokeWidth={2.2}
            style={{ transform: [{ rotate: advanced ? '180deg' : '0deg' }] }}
          />
        </Pressable>
        {advanced && (
          <View className="gap-4 mb-6">
            <SectionHeader title="Endpoints & behavior" />
            <TextField
              label="Chat path"
              value={form.endpoint.chatPath}
              onChangeText={(v) => set('endpoint', { ...form.endpoint, chatPath: v })}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextField
              label="Models path (optional)"
              value={form.endpoint.modelsPath ?? ''}
              onChangeText={(v) => set('endpoint', { ...form.endpoint, modelsPath: v || undefined })}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextField
              label="Timeout (milliseconds)"
              value={String(form.timeoutMs)}
              keyboardType="number-pad"
              onChangeText={(v) => set('timeoutMs', Number(v) || 1000)}
            />
            <SettingToggle
              title="Streaming"
              subtitle="Use provider event streams"
              value={form.streaming}
              onChange={(v) => set('streaming', v)}
            />
            <SettingToggle
              title="Enabled"
              subtitle="Available for chats"
              value={form.enabled}
              onChange={(v) => set('enabled', v)}
            />
          </View>
        )}

        {/* Connection status */}
        {status && (
          <View
            accessibilityLiveRegion="polite"
            className="rounded-3xl border p-4 mb-5"
            style={{
              borderColor: status.ok ? t.colors.accentLine : t.colors.danger,
              backgroundColor: status.ok ? t.colors.accentSoft : t.colors.dangerSoft,
            }}
          >
            <Text
              className="text-[14px] font-bold"
              style={{ color: status.ok ? t.colors.accent : t.colors.danger }}
            >
              {status.ok ? 'Connection successful' : 'Connection failed'}
            </Text>
            <Text className="text-[12px] leading-[17px] text-ink-2 mt-1">
              {status.message} · {status.latencyMs} ms
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="gap-2.5">
          <Button label="Test connection" icon={FlaskConical} variant="secondary" onPress={() => void test()} loading={busy} />
          <Button label="Save provider" icon={Save} onPress={() => void save()} loading={busy} />
          {!isNew && (
            <Button label="Delete provider" icon={Trash} variant="danger" onPress={remove} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SettingToggle({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useTheme();
  return (
    <View className="flex-row items-center gap-3.5 rounded-3xl border border-line bg-surface p-4">
      <View className="flex-1 gap-0.5">
        <Text className="text-[14.5px] font-semibold text-ink">{title}</Text>
        <Text className="text-[12px] text-ink-2">{subtitle}</Text>
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
