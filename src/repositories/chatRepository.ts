import { database } from '@/database/database';import type { ChatMessage,Conversation } from '@/types/chat';
export const chatRepository={
  async listConversations(limit=100,offset=0):Promise<Conversation[]>{const db=await database();const rows=await db.getAllAsync<{data:string}>('SELECT data FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?',limit,offset);return rows.map(r=>JSON.parse(r.data));},
  async getConversation(id:string):Promise<Conversation|undefined>{const db=await database();const row=await db.getFirstAsync<{data:string}>('SELECT data FROM conversations WHERE id=?',id);return row?JSON.parse(row.data):undefined;},
  async countMessages():Promise<number>{const db=await database();const row=await db.getFirstAsync<{count:number}>('SELECT COUNT(*) as count FROM messages');return row?.count??0;},
 async saveConversation(c:Conversation){const db=await database();await db.runAsync('INSERT OR REPLACE INTO conversations(id,data,updated_at) VALUES(?,?,?)',c.id,JSON.stringify(c),c.updatedAt);},
 async removeConversation(id:string){const db=await database();await db.runAsync('DELETE FROM conversations WHERE id=?',id);},
 async messages(conversationId:string,limit=100,before=Number.MAX_SAFE_INTEGER):Promise<ChatMessage[]>{const db=await database();const rows=await db.getAllAsync<{data:string}>('SELECT data FROM messages WHERE conversation_id=? AND created_at<? ORDER BY created_at DESC LIMIT ?',conversationId,before,limit);return rows.map(r=>JSON.parse(r.data)).reverse();},
 async saveMessage(m:ChatMessage){const db=await database();await db.runAsync('INSERT OR REPLACE INTO messages(id,conversation_id,data,created_at) VALUES(?,?,?,?)',m.id,m.conversationId,JSON.stringify(m),m.createdAt);},
 async removeMessage(id:string){const db=await database();await db.runAsync('DELETE FROM messages WHERE id=?',id);},
 async getDraft(id:string){const db=await database();return (await db.getFirstAsync<{text:string}>('SELECT text FROM drafts WHERE conversation_id=?',id))?.text??'';},
 async saveDraft(id:string,text:string){const db=await database();await db.runAsync('INSERT OR REPLACE INTO drafts(conversation_id,text,updated_at) VALUES(?,?,?)',id,text,Date.now());},
};
