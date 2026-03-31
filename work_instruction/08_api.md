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
