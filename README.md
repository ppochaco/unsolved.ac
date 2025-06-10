# ![unsolved.ac icon](https://github.com/user-attachments/assets/af18dff7-050d-4986-8b84-b93cba229feb) unsolved.ac

![unsolved.ac detail](https://github.com/user-attachments/assets/6dd3e819-12ba-4334-a913-75c3b31be2f3)
[unsolved.ac →](https://unsolved-ac.com/)
![user filtering description](https://github.com/user-attachments/assets/646789d5-3cd6-45a7-a88f-12a334f1d8c8)

## Running Locally with Docker

### 초기 실행

1. 의존성 설치

```bash
npm install
```

2. PostgreSQL 도커 컨테이너 실행

```bash
docker run --name unsolved-postgres \
  -e POSTGRES_USER=userId \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=unsolved_db \
  -p 5432:5432 \
  -d postgres:15
```

> 포트를 변경하고 싶다면 -p [로컬포트]:5432에서 [로컬포트]를 원하는 포트 번호로 수정

3. `.env` 파일에 DATABASE_URL 추가

```js
// .env
DATABASE_URL=postgres://userId:password@localhost:5432/unsolved_db
```

> 포트를 다르게 지정했다면 5432 부분을 해당 포트 번호로 수정

4. Prisma 마이그레이션 적용

```bash
npx prisma migrate dev --name init
```

5. 시드 데이터 입력

```bash
npx prisma db seed
```

6. 기초 문제 정보 업데이트

```bash
npm run update-tags
```
```bash
npm run update-silver-problems
```
```bash
npm run update-gold-problems
```

7. 개발 서버 실행

```bash
npm run dev
```

### 이후 실행 시

1. PostgreSQL 도커 컨테이너 실행

```bash
docker start unsolved-postgres
```

2. 개발 서버 실행

```bash
npm run dev
```
