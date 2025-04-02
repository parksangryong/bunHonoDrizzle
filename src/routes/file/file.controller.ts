import { Hono } from "hono";
import { uploadFile, downloadFile } from "./file.service";
import { zValidator } from "@hono/zod-validator";
import { fileUploadSchema, fileDownloadSchema } from "./file.schema";

const app = new Hono();

app.post("/upload", zValidator("form", fileUploadSchema), uploadFile);
app.get("/download/:id", zValidator("param", fileDownloadSchema), downloadFile);

export default app;
