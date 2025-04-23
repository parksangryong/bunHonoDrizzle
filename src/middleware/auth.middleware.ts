import type { Context, Next } from "hono";

// utils
import { verifyAccessToken } from "../utils/jwt";

// db
import { db } from "../db";
import { tokens } from "../db/schema";
import { eq } from "drizzle-orm";

// constants
import { Errors } from "../constants/error";

export const authenticateToken = async (c: Context, next: Next) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    throw new Error(Errors.JWT.TOKEN_REQUIRED.code);
  }

  try {
    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      throw new Error(Errors.JWT.ACCESS_EXPIRED.code);
    }

    const [storedToken] = await db
      .select()
      .from(tokens)
      .where(eq(tokens.accessToken, accessToken));

    if (!storedToken) {
      throw new Error(Errors.JWT.REFRESH_EXPIRED.code);
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      throw new Error(Errors.JWT.ACCESS_EXPIRED.code);
    }

    c.set("user", decoded);
    await next();
  } catch (error) {
    throw new Error(Errors.JWT.REFRESH_EXPIRED.code);
  }
};
