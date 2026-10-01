import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { KeyRound, Network, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Screen } from '@/components/ui/Screen';
import { Brand } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/AppProviders';

const points = [
  {
    icon: Network,
    title: 'Bring any provider',
    text: 'OpenAI-compatible, Anthropic-compatible, Responses, or a fully custom HTTP endpoint.',
  },
  {
    icon: KeyRound,
    title: 'Your credentials stay yours',
    text: 'API keys live in the device Keychain or Keystore — never in app state or exports.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    text: 'Conversations stay on this device. Zxert only talks to endpoints you configure.',
  },
];

export default function Onboarding() {
  const t = useTheme();
  return (
    <Screen glow>
      <View className="flex-1 px-6 pb-8">
        {/* Brand */}
        <View className="pt-8">
          <Brand size={40} />
        </View>

        {/* Hero */}
        <View className="mt-14 gap-4">
          <View className="flex-row items-center gap-2">
            <Sparkles size={13} color={t.colors.accent} strokeWidth={2.4} />
            <Text className="text-[11px] font-bold tracking-[2.2px] text-accent">YOUR MODELS · YOUR RULES</Text>
          </View>
          <Text className="font-display-bold text-[40px] leading-[46px] text-ink tracking-[-1.2px]">
            Every model,{'\n'}
            <Text className="text-accent">one calm place.</Text>
          </Text>
          <Text className="text-[16px] leading-[24px] text-ink-2 max-w-[440px]">
            A provider-neutral AI workspace built around control, speed, and privacy.
          </Text>
        </View>

        {/* Feature cards */}
        <View className="flex-1 justify-center gap-4 py-8">
          {points.map(({ icon: Icon, title, text }) => (
            <View
              key={title}
              className="flex-row items-center gap-4 bg-surface border border-line rounded-3xl p-4 shadow-card dark:shadow-dark-card"
            >
              <View
                className="w-[46px] h-[46px] rounded-2xl items-center justify-center shrink-0"
                style={{ backgroundColor: t.colors.accentSoft }}
              >
                <Icon size={21} strokeWidth={1.9} color={t.colors.accent} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-semibold text-ink">{title}</Text>
                <Text className="text-[12.5px] leading-[18px] text-ink-2">{text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View className="gap-3">
          <Button label="Connect your first provider" icon={Network} full onPress={() => router.push('/providers/new')} />
          <Button label="Look around first" variant="ghost" full onPress={() => router.replace('/(tabs)')} />
          <View className="flex-row items-center justify-center gap-1.5 mt-1">
            <ShieldCheck size={12} color={t.colors.ink3} strokeWidth={2.2} />
            <Text className="text-[11.5px] text-ink-3">Keys live only in your device vault. No accounts, no telemetry.</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}
