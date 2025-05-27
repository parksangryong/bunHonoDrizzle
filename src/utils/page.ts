import { Errors } from "../constants/error";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../constants/common";

// 페이지네이션 파라미터 계산
export const getPaginationParams = (query: {
  page?: number;
  limit?: number;
}) => {
  if (query.page !== undefined && query.page <= 0) {
    throw new Error(Errors.PAGINATION.INVALID_PAGE.code);
  }

  if (query.limit !== undefined && query.limit <= 0) {
    throw new Error(Errors.PAGINATION.INVALID_LIMIT.code);
  }

  const page = query?.page || DEFAULT_PAGE;
  const limit = query?.limit || DEFAULT_LIMIT;

  return {
    skip: (page - 1) * limit, // 0-based skip 계산
    take: limit,
    page, // 1-based page
    limit,
  };
};
