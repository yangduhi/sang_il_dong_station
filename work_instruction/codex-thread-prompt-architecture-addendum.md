# 상일동역 프로젝트용 Codex 아키텍처 보강 프롬프트

아래 내용을 다른 Codex 스레드에 그대로 붙여 넣어 사용할 수 있다.

```text
이 저장소는 `control plane` 제품이 아니라 `data product + analytical dashboard` 프로젝트다.
따라서 `D:\vscode\codex_architecture_ver2`의 전체 아키텍처를 복제하지 말고,
그 안의 운영 패턴만 선별 도입하라.

반드시 먼저 읽을 파일:
- D:\vscode\sang_il_dong_station\work_instruction\README.md
- D:\vscode\sang_il_dong_station\work_instruction\00_global-rules.md
- D:\vscode\sang_il_dong_station\work_instruction\01_bootstrap.md
- D:\vscode\sang_il_dong_station\work_instruction\02_data-source-validation.md
- D:\vscode\sang_il_dong_station\work_instruction\03_zone-design-and-station-metadata.md
- D:\vscode\sang_il_dong_station\work_instruction\04_database-schema.md
- D:\vscode\sang_il_dong_station\work_instruction\05_extract.md
- D:\vscode\sang_il_dong_station\work_instruction\06_transform.md
- D:\vscode\sang_il_dong_station\work_instruction\07_load.md
- D:\vscode\sang_il_dong_station\work_instruction\08_api.md
- D:\vscode\sang_il_dong_station\work_instruction\09_dashboard-ui.md
- D:\vscode\sang_il_dong_station\work_instruction\10_testing-qa.md
- D:\vscode\sang_il_dong_station\work_instruction\11_deploy-vercel.md
- D:\vscode\sang_il_dong_station\work_instruction\12_scheduler-ops.md
- D:\vscode\sang_il_dong_station\work_instruction\13_acceptance-and-handover.md
- D:\vscode\sang_il_dong_station\work_instruction\codex-architecture-adoption-guide.md

## 핵심 방향

이 프로젝트는 아래 아키텍처를 유지해야 한다.

- Next.js + TypeScript 대시보드
- Next.js read API
- Python ETL
- Postgres
- GitHub Actions 기반 스케줄 운영

즉, 기본 구조는:

사용자
-> Dashboard
-> Read API
-> Query/Read Model
-> Postgres
-> Python ETL
-> ETL logs / quarantine / quality checks

이어야 한다.

## 가져와야 할 요소

`codex_architecture_ver2`에서 아래만 가져와라.

1. 단계 게이트 운영
- 각 단계 시작 전 plan 파일 생성
- 변경 파일 목록 명시
- 검증 명령과 결과 기록
- 완료 기준 충족 전 다음 단계 금지

2. Contract-first
- API 응답 shape 를 먼저 고정
- `meta.sourceNames`, `meta.grainLabel`, `meta.lastLoadedAt`, `meta.dateRange`, `meta.limitations`, `meta.queryEcho`를 공통 응답 계약으로 통일
- query param validation schema 를 고정

3. Readiness / Preflight
- `scripts/preflight.ps1`
- `scripts/verify.ps1`
- 환경변수/DB/마이그레이션/raw sample/health check 검증

4. ETL Quality Gate
- duplicate 없음
- row count 비정상 감지
- station match rate / zone mapping 실패율 점검
- quarantine 비율 점검
- freshness 점검

5. Read Model 분리
- DB 모델과 UI 응답 모델을 분리
- overview/hourly/OD/data quality 용 read model 설계

6. Known Limitations 강제 노출
- grain 불확실성
- source freshness
- alias mapping 한계
- zone mapping 누락 가능성
- 이 제약은 API와 UI에 모두 노출

## 가져오지 말아야 할 요소

아래는 도입하지 마라.

1. generic control plane domain
- JobRun / StepRun / ApprovalRequest 중심 상태 기계

2. event-first telemetry 전체 구조
- event envelope
- correlation / causation / trace 중심 이벤트 스트림
- projection-only 재구성 모델

3. MCP tool surface
- get_control_tower_snapshot
- get_job_run_detail
- list_agent_cards
- explain_job_status
- simulate_control_action
- request_control_action

4. control tower UI
- DAG explorer
- operator timeline
- action rail
- agent card oversight
- conversational operator panel

5. agent runtime / multi-agent execution
- planner / reviewer / verifier 런타임
- single writer executor 제품 내장

## 이 저장소에서 실제로 보강할 것

아래를 우선 검토하고 가능하면 실제로 구현하라.

### A. 운영 메타
- `AGENTS.md`
- `plans/`
- `.env.example`
- `docs/PLANS.md` 또는 동등 문서
- `scripts/preflight.ps1`
- `scripts/verify.ps1`

### B. 계약/스키마
- `lib/schemas/`
- `docs/contracts/api/`
- API 응답/쿼리 파라미터 schema

### C. ETL 품질 운영
- `etl_job_runs` 표준화
- quarantine reason 규격
- `scripts/check_data_quality.py`
- `docs/runbooks/data-quality.md`

### D. 대시보드 품질 표면
- `grainLabel` 배지
- `lastLoadedAt`
- `limitations`
- `DataQualityPanel`
- empty / error / stale 상태 컴포넌트

## 단계별 추가 지시

### 00 / 01 단계
- 기존 문서에 맞춰 bootstrap 하되, plan / preflight / verify 구조를 추가하라.

### 02 단계
- 데이터 소스 검증 결과를 문서와 샘플 파일로 남겨라.
- grain 불확실성은 이후 API/UI 계약에 반드시 반영하라.

### 04 ~ 07 단계
- ETL 로그, quarantine, idempotent load, duplicate 방지에 집중하라.
- 이 부분은 운영 아키텍처의 핵심이므로 단순 구현으로 끝내지 말라.

### 08 단계
- route handler 안에 복잡한 SQL을 직접 넣지 말고 `lib/queries/`와 read model로 분리하라.
- 모든 주요 응답에 meta 정보를 포함하라.

### 09 단계
- control tower가 아니라 analytical dashboard를 만들어라.
- KPI / trend / hourly / OD / data quality 중심으로 구성하라.

### 10 / 12 단계
- 테스트와 운영 자동화에 quality gate 개념을 반영하라.
- 배포보다 데이터 품질 검증을 먼저 통과시켜라.

## 작업 방식

1. 각 단계 시작 전 계획을 짧게 제시한다.
2. 구현 후 실행 명령과 결과를 남긴다.
3. 기존 문서 의도를 보존하되, 위 보강안을 반영한다.
4. 과한 아키텍처 도입보다 제품 적합성을 우선한다.

## 최종 보고 형식

최종 답변은 아래 순서로 작성하라.

1. 현재 단계에서 반영한 보강 요소
2. 추가된/수정된 파일
3. 실행한 검증 명령과 결과
4. 아직 보류한 과한 요소
5. 다음 단계 추천
```
