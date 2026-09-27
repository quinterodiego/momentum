/**
 * Schema de Drizzle para Postgres (Neon).
 * Reemplaza las 4 hojas de Google Sheets: users, routines, daily_logs, stats.
 *
 * user_id en routines/daily_logs/stats es un campo indexado, NO una foreign
 * key hacia users: los usuarios de Google OAuth nunca tienen fila en
 * `users` (esa tabla solo la usa el login por email/contraseña), así que
 * una FK real rompería el insert para cualquier cuenta de Google.
 */

import {
  pgTable,
  text,
  numeric,
  boolean,
  integer,
  date,
  timestamp,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const routines = pgTable(
  'routines',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    type: text('type').notNull(), // 'time' | 'quantity'
    minValue: numeric('min_value', { precision: 10, scale: 2 }).notNull(),
    unit: text('unit').notNull().default(''),
    active: boolean('active').notNull().default(true),
    scheduledDays: integer('scheduled_days').array().notNull().default([]),
  },
  (table) => ({
    userActiveIdx: index('routines_user_active_idx').on(table.userId, table.active),
    typeCheck: check('routines_type_check', sql`${table.type} in ('time', 'quantity')`),
  })
);

export const dailyLogs = pgTable(
  'daily_logs',
  {
    id: text('id').primaryKey(),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id),
    userId: text('user_id').notNull(),
    date: date('date').notNull(),
    completed: boolean('completed').notNull().default(false),
    value: numeric('value', { precision: 10, scale: 2 }).notNull().default('0'),
  },
  (table) => ({
    routineDateUnique: uniqueIndex('daily_logs_routine_date_unique').on(table.routineId, table.date),
    userDateIdx: index('daily_logs_user_date_idx').on(table.userId, table.date),
  })
);

export const stats = pgTable('stats', {
  userId: text('user_id').primaryKey(),
  streak: integer('streak').notNull().default(0),
  lastCompletedDate: date('last_completed_date'),
});
