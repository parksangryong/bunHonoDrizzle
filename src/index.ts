import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { serveStatic } from "hono/serve-static";

// db
import { connectionResult } from "./db";

// middleware
import { errorHandler } from "./middleware/error.middleware";
import { authenticateToken } from "./middleware/auth.middleware";
import { rateLimit } from "./middleware/rateLimit.middleware";

//routes
import users from "./routes/user/user.controller";
import auth from "./routes/auth/auth.controller";
import files from "./routes/file/file.controller";

const app = new Hono();

// 미들웨어 설정
app.use("*", cors()); // CORS 활성화
app.use("*", logger()); // morgan과 유사한 로깅
app.use("*", timing()); // response time 측정
app.use("*", rateLimit()); // 요청 제한
app.use(
  "/uploads/*",
  serveStatic({
    root: ".",
    getContent: async (path) => {
      return await Bun.file(path).arrayBuffer();
    },
  })
);

connectionResult();
errorHandler(app);

// 먼저 로그인 라우트를 설정
app.route("/auth", auth);

// 그 다음 인증 미들웨어 적용 (로그인 이외의 모든 라우트에 대해)
app.use("/users/*");
app.use("/files/*");

// 보호된 라우트들
app.route("/users", users);
app.route("/files", files);

const PORT = process.env.PORT || 3000;

export default {
  port: Number(PORT),
  fetch: app.fetch,
};
