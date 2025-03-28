import { Hono } from "hono";

import { uploadFile } from "../controllers/uploads";
import { downloadFile } from "../controllers/download";

const app = new Hono();

app.post("/upload", uploadFile);

app.get("/download/:id", downloadFile);

export default app;
