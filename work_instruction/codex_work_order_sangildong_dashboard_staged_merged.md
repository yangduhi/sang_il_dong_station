---

# FILE: README.md

# Codex 작업지시서 패키지 — 상일동역 유동/OD 대시보드

이 패키지는 **상일동역(5호선) 중심의 유동/OD 분석 대시보드**를 Codex가 단계별로 구현하도록 지시하기 위한 작업지시서 묶음이다.  
한 번에 전체를 구현시키지 말고, **단계별 문서를 순서대로 투입**하는 것을 전제로 작성했다.

## 목표
최종 결과물은 아래 네 묶음이다.

1. **데이터 수집/정제/적재 파이프라인**
   - 상일동역의 일별/시간대별 승하차
   - 상일동역 출발/도착 OD
   - 서울/경기 권역 집계
2. **정규화된 DB 스키마**
   - 역 메타데이터, 권역, 승하차, OD, ETL 실행 로그
3. **웹 대시보드**
   - Next.js + TypeScript
   - 한국어 UI
   - 상일동역 기준 KPI/추세/OD 시각화
4. **배포 및 운영 문서**
   - Vercel 배포
   - 스케줄 자동화
   - 장애 대응 및 롤백 문서

## 사용 방법
Codex에게 아래 순서로 단계별 문서를 투입한다.

1. `00_global-rules.md`
2. `01_bootstrap.md`
3. `02_data-source-validation.md`
4. `03_zone-design-and-station-metadata.md`
5. `04_database-schema.md`
6. `05_extract.md`
7. `06_transform.md`
8. `07_load.md`
9. `08_api.md`
10. `09_dashboard-ui.md`
11. `10_testing-qa.md`
12. `11_deploy-vercel.md`
13. `12_scheduler-ops.md`
14. `13_acceptance-and-handover.md`

마지막에 `99_master-prompt.md`를 사용하면 전체 프로젝트를 다시 정리하거나 새 저장소에서 일괄 착수시키기 쉽다.

## 실행 원칙
- **각 단계는 독립 완료 기준**을 가진다.
- 이전 단계가 완료되지 않으면 다음 단계로 넘어가지 않는다.
- 데이터 검증 단계에서 **OD 단위가 역 단위가 아니면**, 이후 단계의 데이터 모델과 UI에 그 제한을 반드시 노출한다.
- 배포 성공 여부를 **추정으로 쓰지 않는다**. 실제 URL을 확인했을 때만 성공으로 기록한다.
- 비밀값은 절대 커밋하지 않는다.

## 패키지 구성
- `00_global-rules.md`: 공통 원칙, 산출물, 금지사항, 운영 기준
- `01_bootstrap.md`: 프로젝트 초기화
- `02_data-source-validation.md`: 데이터 소스 검증 게이트
- `03_zone-design-and-station-metadata.md`: 권역 설계와 역 메타데이터 정규화
- `04_database-schema.md`: DB 모델, 마이그레이션, 뷰, 인덱스
- `05_extract.md`: Extract 계층
- `06_transform.md`: Transform 계층
- `07_load.md`: Load 계층
- `08_api.md`: API/쿼리 계층
- `09_dashboard-ui.md`: 웹 UI
- `10_testing-qa.md`: 테스트/QA
- `11_deploy-vercel.md`: Vercel 배포
- `12_scheduler-ops.md`: 스케줄링/운영 자동화
- `13_acceptance-and-handover.md`: 최종 인수인계
- `99_master-prompt.md`: 전체 프로젝트용 마스터 프롬프트
- `AGENTS.template.md`: 루트 `AGENTS.md` 템플릿
- `stage_manifest.yaml`: 단계 의존관계/산출물 요약

## Codex 운용 방식 권장안
각 단계마다 Codex에게 아래 패턴으로 지시한다.

1. 해당 단계 문서를 먼저 읽게 한다.
2. 변경할 파일 목록을 먼저 계획하게 한다.
3. 구현 후 실행한 검증 명령과 결과를 문서에 남기게 한다.
4. 완료 기준을 충족했을 때만 다음 단계로 이동한다.

## Hard Gate
다음 두 단계는 절대 건너뛰지 않는다.

### Gate A — 데이터 소스 검증
`02_data-source-validation.md`에서 아래가 확인되기 전까지 ETL/대시보드 본 구현을 진행하지 않는다.
- 상일동역 식별자
- OD 데이터의 실제 grain
- 호출 방식 및 인증
- 응답 스키마
- 날짜 범위와 갱신 주기

### Gate B — 권역/역 메타데이터 정규화
`03_zone-design-and-station-metadata.md`와 `04_database-schema.md`가 끝나기 전까지 fact 적재를 시작하지 않는다.
- 권역 고정안
- 역명 alias
- dim_station / dim_zone 설계
- quarantine 정책

## 최종 상태 정의
아래가 충족되면 프로젝트 완료로 본다.

- 로컬 개발 환경에서 전체 스택 기동 가능
- 샘플 ETL 적재 성공
- 상일동역 대시보드 화면 렌더링
- `/api/health` 정상 응답
- 문서, 테스트, 마이그레이션, 환경변수 예시 정리 완료
- Vercel 배포 준비 또는 실제 배포 완료
- 자동화 스케줄 전략 문서화 완료


---

# FILE: 00_global-rules.md

# 00. 공통 작업 규칙 및 전체 범위

## 1. 이 단계의 목적
이 문서는 전체 프로젝트에서 Codex가 따라야 하는 **최상위 운영 규칙**을 정의한다.  
이 파일을 먼저 읽지 않은 상태에서 코드를 작성하면, 데이터 모델과 배포 방식이 흔들릴 가능성이 크다.

## 2. 프로젝트 범위
구축 대상은 **상일동역 중심의 지하철 유동/OD 분석 대시보드**다.  
핵심 질문은 아래 두 가지다.

1. **상일동역에서 출발한 승객은 어느 권역에서 하차하는가**
2. **상일동역에서 하차한 승객은 어느 권역에서 승차했는가**

보조 지표는 아래를 포함한다.

- 상일동역의 일별 승차/하차 추세
- 시간대별 승차/하차 패턴
- 평일/주말 비교
- 승객유형 비교(데이터가 실제로 존재할 경우)
- 데이터 최신성, source, grain, 제한사항 노출

## 3. 이번 프로젝트에서 반드시 지켜야 할 설계 원칙

### 3.1 데이터 우선 원칙
OD는 가장 중요한 지표이지만, **실제 공개 데이터 grain이 역 단위인지 확인되기 전까지 역 단위 분석을 사실로 가정하지 않는다**.  
Codex는 반드시 먼저 샘플 호출을 수행하고, 응답 스키마를 저장한 뒤, 그 결과를 문서화해야 한다.

### 3.2 분리 원칙
프런트엔드, API, DB, ETL은 논리적으로 분리한다.

- Web: Next.js
- Read API: Next.js Route Handlers
- ETL: Python CLI/Job
- Storage: Postgres
- Deployment: Vercel
- Scheduler: GitHub Actions 기본, 필요 시 Vercel Cron 보조

### 3.3 재현 가능성 원칙
모든 작업은 로컬에서 재현 가능해야 한다.
- `README.md` 기준으로 신규 개발자가 실행 가능해야 한다.
- raw 샘플, processed 샘플, seed 데이터는 경로 규칙을 가져야 한다.
- 마이그레이션은 빈 DB에서 순서대로 적용 가능해야 한다.

### 3.4 운영 안정성 원칙
ETL은 반드시 idempotent 해야 한다.
- 같은 날짜를 재실행해도 중복 적재되지 않아야 한다.
- 적재 성공/실패 로그가 남아야 한다.
- 실패 시 partial load 로 끝나지 않아야 한다.

## 4. 절대 금지사항
아래는 예외 없이 금지한다.

- 비밀값 하드코딩
- 프로덕션 성공 여부를 검증 없이 문서에 성공으로 기재
- 데이터 grain 불확실성을 숨긴 채 UI에서 확정적 문구 사용
- 역명 매핑 실패 레코드를 조용히 버림
- 마이그레이션 없는 스키마 변경
- 테스트와 문서 없이 기능만 추가
- 대용량 ETL을 Vercel 서버리스 요청 경로 안에서 직접 수행

## 5. 기본 산출물 목록
Codex는 아래 산출물을 생성해야 한다.

### 코드
- Next.js 앱
- Python ETL 패키지
- DB migration 및 seed
- API route handlers
- 테스트 코드

### 문서
- `README.md`
- `docs/data-source-validation.md`
- `docs/data-dictionary.md`
- `docs/transformation-rules.md`
- `docs/known-limitations.md`
- `docs/runbooks/deploy.md`
- `docs/runbooks/etl.md`
- `docs/runbooks/rollback.md`
- `docs/runbooks/data-quality.md`

### 운영 메타
- `AGENTS.md`
- `.env.example`
- `vercel.json`
- `.github/workflows/*.yml`

## 6. 권장 저장소 구조
아래 구조를 기준으로 시작한다.

```text
project-root/
  app/
  components/
  lib/
  etl/
  db/
  docs/
  public/
  scripts/
  tests/
  data/
  .github/workflows/
  AGENTS.md
  README.md
  vercel.json
```

## 7. 개발 규칙

### 7.1 브랜치/커밋 단위
가능하면 단계별로 커밋을 나눈다.
- chore/bootstrap
- docs/data-validation
- feat/db-schema
- feat/etl-extract
- feat/etl-transform
- feat/etl-load
- feat/api
- feat/dashboard
- test/qa
- chore/deploy

