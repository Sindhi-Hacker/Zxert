import { BaseAdapter } from './base';
import { decodeOpenAIChunk, decodeResponsesChunk } from './streamParser';
import { joinUrl, type AdapterContext, type ChatRequest } from './providerAdapter';
import type { ChatMessage } from '@/types/chat';

const text=(m:ChatMessage)=>m.blocks.filter(b=>b.type==='text').map(b=>b.text).join('\n');
export class OpenAIChatAdapter extends BaseAdapter {
 buildRequest(c:AdapterContext,r:ChatRequest){const o=r.options??{};return {url:joinUrl(c.provider.baseUrl,c.provider.endpoint.chatPath),init:{method:c.provider.endpoint.method,headers:this.buildHeaders(c),signal:c.signal,body:JSON.stringify({model:r.model,messages:r.messages.map(m=>({role:m.role,content:text(m)})),stream:r.stream,stream_options:r.stream?{include_usage:true}:undefined,temperature:o.temperature,top_p:o.topP,max_tokens:o.maxTokens,frequency_penalty:o.frequencyPenalty,presence_penalty:o.presencePenalty,seed:o.seed,response_format:o.responseFormat==='json'?{type:'json_object'}:undefined,...o.custom})}};}
 parseResponse(v:any){const value=v?.choices?.[0]?.message?.content;if(typeof value!=='string')throw new Error('The provider returned no assistant text');return value;}
 parseStreamEvent=decodeOpenAIChunk;
}
export class OpenAIResponsesAdapter extends BaseAdapter {
 buildRequest(c:AdapterContext,r:ChatRequest){const o=r.options??{};return {url:joinUrl(c.provider.baseUrl,c.provider.endpoint.chatPath),init:{method:c.provider.endpoint.method,headers:this.buildHeaders(c),signal:c.signal,body:JSON.stringify({model:r.model,input:r.messages.map(m=>({role:m.role==='tool'?'user':m.role,content:text(m)})),stream:r.stream,temperature:o.temperature,top_p:o.topP,max_output_tokens:o.maxTokens,reasoning:o.reasoningEffort?{effort:o.reasoningEffort}:undefined,...o.custom})}};}
 parseResponse(v:any){const direct=v?.output_text;if(typeof direct==='string')return direct;const blocks=v?.output?.flatMap((x:any)=>x.content??[])??[];return blocks.filter((x:any)=>x.type==='output_text').map((x:any)=>x.text).join('');}
 parseStreamEvent=decodeResponsesChunk;
}
