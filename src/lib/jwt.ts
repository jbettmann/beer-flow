import jwt, { JwtPayload } from "jsonwebtoken";

interface SignOption {
  expiresIn?: string | number;
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: "23h",
};

export function signJwtAccessToken(
  payload: JwtPayload,
  options: SignOption = DEFAULT_SIGN_OPTION
) {
  const secret_key = process.env.NEXTAUTH_SECRET;
  // Incorporating a unique value in the payload
  payload.iat = Math.floor(Date.now() / 1000); // `iat` stands for "Issued At"
  const token = jwt.sign(payload, secret_key!, options); // signs with payload, secret_key and options (expiration time).

  return token;
}

export function signJwtRefreshToken(
  payload: JwtPayload,
  options: SignOption = { expiresIn: "30d" }
) {
  const secret_key = process.env.REFRESH_TOKEN_SECRET;
  const token = jwt.sign(payload, secret_key!, options);
  return token;
}
