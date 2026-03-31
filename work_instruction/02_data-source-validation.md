# 02. 데이터 소스 검증 및 샘플 수집

## 1. 단계 목적
이 단계는 프로젝트 전체의 **사실 검증 게이트**다.  
이 단계가 끝나기 전에는 OD 파이프라인과 대시보드 설계를 확정하지 않는다.

핵심 목적은 아래 5가지다.

1. 상일동역 관련 데이터가 실제로 존재하는지 확인
2. 승하차 소스와 OD 소스의 **실제 응답 스키마** 확보
3. OD 데이터의 grain(역/정류장/권역/기타) 판정
4. 날짜 범위, 갱신 주기, 호출 제한, 인증 방식 확인
5. 이후 ETL 단계에서 사용할 **최소 1개 확정 소스** 선정

## 2. 검증 대상 우선순위

### A. 승하차 소스
1. 서울시 지하철호선별 역별 승하차 인원 정보
2. 서울시 지하철 호선별 역별 시간대별 승하차 인원 정보
3. 서울교통공사 역별 일별/시간대별 승하차 파일
4. 서울교통공사 승객유형/환승유입 파일

### B. OD 소스
1. 국토교통부 일반버스·도시철도이용 O/D OpenAPI
2. STCIS O/D 다운로드 가능 여부
3. 기타 역 단위 OD 확보 가능 경로가 있으면 문서에 기록

### C. 역 메타데이터
1. 전국도시철도역사정보표준데이터
2. 서울교통공사 역사 좌표/주소 계열 자료

## 3. 이 단계에서 반드시 만들어야 하는 산출물
- `docs/data-source-validation.md`
- `docs/data-dictionary.md`
- `data/raw_samples/<source>/<date>/...`
- `scripts/inspect_sources/*` 또는 동등 기능 스크립트

## 4. 상세 작업 절차

### 4.1 소스별 샘플 수집 스크립트 작성
각 소스마다 **본 ETL이 아닌 샘플 확인용 스크립트**를 만든다.

예시:
- `scripts/inspect_sources/fetch_seoul_daily_sample.py`
- `scripts/inspect_sources/fetch_seoul_hourly_sample.py`
- `scripts/inspect_sources/fetch_od_sample.py`
- `scripts/inspect_sources/fetch_station_meta_sample.py`

기능:
- API/파일 1회 호출
- raw 응답 저장
- 응답 필드/컬럼명 추출
- row 수와 샘플 레코드 요약 출력

### 4.2 상일동역 식별자 확인
다음 중 최소 2개 이상을 확보한다.
- 역명
- 역코드
- 노선명
- 운영기관
- 위경도/주소

주의:
- `상일동`, `상일동역` 표기 차이
- 5호선/운영기관 표기 차이
- alias 필요 여부 확인

### 4.3 OD grain 판정
OD는 가장 중요하므로 아래를 반드시 문서화한다.

- origin/destination 이 역 단위인지
- station code 가 존재하는지
- bus/rail이 혼합인지
- mode 구분이 가능한지
- 서울/경기 외 지역이 포함되는지
- 일 단위인지, 시간대 단위인지

### 4.4 날짜/호출 제한 파악
각 소스마다 아래를 표로 정리한다.

- 제공 시작/종료 범위
- 업데이트 주기
- row limit
- pagination 방식
- 인증키 필요 여부
- 개발계/운영계 제한
- 오류 응답 포맷

### 4.5 파일 형식/인코딩 검증
실제 필드 처리를 위해 다음을 확인한다.
- CSV, JSON, XML, XLSX 등 형식
- 인코딩(UTF-8, CP949 등)
- 숫자 컬럼에 쉼표 포함 여부
- 날짜 포맷 일관성
- 시간대 컬럼 표현 방식

### 4.6 데이터 사용성 판정
각 소스에 대해 아래 셋 중 하나로 판정한다.

- **Primary**: 본 서비스에 사용 가능
- **Secondary**: 보조/대체 소스로 사용 가능
- **Rejected**: 현재 범위에서는 부적합

