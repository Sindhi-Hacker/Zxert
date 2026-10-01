import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Code, Database, Info, Lock, Monitor, Moon, Radio, Shield, Sun } from 'lucide-react-native';
import { Screen } from '@/components/ui/Screen';
import { NavRow } from '@/components/ui/Section';
import { CardGroup } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Brand } from '@/components/ui/Brand';
import { useTheme } from '@/providers/AppProviders';
import { useAppStore } from '@/store/appStore';
import { chatRepository } from '@/repositories/chatRepository';
import type { ThemePreference } from '@/repositories/settingsRepository';

export default function Settings() {
  const t = useTheme();
  const { settings, setSettings, providers, models } = useAppStore();

  const themeItems = [
    { value: 'system' as ThemePreference, label: 'System', icon: Monitor },
    { value: 'light' as ThemePreference, label: 'Light', icon: Sun },
    { value: 'dark' as ThemePreference, label: 'Dark', icon: Moon },
  ];

  const localData = async () => {
    const [convs, msgs] = await Promise.all([
      chatRepository.listConversations(500),
      chatRepository.countMessages(),
    ]);
    Alert.alert(
      'Local data',
      `${convs.length} conversation${convs.length === 1 ? '' : 's'}\n${msgs} message${msgs === 1 ? '' : 's'}\n${providers.length} provider${providers.length === 1 ? '' : 's'}\n${models.length} cached model${models.length === 1 ? '' : 's'}\n\nEverything lives on this device only — nothing is synced or uploaded.`,
      [{ text: 'OK' }],
    );
  };

  const diagnostics = () => {
    const lines = providers.map((p) => `• ${p.name || 'Untitled'} — ${p.adapter} (${p.enabled ? 'enabled' : 'disabled'})`);
    Alert.alert(
      'Diagnostics',
      lines.length ? lines.join('\n') : 'No providers configured yet.',
      [{ text: 'OK' }],
    );
  };

  const about = () => {
    Alert.alert('Zxert', 'Version 1.0.0\n\nA provider-neutral AI chat client for iOS, Android, and web.\nBring any endpoint. Keep your keys. Own your data.', [
      { text: 'OK' },
    ]);
  };

  return (
    <Screen
      stickyHeader={
        <View className="border-b border-line pb-4 px-6" style={{ backgroundColor: t.colors.header }}>
          <Text className="font-display-bold text-[30px] text-ink tracking-[-1px] mt-3">Settings</Text>
          <Text className="text-[13px] text-ink-2 mt-0.5">Make Zxert yours</Text>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 gap-7 pb-10">
          {/* Appearance */}
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-ink-3 px-2 mb-2.5">Appearance</Text>
            <View className="bg-surface border border-line rounded-3xl p-3 shadow-card dark:shadow-dark-card">
              <SegmentedControl
                items={themeItems}
                value={settings.theme}
                onChange={(theme) => void setSettings({ theme })}
              />
            </View>
          </View>

          {/* Chat */}
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-ink-3 px-2 mb-2.5">Chat</Text>
            <CardGroup>
              <ToggleRow
                title="Stream responses"
                subtitle="Show output as it arrives"
                value={settings.streaming}
                onChange={(streaming) => void setSettings({ streaming })}
                icon={Radio}
              />
              <ToggleRow
                title="Haptic feedback"
                subtitle="Subtle taps on key actions"
                value={settings.haptics}
                onChange={(haptics) => void setSettings({ haptics })}
                icon={Radio}
              />
              <ToggleRow
                title="Privacy mode"
                subtitle="Reduce sensitive detail in errors"
                value={settings.privacyMode}
                onChange={(privacyMode) => void setSettings({ privacyMode })}
                icon={Shield}
                last
              />
            </CardGroup>
          </View>

          {/* Data & advanced */}
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-ink-3 px-2 mb-2.5">Data & advanced</Text>
            <CardGroup>
              <NavRow
                title="Local data"
                subtitle="Conversations and cached models"
                icon={Database}
                iconTint="neutral"
                onPress={() => void localData()}
              />
              <NavRow
                title="Diagnostics"
                subtitle="Provider and adapter status"
                icon={Code}
                iconTint="neutral"
                onPress={diagnostics}
              />
              <NavRow title="About Zxert" subtitle="Version 1.0.0" icon={Info} onPress={about} last />
            </CardGroup>
          </View>

          {/* Footer */}
          <View className="items-center gap-2.5 pt-2">
            <Brand compact size={30} />
            <Text className="text-[11.5px] text-ink-3 text-center leading-[16px]">
              No accounts. No telemetry.{'\n'}Just you and your models.
            </Text>
            <View className="flex-row items-center gap-1">
              <Lock size={10} color={t.colors.ink3} strokeWidth={2.4} />
              <Text className="text-[10.5px] text-ink-3">Keys stored in the device vault</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
