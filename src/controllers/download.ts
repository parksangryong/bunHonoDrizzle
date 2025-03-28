import { Context } from "hono";
import { db } from "../db";
import { uploads } from "../db/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";

export const downloadFile = async (c: Context) => {
  const id = c.req.param("id");
  const file = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, Number(id)))
    .then((res) => res[0]);

  if (!file) {
    return c.json({ error: "파일을 찾을 수 없습니다" }, 404);
  }

  // 파일 시스템에서 파일 존재 확인
  const filePath = file.fileUrl;
  if (!fs.existsSync(filePath)) {
    return c.json({ error: "파일이 서버에 존재하지 않습니다" }, 404);
  }

  return c.json({ url: file.fileUrl });
};
