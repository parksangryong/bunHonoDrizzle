import { z } from "zod";

// 요청 스키마
export const createUserSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  age: z.number().min(1, "나이는 1세 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 형식이어야 합니다"),
  password: z.string().min(3, "비밀번호는 최소 3자 이상이어야 합니다"),
});

// 응답 스키마
export const userResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
        email: z.string(),
        password: z.string(),
      })
    )
    .optional(),
});

// 타입 추론
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
