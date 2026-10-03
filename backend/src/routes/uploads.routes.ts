import express, { Router } from "express";
import { ObjectId } from "mongodb";
import { getUploadsBucket } from "../lib/uploads";
import { requireAdmin } from "../middleware/auth";
import { badRequest, notFound } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Product and category image bytes are stored in MongoDB GridFS. Product
// documents retain only the public URL returned by this route.
router.post(
  "/",
  requireAdmin,
  express.raw({ type: "image/*", limit: "10mb" }),
  asyncHandler(async (req, res) => {
    const contentType = req.header("content-type")?.split(";")[0];
    if (!contentType?.startsWith("image/") || !Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw badRequest("Upload a valid image file.");
    }

    const rawName = req.header("x-file-name") || "image";
    const filename = rawName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 160) || "image";
    const bucket = await getUploadsBucket();
    const stream = bucket.openUploadStream(filename, { metadata: { contentType } });

    await new Promise<void>((resolve, reject) => {
      stream.once("error", reject);
      stream.once("finish", resolve);
      stream.end(req.body);
    });

    res.status(201).json({ url: `${req.protocol}://${req.get("host")}/api/uploads/${stream.id.toString()}` });
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
