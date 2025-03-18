import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";

// db
import { connectionResult } from "./db";

// middleware
import { errorHandler } from "./middleware/error.middleware";
import { authenticateToken } from "./middleware/auth.middleware";

//routes
import users from "./routes/users";
import employees from "./routes/employees";
import auth from "./routes/auth";
import uploads from "./routes/uploads";
const app = new Hono();

// 미들웨어 설정
app.use("*", cors()); // CORS 활성화
app.use("*", logger()); // morgan과 유사한 로깅
app.use("*", timing()); // response time 측정

connectionResult();
errorHandler(app);

// 먼저 로그인 라우트를 설정
app.route("/auth", auth);

// 그 다음 인증 미들웨어 적용 (로그인 이외의 모든 라우트에 대해)
app.use("/users/*", authenticateToken);
app.use("/employees/*", authenticateToken);
app.use("/uploads/*", authenticateToken);

// 보호된 라우트들
app.route("/users", users);
app.route("/employees", employees);
app.route("/uploads", uploads);

export default app;
