import { Context } from "hono";

export const uploadFile = async (c: Context) => {
  try {
    // multipart/form-data 파싱
    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file) {
      return c.json({ message: "파일이 없습니다" }, 400);
    }

    // 파일 정보 로깅
    console.log("파일명:", file.name);
    console.log("파일 타입:", file.type);
    console.log("파일 크기:", file.size);

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // uploads 폴더에 파일 저장
    const uploadPath = `uploads/${file.name}`;
    await Bun.write(uploadPath, buffer);

    return c.json({
      message: "파일 업로드 성공",
      fileName: file.name,
      path: uploadPath,
    });
  } catch (error) {
    console.error("파일 업로드 에러:", error);
    return c.json({ message: "파일 업로드 실패" }, 500);
  }
};
