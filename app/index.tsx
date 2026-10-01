import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/providers/AppProviders';
import { Brand } from '@/components/ui/Brand';

export default function Index() {
  const { hydrated, providers } = useAppStore();
  const t = useTheme();

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: t.colors.canvas }}>
        <Brand compact size={42} />
      </View>
    );
  }

  return <Redirect href={providers.length ? '/(tabs)' : '/onboarding'} />;
}
