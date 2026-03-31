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
