import express, { Router } from "express";
import { ObjectId } from "mongodb";
import { getUploadsBucket } from "../lib/uploads";
import { requireAdmin } from "../middleware/auth";
import { badRequest, notFound } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { createCloudinaryUpload, uploadToCloudinary } from "../lib/cloudinary";

const router = Router();

// New images are stored in Cloudinary. The old GridFS GET route remains
// available for historical order images and links during migration.
router.post("/signature", requireAdmin, asyncHandler(async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(createCloudinaryUpload());
}));
router.post(
  "/",
  requireAdmin,
  express.raw({ type: "image/*", limit: "10mb" }),
  asyncHandler(async (req, res) => {
    const contentType = req.header("content-type")?.split(";")[0];
    if (!contentType?.startsWith("image/") || !Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw badRequest("Upload a valid image file.");
    }

    let rawName: string;
    try { rawName = decodeURIComponent(req.header("x-file-name") || "image"); }
    catch { throw badRequest("Invalid image filename."); }
    const filename = rawName.normalize("NFC").replace(/[/\\\x00-\x1f\x7f]/g, "-").slice(0, 160) || "image";
    const url = await uploadToCloudinary(req.body, contentType, filename);
    res.status(201).json({ url });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const idParam = req.params.id;
    if (typeof idParam !== "string" || !ObjectId.isValid(idParam)) throw notFound("Image");

    const id = new ObjectId(idParam);
    const bucket = await getUploadsBucket();
    const file = await bucket.find({ _id: id }).next();
    if (!file) throw notFound("Image");

    const contentType = typeof file.metadata?.contentType === "string" ? file.metadata.contentType : "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    bucket.openDownloadStream(id).once("error", next).pipe(res);
  })
);

export default router;
