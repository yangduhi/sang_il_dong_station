# 11. Vercel 배포 준비 및 실제 배포

## 1. 단계 목적
이 단계의 목적은 웹 대시보드를 **Vercel에 배포 가능한 상태**로 만들고, 권한이 있으면 실제 배포까지 마치는 것이다.

## 2. 중요한 전제
Codex 실행 환경에 Vercel 접근 권한이 없을 수 있다.  
이 경우 **배포 성공을 추정하지 말고**, 아래 둘 중 하나로 처리한다.

- 권한 있음: 실제 배포 실행, URL 확인, health check 검증
- 권한 없음: `deploy-ready` 상태까지 구성하고, 막힌 이유와 필요한 자격증명을 문서화

## 3. 이번 단계의 목표 상태
- Vercel 프로젝트 설정 파일 존재
- 환경변수 목록 및 주입 절차 문서화
- DB 연결 방식 정리
- Preview / Production 전략 문서화
- 가능하면 실제 배포 URL 확보

## 4. 상세 작업 절차

### 4.1 배포 설정 파일 점검
- `vercel.json` 작성 또는 검토
- 필요 시 function max duration 설정
- 필요 시 cron 정의
- redirect/rewrite 가 있다면 의도 검토

### 4.2 빌드 검증
로컬에서 아래를 통과시킨다.
- `pnpm build`
- `pnpm start` 또는 preview equivalent
- build 시 env requirement 확인

### 4.3 환경변수 정리
최소 아래를 문서화한다.
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `SEOUL_OPEN_DATA_API_KEY`
- `DATA_GO_KR_SERVICE_KEY`
- `APP_BASE_URL`
- `ADMIN_CRON_SECRET`

각 변수에 대해 설명:
- 사용 위치
- 필수 여부
- preview/prod 차이
- 변경 후 재배포 필요 여부

### 4.4 DB 연결 검증
- web 앱이 읽기 전용 쿼리를 수행하는지
- ETL 이 직접 DB 에 적재하는 구조인지
- Vercel 함수 내에서 무거운 ETL 을 수행하지 않는지

### 4.5 실제 배포(권한 있는 경우)
- Vercel 프로젝트 연결
- Preview 배포
- Production 배포
- `/api/health` 확인
- 메인 페이지 렌더링 확인
- 환경변수 누락 여부 확인

### 4.6 권한 없는 경우의 처리
아래 문서를 남긴다.
- `docs/runbooks/deploy.md`
- `docs/deploy-blockers.md`

`docs/deploy-blockers.md` 예시 항목:
- Vercel 토큰 미제공
- 프로젝트 연결 권한 없음
- Production env 미입력
- DB whitelist/권한 문제

## 5. 배포 아키텍처 원칙
- Vercel 은 **웹/API 계층**
- ETL 은 **외부 job or GitHub Actions**
- DB 는 **외부 Postgres**
- 웹 요청에서 대량 ETL 실행 금지

## 6. 배포 후 필수 확인
- health endpoint
- 상일동역 메인 화면
- API 응답 정상
- lastLoadedAt 표시
- source/grain 배지 표시
- console/server error 부재

## 7. 완료 조건
- `vercel.json` 존재 및 검토 완료
- build 성공
- 배포 절차 문서화 완료
- 권한 있으면 실제 배포 URL 확보
- 권한 없으면 deploy blocker 문서화 완료

## 8. 단계 완료 보고 형식
- build 결과
- env 목록
- preview/prod 상태
- 실제 URL 또는 blocker
- health check 결과

## 9. Codex 전용 프롬프트
```text
11_deploy-vercel.md 기준으로 Vercel 배포 준비를 마무리하고, 권한이 있으면 실제 배포까지 수행하라.

반드시 할 일:
1. vercel.json 과 빌드 설정을 점검한다.
2. 필요한 환경변수 목록과 주입 절차를 문서화한다.
3. 로컬 build 를 통과시킨다.
4. 권한이 있으면 preview/prod 배포 후 URL 과 health 결과를 남긴다.
5. 권한이 없으면 docs/deploy-blockers.md 에 정확한 blocker 를 기록한다.

주의:
- 배포 성공을 추정으로 쓰지 마라.
- DB/ETL 구조가 Vercel 함수 제약을 넘지 않게 유지하라.
- production health check 결과를 남겨라.

완료 후 출력:
- build 결과
- 배포 URL 또는 blocker
- health endpoint 상태
- 운영 전 남은 이슈
```
