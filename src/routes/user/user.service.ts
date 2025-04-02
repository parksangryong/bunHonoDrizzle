import { db } from "../../db";
import { users } from "../../db/schema";

export const createUser = async (
  name: string,
  age: number,
  email: string,
  password: string
) => {
  await db.insert(users).values({ name, age, email, password });
};

export const getUsers = async () => {
  return await db.select().from(users);
};
