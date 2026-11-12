import { createHash, randomUUID } from "node:crypto";
import { ApiError } from "../utils/ApiError";

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new ApiError(503, "Cloudinary image storage is not configured.");
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) throw new ApiError(503, "Invalid Cloudinary configuration.");
  return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_FOLDER || "aylamusk" };
}

export function createCloudinaryUpload(publicId: string = randomUUID()) {
  const config = getCloudinaryConfig();
  const params = { folder: config.folder, overwrite: "false", public_id: publicId, timestamp: Math.floor(Date.now() / 1000).toString() };
  const serialized = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  const signature = createHash("sha1").update(serialized + config.apiSecret).digest("hex");
  return { uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, cloudName: config.cloudName, apiKey: config.apiKey, params, signature };
}

export async function uploadToCloudinary(bytes: Buffer, contentType: string, filename: string, publicId?: string) {
  const signed = createCloudinaryUpload(publicId);
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: contentType }), filename);
  form.append("api_key", signed.apiKey);
  form.append("signature", signed.signature);
  for (const [key, value] of Object.entries(signed.params)) form.append(key, value);
  const response = await fetch(signed.uploadUrl, { method: "POST", body: form, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new ApiError(502, `Cloudinary upload failed (HTTP ${response.status}).`);
  const result = await response.json() as { secure_url?: string; resource_type?: string };
  if (!result.secure_url || new URL(result.secure_url).hostname !== "res.cloudinary.com" || result.resource_type !== "image") {
    throw new ApiError(502, "Cloudinary returned an invalid image.");
  }
  return result.secure_url;
}
