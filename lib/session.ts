import "server-only";
import { SignJWT, jwtVerify } from "jose";

// Pure JWT encrypt/decrypt helpers — no `next/headers` here so this file can
// also be imported from proxy.ts (which reads cookies off the request directly).

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    if (typeof payload.userId !== "string") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
