import type { Context, Handler } from "hono";
import * as fs from "fs/promises";
import * as path from "path";

import { db } from "../../db";
import { uploads } from "../../db/schema";
import { eq } from "drizzle-orm";

import { fileDownloadSchema } from "./file.schema";

// constants
import { Errors } from "../../constants/error";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  UPLOADS_DIR,
} from "../../constants/common";

const sharp = require("sharp");

// 파일 다운로드 서비스
export const downloadFile: Handler = async (c: Context) => {
  const { id } = fileDownloadSchema.parse({ id: c.req.param("id") });

  const file = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, Number(id)))
    .then((res) => res[0]);

  if (!file) {
    throw new Error(Errors.FILE.FILE_NOT_FOUND.code);
  }

  try {
    await fs.access(file.fileUrl);
    return c.json({ url: file.fileUrl });
  } catch {
    throw new Error(Errors.FILE.FILE_NOT_FOUND.code);
  }
};

// 파일 업로드 서비스
export const uploadFile: Handler = async (c: Context) => {
  try {
    const body = await c.req.formData();
    const fileData = body.get("file");

    // 파일 유효성 검사
    if (!fileData || !(fileData instanceof File)) {
      throw new Error(Errors.FILE.INVALID_FILE.code);
    }

    const file = fileData as File;
    const userId = body.get("userId");

    if (!userId) {
      throw new Error(Errors.FILE.INVALID_USER_ID.code);
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      throw new Error(Errors.FILE.INVALID_IMAGE_TYPE.code);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(Errors.FILE.FILE_SIZE_EXCEEDED.code);
    }

    // 파일명 보안 처리
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");

    // 파일 저장 디렉토리 생성 (절대 경로 사용)
    const uploadsDir = path.join(process.cwd(), UPLOADS_DIR);
    await fs.mkdir(uploadsDir, { recursive: true });
    const uploadPath = path.join(uploadsDir, sanitizedFileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    // 이미지 처리 및 저장
    if (file.type.startsWith("image/")) {
      const compressedImage = await sharp(buffer)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      await fs.writeFile(uploadPath, compressedImage, { flag: "w" });
    } else {
      await fs.writeFile(uploadPath, buffer, { flag: "w" });
    }

    // DB에 파일 정보 저장
    await db.insert(uploads).values({
      userId: parseInt(userId as string),
      fileUrl: uploadPath,
      fileName: sanitizedFileName,
      fileType: file.type,
      fileSize: file.size,
    });

    return c.json(
      {
        message: "파일 업로드에 성공했습니다.",
        fileName: file.name,
        path: uploadPath,
      },
      201
    );
  } catch (error) {
    throw new Error(Errors.FILE.UPLOAD_FAILED.code);
  }
};
