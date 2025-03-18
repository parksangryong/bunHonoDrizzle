import { db } from "../db";
import { departments, deptEmp } from "../db/schema/schema";

type ListParams = {
  offset?: number;
  count?: number;
};

export const getDepartments = async ({
  offset = 0,
  count = 10,
}: ListParams) => {
  const departmentList = await db
    .select()
    .from(departments)
    .limit(count)
    .offset(offset);
  return departmentList;
};

export const getDeptEmp = async ({ offset = 0, count = 10 }: ListParams) => {
  const deptEmpList = await db
    .select()
    .from(deptEmp)
    .limit(count)
    .offset(offset);
  return deptEmpList;
};
