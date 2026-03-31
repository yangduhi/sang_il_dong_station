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
