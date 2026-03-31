# 12. 스케줄 자동화 및 운영 문서화

## 1. 단계 목적
이 단계의 목적은 대시보드가 일회성 데모가 아니라 **반복 실행 가능한 운영 서비스**가 되도록 자동화와 runbook 을 갖추는 것이다.

## 2. 기본 방침
기본 스케줄러는 **GitHub Actions** 로 둔다.  
Vercel Cron 은 옵션으로 지원하되, ETL 규모와 플랜 제약을 고려해 보조 수단으로 취급한다.

## 3. 왜 GitHub Actions를 기본으로 두는가
- ETL 은 Python 기반이라 웹 배포와 분리하는 편이 안정적
- 대량 데이터 적재를 서버리스 HTTP 요청에 묶지 않는 편이 좋음
- 실패/재시도/로그를 배포와 독립적으로 관리하기 쉬움

## 4. 자동화 범위
최소 자동화 대상:
- 일별 extract → transform → load
- 실패 알림 또는 실패 로그 확인 경로
- 수동 재실행 방법 문서화

선택 자동화:
- materialized view refresh
- cache warmup
- health ping
- data quality report 생성

## 5. 상세 작업 절차

### 5.1 GitHub Actions 워크플로 작성
예시 파일:
- `.github/workflows/etl-daily.yml`
- `.github/workflows/ci.yml`

`etl-daily.yml` 요구사항:
- 수동 트리거(`workflow_dispatch`)
- 스케줄 트리거(`schedule`)
- Python setup
- env 주입
- extract/transform/load 순차 실행
- 실패 시 로그 아티팩트 저장

### 5.2 Vercel Cron 옵션 구현
선택적으로 아래를 만든다.
- `app/api/cron/etl/route.ts`

규칙:
- secret 검증
- idempotent
- redirect 금지
- 실제 heavy ETL 대신 orchestrator 역할 또는 경량 작업만 수행

### 5.3 운영 문서 작성
필수 runbook:
- `docs/runbooks/etl.md`
- `docs/runbooks/data-quality.md`
- `docs/runbooks/rollback.md`

포함 항목:
- 수동 실행 명령
- 특정 날짜 재적재 방법
- 장애 발생 시 점검 순서
- 중복 적재 발견 시 복구 절차
- source 장애 시 fallback 전략

### 5.4 모니터링/품질 확인
최소 확인 항목:
- 최근 성공 run 시각
- 마지막 적재 row count
- 에러 로그 위치
- health endpoint
- data freshness 표시

## 6. 완료 조건
- GitHub Actions 워크플로 존재
- 수동/자동 ETL 실행법 문서화
- rollback/data-quality runbook 작성
- 선택 시 Vercel cron endpoint 구현 및 보안 반영

## 7. 주의할 실패 포인트
- cron 이 heavy job 을 직접 수행해 timeout
- secret 검증 누락
- 실패 로그가 남지 않음
- 재실행 시 duplicate 발생
- timezone 혼동

## 8. 단계 완료 보고 형식
- 생성된 workflow 목록
- 스케줄 정책 요약
- 수동 실행 명령
- 실패 시 대응 경로
- 운영 문서 목록

## 9. Codex 전용 프롬프트
```text
12_scheduler-ops.md 기준으로 자동화와 운영 문서를 정리하라.

반드시 할 일:
1. GitHub Actions 기반 ETL 자동화 워크플로를 만든다.
2. ETL 수동 재실행과 rollback runbook 을 작성한다.
3. data-quality 점검 문서를 작성한다.
4. 필요하면 Vercel cron endpoint 를 옵션으로 구현한다.
5. timezone, secret, idempotency 를 명시한다.

주의:
- 서버리스 HTTP 요청 안에서 heavy ETL 을 직접 수행하지 마라.
- 실패 로그와 복구 절차를 반드시 남겨라.
- 운영 문서가 실제 실행 명령을 포함해야 한다.

완료 후 출력:
- workflow 목록
- 스케줄 요약
- 운영 문서 목록
- 남은 운영 리스크
```
