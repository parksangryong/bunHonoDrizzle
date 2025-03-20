import { Hono } from "hono";
import { createUser, getUsers } from "../controllers/users";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const userSchema = z.object({
  name: z.string().min(2),
  age: z.number().min(1),
  email: z.string().email(),
});

app.get("/", async (c) => {
  const users = await getUsers();

  return c.json({
    success: true,
    message: "유저 조회 성공",
    data: users,
  });
});

app.post("/", zValidator("json", userSchema), async (c) => {
  const { name, age, email } = c.req.valid("json");
  await createUser(name, age, email);

  return c.json({
    success: true,
    message: "유저 생성 성공",
  });
});

export default app;
