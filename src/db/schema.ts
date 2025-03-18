import { int, mysqlTable, serial, varchar, text } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  age: int().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const posts = mysqlTable("posts", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  userId: int().notNull(),
});
