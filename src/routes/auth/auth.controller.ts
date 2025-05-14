import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

// service
import { register, login, logout, refreshTokens } from "./auth.service";

// schema
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  type LoginRequest,
  type RegisterRequest,
  type RefreshRequest,
} from "./auth.schema";

// 에러 처리
import { Errors } from "../../constants/error";
import { ZodError } from "zod";
import { getAccessToken } from "../../utils/jwt";

const app = new Hono();

app.post(
  "/login",
  zValidator("json", loginSchema.request, (result) => {
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
  }),
  async (c) => {
    const body = await c.req.json<LoginRequest>();
    const tokens = await login(body);

    return c.json(tokens, 201);
  }
);

app.post(
  "/register",
  zValidator("json", registerSchema.request, (result) => {
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
  }),
  async (c) => {
    const body = await c.req.json<RegisterRequest>();
    const tokens = await register(body);

    return c.json(tokens, 201);
  }
);

app.post("/logout", async (c) => {
  const authHeader = c.req.header("Authorization");

  // Bearer 토큰 형식 검증
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error(Errors.JWT.TOKEN_REQUIRED.code);
  }

  // Bearer 제거하고 토큰만 추출
  const accessToken = getAccessToken(authHeader);

  if (!accessToken) {
    throw new Error(Errors.JWT.TOKEN_REQUIRED.code);
  }

  await logout(accessToken);
  return c.json({ message: "로그아웃에 성공했습니다" }, 200);
});

app.post(
  "/refresh",
  zValidator("json", refreshSchema.request, (result) => {
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
  }),
  async (c) => {
    const { refreshToken } = await c.req.json<RefreshRequest>();

    if (!refreshToken) {
      throw new Error(Errors.JWT.REFRESH_TOKEN_REQUIRED.code);
    }

    const tokens = await refreshTokens(refreshToken);
    return c.json(tokens, 201);
  }
);

export default app;
