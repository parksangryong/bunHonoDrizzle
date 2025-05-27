import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc.js";
import * as timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatFullDate = (date?: string | Date) => {
  return date
    ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
    : dayjs().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
};

export const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatTime = (date: string) => {
  return dayjs(date).format("HH:mm:ss");
};

export const getTodayRange = () => {
  const koreaTime = dayjs().tz("Asia/Seoul");

  const today = koreaTime.startOf("day");
  const tomorrow = koreaTime.endOf("day");
  return {
    start: today.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    end: tomorrow.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
  };
};

export const getDateRange = (date: string) => {
  // 날짜 구분자 제거 (2025-05-21, 2025:05:21, 2025.05.21 등 -> 20250521)
  const cleanDate = date.replace(/[^0-9]/g, "");

  // 8자리 숫자가 아닌 경우 에러
  if (cleanDate.length !== 8) {
    throw new Error(
      "Invalid date format. Expected format: YYYYMMDD, YYMMDD, or YYYY-MM-DD"
    );
  }

  // YYYY-MM-DD 형식으로 변환
  const formattedDate = `${cleanDate.slice(0, 4)}-${cleanDate.slice(
    4,
    6
  )}-${cleanDate.slice(6, 8)}`;

  const startDate = new Date(formattedDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  return {
    gte: startDate,
    lt: endDate,
  };
};
