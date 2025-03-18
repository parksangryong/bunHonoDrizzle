import { sign, verify } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";

export const generateTokens = (username: string, password: string) => {
  const accessToken = sign({ username, password }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = sign({ username, password }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
