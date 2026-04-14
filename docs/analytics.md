---
title: 분석으로 팀 사용량 추적하기
description: 분석 대시보드에서 Claude Code 사용 지표를 확인하고, 도입 현황을 추적하며, 엔지니어링 생산성을 측정합니다.
---

# 분석으로 팀 사용량 추적하기

Claude Code는 조직이 개발자 사용 패턴을 이해하고, 기여 지표를 추적하며, Claude Code가 엔지니어링 생산성에 미치는 영향을 측정할 수 있도록 분석 대시보드를 제공합니다. 플랜에 맞는 대시보드에 접속하세요:

| 플랜 | 대시보드 URL | 포함 항목 | 자세히 보기 |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Claude for Teams / Enterprise | [claude.ai/analytics/claude-code](https://claude.ai/analytics/claude-code) | 사용 지표, GitHub 연동 기여 지표, 리더보드, 데이터 내보내기 | [상세 정보](#team-및-enterprise-분석-접근) |
| API (Claude Console) | [platform.claude.com/claude-code](https://platform.claude.com/claude-code) | 사용 지표, 비용 추적, 팀 인사이트 | [상세 정보](#api-고객을-위한-분석-접근) |

## Team 및 Enterprise 분석 접근

[claude.ai/analytics/claude-code](https://claude.ai/analytics/claude-code)로 이동하세요. Admin과 Owner가 대시보드를 볼 수 있습니다.

Team 및 Enterprise 대시보드에는 다음이 포함됩니다:

* **사용 지표**: 수락된 코드 줄 수, 제안 수락률, 일일 활성 사용자 및 세션 수
* **기여 지표**: Claude Code 지원으로 제출된 PR 및 코드 줄 수, [GitHub 연동](#기여-지표-활성화) 포함
* **리더보드**: Claude Code 사용량 기준 상위 기여자
* **데이터 내보내기**: 맞춤 보고를 위해 기여 데이터를 CSV로 다운로드

### 기여 지표 활성화

::: info
기여 지표는 공개 베타 중이며 Claude for Teams 및 Claude for Enterprise 플랜에서 사용할 수 있습니다. 이 지표는 claude.ai 조직 내 사용자만 다룹니다. Claude Console API 또는 서드파티 연동을 통한 사용은 포함되지 않습니다.
:::

사용 및 도입 데이터는 모든 Claude for Teams 및 Claude for Enterprise 계정에서 사용할 수 있습니다. 기여 지표는 GitHub 조직 연결을 위한 추가 설정이 필요합니다.

분석 설정을 구성하려면 Owner 역할이 필요합니다. GitHub 관리자가 GitHub 앱을 설치해야 합니다.

::: warning
기여 지표는 [Zero Data Retention](/zero-data-retention)이 활성화된 조직에서는 사용할 수 없습니다. 분석 대시보드에는 사용 지표만 표시됩니다.
:::

1. **GitHub 앱 설치**: GitHub 관리자가 [github.com/apps/claude](https://github.com/apps/claude)에서 조직의 GitHub 계정에 Claude GitHub 앱을 설치합니다.

2. **Claude Code 분석 활성화**: Claude Owner가 [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)로 이동하여 Claude Code 분석 기능을 활성화합니다.

3. **GitHub 분석 활성화**: 같은 페이지에서 "GitHub analytics" 토글을 활성화합니다.

4. **GitHub 인증**: GitHub 인증 흐름을 완료하고 분석에 포함할 GitHub 조직을 선택합니다.

활성화 후 일반적으로 24시간 이내에 데이터가 표시되며, 매일 업데이트됩니다. 데이터가 표시되지 않으면 다음 메시지 중 하나가 나타날 수 있습니다:

* **"GitHub app required"**: 기여 지표를 보려면 GitHub 앱을 설치하세요
* **"Data processing in progress"**: 며칠 후 다시 확인하고, 데이터가 나타나지 않으면 GitHub 앱이 설치되어 있는지 확인하세요

기여 지표는 GitHub Cloud와 GitHub Enterprise Server를 지원합니다.

### 요약 지표 확인

::: info
이 지표는 의도적으로 보수적이며 Claude Code의 실제 영향을 과소평가합니다. Claude Code의 관여에 대한 높은 확신이 있는 코드 줄과 PR만 집계됩니다.
:::

대시보드 상단에 다음 요약 지표가 표시됩니다:

* **PRs with CC**: Claude Code로 작성된 코드가 하나 이상 포함된 병합된 풀 리퀘스트의 총 수
* **Lines of code with CC**: Claude Code 지원으로 작성된 모든 병합된 PR의 총 코드 줄 수. 정규화 후 3자 이상인 줄만 "유효 줄"로 집계되며, 빈 줄과 괄호 또는 사소한 구두점만 있는 줄은 제외됩니다.
* **PRs with Claude Code (%)**: Claude Code 지원 코드가 포함된 병합된 PR의 비율
* **Suggestion accept rate**: Edit, Write, NotebookEdit 도구 사용을 포함하여 사용자가 Claude Code의 코드 편집 제안을 수락하는 비율
* **Lines of code accepted**: 사용자가 세션에서 수락한 Claude Code가 작성한 총 코드 줄 수. 거부된 제안은 제외되며, 이후 삭제는 추적하지 않습니다.

### 차트 탐색

대시보드에는 시간에 따른 추세를 시각화하는 여러 차트가 포함되어 있습니다.

#### 도입 현황 추적

Adoption 차트는 일일 사용 추세를 보여줍니다:

* **users**: 일일 활성 사용자
* **sessions**: 일일 활성 Claude Code 세션 수

#### 사용자당 PR 측정

이 차트는 시간에 따른 개별 개발자 활동을 표시합니다:

* **PRs per user**: 일일 병합된 PR 총 수를 일일 활성 사용자로 나눈 값
* **users**: 일일 활성 사용자

Claude Code 도입이 증가함에 따라 개별 생산성이 어떻게 변화하는지 파악하는 데 활용하세요.

#### 풀 리퀘스트 분석

Pull requests 차트는 병합된 PR의 일별 분석을 보여줍니다:

* **PRs with CC**: Claude Code 지원 코드가 포함된 풀 리퀘스트
* **PRs without CC**: Claude Code 지원 코드가 포함되지 않은 풀 리퀘스트

**Lines of code** 뷰로 전환하면 PR 수 대신 코드 줄 수 기준으로 동일한 분석을 볼 수 있습니다.

#### 상위 기여자 확인

리더보드는 기여량 기준 상위 10명의 사용자를 보여줍니다. 다음 항목 사이를 전환할 수 있습니다:

* **Pull requests**: 각 사용자의 Claude Code 포함 PR 대 전체 PR
* **Lines of code**: 각 사용자의 Claude Code 포함 줄 수 대 전체 줄 수

**Export all users**를 클릭하면 모든 사용자의 전체 기여 데이터를 CSV 파일로 다운로드할 수 있습니다. 내보내기에는 표시된 상위 10명뿐만 아니라 모든 사용자가 포함됩니다.

### PR 귀속

기여 지표가 활성화되면 Claude Code는 병합된 풀 리퀘스트를 분석하여 어떤 코드가 Claude Code 지원으로 작성되었는지 판단합니다. 이는 Claude Code 세션 활동을 각 PR의 코드와 매칭하여 수행됩니다.

#### 태깅 기준

PR은 Claude Code 세션 중에 작성된 코드가 하나 이상 포함된 경우 "with Claude Code"로 태깅됩니다. 시스템은 보수적인 매칭을 사용합니다: Claude Code의 관여에 대한 높은 확신이 있는 코드만 지원된 것으로 집계됩니다.

#### 귀속 프로세스

풀 리퀘스트가 병합되면:

1. PR diff에서 추가된 줄을 추출합니다
2. 시간 범위 내에서 매칭되는 파일을 편집한 Claude Code 세션을 식별합니다
3. 여러 전략을 사용하여 PR 줄을 Claude Code 출력과 매칭합니다
4. AI 지원 줄과 전체 줄에 대한 지표를 계산합니다

비교 전에 줄은 정규화됩니다: 공백이 트리밍되고, 여러 개의 공백이 하나로 축소되고, 따옴표가 표준화되고, 텍스트가 소문자로 변환됩니다.

Claude Code 지원 줄이 포함된 병합된 풀 리퀘스트는 GitHub에서 `claude-code-assisted` 라벨이 지정됩니다.

#### 시간 범위

PR 병합일 기준 21일 전부터 2일 후까지의 세션이 귀속 매칭에 고려됩니다.

#### 제외 파일

특정 파일은 자동 생성되므로 분석에서 자동으로 제외됩니다:

* Lock 파일: package-lock.json, yarn.lock, Cargo.lock 및 유사 파일
* 생성된 코드: Protobuf 출력, 빌드 아티팩트, 압축 파일
* 빌드 디렉터리: dist/, build/, node\_modules/, target/
* 테스트 픽스처: 스냅샷, 카세트, 모의 데이터
* 1,000자 이상의 줄 (압축되거나 생성된 파일일 가능성이 높음)

#### 귀속 참고 사항

귀속 데이터를 해석할 때 다음 세부 사항을 유의하세요:

* 개발자가 상당히 재작성한 코드 (20% 이상 차이)는 Claude Code에 귀속되지 않습니다
* 21일 범위 밖의 세션은 고려되지 않습니다
* 알고리즘은 귀속 수행 시 PR의 소스 또는 대상 브랜치를 고려하지 않습니다

### 분석 활용하기

기여 지표를 사용하여 ROI를 입증하고, 도입 패턴을 파악하며, 다른 팀원의 시작을 도울 수 있는 팀원을 찾으세요.

#### 도입 모니터링

Adoption 차트와 사용자 수를 추적하여 다음을 파악하세요:

* 모범 사례를 공유할 수 있는 활성 사용자
* 조직 전체의 도입 추세
* 마찰이나 문제를 나타낼 수 있는 사용량 감소

#### ROI 측정

기여 지표는 자체 코드베이스의 데이터로 "이 도구가 투자 대비 가치가 있는가?"라는 질문에 답하는 데 도움이 됩니다:

* 도입 증가에 따른 시간별 사용자당 PR 변화를 추적하세요
* Claude Code 사용/미사용 PR 및 코드 줄 수를 비교하세요
* [DORA 지표](https://dora.dev/), 스프린트 속도 또는 기타 엔지니어링 KPI와 함께 사용하여 Claude Code 도입으로 인한 변화를 파악하세요

#### 파워 유저 식별

리더보드를 통해 Claude Code 도입률이 높은 팀원을 찾을 수 있으며, 이들은 다음을 할 수 있습니다:

* 팀과 프롬프팅 기법 및 워크플로우 공유
* 잘 작동하는 것에 대한 피드백 제공
* 신규 사용자 온보딩 지원

#### 프로그래밍 방식으로 데이터 접근

GitHub를 통해 이 데이터를 조회하려면 `claude-code-assisted` 라벨이 지정된 PR을 검색하세요.

## API 고객을 위한 분석 접근

Claude Console을 사용하는 API 고객은 [platform.claude.com/claude-code](https://platform.claude.com/claude-code)에서 분석에 접근할 수 있습니다. 대시보드에 접근하려면 UsageView 권한이 필요하며, Developer, Billing, Admin, Owner, Primary Owner 역할에 부여됩니다.

::: info
GitHub 연동 기여 지표는 현재 API 고객에게 제공되지 않습니다. Console 대시보드에는 사용 및 비용 지표만 표시됩니다.
:::

Console 대시보드에는 다음이 표시됩니다:

* **Lines of code accepted**: 사용자가 세션에서 수락한 Claude Code가 작성한 총 코드 줄 수. 거부된 제안은 제외되며, 이후 삭제는 추적하지 않습니다.
* **Suggestion accept rate**: Edit, Write, NotebookEdit 도구 사용을 포함하여 사용자가 코드 편집 도구 사용을 수락하는 비율.
* **Activity**: 차트에 표시되는 일일 활성 사용자 및 세션 수.
* **Spend**: 사용자 수와 함께 표시되는 일일 API 비용(달러).

### 팀 인사이트 보기

팀 인사이트 테이블은 사용자별 지표를 보여줍니다:

* **Members**: Claude Code에 인증한 모든 사용자. API 키 사용자는 키 식별자로, OAuth 사용자는 이메일 주소로 표시됩니다.
* **Spend this month**: 현재 월의 사용자별 총 API 비용.
* **Lines this month**: 현재 월의 사용자별 수락된 코드 줄 총 수.

::: info
Console 대시보드의 비용 수치는 분석 목적의 추정치입니다. 실제 비용은 청구 페이지를 참조하세요.
:::

## 관련 리소스

* [OpenTelemetry로 모니터링하기](/monitoring-usage): 실시간 지표와 이벤트를 관측 스택으로 내보내기
* [효과적인 비용 관리](/costs): 지출 한도 설정 및 토큰 사용 최적화
* [권한](/permissions): 역할 및 권한 구성
