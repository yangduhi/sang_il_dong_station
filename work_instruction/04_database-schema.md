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
