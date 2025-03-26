import { db } from "../db";
import { users, tokens } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateTokens } from "../utils/jwt";
import { jwtDecode } from "jwt-decode";
import { Context } from "hono";

export const register = async (
  password: string,
  name: string,
  email: string,
  age: number
) => {
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

export const login = async (email: string, password: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.password, password)));

  if (!user) {
    throw new HTTPException(400, {
      message: "User not found",
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

export const logout = async (accessToken: string) => {
  const decoded = jwtDecode(accessToken);
  const { userId } = decoded as { userId: number };

  await db.delete(tokens).where(eq(tokens.userId, userId));

  return { message: "로그아웃 성공" };
};

// ... existing code ...

// 리프레시 토큰으로 새 토큰 발급 함수 추가
export const refreshTokens = async (refreshToken: string, c: Context) => {
  try {
    const decoded = jwtDecode(refreshToken);
    const { userId, username, exp } = decoded as {
      userId: number;
      username: string;
      exp: number;
    };

    console.log("decoded", decoded);

    // 리프레시 토큰 만료 시간 확인
    if (exp * 1000 < Date.now()) {
      console.log("리프레시 토큰 만료");
      throw new Error("Refresh token expired");
    }

    // DB에서 저장된 리프레시 토큰 확인
    const [storedToken] = await db
      .select()
      .from(tokens)
      .where(eq(tokens.userId, userId));

    console.log("storedToken", storedToken?.refreshToken);
    console.log("refreshToken", refreshToken);

    if (!storedToken || storedToken.refreshToken !== refreshToken) {
      console.log("리프레시 토큰 유효하지 않음");
      throw new Error("Invalid refresh token");
    }

    // 액세스 토큰만 새로 생성
    const newAccessToken = generateTokens(username, userId).accessToken;

    console.log("newAccessToken", newAccessToken);

    // DB 액세스 토큰 정보만 업데이트
    await db
      .update(tokens)
      .set({
        accessToken: newAccessToken,
      })
      .where(eq(tokens.userId, userId));

    console.log("업데이트 완료");

    return c.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.log("error", error);
    return c.json(
      {
        message: "유효하지 않은 리프레시 토큰입니다.",
        code: "JWT-002",
      },
      401
    );
  }
};
