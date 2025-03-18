import { Hono } from "hono";
import { getUserList, createUser, getUserById } from "../controllers/users";

const app = new Hono();

app.get("/", async (c) => {
  const userList = await getUserList();

  return c.json({
    success: true,
    message: "유저 목록 조회 성공",
    data: userList,
  });
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const user = await getUserById(Number(id));

  return c.json({
    success: true,
    message: "유저 조회 성공",
    data: user,
  });
});

app.post("/", async (c) => {
  const { name, age, email } = await c.req.json();
  await createUser(name, age, email);

  return c.json({
    success: true,
    message: "유저 생성 성공",
  });
});

export default app;