### 7.2 파일 생성 규칙
새 파일을 만들 때는 목적이 드러나게 이름을 짓는다.
예:
- `etl/extract/seoul_daily_ridership.py`
- `etl/transform/normalize_station_names.py`
- `db/views/vw_sangildong_origin_to_zone.sql`

### 7.3 환경변수 규칙
민감 정보는 `.env.local`, `.env.production` 같은 실행 환경에만 둔다.  
저장소에는 `.env.example`만 포함한다.

### 7.4 로그 규칙
ETL은 표준 출력만이 아니라 **구조화된 job log**를 남겨야 한다.
최소 필드:
- job_name
- started_at
- ended_at
- status
- source_name
- rows_extracted
- rows_loaded
- checksum
- error_message

## 8. 품질 기준
다음 조건을 만족하지 못하면 해당 단계는 미완료다.

- lint 통과
- typecheck 통과
- 해당 단계 테스트 통과
- 문서 업데이트 반영
- 실행 결과 또는 스크린샷/로그가 남아 있음

## 9. 단계 이동 규칙
Codex는 각 단계가 끝날 때마다 아래 5개를 남긴다.

1. 변경 파일 목록
2. 실행 명령
3. 결과 요약
4. 미해결 이슈
5. 다음 단계 전제조건 충족 여부

## 10. 이번 단계 완료 기준
이 문서의 완료는 아래와 같다.

- 루트 `AGENTS.md` 초안 생성 준비가 되었다.
- 전체 범위, 금지사항, 완료 정의가 문서로 고정되었다.
- 이후 단계 문서가 이 규칙을 상속할 수 있다.

## 11. Codex에 전달할 단계 프롬프트
```text
우선 00_global-rules.md를 기준으로 프로젝트 전체 규칙을 저장소에 반영하라.

작업:
1. 이 문서의 규칙을 바탕으로 루트 AGENTS.md 초안을 작성한다.
2. README 초기 골격을 만든다.
3. .env.example 초안을 만든다.
4. docs/ 디렉터리와 runbooks, decisions 디렉터리 골격을 만든다.
5. 아직 기능 구현은 최소화하고, 이후 단계가 진행될 수 있는 공통 틀만 만든다.

완료 후 반드시 출력:
- 생성/변경 파일 목록
- 아직 비어 있는 문서 목록
- 다음 단계(01_bootstrap) 진행 가능 여부
```


---

# FILE: 01_bootstrap.md

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


---

# FILE: 02_data-source-validation.md

# 02. 데이터 소스 검증 및 샘플 수집

## 1. 단계 목적
이 단계는 프로젝트 전체의 **사실 검증 게이트**다.  
이 단계가 끝나기 전에는 OD 파이프라인과 대시보드 설계를 확정하지 않는다.

핵심 목적은 아래 5가지다.

1. 상일동역 관련 데이터가 실제로 존재하는지 확인
2. 승하차 소스와 OD 소스의 **실제 응답 스키마** 확보
3. OD 데이터의 grain(역/정류장/권역/기타) 판정
4. 날짜 범위, 갱신 주기, 호출 제한, 인증 방식 확인
5. 이후 ETL 단계에서 사용할 **최소 1개 확정 소스** 선정

## 2. 검증 대상 우선순위

### A. 승하차 소스
1. 서울시 지하철호선별 역별 승하차 인원 정보
2. 서울시 지하철 호선별 역별 시간대별 승하차 인원 정보
3. 서울교통공사 역별 일별/시간대별 승하차 파일
4. 서울교통공사 승객유형/환승유입 파일

### B. OD 소스
1. 국토교통부 일반버스·도시철도이용 O/D OpenAPI
2. STCIS O/D 다운로드 가능 여부
3. 기타 역 단위 OD 확보 가능 경로가 있으면 문서에 기록

### C. 역 메타데이터
1. 전국도시철도역사정보표준데이터
2. 서울교통공사 역사 좌표/주소 계열 자료

## 3. 이 단계에서 반드시 만들어야 하는 산출물
- `docs/data-source-validation.md`
- `docs/data-dictionary.md`
- `data/raw_samples/<source>/<date>/...`
- `scripts/inspect_sources/*` 또는 동등 기능 스크립트

## 4. 상세 작업 절차

### 4.1 소스별 샘플 수집 스크립트 작성
각 소스마다 **본 ETL이 아닌 샘플 확인용 스크립트**를 만든다.

예시:
- `scripts/inspect_sources/fetch_seoul_daily_sample.py`
- `scripts/inspect_sources/fetch_seoul_hourly_sample.py`
- `scripts/inspect_sources/fetch_od_sample.py`
- `scripts/inspect_sources/fetch_station_meta_sample.py`

기능:
- API/파일 1회 호출
- raw 응답 저장
- 응답 필드/컬럼명 추출
- row 수와 샘플 레코드 요약 출력

### 4.2 상일동역 식별자 확인
다음 중 최소 2개 이상을 확보한다.
- 역명
- 역코드
- 노선명
- 운영기관
- 위경도/주소

주의:
- `상일동`, `상일동역` 표기 차이
- 5호선/운영기관 표기 차이
- alias 필요 여부 확인

### 4.3 OD grain 판정
OD는 가장 중요하므로 아래를 반드시 문서화한다.

- origin/destination 이 역 단위인지
- station code 가 존재하는지
- bus/rail이 혼합인지
- mode 구분이 가능한지
- 서울/경기 외 지역이 포함되는지
- 일 단위인지, 시간대 단위인지

### 4.4 날짜/호출 제한 파악
각 소스마다 아래를 표로 정리한다.

- 제공 시작/종료 범위
- 업데이트 주기
- row limit
- pagination 방식
- 인증키 필요 여부
- 개발계/운영계 제한
- 오류 응답 포맷

### 4.5 파일 형식/인코딩 검증
실제 필드 처리를 위해 다음을 확인한다.
- CSV, JSON, XML, XLSX 등 형식
- 인코딩(UTF-8, CP949 등)
- 숫자 컬럼에 쉼표 포함 여부
- 날짜 포맷 일관성
- 시간대 컬럼 표현 방식

### 4.6 데이터 사용성 판정
각 소스에 대해 아래 셋 중 하나로 판정한다.

- **Primary**: 본 서비스에 사용 가능
- **Secondary**: 보조/대체 소스로 사용 가능
- **Rejected**: 현재 범위에서는 부적합

판정 이유를 반드시 쓴다.

## 5. 문서 구조 요구사항

### 5.1 `docs/data-source-validation.md`
최소 아래 항목 포함:
- 소스 개요
- 접근 방법
- 인증 방식
- 샘플 호출 결과
- 응답 스키마
- 상일동역 식별 가능 여부
- 장점/한계
- 채택 여부
- 후속 조치

### 5.2 `docs/data-dictionary.md`
필드 수준으로 작성:
- source name
- field name
- inferred type
- semantic meaning
- nullable 여부
- transform rule 초안
- target table/column 후보

## 6. Hard Decision Rules
이 단계에서 아래 의사결정을 해야 한다.

### 규칙 A — 승하차 소스 선택
최소 아래 두 계층을 확정한다.
- 일별 추세용 source
- 시간대 분석용 source

### 규칙 B — OD grain 분기
- 역 단위 OD 가능: `fact_od_daily` 를 station-to-station 중심으로 설계
- 역 단위 불가: `fact_od_daily` 를 mixed grain 으로 설계하고 `grain_label` 을 필수로 넣음

### 규칙 C — 상일동역 존재 확인 실패 시
상일동역 자체가 찾히지 않으면 즉시 원인 분석:
- 역명 normalization 이슈
- 코드 표기 이슈
- 소스 자체 coverage 이슈

원인과 대응을 문서화하기 전에는 다음 단계로 가지 않는다.

## 7. 출력 파일 저장 규칙
샘플은 반드시 경로 규칙을 가진다.

```text
data/raw_samples/
  seoul_daily_ridership/2026-03-31/response.json
  seoul_hourly_ridership/2026-03-31/response.json
  molit_od/2026-03-31/response.json
  station_meta/2026-03-31/response.csv
```

JSON 이 아닌 경우 원본 포맷 그대로 저장하고, 별도 `schema.json` 요약을 생성해도 된다.

## 8. 아직 하지 말아야 할 것
- full ETL 구현
- DB 적재
- UI 구현
- 최종 권역 집계 쿼리 확정

## 9. 완료 조건
아래가 모두 충족되어야 한다.

- 최소 1개 승하차 소스 파싱 성공
- 최소 1개 OD 소스 샘플 확보
- 상일동역 식별자 확인
- OD grain 판정 완료
- `docs/data-source-validation.md` 작성 완료
- `docs/data-dictionary.md` 작성 완료

## 10. 실패 시 대응
- **OD sample 호출 실패**: 응답/오류 원문 저장 후 재시도 조건 문서화
- **스키마가 불안정**: 최신/과거 샘플 2개 이상 비교
- **API quota 부족**: 샘플 호출 횟수를 줄이고 raw 저장 재사용
- **파일 인코딩 문제**: 변환 전 원본과 변환 후 사본 모두 보관

## 11. 단계 완료 보고 형식
Codex는 아래 형식으로 남긴다.

1. 채택한 승하차 source
2. 채택한 OD source
3. 상일동역 식별자
4. OD grain 판정
5. 차기 단계의 핵심 제약 3개

