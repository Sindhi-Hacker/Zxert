import { useCallback, useEffect, useRef, useState } from 'react';
import { chatRepository } from '@/repositories/chatRepository';
import { generate } from '@/services/chatEngine';
import type { ChatMessage, Conversation } from '@/types/chat';
import type { ProviderConfig } from '@/types/provider';
import { createId } from '@/utils/id';
import { safeError } from '@/utils/redact';

/**
 * Chat orchestration hook: loads a conversation, streams assistant replies
 * through the provider adapter, persists messages, and supports retrying a
 * failed or cancelled response.
 */
export function useChat(conversationId: string, provider?: ProviderConfig, modelId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const controller = useRef<AbortController | undefined>(undefined);
  /** Mirror of the latest messages so callbacks never read stale state. */
  const history = useRef<ChatMessage[]>([]);

  useEffect(() => {
    history.current = messages;
  }, [messages]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    history.current = [];
    chatRepository
      .messages(conversationId)
      .then((v) => {
        if (active) setMessages(v);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.current?.abort();
    };
  }, [conversationId]);

  /** Stream an assistant reply for `base` history (which ends with `user`). */
  const run = useCallback(
    async (base: ChatMessage[], user: ChatMessage) => {
      if (!provider || !modelId) return;
      const now = Date.now();
      const assistant: ChatMessage = {
        id: createId('msg'),
        conversationId,
        role: 'assistant',
        blocks: [{ type: 'text', text: '' }],
        status: 'streaming',
        createdAt: now,
        updatedAt: now,
        providerId: provider.id,
        modelId,
        parentId: user.id,
      };
      const withAssistant = [...base, assistant];
      setMessages(withAssistant);
      history.current = withAssistant;
      await chatRepository.saveMessage(assistant);

      controller.current = new AbortController();
      try {
        let output = '';
        let thinking = '';
        for await (const event of generate(provider, modelId, base, {}, controller.current.signal)) {
          if (event.type === 'text-delta') output += event.text;
          if (event.type === 'thinking-delta') thinking += event.text;
          if (event.type === 'usage') assistant.usage = event.usage;
          if (event.type === 'done') assistant.finishReason = event.finishReason;
          assistant.blocks = [
            ...(thinking ? [{ type: 'thinking' as const, text: thinking }] : []),
            { type: 'text' as const, text: output },
          ];
          assistant.updatedAt = Date.now();
          setMessages((prev) => prev.map((m) => (m.id === assistant.id ? { ...assistant } : m)));
        }
        assistant.status = 'complete';
      } catch (e) {
        assistant.status = controller.current.signal.aborted ? 'cancelled' : 'failed';
        assistant.blocks = [...assistant.blocks, { type: 'error', message: safeError(e), retryable: true }];
      } finally {
        assistant.updatedAt = Date.now();
        setMessages((prev) => prev.map((m) => (m.id === assistant.id ? { ...assistant } : m)));
        await chatRepository.saveMessage(assistant);
        controller.current = undefined;
      }
    },
    [conversationId, modelId, provider],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !provider || !modelId || controller.current) return;
      const now = Date.now();
      const user: ChatMessage = {
        id: createId('msg'),
        conversationId,
        role: 'user',
        blocks: [{ type: 'text', text: trimmed }],
        status: 'complete',
        createdAt: now,
        updatedAt: now,
        providerId: provider.id,
        modelId,
      };
      const base = [...history.current, user];
      setMessages(base);
      history.current = base;
      await chatRepository.saveMessage(user);

      const existing = await chatRepository.getConversation(conversationId);
      const conversation: Conversation = {
        id: conversationId,
        title: existing?.title?.trim() || trimmed.slice(0, 56),
        providerId: provider.id,
        modelId,
        pinned: existing?.pinned ?? false,
        archived: existing?.archived ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await chatRepository.saveConversation(conversation);
      await run(base, user);
    },
    [conversationId, modelId, provider, run],
  );

  /** Re-run the user message that produced a failed/cancelled assistant reply. */
  const retry = useCallback(
    async (assistantId: string) => {
      if (!provider || !modelId || controller.current) return;
      const failed = history.current.find((m) => m.id === assistantId);
      if (!failed) return;
      const user = history.current.find((m) => m.id === failed.parentId);
      if (!user) return;
      const userIndex = history.current.findIndex((m) => m.id === user.id);
      const base = history.current.slice(0, userIndex + 1).filter((m) => m.id !== assistantId);
      setMessages(base);
      history.current = base;
      await chatRepository.removeMessage(assistantId);
      await run(base, user);
    },
    [modelId, provider, run],
  );

  const stop = useCallback(() => controller.current?.abort(), []);

  return {
    messages,
    loading,
    generating: messages.some((m) => m.status === 'streaming'),
    send,
    stop,
    retry,
  };
}
