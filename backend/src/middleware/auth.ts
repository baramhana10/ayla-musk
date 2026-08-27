import { NextFunction, Request, Response } from "express";
import { COOKIE_NAME, verifyToken } from "../lib/jwt";
import { unauthorized, forbidden } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: "CUSTOMER" | "ADMIN" };
    }
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // invalid/expired token — treated as unauthenticated
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== "ADMIN") return next(forbidden("Admin access required"));
  next();
}
