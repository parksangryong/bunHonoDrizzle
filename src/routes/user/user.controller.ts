import { Hono } from "hono";
import { createUser, getUsers } from "./user.service";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema } from "./user.schema";

const app = new Hono();

app.get("/", async (c) => {
  const users = await getUsers();
  return c.json({
    success: true,
    message: "유저 조회 성공",
    data: users,
  });
});

app.post("/", zValidator("json", createUserSchema), async (c) => {
  const { name, age, email, password } = c.req.valid("json");
  await createUser(name, age, email, password);

  return c.json({
    success: true,
    message: "유저 생성 성공",
  });
});

export default app;
