import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Errors } from "../constants/error";
import { ZodError } from "zod";

// 먼저 커스텀 에러 클래스를 생성합니다
export class AuthException extends Error {
  constructor(
    public status: number,
    public message: string,
    public code: string
  ) {
    super(message);
    this.name = "AuthException";
  }
}

export const errorHandler = (app: Hono) => {
  // 전역 에러 처리
  app.onError((err, c) => {
    console.error(err);
    // Zod 에러 처리
    if (err instanceof ZodError) {
      return c.json(
        {
          code: "VALIDATION_ERROR",
          message: "유효하지 않은 요청입니다",
          issues: err.issues.map((issue) => issue.message),
        },
        400
      );
    }

    if (err instanceof AuthException) {
      return c.json(
        {
          code: err.code,
          message: err.message,
        },
        err.status as any
      );
    }

    if (err instanceof HTTPException) {
      return c.json(
        {
          code: Errors.SERVER.INTERNAL_ERROR.code,
          message: err.message,
        },
        err.status
      );
    }

    // 일반 Error 처리
    if (err instanceof Error) {
      const errorCode = err.message;
      const error = Object.values(Errors)
        .flatMap((category) => Object.values(category))
        .find((e) => e.code === errorCode);

      if (error) {
        return c.json(
          {
            code: error.code,
            message: error.message,
          },
          400
        );
      }
    }

    return c.json(
      {
        code: Errors.SERVER.INTERNAL_ERROR.code,
        message: Errors.SERVER.INTERNAL_ERROR.message,
      },
      500
    );
  });

  // 404 에러 처리
  app.notFound((c) => {
    return c.json(
      {
        code: "NOT_FOUND",
        message: "요청하신 경로를 찾을 수 없습니다",
      },
      404
    );
  });
};
