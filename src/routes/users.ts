import { Hono } from "hono";
import { createUser } from "../controllers/users";

const app = new Hono();

app.get("/", async (c) => {
  const { name, age, email } = await c.req.json();
  await createUser(name, age, email);

  return c.json({
    success: true,
    message: "유저 생성 성공",
  });
});

export default app;
