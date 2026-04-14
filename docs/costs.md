---
title: 비용 효과적으로 관리하기
description: "토큰 사용량 추적, 팀 지출 한도 설정, 컨텍스트 관리·모델 선택·확장 사고 설정·전처리 Hooks를 통한 Claude Code 비용 절감"
---

# 비용 효과적으로 관리하기

Claude Code는 API 토큰 소비량에 따라 요금이 부과됩니다. 구독 플랜 가격(Pro, Max, Team, Enterprise)은 [claude.com/pricing](https://claude.com/pricing)을 참조하세요. 개발자별 비용은 모델 선택, 코드베이스 크기, 여러 인스턴스 실행이나 자동화 같은 사용 패턴에 따라 크게 달라집니다.

엔터프라이즈 배포 전반에서 평균 비용은 개발자당 활동일 기준 약 $13, 월 기준 $150-250이며, 90%의 사용자가 활동일 기준 $30 미만을 유지합니다. 팀의 지출을 예측하려면 소규모 파일럿 그룹으로 시작하고 아래 추적 도구를 사용하여 광범위한 도입 전에 기준선을 설정하세요.

이 페이지에서는 [비용 추적](#비용-추적), [팀 비용 관리](#팀-비용-관리), [토큰 사용량 줄이기](#토큰-사용량-줄이기)를 다룹니다.

## 비용 추적

### `/cost` 명령어 사용하기

::: info
`/cost` 명령어는 API 토큰 사용량을 보여주며 API 사용자를 위한 것입니다. Claude Max 및 Pro 구독자는 구독에 사용량이 포함되어 있으므로 `/cost` 데이터는 청구 목적과 관련이 없습니다. 구독자는 `/stats`를 사용하여 사용 패턴을 확인할 수 있습니다.
:::

`/cost` 명령어는 현재 세션의 상세한 토큰 사용 통계를 제공합니다:

```text
Total cost:            $0.55
Total duration (API):  6m 19.7s
Total duration (wall): 6h 33m 10.2s
Total code changes:    0 lines added, 0 lines removed
```

## 팀 비용 관리

Claude API를 사용할 때, Claude Code 워크스페이스 전체 지출에 대해 [워크스페이스 지출 한도를 설정](https://platform.claude.com/docs/en/build-with-claude/workspaces#workspace-limits)할 수 있습니다. 관리자는 Console에서 [비용 및 사용 보고서를 확인](https://platform.claude.com/docs/en/build-with-claude/workspaces#usage-and-cost-tracking)할 수 있습니다.

::: info
Claude Code를 Claude Console 계정으로 처음 인증하면 "Claude Code"라는 워크스페이스가 자동으로 생성됩니다. 이 워크스페이스는 조직 내 모든 Claude Code 사용에 대한 중앙 집중식 비용 추적 및 관리를 제공합니다. 이 워크스페이스에 대한 API 키는 생성할 수 없으며, Claude Code 인증 및 사용 전용입니다.

커스텀 속도 제한이 있는 조직의 경우, 이 워크스페이스의 Claude Code 트래픽은 조직의 전체 API 속도 제한에 포함됩니다. Claude Console의 이 워크스페이스 Limits 페이지에서 [워크스페이스 속도 제한](https://platform.claude.com/docs/en/api/rate-limits#setting-lower-limits-for-workspaces)을 설정하여 Claude Code의 점유율을 제한하고 다른 프로덕션 워크로드를 보호할 수 있습니다.
:::

Bedrock, Vertex, Foundry에서는 Claude Code가 클라우드에서 메트릭을 전송하지 않습니다. 비용 메트릭을 얻기 위해 여러 대기업에서 [LiteLLM](/llm-gateway#litellm-configuration)을 사용한다고 보고했으며, 이는 기업이 [키별 지출을 추적](https://docs.litellm.ai/docs/proxy/virtual_keys#tracking-spend)하는 데 도움이 되는 오픈소스 도구입니다. 이 프로젝트는 Anthropic과 관련이 없으며 보안 감사를 받지 않았습니다.

### 속도 제한 권장 사항

팀에 Claude Code를 설정할 때, 조직 규모에 따른 사용자별 TPM(Token Per Minute) 및 RPM(Request Per Minute) 권장 사항을 고려하세요:

| 팀 규모 | 사용자별 TPM | 사용자별 RPM |
| ------------- | ------------ | ------------ |
| 1-5명 | 200k-300k | 5-7 |
| 5-20명 | 100k-150k | 2.5-3.5 |
| 20-50명 | 50k-75k | 1.25-1.75 |
| 50-100명 | 25k-35k | 0.62-0.87 |
| 100-500명 | 15k-20k | 0.37-0.47 |
| 500명 이상 | 10k-15k | 0.25-0.35 |

예를 들어, 200명의 사용자가 있다면 각 사용자에게 20k TPM을 요청할 수 있으며, 총 400만 TPM(200\*20,000 = 400만)이 됩니다.

사용자별 TPM은 팀 규모가 커질수록 감소하는데, 이는 대규모 조직에서 동시에 Claude Code를 사용하는 사용자 수가 적기 때문입니다. 이러한 속도 제한은 개별 사용자가 아닌 조직 수준에서 적용되므로, 다른 사용자가 활발히 사용하지 않을 때 개별 사용자가 계산된 할당량보다 일시적으로 더 많이 사용할 수 있습니다.

::: info
비정상적으로 높은 동시 사용이 예상되는 시나리오(예: 대규모 그룹의 라이브 교육 세션)에서는 사용자별 TPM 할당이 더 높아야 할 수 있습니다.
:::

### Agent 팀 토큰 비용

[Agent 팀](/agent-teams)은 여러 Claude Code 인스턴스를 생성하며, 각각 고유한 컨텍스트 윈도우를 가집니다. 토큰 사용량은 활성 팀원 수와 각 팀원의 실행 시간에 비례하여 증가합니다.

Agent 팀 비용을 관리하려면:

* 팀원에게 Sonnet을 사용하세요. 조정 작업에 대해 성능과 비용의 균형을 잡습니다.
* 팀을 작게 유지하세요. 각 팀원이 자체 컨텍스트 윈도우를 실행하므로 토큰 사용량은 대략 팀 크기에 비례합니다.
* 스폰 프롬프트를 집중적으로 유지하세요. 팀원은 CLAUDE.md, MCP 서버, Skills을 자동으로 로드하지만, 스폰 프롬프트의 모든 내용은 처음부터 컨텍스트에 추가됩니다.
* 작업이 완료되면 팀을 정리하세요. 활성 팀원은 유휴 상태여도 계속 토큰을 소비합니다.
* Agent 팀은 기본적으로 비활성화되어 있습니다. [settings.json](/settings)이나 환경 변수에서 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`을 설정하여 활성화하세요. [Agent 팀 활성화](/agent-teams#enable-agent-teams)를 참조하세요.

## 토큰 사용량 줄이기

토큰 비용은 컨텍스트 크기에 비례합니다: Claude가 처리하는 컨텍스트가 많을수록 더 많은 토큰을 사용합니다. Claude Code는 프롬프트 캐싱(시스템 프롬프트 같은 반복 콘텐츠의 비용을 줄임)과 자동 압축(컨텍스트 한도에 가까워지면 대화 히스토리를 요약)을 통해 비용을 자동으로 최적화합니다.

다음 전략은 컨텍스트를 작게 유지하고 메시지당 비용을 줄이는 데 도움이 됩니다.

### 컨텍스트를 능동적으로 관리하기

`/cost`를 사용하여 현재 토큰 사용량을 확인하거나, [상태 표시줄을 구성](/statusline#context-window-usage)하여 지속적으로 표시할 수 있습니다.

* **작업 간 초기화**: 관련 없는 작업으로 전환할 때 `/clear`를 사용하여 새로 시작하세요. 오래된 컨텍스트는 이후 모든 메시지에서 토큰을 낭비합니다. 초기화 전에 `/rename`을 사용하면 나중에 세션을 쉽게 찾을 수 있고, `/resume`으로 돌아갈 수 있습니다.
* **커스텀 압축 지시 추가**: `/compact 코드 샘플과 API 사용법에 집중`은 요약 시 무엇을 보존할지 Claude에게 알려줍니다.

CLAUDE.md에서도 압축 동작을 커스터마이즈할 수 있습니다:

```markdown
# Compact instructions

When you are using compact, please focus on test output and code changes
```

### 적절한 모델 선택

Sonnet은 대부분의 코딩 작업을 잘 처리하며 Opus보다 비용이 적습니다. 복잡한 아키텍처 결정이나 다단계 추론에는 Opus를 사용하세요. `/model`로 세션 중 모델을 전환하거나, `/config`에서 기본값을 설정하세요. 간단한 서브에이전트 작업에는 [서브에이전트 구성](/sub-agents#choose-a-model)에서 `model: haiku`를 지정하세요.

### MCP 서버 오버헤드 줄이기

MCP 도구 정의는 [기본적으로 지연 로드](/mcp#scale-with-mcp-tool-search)되므로, Claude가 특정 도구를 사용할 때까지 도구 이름만 컨텍스트에 들어갑니다. `/context`를 실행하여 무엇이 공간을 차지하는지 확인하세요.

* **가능하면 CLI 도구를 선호하세요**: `gh`, `aws`, `gcloud`, `sentry-cli` 같은 도구는 도구별 목록을 추가하지 않으므로 MCP 서버보다 더 컨텍스트 효율적입니다. Claude는 CLI 명령을 직접 실행할 수 있습니다.
* **사용하지 않는 서버 비활성화**: `/mcp`를 실행하여 구성된 서버를 확인하고 활발히 사용하지 않는 서버를 비활성화하세요.

### 타입 언어용 코드 인텔리전스 플러그인 설치

[코드 인텔리전스 플러그인](/discover-plugins#code-intelligence)은 텍스트 기반 검색 대신 정확한 심볼 탐색을 제공하여, 익숙하지 않은 코드를 탐색할 때 불필요한 파일 읽기를 줄입니다. 단일 "정의로 이동" 호출이 grep 후 여러 후보 파일을 읽는 것을 대체합니다. 설치된 언어 서버는 편집 후 자동으로 타입 오류를 보고하므로 Claude가 컴파일러를 실행하지 않고도 실수를 잡습니다.

### 처리를 Hooks와 Skills로 오프로드

커스텀 [Hooks](/hooks)는 Claude가 보기 전에 데이터를 전처리할 수 있습니다. Claude가 오류를 찾기 위해 10,000줄 로그 파일을 읽는 대신, Hook이 `ERROR`를 grep하여 일치하는 줄만 반환하면 컨텍스트를 수만 토큰에서 수백 토큰으로 줄일 수 있습니다.

[Skill](/skills)은 Claude에게 도메인 지식을 제공하여 탐색할 필요를 없앨 수 있습니다. 예를 들어, "codebase-overview" Skill은 프로젝트의 아키텍처, 주요 디렉토리, 명명 규칙을 설명할 수 있습니다. Claude가 Skill을 호출하면 구조를 이해하기 위해 여러 파일을 읽는 데 토큰을 소비하는 대신 즉시 이 컨텍스트를 얻습니다.

예를 들어, 이 PreToolUse Hook은 테스트 출력을 필터링하여 실패만 표시합니다:

**settings.json**

[settings.json](/settings#settings-files)에 다음을 추가하여 모든 Bash 명령 전에 Hook을 실행합니다:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/filter-test-output.sh"
          }
        ]
      }
    ]
  }
}
```

**filter-test-output.sh**

Hook은 이 스크립트를 호출하며, 명령이 테스트 러너인지 확인하고 실패만 표시하도록 수정합니다:

```bash
#!/bin/bash
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')

# If running tests, filter to show only failures
if [[ "$cmd" =~ ^(npm test|pytest|go test) ]]; then
  filtered_cmd="$cmd 2>&1 | grep -A 5 -E '(FAIL|ERROR|error:)' | head -100"
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\",\"updatedInput\":{\"command\":\"$filtered_cmd\"}}}"
else
  echo "{}"
fi
```

### CLAUDE.md에서 Skills로 지시 이동

[CLAUDE.md](/memory) 파일은 세션 시작 시 컨텍스트에 로드됩니다. 특정 워크플로(예: PR 리뷰나 데이터베이스 마이그레이션)에 대한 상세 지시가 포함되어 있으면, 관련 없는 작업을 할 때도 해당 토큰이 존재합니다. [Skills](/skills)는 호출될 때만 온디맨드로 로드되므로, 특수 지시를 Skills로 이동하면 기본 컨텍스트가 작아집니다. 필수 사항만 포함하여 CLAUDE.md를 200줄 미만으로 유지하는 것을 목표로 하세요.

### 확장 사고 조정

확장 사고는 복잡한 계획 및 추론 작업에서 성능을 크게 향상시키므로 기본적으로 활성화되어 있습니다. 사고 토큰은 출력 토큰으로 청구되며, 기본 예산은 모델에 따라 요청당 수만 토큰이 될 수 있습니다. 깊은 추론이 필요 없는 간단한 작업의 경우, `/effort`나 `/model`에서 [노력 수준](/model-config#adjust-effort-level)을 낮추거나, `/config`에서 사고를 비활성화하거나, `MAX_THINKING_TOKENS=8000`으로 예산을 낮추어 비용을 줄일 수 있습니다.

### 상세 작업을 서브에이전트에 위임

테스트 실행, 문서 가져오기, 로그 파일 처리는 상당한 컨텍스트를 소비할 수 있습니다. [서브에이전트](/sub-agents#isolate-high-volume-operations)에 위임하면 상세 출력은 서브에이전트의 컨텍스트에 남고 요약만 메인 대화로 돌아옵니다.

### Agent 팀 비용 관리

Agent 팀은 팀원이 Plan 모드로 실행될 때 표준 세션보다 약 7배 더 많은 토큰을 사용합니다. 각 팀원이 자체 컨텍스트 윈도우를 유지하고 별도의 Claude 인스턴스로 실행되기 때문입니다. 팀원별 토큰 사용량을 제한하려면 팀 작업을 작고 자체적으로 완결되도록 유지하세요. 자세한 내용은 [Agent 팀](/agent-teams)을 참조하세요.

### 구체적인 프롬프트 작성

"이 코드베이스를 개선해"와 같은 모호한 요청은 광범위한 스캔을 유발합니다. "auth.ts의 로그인 함수에 입력 유효성 검사를 추가해"와 같은 구체적인 요청은 Claude가 최소한의 파일 읽기로 효율적으로 작업할 수 있게 합니다.

### 복잡한 작업에서 효율적으로 작업하기

더 길거나 복잡한 작업의 경우, 다음 습관이 잘못된 방향으로 진행하여 토큰을 낭비하는 것을 방지합니다:

* **복잡한 작업에 Plan 모드 사용**: 구현 전에 Shift+Tab을 눌러 [Plan 모드](/common-workflows#use-plan-mode-for-safe-code-analysis)로 들어가세요. Claude가 코드베이스를 탐색하고 승인을 위한 접근 방식을 제안하여, 초기 방향이 잘못되었을 때 비용이 많이 드는 재작업을 방지합니다.
* **일찍 방향 수정**: Claude가 잘못된 방향으로 진행하기 시작하면 Escape를 눌러 즉시 중지하세요. `/rewind`를 사용하거나 Escape를 두 번 눌러 대화와 코드를 이전 체크포인트로 복원하세요.
* **검증 대상 제공**: 프롬프트에 테스트 케이스, 스크린샷 붙여넣기, 예상 출력을 포함하세요. Claude가 자체 작업을 검증할 수 있으면 수정을 요청하기 전에 문제를 잡습니다.
* **점진적 테스트**: 파일 하나를 작성하고 테스트한 다음 계속하세요. 수정 비용이 적을 때 문제를 조기에 발견합니다.

## 백그라운드 토큰 사용

Claude Code는 유휴 상태에서도 일부 백그라운드 기능에 토큰을 사용합니다:

* **대화 요약**: `claude --resume` 기능을 위해 이전 대화를 요약하는 백그라운드 작업
* **명령 처리**: `/cost` 같은 일부 명령이 상태 확인을 위해 요청을 생성할 수 있습니다

이러한 백그라운드 프로세스는 활발한 상호작용 없이도 소량의 토큰(일반적으로 세션당 $0.04 미만)을 소비합니다.

## Claude Code 동작 변경 이해하기

Claude Code는 비용 보고를 포함하여 기능 작동 방식을 변경할 수 있는 업데이트를 정기적으로 받습니다. `claude --version`을 실행하여 현재 버전을 확인하세요. 특정 청구 질문은 [Console 계정](https://platform.claude.com/login)을 통해 Anthropic 지원팀에 문의하세요.
