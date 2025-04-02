import type { Context, Handler } from "hono";
import * as fs from "fs/promises";
import * as path from "path";

import { db } from "../../db";
import { uploads } from "../../db/schema";
import { eq } from "drizzle-orm";

const sharp = require("sharp");

import { AuthException } from "../../middleware/error.middleware";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  UPLOADS_DIR,
  fileDownloadSchema,
} from "./file.schema";

// 파일 다운로드 서비스
export const downloadFile: Handler = async (c: Context) => {
  const { id } = fileDownloadSchema.parse({ id: c.req.param("id") });

  const file = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, Number(id)))
    .then((res) => res[0]);

  if (!file) {
    throw new AuthException(404, "파일을 찾을 수 없습니다", "FILE-001");
  }

  try {
    await fs.access(file.fileUrl);
    return c.json({ url: file.fileUrl });
  } catch {
    throw new AuthException(404, "파일이 서버에 존재하지 않습니다", "FILE-001");
  }
};

// 파일 업로드 서비스
export const uploadFile: Handler = async (c: Context) => {
  try {
    const body = await c.req.formData();
    const fileData = body.get("file");

    // 파일 유효성 검사
    if (!fileData || !(fileData instanceof File)) {
      throw new AuthException(
        400,
        "파일이 없거나 올바른 형식이 아닙니다",
        "FILE-001"
      );
    }

    const file = fileData as File;
    const userId = body.get("userId");

    if (!userId) {
      throw new AuthException(400, "사용자 ID가 필요합니다", "FILE-001");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      throw new AuthException(
        400,
        "지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.",
        "FILE-001"
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AuthException(400, "파일 크기가 10MB를 초과합니다", "FILE-001");
    }

    // 파일명 보안 처리
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");

    // 파일 저장 디렉토리 생성 (절대 경로 사용)
    const uploadsDir = path.join(process.cwd(), UPLOADS_DIR);
    await fs.mkdir(uploadsDir, { recursive: true });
    const uploadPath = path.join(uploadsDir, sanitizedFileName);

    try {
      // 파일 버퍼 변환
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
      console.error("파일 저장 중 오류:", error);
      throw new AuthException(
        500,
        "파일 저장 중 오류가 발생했습니다.",
        "FILE-002"
      );
    }
  } catch (error) {
    console.error("파일 업로드 중 오류:", error);
    if (error instanceof AuthException) {
      throw error;
    }
    throw new AuthException(500, "파일 업로드에 실패했습니다.", "FILE-001");
  }
};