## 12. Codex 전용 프롬프트
```text
02_data-source-validation.md 기준으로 데이터 소스를 검증하라.

반드시 할 일:
1. 승하차 소스와 OD 소스 샘플을 실제로 최소 1회씩 가져온다.
2. raw 샘플을 data/raw_samples 아래에 저장한다.
3. 상일동역 식별자와 OD grain 을 판정한다.
4. docs/data-source-validation.md 와 docs/data-dictionary.md 를 작성한다.
5. 아직 ETL/DB 본 구현은 하지 않는다.

중요:
- OD가 역 단위가 아닐 수 있다는 점을 숨기지 마라.
- 상일동역 매칭 실패 레코드는 이유를 남겨라.
- 다음 단계가 바로 사용할 수 있도록 source별 장단점을 명시하라.

완료 후 출력:
- 샘플 저장 경로
- 채택 소스
- OD grain 판정
- 다음 단계로 넘어가기 위한 확정 사항
```


---

# FILE: 03_zone-design-and-station-metadata.md

# 03. 권역 설계 및 역 메타데이터 정규화

## 1. 단계 목적
이 단계의 목적은 **역과 권역을 안정적으로 연결하는 기준층(dim layer)** 을 만드는 것이다.  
OD와 승하차 fact 를 적재하기 전에 이 기준층이 먼저 완성되어야 한다.

## 2. 왜 이 단계가 중요한가
상일동역 분석은 단순히 역별 Top N 으로 끝나지 않는다.  
최종 대시보드는 `역 → 권역`, `권역 → 역` 집계를 동시에 보여줘야 한다.  
그러려면 아래가 먼저 고정돼야 한다.

- 서울/경기 분석용 권역 정의
- 역명 alias 규칙
- 운영기관/호선별 disambiguation
- 역 메타데이터의 표준 station_id

## 3. 고정 권역안
이번 프로젝트에서는 아래 **13권역**을 기본 시드로 사용한다.

### 서울 6권역
1. 강동·송파
2. 강남·서초
3. 도심(종로·중구·용산)
4. 동북(성동·광진·동대문·중랑·성북·강북·도봉·노원)
5. 서북(마포·서대문·은평)
6. 서남(강서·양천·영등포·구로·금천·동작·관악)

### 경기 7권역
7. 하남·구리·남양주
8. 성남·광주·이천·여주·양평
9. 용인·수원·화성·오산·평택·안성
10. 안양·군포·의왕·과천·광명·부천
11. 시흥·안산
12. 고양·파주·김포
13. 의정부·양주·동두천·포천·연천·가평

## 4. 이 단계에서 만들어야 하는 핵심 파일
- `db/seeds/zone_mapping.csv`
- `db/seeds/station_aliases.csv` 또는 `.yaml`
- `docs/zone-definition.md`
- `docs/station-normalization.md`
- `scripts/build_station_dimension.py` 또는 동등 기능
- `db/seeds/dim_zone_seed.sql` 또는 동등 로더

## 5. 상세 작업 절차

### 5.1 권역 정의 문서화
`docs/zone-definition.md` 에 아래를 쓴다.
- 각 권역명
- 포함 시군구
- 설계 이유
- 대안과 왜 제외했는지
- 분석상의 한계

### 5.2 zone mapping 시드 작성
형식 예시:

| city_do | sigungu | zone_name | zone_group | sort_order |
|---|---|---|---|---|

추가로 필요하면 `dong` 수준 매핑을 허용하되, 기본은 `sigungu` 수준으로 유지한다.

### 5.3 station alias 설계
역명 표기 흔들림을 처리하기 위한 매핑 파일을 만든다.
필드 예시:
- raw_station_name
- normalized_station_name
- normalized_line_name
- operator_name
- canonical_station_id
- note

규칙 예시:
- 괄호 안 부역명 제거
- `역` 접미어 제거/보존 기준 통일
- 공백/중점/슬래시 정규화
- 동일 이름 다른 역 구분 시 line/operator 필수 사용

### 5.4 station dimension 생성 로직
역 메타데이터 소스를 읽어 아래를 표준화한다.
- station_id (내부 canonical)
- station_name
- line_name
- operator_name
- lat/lng
- address
- city_do
- sigungu
- zone_id

규칙:
- 역 메타데이터에 주소가 없으면 가능한 범위에서 보완하되, 추정이면 별도 flag 를 남긴다.
- zone 매핑 실패 시 NULL 로 두지 말고 quarantine 또는 unmapped 상태를 기록한다.

### 5.5 상일동역 canonical 식별
상일동역에 대해 아래를 별도 문서에 고정한다.
- canonical station_id
- raw aliases
- 노선/운영기관
- 주소/좌표
- zone

## 6. 구현 기준

### 6.1 zone 기준
- 서울/경기 외 지역은 우선 `기타 수도권 외` 또는 `미정` 처리 정책을 문서화한다.
- 이번 범위에서는 서울/경기만 정교하게 다루고, 나머지는 fallback group 으로 묶을 수 있다.

### 6.2 station 기준
- `station_id` 는 외부 소스 코드에 의존하지 않고 내부 canonical ID 를 만든다.
- 외부 소스별 code 는 별도 mapping 컬럼 또는 crosswalk 테이블로 보관 가능하다.

### 6.3 문서 기준
- 매핑에 사람이 개입한 규칙은 반드시 문서화한다.
- 임의 추정이 들어간 경우 confidence 를 표시한다.

## 7. 완료 조건
아래를 모두 만족해야 한다.

- 13권역 시드 작성 완료
- station alias 규칙 작성 완료
- 상일동역 canonical 식별 완료
- station metadata 정규화 로직 작성 완료
- 권역/역 정규화 문서 작성 완료

## 8. 주의할 실패 포인트
- **동일 역명 복수 존재**: line/operator 와 함께 disambiguation
- **주소 없는 역 메타데이터**: 좌표 기반 역추정은 가능하지만 추정 flag 필요
- **sigungu 오탈자**: zone mapping join 전에 행정구 명칭 normalize 필요

## 9. 단계 완료 보고 형식
- 생성된 zone 개수
- station alias 개수
- unmapped station 개수
- 상일동역 canonical record
- 다음 단계(DB schema) 입력 준비 상태

## 10. Codex 전용 프롬프트
```text
03_zone-design-and-station-metadata.md 기준으로 권역 정의와 역 메타데이터 정규화를 구현하라.

반드시 할 일:
1. 13권역 시드 파일을 만든다.
2. station alias 규칙과 매핑 파일을 만든다.
3. 상일동역 canonical 식별 결과를 문서화한다.
4. 역 메타데이터를 정규화하는 스크립트를 만든다.
5. docs/zone-definition.md 와 docs/station-normalization.md 를 작성한다.

주의:
- 외부 소스 코드만 station_id 로 쓰지 마라.
- unmapped station 을 조용히 버리지 마라.
- 추정 보정이 있다면 flag 를 남겨라.

완료 후 출력:
- zone seed 경로
- alias 파일 경로
- 상일동역 canonical 식별 결과
- unmapped 항목 요약
```


---

# FILE: 04_database-schema.md

# 04. 데이터베이스 스키마, 뷰, 인덱스 설계

## 1. 단계 목적
이 단계는 ETL 과 대시보드의 공통 기반이 되는 **정규화된 Postgres 스키마**를 확정한다.  
이 단계의 핵심은 단순 테이블 생성이 아니라, **mixed grain OD를 견딜 수 있는 모델**과 **운영 가능한 적재 로그 구조**를 만드는 것이다.

## 2. 설계 원칙
- 차원(dimension)과 사실(fact)을 분리한다.
- 소스별 흔들림은 transform 단계에서 흡수하되, source lineage 는 fact 에 남긴다.
- OD grain 이 불확실할 수 있으므로, 사실 테이블은 station/zone 혼합 표현을 허용한다.
- 적재 실패 조사와 재실행을 위해 ETL log 와 quarantine 를 별도로 둔다.

## 3. 반드시 만들어야 하는 테이블

### 3.1 Dimension
- `dim_zone`
- `dim_station`
- 선택:
  - `dim_station_source_map`
  - `dim_passenger_type`
  - `dim_calendar`

### 3.2 Fact
- `fact_station_daily`
- `fact_station_hourly`
- `fact_station_type_daily`
- `fact_od_daily`

### 3.3 ETL / Quality
- `etl_job_runs`
- `quarantine_station_unmatched`
- `quarantine_invalid_rows`

## 4. 최소 컬럼 정의

### dim_zone
- zone_id (PK)
- zone_name
- zone_group
- sort_order
- is_active
- created_at
- updated_at

### dim_station
- station_id (PK)
- station_name
- line_name
- operator_name
- lat
- lng
- address
- city_do
- sigungu
- zone_id (FK)
- is_active
- created_at
- updated_at

### dim_station_source_map (권장)
- source_name
- source_station_code
- source_station_name
- source_line_name
- station_id
- confidence
- note

### fact_station_daily
- service_date
- station_id
- ride_count
- alight_count
- total_count
- source_name
- loaded_at

PK/unique 후보:
- `(service_date, station_id, source_name)`

### fact_station_hourly
- service_date
- hour_bucket
- station_id
- ride_count
- alight_count
- source_name
- loaded_at

PK/unique 후보:
- `(service_date, hour_bucket, station_id, source_name)`

### fact_station_type_daily
- service_date
- station_id
- passenger_type
- ride_count
- alight_count nullable
- transfer_in_count nullable
- source_name
- loaded_at

### fact_od_daily
- service_date
- origin_key
- destination_key
- origin_type
- destination_type
- origin_station_id nullable
- destination_station_id nullable
- origin_zone_id nullable
- destination_zone_id nullable
- mode
- passenger_count
- source_name
- grain_label
- loaded_at

