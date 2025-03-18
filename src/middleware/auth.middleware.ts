import { Context, Next } from "hono";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
} from "../jwt/jwt";

export const authenticateToken = async (c: Context, next: Next) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];
  const refreshToken = c.req.header("X-Refresh-Token");

  if (!accessToken) {
    return c.json({ message: "인증 토큰이 필요합니다." }, 401);
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    if (decoded) {
      c.set("user", decoded);
      await next();
    } else {
      return c.json({ message: "유효하지 않은 토큰입니다." }, 401);
    }
  } catch (error) {
    if (refreshToken) {
      try {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        if (refreshDecoded) {
          const { username, password } = refreshDecoded as {
            username: string;
            password: string;
          };
          const newTokens = generateTokens(username, password);

          c.header("New-Access-Token", newTokens.accessToken);
          c.header("New-Refresh-Token", newTokens.refreshToken);

          c.set("user", { username, password });
          await next();
        } else {
          return c.json({ message: "유효하지 않은 토큰입니다." }, 401);
        }
      } catch (refreshError) {
        return c.json({ message: "유효하지 않은 토큰입니다." }, 401);
      }
    } else {
      return c.json({ message: "유효하지 않은 토큰입니다." }, 401);
    }
  }
};
