import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  bio: text('bio').notNull(),
  photoUrl: text('photoUrl').notNull(),
  coverUrl: text('coverUrl').default(''),
  fontFamily: text('fontFamily').default('sans'),
  achievements: jsonb('achievements').$type<string[]>().default([]).notNull(),
  skills: jsonb('skills').$type<string[]>().default([]).notNull(),
  linkedin: text('linkedin').notNull(),
  instagram: text('instagram').notNull(),
  github: text('github').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
