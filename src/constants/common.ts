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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UPLOADS_DIR = "uploads";

export { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, UPLOADS_DIR };
