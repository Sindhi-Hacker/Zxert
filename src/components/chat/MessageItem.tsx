import React, { memo, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  RotateCcw,
} from 'lucide-react-native';
import type { ChatMessage } from '@/types/chat';
import type { AppTheme } from '@/theme/tokens';
import { useTheme } from '@/providers/AppProviders';
import { TypingDots } from '@/components/chat/TypingDots';
import { hapticTap } from '@/utils/haptics';

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

function markdownStyles(t: AppTheme) {
  return {
    body: { color: t.colors.ink, fontSize: 15.5, lineHeight: 24 },
    paragraph: { marginTop: 0, marginBottom: 10 },
    heading1: { color: t.colors.ink, fontSize: 21, lineHeight: 28, fontWeight: '700' as const, marginTop: 18, marginBottom: 8 },
    heading2: { color: t.colors.ink, fontSize: 18, lineHeight: 25, fontWeight: '700' as const, marginTop: 16, marginBottom: 6 },
    heading3: { color: t.colors.ink, fontSize: 16.5, lineHeight: 23, fontWeight: '700' as const, marginTop: 14, marginBottom: 5 },
    heading4: { color: t.colors.ink, fontSize: 15.5, lineHeight: 22, fontWeight: '700' as const, marginTop: 12, marginBottom: 4 },
    heading5: { color: t.colors.ink, fontSize: 15, lineHeight: 21, fontWeight: '700' as const, marginTop: 10, marginBottom: 4 },
    heading6: { color: t.colors.ink2, fontSize: 14, lineHeight: 20, fontWeight: '700' as const, marginTop: 10, marginBottom: 4 },
    strong: { fontWeight: '700' as const },
    em: { fontStyle: 'italic' as const },
    s: { textDecorationLine: 'line-through' as const, color: t.colors.ink2 },
    link: { color: t.colors.accent, fontWeight: '600' as const },
    code_inline: {
      backgroundColor: t.colors.surface3,
      color: t.colors.ink,
      fontFamily: mono,
      fontSize: 13.5,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 6,
    },
    fence: {
      backgroundColor: t.colors.surface2,
      borderColor: t.colors.line,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      marginTop: 6,
      marginBottom: 10,
      color: t.colors.ink,
      fontFamily: mono,
      fontSize: 13,
      lineHeight: 19,
    },
    blockquote: {
      backgroundColor: t.colors.canvas2,
      borderLeftColor: t.colors.accentLine,
      borderLeftWidth: 3,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 6,
      marginBottom: 10,
    },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { marginBottom: 4 },
    hr: { backgroundColor: t.colors.line, height: 1, marginTop: 14, marginBottom: 14 },
    table: { borderWidth: 1, borderColor: t.colors.line, borderRadius: 10 },
    thead: { backgroundColor: t.colors.surface3 },
    th: { padding: 8, color: t.colors.ink, fontWeight: '700' as const, fontSize: 13.5 },
    tr: { borderBottomWidth: 1, borderColor: t.colors.line },
    td: { padding: 8, fontSize: 13.5 },
  };
}

