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
