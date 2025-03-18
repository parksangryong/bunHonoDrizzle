import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export const getUserList = async () => {
  const userList = await db.select().from(users);
  return userList;
};

export const createUser = async (name: string, age: number, email: string) => {
  await db.insert(users).values({ name, age, email });
};

export const getUserById = async (id: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) {
    throw new HTTPException(403, { message: "사용자를 찾을 수 없습니다." });
  }
  return user;
};
