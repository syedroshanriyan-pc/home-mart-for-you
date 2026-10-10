import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SessionUser, UserRole } from "./types";

export const AUTH_COOKIE_NAME = "fc_token";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is required");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
    },
    getAuthSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyJwtToken(token: string): SessionUser | null {
  const secret = getAuthSecret();
  try {
    const payload = jwt.verify(token, secret) as SessionUser;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the current session user from cookies or Authorization header.
 */
export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // In non-request context or static rendering
    }
  }

  if (!token) return null;
  return verifyJwtToken(token);
}

export function requireRole(user: SessionUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
