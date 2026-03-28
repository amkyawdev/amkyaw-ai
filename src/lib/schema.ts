import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: serial('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});