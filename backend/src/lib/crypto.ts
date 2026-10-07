import crypto from "crypto";
import logger from "./logger";

if (!process.env.MESSAGE_ENCRYPTION_KEY) {
  throw new Error("MESSAGE_ENCRYPTION_KEY environment variable is not set");
}
const KEY = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, "hex");

export function encryptMessage(plaintext: string): {
  encryptedContent: string;
  iv: string;
} {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    encryptedContent: Buffer.concat([encrypted, tag]).toString("hex"),
    iv: iv.toString("hex"),
  };
}

export function decryptMessage(encryptedContent: string, iv: string): string {
  try {
    const ivBuf = Buffer.from(iv, "hex");
    const data = Buffer.from(encryptedContent, "hex");
    const tag = data.subarray(data.length - 16);
    const encrypted = data.subarray(0, data.length - 16);
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, ivBuf);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final("utf8");
  } catch (err) {
    logger.error("decryptMessage failed — possible key rotation or data corruption", { err });
    return "�"; // replacement character sentinel — distinguishable from a genuinely empty message
  }
}
