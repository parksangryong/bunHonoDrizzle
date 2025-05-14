import { db } from "../db";
import { tokens } from "../db/schema";

import { generateTokens } from "./jwt";
import * as bcrypt from "bcrypt";

import { redis } from "../middleware/redis.middleware";

import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from "../constants/common";

// 토큰 저장 함수
const saveTokens = async (userId: number, name: string) => {
  const generatedTokens = generateTokens(name, userId);

  await redis.set(`access_token:${userId}`, generatedTokens.accessToken, {
    EX: ACCESS_TOKEN_EXPIRATION_TIME * 60,
  });

  await redis.set(
    `refresh_token:${userId}`,
    JSON.stringify(generatedTokens.refreshToken),
    {
      EX: REFRESH_TOKEN_EXPIRATION_TIME * 60 * 60 * 24,
    }
  );

  return generatedTokens;
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export { saveTokens, hashPassword, comparePassword };
