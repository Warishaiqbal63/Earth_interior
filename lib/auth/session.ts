import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ei_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export type SessionPayload = { uid: number; email: string };

function key(): Uint8Array {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function signSession(p: SessionPayload, maxAgeSec: number = SESSION_MAX_AGE): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ uid: p.uid, email: p.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAgeSec)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "number" || typeof payload.email !== "string") return null;
    return { uid: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}
