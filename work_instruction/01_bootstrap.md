# 01. 프로젝트 부트스트랩

## 1. 단계 목적
이 단계의 목적은 **저장소를 실행 가능한 개발 골격 상태**로 만드는 것이다.  
아직 데이터 수집이나 대시보드 구현이 아니라, 이후 단계가 바로 코딩할 수 있는 기반을 만드는 단계다.

## 2. 결과적으로 만들어져야 하는 상태
이 단계가 끝나면 아래가 가능해야 한다.

- `pnpm dev` 로 웹 앱 실행
- `python -m etl.jobs.healthcheck` 또는 동등 명령으로 Python 런타임 확인
- `/api/health` 200 응답
- `.env.example` 기반으로 로컬 환경변수 설정 가능
- lint/typecheck/test 기본 명령이 동작

## 3. 기술 기준
기본 기준은 아래와 같다.

- Frontend: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- Package manager: pnpm
- Python: 3.11 이상
- Test: Vitest + Playwright + pytest
- DB access:
  - web: Postgres client
  - ETL: psycopg 또는 SQLAlchemy
- Formatting/Lint:
  - ESLint
  - TypeScript strict
  - Python lint/format는 ruff 또는 black 계열 중 하나 선택

## 4. 작업 절차

### 4.1 저장소 초기화
- Next.js 프로젝트를 생성하거나 기존 저장소에 App Router 구조를 확정한다.
- `src/` 사용 여부를 결정하고 일관되게 유지한다.
- 루트 기준 alias(`@/`)를 설정한다.

### 4.2 필수 디렉터리 생성
아래 디렉터리를 만든다.

```text
app/
components/
lib/db/
lib/queries/
lib/utils/
lib/schemas/
etl/extract/
etl/transform/
etl/load/
etl/jobs/
etl/tests/
db/migrations/
db/seeds/
db/views/
docs/decisions/
docs/runbooks/
tests/e2e/
tests/api/
data/
```

### 4.3 Next.js 기본 페이지
- 메인 페이지는 임시 상태여도 된다.
- 단, 프로젝트 제목과 준비 중 상태, health 정보 링크 정도는 노출한다.

### 4.4 Health endpoint
다음 엔드포인트를 구현한다.

- `GET /api/health`

반환 필드 예시:
- `status`
- `app`
- `version`
- `time`
- `env`
- `db` (DB 연결 가능 시)
- `gitSha` (가능하면)

### 4.5 환경변수 파일
`.env.example`에 최소 아래 항목을 넣는다.

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `SEOUL_OPEN_DATA_API_KEY`
- `DATA_GO_KR_SERVICE_KEY`
- `APP_BASE_URL`
- `ADMIN_CRON_SECRET`
- `NODE_ENV`

설명 주석도 함께 작성한다.

### 4.6 Python ETL 골격
아래 최소 골격을 만든다.

- `etl/__init__.py`
- `etl/config.py`
- `etl/jobs/healthcheck.py`
- `etl/common/logging.py`
- `etl/common/io.py`

### 4.7 실행 스크립트
`package.json` 또는 Makefile/Taskfile 에 아래 명령을 제공한다.
- `dev`
- `build`
- `start`
- `lint`
- `typecheck`
- `test`
- `test:e2e`
- `db:migrate`
- `db:seed`
- `etl:health`

### 4.8 문서 골격
- `README.md`에 로컬 실행 섹션 생성
- `docs/PLANS.md` 템플릿 작성
- `docs/decisions/ADR-001-architecture.md` 초안 작성

## 5. 이 단계에서 만들 파일 예시
필수는 아니지만 아래 수준으로 맞춘다.

- `app/page.tsx`
- `app/api/health/route.ts`
- `lib/db/client.ts`
- `lib/config.ts`
- `etl/config.py`
- `etl/jobs/healthcheck.py`
- `.env.example`
- `README.md`
- `AGENTS.md`

## 6. 아직 하지 말아야 할 것
이 단계에서는 아래를 하지 않는다.

- 실제 데이터 소스 호출
- OD 스키마 확정
- 대시보드 차트 구현
- 복잡한 DB 스키마 작성
- ETL 본 로직 작성

## 7. 검증 명령
Codex는 아래를 실제로 실행한다.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pytest
pnpm dev
```

가능하면 Playwright 초기화도 한다.

## 8. 완료 조건
아래를 모두 만족해야 한다.

- 웹 앱 실행 성공
- `/api/health` 정상 응답
- Python healthcheck 실행 성공
- 기본 lint/typecheck/test 명령 실행 가능
- README 에 로컬 실행법 존재

## 9. 자주 발생하는 실패와 대응
- **실패:** Node/TS 경로 alias 충돌  
  **대응:** `tsconfig.json` 과 Next alias를 동시에 맞춘다.
- **실패:** Python 패키지 import 오류  
  **대응:** `etl` 을 패키지로 인식시키고 루트 기준 실행 방법을 고정한다.
- **실패:** health endpoint 는 되는데 DB 연결이 불안정  
  **대응:** 이 단계에서는 DB 의존성을 optional 로 두되, 연결 실패 메시지를 구조화해 반환한다.

## 10. 단계 완료 후 Codex가 남겨야 할 보고
- 생성 파일 목록
- 실행한 명령과 결과
- 남은 TODO
- 02 단계로 넘어가기 위한 blocker 유무

## 11. Codex 전용 프롬프트
```text
01_bootstrap.md 기준으로 저장소를 초기화하라.

구체 작업:
1. Next.js + TypeScript + Tailwind 기반 웹 골격을 만든다.
2. Python ETL 패키지 골격과 healthcheck CLI를 만든다.
3. /api/health 엔드포인트를 구현한다.
4. lint/typecheck/test 명령을 package.json 과 Python 환경에 연결한다.
5. README, AGENTS.md, .env.example, docs/PLANS.md, ADR 초안을 만든다.

주의:
- 실제 데이터 수집 로직은 아직 작성하지 않는다.
- DB 연결은 optional health 수준만 허용한다.
- 이후 단계가 쉽게 이어질 수 있도록 디렉터리 구조를 확정한다.

완료 후 출력:
- 변경 파일 목록
- 실행한 명령과 결과
- 다음 단계 진행 가능 여부
```
