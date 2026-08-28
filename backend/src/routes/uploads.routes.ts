import { Router } from "express";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";

const router = Router();

// All product / category images live on Cloudinary — the browser uploads the
// file straight to Cloudinary's API, so the bytes never touch this server or
// its disk. This endpoint only mints a short-lived upload signature using the
// account's API secret, which stays here and is never sent to the client.
//
// Cloudinary signature algorithm (see cloudinary.com/documentation/signatures):
//   sha1( "<k1=v1&k2=v2&...sorted>" + api_secret )  — hex digest
// Only the params actually sent with the upload (minus file / api_key /
// resource_type / cloud_name) are signed. We fix `folder` so every asset lands
// in one place and the client can't scatter uploads across the account.
const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || "aylamusk";

router.post(
  "/signature",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ApiError(503, "Image uploads are not configured on the server.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string | number> = {
      folder: UPLOAD_FOLDER,
      timestamp,
    };

    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");

    res.json({ cloudName, apiKey, timestamp, signature, folder: UPLOAD_FOLDER });
  })
);

export default router;
