import { z } from "zod";

// 스키마 정의
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  userId: z.string(),
});

export const fileDownloadSchema = z.object({
  id: z.string(),
});

// 응답 타입 정의
export const fileUploadResponseSchema = z.object({
  message: z.string(),
  fileName: z.string(),
  path: z.string(),
});

export const fileDownloadResponseSchema = z.object({
  url: z.string(),
});

// 타입 추론
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
export type FileDownloadResponse = z.infer<typeof fileDownloadResponseSchema>;
