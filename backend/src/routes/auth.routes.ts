import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE_MS } from "../lib/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { unauthorized } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";

const router = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE_MS,
};

function publicUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// Public self-registration is intentionally not exposed: this storefront has
// no customer account system — only the seeded ADMIN account can sign in,
// through the same /login route below (role-gated by requireAdmin on the
// routes it actually protects).

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw unauthorized("Invalid email or password");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw unauthorized("Invalid email or password");

    const token = signToken({ userId: user.id, role: user.role as "CUSTOMER" | "ADMIN" });
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({ user: publicUser(user) });
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.status(204).send();
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw unauthorized();
    res.json({ user: publicUser(user) });
  })
);

export default router;
