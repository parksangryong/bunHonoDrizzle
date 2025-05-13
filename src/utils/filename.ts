import * as crypto from "crypto";
import * as crc from "crc";
import * as path from "path";
function unsignedCrc32(str: string) {
  const signed = crc.crc32(str);
  return (signed >>> 0).toString();
}

export function generateStoredFileName(originalFilename: string): string {
  const ext = path.extname(originalFilename); // .jpeg
  const crc32 = unsignedCrc32(originalFilename);
  const rand = crypto
    .randomBytes(6)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 8);
  const sha1 = crypto.createHash("sha1").update(originalFilename).digest("hex");

  return `${crc32}_${rand}_${sha1}${ext}`;
}
