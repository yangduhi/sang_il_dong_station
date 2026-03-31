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
