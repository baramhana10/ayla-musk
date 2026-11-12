import { Router } from "express";
import { randomBytes } from "node:crypto";
import rateLimit from "express-rate-limit";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { badRequest } from "../utils/ApiError";

const router = Router();
const submissions = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { error: "Too many submissions. Please try again later." } });
const email = z.string().trim().email().max(254).transform(value => value.toLowerCase());
const contactSchema = z.object({
  name: z.string().trim().min(2).max(150), email,
  subject: z.string().trim().max(200).default(""),
  message: z.string().trim().min(4).max(5000),
});

router.post("/contact", submissions, asyncHandler(async (req, res) => {
  await prisma.contactMessage.create({ data: contactSchema.parse(req.body) });
  res.status(201).json({ received: true });
}));

router.get("/contact", requireAdmin, asyncHandler(async (_req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  res.json({ messages });
}));

router.patch("/contact/:id", requireAdmin, asyncHandler(async (req, res) => {
  const data = z.object({ read: z.boolean() }).parse(req.body);
  const message = await prisma.contactMessage.update({ where: { id: req.params.id as string }, data });
  res.json({ message });
}));

router.post("/newsletter", submissions, asyncHandler(async (req, res) => {
  const body = z.object({ email, consent: z.literal(true) }).parse(req.body);
  const unsubscribeToken = randomBytes(32).toString("hex");
  try {
    await prisma.newsletterSubscriber.create({ data: { email: body.email, unsubscribeToken } });
    res.status(201).json({ received: true, unsubscribeToken });
  } catch (error) {
    // Do not expose existing subscriber tokens or reveal whether an email exists.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    res.status(201).json({ received: true });
  }
}));

router.post("/newsletter/unsubscribe", submissions, asyncHandler(async (req, res) => {
  const { token } = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).parse(req.body);
  const result = await prisma.newsletterSubscriber.updateMany({ where: { unsubscribeToken: token }, data: { active: false } });
  if (result.count !== 1) throw badRequest("This unsubscribe link is invalid.");
  res.json({ unsubscribed: true });
}));

router.get("/newsletter", requireAdmin, asyncHandler(async (_req, res) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    select: { email: true, active: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1000,
  });
  res.json({ subscribers });
}));

router.patch("/newsletter/:email", requireAdmin, asyncHandler(async (req, res) => {
  const subscriberEmail = email.parse(req.params.email);
  const { active } = z.object({ active: z.boolean() }).parse(req.body);
  const subscriber = await prisma.newsletterSubscriber.update({
    where: { email: subscriberEmail }, data: { active }, select: { email: true, active: true, createdAt: true },
  });
  res.json({ subscriber });
}));

export default router;
