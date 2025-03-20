To install dependencies:

DB 생성 후 스키마 생성:

```sh
bunx drizzle-kit push
```

DB에 데이터 가져와서 스키마 생성:

```sh
bunx drizzle-kit introspect
```

To install:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

### script 설명

```sh # 개발 모드 실행
bun run dev // 개발 모드 실행
```

```sh # 빌드 실행
bun run build // 빌드 실행
```

```sh # pm2 실행
bun run start // pm2 실행
```

```sh # pm2 중지
bun run stop // pm2 중지
```

```sh # 서버 배포
bun run deploy // 서버 배포
```

```sh # 스키마 생성
bun run db:generate // 스키마 생성
```

```sh # 스키마 저장
bun run db:push // 스키마 저장
```

```sh # 스키마 확인
bun run db:studio // 스키마 확인
```
