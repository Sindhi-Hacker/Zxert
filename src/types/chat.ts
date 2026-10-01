export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string; redacted?: boolean }
  | { type: 'image'; uri: string; mimeType?: string; alt?: string }
  | { type: 'file'; uri: string; name: string; mimeType?: string; size?: number }
  | { type: 'tool-call'; id: string; name: string; arguments: unknown }
  | { type: 'tool-result'; toolCallId: string; result: unknown }
  | { type: 'citation'; title?: string; url: string; snippet?: string }
  | { type: 'json'; value: unknown }
  | { type: 'error'; message: string; retryable: boolean };

export interface ChatMessage {
  id: string; conversationId: string; role: MessageRole; blocks: ContentBlock[];
  status: 'pending' | 'streaming' | 'complete' | 'failed' | 'cancelled';
  createdAt: number; updatedAt: number; parentId?: string; modelId?: string; providerId?: string;
  finishReason?: string; usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
}
export interface Conversation {
  id: string; title: string; providerId?: string; modelId?: string; systemPrompt?: string;
  pinned: boolean; archived: boolean; folderId?: string; createdAt: number; updatedAt: number;
}
export interface GenerationOptions {
  temperature?: number; topP?: number; maxTokens?: number; reasoningEffort?: 'low'|'medium'|'high';
  frequencyPenalty?: number; presencePenalty?: number; seed?: number; responseFormat?: 'text'|'json';
  custom?: Record<string, unknown>;
}
export type StreamEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'thinking-delta'; text: string }
  | { type: 'tool-delta'; id: string; name?: string; argumentsDelta?: string }
  | { type: 'usage'; usage: ChatMessage['usage'] }
  | { type: 'done'; finishReason?: string }
  | { type: 'error'; error: Error };