중요:
- origin/destination 은 항상 채워져야 하지만, station_id 와 zone_id 는 grain 에 따라 nullable 일 수 있다.
- `grain_label` 예시:
  - `station_to_station`
  - `station_to_zone`
  - `zone_to_station`
  - `zone_to_zone`
  - `mixed_unknown`

### etl_job_runs
- run_id
- job_name
- source_name
- started_at
- ended_at
- status
- rows_extracted
- rows_transformed
- rows_loaded
- checksum
- params_json
- error_message

### quarantine_station_unmatched
- occurred_at
- source_name
- raw_station_name
- raw_line_name
- raw_operator_name
- reason
- payload_json

### quarantine_invalid_rows
- occurred_at
- source_name
- stage
- reason
- payload_json

## 5. 뷰 설계
아래 뷰를 작성한다.

### `vw_sangildong_origin_to_zone`
상일동역 출발 기준 권역 도착 집계

### `vw_zone_to_sangildong_destination`
권역 출발 후 상일동역 도착 집계

### `vw_station_trend_daily`
대시보드용 일별 추세 집계

### `vw_station_hourly_profile`
시간대 분석용 집계

필요하면 materialized view 를 검토하되, 초기 범위에서는 일반 view 로 시작해도 된다.

## 6. 인덱스 전략
최소 아래 인덱스를 검토한다.

- `fact_station_daily (station_id, service_date)`
- `fact_station_hourly (station_id, service_date, hour_bucket)`
- `fact_od_daily (origin_station_id, service_date)`
- `fact_od_daily (destination_station_id, service_date)`
- `fact_od_daily (origin_zone_id, service_date)`
- `fact_od_daily (destination_zone_id, service_date)`
- `dim_station (station_name, line_name, operator_name)`

## 7. 마이그레이션 규칙
- SQL migration 은 순차 번호를 갖는다.
- 다운그레이드 전략이 있으면 좋지만 최소한 forward-only 운영 방식을 문서화한다.
- seed 는 migration 과 분리한다.
- 빈 DB 에서 `db:migrate` 후 `db:seed` 로 일관되게 재현돼야 한다.

## 8. 구현 절차

### 8.1 migration 파일 작성
예시:
- `001_init_extensions.sql`
- `002_create_dim_zone.sql`
- `003_create_dim_station.sql`
- `004_create_fact_tables.sql`
- `005_create_etl_tables.sql`
- `006_create_views.sql`
- `007_create_indexes.sql`

### 8.2 seed 파일 작성
- zone seed
- station source map seed(필요 시)
- passenger type seed(필요 시)

### 8.3 DB smoke test
- 마이그레이션 적용
- seed 적용
- 샘플 insert
- view select
- explain/analyze 수준의 성능 점검

## 9. 아직 하지 말아야 할 것
- full ETL logic
- 프런트 차트 연결
- 실제 대시보드 API 최적화의 과도한 튜닝

## 10. 완료 조건
- migration 적용 성공
- seed 적용 성공
- 핵심 view 조회 성공
- 중복 적재 방지용 unique/pk 설계 반영
- quarantine/log 테이블 존재
- schema 설명 문서 작성

## 11. 단계 완료 보고 형식
- 생성된 migration 목록
- seed 적용 결과
- 주요 PK/unique/index 요약
- view 조회 예시
- 다음 단계(Extract) 입력 준비 상태

## 12. Codex 전용 프롬프트
```text
04_database-schema.md 기준으로 Postgres 스키마와 migration 을 구현하라.

반드시 할 일:
1. dimension/fact/etl/quarantine 테이블을 만든다.
2. mixed grain OD를 지원하도록 fact_od_daily 를 설계한다.
3. 대시보드용 view 를 만든다.
4. index 와 unique 조건을 정의한다.
5. migration/seed 적용 방법을 README 또는 docs에 기록한다.

주의:
- schema 변경은 migration 으로만 반영한다.
- grain_label 과 source lineage 를 빼지 마라.
- unmatched/invalid row 를 저장할 quarantine 구조를 포함하라.

완료 후 출력:
- migration 목록
- seed 결과
- 주요 테이블 정의 요약
- view 조회 성공 여부
```


---

# FILE: 05_extract.md

# 05. Extract 계층 구현

## 1. 단계 목적
이 단계의 목적은 **원본 데이터를 신뢰성 있게 확보하고 보존하는 것**이다.  
Extract 는 단순 다운로드가 아니라, 이후 transform/load 에 필요한 재현 가능한 raw snapshot 을 남겨야 한다.

## 2. 설계 원칙
- Extract 는 가능한 한 원본 형태를 유지한다.
- schema validation 은 하되, business normalization 은 transform 으로 넘긴다.
- raw snapshot 은 날짜/소스/파라미터 기준으로 고유하게 저장한다.
- 같은 실행을 반복해도 snapshot 경로와 checksum 으로 중복을 피한다.

## 3. 구현 대상 소스
검증 단계에서 채택된 소스를 기준으로 한다.  
최소 아래 유형은 구현 대상이다.

- 일별 승하차 source
- 시간대 승하차 source
- OD source
- 역 메타데이터 source

## 4. 공통 인터페이스
각 extractor 는 공통 인터페이스를 가진다.

예시:
- `fetch_raw(params) -> RawPayload`
- `validate_schema(payload) -> ValidationResult`
- `persist_raw_snapshot(payload, metadata) -> Path`
- `extract(params) -> ExtractResult`

`ExtractResult` 최소 필드:
- source_name
- requested_at
- params
- row_count
- snapshot_path
- checksum
- schema_version_or_signature

## 5. 디렉터리 구조 예시
```text
etl/extract/
  base.py
  seoul_daily_ridership.py
  seoul_hourly_ridership.py
  od_molit.py
  station_meta.py
```

## 6. 상세 작업 절차

### 6.1 공통 설정
- API 키, base URL, timeout, retry count 를 환경변수/설정으로 분리
- 개발/운영 환경에서 동일 인터페이스 사용
- user-agent 설정이 필요하면 명시

### 6.2 원본 저장 규칙
경로 예시:
```text
data/raw/<source_name>/service_date=2026-03-31/request_hash=<hash>/payload.json
data/raw/<source_name>/service_date=2026-03-31/request_hash=<hash>/meta.json
```

`meta.json` 에는 아래를 넣는다.
- fetched_at
- params
- http_status
- checksum
- row_count
- source_name

### 6.3 retry/backoff
- 네트워크 오류 재시도
- 429/5xx 재시도
- 4xx 중 인증 오류는 즉시 실패
- 재시도 횟수와 sleep 규칙 문서화

### 6.4 pagination 처리
응답이 page 기반이면 공통 pagination 헬퍼를 만든다.
주의:
- 전체 row 수 확인
- partial response 저장 금지
- page 누락 시 실패 처리

### 6.5 schema validation
pydantic, pandera, 수동 검증 등 어떤 방식이든 허용하지만 아래는 꼭 확인한다.
- 필수 필드 존재
- 타입 추정 가능
- 빈 응답 여부
- station/line/date 관련 핵심 컬럼 존재

### 6.6 CLI job 작성
예:
- `python -m etl.jobs.extract_daily --date 2026-03-28`
- `python -m etl.jobs.extract_od --date 2026-03-28`

## 7. 아직 하지 말아야 할 것
- station alias 적용
- zone mapping
- DB upsert
- aggregated analytics 생성

## 8. 예외 처리 기준
- 응답 파싱 실패 시 raw bytes 를 보존
- schema mismatch 시 snapshot 저장 후 실패
- 빈 결과는 정상/비정상 여부를 source 규칙에 따라 명시
- checksum 이 기존과 같으면 duplicate mark 가능

## 9. 로그 기준
각 extract job 은 시작/종료/성공/실패를 로그로 남긴다.
필수:
- source
- params
- row_count
- snapshot_path
- checksum
- elapsed_ms

## 10. 완료 조건
- 최소 7일치 승하차 raw 추출 가능
- 최소 1회 OD raw 추출 가능
- raw 저장 경로 규칙 확정
- retry/backoff 적용
- checksum/metadata 저장

## 11. 단계 완료 보고 형식
- 구현된 extractor 목록
- 추출 가능한 날짜 범위 예시
- snapshot 저장 경로 예시
- 실패/재시도 동작 요약
- 다음 단계(transform) 입력 포맷 요약

## 12. Codex 전용 프롬프트
```text
05_extract.md 기준으로 Extract 계층을 구현하라.

반드시 할 일:
1. source별 extractor 모듈을 만든다.
2. raw snapshot 저장 규칙과 metadata 파일을 구현한다.
3. retry/backoff 와 pagination 처리를 넣는다.
4. schema validation 을 추가한다.
5. extract CLI job 을 만든다.

주의:
- raw 를 transform 된 형태로 저장하지 마라.
- source별 응답 차이를 문서나 코드에서 명시하라.
- checksum 과 snapshot path 를 항상 남겨라.

완료 후 출력:
- extractor 목록
- 실행 예시 명령
- raw 저장 경로 예시
- 성공/실패 로그 예시
```


---

# FILE: 06_transform.md

# 06. Transform 계층 구현

## 1. 단계 목적
Transform 단계의 목적은 여러 소스에서 들어온 raw 데이터를 **대시보드와 DB가 사용할 수 있는 표준 구조**로 정리하는 것이다.  
이 단계에서 데이터 해석 규칙이 거의 모두 결정된다.

## 2. 핵심 목표
- 컬럼명/타입 표준화
- 역명/호선명/운영기관 정규화
- 날짜/시간 버킷 정리
- 상일동역 canonical 매칭
- zone mapping 결합
- grain_label 판정
- 결측/이상치/미매핑 행 분리

