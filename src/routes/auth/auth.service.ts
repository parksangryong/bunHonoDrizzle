import { db } from "../../db";
import { users, tokens } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateTokens } from "../../utils/jwt";
import { jwtDecode } from "jwt-decode";
import type { LoginRequest, RegisterRequest } from "./auth.schema";
import { AuthException } from "../../middleware/error.middleware";

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
  const [{ insertId }] = await db
    .insert(users)
    .values({ password, name, email, age });

  const generatedTokens = generateTokens(name, insertId);

  await db
    .insert(tokens)
    .values({
      userId: insertId,
      accessToken: generatedTokens.accessToken,
      refreshToken: generatedTokens.refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .onDuplicateKeyUpdate({
      set: {
        accessToken: generatedTokens.accessToken,
        refreshToken: generatedTokens.refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

  return generatedTokens;
};

export const login = async ({
  email,
  password,
}: LoginRequest): Promise<TokenPair> => {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.password, password)));

  if (!user) {
    throw new HTTPException(400, {
      message: "이메일 또는 비밀번호가 일치하지 않습니다",
    });
  }

  const generatedTokens = generateTokens(user.name, user.id);

  await db
    .insert(tokens)
    .values({
      userId: user.id,
      accessToken: generatedTokens.accessToken,
      refreshToken: generatedTokens.refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .onDuplicateKeyUpdate({
      set: {
        accessToken: generatedTokens.accessToken,
        refreshToken: generatedTokens.refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

  return generatedTokens;
};

export const logout = async (accessToken: string): Promise<void> => {
  const decoded = jwtDecode(accessToken);
  const { userId } = decoded as { userId: number };

  await db.delete(tokens).where(eq(tokens.userId, userId));
};

export const refreshTokens = async (
  refreshToken: string
): Promise<TokenPair> => {
  const decoded = jwtDecode(refreshToken);
  const { userId, username, exp } = decoded as {
    userId: number;
    username: string;
    exp: number;
  };

  if (exp * 1000 < Date.now()) {
    throw new AuthException(401, "리프레시 토큰이 만료되었습니다", "JWT-001");
  }

  const [storedToken] = await db
    .select()
    .from(tokens)
    .where(eq(tokens.userId, userId));

  if (!storedToken || storedToken.refreshToken !== refreshToken) {
    throw new AuthException(
      401,
      "유효하지 않은 리프레시 토큰입니다",
      "JWT-002"
    );
  }

  const newAccessToken = generateTokens(username, userId).accessToken;

  await db
    .update(tokens)
    .set({
      accessToken: newAccessToken,
    })
    .where(eq(tokens.userId, userId));

  return {
    accessToken: newAccessToken,
    refreshToken: refreshToken,
  };
};
