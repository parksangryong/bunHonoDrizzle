// constants/errors.ts
export const Errors = {
  AUTH: {
    PASSWORD_NOT_MATCH: {
      code: "AUTH-001",
      status: 401,
      message: "비밀번호가 일치하지 않습니다",
    },
    USER_NOT_FOUND: {
      code: "AUTH-002",
      status: 404,
      message: "존재하지 않는 유저입니다",
    },
    USER_EXISTS: {
      code: "AUTH-003",
      status: 409,
      message: "이미 존재하는 유저입니다",
    },
    CREATE_FAILED: {
      code: "AUTH-004",
      status: 500,
      message: "유저 생성에 실패했습니다",
    },
    ADMIN_REQUIRED: {
      code: "AUTH-005",
      status: 403,
      message: "관리자 권한이 필요합니다",
    },
    MENTO_REQUIRED: {
      code: "AUTH-006",
      status: 403,
      message: "멘토 권한이 필요합니다",
    },
    STUDY_REQUIRED: {
      code: "AUTH-007",
      status: 403,
      message: "교육생 권한이 필요합니다",
    },
  },
  USER: {
    USER_NOT_FOUND: {
      code: "USER-001",
      status: 404,
      message: "존재하지 않는 유저입니다",
    },
  },
  JWT: {
    ACCESS_EXPIRED: {
      code: "JWT-002",
      status: 401,
      message: "액세스 토큰이 만료되었습니다",
    },
    REFRESH_EXPIRED: {
      code: "JWT-001",
      status: 401,
      message: "리프레시 토큰이 만료되었습니다",
    },
    TOKEN_REQUIRED: {
      code: "JWT-001",
      status: 401,
      message: "토큰이 필요합니다",
    },
    INVALID_REFRESH_TOKEN: {
      code: "JWT-001",
      status: 401,
      message: "유효하지 않은 리프레시 토큰입니다",
    },
    REFRESH_TOKEN_REQUIRED: {
      code: "JWT-001",
      status: 401,
      message: "리프레시 토큰이 필요합니다",
    },
    INVALID_ACCESS_TOKEN: {
      code: "JWT-001",
      status: 401,
      message: "유효하지 않은 액세스 토큰입니다",
    },
    DB_ERROR: {
      code: "JWT-001",
      status: 401,
      message: "토큰이 저장되지 않았습니다",
    },
  },
  FILE: {
    FILE_NOT_FOUND: {
      code: "FILE-001",
      status: 404,
      message: "파일이 존재하지 않습니다",
    },
    INVALID_USER_ID: {
      code: "FILE-002",
      status: 400,
      message: "유효하지 않은 유저 ID입니다",
    },
    INVALID_IMAGE_TYPE: {
      code: "FILE-003",
      status: 400,
      message: "지원되지 않는 이미지 형식입니다",
    },
    FILE_SIZE_EXCEEDED: {
      code: "FILE-004",
      status: 400,
      message: "파일 크기가 20MB를 초과합니다",
    },
    UPLOAD_FAILED: {
      code: "FILE-005",
      status: 400,
      message: "파일 업로드에 실패했습니다",
    },
  },
  SERVER: {
    INTERNAL_ERROR: {
      code: "SERVER-001",
      status: 500,
      message: "서버 오류가 발생했습니다",
    },
  },
} as const;
