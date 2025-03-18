import { Context } from "hono";

export const uploadFile = async (c: Context) => {
  try {
    // multipart/form-data 파싱
    const body = await c.req.formData();
    console.log(body);
    const file = body.get("file") as File;

    console.log(body);

    // 파일 존재 여부 상세 체크
    if (!file || !(file instanceof File)) {
      return c.json(
        {
          message: "파일이 없거나 올바른 형식이 아닙니다",
          received: body.has("file") ? typeof file : "no file field",
        },
        400
      );
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
    return c.json(
      {
        message: "파일 업로드 실패",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};
