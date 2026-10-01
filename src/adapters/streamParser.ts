import type { StreamEvent } from '@/types/chat';

type Decoder = (payload: unknown) => StreamEvent[];
export class SSEParser {
  private buffer = '';
  constructor(private readonly decode: Decoder) {}
  push(chunk: string): StreamEvent[] {
    this.buffer += chunk.replace(/\r\n/g, '\n'); const output: StreamEvent[] = [];
    let boundary: number;
    while ((boundary = this.buffer.indexOf('\n\n')) >= 0) {
      const frame = this.buffer.slice(0, boundary); this.buffer = this.buffer.slice(boundary + 2);
      const data = frame.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n');
      if (!data) continue; if (data.trim() === '[DONE]') { output.push({ type: 'done' }); continue; }
      try { output.push(...this.decode(JSON.parse(data))); } catch { /* incomplete/non-JSON heartbeats are ignored */ }
    }
    return output;
  }
  flush(): StreamEvent[] { const rest = this.buffer.trim(); this.buffer=''; if (!rest) return []; const data=rest.replace(/^data:\s*/, ''); if (data==='[DONE]') return [{type:'done'}]; try{return this.decode(JSON.parse(data));}catch{return [];} }
}

export function decodeOpenAIChunk(value: any): StreamEvent[] {
  const events: StreamEvent[]=[]; const choice=value?.choices?.[0]; const delta=choice?.delta;
  if (typeof delta?.content==='string') events.push({type:'text-delta',text:delta.content});
  if (typeof delta?.reasoning_content==='string') events.push({type:'thinking-delta',text:delta.reasoning_content});
  for (const call of delta?.tool_calls ?? []) events.push({type:'tool-delta',id:call.id ?? String(call.index),name:call.function?.name,argumentsDelta:call.function?.arguments});
  if (value?.usage) events.push({type:'usage',usage:{inputTokens:value.usage.prompt_tokens,outputTokens:value.usage.completion_tokens,totalTokens:value.usage.total_tokens}});
  if (choice?.finish_reason) events.push({type:'done',finishReason:choice.finish_reason}); return events;
}
export function decodeResponsesChunk(value:any):StreamEvent[]{
  if(value?.type==='response.output_text.delta') return [{type:'text-delta',text:value.delta ?? ''}];
  if(value?.type==='response.reasoning_summary_text.delta') return [{type:'thinking-delta',text:value.delta ?? ''}];
  if(value?.type==='response.completed') return [{type:'done',finishReason:value.response?.status}]; return [];
}
export function decodeAnthropicChunk(value:any):StreamEvent[]{
  if(value?.type==='content_block_delta' && value.delta?.type==='text_delta') return [{type:'text-delta',text:value.delta.text ?? ''}];
  if(value?.type==='content_block_delta' && value.delta?.type==='thinking_delta') return [{type:'thinking-delta',text:value.delta.thinking ?? ''}];
  if(value?.type==='message_delta' && value.usage) return [{type:'usage',usage:{outputTokens:value.usage.output_tokens}}];
  if(value?.type==='message_stop') return [{type:'done'}]; return [];
}
