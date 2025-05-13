// html 문자열을 문자열로 변환
export const htmlToString = (html: string): string => {
  // HTML 태그 제거
  const text = html.replace(/<[^>]*>/g, "");

  // 특수 문자 디코딩
  const decodedText = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 연속된 공백을 하나로 줄임
  return decodedText.replace(/\s+/g, " ").trim();
};
