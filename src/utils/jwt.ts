import { sign, verify } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";

export const generateTokens = (name: string, userId: number) => {
  const accessToken = sign({ name, userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
  const refreshToken = sign({ name, userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "14d",
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    const cleanToken = token.replace(/^Bearer\s+/, "");
    return verify(cleanToken, ACCESS_TOKEN_SECRET);
  } catch (error: any) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const cleanToken = token.replace(/^Bearer\s+/, "");
    return verify(cleanToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

export const getAccessToken = (token: string) => {
  // Bearer 제거하고 토큰만 추출
  const accessToken = token.substring(7).trim();
  return accessToken;
};
