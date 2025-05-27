import * as jwt from "jsonwebtoken";

import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from "../constants/common.js";
import { Errors } from "../constants/error.js";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";

export const generateTokens = (
  name: string,
  userId: number,
  authCode: number
) => {
  const accessToken = jwt.sign(
    { name, userId, authCode },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: `${ACCESS_TOKEN_EXPIRATION_TIME}m`,
    }
  );
  const refreshToken = jwt.sign(
    { name, userId, authCode },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: `${REFRESH_TOKEN_EXPIRATION_TIME}d`,
    }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    const cleanToken = token.replace(/^Bearer\s+/, "");
    return jwt.verify(cleanToken, ACCESS_TOKEN_SECRET);
  } catch (error: any) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const cleanToken = token.replace(/^Bearer\s+/, "");
    return jwt.verify(cleanToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

export const getAccessToken = (token: string) => {
  // Bearer 제거하고 토큰만 추출
  const accessToken = token.substring(7).trim();
  return accessToken;
};

// jwt 토큰에서 userId만 추출
export const getUserIdFromToken = (token: string | undefined) => {
  if (!token) {
    throw new Error(Errors.JWT.TOKEN_REQUIRED.code);
  }

  const cleanToken = getAccessToken(token);
  const decoded = jwt.decode(cleanToken) as { userId: number };
  return decoded.userId;
};
