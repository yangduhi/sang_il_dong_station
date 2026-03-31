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
