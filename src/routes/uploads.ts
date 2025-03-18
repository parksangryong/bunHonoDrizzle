import { Hono } from "hono";

import { uploadFile } from "../controllers/uploads";

const app = new Hono();

app.post("/", uploadFile);

export default app;
