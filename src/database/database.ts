import * as SQLite from 'expo-sqlite';
let promise:Promise<SQLite.SQLiteDatabase>|undefined;
export async function database(){
 promise??=(async()=>{const db=await SQLite.openDatabaseAsync('zxert.db');await db.execAsync(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
 CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY NOT NULL, conversation_id TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE);
 CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id,created_at);
 CREATE TABLE IF NOT EXISTS drafts (conversation_id TEXT PRIMARY KEY NOT NULL, text TEXT NOT NULL, updated_at INTEGER NOT NULL);`);return db;})(); return promise;
}