## 3. 표준 출력 모델
최소 아래 중간 모델을 만든다.

- `StationDailyRecord`
- `StationHourlyRecord`
- `StationTypeDailyRecord`
- `ODDailyRecord`
- `UnmatchedStationRecord`
- `InvalidRowRecord`

## 4. 상세 변환 규칙

### 4.1 컬럼명 표준화
각 source field 를 내부 표준 field 로 매핑한다.
예:
- `use_dt`, `service_date`, `승차일자` → `service_date`
- `sub_sta_nm`, `station_name` → `station_name`

매핑 테이블 또는 코드 상수로 관리한다.

### 4.2 날짜/시간 정규화
- 날짜는 ISO `YYYY-MM-DD`
- 시간대는 정수 hour bucket 또는 `"05:00-05:59"` 형태 중 하나로 고정
- source 별 시간 표현이 다르면 공통 버킷으로 통일

### 4.3 station normalization
아래 순서로 처리한다.
1. 문자열 trim
2. 유니코드 normalize
3. 특수문자/괄호/부역명 처리
4. `역` 접미어 정책 적용
5. line/operator 와 함께 canonical station lookup
6. 실패 시 alias table 재시도
7. 그래도 실패하면 quarantine

### 4.4 line/operator normalization
- `5호선`, `05호선`, `Line 5` 등 변형을 통일
- 운영기관 명칭 변형도 통일
- canonical map 을 코드 혹은 seed 로 관리

### 4.5 zone mapping
station -> sigungu -> zone 으로 연결한다.
주의:
- zone mapping 실패 시 무시하지 말고 별도 상태로 남긴다.
- OD에서 station 정보가 없고 region 정보만 있으면 가능한 최소 grain 으로 유지

### 4.6 grain 판정
OD record 마다 `grain_label` 을 채운다.
판정 기준 예:
- 양쪽 모두 station_id 존재 → `station_to_station`
- origin station, destination zone → `station_to_zone`
- origin zone, destination station → `zone_to_station`
- 둘 다 zone → `zone_to_zone`
- 불명확 → `mixed_unknown`

### 4.7 quality flags
필요하면 아래 flag 를 둔다.
- `is_imputed`
- `is_station_matched`
- `is_zone_mapped`
- `is_anomaly`
- `quality_note`

## 5. quarantine 정책
아래는 반드시 quarantine 로 보낸다.
- station lookup 실패
- 필수 날짜 누락
- passenger_count 음수
- impossible hour bucket
- origin/destination 모두 없음

quarantine 는 stage 와 reason 을 남긴다.

## 6. transform 산출물
- `data/processed/<dataset>/...`
- DB load 용 parquet/csv/jsonl 중 하나
- validation summary json
- transformation rules 문서

## 7. 통계/검증 리포트
변환 후 최소 아래 요약을 남긴다.
- total raw rows
- valid rows
- invalid rows
- station matched rate
- zone mapped rate
- top unmatched station names
- grain_label 분포

## 8. 아직 하지 말아야 할 것
- DB upsert
- UI 쿼리 구현
- 차트 최적화

## 9. 완료 조건
- station join 성공률 98% 이상(현실적으로 가능한 범위)
- unmapped station 목록 별도 저장
- grain_label 생성
- processed 산출물 생성
- `docs/transformation-rules.md` 작성

## 10. 단계 완료 보고 형식
- transformed dataset 목록
- station match rate
- zone mapping rate
- grain 분포
- quarantine 건수와 주요 원인

## 11. Codex 전용 프롬프트
```text
06_transform.md 기준으로 Transform 계층을 구현하라.

반드시 할 일:
1. source별 raw 를 내부 표준 모델로 변환한다.
2. station alias 와 canonical station_id 매핑을 적용한다.
3. zone mapping 과 grain_label 을 생성한다.
4. invalid/unmatched row 를 quarantine 로 분리한다.
5. docs/transformation-rules.md 를 작성한다.

주의:
- 매핑 실패 레코드를 조용히 제거하지 마라.
- OD grain 이 낮으면 그대로 유지하고 grain_label 로 드러내라.
- source lineage 를 잃지 마라.

완료 후 출력:
- 변환된 데이터셋 목록
- station/zone 매핑률
- quarantine 요약
- processed 파일 경로 예시
```


---

# FILE: 07_load.md

# 07. Load 계층 구현

## 1. 단계 목적
이 단계의 목적은 processed 데이터를 **안전하고 재실행 가능하게 Postgres에 적재**하는 것이다.

## 2. 핵심 요구사항
- upsert 지원
- full refresh + incremental 둘 다 가능
- transaction 경계 명확
- ETL run log 기록
- 중복 적재 방지
- 실패 시 rollback

## 3. 적재 순서
적재 순서는 아래를 따른다.

1. dimension seed / dimension update
2. source map / alias 보정 테이블
3. fact_station_daily
4. fact_station_hourly
5. fact_station_type_daily
6. fact_od_daily
7. quarantine / job log 반영

## 4. 상세 작업 절차

### 4.1 loader 공통 인터페이스
예시:
- `load_dataframe(df, table_name, mode, keys)`
- `upsert_records(records, table)`
- `record_job_run(result)`

### 4.2 incremental window 설계
예시 정책:
- 최근 N일 재적재 허용
- 과거 고정 구간은 checksum 변경 시에만 refresh
- source 특성상 지연 업데이트가 있으면 sliding window 적용

### 4.3 transaction 정책
- table 단위 transaction 또는 dataset 단위 transaction
- 중도 실패 시 commit 금지
- partial insert 가 남지 않도록 한다

### 4.4 conflict handling
테이블별 unique key 기준으로 upsert 한다.
예:
- `fact_station_daily (service_date, station_id, source_name)`
- `fact_od_daily (service_date, origin_key, destination_key, source_name, grain_label)`

### 4.5 job run 기록
각 load job 마다 `etl_job_runs` 에 아래를 넣는다.
- started_at / ended_at
- status
- rows_transformed / rows_loaded
- checksum
- params_json
- error_message

### 4.6 검증 쿼리
적재 후 아래를 검증한다.
- source row count 와 loaded row count 비교
- 특정 날짜/역 조회
- view 결과 확인
- duplicate count 0 확인

## 5. 스크립트/CLI 예시
- `python -m etl.jobs.load_station_daily --date 2026-03-28`
- `python -m etl.jobs.load_od --date 2026-03-28`
- `python -m etl.jobs.run_pipeline --from 2026-03-20 --to 2026-03-28`

## 6. 성능/안정성 기준
- 대량 insert 는 batch 처리
- 필요 시 temp table + merge/upsert 전략 사용
- DB 연결 pool 및 timeout 을 명시
- 적재 중 메모리 과사용 방지

## 7. 완료 조건
- 동일 날짜 재적재 시 duplicate 없음
- 적재 실패 시 rollback 보장
- etl_job_runs 기록 확인 가능
- 핵심 fact 테이블 조회 성공
- load 검증 리포트 생성

## 8. 주의할 실패 포인트
- source key 설계 미흡으로 duplicate 발생
- dimension 미적재 상태에서 fact 선적재
- transaction scope 과대 설정으로 lock 장기화
- quarantine 저장 누락

## 9. 단계 완료 보고 형식
- 적재된 테이블 목록
- upsert key 요약
- sample row count
- rollback 테스트 결과
- job log 예시

## 10. Codex 전용 프롬프트
```text
07_load.md 기준으로 Load 계층을 구현하라.

반드시 할 일:
1. processed 데이터를 Postgres에 upsert 하는 loader 를 만든다.
2. full refresh 와 incremental load 를 지원한다.
3. etl_job_runs 와 quarantine 반영을 포함한다.
4. duplicate 방지와 rollback 을 보장한다.
5. load 검증 리포트를 생성한다.

주의:
- fact 적재 전에 dimension 상태를 보장하라.
- partial load 를 남기지 마라.
- 동일 날짜 재실행이 idempotent 해야 한다.

완료 후 출력:
- load CLI 목록
- upsert key
- 적재 성공 요약
- rollback/duplicate 검증 결과
```


---

# FILE: 08_api.md

# 08. API 및 쿼리 계층 구현

## 1. 단계 목적
이 단계의 목적은 DB 에 적재된 데이터를 **대시보드가 사용하기 쉬운 읽기 전용 API** 로 노출하는 것이다.

## 2. 핵심 설계 원칙
- UI가 직접 복잡한 SQL을 알지 않게 한다.
- 응답에는 데이터 자체뿐 아니라 **최신성, source, grain, 제한사항** 을 포함한다.
- 잘못된 요청에 대해 명확한 validation error 를 반환한다.
- 캐시 가능성이 높은 조회는 구조적으로 안정된 파라미터 체계를 갖는다.

## 3. 구현 대상 엔드포인트
최소 아래를 구현한다.

- `GET /api/health`
- `GET /api/meta/zones`
- `GET /api/meta/stations?query=`
- `GET /api/stations/{stationId}/overview?from=&to=`
- `GET /api/stations/{stationId}/hourly?from=&to=&weekdayType=`
- `GET /api/od/origin-to-zone?stationName=상일동역&from=&to=&weekdayType=`
- `GET /api/od/zone-to-destination?stationName=상일동역&from=&to=&weekdayType=`

선택:
- `GET /api/stations/{stationId}/top-destinations`
- `GET /api/stations/{stationId}/top-origins`
- `POST /api/admin/rebuild-cache`

## 4. 응답 설계
모든 주요 조회 응답에 아래 메타를 포함한다.
- `sourceNames`
- `grainLabel`
- `lastLoadedAt`
- `dateRange`
- `limitations`
- `queryEcho`

