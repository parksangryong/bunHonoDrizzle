import { Hono } from "hono";
import { connectionResult } from "./db";
import { errorHandler } from "./middleware/error";

//routes
import users from "./routes/users";
import employees from "./routes/employees";
import auth from "./routes/auth";

import { authenticateToken } from "./middleware/auth.middleware";

const app = new Hono();

connectionResult();
errorHandler(app);

// 먼저 로그인 라우트를 설정
app.route("/auth", auth);

// 그 다음 인증 미들웨어 적용 (로그인 이외의 모든 라우트에 대해)
app.use("/users/*", authenticateToken);
app.use("/employees/*", authenticateToken);

// 보호된 라우트들
app.route("/users", users);
app.route("/employees", employees);

export default app;
