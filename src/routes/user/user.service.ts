import { db } from "../../db";
import { users } from "../../db/schema";
import { UserResponse } from "./user.schema";
import { eq } from "drizzle-orm";

// constants
import { Errors } from "../../constants/error";
import { MySqlRawQueryResult } from "drizzle-orm/mysql2";

export const createUser = async (
  name: string,
  age: number,
  email: string,
  password: string
): Promise<MySqlRawQueryResult> => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new Error(Errors.USER.USER_NOT_FOUND.code);
  }

  return await db.insert(users).values({ name, age, email, password });
};

export const getUsers = async (): Promise<UserResponse> => {
  const userList = await db.select().from(users);
  return {
    success: true,
    message: "유저 목록 조회 성공",
    data: userList,
  };
};
