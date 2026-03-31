# 03. 권역 설계 및 역 메타데이터 정규화

## 1. 단계 목적
이 단계의 목적은 **역과 권역을 안정적으로 연결하는 기준층(dim layer)** 을 만드는 것이다.  
OD와 승하차 fact 를 적재하기 전에 이 기준층이 먼저 완성되어야 한다.

## 2. 왜 이 단계가 중요한가
상일동역 분석은 단순히 역별 Top N 으로 끝나지 않는다.  
최종 대시보드는 `역 → 권역`, `권역 → 역` 집계를 동시에 보여줘야 한다.  
그러려면 아래가 먼저 고정돼야 한다.

- 서울/경기 분석용 권역 정의
- 역명 alias 규칙
- 운영기관/호선별 disambiguation
- 역 메타데이터의 표준 station_id

## 3. 고정 권역안
이번 프로젝트에서는 아래 **13권역**을 기본 시드로 사용한다.

### 서울 6권역
1. 강동·송파
2. 강남·서초
3. 도심(종로·중구·용산)
4. 동북(성동·광진·동대문·중랑·성북·강북·도봉·노원)
5. 서북(마포·서대문·은평)
6. 서남(강서·양천·영등포·구로·금천·동작·관악)

### 경기 7권역
7. 하남·구리·남양주
8. 성남·광주·이천·여주·양평
9. 용인·수원·화성·오산·평택·안성
10. 안양·군포·의왕·과천·광명·부천
11. 시흥·안산
12. 고양·파주·김포
13. 의정부·양주·동두천·포천·연천·가평

## 4. 이 단계에서 만들어야 하는 핵심 파일
- `db/seeds/zone_mapping.csv`
- `db/seeds/station_aliases.csv` 또는 `.yaml`
- `docs/zone-definition.md`
- `docs/station-normalization.md`
- `scripts/build_station_dimension.py` 또는 동등 기능
- `db/seeds/dim_zone_seed.sql` 또는 동등 로더

## 5. 상세 작업 절차

### 5.1 권역 정의 문서화
`docs/zone-definition.md` 에 아래를 쓴다.
- 각 권역명
- 포함 시군구
- 설계 이유
- 대안과 왜 제외했는지
- 분석상의 한계

### 5.2 zone mapping 시드 작성
형식 예시:

| city_do | sigungu | zone_name | zone_group | sort_order |
|---|---|---|---|---|

추가로 필요하면 `dong` 수준 매핑을 허용하되, 기본은 `sigungu` 수준으로 유지한다.

### 5.3 station alias 설계
역명 표기 흔들림을 처리하기 위한 매핑 파일을 만든다.
필드 예시:
- raw_station_name
- normalized_station_name
- normalized_line_name
- operator_name
- canonical_station_id
- note

규칙 예시:
- 괄호 안 부역명 제거
- `역` 접미어 제거/보존 기준 통일
- 공백/중점/슬래시 정규화
- 동일 이름 다른 역 구분 시 line/operator 필수 사용

### 5.4 station dimension 생성 로직
역 메타데이터 소스를 읽어 아래를 표준화한다.
- station_id (내부 canonical)
- station_name
- line_name
- operator_name
- lat/lng
- address
- city_do
- sigungu
- zone_id

규칙:
- 역 메타데이터에 주소가 없으면 가능한 범위에서 보완하되, 추정이면 별도 flag 를 남긴다.
- zone 매핑 실패 시 NULL 로 두지 말고 quarantine 또는 unmapped 상태를 기록한다.

### 5.5 상일동역 canonical 식별
상일동역에 대해 아래를 별도 문서에 고정한다.
- canonical station_id
- raw aliases
- 노선/운영기관
- 주소/좌표
- zone

## 6. 구현 기준

### 6.1 zone 기준
- 서울/경기 외 지역은 우선 `기타 수도권 외` 또는 `미정` 처리 정책을 문서화한다.
- 이번 범위에서는 서울/경기만 정교하게 다루고, 나머지는 fallback group 으로 묶을 수 있다.

### 6.2 station 기준
- `station_id` 는 외부 소스 코드에 의존하지 않고 내부 canonical ID 를 만든다.
- 외부 소스별 code 는 별도 mapping 컬럼 또는 crosswalk 테이블로 보관 가능하다.

### 6.3 문서 기준
- 매핑에 사람이 개입한 규칙은 반드시 문서화한다.
- 임의 추정이 들어간 경우 confidence 를 표시한다.

## 7. 완료 조건
아래를 모두 만족해야 한다.

- 13권역 시드 작성 완료
- station alias 규칙 작성 완료
- 상일동역 canonical 식별 완료
- station metadata 정규화 로직 작성 완료
- 권역/역 정규화 문서 작성 완료

## 8. 주의할 실패 포인트
- **동일 역명 복수 존재**: line/operator 와 함께 disambiguation
- **주소 없는 역 메타데이터**: 좌표 기반 역추정은 가능하지만 추정 flag 필요
- **sigungu 오탈자**: zone mapping join 전에 행정구 명칭 normalize 필요

## 9. 단계 완료 보고 형식
- 생성된 zone 개수
- station alias 개수
- unmapped station 개수
- 상일동역 canonical record
- 다음 단계(DB schema) 입력 준비 상태

## 10. Codex 전용 프롬프트
```text
03_zone-design-and-station-metadata.md 기준으로 권역 정의와 역 메타데이터 정규화를 구현하라.

반드시 할 일:
1. 13권역 시드 파일을 만든다.
2. station alias 규칙과 매핑 파일을 만든다.
3. 상일동역 canonical 식별 결과를 문서화한다.
4. 역 메타데이터를 정규화하는 스크립트를 만든다.
5. docs/zone-definition.md 와 docs/station-normalization.md 를 작성한다.

주의:
- 외부 소스 코드만 station_id 로 쓰지 마라.
- unmapped station 을 조용히 버리지 마라.
- 추정 보정이 있다면 flag 를 남겨라.

완료 후 출력:
- zone seed 경로
- alias 파일 경로
- 상일동역 canonical 식별 결과
- unmapped 항목 요약
```
