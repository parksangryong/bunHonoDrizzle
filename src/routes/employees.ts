import { Hono } from "hono";
import { getDepartments, getDeptEmp } from "../controllers/employees";

const app = new Hono();

app.get("/departments", async (c) => {
  const query = c.req.query();
  const departments = await getDepartments({
    offset: Number(query.offset),
    count: Number(query.count),
  });
  return c.json({
    success: true,
    message: "부서 목록 조회 성공",
    meta: {
      offset: Number(query.offset),
      count: Number(query.count),
    },
    data: departments,
  });
});

app.get("/deptEmp", async (c) => {
  const query = c.req.query();

  const deptEmp = await getDeptEmp({
    offset: Number(query.offset),
    count: Number(query.count),
  });
  return c.json({
    success: true,
    message: "부서 사원 목록 조회 성공",
    meta: {
      offset: Number(query.offset),
      count: Number(query.count),
    },
    data: deptEmp,
  });
});

export default app;
