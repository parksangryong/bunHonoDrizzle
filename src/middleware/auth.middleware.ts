import type { Context, Next } from "hono";
import { verifyAccessToken } from "../utils/jwt";
import { db } from "../db";
import { tokens } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthException } from "./error.middleware";

export const authenticateToken = async (c: Context, next: Next) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    throw new AuthException(401, "인증 토큰이 필요합니다", "JWT-003");
  }

  try {
    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      throw new AuthException(
        401,
        "만료되었거나 유효하지 않은 토큰입니다",
        "JWT-001"
      );
    }

    const [storedToken] = await db
      .select()
      .from(tokens)
      .where(eq(tokens.accessToken, accessToken));

    if (!storedToken) {
      throw new AuthException(
        401,
        "데이터베이스에서 토큰을 찾을 수 없습니다",
        "JWT-002"
      );
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      throw new AuthException(401, "토큰이 만료되었습니다", "JWT-001");
    }

    c.set("user", decoded);
    await next();
  } catch (error) {
    if (error instanceof AuthException) {
      throw error;
    }
    throw new AuthException(
      401,
      "만료되었거나 유효하지 않은 토큰입니다",
      "JWT-001"
    );
  }
};
