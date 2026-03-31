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
