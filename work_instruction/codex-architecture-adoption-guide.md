# 상일동역 프로젝트용 Codex 아키텍처 선별 도입 가이드

## 목적

이 문서는 `D:\vscode\codex_architecture_ver2`에서 확인된 아키텍처 패턴 중,
`D:\vscode\sang_il_dong_station` 프로젝트에 **가져올 요소**와 **버릴 요소**를 분리해
다른 Codex 스레드가 과설계 없이 올바른 방향으로 구현하도록 돕기 위한 보강 문서다.

핵심 원칙은 아래와 같다.

1. 이 프로젝트는 `control plane` 제품이 아니라 `data product + analytical dashboard` 프로젝트다.
2. 따라서 `codex_architecture_ver2`의 전체 구조를 복제하지 않는다.
3. 대신 `contract-first`, `gate-first`, `quality/readiness`, `read-model 분리` 같은 운영 패턴만 선별 적용한다.

## 한 줄 결론

권장 방향은 아래와 같다.

- 유지: `Next.js + TypeScript + Python ETL + Postgres + GitHub Actions`
- 강화: `단계 게이트`, `응답/입출력 계약`, `preflight/readiness`, `ETL quality gate`, `known limitations 강제 노출`
- 보류: `event-first telemetry`, `MCP tool surface`, `simulate/request action rail`, `agent card`, `control tower`

## 가져올 요소

### 1. 단계 게이트 운영 방식

현재 프로젝트의 work order는 단계 간 진입 조건, 산출물, 검증을 매우 명확히 관리한다.
이 패턴은 상일동역 프로젝트에 잘 맞는다.

반드시 도입 권장:

- 각 단계 시작 전 `plans/` 파일 생성
- 단계별 수정 파일 목록 명시
- 실행한 검증 명령과 결과 기록
- 완료 기준 충족 시에만 다음 단계 진행
- 단계 종료 시 남은 리스크 명시

상일동역 프로젝트에 필요한 최소 추가물:

- `plans/` 디렉터리
- 단계별 plan 문서 템플릿
- 단계 종료 보고 형식 통일

### 2. Contract-first 응답 설계

상일동역 프로젝트는 API와 UI가 명확한 데이터 계약 위에서 움직여야 한다.
특히 다음 응답은 스키마를 먼저 고정하는 편이 좋다.

- `/api/health`
- `/api/meta/zones`
- `/api/meta/stations`
- `/api/stations/{stationId}/overview`
- `/api/stations/{stationId}/hourly`
- `/api/od/origin-to-zone`
- `/api/od/zone-to-destination`

반드시 포함할 메타 필드:

- `sourceNames`
- `grainLabel`
- `lastLoadedAt`
- `dateRange`
- `limitations`
- `queryEcho`

권장 구현:

- TypeScript: `zod`
- Python ETL 결과 요약: `pydantic` 또는 dataclass
- `docs/contracts/api/*.json` 또는 `lib/schemas/*`로 스키마 고정

### 3. Readiness / Preflight

상일동역 프로젝트는 데이터 소스 유효성, DB 연결, 마지막 적재, 환경변수 누락 여부가
개발 속도와 운영 안정성에 직접 영향을 준다.

반드시 도입 권장:

- `scripts/preflight.ps1`
- `scripts/verify.ps1`
- 선택적으로 `scripts/preflight.py`

최소 확인 항목:

- `.env` 필수 키 존재 여부
- Postgres 연결 가능 여부
- 마이그레이션 적용 여부
- raw sample 존재 여부
- 최근 ETL 실행 로그 존재 여부
- `/api/health` 응답 가능 여부
- 대시보드 필수 API 1~2개 smoke check

### 4. ETL Quality Gate

현재 프로젝트의 `gate` 개념을 그대로 가져오진 않더라도,
상일동역 프로젝트에는 `ETL 품질 게이트`가 매우 유용하다.

권장 게이트 기준:

- 적재 대상 날짜 row count > 0
- duplicate count = 0
- station match rate 임계치 이상
- zone mapping 실패율 임계치 이하
- quarantine 비율 임계치 이하
- `lastLoadedAt` 갱신 성공

권장 산출물:

- `docs/runbooks/data-quality.md`
- `docs/qa-checklist.md`
- `scripts/check_data_quality.py`
- `docs/reports/etl-quality-<date>.md` 또는 `.json`

### 5. Read Model / View Model 분리

이 프로젝트는 control-plane projection까지는 필요 없지만,
`DB 모델`과 `UI 응답 모델`을 분리하는 것은 반드시 권장한다.

추천하는 읽기 모델:

- `StationOverviewResponse`
- `HourlyProfileResponse`
- `OdOriginToZoneResponse`
- `OdZoneToDestinationResponse`
- `DataQualitySummaryResponse`

효과:

- UI가 SQL/DB 구조에 덜 묶인다.
- grain, limitations, freshness를 일관되게 노출할 수 있다.
- Codex가 API와 UI를 동시에 수정할 때 안전성이 높아진다.

### 6. Known Limitations 강제 노출

상일동역 프로젝트의 핵심 리스크는 `OD grain`, `station alias`, `zone mapping`, `source freshness`다.
이건 숨기면 안 되고 제품 표면에 드러나야 한다.

반드시 반영:

- API 응답의 `limitations`
- UI의 `DataQualityPanel`
- `grain_label` 배지
- `lastLoadedAt` 표시
- `known-limitations.md`

