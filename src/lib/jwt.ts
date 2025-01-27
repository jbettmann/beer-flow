import { SignJWT } from "jose";

export async function signJwtAccessToken(payload: any, secret: string) {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("23h")
    .sign(secretKey);

  return token;
}

export async function signJwtRefreshToken(payload: any, secret: string) {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);

  return token;
}
