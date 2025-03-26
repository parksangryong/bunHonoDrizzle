import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

interface CustomHTTPException extends HTTPException {
  code?: string;
}

export const errorHandler = (app: Hono) => {
  // 전역 에러 처리
  app.onError((err, c) => {
    console.error(`${err}`);

    // HTTP 예외처리
    if (err instanceof HTTPException) {
      const error = err as CustomHTTPException;
      return c.json(
        {
          message: error.message,
          ...(error.code && { code: error.code }),
        },
        error.status
      );
    }

    // 기타 에러 처리
    return c.json(
      {
        message: err.message,
        ...(err instanceof Error && "code" in err && { code: err.code }),
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