예시:
```json
{
  "meta": {
    "sourceNames": ["seoul_daily_ridership", "molit_od"],
    "grainLabel": "station_to_zone",
    "lastLoadedAt": "2026-03-31T01:00:00Z",
    "dateRange": {"from": "2026-03-01", "to": "2026-03-31"},
    "limitations": ["OD destination is aggregated at zone level for some rows"]
  },
  "data": [...]
}
```

## 5. validation 규칙
- 날짜 파라미터 없으면 sensible default 제공
- `from > to` 금지
- stationName 과 stationId 혼용 시 우선순위 정의
- 존재하지 않는 역은 404 또는 400 중 하나로 일관되게 처리
- weekdayType 는 `all|weekday|weekend` 같은 제한 enum

## 6. SQL/쿼리 레이어 요구사항
- raw SQL 또는 query builder 가능
- SQL 은 `lib/queries/` 에 분리
- 대시보드용 집계 로직은 route 파일에서 직접 작성하지 않는다
- 쿼리별 explain 검토 가능한 수준의 명확한 구조 유지

## 7. 성능 기준
- station overview 기본 조회 1초 내외 목표
- 목록 조회는 pagination 또는 제한 row 정책 사용
- 필요 시 ISR/캐시 전략 검토
- 응답 payload 과대화 방지

## 8. 구현 절차

### 8.1 입력 schema 정의
zod 또는 동등 도구로 query param schema 작성

### 8.2 query function 작성
예:
- `getStationOverview`
- `getStationHourlyProfile`
- `getOriginToZone`
- `getZoneToDestination`
- `searchStations`
- `listZones`

### 8.3 route handler 작성
- 파라미터 parse
- validation
- query 호출
- meta 결합
- error handling

### 8.4 API 문서 작성
- request params
- response schema
- 에러 응답 예시

## 9. 에러 처리 기준
- validation error
- not found
- db unavailable
- data not loaded
- internal error

메시지는 사용자 친화적으로 쓰되, 내부 로그에는 상세 정보를 남긴다.

## 10. 완료 조건
- 핵심 엔드포인트 동작
- station overview/hourly/OD 응답 성공
- meta 정보 포함
- API 문서 작성
- 주요 조회 SQL 이 인덱스와 맞물림

## 11. 단계 완료 보고 형식
- 구현된 API 목록
- 예시 요청/응답
- 주요 validation 규칙
- 성능/캐시 메모
- UI 단계에 전달할 데이터 계약 요약

## 12. Codex 전용 프롬프트
```text
08_api.md 기준으로 읽기 API 와 쿼리 계층을 구현하라.

반드시 할 일:
1. station overview/hourly/OD/meta API 를 만든다.
2. query param validation 을 추가한다.
3. 응답에 source, grain, lastLoadedAt, limitations 를 포함한다.
4. SQL/쿼리를 lib/queries 로 분리한다.
5. API 문서를 작성한다.

주의:
- route handler 안에 복잡한 SQL 을 직접 길게 쓰지 마라.
- 데이터 한계를 meta 또는 limitations 에 반영하라.
- stationName 검색과 stationId 조회의 규칙을 명확히 하라.

완료 후 출력:
- API 목록
- 예시 요청/응답
- validation 규칙 요약
- UI 사용을 위한 계약 정리
```


---

# FILE: 09_dashboard-ui.md

# 09. 대시보드 UI 구현

## 1. 단계 목적
이 단계의 목적은 상일동역 분석 결과를 **현업이 바로 읽을 수 있는 한국어 웹 대시보드**로 만드는 것이다.

## 2. 화면 목표
사용자는 메인 페이지에서 바로 아래를 이해할 수 있어야 한다.

- 상일동역의 최근 승차/하차 규모
- 최근 추세가 증가/감소하는지
- 시간대별 패턴이 어떤지
- 상일동역 출발 승객이 어느 권역으로 이동하는지
- 상일동역 도착 승객이 어느 권역에서 오는지
- 현재 데이터가 역 단위인지 권역 단위인지
- 데이터 마지막 적재 시각과 제한사항

## 3. 필수 화면 구성

### 3.1 상단 헤더
- 페이지 제목
- 분석 대상 역
- 마지막 업데이트 시각
- 데이터 source 배지
- grain_label 배지

### 3.2 KPI 카드
최소 4개:
- 최근 일자 승차
- 최근 일자 하차
- 최근 7일 평균
- 전주 대비 증감

선택:
- 평일 평균
- 주말 평균
- OD coverage

### 3.3 일별 추세 차트
- 승차/하차 2계열 라인 차트
- 날짜 범위 선택
- 툴팁/범례 지원

### 3.4 시간대별 패턴
- 평일/주말 토글
- 히트맵 또는 시간대 막대차트
- 승차/하차 선택 또는 병렬 표시

### 3.5 상일동역 출발 → 권역 도착
- 권역별 막대그래프
- 점유율(%)
- Top 목적지 역 테이블 또는 카드

### 3.6 권역 출발 → 상일동역 도착
- 권역별 막대그래프
- 점유율(%)
- Top 출발역 테이블 또는 카드

### 3.7 필터 패널
- 기간
- 평일/주말
- 승객유형
- 데이터 source
- 필요 시 hour range

### 3.8 품질/정의 패널
- 데이터 단위(grain)
- source
- 적재 성공 시각
- known limitations
- OD coverage note

## 4. UX 요구사항
- 한국어 UI
- 데스크톱 우선
- 모바일에서도 깨지지 않되 기능 우선순위는 데스크톱
- 데이터 없음 / 오류 / 로딩 상태 분리
- skeleton 또는 loading placeholder 제공
- CSV/PNG export 중 최소 1개 제공

## 5. 디자인/구현 규칙
- 과도한 장식보다 정보 밀도와 가독성을 우선
- 색상만으로 의미를 전달하지 말 것
- 단위(명, %, 날짜)를 명확히 표기
- OD grain 이 station-level 이 아닐 경우 설명 배지와 툴팁 제공

## 6. 구현 절차

### 6.1 화면 레이아웃
- 상단 요약
- 중단 추세
- 하단 OD 2열 배치
- 오른쪽 또는 하단에 데이터 정의 패널

### 6.2 데이터 훅/상태 관리
- server component / client component 경계 명확화
- 필터 값에 따른 API 호출 로직 정리
- loading, empty, error 상태 공통 컴포넌트화

### 6.3 차트 컴포넌트
예:
- `RidershipTrendChart`
- `HourlyProfileChart`
- `OriginToZoneBarChart`
- `ZoneToDestinationBarChart`
- `KpiCards`
- `DataQualityPanel`

### 6.4 접근성/사용성
- 버튼과 입력 필드 label
- keyboard 접근성 기본 지원
- 차트 fallback 표 또는 요약 텍스트

## 7. 비기능 요구사항
- 첫 화면 렌더링이 지나치게 무겁지 않아야 한다.
- 빈 데이터일 때도 레이아웃은 유지한다.
- API 지연 시 사용자에게 현재 상태를 알린다.

## 8. 완료 조건
- 메인 페이지 실데이터 렌더링
- KPI/추세/시간대/OD 영역 모두 표시
- 필터 동작
- grain/source/limitations 표시
- 오류/빈값/로딩 처리
- 최소 1개 다운로드 기능

## 9. 단계 완료 보고 형식
- 구현한 컴포넌트 목록
- 연결된 API 목록
- empty/error/loading 처리 방식
- UI상 표시한 데이터 한계 요약
- 배포 전 확인 필요 사항

## 10. Codex 전용 프롬프트
```text
09_dashboard-ui.md 기준으로 상일동역 대시보드 UI를 구현하라.

반드시 할 일:
1. KPI, 일별 추세, 시간대 패턴, OD 2개 영역을 갖는 메인 화면을 만든다.
2. 필터 패널과 데이터 품질 패널을 만든다.
3. source, grain, limitations, lastLoadedAt 를 사용자에게 표시한다.
4. loading/empty/error 상태를 분리한다.
5. CSV 또는 PNG export 기능을 최소 1개 구현한다.

주의:
- 데이터 한계를 숨기지 마라.
- 한국어 UI 로 구현하라.
- 정보 가독성을 우선하고 차트 남용을 피하라.

완료 후 출력:
- 페이지 구성 요약
- 사용한 API 목록
- 구현한 컴포넌트 목록
- 아직 남은 UX 이슈
```


---

# FILE: 10_testing-qa.md

# 10. 테스트 및 QA

## 1. 단계 목적
이 단계의 목적은 구현된 시스템이 **다시 실행해도 같은 결과를 내는지**, 그리고 UI/API/ETL 이 **서로 일관되게 연결되는지** 검증하는 것이다.

## 2. 테스트 범위
테스트는 아래 4층으로 나눈다.

1. **단위 테스트**
   - 문자열 정규화
   - station alias lookup
   - zone mapping
   - grain_label 판정
2. **통합 테스트**
   - extractor → transform
   - transform → load
   - API → DB
3. **E2E 테스트**
   - 메인 페이지 진입
   - 필터 변경
   - 차트/테이블 갱신
4. **수동 QA**
   - 상일동역 데이터 검증
   - 합계/비율 sanity check
   - known limitations 확인

## 3. 필수 테스트 시나리오

### 3.1 ETL 단위 테스트
- raw station name 정규화
- line/operator disambiguation
- zone mapping 성공/실패
- invalid row quarantine
- checksum/snapshot path 생성

### 3.2 Load 테스트
- 같은 날짜 두 번 적재해 duplicate 없음
- 실패 시 rollback
- etl_job_runs 기록 생성

