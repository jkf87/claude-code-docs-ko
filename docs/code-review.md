# 코드 리뷰

> 전체 코드베이스에 대한 멀티 에이전트 분석을 사용하여 로직 오류, 보안 취약점, 회귀 버그를 자동으로 잡아내는 PR 리뷰를 설정하세요

::: info
Code Review는 리서치 프리뷰 단계이며, [Team 및 Enterprise](https://claude.ai/admin-settings/claude-code) 구독에서 사용할 수 있습니다. [Zero Data Retention](/zero-data-retention)이 활성화된 조직에서는 사용할 수 없습니다.
:::

Code Review는 GitHub Pull Request를 분석하고 문제를 발견한 코드 라인에 인라인 코멘트로 결과를 게시합니다. 전문화된 에이전트 집단이 전체 코드베이스의 맥락에서 코드 변경 사항을 검토하며, 로직 오류, 보안 취약점, 엣지 케이스 누락, 미묘한 회귀 버그를 찾습니다.

발견 사항은 심각도별로 태그되며 PR을 승인하거나 차단하지 않으므로, 기존 리뷰 워크플로우가 그대로 유지됩니다. `CLAUDE.md` 또는 `REVIEW.md` 파일을 저장소에 추가하여 Claude가 플래그하는 항목을 조정할 수 있습니다.

자체 CI 인프라에서 Claude를 실행하려면 이 관리형 서비스 대신 [GitHub Actions](/github-actions) 또는 [GitLab CI/CD](/gitlab-ci-cd)를 참조하세요. 자체 호스팅 GitHub 인스턴스의 저장소는 [GitHub Enterprise Server](/github-enterprise-server)를 참조하세요.

이 페이지에서 다루는 내용:

* [리뷰 작동 방식](#how-reviews-work)
* [설정](#set-up-code-review)
* [`@claude review` 및 `@claude review once`로 수동 리뷰 트리거하기](#manually-trigger-reviews)
* [`CLAUDE.md` 및 `REVIEW.md`로 리뷰 커스터마이징하기](#customize-reviews)
* [요금](#pricing)
* [문제 해결](#troubleshooting) - 실패한 실행 및 누락된 코멘트

## 리뷰 작동 방식 {#how-reviews-work}

관리자가 조직에 [Code Review를 활성화](#set-up-code-review)하면, 저장소에 설정된 동작에 따라 PR이 열릴 때, 푸시할 때마다, 또는 수동 요청 시 리뷰가 트리거됩니다. `@claude review`를 코멘트하면 어떤 모드에서든 [PR에서 리뷰를 시작](#manually-trigger-reviews)할 수 있습니다.

리뷰가 실행되면 여러 에이전트가 Anthropic 인프라에서 diff와 주변 코드를 병렬로 분석합니다. 각 에이전트는 서로 다른 유형의 문제를 찾고, 검증 단계에서 실제 코드 동작과 비교하여 오탐을 걸러냅니다. 결과는 중복 제거되고 심각도별로 정렬되어 문제가 발견된 특정 라인에 인라인 코멘트로 게시됩니다. 문제가 발견되지 않으면 Claude가 PR에 짧은 확인 코멘트를 게시합니다.

리뷰는 PR 크기와 복잡도에 따라 비용이 증가하며, 평균 20분 내에 완료됩니다. 관리자는 [분석 대시보드](#view-usage)를 통해 리뷰 활동과 지출을 모니터링할 수 있습니다.

### 심각도 수준 {#severity-levels}

각 발견 사항에는 심각도 수준이 태그됩니다:

| 마커 | 심각도 | 의미 |
| :----- | :----------- | :------------------------------------------------------------------ |
| 🔴 | Important | 병합 전에 수정해야 하는 버그 |
| 🟡 | Nit | 수정할 가치가 있지만 차단하지는 않는 사소한 문제 |
| 🟣 | Pre-existing | 코드베이스에 존재하지만 이 PR에서 도입되지 않은 버그 |

발견 사항에는 접을 수 있는 확장 추론 섹션이 포함되어 있어, 펼치면 Claude가 해당 문제를 플래그한 이유와 검증 방법을 확인할 수 있습니다.

### 발견 사항 평가 및 답변 {#rate-and-reply-to-findings}

Claude의 각 리뷰 코멘트에는 👍와 👎가 이미 첨부되어 있어 GitHub UI에서 클릭 한 번으로 평가할 수 있습니다. 발견 사항이 유용했다면 👍을, 잘못되었거나 불필요하다면 👎을 클릭하세요. Anthropic은 PR이 병합된 후 반응 수를 수집하여 리뷰어를 개선하는 데 사용합니다. 반응은 재리뷰를 트리거하거나 PR의 어떤 것도 변경하지 않습니다.

인라인 코멘트에 답변해도 Claude가 응답하거나 PR을 업데이트하지 않습니다. 발견 사항에 대응하려면 코드를 수정하고 푸시하세요. PR이 푸시 트리거 리뷰를 구독하고 있다면, 다음 실행에서 문제가 수정되었을 때 스레드가 해결됩니다. 푸시 없이 새 리뷰를 요청하려면 [최상위 PR 코멘트](#manually-trigger-reviews)로 `@claude review once`를 코멘트하세요.

### Check run 출력 {#check-run-output}

인라인 리뷰 코멘트 외에도, 각 리뷰는 CI 체크와 함께 표시되는 **Claude Code Review** check run에 내용을 채웁니다. **Details** 링크를 펼치면 모든 발견 사항의 요약을 심각도별로 정렬하여 한 곳에서 확인할 수 있습니다:

| 심각도 | File:Line | 문제 |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| 🔴 Important | `src/auth/session.ts:142` | 토큰 갱신이 로그아웃과 경쟁하여 오래된 세션이 활성 상태로 남음 |
| 🟡 Nit       | `src/auth/session.ts:88`  | `parseExpiry`가 잘못된 입력에 대해 조용히 0을 반환함 |

각 발견 사항은 **Files changed** 탭에서 관련 diff 라인에 직접 표시되는 annotation으로도 나타납니다. Important 발견 사항은 빨간색 마커로, nit은 노란색 경고로, pre-existing 버그는 회색 알림으로 렌더링됩니다. Annotation과 심각도 테이블은 인라인 리뷰 코멘트와 독립적으로 check run에 기록되므로, GitHub이 이동된 라인의 인라인 코멘트를 거부하더라도 계속 사용할 수 있습니다.

Check run은 항상 neutral 결론으로 완료되므로 브랜치 보호 규칙을 통해 병합을 차단하지 않습니다. Code Review 발견 사항에 따라 병합을 게이트하려면, 자체 CI에서 check run 출력의 심각도 분석을 읽으세요. Details 텍스트의 마지막 줄은 워크플로우에서 `gh`와 jq로 파싱할 수 있는 기계 판독 가능한 코멘트입니다:

```bash
gh api repos/OWNER/REPO/check-runs/CHECK_RUN_ID \
  --jq '.output.text | split("bughunter-severity: ")[1] | split(" -->")[0] | fromjson'
```

이 명령은 심각도별 개수가 포함된 JSON 객체를 반환합니다. 예: `{"normal": 2, "nit": 1, "pre_existing": 0}`. `normal` 키는 Important 발견 사항의 수를 나타내며, 0이 아닌 값은 Claude가 병합 전에 수정할 가치가 있는 버그를 하나 이상 발견했음을 의미합니다.

### Code Review가 검사하는 항목 {#what-code-review-checks}

기본적으로 Code Review는 정확성에 집중합니다: 프로덕션을 망가뜨릴 수 있는 버그이며, 포맷팅 선호도나 누락된 테스트 커버리지가 아닙니다. 저장소에 [가이드 파일을 추가](#customize-reviews)하여 검사 항목을 확장할 수 있습니다.

## Code Review 설정 {#set-up-code-review}

관리자가 조직에 Code Review를 한 번 활성화하고 포함할 저장소를 선택합니다.

### 1단계: Claude Code 관리자 설정 열기

[claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code)로 이동하여 Code Review 섹션을 찾으세요. Claude 조직에 대한 관리자 접근 권한과 GitHub 조직에 GitHub App을 설치할 권한이 필요합니다.

### 2단계: 설정 시작

**Setup**을 클릭합니다. GitHub App 설치 흐름이 시작됩니다.

### 3단계: Claude GitHub App 설치

안내에 따라 GitHub 조직에 Claude GitHub App을 설치합니다. 앱은 다음 저장소 권한을 요청합니다:

* **Contents**: 읽기 및 쓰기
* **Issues**: 읽기 및 쓰기
* **Pull requests**: 읽기 및 쓰기

Code Review는 contents에 대한 읽기 접근과 pull requests에 대한 쓰기 접근을 사용합니다. 더 넓은 권한 세트는 나중에 활성화할 경우 [GitHub Actions](/github-actions)도 지원합니다.

### 4단계: 저장소 선택

Code Review를 활성화할 저장소를 선택합니다. 저장소가 보이지 않으면 설치 중에 Claude GitHub App에 해당 저장소 접근 권한을 부여했는지 확인하세요. 나중에 저장소를 더 추가할 수 있습니다.

### 5단계: 저장소별 리뷰 트리거 설정

설정이 완료되면 Code Review 섹션에 저장소가 테이블로 표시됩니다. 각 저장소에 대해 **Review Behavior** 드롭다운을 사용하여 리뷰 실행 시점을 선택합니다:

* **Once after PR creation**: PR이 열리거나 리뷰 준비 완료로 표시될 때 한 번 리뷰 실행
* **After every push**: PR 브랜치에 푸시할 때마다 리뷰 실행, PR이 발전하면서 새로운 문제를 잡고 플래그된 문제를 수정하면 스레드를 자동 해결
* **Manual**: 누군가 PR에 [`@claude review` 또는 `@claude review once`를 코멘트](#manually-trigger-reviews)할 때만 리뷰 시작; `@claude review`는 이후 푸시에 대한 리뷰도 구독

매 푸시마다 리뷰하면 가장 많은 리뷰가 실행되고 비용이 가장 많이 듭니다. Manual 모드는 트래픽이 많은 저장소에서 특정 PR만 리뷰에 옵트인하거나, PR이 준비되었을 때만 리뷰를 시작하려는 경우에 유용합니다.

저장소 테이블은 최근 활동을 기반으로 각 저장소의 리뷰당 평균 비용도 표시합니다. 행 작업 메뉴를 사용하여 저장소별로 Code Review를 켜거나 끄거나, 저장소를 완전히 제거할 수 있습니다.

설정을 확인하려면 테스트 PR을 열어보세요. 자동 트리거를 선택했다면 몇 분 내에 **Claude Code Review**라는 check run이 나타납니다. Manual을 선택했다면 PR에 `@claude review`를 코멘트하여 첫 번째 리뷰를 시작하세요. Check run이 나타나지 않으면 관리자 설정에 저장소가 나열되어 있고 Claude GitHub App이 해당 저장소에 접근할 수 있는지 확인하세요.

## 수동으로 리뷰 트리거하기 {#manually-trigger-reviews}

두 가지 코멘트 명령으로 요청 시 리뷰를 시작할 수 있습니다. 둘 다 저장소의 설정된 트리거와 관계없이 작동하므로, Manual 모드에서 특정 PR을 리뷰에 옵트인하거나 다른 모드에서 즉시 재리뷰를 받을 수 있습니다.

| 명령 | 동작 |
| :-------------------- | :---------------------------------------------------------------------------- |
| `@claude review`      | 리뷰를 시작하고 이후 푸시 트리거 리뷰에 PR을 구독 |
| `@claude review once` | 이후 푸시에 PR을 구독하지 않고 단일 리뷰를 시작 |

`@claude review once`는 PR의 현재 상태에 대한 피드백을 원하지만 이후 모든 푸시마다 리뷰가 발생하는 것을 원하지 않을 때 사용합니다. 이는 푸시가 빈번한 장기 실행 PR이나, PR의 리뷰 동작을 변경하지 않고 일회성 의견을 원할 때 유용합니다.

두 명령 모두 리뷰를 트리거하려면:

* diff 라인의 인라인 코멘트가 아닌 최상위 PR 코멘트로 게시
* 코멘트 시작 부분에 명령을 배치하고, one-shot 형식을 사용하는 경우 `once`를 같은 줄에 배치
* 저장소에 대한 owner, member 또는 collaborator 접근 권한이 필요
* PR이 열려 있어야 함

자동 트리거와 달리 수동 트리거는 draft PR에서도 실행됩니다. 명시적 요청은 draft 상태와 관계없이 지금 리뷰를 원한다는 것을 나타내기 때문입니다.

해당 PR에서 이미 리뷰가 실행 중이면 진행 중인 리뷰가 완료될 때까지 요청이 대기열에 들어갑니다. PR의 check run을 통해 진행 상황을 모니터링할 수 있습니다.

## 리뷰 커스터마이징 {#customize-reviews}

Code Review는 저장소에서 두 개의 파일을 읽어 플래그할 항목을 안내합니다. 둘 다 기본 정확성 검사 위에 추가됩니다:

* **`CLAUDE.md`**: Claude Code가 리뷰뿐만 아니라 모든 작업에 사용하는 공유 프로젝트 지침입니다. 대화형 Claude Code 세션에도 적용되는 안내에 사용하세요.
* **`REVIEW.md`**: 코드 리뷰 중에만 읽히는 리뷰 전용 안내입니다. 리뷰 중에 플래그하거나 건너뛸 항목에 대한 규칙으로, 일반 `CLAUDE.md`를 어지럽히지 않으려 할 때 사용하세요.

### CLAUDE.md

Code Review는 저장소의 `CLAUDE.md` 파일을 읽고 새로 도입된 위반 사항을 nit 수준의 발견 사항으로 처리합니다. 이는 양방향으로 작동합니다: PR이 `CLAUDE.md`의 내용을 구식으로 만드는 방식으로 코드를 변경하면, Claude가 문서도 업데이트해야 한다고 플래그합니다.

Claude는 디렉토리 계층의 모든 수준에서 `CLAUDE.md` 파일을 읽으므로, 하위 디렉토리의 `CLAUDE.md` 규칙은 해당 경로 아래의 파일에만 적용됩니다. `CLAUDE.md` 작동 방식에 대한 자세한 내용은 [메모리 문서](/memory)를 참조하세요.

일반 Claude Code 세션에는 적용하지 않고 리뷰에만 적용할 안내는 [`REVIEW.md`](#review-md)를 대신 사용하세요.

### REVIEW\.md

저장소 루트에 `REVIEW.md` 파일을 추가하여 리뷰 전용 규칙을 설정하세요. 다음을 인코딩하는 데 사용합니다:

* 회사 또는 팀 스타일 가이드라인: "중첩 조건문보다 조기 반환을 선호"
* 린터가 다루지 않는 언어 또는 프레임워크별 규칙
* Claude가 항상 플래그해야 할 항목: "모든 새 API 라우트에 통합 테스트가 있어야 함"
* Claude가 건너뛰어야 할 항목: "`/gen/` 아래 생성된 코드의 포맷팅에 대해 코멘트하지 않음"

`REVIEW.md` 예시:

```markdown
# Code Review Guidelines

## Always check
- New API endpoints have corresponding integration tests
- Database migrations are backward-compatible
- Error messages don't leak internal details to users

## Style
- Prefer `match` statements over chained `isinstance` checks
- Use structured logging, not f-string interpolation in log calls

## Skip
- Generated files under `src/gen/`
- Formatting-only changes in `*.lock` files
```

Claude는 저장소 루트의 `REVIEW.md`를 자동으로 검색합니다. 별도의 설정이 필요하지 않습니다.

## 사용량 확인 {#view-usage}

[claude.ai/analytics/code-review](https://claude.ai/analytics/code-review)로 이동하여 조직 전체의 Code Review 활동을 확인하세요. 대시보드는 다음을 표시합니다:

| 섹션 | 표시 내용 |
| :------------------- | :--------------------------------------------------------------------------------------- |
| PRs reviewed         | 선택한 기간 동안 리뷰된 pull request의 일일 수 |
| Cost weekly          | Code Review의 주간 지출 |
| Feedback             | 개발자가 문제를 해결하여 자동 해결된 리뷰 코멘트 수 |
| Repository breakdown | 저장소별 리뷰된 PR 수와 해결된 코멘트 수 |

관리자 설정의 저장소 테이블에도 각 저장소의 리뷰당 평균 비용이 표시됩니다.

## 요금 {#pricing}

Code Review는 토큰 사용량에 따라 과금됩니다. 각 리뷰의 평균 비용은 $15-25이며, PR 크기, 코드베이스 복잡도, 검증이 필요한 문제 수에 따라 달라집니다. Code Review 사용량은 [추가 사용량](https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans)을 통해 별도로 청구되며, 플랜에 포함된 사용량에는 포함되지 않습니다.

선택한 리뷰 트리거에 따라 총 비용이 달라집니다:

* **Once after PR creation**: PR당 한 번 실행
* **After every push**: 푸시할 때마다 실행, 푸시 횟수에 따라 비용이 곱해짐
* **Manual**: 누군가 PR에 `@claude review`를 코멘트할 때까지 리뷰 없음

모든 모드에서 `@claude review`를 코멘트하면 [PR이 푸시 트리거 리뷰에 구독](#manually-trigger-reviews)되므로, 해당 코멘트 이후 푸시마다 추가 비용이 발생합니다. 이후 푸시에 구독하지 않고 단일 리뷰만 실행하려면 `@claude review once`를 코멘트하세요.

조직이 다른 Claude Code 기능에 AWS Bedrock이나 Google Vertex AI를 사용하는지 여부와 관계없이 비용은 Anthropic 청구서에 표시됩니다. Code Review의 월별 지출 한도를 설정하려면 [claude.ai/admin-settings/usage](https://claude.ai/admin-settings/usage)로 이동하여 Claude Code Review 서비스의 한도를 설정하세요.

[분석](#view-usage)의 주간 비용 차트 또는 관리자 설정의 저장소별 평균 비용 컬럼을 통해 지출을 모니터링하세요.

## 문제 해결 {#troubleshooting}

리뷰 실행은 최선 노력(best-effort) 방식입니다. 실패한 실행은 PR을 차단하지 않지만 자동으로 재시도하지도 않습니다. 이 섹션에서는 실패한 실행에서 복구하는 방법과 check run이 찾을 수 없는 문제를 보고할 때 어디를 확인해야 하는지 다룹니다.

### 실패하거나 타임아웃된 리뷰 다시 트리거하기

리뷰 인프라에서 내부 오류가 발생하거나 시간 제한을 초과하면, check run은 **Code review encountered an error** 또는 **Code review timed out**이라는 제목으로 완료됩니다. 결론은 여전히 neutral이므로 병합을 차단하지 않지만, 발견 사항이 게시되지 않습니다.

리뷰를 다시 실행하려면 PR에 `@claude review once`를 코멘트하세요. 이후 푸시에 PR을 구독하지 않고 새로운 리뷰를 시작합니다. PR이 이미 푸시 트리거 리뷰에 구독되어 있다면, 새 커밋을 푸시해도 새 리뷰가 시작됩니다.

GitHub의 Checks 탭에 있는 **Re-run** 버튼은 Code Review를 다시 트리거하지 않습니다. 코멘트 명령이나 새 푸시를 대신 사용하세요.

### 인라인 코멘트로 표시되지 않는 문제 찾기

Check run 제목에 문제가 발견되었다고 표시되지만 diff에서 인라인 리뷰 코멘트가 보이지 않으면, 발견 사항이 표시되는 다른 위치를 확인하세요:

* **Check run Details**: Checks 탭에서 Claude Code Review 체크 옆의 **Details**를 클릭합니다. 심각도 테이블은 인라인 코멘트 수락 여부와 관계없이 모든 발견 사항을 파일, 라인, 요약과 함께 나열합니다.
* **Files changed annotations**: PR의 **Files changed** 탭을 엽니다. 발견 사항은 리뷰 코멘트와 별도로 diff 라인에 직접 첨부된 annotation으로 렌더링됩니다.
* **Review body**: 리뷰가 실행 중일 때 PR에 푸시하면, 일부 발견 사항이 현재 diff에 더 이상 존재하지 않는 라인을 참조할 수 있습니다. 이러한 사항은 인라인 코멘트 대신 리뷰 본문의 **Additional findings** 제목 아래에 나타납니다.

## 관련 리소스

Code Review는 Claude Code의 나머지 기능과 함께 작동하도록 설계되었습니다. PR을 열기 전에 로컬에서 리뷰를 실행하거나, 자체 호스팅 설정이 필요하거나, `CLAUDE.md`가 도구 전반에서 Claude의 동작을 어떻게 형성하는지 자세히 알고 싶다면 다음 페이지를 참조하세요:

* [플러그인](/discover-plugins): 플러그인 마켓플레이스를 탐색하세요. 푸시 전에 로컬에서 온디맨드 리뷰를 실행하기 위한 `code-review` 플러그인도 포함되어 있습니다
* [GitHub Actions](/github-actions): 코드 리뷰를 넘어 커스텀 자동화를 위해 자체 GitHub Actions 워크플로우에서 Claude를 실행하세요
* [GitLab CI/CD](/gitlab-ci-cd): GitLab 파이프라인용 자체 호스팅 Claude 통합
* [메모리](/memory): Claude Code 전반에서 `CLAUDE.md` 파일이 작동하는 방식
* [분석](/analytics): 코드 리뷰를 넘어 Claude Code 사용량 추적
