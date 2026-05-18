import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const anime = pgTable('anime', {
  id: serial('id').primaryKey(),
  anilistId: integer('anilist_id').unique().notNull(),
  title: text('title').notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  steamId: integer('steam_id').unique().notNull(),
  title: text('title').notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminConfig = pgTable('admin_config', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
