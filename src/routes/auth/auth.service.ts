import { db } from "../../db";
import { users, tokens } from "../../db/schema";
import { eq } from "drizzle-orm";
import { redis } from "../../middleware/redis.middleware";
// utils
import { generateTokens, verifyRefreshToken } from "../../utils/jwt";
import {
  comparePassword,
  hashPassword,
  saveTokens,
} from "../../utils/auth.util";
import { jwtDecode } from "jwt-decode";

// schema
import type { LoginRequest, RegisterRequest } from "./auth.schema";

// constants
import { Errors } from "../../constants/error";
import { ACCESS_TOKEN_EXPIRATION_TIME } from "../../constants/common";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const register = async ({
  password,
  name,
  email,
  age,
}: RegisterRequest): Promise<TokenPair> => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new Error(Errors.AUTH.USER_EXISTS.code);
  }

  const hashedPassword = await hashPassword(password);

  const [{ insertId }] = await db
    .insert(users)
    .values({ password: hashedPassword, name, email, age });

  return await saveTokens(insertId, name);
};

export const login = async ({
  email,
  password,
}: LoginRequest): Promise<TokenPair> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error(Errors.AUTH.USER_NOT_FOUND.code);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error(Errors.AUTH.PASSWORD_NOT_MATCH.code);
  }

  return await saveTokens(user.id, user.name);
};

export const logout = async (
  accessToken: string
): Promise<{ message: string }> => {
  const decoded = jwtDecode(accessToken);
  const { userId } = decoded as { userId: number };

  await redis.del(`access_token:${userId}`);
  await redis.del(`refresh_token:${userId}`);

  return { message: "로그아웃에 성공했습니다" };
};

export const refreshTokens = async (
  refreshToken: string
): Promise<TokenPair> => {
  const decoded = verifyRefreshToken(refreshToken) as {
    userId: number;
    name: string;
  };

  if (!decoded) {
    throw new Error(Errors.JWT.REFRESH_EXPIRED.code);
  }

  const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

  if (!storedToken) {
    throw new Error(Errors.JWT.INVALID_REFRESH_TOKEN.code);
  }

  // Redis에 저장된 토큰은 JSON.stringify로 저장되어 있으므로 파싱
  const storedTokenData = JSON.parse(storedToken);
  if (storedTokenData !== refreshToken) {
    throw new Error(Errors.JWT.INVALID_REFRESH_TOKEN.code);
  }

  const newAccessToken = generateTokens(
    decoded.name,
    decoded.userId
  ).accessToken;

  await redis.set(`access_token:${decoded.userId}`, newAccessToken, {
    EX: ACCESS_TOKEN_EXPIRATION_TIME * 60,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: refreshToken,
  };
};
