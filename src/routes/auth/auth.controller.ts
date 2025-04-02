import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { register, login, logout, refreshTokens } from "./auth.service";
import { HTTPException } from "hono/http-exception";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  type LoginRequest,
  type RegisterRequest,
  type RefreshRequest,
} from "./auth.schema";
import { AuthException } from "../../middleware/error.middleware";

const app = new Hono();

app.post("/login", zValidator("json", loginSchema.request), async (c) => {
  const body = await c.req.json<LoginRequest>();
  const tokens = await login(body);

  return c.json(tokens, 201);
});

app.post("/register", zValidator("json", registerSchema.request), async (c) => {
  const body = await c.req.json<RegisterRequest>();
  const tokens = await register(body);

  return c.json(tokens, 201);
});

app.post("/logout", async (c) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    throw new HTTPException(401, {
      message: "토큰이 존재하지 않습니다",
    });
  }

  await logout(accessToken);
  return c.json({ message: "로그아웃에 성공했습니다" }, 200);
});

app.post("/refresh", zValidator("json", refreshSchema.request), async (c) => {
  const { refreshToken } = await c.req.json<RefreshRequest>();

  if (!refreshToken) {
    throw new AuthException(401, "리프레시 토큰이 필요합니다", "JWT-002");
  }

  const tokens = await refreshTokens(refreshToken);
  return c.json(tokens, 201);
});

export default app;