판정 이유를 반드시 쓴다.

## 5. 문서 구조 요구사항

### 5.1 `docs/data-source-validation.md`
최소 아래 항목 포함:
- 소스 개요
- 접근 방법
- 인증 방식
- 샘플 호출 결과
- 응답 스키마
- 상일동역 식별 가능 여부
- 장점/한계
- 채택 여부
- 후속 조치

### 5.2 `docs/data-dictionary.md`
필드 수준으로 작성:
- source name
- field name
- inferred type
- semantic meaning
- nullable 여부
- transform rule 초안
- target table/column 후보

## 6. Hard Decision Rules
이 단계에서 아래 의사결정을 해야 한다.

### 규칙 A — 승하차 소스 선택
최소 아래 두 계층을 확정한다.
- 일별 추세용 source
- 시간대 분석용 source

### 규칙 B — OD grain 분기
- 역 단위 OD 가능: `fact_od_daily` 를 station-to-station 중심으로 설계
- 역 단위 불가: `fact_od_daily` 를 mixed grain 으로 설계하고 `grain_label` 을 필수로 넣음

### 규칙 C — 상일동역 존재 확인 실패 시
상일동역 자체가 찾히지 않으면 즉시 원인 분석:
- 역명 normalization 이슈
- 코드 표기 이슈
- 소스 자체 coverage 이슈

원인과 대응을 문서화하기 전에는 다음 단계로 가지 않는다.

## 7. 출력 파일 저장 규칙
샘플은 반드시 경로 규칙을 가진다.

```text
data/raw_samples/
  seoul_daily_ridership/2026-03-31/response.json
  seoul_hourly_ridership/2026-03-31/response.json
  molit_od/2026-03-31/response.json
  station_meta/2026-03-31/response.csv
```

JSON 이 아닌 경우 원본 포맷 그대로 저장하고, 별도 `schema.json` 요약을 생성해도 된다.

## 8. 아직 하지 말아야 할 것
- full ETL 구현
- DB 적재
- UI 구현
- 최종 권역 집계 쿼리 확정

## 9. 완료 조건
아래가 모두 충족되어야 한다.

- 최소 1개 승하차 소스 파싱 성공
- 최소 1개 OD 소스 샘플 확보
- 상일동역 식별자 확인
- OD grain 판정 완료
- `docs/data-source-validation.md` 작성 완료
- `docs/data-dictionary.md` 작성 완료

## 10. 실패 시 대응
- **OD sample 호출 실패**: 응답/오류 원문 저장 후 재시도 조건 문서화
- **스키마가 불안정**: 최신/과거 샘플 2개 이상 비교
- **API quota 부족**: 샘플 호출 횟수를 줄이고 raw 저장 재사용
- **파일 인코딩 문제**: 변환 전 원본과 변환 후 사본 모두 보관

## 11. 단계 완료 보고 형식
Codex는 아래 형식으로 남긴다.

1. 채택한 승하차 source
2. 채택한 OD source
3. 상일동역 식별자
4. OD grain 판정
5. 차기 단계의 핵심 제약 3개

## 12. Codex 전용 프롬프트
```text
02_data-source-validation.md 기준으로 데이터 소스를 검증하라.

반드시 할 일:
1. 승하차 소스와 OD 소스 샘플을 실제로 최소 1회씩 가져온다.
2. raw 샘플을 data/raw_samples 아래에 저장한다.
3. 상일동역 식별자와 OD grain 을 판정한다.
4. docs/data-source-validation.md 와 docs/data-dictionary.md 를 작성한다.
5. 아직 ETL/DB 본 구현은 하지 않는다.

중요:
- OD가 역 단위가 아닐 수 있다는 점을 숨기지 마라.
- 상일동역 매칭 실패 레코드는 이유를 남겨라.
- 다음 단계가 바로 사용할 수 있도록 source별 장단점을 명시하라.

완료 후 출력:
- 샘플 저장 경로
- 채택 소스
- OD grain 판정
- 다음 단계로 넘어가기 위한 확정 사항
```
