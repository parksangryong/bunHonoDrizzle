import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler = (app: Hono) => {
  // 전역 에러 처리
  app.onError((err, c) => {
    console.error(`${err}`);

    // HTTP 예외처리
    if (err instanceof HTTPException) {
      return c.json(
        {
          success: false,
          message: err.message,
        },
        err.status
      );
    }

    // 기타 에러 처리
    return c.json(
      {
        success: false,
        message: err.message,
      },
      500
    );
  });

  // 404 에러 처리
  app.notFound((c) => {
    return c.json(
      {
        success: false,
        message: "요청하신 경로를 찾을 수 없습니다.",
      },
      404
    );
  });
};
