import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Archive, MessageSquareText, Pin, Search, SearchX } from 'lucide-react-native';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/providers/AppProviders';
import { chatRepository } from '@/repositories/chatRepository';
import type { Conversation } from '@/types/chat';
import { createId } from '@/utils/id';
import { hapticImpact, hapticTap } from '@/utils/haptics';

function bucketOf(ts: number): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(new Date());
  const day = startOfDay(new Date(ts));
  if (day === today) return 'Today';
  if (day === today - 86400000) return 'Yesterday';
  if (day > today - 7 * 86400000) return 'Previous 7 days';
  return 'Earlier';
}

function timeLabel(ts: number): string {
  if (bucketOf(ts) === 'Today') return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Conversations() {
  const t = useTheme();
  const [items, setItems] = useState<Conversation[]>([]);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    chatRepository
      .listConversations(200)
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = items.filter((x) => x.title.toLowerCase().includes(q.toLowerCase()));

  const groups: { label: string; items: Conversation[] }[] = [];
  const pinned = filtered.filter((c) => c.pinned);
  if (pinned.length) groups.push({ label: 'Pinned', items: pinned });
  for (const c of filtered.filter((x) => !x.pinned)) {
    const label = bucketOf(c.updatedAt);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(c);
    else groups.push({ label, items: [c] });
  }

  const open = (c: Conversation) => {
    hapticTap();
    router.push({ pathname: '/(tabs)', params: { conv: c.id, k: createId('nav') } });
  };

  const togglePin = async (c: Conversation) => {
    await chatRepository.saveConversation({ ...c, pinned: !c.pinned, updatedAt: c.updatedAt });
    load();
  };

  const remove = async (c: Conversation) => {
    hapticImpact();
    await chatRepository.removeConversation(c.id);
    load();
  };

  const rowActions = (c: Conversation) => {
    Alert.alert(c.title, 'Choose an action for this conversation.', [
      { text: c.pinned ? 'Unpin' : 'Pin', onPress: () => void togglePin(c) },
      { text: 'Delete', style: 'destructive', onPress: () => void remove(c) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Screen
      stickyHeader={
        <View className="border-b border-line pb-4 px-6" style={{ backgroundColor: t.colors.header }}>
          <Text className="font-display-bold text-[30px] text-ink tracking-[-1px] mt-3">Library</Text>
          <Text className="text-[13px] text-ink-2 mt-0.5">
            {items.length === 0 ? 'Your conversations live here' : `${items.length} conversation${items.length === 1 ? '' : 's'}`}
          </Text>
          <View className="flex-row items-center gap-2.5 rounded-full border border-line bg-surface-2 h-11 px-4 mt-3">
            <Search size={16} color={t.colors.ink3} strokeWidth={2.2} />
            <TextInput
              accessibilityLabel="Search conversations"
              value={q}
              onChangeText={setQ}
              placeholder="Search conversations"
              placeholderTextColor={t.colors.ink3}
              selectionColor={t.colors.accent}
              className="flex-1 text-[14px] text-ink py-0"
              style={{ height: '100%' }}
            />
          </View>
        </View>
      }
    >
      {filtered.length === 0 ? (
        <View className="flex-1 justify-center py-24">
          <EmptyState
            icon={q ? SearchX : MessageSquareText}
            title={q ? 'No matches' : 'Your library is empty'}
            body={q ? 'Try a different search.' : 'Conversations you start will appear here, stored only on this device.'}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {groups.map((group) => (
            <View key={group.label} className="mb-5">
              <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-ink-3 px-2 mb-2">
                {group.label}
              </Text>
              <View className="bg-surface border border-line rounded-3xl overflow-hidden shadow-card dark:shadow-dark-card">
                {group.items.map((c, i) => (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open conversation ${c.title}`}
                    onPress={() => open(c)}
                    onLongPress={() => rowActions(c)}
                    className={`flex-row items-center gap-3.5 pl-4 pr-3.5 py-3.5 ${
                      i < group.items.length - 1 ? 'border-b border-line' : ''
                    }`}
                    style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
                  >
                    <View
                      className="w-[38px] h-[38px] rounded-xl items-center justify-center shrink-0"
                      style={{ backgroundColor: c.archived ? t.colors.surface3 : t.colors.accentSoft }}
                    >
                      {c.pinned ? (
                        <Pin size={16} fill={t.colors.accent} color={t.colors.accent} strokeWidth={2} />
                      ) : c.archived ? (
                        <Archive size={16} color={t.colors.ink2} strokeWidth={2} />
                      ) : (
                        <MessageSquareText size={16} color={t.colors.accent} strokeWidth={2} />
                      )}
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text numberOfLines={1} className={`text-[15px] font-semibold ${c.archived ? 'text-ink-2' : 'text-ink'}`}>
                        {c.title}
                      </Text>
                      <Text className="text-[12px] text-ink-3">{timeLabel(c.updatedAt)}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
          <Text className="text-[11px] text-ink-3 text-center mt-2">
            Tap to open · long-press to pin or delete
          </Text>
        </ScrollView>
      )}
    </Screen>
  );
}
