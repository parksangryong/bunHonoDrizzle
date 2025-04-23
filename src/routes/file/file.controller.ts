import { Hono } from "hono";
import { uploadFile, downloadFile } from "./file.service";
import { zValidator } from "@hono/zod-validator";
import { fileUploadSchema, fileDownloadSchema } from "./file.schema";
import { ZodError } from "zod";

const app = new Hono();

app.post(
  "/upload",
  zValidator("form", fileUploadSchema, (result) => {
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
  }),
  uploadFile
);
app.get(
  "/download/:id",
  zValidator("param", fileDownloadSchema, (result) => {
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
  }),
  downloadFile
);

export default app;
