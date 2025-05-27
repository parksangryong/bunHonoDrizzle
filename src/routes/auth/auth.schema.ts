import { z } from "zod";

// 공통 응답 스키마
const tokenResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const errorResponse = z.object({
  code: z.string(),
  message: z.string(),
});

export const loginSchema = {
  request: z.object({
    email: z.string().email("유효한 이메일을 입력해주세요"),
    password: z.string().min(3, "비밀번호는 최소 3자 이상이어야 합니다"),
    deviceId: z.string().min(1, "디바이스 아이디를 입력해주세요"),
    fcmToken: z.string().min(1, "FCM 토큰을 입력해주세요"),
    authCode: z.number().min(1, "인증 코드를 입력해주세요"),
  }),
  response: tokenResponse,
  error: errorResponse,
};

export const registerSchema = {
  request: z.object({
    email: z.string().email("유효한 이메일을 입력해주세요"),
    name: z.string().min(1, "이름을 입력해주세요"),
    age: z.coerce.number().min(1, "나이를 입력해주세요"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    deviceId: z.string().min(1, "디바이스 아이디를 입력해주세요"),
    fcmToken: z.string().min(1, "FCM 토큰을 입력해주세요"),
    authCode: z.number().min(1, "인증 코드를 입력해주세요"),
  }),
  response: tokenResponse,
  error: errorResponse,
};

export const logoutSchema = {
  response: z.object({
    message: z.string(),
  }),
  error: errorResponse,
};

export const refreshSchema = {
  request: z.object({
    refreshToken: z.string(),
  }),
  response: tokenResponse,
  error: errorResponse,
};

export type LoginRequest = z.infer<typeof loginSchema.request>;
export type RegisterRequest = z.infer<typeof registerSchema.request>;
export type RefreshRequest = z.infer<typeof refreshSchema.request>;
export type TokenResponse = z.infer<typeof tokenResponse>;
export type ErrorResponse = z.infer<typeof errorResponse>;
