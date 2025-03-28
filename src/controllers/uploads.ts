import type { Context } from "hono";
import * as fs from "fs/promises";
import * as path from "path";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import { uploads } from "../db/schema";
import * as sharp from "sharp"; // 이미지 처리를 위한 라이브러리 추가 필요

export const uploadFile = async (c: Context) => {
  try {
    console.log("$$$$ uploadFile");
    // multipart/form-data 파싱
    const body = await c.req.formData();
    const file = body.get("file") as File;
    const userId = body.get("userId") as string;

    // 허용된 이미지 타입 정의
    const ALLOWED_IMAGE_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/jpg",
      "image/heic",
      "image/heif",
      "image/bmp",
      "image/ico",
    ];

    // 파일 존재 여부 상세 체크
    if (!file || !(file instanceof File)) {
      throw new HTTPException(400, {
        message: "파일이 없거나 올바른 형식이 아닙니다",
      });
    }

    // 이미지 타입 검사
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new HTTPException(400, {
        message:
          "지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.",
      });
    }
    // 파일 크기 제한 (예: 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new HTTPException(400, {
        message: "파일 크기가 10MB를 초과합니다",
      });
    }

    // 파일 정보 로깅
    console.log("파일명:", file.name);
    console.log("파일 타입:", file.type);
    console.log("파일 크기:", file.size);

    // 파일명에서 위험한 문자 제거
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // uploads 폴더 생성 (없는 경우)
    const uploadsDir = "uploads";
    await fs.mkdir(uploadsDir, { recursive: true });

    // uploads 폴더에 파일 저장
    const uploadPath = path.join(uploadsDir, sanitizedFileName);

    // 이미지 파일인 경우 압축 처리
    if (file.type.startsWith("image/")) {
      const compressedImage = await sharp(buffer)
        .resize(1200, 1200, {
          // 최대 크기 제한
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 }) // JPEG 포맷으로 변환 및 품질 조정
        .toBuffer();

      await fs.writeFile(uploadPath, compressedImage);
    } else {
      await fs.writeFile(uploadPath, buffer);
    }

    // DB에 저장
    await db.insert(uploads).values({
      userId: parseInt(userId),
      fileUrl: uploadPath,
      fileName: sanitizedFileName,
      fileType: file.type,
      fileSize: file.size,
    });

    return c.json({
      message: "파일 업로드에 성공했습니다.",
      fileName: file.name,
      path: uploadPath,
    });
  } catch (error) {
    console.error("파일 업로드 에러:", error);
    throw new HTTPException(500, {
      message: "파일 업로드에 실패했습니다.",
    });
  }
};