function timeOf(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export const MessageItem = memo(function MessageItem({
  message,
  onRetry,
  fresh = false,
}: {
  message: ChatMessage;
  onRetry?: () => void;
  fresh?: boolean;
}) {
  const t = useTheme();
  const [copied, setCopied] = useState(false);
  const [reasoning, setReasoning] = useState(false);

  const user = message.role === 'user';
  const streaming = message.status === 'streaming';
  const text = message.blocks.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const thought = message.blocks.find((b) => b.type === 'thinking');
  const error = message.blocks.find((b) => b.type === 'error');
  const md = useMemo(() => markdownStyles(t), [t]);
  const time = timeOf(message.createdAt);

  const copy = async () => {
    await Clipboard.setStringAsync(text);
    hapticTap();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const canRetry = !!onRetry && !streaming && (!!error || message.status === 'failed' || message.status === 'cancelled');

  return (
    <Animated.View
      entering={fresh ? FadeInDown.springify().damping(16).mass(0.5) : undefined}
      className={user ? 'items-end px-5 py-1.5' : 'px-5 py-1.5'}
      style={user ? { maxWidth: '100%' } : undefined}
    >
      {user ? (
        <View className="items-end max-w-[86%]">
          <View className="bg-bubble rounded-[22px] rounded-tr-[7px] px-4 pt-2.5 pb-2.5">
            <Text className="text-[15px] leading-[22px] text-bubble-ink">{text}</Text>
          </View>
          <Text className="text-[10.5px] text-ink-3 mt-1.5 mr-1">{time}</Text>
        </View>
      ) : (
        <View className="flex-row gap-3 w-full">
          {/* Assistant avatar */}
          <LinearGradient
            colors={['#B8F37E', '#7ECC3E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            <Text className="font-display text-[#111A06]" style={{ fontSize: 15, lineHeight: 17 }}>
              Z
            </Text>
          </LinearGradient>

          <View className="flex-1 min-w-0">
            {/* Reasoning */}
            {thought?.type === 'thinking' && (
              <View className="bg-surface-2 border border-line rounded-2xl mb-2.5 overflow-hidden">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={reasoning ? 'Hide reasoning' : 'Show reasoning'}
                  onPress={() => setReasoning((v) => !v)}
                  className="flex-row items-center gap-2 px-3 py-2.5"
                >
                  <Brain size={14} strokeWidth={2} color={t.colors.ink2} />
                  <Text className="flex-1 text-[12.5px] font-semibold text-ink-2">Reasoning</Text>
                  {reasoning ? (
                    <ChevronUp size={14} color={t.colors.ink3} />
                  ) : (
                    <ChevronDown size={14} color={t.colors.ink3} />
                  )}
                </Pressable>
                {reasoning && (
                  <Text className="text-[13px] leading-[19px] text-ink-2 px-3 pb-3">{thought.text}</Text>
                )}
              </View>
            )}

            {/* Content */}
            {text ? (
              <Markdown style={md}>{streaming ? `${text}▍` : text}</Markdown>
            ) : streaming ? (
              <View className="py-1.5">
                <TypingDots />
              </View>
            ) : null}

            {/* Error */}
            {error?.type === 'error' && (
              <View
                className="flex-row items-center gap-2.5 rounded-2xl px-3.5 py-3 mb-1"
                style={{ backgroundColor: t.colors.dangerSoft }}
              >
                <AlertTriangle size={16} strokeWidth={2.2} color={t.colors.danger} />
                <Text className="flex-1 text-[13px] leading-[18px] font-medium" style={{ color: t.colors.danger }}>
                  {error.message}
                </Text>
                {canRetry && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retry message"
                    onPress={onRetry}
                    hitSlop={8}
                    className="w-8 h-8 rounded-xl items-center justify-center"
                    style={{ backgroundColor: t.colors.danger }}
                  >
                    <RotateCcw size={15} color={t.colors.dangerInk} strokeWidth={2.3} />
                  </Pressable>
                )}
              </View>
            )}

            {/* Actions */}
            {!streaming && text && (
              <View className="flex-row items-center gap-2 mt-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy response"
                  onPress={copy}
                  className="flex-row items-center gap-1.5 h-8 px-3 rounded-full bg-surface-2 border border-line"
                >
                  {copied ? (
                    <Check size={13} strokeWidth={2.4} color={t.colors.accent} />
                  ) : (
                    <Copy size={13} strokeWidth={2.2} color={t.colors.ink2} />
                  )}
                  <Text className={`text-[12px] font-semibold ${copied ? 'text-accent' : 'text-ink-2'}`}>
                    {copied ? 'Copied' : 'Copy'}
                  </Text>
                </Pressable>
                {canRetry && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retry message"
                    onPress={onRetry}
                    className="flex-row items-center gap-1.5 h-8 px-3 rounded-full bg-surface-2 border border-line"
                  >
                    <RotateCcw size={13} strokeWidth={2.2} color={t.colors.ink2} />
                    <Text className="text-[12px] font-semibold text-ink-2">Retry</Text>
                  </Pressable>
                )}
                <Text className="text-[10.5px] text-ink-3 ml-1">{time}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Animated.View>
  );
});