### 7. ETL 로그와 Quarantine 운영성 강화

이 부분은 이미 작업지시서에 잘 들어가 있지만,
현재 프로젝트의 운영성 사고방식을 참고해 더 엄격하게 가져가면 좋다.

강화 권장:

- `etl_job_runs` 필수화
- 실행 파라미터/체크섬/row count 저장
- quarantine reason code 표준화
- 재실행 시 idempotent 보장

## 버릴 요소

### 1. Generic Control Plane

아래는 이 프로젝트에는 과하다.

- generic `JobRun / StepRun / ApprovalRequest` 중심 오케스트레이터
- 승인/거절/재시도 요청 중심 domain 모델
- operator action command rail

이 프로젝트는 운영자가 workflow를 조작하는 제품이 아니라,
데이터를 읽고 해석하는 분석 대시보드다.

### 2. Event-first Telemetry 전체 구조

아래는 현 시점 비추천:

- domain event envelope
- correlation/causation/trace 중심 event stream
- event-only projection 재구성

상일동역 프로젝트는 먼저 `ETL -> DB -> Read API -> Dashboard` 흐름을 단단히 만드는 게 중요하다.

### 3. MCP Tool Surface

비추천:

- `get_control_tower_snapshot`
- `get_job_run_detail`
- `list_agent_cards`
- `simulate_control_action`
- `request_control_action`

현재 제품 목표와 직접 연결되지 않는다.

### 4. Control Tower UI

비추천:

- DAG explorer
- step timeline
- approval/action rail
- active agent card oversight
- conversational operator panel

대신 필요한 것은 아래다.

- KPI 카드
- 일별 추세
- 시간대 패턴
- OD 권역 시각화
- 품질/정의 패널

### 5. Agent Mesh / Multi-agent Runtime

비추천:

- planner / reviewer / verifier / operator runtime
- single writer executor
- action arbitration

이 프로젝트는 Codex가 구현하는 저장소이지,
제품 내부에 multi-agent runtime을 넣는 저장소가 아니다.

## 부분 도입 후 추천 아키텍처

상일동역 프로젝트에 권장하는 최종 구조는 아래와 같다.

```text
사용자 / 운영자
  -> Next.js Dashboard
  -> Next.js Read API
  -> Read Model / Query Layer
  -> Postgres
  -> Python ETL (extract / transform / load)
  -> ETL logs / quarantine / quality gate
  -> GitHub Actions scheduler + runbooks
```

즉, `control-plane architecture`가 아니라 아래 성격에 가깝다.

- data-source-gated ETL architecture
- read-model-backed analytical dashboard
- quality-gated operations

## 단계별 보강 권장안

### `00_global-rules.md`에 추가 권장

- 응답 계약은 코드와 문서로 함께 관리한다.
- UI는 raw SQL 결과를 직접 사용하지 않는다.
- `limitations`, `grainLabel`, `lastLoadedAt`는 제품 표면에 반드시 노출한다.
- 단계마다 plan / verification / risk note를 남긴다.

### `01_bootstrap.md`에 추가 권장

- `plans/` 생성
- `scripts/preflight.ps1`
- `scripts/verify.ps1`
- `docs/contracts/`
- `lib/schemas/`
- `docs/decisions/ADR-002-response-contracts.md`

### `04_database-schema.md`에 추가 권장

- `etl_job_runs` 필드 표준화
- quarantine reason enum 정리
- data freshness 확인용 view 또는 query

### `05_extract.md` ~ `07_load.md`에 추가 권장

- 실행 checksum 규칙
- ETL execution manifest
- quality summary JSON
- duplicate / mismatch / quarantine 비율 계산

### `08_api.md`에 추가 권장

- 모든 endpoint 응답 schema 고정
- `meta` shape 강제
- query param schema 고정

### `09_dashboard-ui.md`에 추가 권장

- `DataQualityPanel`
- `KnownLimitationsNotice`
- `grain_label` 배지
- API error / empty / stale 상태 공통 컴포넌트

### `10_testing-qa.md`에 추가 권장

- contract test
- ETL quality gate test
- `grainLabel` / `limitations` 노출 여부 test

### `12_scheduler-ops.md`에 추가 권장

- `preflight`와 `quality gate`를 workflow에 연결
- 실패 시 로그 artifact 업로드

## 다른 Codex 스레드에 전달할 때의 핵심 요약

다른 Codex 스레드에는 아래 메시지를 짧게 붙이면 된다.

1. 이 프로젝트는 `control plane`이 아니라 `data product + dashboard`다.
2. `codex_architecture_ver2`의 전체 구조를 복제하지 말라.
3. 대신 `gate-first`, `contract-first`, `readiness`, `ETL quality gate`, `read-model separation`만 가져오라.
4. `event-first telemetry`, `MCP tool`, `simulate/request`, `control tower UI`, `agent card`는 도입하지 말라.

## 권장 판정

최종 판정은 아래와 같다.

- 그대로 이식: 비추천
- 선별 도입: 강력 추천
- 가장 적절한 수준: `경량형 Codex 운영 아키텍처`

## 이 문서를 사용하는 방법

다른 Codex 스레드에는 아래 두 파일을 함께 넘기는 것을 권장한다.

- 이 문서: `codex-architecture-adoption-guide.md`
- 실행용 프롬프트: `codex-thread-prompt-architecture-addendum.md`
