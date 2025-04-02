import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// 먼저 커스텀 에러 클래스를 생성합니다
export class AuthException extends HTTPException {
  constructor(status: number, message: string, code: string) {
    super(status as any, { message });
    this.code = code;
  }
  code: string;
}

export const errorHandler = (app: Hono) => {
  // 전역 에러 처리
  app.onError((err, c) => {
    console.error(`${err}`);

    if (err instanceof AuthException) {
      return c.json(
        {
          code: err.code,
          message: err.message,
        },
        err.status
      );
    }
    if (err instanceof HTTPException) {
      return c.json(
        {
          code: "AUTH-001",
          message: err.message,
        },
        err.status
      );
    }
    return c.json(
      {
        code: "SERVER-001",
        message: "서버 에러가 발생했습니다",
      },
      500
    );
  });

  // 404 에러 처리
  app.notFound((c) => {
    return c.json(
      {
        message: "요청하신 경로를 찾을 수 없습니다.",
      },
      404
    );
  });
};
