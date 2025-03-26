import {
  mysqlTable,
  serial,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";

// DB 테이블 생성
export const users = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  age: int().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull().default("1234"),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const tokens = mysqlTable("tokens", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .notNull()
    .references(() => users.id)
    .unique(),
  accessToken: varchar({ length: 255 }).notNull(),
  refreshToken: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const uploads = mysqlTable("uploads", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .notNull()
    .references(() => users.id),
  fileUrl: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
