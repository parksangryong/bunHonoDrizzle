import { Hono } from "hono";
import { connectionResult } from "./db";
import { errorHandler } from "./middleware/error";

//routes
import users from "./routes/users";

const app = new Hono();

connectionResult();
errorHandler(app);

app.route("/users", users);

export default app;