### 3.3 API 테스트
- 유효 stationId 조회
- 잘못된 날짜 범위
- stationName 검색
- OD endpoint 응답 구조
- lastLoadedAt / grainLabel 존재

### 3.4 UI E2E
- 메인 페이지 로드
- 기간 필터 변경
- 평일/주말 토글
- 빈 결과 상태 확인
- 오류 상태 fallback 확인

## 4. 수동 검증 포인트
아래는 사람이 직접 확인한다.

- 상일동역 최근 승하차 수가 0 이 아닌지
- 승차/하차 그래프가 날짜 범위에 따라 바뀌는지
- OD 권역 합계와 상세 테이블 합계가 대체로 일치하는지
- grain 이 station-level 이 아닐 경우 배지가 보이는지
- lastLoadedAt 가 실제 적재 시점과 맞는지

## 5. 테스트 데이터 전략
- fixture raw sample 사용
- 로컬 테스트용 작은 날짜 범위 seed
- 가능하면 ephemeral DB 또는 테스트 schema 사용

## 6. CI 기준
최소 아래를 CI 에 연결한다.
- lint
- typecheck
- unit test
- API/integration test
- pytest
- Playwright smoke

## 7. QA 문서
아래 문서를 작성한다.
- `docs/qa-checklist.md`
- `docs/known-limitations.md`
- `docs/test-report.md` (선택)

## 8. 완료 조건
- 핵심 unit/integration/e2e 테스트 작성
- CI 또는 로컬 명령으로 일괄 실행 가능
- known limitations 문서 작성
- 상일동역 기준 smoke QA 완료

## 9. 단계 완료 보고 형식
- 테스트 종류별 통과 현황
- 실패/보류 테스트 목록
- known limitations 요약
- 배포 가능 여부

## 10. Codex 전용 프롬프트
```text
10_testing-qa.md 기준으로 테스트와 QA를 구현하라.

반드시 할 일:
1. ETL 핵심 규칙에 대한 단위 테스트를 만든다.
2. load/idempotency 테스트를 만든다.
3. API 통합 테스트를 만든다.
4. Playwright E2E smoke 테스트를 만든다.
5. docs/qa-checklist.md 와 docs/known-limitations.md 를 작성한다.

주의:
- 테스트를 형식적으로 만들지 말고 실제 실패 가능 지점을 겨냥하라.
- OD grain 한계가 있으면 known limitations 에 반드시 반영하라.
- 배포 전 smoke checklist 를 문서화하라.

완료 후 출력:
- 테스트 커버한 영역
- 실행 명령과 결과
- 남은 위험요소
- 배포 진행 가능 여부
```


---

# FILE: 11_deploy-vercel.md

# 11. Vercel 배포 준비 및 실제 배포

## 1. 단계 목적
이 단계의 목적은 웹 대시보드를 **Vercel에 배포 가능한 상태**로 만들고, 권한이 있으면 실제 배포까지 마치는 것이다.

## 2. 중요한 전제
Codex 실행 환경에 Vercel 접근 권한이 없을 수 있다.  
이 경우 **배포 성공을 추정하지 말고**, 아래 둘 중 하나로 처리한다.

- 권한 있음: 실제 배포 실행, URL 확인, health check 검증
- 권한 없음: `deploy-ready` 상태까지 구성하고, 막힌 이유와 필요한 자격증명을 문서화

## 3. 이번 단계의 목표 상태
- Vercel 프로젝트 설정 파일 존재
- 환경변수 목록 및 주입 절차 문서화
- DB 연결 방식 정리
- Preview / Production 전략 문서화
- 가능하면 실제 배포 URL 확보

## 4. 상세 작업 절차

### 4.1 배포 설정 파일 점검
- `vercel.json` 작성 또는 검토
- 필요 시 function max duration 설정
- 필요 시 cron 정의
- redirect/rewrite 가 있다면 의도 검토

### 4.2 빌드 검증
로컬에서 아래를 통과시킨다.
- `pnpm build`
- `pnpm start` 또는 preview equivalent
- build 시 env requirement 확인

### 4.3 환경변수 정리
최소 아래를 문서화한다.
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `SEOUL_OPEN_DATA_API_KEY`
- `DATA_GO_KR_SERVICE_KEY`
- `APP_BASE_URL`
- `ADMIN_CRON_SECRET`

각 변수에 대해 설명:
- 사용 위치
- 필수 여부
- preview/prod 차이
- 변경 후 재배포 필요 여부

### 4.4 DB 연결 검증
- web 앱이 읽기 전용 쿼리를 수행하는지
- ETL 이 직접 DB 에 적재하는 구조인지
- Vercel 함수 내에서 무거운 ETL 을 수행하지 않는지

### 4.5 실제 배포(권한 있는 경우)
- Vercel 프로젝트 연결
- Preview 배포
- Production 배포
- `/api/health` 확인
- 메인 페이지 렌더링 확인
- 환경변수 누락 여부 확인

### 4.6 권한 없는 경우의 처리
아래 문서를 남긴다.
- `docs/runbooks/deploy.md`
- `docs/deploy-blockers.md`

`docs/deploy-blockers.md` 예시 항목:
- Vercel 토큰 미제공
- 프로젝트 연결 권한 없음
- Production env 미입력
- DB whitelist/권한 문제

## 5. 배포 아키텍처 원칙
- Vercel 은 **웹/API 계층**
- ETL 은 **외부 job or GitHub Actions**
- DB 는 **외부 Postgres**
- 웹 요청에서 대량 ETL 실행 금지

## 6. 배포 후 필수 확인
- health endpoint
- 상일동역 메인 화면
- API 응답 정상
- lastLoadedAt 표시
- source/grain 배지 표시
- console/server error 부재

## 7. 완료 조건
- `vercel.json` 존재 및 검토 완료
- build 성공
- 배포 절차 문서화 완료
- 권한 있으면 실제 배포 URL 확보
- 권한 없으면 deploy blocker 문서화 완료

## 8. 단계 완료 보고 형식
- build 결과
- env 목록
- preview/prod 상태
- 실제 URL 또는 blocker
- health check 결과

## 9. Codex 전용 프롬프트
```text
11_deploy-vercel.md 기준으로 Vercel 배포 준비를 마무리하고, 권한이 있으면 실제 배포까지 수행하라.

반드시 할 일:
1. vercel.json 과 빌드 설정을 점검한다.
2. 필요한 환경변수 목록과 주입 절차를 문서화한다.
3. 로컬 build 를 통과시킨다.
4. 권한이 있으면 preview/prod 배포 후 URL 과 health 결과를 남긴다.
5. 권한이 없으면 docs/deploy-blockers.md 에 정확한 blocker 를 기록한다.

주의:
- 배포 성공을 추정으로 쓰지 마라.
- DB/ETL 구조가 Vercel 함수 제약을 넘지 않게 유지하라.
- production health check 결과를 남겨라.

완료 후 출력:
- build 결과
- 배포 URL 또는 blocker
- health endpoint 상태
- 운영 전 남은 이슈
```


---

# FILE: 12_scheduler-ops.md

# 12. 스케줄 자동화 및 운영 문서화

## 1. 단계 목적
이 단계의 목적은 대시보드가 일회성 데모가 아니라 **반복 실행 가능한 운영 서비스**가 되도록 자동화와 runbook 을 갖추는 것이다.

## 2. 기본 방침
기본 스케줄러는 **GitHub Actions** 로 둔다.  
Vercel Cron 은 옵션으로 지원하되, ETL 규모와 플랜 제약을 고려해 보조 수단으로 취급한다.

## 3. 왜 GitHub Actions를 기본으로 두는가
- ETL 은 Python 기반이라 웹 배포와 분리하는 편이 안정적
- 대량 데이터 적재를 서버리스 HTTP 요청에 묶지 않는 편이 좋음
- 실패/재시도/로그를 배포와 독립적으로 관리하기 쉬움

## 4. 자동화 범위
최소 자동화 대상:
- 일별 extract → transform → load
- 실패 알림 또는 실패 로그 확인 경로
- 수동 재실행 방법 문서화

선택 자동화:
- materialized view refresh
- cache warmup
- health ping
- data quality report 생성

## 5. 상세 작업 절차

### 5.1 GitHub Actions 워크플로 작성
예시 파일:
- `.github/workflows/etl-daily.yml`
- `.github/workflows/ci.yml`

`etl-daily.yml` 요구사항:
- 수동 트리거(`workflow_dispatch`)
- 스케줄 트리거(`schedule`)
- Python setup
- env 주입
- extract/transform/load 순차 실행
- 실패 시 로그 아티팩트 저장

### 5.2 Vercel Cron 옵션 구현
선택적으로 아래를 만든다.
- `app/api/cron/etl/route.ts`

규칙:
- secret 검증
- idempotent
- redirect 금지
- 실제 heavy ETL 대신 orchestrator 역할 또는 경량 작업만 수행

### 5.3 운영 문서 작성
필수 runbook:
- `docs/runbooks/etl.md`
- `docs/runbooks/data-quality.md`
- `docs/runbooks/rollback.md`

포함 항목:
- 수동 실행 명령
- 특정 날짜 재적재 방법
- 장애 발생 시 점검 순서
- 중복 적재 발견 시 복구 절차
- source 장애 시 fallback 전략

### 5.4 모니터링/품질 확인
최소 확인 항목:
- 최근 성공 run 시각
- 마지막 적재 row count
- 에러 로그 위치
- health endpoint
- data freshness 표시

