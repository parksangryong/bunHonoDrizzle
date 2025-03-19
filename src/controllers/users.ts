import { db } from "../db";
import { users } from "../db/schema";

export const createUser = async (name: string, age: number, email: string) => {
  await db.insert(users).values({ name, age, email });
};
