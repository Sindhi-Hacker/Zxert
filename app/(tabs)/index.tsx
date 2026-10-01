import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowDown, ChevronDown, PanelLeft, SquarePen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/AppProviders';
import { useAppStore } from '@/store/appStore';
import { Brand } from '@/components/ui/Brand';
import { IconButton } from '@/components/ui/IconButton';
import { Composer } from '@/components/chat/Composer';
import { MessageItem } from '@/components/chat/MessageItem';
import { useChat } from '@/features/chat/useChat';
import { chatRepository } from '@/repositories/chatRepository';
import { Glow } from '@/components/ui/Glow';
import { createId } from '@/utils/id';
import { hapticTap } from '@/utils/haptics';

const SUGGESTIONS = ['Explain this code', 'Draft a launch email', 'Compare two options', 'Plan a road trip'];

export default function Chat() {
  const t = useTheme();
  const params = useLocalSearchParams<{ conv?: string; k?: string }>();
  const { providers, models, selectedProviderId, selectedModelId } = useAppStore();
  const [conversationId, setConversationId] = useState(() => {
    const conv = typeof params.conv === 'string' ? params.conv : '';
    return conv || createId('conv');
  });
  const [draft, setDraft] = useState('');
  const [away, setAway] = useState(false);
  const list = useRef<FlatList>(null);
  /** Messages created after this moment animate in; history loads quietly. */
  const sessionStart = useRef(0);

  useEffect(() => {
    if (sessionStart.current === 0) sessionStart.current = Date.now();
  }, []);

  // Opening a conversation from the Library (k = navigation nonce so
  // re-opening the same conversation still triggers the switch)
  useEffect(() => {
    const conv = typeof params.conv === 'string' ? params.conv : '';
    if (conv && conv !== conversationId) {
      sessionStart.current = Date.now();
      setConversationId(conv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.k, params.conv]);

  // Draft persistence (load on switch, debounced save — never write a draft
  // into a conversation before its own draft has loaded)
  const draftReadyFor = useRef('');
  useEffect(() => {
    const id = conversationId;
    chatRepository
      .getDraft(id)
      .then((v) => {
        draftReadyFor.current = id;
        setDraft(v);
      })
      .catch(() => {
        draftReadyFor.current = id;
        setDraft('');
      });
  }, [conversationId]);

  useEffect(() => {
    if (draftReadyFor.current !== conversationId) return;
    const id = setTimeout(() => {
      void chatRepository.saveDraft(conversationId, draft);
    }, 350);
    return () => clearTimeout(id);
  }, [draft, conversationId]);

  const provider = providers.find((p) => p.id === selectedProviderId);
  const model = models.find((m) => m.id === selectedModelId && m.providerId === selectedProviderId);
  const chat = useChat(conversationId, provider, model?.id);

  const newChat = () => {
    hapticTap();
    sessionStart.current = Date.now();
    setConversationId(createId('conv'));
    setDraft('');
    router.setParams({ conv: undefined } as never);
  };

  const modelLabel = model?.displayName ?? 'Choose model';
  const providerLabel = provider?.name ?? 'No provider selected';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.canvas }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Glass header */}
        <View
          className="flex-row items-center gap-1.5 px-3 h-[60px] border-b border-line"
          style={{ backgroundColor: t.colors.header }}
        >
          <IconButton icon={PanelLeft} label="Open library" onPress={() => router.push('/(tabs)/conversations')} size={40} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Model: ${modelLabel}, provider: ${providerLabel}`}
            onPress={() => router.push('/models')}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-1.5"
            style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
          >
            <View className="items-center max-w-[220px]">
              <Text numberOfLines={1} className="text-[14px] font-semibold text-ink">
                {modelLabel}
              </Text>
              <Text numberOfLines={1} className="text-[11px] text-ink-2">
                {providerLabel}
              </Text>
            </View>
            <ChevronDown size={14} color={t.colors.ink3} strokeWidth={2.2} />
          </Pressable>
          <IconButton icon={SquarePen} label="New conversation" onPress={newChat} size={40} />
        </View>

        {/* Body */}
        {chat.messages.length === 0 ? (
          <View className="flex-1 relative justify-center">
            <Glow />
            <View className="items-center gap-3.5 px-8">
              <Brand compact size={56} />
              <Text className="font-display-bold text-[29px] leading-[35px] text-ink tracking-[-0.8px] text-center mt-1">
                What are we building?
              </Text>
              <Text className="text-[14px] leading-[21px] text-ink-2 text-center max-w-[340px]">
                {model
                  ? `Start a conversation with ${model.displayName}.`
                  : 'Connect a provider and pick a model to begin.'}
              </Text>
              {!provider ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/providers/new')}
                  className="mt-2"
                >
                  <Text className="text-[14px] font-bold text-accent">Configure a provider →</Text>
                </Pressable>
              ) : !model ? (
                <Pressable accessibilityRole="button" onPress={() => router.push('/models')} className="mt-2">
                  <Text className="text-[14px] font-bold text-accent">Choose a model →</Text>
                </Pressable>
              ) : (
                <View className="flex-row flex-wrap justify-center gap-2 mt-3 max-w-[420px]">
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      onPress={() => {
                        hapticTap();
                        setDraft(s);
                      }}
                      className="bg-surface border border-line rounded-full px-4 h-9 justify-center"
                      style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
                    >
                      <Text className="text-[13px] text-ink-2">{s}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            ref={list}
            data={chat.messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <MessageItem
                message={item}
                fresh={item.createdAt >= sessionStart.current}
                onRetry={item.role === 'assistant' ? () => chat.retry(item.id) : undefined}
              />
            )}
            contentContainerStyle={{ paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' }}
            onContentSizeChange={() => {
              if (!away) list.current?.scrollToEnd({ animated: true });
            }}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              setAway(contentSize.height - layoutMeasurement.height - contentOffset.y > 120);
            }}
            scrollEventThrottle={32}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Jump to latest */}
        {away && chat.messages.length > 0 && (
          <Pressable
            accessibilityLabel="Jump to latest message"
            onPress={() => {
              hapticTap();
              list.current?.scrollToEnd({ animated: true });
              setAway(false);
            }}
            className="absolute right-5 bottom-[104px] w-[42px] h-[42px] rounded-full items-center justify-center bg-surface border border-line shadow-float dark:shadow-dark-float"
            style={{ elevation: 6 }}
          >
            <ArrowDown size={18} color={t.colors.ink} strokeWidth={2.2} />
          </Pressable>
        )}

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={(v) => {
            setDraft('');
            void chat.send(v);
          }}
          onStop={chat.stop}
          generating={chat.generating}
          disabled={!provider || !model}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
