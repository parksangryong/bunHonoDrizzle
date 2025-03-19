import { int, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

// DB 테이블 생성
export const users = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  age: int().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
