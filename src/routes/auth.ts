import { Hono } from "hono";
import { generateTokens } from "../utils/jwt";

const app = new Hono();

app.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  const tokens = generateTokens(username, password);

  return c.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});
export default app;
