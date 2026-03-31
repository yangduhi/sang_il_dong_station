# 99. Codex용 마스터 프롬프트

아래 프롬프트를 그대로 복사해 Codex에 전달할 수 있다.

```text
이 저장소에서 상일동역 유동/OD 대시보드 프로젝트를 단계적으로 끝까지 구현하라.

반드시 먼저 읽을 파일:
- README.md
- 00_global-rules.md
- 01_bootstrap.md
- 02_data-source-validation.md
- 03_zone-design-and-station-metadata.md
- 04_database-schema.md
- 05_extract.md
- 06_transform.md
- 07_load.md
- 08_api.md
- 09_dashboard-ui.md
- 10_testing-qa.md
- 11_deploy-vercel.md
- 12_scheduler-ops.md
- 13_acceptance-and-handover.md

작업 방식:
1. 각 단계 시작 전에 변경 계획을 짧게 제시한다.
2. 단계가 끝날 때마다 실행한 명령, 결과, 남은 이슈를 보고한다.
3. 이전 단계 완료 조건이 충족되지 않으면 다음 단계로 넘어가지 않는다.
4. 문서와 테스트를 반드시 함께 업데이트한다.

최종 목표:
- 상일동역의 일별/시간대별 승하차 추세를 수집/정제/적재한다.
- 상일동역 출발 승객이 어느 권역에서 하차하는지 보여준다.
- 상일동역 하차 승객이 어느 권역에서 승차하는지 보여준다.
- 서울/경기 13권역 매핑을 적용한다.
- 웹 대시보드는 Next.js(TypeScript)로 구현하고 Vercel에 배포 가능한 상태로 만든다.
- ETL은 Python으로 구현한다.
- 자동화와 운영 문서를 포함한다.

반드시 지킬 것:
- 먼저 데이터 소스와 스키마를 검증하고 docs/data-source-validation.md 를 작성하라.
- OD 데이터가 역 단위가 아니면 그 한계를 문서와 UI에 명시하고 grain_label 로 노출하라.
- 비밀값은 절대 커밋하지 마라.
- DB schema, ETL, API, UI, 테스트, 문서를 함께 업데이트하라.
- 상일동역 식별자와 station alias 규칙을 문서화하라.
- ETL은 idempotent 하게 구현하라.
- 적재 실패/미매핑 레코드는 quarantine/log 에 남겨라.
- 실제 배포 URL 을 확인하지 못하면 배포 성공이라고 쓰지 마라.

완료 기준:
- 로컬에서 전체 스택 실행 가능
- 샘플 데이터 적재 성공
- 상일동역 대시보드 실데이터 렌더링 성공
- `/api/health` 정상
- README 및 runbook 완비
- 테스트 통과
- Vercel deploy-ready 또는 실제 배포 완료
- scheduler/운영 문서 완성

보고 형식:
각 단계마다 아래를 출력하라.
1. 단계명
2. 변경 파일 목록
3. 실행 명령
4. 결과
5. 미해결 이슈
6. 다음 단계 진행 가능 여부
```
