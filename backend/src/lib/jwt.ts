import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export const COOKIE_NAME = "ayla_token";
export const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
