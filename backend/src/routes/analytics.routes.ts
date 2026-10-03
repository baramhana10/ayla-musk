import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const visitSchema = z.object({ visitorId: z.string().uuid() });

router.post("/visit", asyncHandler(async (req, res) => {
  const { visitorId } = visitSchema.parse(req.body);
  // Dashboard traffic is never tracked; exclude signed-in admins on the shop too.
  if (req.user?.role === "ADMIN") {
    res.sendStatus(204);
    return;
  }
  const lastSeen = new Date();
  try {
    await prisma.siteVisitor.upsert({
      where: { id: visitorId },
      create: { id: visitorId, lastSeen },
      update: { lastSeen },
    });
  } catch (error) {
    // Two tabs may register the same new browser simultaneously.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    await prisma.siteVisitor.update({ where: { id: visitorId }, data: { lastSeen } });
  }
  res.sendStatus(204);
}));

export default router;
