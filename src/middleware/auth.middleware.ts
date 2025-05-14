import type { Context, Next } from "hono";

// utils
import {
  getAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";

// constants
import { Errors } from "../constants/error";
import { redis } from "./redis.middleware";

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

  const refreshToken = await redis.get(`refresh_token:${decoded.userId}`);

  if (!refreshToken) {
    throw new Error(Errors.JWT.INVALID_REFRESH_TOKEN.code);
  }

  const storedTokenData = JSON.parse(refreshToken);
  const decoded_refreshToken = verifyRefreshToken(storedTokenData);

  if (!decoded_refreshToken) {
    throw new Error(Errors.JWT.REFRESH_EXPIRED.code);
  }

  await next();
};
