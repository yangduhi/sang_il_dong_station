# 13. 최종 인수인계 및 승인 기준

## 1. 단계 목적
이 단계의 목적은 프로젝트를 **작업 중 상태**가 아니라 **인수 가능한 상태**로 정리하는 것이다.  
Codex는 구현이 끝난 뒤 반드시 이 문서 기준으로 최종 상태를 점검해야 한다.

## 2. 최종 산출물 체크리스트

### 2.1 코드
- [ ] Next.js 앱
- [ ] Python ETL 패키지
- [ ] DB migrations
- [ ] seed 데이터
- [ ] API route handlers
- [ ] 테스트 코드

### 2.2 데이터
- [ ] raw sample 저장
- [ ] processed sample 또는 processed 규격
- [ ] zone mapping seed
- [ ] station alias mapping
- [ ] 상일동역 canonical 식별 문서

### 2.3 문서
- [ ] README
- [ ] AGENTS.md
- [ ] data-source-validation
- [ ] data-dictionary
- [ ] transformation-rules
- [ ] known-limitations
- [ ] deploy runbook
- [ ] etl runbook
- [ ] rollback runbook
- [ ] data-quality runbook
- [ ] QA checklist

### 2.4 운영
- [ ] health endpoint
- [ ] ETL job logging
- [ ] scheduler workflow
- [ ] Vercel 설정
- [ ] env example

## 3. 최종 승인 기준

### 3.1 기능 기준
- 상일동역 메인 대시보드가 뜬다.
- 일별 승하차 추세가 나온다.
- 시간대별 패턴이 나온다.
- 출발→권역, 권역→도착 집계가 나온다.
- source/grain/lastLoadedAt/limitations 가 보인다.

### 3.2 품질 기준
- lint, typecheck, test 통과
- ETL 재실행 시 duplicate 없음
- station/zone 매핑 실패가 quarantine 에 남음
- known limitations 문서 존재

### 3.3 배포 기준
- Vercel 배포 성공 URL 확보 또는 blocker 명시
- `/api/health` 확인
- 배포 후 주요 화면 smoke test

## 4. 최종 인수인계 문서에 포함할 내용
최종 요약 문서에 아래를 넣는다.

- 프로젝트 목적
- 채택한 데이터 소스
- OD grain 최종 판정
- 주요 제약 사항
- 로컬 실행법
- ETL 실행법
- 배포 방법
- 재배포 방법
- 장애 대응 순서
- 향후 개선 과제

## 5. 반드시 정리할 Known Limitations 예시
- OD 가 역 단위가 아닌 경우의 영향
- source 갱신 지연
- 서울/경기 외 지역 단순화
- station alias 수작업 의존성
- 특정 날짜 결측 가능성

## 6. 최종 보고 포맷
Codex는 마지막에 아래 구조로 보고한다.

1. 완료한 단계 목록
2. 핵심 구현 파일
3. 실행/테스트 결과
4. 실제 배포 상태
5. 주요 한계
6. 다음 개선 과제 5개

## 7. Codex 전용 프롬프트
```text
13_acceptance-and-handover.md 기준으로 최종 점검과 인수인계를 마무리하라.

반드시 할 일:
1. 체크리스트를 기준으로 미완료 항목을 정리한다.
2. README 와 runbook 을 최종 업데이트한다.
3. 테스트 결과와 배포 상태를 요약한다.
4. known limitations 와 다음 개선 과제를 정리한다.
5. 프로젝트를 인수 가능한 상태로 문서화한다.

주의:
- 미완료를 완료처럼 쓰지 마라.
- 배포 blocker 가 남아 있으면 명확히 적어라.
- 데이터 한계를 운영 문서에도 반복해서 남겨라.

완료 후 출력:
- 최종 체크리스트 결과
- 배포 상태
- 주요 제한사항
- 다음 우선순위 개선 과제
```