## 6. 완료 조건
- GitHub Actions 워크플로 존재
- 수동/자동 ETL 실행법 문서화
- rollback/data-quality runbook 작성
- 선택 시 Vercel cron endpoint 구현 및 보안 반영

## 7. 주의할 실패 포인트
- cron 이 heavy job 을 직접 수행해 timeout
- secret 검증 누락
- 실패 로그가 남지 않음
- 재실행 시 duplicate 발생
- timezone 혼동

## 8. 단계 완료 보고 형식
- 생성된 workflow 목록
- 스케줄 정책 요약
- 수동 실행 명령
- 실패 시 대응 경로
- 운영 문서 목록

## 9. Codex 전용 프롬프트
```text
12_scheduler-ops.md 기준으로 자동화와 운영 문서를 정리하라.

반드시 할 일:
1. GitHub Actions 기반 ETL 자동화 워크플로를 만든다.
2. ETL 수동 재실행과 rollback runbook 을 작성한다.
3. data-quality 점검 문서를 작성한다.
4. 필요하면 Vercel cron endpoint 를 옵션으로 구현한다.
5. timezone, secret, idempotency 를 명시한다.

주의:
- 서버리스 HTTP 요청 안에서 heavy ETL 을 직접 수행하지 마라.
- 실패 로그와 복구 절차를 반드시 남겨라.
- 운영 문서가 실제 실행 명령을 포함해야 한다.

완료 후 출력:
- workflow 목록
- 스케줄 요약
- 운영 문서 목록
- 남은 운영 리스크
```


---

# FILE: 13_acceptance-and-handover.md

# 13. 최종 인수인계 및 승인 기준

## 1. 단계 목적
이 단계의 목적은 프로젝트를 **작업 중 상태**가 아니라 **인수 가능한 상태**로 정리하는 것이다.  
Codex는 구현이 끝난 뒤 반드시 이 문서 기준으로 최종 상태를 점검해야 한다.

## 2. 최종 산출물 체크리스트

### 2.1 코드
- [ ] Next.js 앱
- [ ] Python ETL 패키지
- [ ] DB migrations
- [ ] seed 데이터
- [ ] API route handlers
- [ ] 테스트 코드

### 2.2 데이터
- [ ] raw sample 저장
- [ ] processed sample 또는 processed 규격
- [ ] zone mapping seed
- [ ] station alias mapping
- [ ] 상일동역 canonical 식별 문서

### 2.3 문서
- [ ] README
- [ ] AGENTS.md
- [ ] data-source-validation
- [ ] data-dictionary
- [ ] transformation-rules
- [ ] known-limitations
- [ ] deploy runbook
- [ ] etl runbook
- [ ] rollback runbook
- [ ] data-quality runbook
- [ ] QA checklist

### 2.4 운영
- [ ] health endpoint
- [ ] ETL job logging
- [ ] scheduler workflow
- [ ] Vercel 설정
- [ ] env example

## 3. 최종 승인 기준

### 3.1 기능 기준
- 상일동역 메인 대시보드가 뜬다.
- 일별 승하차 추세가 나온다.
- 시간대별 패턴이 나온다.
- 출발→권역, 권역→도착 집계가 나온다.
- source/grain/lastLoadedAt/limitations 가 보인다.

### 3.2 품질 기준
- lint, typecheck, test 통과
- ETL 재실행 시 duplicate 없음
- station/zone 매핑 실패가 quarantine 에 남음
- known limitations 문서 존재

### 3.3 배포 기준
- Vercel 배포 성공 URL 확보 또는 blocker 명시
- `/api/health` 확인
- 배포 후 주요 화면 smoke test

## 4. 최종 인수인계 문서에 포함할 내용
최종 요약 문서에 아래를 넣는다.

- 프로젝트 목적
- 채택한 데이터 소스
- OD grain 최종 판정
- 주요 제약 사항
- 로컬 실행법
- ETL 실행법
- 배포 방법
- 재배포 방법
- 장애 대응 순서
- 향후 개선 과제

## 5. 반드시 정리할 Known Limitations 예시
- OD 가 역 단위가 아닌 경우의 영향
- source 갱신 지연
- 서울/경기 외 지역 단순화
- station alias 수작업 의존성
- 특정 날짜 결측 가능성

## 6. 최종 보고 포맷
Codex는 마지막에 아래 구조로 보고한다.

1. 완료한 단계 목록
2. 핵심 구현 파일
3. 실행/테스트 결과
4. 실제 배포 상태
5. 주요 한계
6. 다음 개선 과제 5개

## 7. Codex 전용 프롬프트
```text
13_acceptance-and-handover.md 기준으로 최종 점검과 인수인계를 마무리하라.

반드시 할 일:
1. 체크리스트를 기준으로 미완료 항목을 정리한다.
2. README 와 runbook 을 최종 업데이트한다.
3. 테스트 결과와 배포 상태를 요약한다.
4. known limitations 와 다음 개선 과제를 정리한다.
5. 프로젝트를 인수 가능한 상태로 문서화한다.

주의:
- 미완료를 완료처럼 쓰지 마라.
- 배포 blocker 가 남아 있으면 명확히 적어라.
- 데이터 한계를 운영 문서에도 반복해서 남겨라.

완료 후 출력:
- 최종 체크리스트 결과
- 배포 상태
- 주요 제한사항
- 다음 우선순위 개선 과제
```


---

# FILE: 99_master-prompt.md

# 99. Codex용 마스터 프롬프트

아래 프롬프트를 그대로 복사해 Codex에 전달할 수 있다.

```text
이 저장소에서 상일동역 유동/OD 대시보드 프로젝트를 단계적으로 끝까지 구현하라.

반드시 먼저 읽을 파일:
- README.md
- 00_global-rules.md
- 01_bootstrap.md
- 02_data-source-validation.md
- 03_zone-design-and-station-metadata.md
- 04_database-schema.md
- 05_extract.md
- 06_transform.md
- 07_load.md
- 08_api.md
- 09_dashboard-ui.md
- 10_testing-qa.md
- 11_deploy-vercel.md
- 12_scheduler-ops.md
- 13_acceptance-and-handover.md

작업 방식:
1. 각 단계 시작 전에 변경 계획을 짧게 제시한다.
2. 단계가 끝날 때마다 실행한 명령, 결과, 남은 이슈를 보고한다.
3. 이전 단계 완료 조건이 충족되지 않으면 다음 단계로 넘어가지 않는다.
4. 문서와 테스트를 반드시 함께 업데이트한다.

최종 목표:
- 상일동역의 일별/시간대별 승하차 추세를 수집/정제/적재한다.
- 상일동역 출발 승객이 어느 권역에서 하차하는지 보여준다.
- 상일동역 하차 승객이 어느 권역에서 승차하는지 보여준다.
- 서울/경기 13권역 매핑을 적용한다.
- 웹 대시보드는 Next.js(TypeScript)로 구현하고 Vercel에 배포 가능한 상태로 만든다.
- ETL은 Python으로 구현한다.
- 자동화와 운영 문서를 포함한다.

반드시 지킬 것:
- 먼저 데이터 소스와 스키마를 검증하고 docs/data-source-validation.md 를 작성하라.
- OD 데이터가 역 단위가 아니면 그 한계를 문서와 UI에 명시하고 grain_label 로 노출하라.
- 비밀값은 절대 커밋하지 마라.
- DB schema, ETL, API, UI, 테스트, 문서를 함께 업데이트하라.
- 상일동역 식별자와 station alias 규칙을 문서화하라.
- ETL은 idempotent 하게 구현하라.
- 적재 실패/미매핑 레코드는 quarantine/log 에 남겨라.
- 실제 배포 URL 을 확인하지 못하면 배포 성공이라고 쓰지 마라.

완료 기준:
- 로컬에서 전체 스택 실행 가능
- 샘플 데이터 적재 성공
- 상일동역 대시보드 실데이터 렌더링 성공
- `/api/health` 정상
- README 및 runbook 완비
- 테스트 통과
- Vercel deploy-ready 또는 실제 배포 완료
- scheduler/운영 문서 완성

보고 형식:
각 단계마다 아래를 출력하라.
1. 단계명
2. 변경 파일 목록
3. 실행 명령
4. 결과
5. 미해결 이슈
6. 다음 단계 진행 가능 여부
```


---

# FILE: AGENTS.template.md

# AGENTS.md 템플릿

## Project goal
Build a production-ready dashboard for Sangil-dong Station ridership and OD analysis with Python ETL, Postgres, Next.js, and Vercel deployment readiness.

## Mandatory workflow
1. Read the staged work instruction files in order.
2. Validate data sources before fixing the ETL/data model.
3. Keep each stage independently verifiable.
4. Update code, tests, and docs together.
5. Report what was executed and what remains after each stage.

## Rules
- Never hardcode secrets.
- Never claim deployment success without a verified URL.
- Never hide data grain limitations.
- Never silently drop unmatched stations or invalid rows.
- Keep ETL idempotent.
- Use migrations for schema changes.
- Preserve source lineage and load metadata.

## Hard gates
- Do not proceed past data modeling until source validation is documented.
- Do not load facts until station and zone dimensions are ready.
- Do not mark the project done without health checks, tests, and runbooks.

## Commands
- Web dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Unit test: `pnpm test`
- E2E: `pnpm playwright test`
- Pytest: `pytest`
- ETL health: `python -m etl.jobs.healthcheck`

## Done when
- Data source validation doc exists
- Zone/station normalization docs exist
- DB migrations apply cleanly
- Sample ETL run succeeds
- Dashboard loads real data
- Tests pass
- Deployment is verified or blockers are documented
- Runbooks are complete
