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

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB

const ACCESS_TOKEN_EXPIRATION_TIME = 30; // 30분
const REFRESH_TOKEN_EXPIRATION_TIME = 14; // 14일

const UPLOADS_DIR = "uploads";

export {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
  UPLOADS_DIR,
};
