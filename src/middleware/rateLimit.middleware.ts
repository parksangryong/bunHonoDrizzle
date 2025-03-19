import type { Context, Next } from "hono";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// 기본 설정
const WINDOW_SIZE_IN_SECONDS = 60; // 시간 윈도우 (1분)
const MAX_REQUESTS = 100; // 최대 요청 수

// 메모리 누수 방지를 위한 정리 함수 추가
const cleanupStore = () => {
  const now = Date.now();
  for (const ip in store) {
    if (now > store[ip].resetTime) {
      delete store[ip];
    }
  }
};

export const rateLimit = (options?: {
  windowSize?: number;
  maxRequests?: number;
}) => {
  // 설정 커스터마이징 가능하도록 수정
  const windowSize = options?.windowSize || WINDOW_SIZE_IN_SECONDS;
  const maxRequests = options?.maxRequests || MAX_REQUESTS;

  // 주기적으로 만료된 데이터 정리
  setInterval(cleanupStore, windowSize * 1000);

  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const now = Date.now();

    // store에서 현재 IP의 요청 정보 가져오기
    if (!store[ip]) {
      store[ip] = {
        count: 0,
        resetTime: now + windowSize * 1000,
      };
    }

    // 시간 윈도우가 지났다면 초기화
    if (now > store[ip].resetTime) {
      store[ip] = {
        count: 0,
        resetTime: now + windowSize * 1000,
      };
    }

    // 요청 수 증가
    store[ip].count++;

    // 헤더에 제한 정보 추가
    c.header("X-RateLimit-Limit", maxRequests.toString());
    c.header(
      "X-RateLimit-Remaining",
      (maxRequests - store[ip].count).toString()
    );
    c.header("X-RateLimit-Reset", store[ip].resetTime.toString());

    // 제한 초과 체크
    if (store[ip].count > maxRequests) {
      return c.json(
        {
          message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        429
      );
    }

    await next();
  };
};
