import { createClient } from "redis";
import { Context, MiddlewareHandler } from "hono";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.error("❌ Redis error:", err));
redis.on("connect", () => console.log("✅ Redis connected"));

// Redis 미들웨어
export const redisMiddleware: MiddlewareHandler = async (c: Context, next) => {
  c.set("redis", redis);
  await next();
};

// Redis 타입 선언
declare module "hono" {
  interface ContextVariableMap {
    redis: ReturnType<typeof createClient>;
  }
}

// Redis 연결 초기화
export const initRedis = async () => {
  await redis.connect();
};
