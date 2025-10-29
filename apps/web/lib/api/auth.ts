import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export function signJwt(payload: { sub: string; username: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function bearerToPayload(
  authorization?: string | null
): JwtPayload | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer") return null;
  return verifyJwt(token);
}
