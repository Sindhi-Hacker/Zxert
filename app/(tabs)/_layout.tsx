import { Tabs } from 'expo-router';
import { LibraryBig, MessageCircle, Settings2, Waypoints } from 'lucide-react-native';
import { TabBar, type TabBarProps } from '@/components/ui/TabBar';

const tabs = [
  { name: 'index', title: 'Chat', icon: MessageCircle },
  { name: 'conversations', title: 'Library', icon: LibraryBig },
  { name: 'providers', title: 'Providers', icon: Waypoints },
  { name: 'settings', title: 'Settings', icon: Settings2 },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'fade' }}
      tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} tabs={tabs} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="conversations" options={{ title: 'Library' }} />
      <Tabs.Screen name="providers" options={{ title: 'Providers' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
