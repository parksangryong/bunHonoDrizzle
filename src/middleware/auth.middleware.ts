import type { Context, Next } from "hono";

// utils
import {
  getAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";

// db
import { db } from "../db";
import { tokens } from "../db/schema";
import { eq } from "drizzle-orm";

// constants
import { Errors } from "../constants/error";

interface JwtPayload {
  name: string;
  userId: number;
}

export const authenticateToken = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error(Errors.JWT.TOKEN_REQUIRED.code);
  }

  const accessToken = getAccessToken(authHeader);

  const decoded = verifyAccessToken(accessToken) as JwtPayload;

  if (!decoded) {
    throw new Error(Errors.JWT.ACCESS_EXPIRED.code);
  }

  const getTokenData = await db
    .select({
      refreshToken: tokens.refreshToken,
    })
    .from(tokens)
    .where(eq(tokens.accessToken, accessToken));

  if (!getTokenData) {
    throw new Error(Errors.JWT.ACCESS_EXPIRED.code);
  }

  const refreshDecoded = verifyRefreshToken(getTokenData[0].refreshToken);

  console.log("ACCESS_TOKEN_SECRET:", decoded);
  console.log("REFRESH_TOKEN_DECODED:", refreshDecoded);

  if (!decoded && !refreshDecoded) {
    throw new Error(Errors.JWT.REFRESH_EXPIRED.code);
  }

  try {
    await db.select().from(tokens).where(eq(tokens.userId, decoded.userId));
    c.set("user", decoded);
    await next();
  } catch (error) {
    throw new Error(Errors.JWT.DB_ERROR.code);
  }
};
