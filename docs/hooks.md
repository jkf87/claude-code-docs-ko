---
title: Hooks 레퍼런스
description: "Claude Code hook 이벤트, 구성 스키마, JSON 입출력 형식, exit code, async hook, HTTP hook, prompt hook, MCP tool hook에 대한 레퍼런스입니다."
---

# Hooks 레퍼런스

::: tip
빠른 시작 가이드와 예제는 [Hook으로 워크플로우 자동화하기](/hooks-guide)를 참조하세요.
:::

Hook은 Claude Code의 수명주기에서 특정 시점에 자동으로 실행되는 사용자 정의 셸 명령, HTTP 엔드포인트 또는 LLM prompt입니다. 이 레퍼런스를 사용하여 이벤트 스키마, 구성 옵션, JSON 입출력 형식, async hook, HTTP hook, MCP tool hook과 같은 고급 기능을 찾아보세요. Hook을 처음 설정하는 경우 [가이드](/hooks-guide)부터 시작하세요.

## Hook 수명주기

Hook은 Claude Code 세션 중 특정 시점에 실행됩니다. 이벤트가 발생하고 matcher가 일치하면, Claude Code는 이벤트에 대한 JSON 컨텍스트를 hook handler에 전달합니다. command hook의 경우 입력은 stdin으로 도착합니다. HTTP hook의 경우 POST 요청 본문으로 도착합니다. handler는 입력을 검사하고, 작업을 수행하고, 선택적으로 결정을 반환할 수 있습니다. 이벤트는 세 가지 주기로 분류됩니다: 세션당 한 번(`SessionStart`, `SessionEnd`), 턴당 한 번(`UserPromptSubmit`, `Stop`, `StopFailure`), 그리고 에이전트 루프 내의 모든 tool call마다(`PreToolUse`, `PostToolUse`):

<img src="https://mintcdn.com/claude-code/UMJp-WgTWngzO609/images/hooks-lifecycle.svg?fit=max&auto=format&n=UMJp-WgTWngzO609&q=85&s=3f4de67df216c87dc313943b32c15f62" alt="Hook 수명주기 다이어그램: SessionStart, 턴별 루프(UserPromptSubmit, 중첩 에이전트 루프(PreToolUse, PermissionRequest, PostToolUse, SubagentStart/Stop, TaskCreated, TaskCompleted)), Stop 또는 StopFailure, TeammateIdle, PreCompact, PostCompact, SessionEnd 포함" width="520" height="1155" />

아래 표는 각 이벤트가 언제 실행되는지 요약합니다. [Hook 이벤트](#hook-이벤트) 섹션에서 각 이벤트의 전체 입력 스키마와 결정 제어 옵션을 설명합니다.

| Event                | 실행 시점                                                                                                                                          |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`       | 세션이 시작되거나 재개될 때                                                                                                                       |
| `UserPromptSubmit`   | prompt를 제출하면 Claude가 처리하기 전에 실행                                                                                                   |
| `PreToolUse`         | tool call이 실행되기 전. 차단 가능                                                                                                              |
| `PermissionRequest`  | 권한 대화상자가 표시될 때                                                                                                                       |
| `PermissionDenied`   | auto mode classifier에 의해 tool call이 거부될 때. `{retry: true}`를 반환하면 모델이 거부된 tool call을 재시도할 수 있음을 알림                     |
| `PostToolUse`        | tool call이 성공한 후                                                                                                                             |
| `PostToolUseFailure` | tool call이 실패한 후                                                                                                                             |
| `Notification`       | Claude Code가 알림을 보낼 때                                                                                                                      |
| `SubagentStart`      | subagent가 생성될 때                                                                                                                               |
| `SubagentStop`       | subagent가 완료될 때                                                                                                                               |
| `TaskCreated`        | `TaskCreate`를 통해 task가 생성될 때                                                                                                              |
| `TaskCompleted`      | task가 완료로 표시될 때                                                                                                                           |
| `Stop`               | Claude가 응답을 완료할 때                                                                                                                         |
| `StopFailure`        | API 오류로 턴이 종료될 때. 출력과 exit code는 무시됨                                                                                             |
| `TeammateIdle`       | [agent team](/agent-teams) 팀원이 유휴 상태로 전환하려 할 때                                                                                     |
| `InstructionsLoaded` | CLAUDE.md 또는 `.claude/rules/*.md` 파일이 컨텍스트에 로드될 때. 세션 시작 시와 세션 중 파일이 지연 로드될 때 실행                               |
| `ConfigChange`       | 세션 중 구성 파일이 변경될 때                                                                                                                     |
| `CwdChanged`         | 작업 디렉토리가 변경될 때, 예를 들어 Claude가 `cd` 명령을 실행할 때. direnv 같은 도구를 사용한 반응형 환경 관리에 유용                             |
| `FileChanged`        | 감시 중인 파일이 디스크에서 변경될 때. `matcher` 필드로 감시할 파일명을 지정                                                                     |
| `WorktreeCreate`     | `--worktree` 또는 `isolation: "worktree"`를 통해 worktree가 생성될 때. 기본 git 동작을 대체                                                       |
| `WorktreeRemove`     | 세션 종료 시 또는 subagent가 완료될 때 worktree가 제거될 때                                                                                       |
| `PreCompact`         | 컨텍스트 압축 전                                                                                                                                   |
| `PostCompact`        | 컨텍스트 압축 완료 후                                                                                                                               |
| `Elicitation`        | MCP 서버가 tool call 중 사용자 입력을 요청할 때                                                                                                   |
| `ElicitationResult`  | 사용자가 MCP elicitation에 응답한 후, 응답이 서버로 다시 전송되기 전                                                                               |
| `SessionEnd`         | 세션이 종료될 때                                                                                                                                   |

### Hook이 해석되는 방식

이러한 구성 요소가 어떻게 결합되는지 보기 위해, 파괴적인 셸 명령을 차단하는 `PreToolUse` hook을 살펴보겠습니다. `matcher`는 Bash tool call로 범위를 좁히고, `if` 조건은 `rm`으로 시작하는 명령으로 추가로 좁힙니다. 따라서 `block-rm.sh`는 두 필터가 모두 일치할 때만 생성됩니다:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

스크립트는 stdin에서 JSON 입력을 읽고, 명령을 추출한 후, `rm -rf`가 포함되어 있으면 `permissionDecision`을 `"deny"`로 반환합니다:

```bash
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # allow the command
fi
```

이제 Claude Code가 `Bash "rm -rf /tmp/build"`를 실행하기로 결정했다고 가정합니다. 다음과 같은 일이 발생합니다:

<img src="https://mintcdn.com/claude-code/-tYw1BD_DEqfyyOZ/images/hook-resolution.svg?fit=max&auto=format&n=-tYw1BD_DEqfyyOZ&q=85&s=c73ebc1eeda2037570427d7af1e0a891" alt="Hook 해석 흐름: PreToolUse 이벤트 발생, matcher가 Bash 일치 확인, if 조건이 Bash(rm *) 일치 확인, hook handler 실행, 결과를 Claude Code에 반환" width="930" height="290" />

### 1단계: 이벤트 발생

`PreToolUse` 이벤트가 실행됩니다. Claude Code는 hook에 stdin으로 tool 입력을 JSON으로 전송합니다:

```json
{ "tool_name": "Bash", "tool_input": { "command": "rm -rf /tmp/build" }, ... }
```

### 2단계: Matcher 확인

matcher `"Bash"`가 tool 이름과 일치하므로 이 hook 그룹이 활성화됩니다. matcher를 생략하거나 `"*"`를 사용하면, 이벤트의 모든 발생에서 그룹이 활성화됩니다.

### 3단계: If 조건 확인

`if` 조건 `"Bash(rm *)"`가 명령이 `rm`으로 시작하므로 일치하여 이 handler가 생성됩니다. 명령이 `npm test`였다면 `if` 검사가 실패하고 `block-rm.sh`는 실행되지 않아 프로세스 생성 오버헤드를 피합니다. `if` 필드는 선택 사항이며, 없으면 일치한 그룹의 모든 handler가 실행됩니다.

### 4단계: Hook handler 실행

스크립트는 전체 명령을 검사하고 `rm -rf`를 발견하므로 stdout에 결정을 출력합니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked by hook"
  }
}
```

명령이 `rm file.txt`와 같은 더 안전한 `rm` 변형이었다면, 스크립트는 대신 `exit 0`을 실행하여 Claude Code에 추가 작업 없이 tool call을 허용하도록 알립니다.

### 5단계: Claude Code가 결과에 따라 동작

Claude Code는 JSON 결정을 읽고, tool call을 차단하며, Claude에게 이유를 보여줍니다.

[구성](#구성) 섹션에서 전체 스키마를 설명하고, 각 [hook 이벤트](#hook-이벤트) 섹션에서 명령이 수신하는 입력과 반환할 수 있는 출력을 설명합니다.

## 구성

Hook은 JSON 설정 파일에 정의됩니다. 구성은 세 가지 수준의 중첩을 가집니다:

1. `PreToolUse`나 `Stop`과 같은 [hook 이벤트](#hook-이벤트)를 선택합니다
2. "Bash tool에만" 같은 필터링을 위한 [matcher 그룹](#matcher-패턴)을 추가합니다
3. 일치할 때 실행할 하나 이상의 [hook handler](#hook-handler-필드)를 정의합니다

주석이 달린 전체 예제는 위의 [Hook이 해석되는 방식](#hook이-해석되는-방식)을 참조하세요.

::: info
이 페이지에서는 각 수준에 대해 특정 용어를 사용합니다: 수명주기 시점을 **hook event**, 필터를 **matcher group**, 실행되는 셸 명령, HTTP 엔드포인트, prompt 또는 agent를 **hook handler**라고 합니다. "Hook" 자체는 일반적인 기능을 가리킵니다.
:::

### Hook 위치

Hook을 정의하는 위치가 해당 범위를 결정합니다:

| 위치                                                       | 범위                          | 공유 가능 여부                     |
| :--------------------------------------------------------- | :---------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 모든 프로젝트                 | 아니오, 로컬 머신에만 해당          |
| `.claude/settings.json`                                    | 단일 프로젝트                 | 예, 저장소에 커밋 가능              |
| `.claude/settings.local.json`                              | 단일 프로젝트                 | 아니오, gitignore됨                |
| 관리형 정책 설정                                           | 조직 전체                     | 예, 관리자 제어                     |
| [Plugin](/plugins) `hooks/hooks.json`                      | 플러그인 활성화 시            | 예, 플러그인과 함께 번들           |
| [Skill](/skills) 또는 [agent](/sub-agents) frontmatter     | 컴포넌트가 활성화된 동안      | 예, 컴포넌트 파일에 정의           |

설정 파일 해석에 대한 자세한 내용은 [settings](/settings)를 참조하세요. 엔터프라이즈 관리자는 `allowManagedHooksOnly`를 사용하여 사용자, 프로젝트, 플러그인 hook을 차단할 수 있습니다. 관리형 설정 `enabledPlugins`에서 강제 활성화된 플러그인의 hook은 면제되므로, 관리자가 조직 마켓플레이스를 통해 검증된 hook을 배포할 수 있습니다. [Hook 구성](/settings#hook-configuration)을 참조하세요.

### Matcher 패턴

`matcher` 필드는 hook이 실행되는 시점을 필터링합니다. matcher 평가 방식은 포함된 문자에 따라 달라집니다:

| Matcher 값                          | 평가 방식                                         | 예시                                                                                                             |
| :---------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `"*"`, `""`, 또는 생략              | 모두 일치                                             | 이벤트의 모든 발생에서 실행                                                                                      |
| 문자, 숫자, `_`, `\|`만 포함        | 정확한 문자열 또는 `\|`로 구분된 정확한 문자열 목록     | `Bash`는 Bash tool만 일치; `Edit\|Write`는 두 tool 중 하나와 정확히 일치                                          |
| 다른 문자 포함                      | JavaScript 정규식                                     | `^Notebook`은 Notebook으로 시작하는 모든 tool과 일치; `mcp__memory__.*`는 `memory` 서버의 모든 tool과 일치          |

`FileChanged` 이벤트는 watch 목록을 구성할 때 이 규칙을 따르지 않습니다. [FileChanged](#filechanged)를 참조하세요.

각 이벤트 유형은 서로 다른 필드에서 매칭합니다:

| Event                                                                                                          | matcher가 필터링하는 대상                                | 예시 matcher 값                                                                                                   |
| :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`                     | tool 이름                                                    | `Bash`, `Edit\|Write`, `mcp__.*`                                                                                          |
| `SessionStart`                                                                                                 | 세션 시작 방식                                               | `startup`, `resume`, `clear`, `compact`                                                                                   |
| `SessionEnd`                                                                                                   | 세션 종료 이유                                               | `clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`                                  |
| `Notification`                                                                                                 | 알림 유형                                                    | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`                                                  |
| `SubagentStart`                                                                                                | agent 유형                                                   | `Bash`, `Explore`, `Plan`, 또는 커스텀 agent 이름                                                                         |
| `PreCompact`, `PostCompact`                                                                                    | 압축 트리거 원인                                             | `manual`, `auto`                                                                                                          |
| `SubagentStop`                                                                                                 | agent 유형                                                   | `SubagentStart`와 동일한 값                                                                                                |
| `ConfigChange`                                                                                                 | 구성 소스                                                    | `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills`                                        |
| `CwdChanged`                                                                                                   | matcher 미지원                                               | 모든 디렉토리 변경 시 항상 실행                                                                                            |
| `FileChanged`                                                                                                  | 감시할 리터럴 파일명 ([FileChanged](#filechanged) 참조)      | `.envrc\|.env`                                                                                                            |
| `StopFailure`                                                                                                  | 오류 유형                                                    | `rate_limit`, `authentication_failed`, `billing_error`, `invalid_request`, `server_error`, `max_output_tokens`, `unknown` |
| `InstructionsLoaded`                                                                                           | 로드 이유                                                    | `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`                                              |
| `Elicitation`                                                                                                  | MCP 서버 이름                                                | 설정된 MCP 서버 이름                                                                                                       |
| `ElicitationResult`                                                                                            | MCP 서버 이름                                                | `Elicitation`과 동일한 값                                                                                                  |
| `UserPromptSubmit`, `Stop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove` | matcher 미지원                                               | 모든 발생 시 항상 실행                                                                                                     |

matcher는 Claude Code가 stdin으로 hook에 전송하는 [JSON 입력](#hook-입력과-출력)의 필드에 대해 실행됩니다. tool 이벤트의 경우 해당 필드는 `tool_name`입니다. 각 [hook 이벤트](#hook-이벤트) 섹션에서 matcher 값의 전체 집합과 해당 이벤트의 입력 스키마를 나열합니다.

이 예시는 Claude가 파일을 작성하거나 편집할 때만 린팅 스크립트를 실행합니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```

`UserPromptSubmit`, `Stop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove`, `CwdChanged`는 matcher를 지원하지 않으며 모든 발생 시 항상 실행됩니다. 이러한 이벤트에 `matcher` 필드를 추가하면 조용히 무시됩니다.

tool 이벤트의 경우, 개별 hook handler에 [`if` 필드](#공통-필드)를 설정하여 더 세밀하게 필터링할 수 있습니다. `if`는 [권한 규칙 구문](/permissions)을 사용하여 tool 이름과 인수를 함께 매칭하므로, `"Bash(git *)"``git` 명령에만 실행되고 `"Edit(*.ts)"`는 TypeScript 파일에만 실행됩니다.

#### MCP tool 매칭

[MCP](/mcp) 서버 tool은 tool 이벤트(`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`)에서 일반 tool로 나타나므로, 다른 tool 이름을 매칭하는 것과 동일한 방식으로 매칭할 수 있습니다.

MCP tool은 `mcp__<server>__<tool>` 네이밍 패턴을 따릅니다. 예시:

* `mcp__memory__create_entities`: Memory 서버의 엔티티 생성 tool
* `mcp__filesystem__read_file`: Filesystem 서버의 파일 읽기 tool
* `mcp__github__search_repositories`: GitHub 서버의 검색 tool

서버의 모든 tool을 매칭하려면 서버 접두사에 `.*`를 추가하세요. `.*`는 필수입니다: `mcp__memory`와 같은 matcher는 문자와 밑줄만 포함하므로 정확한 문자열로 비교되어 어떤 tool과도 일치하지 않습니다.

* `mcp__memory__.*`는 `memory` 서버의 모든 tool과 일치
* `mcp__.*__write.*`는 모든 서버에서 `write`로 시작하는 이름의 tool과 일치

이 예시는 모든 memory 서버 작업을 로깅하고 모든 MCP 서버의 쓰기 작업을 검증합니다:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log"
          }
        ]
      },
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          {
            "type": "command",
            "command": "/home/user/scripts/validate-mcp-write.py"
          }
        ]
      }
    ]
  }
}
```

### Hook handler 필드

내부 `hooks` 배열의 각 객체는 hook handler입니다: matcher가 일치할 때 실행되는 셸 명령, HTTP 엔드포인트, LLM prompt 또는 agent입니다. 네 가지 유형이 있습니다:

* **[Command hook](#command-hook-필드)** (`type: "command"`): 셸 명령을 실행합니다. 스크립트는 이벤트의 [JSON 입력](#hook-입력과-출력)을 stdin으로 받고 exit code와 stdout을 통해 결과를 전달합니다.
* **[HTTP hook](#http-hook-필드)** (`type: "http"`): 이벤트의 JSON 입력을 HTTP POST 요청으로 URL에 전송합니다. 엔드포인트는 command hook과 동일한 [JSON 출력 형식](#json-출력)을 사용하여 응답 본문을 통해 결과를 전달합니다.
* **[Prompt hook](#prompt-및-agent-hook-필드)** (`type: "prompt"`): 단일 턴 평가를 위해 Claude 모델에 prompt를 전송합니다. 모델은 예/아니오 결정을 JSON으로 반환합니다. [Prompt 기반 hook](#prompt-기반-hook)을 참조하세요.
* **[Agent hook](#prompt-및-agent-hook-필드)** (`type: "agent"`): 결정을 반환하기 전에 Read, Grep, Glob 같은 tool을 사용하여 조건을 확인할 수 있는 subagent를 생성합니다. [Agent 기반 hook](#agent-기반-hook)을 참조하세요.

#### 공통 필드

이 필드는 모든 hook 유형에 적용됩니다:

| 필드            | 필수 여부 | 설명                                                                                                                                                                                                                                                                                                                                                                                             |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | 예       | `"command"`, `"http"`, `"prompt"`, 또는 `"agent"`                                                                                                                                                                                                                                                                                                                                                          |
| `if`            | 아니오   | 이 hook이 실행되는 시점을 필터링하는 권한 규칙 구문으로, `"Bash(git *)"` 또는 `"Edit(*.ts)"` 등이 있습니다. tool call이 패턴과 일치하는 경우에만 hook이 생성됩니다. tool 이벤트에서만 평가됩니다: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`. 다른 이벤트에서는 `if`가 설정된 hook이 실행되지 않습니다. [권한 규칙](/permissions)과 동일한 구문을 사용합니다 |
| `timeout`       | 아니오   | 취소까지의 초 단위 시간. 기본값: command 600, prompt 30, agent 60                                                                                                                                                                                                                                                                                                                                         |
| `statusMessage` | 아니오   | hook 실행 중 표시되는 커스텀 스피너 메시지                                                                                                                                                                                                                                                                                                                                                     |
| `once`          | 아니오   | `true`이면 세션당 한 번만 실행된 후 제거됩니다. Skill 전용이며 agent에는 해당하지 않습니다. [Skill과 agent에서의 hook](#skill과-agent에서의-hook)을 참조하세요                                                                                                                                                                                                                                    |

#### Command hook 필드

[공통 필드](#공통-필드) 외에 command hook은 다음 필드를 사용합니다:

| 필드          | 필수 여부 | 설명                                                                                                                                                                                                                           |
| :------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `command`     | 예       | 실행할 셸 명령                                                                                                                                                                                                              |
| `async`       | 아니오   | `true`이면 차단 없이 백그라운드에서 실행됩니다. [백그라운드에서 hook 실행](#백그라운드에서-hook-실행)을 참조하세요                                                                                                                   |
| `asyncRewake` | 아니오   | `true`이면 백그라운드에서 실행되고 exit code 2로 Claude를 깨웁니다. `async`를 포함합니다. hook의 stderr(stderr가 비어 있으면 stdout)가 Claude에게 시스템 리마인더로 표시되어 장기 실행 백그라운드 실패에 반응할 수 있습니다     |
| `shell`       | 아니오   | 이 hook에 사용할 셸. `"bash"` (기본값) 또는 `"powershell"`을 허용합니다. `"powershell"`을 설정하면 Windows에서 PowerShell을 통해 명령을 실행합니다. hook이 직접 PowerShell을 생성하므로 `CLAUDE_CODE_USE_POWERSHELL_TOOL`이 필요하지 않습니다 |

#### HTTP hook 필드

[공통 필드](#공통-필드) 외에 HTTP hook은 다음 필드를 사용합니다:

| 필드             | 필수 여부 | 설명                                                                                                                                                                                      |
| :--------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | 예       | POST 요청을 보낼 URL                                                                                                                                                                  |
| `headers`        | 아니오   | 키-값 쌍 형태의 추가 HTTP 헤더. 값은 `$VAR_NAME` 또는 `${VAR_NAME}` 구문을 사용한 환경 변수 보간을 지원합니다. `allowedEnvVars`에 나열된 변수만 해석됩니다  |
| `allowedEnvVars` | 아니오   | 헤더 값에 보간할 수 있는 환경 변수 이름 목록. 나열되지 않은 변수에 대한 참조는 빈 문자열로 대체됩니다. 환경 변수 보간이 작동하려면 필수입니다 |

Claude Code는 hook의 [JSON 입력](#hook-입력과-출력)을 `Content-Type: application/json`으로 POST 요청 본문에 전송합니다. 응답 본문은 command hook과 동일한 [JSON 출력 형식](#json-출력)을 사용합니다.

오류 처리는 command hook과 다릅니다: 2xx가 아닌 응답, 연결 실패, 타임아웃 모두 실행을 계속하는 비차단 오류를 생성합니다. tool call을 차단하거나 권한을 거부하려면 `decision: "block"` 또는 `permissionDecision: "deny"`가 포함된 `hookSpecificOutput`과 함께 JSON 본문을 포함한 2xx 응답을 반환하세요.

이 예시는 `PreToolUse` 이벤트를 로컬 검증 서비스로 전송하고, `MY_TOKEN` 환경 변수의 토큰으로 인증합니다:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "http",
            "url": "http://localhost:8080/hooks/pre-tool-use",
            "timeout": 30,
            "headers": {
              "Authorization": "Bearer $MY_TOKEN"
            },
            "allowedEnvVars": ["MY_TOKEN"]
          }
        ]
      }
    ]
  }
}
```

#### Prompt 및 agent hook 필드

[공통 필드](#공통-필드) 외에 prompt 및 agent hook은 다음 필드를 사용합니다:

| 필드     | 필수 여부 | 설명                                                                                 |
| :------- | :------- | :------------------------------------------------------------------------------------------ |
| `prompt` | 예       | 모델에 보낼 prompt 텍스트. hook 입력 JSON의 플레이스홀더로 `$ARGUMENTS`를 사용합니다 |
| `model`  | 아니오   | 평가에 사용할 모델. 기본값은 빠른 모델입니다                                       |

일치하는 모든 hook은 병렬로 실행되며, 동일한 handler는 자동으로 중복 제거됩니다. Command hook은 명령 문자열로, HTTP hook은 URL로 중복 제거됩니다. Handler는 현재 디렉토리에서 Claude Code의 환경으로 실행됩니다. `$CLAUDE_CODE_REMOTE` 환경 변수는 원격 웹 환경에서 `"true"`로 설정되고 로컬 CLI에서는 설정되지 않습니다.

### 경로로 스크립트 참조

hook이 실행될 때의 작업 디렉토리에 관계없이, 환경 변수를 사용하여 프로젝트 또는 플러그인 루트에 상대적으로 hook 스크립트를 참조하세요:

* `$CLAUDE_PROJECT_DIR`: 프로젝트 루트. 공백이 포함된 경로를 처리하려면 따옴표로 감싸세요.
* `${CLAUDE_PLUGIN_ROOT}`: 플러그인의 설치 디렉토리로, [plugin](/plugins)과 함께 번들된 스크립트용입니다. 각 플러그인 업데이트 시 변경됩니다.
* `${CLAUDE_PLUGIN_DATA}`: 플러그인의 [영구 데이터 디렉토리](/plugins-reference#persistent-data-directory)로, 플러그인 업데이트 후에도 유지되어야 하는 의존성과 상태용입니다.

**프로젝트 스크립트**

이 예시는 `$CLAUDE_PROJECT_DIR`를 사용하여 모든 `Write` 또는 `Edit` tool call 후에 프로젝트의 `.claude/hooks/` 디렉토리에서 스타일 검사기를 실행합니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-style.sh"
          }
        ]
      }
    ]
  }
}
```

**플러그인 스크립트**

플러그인 hook은 `hooks/hooks.json`에 정의하며 선택적으로 최상위 `description` 필드를 포함합니다. 플러그인이 활성화되면 해당 hook이 사용자 및 프로젝트 hook과 병합됩니다.

이 예시는 플러그인과 함께 번들된 포맷팅 스크립트를 실행합니다:

```json
{
  "description": "Automatic code formatting",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

플러그인 hook 생성에 대한 자세한 내용은 [플러그인 컴포넌트 레퍼런스](/plugins-reference#hooks)를 참조하세요.

### Skill과 agent에서의 hook

설정 파일과 플러그인 외에도 [skill](/skills)과 [subagent](/sub-agents)의 frontmatter에서 직접 hook을 정의할 수 있습니다. 이러한 hook은 컴포넌트의 수명주기에 범위가 지정되며 해당 컴포넌트가 활성화된 동안에만 실행됩니다.

모든 hook 이벤트가 지원됩니다. subagent의 경우 `Stop` hook은 subagent가 완료될 때 실행되는 이벤트이므로 자동으로 `SubagentStop`으로 변환됩니다.

Hook은 설정 기반 hook과 동일한 구성 형식을 사용하지만 컴포넌트의 수명에 범위가 지정되고 완료 시 정리됩니다.

이 skill은 각 `Bash` 명령 전에 보안 검증 스크립트를 실행하는 `PreToolUse` hook을 정의합니다:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

Agent도 YAML frontmatter에서 동일한 형식을 사용합니다.

### `/hooks` 메뉴

Claude Code에서 `/hooks`를 입력하면 구성된 hook에 대한 읽기 전용 브라우저가 열립니다. 메뉴는 구성된 hook 수와 함께 모든 hook 이벤트를 표시하고, matcher를 드릴다운하며, 각 hook handler의 전체 세부 정보를 표시합니다. 구성 확인, hook이 어떤 설정 파일에서 왔는지 확인, hook의 command, prompt 또는 URL 검사에 사용하세요.

메뉴는 네 가지 hook 유형을 모두 표시합니다: `command`, `prompt`, `agent`, `http`. 각 hook은 `[type]` 접두사와 정의된 위치를 나타내는 소스로 레이블됩니다:

* `User`: `~/.claude/settings.json`에서
* `Project`: `.claude/settings.json`에서
* `Local`: `.claude/settings.local.json`에서
* `Plugin`: 플러그인의 `hooks/hooks.json`에서
* `Session`: 현재 세션에서 메모리에 등록됨
* `Built-in`: Claude Code 내부에서 등록됨

hook을 선택하면 이벤트, matcher, 유형, 소스 파일, 전체 command, prompt 또는 URL을 보여주는 상세 보기가 열립니다. 메뉴는 읽기 전용입니다: hook을 추가, 수정 또는 제거하려면 설정 JSON을 직접 편집하거나 Claude에게 변경을 요청하세요.

### Hook 비활성화 또는 제거

hook을 제거하려면 설정 JSON 파일에서 해당 항목을 삭제하세요.

제거하지 않고 모든 hook을 일시적으로 비활성화하려면 설정 파일에 `"disableAllHooks": true`를 설정하세요. 구성에 유지하면서 개별 hook을 비활성화하는 방법은 없습니다.

`disableAllHooks` 설정은 관리형 설정 계층을 따릅니다. 관리자가 관리형 정책 설정을 통해 hook을 구성한 경우, 사용자, 프로젝트 또는 로컬 설정에서 설정한 `disableAllHooks`는 해당 관리형 hook을 비활성화할 수 없습니다. 관리형 설정 수준에서 설정한 `disableAllHooks`만 관리형 hook을 비활성화할 수 있습니다.

설정 파일의 hook에 대한 직접 편집은 일반적으로 파일 감시자에 의해 자동으로 감지됩니다.

## Hook 입력과 출력

Command hook은 stdin을 통해 JSON 데이터를 수신하고 exit code, stdout, stderr를 통해 결과를 전달합니다. HTTP hook은 동일한 JSON을 POST 요청 본문으로 수신하고 HTTP 응답 본문을 통해 결과를 전달합니다. 이 섹션에서는 모든 이벤트에 공통된 필드와 동작을 다룹니다. [Hook 이벤트](#hook-이벤트) 아래의 각 이벤트 섹션에 해당 이벤트의 특정 입력 스키마와 결정 제어 옵션이 포함되어 있습니다.

### 공통 입력 필드

Hook 이벤트는 각 [hook 이벤트](#hook-이벤트) 섹션에 설명된 이벤트별 필드 외에 다음 필드를 JSON으로 수신합니다. Command hook의 경우 이 JSON은 stdin으로 도착합니다. HTTP hook의 경우 POST 요청 본문으로 도착합니다.

| 필드              | 설명                                                                                                                                                                                                                           |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `session_id`      | 현재 세션 식별자                                                                                                                                                                                                            |
| `transcript_path` | 대화 JSON 경로                                                                                                                                                                                                             |
| `cwd`             | hook이 호출될 때의 현재 작업 디렉토리                                                                                                                                                                                    |
| `permission_mode` | 현재 [권한 모드](/permissions#permission-modes): `"default"`, `"plan"`, `"acceptEdits"`, `"auto"`, `"dontAsk"`, 또는 `"bypassPermissions"`. 모든 이벤트가 이 필드를 수신하는 것은 아닙니다: 아래의 각 이벤트 JSON 예시를 확인하세요 |
| `hook_event_name` | 실행된 이벤트 이름                                                                                                                                                                                                          |

`--agent` 또는 subagent 내부에서 실행할 때 두 개의 추가 필드가 포함됩니다:

| 필드         | 설명                                                                                                                                                                                                                          |
| :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent_id`   | subagent의 고유 식별자. hook이 subagent call 내부에서 실행될 때만 존재합니다. subagent hook 호출과 메인 스레드 호출을 구분하는 데 사용합니다.                                                                     |
| `agent_type` | Agent 이름 (예: `"Explore"` 또는 `"security-reviewer"`). 세션이 `--agent`를 사용하거나 hook이 subagent 내부에서 실행될 때 존재합니다. subagent의 경우 subagent의 유형이 세션의 `--agent` 값보다 우선합니다. |

예를 들어, Bash 명령에 대한 `PreToolUse` hook은 stdin에서 다음을 수신합니다:

```json
{
  "session_id": "abc123",
  "transcript_path": "/home/user/.claude/projects/.../transcript.jsonl",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

`tool_name`과 `tool_input` 필드는 이벤트별로 다릅니다. 각 [hook 이벤트](#hook-이벤트) 섹션에서 해당 이벤트의 추가 필드를 설명합니다.

### Exit code 출력

hook 명령의 exit code는 작업의 진행, 차단 또는 무시 여부를 Claude Code에 알립니다.

**Exit 0**은 성공을 의미합니다. Claude Code는 stdout에서 [JSON 출력 필드](#json-출력)를 파싱합니다. JSON 출력은 exit 0에서만 처리됩니다. 대부분의 이벤트에서 stdout은 디버그 로그에 기록되지만 대화에는 표시되지 않습니다. 예외는 `UserPromptSubmit`과 `SessionStart`로, stdout이 Claude가 볼 수 있고 반응할 수 있는 컨텍스트로 추가됩니다.

**Exit 2**는 차단 오류를 의미합니다. Claude Code는 stdout과 그 안의 JSON을 무시합니다. 대신 stderr 텍스트가 오류 메시지로 Claude에게 전달됩니다. 효과는 이벤트에 따라 다릅니다: `PreToolUse`는 tool call을 차단하고, `UserPromptSubmit`은 prompt를 거부하는 식입니다. 전체 목록은 [이벤트별 exit code 2 동작](#이벤트별-exit-code-2-동작)을 참조하세요.

**다른 모든 exit code**는 대부분의 hook 이벤트에서 비차단 오류입니다. 대화에는 `<hook name> hook error` 알림과 stderr의 첫 줄이 표시되어 `--debug` 없이도 원인을 식별할 수 있습니다. 실행은 계속되고 전체 stderr는 디버그 로그에 기록됩니다.

예를 들어, 위험한 Bash 명령을 차단하는 hook 명령 스크립트:

```bash
#!/bin/bash
# Reads JSON input from stdin, checks the command
command=$(jq -r '.tool_input.command' < /dev/stdin)

if [[ "$command" == rm* ]]; then
  echo "Blocked: rm commands are not allowed" >&2
  exit 2  # Blocking error: tool call is prevented
fi

exit 0  # Success: tool call proceeds
```

::: warning
대부분의 hook 이벤트에서 exit code 2만 작업을 차단합니다. Claude Code는 exit code 1을 비차단 오류로 처리하고, 1이 일반적인 Unix 실패 코드임에도 불구하고 작업을 계속 진행합니다. hook이 정책을 시행하는 것이라면 `exit 2`를 사용하세요. 예외는 `WorktreeCreate`로, 0이 아닌 모든 exit code가 worktree 생성을 중단합니다.
:::

#### 이벤트별 exit code 2 동작

Exit code 2는 hook이 "중지, 이것을 하지 마세요"라고 신호를 보내는 방법입니다. 효과는 이벤트에 따라 다릅니다. 일부 이벤트는 차단할 수 있는 작업(아직 발생하지 않은 tool call 등)을 나타내고, 다른 이벤트는 이미 발생했거나 방지할 수 없는 것을 나타냅니다.

| Hook event           | 차단 가능? | Exit 2 시 동작                                                                                                               |
| :------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `PreToolUse`         | 예         | tool call을 차단                                                                                                                 |
| `PermissionRequest`  | 예         | 권한을 거부                                                                                                                |
| `UserPromptSubmit`   | 예         | prompt 처리를 차단하고 prompt를 지움                                                                                       |
| `Stop`               | 예         | Claude의 중지를 방지하고 대화를 계속                                                                                       |
| `SubagentStop`       | 예         | subagent의 중지를 방지                                                                                                     |
| `TeammateIdle`       | 예         | 팀원의 유휴 전환을 방지 (팀원이 계속 작업)                                                                                 |
| `TaskCreated`        | 예         | task 생성을 롤백                                                                                                           |
| `TaskCompleted`      | 예         | task가 완료로 표시되는 것을 방지                                                                                           |
| `ConfigChange`       | 예         | 구성 변경이 적용되는 것을 차단 (`policy_settings` 제외)                                                                    |
| `StopFailure`        | 아니오     | 출력과 exit code가 무시됨                                                                                                   |
| `PostToolUse`        | 아니오     | stderr를 Claude에게 표시 (tool이 이미 실행됨)                                                                               |
| `PostToolUseFailure` | 아니오     | stderr를 Claude에게 표시 (tool이 이미 실패함)                                                                               |
| `PermissionDenied`   | 아니오     | exit code와 stderr가 무시됨 (거부가 이미 발생). JSON `hookSpecificOutput.retry: true`를 사용하여 모델에 재시도할 수 있음을 알림 |
| `Notification`       | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `SubagentStart`      | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `SessionStart`       | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `SessionEnd`         | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `CwdChanged`         | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `FileChanged`        | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `PreCompact`         | 예         | 압축을 차단                                                                                                                 |
| `PostCompact`        | 아니오     | 사용자에게만 stderr 표시                                                                                                    |
| `Elicitation`        | 예         | elicitation을 거부                                                                                                          |
| `ElicitationResult`  | 예         | 응답을 차단 (action이 decline으로 변경)                                                                                     |
| `WorktreeCreate`     | 예         | 0이 아닌 모든 exit code가 worktree 생성을 실패시킴                                                                          |
| `WorktreeRemove`     | 아니오     | 실패는 디버그 모드에서만 로그됨                                                                                              |
| `InstructionsLoaded` | 아니오     | exit code가 무시됨                                                                                                           |

### HTTP 응답 처리

HTTP hook은 exit code와 stdout 대신 HTTP 상태 코드와 응답 본문을 사용합니다:

* **빈 본문이 있는 2xx**: 성공, 출력 없는 exit code 0과 동일
* **일반 텍스트 본문이 있는 2xx**: 성공, 텍스트가 컨텍스트로 추가됨
* **JSON 본문이 있는 2xx**: 성공, command hook과 동일한 [JSON 출력](#json-출력) 스키마로 파싱됨
* **2xx가 아닌 상태**: 비차단 오류, 실행 계속
* **연결 실패 또는 타임아웃**: 비차단 오류, 실행 계속

Command hook과 달리 HTTP hook은 상태 코드만으로는 차단 오류를 신호할 수 없습니다. tool call을 차단하거나 권한을 거부하려면 적절한 결정 필드가 포함된 JSON 본문과 함께 2xx 응답을 반환하세요.

### JSON 출력

Exit code는 허용 또는 차단을 할 수 있지만, JSON 출력은 더 세밀한 제어를 제공합니다. exit code 2로 종료하여 차단하는 대신, exit 0으로 종료하고 JSON 객체를 stdout에 출력하세요. Claude Code는 해당 JSON에서 특정 필드를 읽어 [결정 제어](#결정-제어)를 포함한 동작을 제어합니다.

::: info
hook당 하나의 접근 방식을 선택해야 하며 둘 다 사용할 수 없습니다: 신호를 위해 exit code만 사용하거나, exit 0으로 종료하고 구조화된 제어를 위해 JSON을 출력하세요. Claude Code는 exit 0에서만 JSON을 처리합니다. exit 2로 종료하면 모든 JSON이 무시됩니다.
:::

hook의 stdout에는 JSON 객체만 포함되어야 합니다. 셸 프로필이 시작 시 텍스트를 출력하면 JSON 파싱에 방해가 될 수 있습니다. 문제 해결 가이드의 [JSON 검증 실패](/hooks-guide#json-validation-failed)를 참조하세요.

컨텍스트에 주입되는 hook 출력(`additionalContext`, `systemMessage`, 또는 일반 stdout)은 10,000자로 제한됩니다. 이 한도를 초과하는 출력은 파일에 저장되고 미리보기 및 파일 경로로 대체되며, 큰 tool 결과가 처리되는 방식과 동일합니다.

JSON 객체는 세 가지 종류의 필드를 지원합니다:

* **범용 필드** like `continue`는 모든 이벤트에서 작동합니다. 아래 표에 나열되어 있습니다.
* **최상위 `decision`과 `reason`**은 일부 이벤트에서 차단하거나 피드백을 제공하는 데 사용됩니다.
* **`hookSpecificOutput`**은 더 풍부한 제어가 필요한 이벤트를 위한 중첩 객체입니다. 이벤트 이름으로 설정된 `hookEventName` 필드가 필요합니다.

| 필드             | 기본값  | 설명                                                                                                                |
| :--------------- | :------ | :------------------------------------------------------------------------------------------------------------------------- |
| `continue`       | `true`  | `false`이면 hook 실행 후 Claude가 처리를 완전히 중지합니다. 이벤트별 결정 필드보다 우선합니다 |
| `stopReason`     | 없음    | `continue`가 `false`일 때 사용자에게 표시되는 메시지. Claude에게는 표시되지 않음                                  |
| `suppressOutput` | `false` | `true`이면 디버그 로그에서 stdout을 생략                                                                                 |
| `systemMessage`  | 없음    | 사용자에게 표시되는 경고 메시지                                                                                          |

이벤트 유형에 관계없이 Claude를 완전히 중지하려면:

```json
{ "continue": false, "stopReason": "Build failed, fix errors before continuing" }
```

#### 결정 제어

모든 이벤트가 JSON을 통한 차단이나 동작 제어를 지원하는 것은 아닙니다. 지원하는 이벤트는 각각 다른 필드 집합을 사용하여 결정을 표현합니다. hook을 작성하기 전에 이 표를 빠른 참조로 사용하세요:

| Events                                                                                                          | 결정 패턴                      | 주요 필드                                                                                                                                                          |
| :-------------------------------------------------------------------------------------------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UserPromptSubmit, PostToolUse, PostToolUseFailure, Stop, SubagentStop, ConfigChange, PreCompact                 | 최상위 `decision`              | `decision: "block"`, `reason`                                                                                                                                       |
| TeammateIdle, TaskCreated, TaskCompleted                                                                        | Exit code 또는 `continue: false` | Exit code 2는 stderr 피드백과 함께 작업을 차단. JSON `{"continue": false, "stopReason": "..."}`도 팀원을 완전히 중지하며, `Stop` hook 동작과 일치 |
| PreToolUse                                                                                                      | `hookSpecificOutput`           | `permissionDecision` (allow/deny/ask/defer), `permissionDecisionReason`                                                                                             |
| PermissionRequest                                                                                               | `hookSpecificOutput`           | `decision.behavior` (allow/deny)                                                                                                                                    |
| PermissionDenied                                                                                                | `hookSpecificOutput`           | `retry: true`는 모델에 거부된 tool call을 재시도할 수 있음을 알림                                                                                                     |
| WorktreeCreate                                                                                                  | 경로 반환                      | Command hook은 stdout에 경로를 출력; HTTP hook은 `hookSpecificOutput.worktreePath`를 반환. hook 실패 또는 경로 누락은 생성을 실패시킴                                |
| Elicitation                                                                                                     | `hookSpecificOutput`           | `action` (accept/decline/cancel), `content` (accept 시 폼 필드 값)                                                                                          |
| ElicitationResult                                                                                               | `hookSpecificOutput`           | `action` (accept/decline/cancel), `content` (폼 필드 값 재정의)                                                                                            |
| WorktreeRemove, Notification, SessionEnd, PostCompact, InstructionsLoaded, StopFailure, CwdChanged, FileChanged | 없음                           | 결정 제어 없음. 로깅이나 정리 같은 부수 효과에 사용                                                                                                  |

다음은 각 패턴의 실제 사용 예시입니다:

**최상위 decision**

`UserPromptSubmit`, `PostToolUse`, `PostToolUseFailure`, `Stop`, `SubagentStop`, `ConfigChange`, `PreCompact`에서 사용됩니다. 유일한 값은 `"block"`입니다. 작업이 진행되도록 허용하려면 JSON에서 `decision`을 생략하거나, JSON 없이 exit 0으로 종료하세요:

```json
{
  "decision": "block",
  "reason": "Test suite must pass before proceeding"
}
```

**PreToolUse**

더 풍부한 제어를 위해 `hookSpecificOutput`을 사용합니다: 허용, 거부 또는 사용자에게 에스컬레이션. tool 입력을 실행 전에 수정하거나 Claude에 추가 컨텍스트를 주입할 수도 있습니다. 전체 옵션은 [PreToolUse 결정 제어](#pretooluse-결정-제어)를 참조하세요.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes are not allowed"
  }
}
```

**PermissionRequest**

사용자를 대신하여 권한 요청을 허용하거나 거부하기 위해 `hookSpecificOutput`을 사용합니다. 허용 시 tool의 입력을 수정하거나 사용자에게 다시 묻지 않도록 권한 규칙을 적용할 수도 있습니다. 전체 옵션은 [PermissionRequest 결정 제어](#permissionrequest-결정-제어)를 참조하세요.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```

확장 예시(Bash 명령 검증, prompt 필터링, 자동 승인 스크립트 포함)는 가이드의 [자동화할 수 있는 것](/hooks-guide#what-you-can-automate)과 [Bash 명령 검증기 레퍼런스 구현](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)을 참조하세요.

## Hook 이벤트

각 이벤트는 hook이 실행될 수 있는 Claude Code 수명주기의 한 지점에 해당합니다. 아래 섹션은 수명주기와 일치하는 순서로 정렬되어 있습니다: 세션 설정부터 에이전트 루프를 거쳐 세션 종료까지. 각 섹션에서는 이벤트가 언제 실행되는지, 어떤 matcher를 지원하는지, 수신하는 JSON 입력, 출력을 통한 동작 제어 방법을 설명합니다.

### SessionStart

Claude Code가 새 세션을 시작하거나 기존 세션을 재개할 때 실행됩니다. 기존 이슈나 코드베이스의 최근 변경 사항과 같은 개발 컨텍스트를 로드하거나 환경 변수를 설정하는 데 유용합니다. 스크립트가 필요 없는 정적 컨텍스트는 [CLAUDE.md](/memory)를 대신 사용하세요.

SessionStart는 모든 세션에서 실행되므로 이 hook은 빠르게 유지하세요. `type: "command"` hook만 지원됩니다.

matcher 값은 세션이 시작된 방식에 해당합니다:

| Matcher   | 실행 시점                              |
| :-------- | :------------------------------------- |
| `startup` | 새 세션                                |
| `resume`  | `--resume`, `--continue`, 또는 `/resume` |
| `clear`   | `/clear`                               |
| `compact` | 자동 또는 수동 압축                    |

#### SessionStart 입력

[공통 입력 필드](#공통-입력-필드) 외에 SessionStart hook은 `source`, `model`, 선택적으로 `agent_type`을 수신합니다. `source` 필드는 세션 시작 방식을 나타냅니다: 새 세션의 `"startup"`, 재개된 세션의 `"resume"`, `/clear` 후의 `"clear"`, 압축 후의 `"compact"`. `model` 필드는 모델 식별자를 포함합니다. `claude --agent <name>`으로 Claude Code를 시작하면 `agent_type` 필드에 agent 이름이 포함됩니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SessionStart",
  "source": "startup",
  "model": "claude-sonnet-4-6"
}
```

#### SessionStart 결정 제어

hook 스크립트가 stdout에 출력하는 모든 텍스트는 Claude의 컨텍스트로 추가됩니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 다음 이벤트별 필드를 반환할 수 있습니다:

| 필드                | 설명                                                               |
| :------------------ | :------------------------------------------------------------------------ |
| `additionalContext` | Claude의 컨텍스트에 추가되는 문자열. 여러 hook의 값이 연결됩니다 |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "My additional context here"
  }
}
```

#### 환경 변수 유지

SessionStart hook은 `CLAUDE_ENV_FILE` 환경 변수에 접근할 수 있으며, 후속 Bash 명령에 대한 환경 변수를 유지할 수 있는 파일 경로를 제공합니다.

개별 환경 변수를 설정하려면 `CLAUDE_ENV_FILE`에 `export` 문을 작성하세요. 다른 hook이 설정한 변수를 보존하려면 추가(`>>`)를 사용하세요:

```bash
#!/bin/bash

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

설정 명령의 모든 환경 변경 사항을 캡처하려면 전후의 내보낸 변수를 비교하세요:

```bash
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

# Run your setup commands that modify the environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

이 파일에 작성된 모든 변수는 세션 중 Claude Code가 실행하는 모든 후속 Bash 명령에서 사용할 수 있습니다.

::: info
`CLAUDE_ENV_FILE`은 SessionStart, [CwdChanged](#cwdchanged), [FileChanged](#filechanged) hook에서 사용 가능합니다. 다른 hook 유형에서는 이 변수에 접근할 수 없습니다.
:::

### InstructionsLoaded

`CLAUDE.md` 또는 `.claude/rules/*.md` 파일이 컨텍스트에 로드될 때 실행됩니다. 이 이벤트는 세션 시작 시 즉시 로드되는 파일에 대해 실행되고, 나중에 파일이 지연 로드될 때 다시 실행됩니다. 예를 들어 Claude가 중첩된 `CLAUDE.md`를 포함하는 하위 디렉토리에 접근하거나 `paths:` frontmatter가 있는 조건부 규칙이 일치할 때입니다. 이 hook은 차단이나 결정 제어를 지원하지 않습니다. 관찰성 목적으로 비동기적으로 실행됩니다.

matcher는 `load_reason`에 대해 실행됩니다. 예를 들어, `"matcher": "session_start"`를 사용하여 세션 시작 시 로드된 파일에만 실행하거나, `"matcher": "path_glob_match|nested_traversal"`을 사용하여 지연 로드에만 실행합니다.

#### InstructionsLoaded 입력

[공통 입력 필드](#공통-입력-필드) 외에 InstructionsLoaded hook은 다음 필드를 수신합니다:

| 필드                | 설명                                                                                                                                                                                                   |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `file_path`         | 로드된 명령 파일의 절대 경로                                                                                                                                                                         |
| `memory_type`       | 파일의 범위: `"User"`, `"Project"`, `"Local"`, 또는 `"Managed"`                                                                                                                                           |
| `load_reason`       | 파일이 로드된 이유: `"session_start"`, `"nested_traversal"`, `"path_glob_match"`, `"include"`, 또는 `"compact"`. `"compact"` 값은 압축 이벤트 후 명령 파일이 다시 로드될 때 실행됩니다 |
| `globs`             | 파일의 `paths:` frontmatter에서 가져온 경로 glob 패턴(있는 경우). `path_glob_match` 로드에만 존재                                                                                                     |
| `trigger_file_path` | 이 로드를 트리거한 파일의 경로, 지연 로드의 경우                                                                                                                                                     |
| `parent_file_path`  | 이 파일을 포함한 부모 명령 파일의 경로, `include` 로드의 경우                                                                                                                                        |

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "InstructionsLoaded",
  "file_path": "/Users/my-project/CLAUDE.md",
  "memory_type": "Project",
  "load_reason": "session_start"
}
```

#### InstructionsLoaded 결정 제어

InstructionsLoaded hook에는 결정 제어가 없습니다. 명령 로드를 차단하거나 수정할 수 없습니다. 이 이벤트는 감사 로깅, 컴플라이언스 추적 또는 관찰성에 사용하세요.

### UserPromptSubmit

사용자가 prompt를 제출하면 Claude가 처리하기 전에 실행됩니다. 이를 통해 prompt/대화를 기반으로 추가 컨텍스트를 추가하거나, prompt를 검증하거나, 특정 유형의 prompt를 차단할 수 있습니다.

#### UserPromptSubmit 입력

[공통 입력 필드](#공통-입력-필드) 외에 UserPromptSubmit hook은 사용자가 제출한 텍스트가 포함된 `prompt` 필드를 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "Write a function to calculate the factorial of a number"
}
```

#### UserPromptSubmit 결정 제어

`UserPromptSubmit` hook은 사용자 prompt의 처리 여부를 제어하고 컨텍스트를 추가할 수 있습니다. 모든 [JSON 출력 필드](#json-출력)를 사용할 수 있습니다.

exit code 0에서 대화에 컨텍스트를 추가하는 두 가지 방법이 있습니다:

* **일반 텍스트 stdout**: stdout에 작성된 비JSON 텍스트가 컨텍스트로 추가됩니다
* **`additionalContext`가 포함된 JSON**: 더 많은 제어를 위해 아래 JSON 형식을 사용합니다. `additionalContext` 필드가 컨텍스트로 추가됩니다

일반 stdout은 대화에서 hook 출력으로 표시됩니다. `additionalContext` 필드는 더 눈에 띄지 않게 추가됩니다.

prompt를 차단하려면 `decision`이 `"block"`으로 설정된 JSON 객체를 반환하세요:

| 필드                | 설명                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| `decision`          | `"block"`은 prompt가 처리되는 것을 방지하고 컨텍스트에서 지웁니다. prompt를 진행하려면 생략                 |
| `reason`            | `decision`이 `"block"`일 때 사용자에게 표시됩니다. 컨텍스트에 추가되지 않음                                               |
| `additionalContext` | Claude의 컨텍스트에 추가되는 문자열                                                                                   |
| `sessionTitle`      | `/rename`과 동일한 효과로 세션 제목을 설정합니다. prompt 내용을 기반으로 세션 이름을 자동 지정하는 데 사용   |

```json
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "My additional context here",
    "sessionTitle": "My session title"
  }
}
```

::: info
단순한 사용 사례에는 JSON 형식이 필요하지 않습니다. 컨텍스트를 추가하려면 exit code 0으로 일반 텍스트를 stdout에 출력할 수 있습니다. prompt를 차단하거나 더 구조화된 제어가 필요할 때 JSON을 사용하세요.
:::

### PreToolUse

Claude가 tool 파라미터를 생성한 후 tool call을 처리하기 전에 실행됩니다. tool 이름으로 매칭합니다: `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Agent`, `WebFetch`, `WebSearch`, `AskUserQuestion`, `ExitPlanMode`, 그리고 모든 [MCP tool 이름](#mcp-tool-매칭).

[PreToolUse 결정 제어](#pretooluse-결정-제어)를 사용하여 tool call을 허용, 거부, 질문 또는 연기할 수 있습니다.

#### PreToolUse 입력

[공통 입력 필드](#공통-입력-필드) 외에 PreToolUse hook은 `tool_name`, `tool_input`, `tool_use_id`를 수신합니다. `tool_input` 필드는 tool에 따라 다릅니다:

##### Bash

셸 명령을 실행합니다.

| 필드                | 유형    | 예시               | 설명                                   |
| :------------------ | :------ | :----------------- | :-------------------------------------------- |
| `command`           | string  | `"npm test"`       | 실행할 셸 명령                  |
| `description`       | string  | `"Run test suite"` | 명령이 수행하는 작업에 대한 선택적 설명 |
| `timeout`           | number  | `120000`           | 선택적 타임아웃(밀리초)              |
| `run_in_background` | boolean | `false`            | 백그라운드에서 실행할지 여부      |

##### Write

파일을 생성하거나 덮어씁니다.

| 필드        | 유형   | 예시                  | 설명                        |
| :---------- | :----- | :-------------------- | :--------------------------------- |
| `file_path` | string | `"/path/to/file.txt"` | 작성할 파일의 절대 경로 |
| `content`   | string | `"file content"`      | 파일에 작성할 내용       |

##### Edit

기존 파일에서 문자열을 교체합니다.

| 필드          | 유형    | 예시                  | 설명                        |
| :------------ | :------ | :-------------------- | :--------------------------------- |
| `file_path`   | string  | `"/path/to/file.txt"` | 편집할 파일의 절대 경로  |
| `old_string`  | string  | `"original text"`     | 찾아서 교체할 텍스트           |
| `new_string`  | string  | `"replacement text"`  | 교체 텍스트                   |
| `replace_all` | boolean | `false`               | 모든 발생을 교체할지 여부 |

##### Read

파일 내용을 읽습니다.

| 필드        | 유형   | 예시                  | 설명                                |
| :---------- | :----- | :-------------------- | :----------------------------------------- |
| `file_path` | string | `"/path/to/file.txt"` | 읽을 파일의 절대 경로          |
| `offset`    | number | `10`                  | 읽기 시작할 선택적 줄 번호 |
| `limit`     | number | `50`                  | 읽을 선택적 줄 수           |

##### Glob

glob 패턴과 일치하는 파일을 찾습니다.

| 필드      | 유형   | 예시             | 설명                                                            |
| :-------- | :----- | :--------------- | :--------------------------------------------------------------------- |
| `pattern` | string | `"**/*.ts"`      | 파일과 매칭할 glob 패턴                                    |
| `path`    | string | `"/path/to/dir"` | 검색할 선택적 디렉토리. 기본값은 현재 작업 디렉토리 |

##### Grep

정규 표현식으로 파일 내용을 검색합니다.

| 필드          | 유형    | 예시             | 설명                                                                           |
| :------------ | :------ | :--------------- | :------------------------------------------------------------------------------------ |
| `pattern`     | string  | `"TODO.*fix"`    | 검색할 정규 표현식 패턴                                              |
| `path`        | string  | `"/path/to/dir"` | 검색할 선택적 파일 또는 디렉토리                                               |
| `glob`        | string  | `"*.ts"`         | 파일을 필터링할 선택적 glob 패턴                                                 |
| `output_mode` | string  | `"content"`      | `"content"`, `"files_with_matches"`, 또는 `"count"`. 기본값은 `"files_with_matches"` |
| `-i`          | boolean | `true`           | 대소문자 구분 없는 검색                                                               |
| `multiline`   | boolean | `false`          | 여러 줄 매칭 활성화                                                             |

##### WebFetch

웹 콘텐츠를 가져오고 처리합니다.

| 필드     | 유형   | 예시                          | 설명                          |
| :------- | :----- | :---------------------------- | :----------------------------------- |
| `url`    | string | `"https://example.com/api"`   | 콘텐츠를 가져올 URL            |
| `prompt` | string | `"Extract the API endpoints"` | 가져온 콘텐츠에서 실행할 prompt |

##### WebSearch

웹을 검색합니다.

| 필드              | 유형   | 예시                           | 설명                                       |
| :---------------- | :----- | :----------------------------- | :------------------------------------------------ |
| `query`           | string | `"react hooks best practices"` | 검색 쿼리                                      |
| `allowed_domains` | array  | `["docs.example.com"]`         | 선택 사항: 이 도메인의 결과만 포함 |
| `blocked_domains` | array  | `["spam.example.com"]`         | 선택 사항: 이 도메인의 결과 제외      |

##### Agent

[subagent](/sub-agents)를 생성합니다.

| 필드            | 유형   | 예시                       | 설명                                  |
| :-------------- | :----- | :------------------------- | :------------------------------------------- |
| `prompt`        | string | `"Find all API endpoints"` | agent가 수행할 작업            |
| `description`   | string | `"Find API endpoints"`     | 작업의 짧은 설명                |
| `subagent_type` | string | `"Explore"`                | 사용할 특수 agent 유형             |
| `model`         | string | `"sonnet"`                 | 기본값을 재정의할 선택적 모델 별칭 |

##### AskUserQuestion

사용자에게 1~4개의 다중 선택 질문을 합니다.

| 필드        | 유형   | 예시                                                                                                               | 설명                                                                                                                                                                                      |
| :---------- | :----- | :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `questions` | array  | `[{"question": "Which framework?", "header": "Framework", "options": [{"label": "React"}], "multiSelect": false}]` | 제시할 질문으로, 각각 `question` 문자열, 짧은 `header`, `options` 배열, 선택적 `multiSelect` 플래그를 포함                                                                            |
| `answers`   | object | `{"Which framework?": "React"}`                                                                                    | 선택 사항. 질문 텍스트를 선택된 옵션 레이블에 매핑. 다중 선택 답변은 레이블을 쉼표로 결합. Claude는 이 필드를 설정하지 않으며, 프로그래밍 방식으로 답변하려면 `updatedInput`을 통해 제공 |

#### PreToolUse 결정 제어

`PreToolUse` hook은 tool call의 진행 여부를 제어할 수 있습니다. 최상위 `decision` 필드를 사용하는 다른 hook과 달리, PreToolUse는 `hookSpecificOutput` 객체 내에 결정을 반환합니다. 이를 통해 네 가지 결과(allow, deny, ask, defer)와 실행 전 tool 입력 수정 기능 등 더 풍부한 제어가 가능합니다.

| 필드                       | 설명                                                                                                                                                                                                                                                                                |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permissionDecision`       | `"allow"`는 권한 prompt를 건너뜁니다. `"deny"`는 tool call을 방지합니다. `"ask"`는 사용자에게 확인을 요청합니다. `"defer"`는 tool이 나중에 재개될 수 있도록 정상 종료합니다. [거부 및 질문 규칙](/permissions#manage-permissions)은 hook이 반환하는 것에 관계없이 여전히 평가됩니다 |
| `permissionDecisionReason` | `"allow"`와 `"ask"`의 경우 사용자에게 표시되지만 Claude에게는 표시되지 않습니다. `"deny"`의 경우 Claude에게 표시됩니다. `"defer"`의 경우 무시됩니다                                                                                                                                         |
| `updatedInput`             | 실행 전 tool의 입력 파라미터를 수정합니다. 전체 입력 객체를 교체하므로 수정된 필드와 함께 변경되지 않은 필드도 포함하세요. `"allow"`와 결합하여 자동 승인하거나, `"ask"`와 결합하여 수정된 입력을 사용자에게 보여줍니다. `"defer"`의 경우 무시됩니다                            |
| `additionalContext`        | tool이 실행되기 전에 Claude의 컨텍스트에 추가되는 문자열. `"defer"`의 경우 무시됩니다                                                                                                                                                                                                          |

여러 PreToolUse hook이 다른 결정을 반환하면 우선순위는 `deny` > `defer` > `ask` > `allow`입니다.

hook이 `"ask"`를 반환하면 사용자에게 표시되는 권한 prompt에 hook의 출처를 식별하는 레이블이 포함됩니다: 예를 들어 `[User]`, `[Project]`, `[Plugin]`, 또는 `[Local]`. 이를 통해 사용자는 어떤 구성 소스가 확인을 요청하는지 이해할 수 있습니다.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "My reason here",
    "updatedInput": {
      "field_to_modify": "new value"
    },
    "additionalContext": "Current environment: production. Proceed with caution."
  }
}
```

`AskUserQuestion`과 `ExitPlanMode`는 사용자 상호작용이 필요하며 `-p` 플래그를 사용한 [비대화형 모드](/headless)에서 일반적으로 차단됩니다. `permissionDecision: "allow"`와 `updatedInput`을 함께 반환하면 해당 요구 사항을 충족합니다: hook이 stdin에서 tool의 입력을 읽고, 자체 UI를 통해 답변을 수집하며, `updatedInput`에 반환하여 tool이 프롬프트 없이 실행됩니다. `"allow"`만 반환하는 것은 이러한 tool에 충분하지 않습니다. `AskUserQuestion`의 경우 원래 `questions` 배열을 다시 에코하고 각 질문의 텍스트를 선택한 답변에 매핑하는 [`answers`](#askuserquestion) 객체를 추가하세요.

::: info
PreToolUse는 이전에 최상위 `decision`과 `reason` 필드를 사용했지만, 이 이벤트에서는 더 이상 사용되지 않습니다. 대신 `hookSpecificOutput.permissionDecision`과 `hookSpecificOutput.permissionDecisionReason`을 사용하세요. 더 이상 사용되지 않는 값 `"approve"`와 `"block"`은 각각 `"allow"`와 `"deny"`에 매핑됩니다. PostToolUse 및 Stop과 같은 다른 이벤트는 현재 형식으로 최상위 `decision`과 `reason`을 계속 사용합니다.
:::

#### 나중을 위한 tool call 연기

`"defer"`는 `claude -p`를 하위 프로세스로 실행하고 JSON 출력을 읽는 통합(Agent SDK 앱이나 Claude Code 위에 구축된 커스텀 UI 등)을 위한 것입니다. 호출 프로세스가 tool call에서 Claude를 일시 중지하고, 자체 인터페이스를 통해 입력을 수집한 다음, 중단한 곳에서 재개할 수 있게 합니다. Claude Code는 `-p` 플래그를 사용한 [비대화형 모드](/headless)에서만 이 값을 허용합니다. 대화형 세션에서는 경고를 로그하고 hook 결과를 무시합니다.

::: info
`defer` 값은 Claude Code v2.1.89 이상이 필요합니다. 이전 버전은 이를 인식하지 못하며 tool은 일반 권한 흐름을 통해 진행됩니다.
:::

`AskUserQuestion` tool이 일반적인 경우입니다: Claude가 사용자에게 무언가를 묻고 싶지만 답변할 터미널이 없습니다. 왕복 과정은 다음과 같습니다:

1. Claude가 `AskUserQuestion`을 호출합니다. `PreToolUse` hook이 실행됩니다.
2. hook이 `permissionDecision: "defer"`를 반환합니다. tool은 실행되지 않습니다. 프로세스가 `stop_reason: "tool_deferred"`와 함께 종료되고 대기 중인 tool call이 대화록에 보존됩니다.
3. 호출 프로세스가 SDK 결과에서 `deferred_tool_use`를 읽고, 자체 UI에서 질문을 표시하며, 답변을 기다립니다.
4. 호출 프로세스가 `claude -p --resume <session-id>`를 실행합니다. 동일한 tool call이 `PreToolUse`를 다시 실행합니다.
5. hook이 `updatedInput`에 답변과 함께 `permissionDecision: "allow"`를 반환합니다. tool이 실행되고 Claude가 계속합니다.

`deferred_tool_use` 필드는 tool의 `id`, `name`, `input`을 포함합니다. `input`은 실행 전에 캡처된 Claude가 tool call을 위해 생성한 파라미터입니다:

```json
{
  "type": "result",
  "subtype": "success",
  "stop_reason": "tool_deferred",
  "session_id": "abc123",
  "deferred_tool_use": {
    "id": "toolu_01abc",
    "name": "AskUserQuestion",
    "input": { "questions": [{ "question": "Which framework?", "header": "Framework", "options": [{"label": "React"}, {"label": "Vue"}], "multiSelect": false }] }
  }
}
```

타임아웃이나 재시도 제한은 없습니다. 세션은 재개할 때까지 디스크에 남아 있습니다. 재개할 때 답변이 준비되지 않았으면 hook이 다시 `"defer"`를 반환할 수 있으며 프로세스는 같은 방식으로 종료됩니다. 호출 프로세스가 hook에서 최종적으로 `"allow"` 또는 `"deny"`를 반환하여 루프를 중단하는 시점을 제어합니다.

`"defer"`는 Claude가 턴에서 단일 tool call을 할 때만 작동합니다. Claude가 여러 tool call을 한 번에 하면 `"defer"`는 경고와 함께 무시되고 tool은 일반 권한 흐름을 통해 진행됩니다. 이 제약은 재개가 하나의 tool만 다시 실행할 수 있기 때문입니다: 배치에서 하나의 호출을 연기하면서 나머지를 미해결 상태로 둘 방법이 없습니다.

연기된 tool이 재개할 때 더 이상 사용할 수 없으면, hook이 실행되기 전에 `stop_reason: "tool_deferred_unavailable"`과 `is_error: true`로 프로세스가 종료됩니다. 이는 tool을 제공한 MCP 서버가 재개된 세션에 연결되지 않은 경우에 발생합니다. 어떤 tool이 사라졌는지 식별할 수 있도록 `deferred_tool_use` 페이로드는 여전히 포함됩니다.

::: warning
`--resume`은 이전 세션의 권한 모드를 복원하지 않습니다. tool이 연기되었을 때 활성이던 것과 동일한 `--permission-mode` 플래그를 재개 시 전달하세요. Claude Code는 모드가 다르면 경고를 로그합니다.
:::

### PermissionRequest

사용자에게 권한 대화상자가 표시될 때 실행됩니다.
[PermissionRequest 결정 제어](#permissionrequest-결정-제어)를 사용하여 사용자를 대신하여 허용하거나 거부할 수 있습니다.

PreToolUse와 동일한 값으로 tool 이름에 매칭합니다.

#### PermissionRequest 입력

PermissionRequest hook은 PreToolUse hook과 마찬가지로 `tool_name`과 `tool_input` 필드를 수신하지만, `tool_use_id`는 포함하지 않습니다. 선택적 `permission_suggestions` 배열에는 사용자가 권한 대화상자에서 일반적으로 볼 수 있는 "항상 허용" 옵션이 포함됩니다. 차이점은 hook이 실행되는 시점입니다: PermissionRequest hook은 사용자에게 권한 대화상자가 표시되려 할 때 실행되고, PreToolUse hook은 권한 상태에 관계없이 tool 실행 전에 실행됩니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf node_modules",
    "description": "Remove node_modules directory"
  },
  "permission_suggestions": [
    {
      "type": "addRules",
      "rules": [{ "toolName": "Bash", "ruleContent": "rm -rf node_modules" }],
      "behavior": "allow",
      "destination": "localSettings"
    }
  ]
}
```

#### PermissionRequest 결정 제어

`PermissionRequest` hook은 권한 요청을 허용하거나 거부할 수 있습니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 hook 스크립트는 다음 이벤트별 필드가 포함된 `decision` 객체를 반환할 수 있습니다:

| 필드                 | 설명                                                                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `behavior`           | `"allow"`는 권한을 부여하고, `"deny"`는 거부합니다                                                                                                                 |
| `updatedInput`       | `"allow"`에만 해당: 실행 전 tool의 입력 파라미터를 수정합니다. 전체 입력 객체를 교체하므로 수정된 필드와 함께 변경되지 않은 필드도 포함하세요    |
| `updatedPermissions` | `"allow"`에만 해당: 적용할 [권한 업데이트 항목](#권한-업데이트-항목) 배열로, 허용 규칙 추가 또는 세션 권한 모드 변경 등 |
| `message`            | `"deny"`에만 해당: 권한이 거부된 이유를 Claude에게 알립니다                                                                                                       |
| `interrupt`          | `"deny"`에만 해당: `true`이면 Claude를 중지합니다                                                                                                                          |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```

#### 권한 업데이트 항목

`updatedPermissions` 출력 필드와 [`permission_suggestions` 입력 필드](#permissionrequest-입력)는 동일한 항목 객체 배열을 사용합니다. 각 항목에는 다른 필드를 결정하는 `type`과 변경 사항이 기록되는 위치를 제어하는 `destination`이 있습니다.

| `type`              | 필드                               | 효과                                                                                                                                                                      |
| :------------------ | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addRules`          | `rules`, `behavior`, `destination` | 권한 규칙을 추가합니다. `rules`는 `{toolName, ruleContent?}` 객체의 배열입니다. 전체 tool과 매칭하려면 `ruleContent`를 생략합니다. `behavior`는 `"allow"`, `"deny"`, 또는 `"ask"` |
| `replaceRules`      | `rules`, `behavior`, `destination` | `destination`에서 주어진 `behavior`의 모든 규칙을 제공된 `rules`로 교체합니다                                                                                   |
| `removeRules`       | `rules`, `behavior`, `destination` | 주어진 `behavior`의 일치하는 규칙을 제거합니다                                                                                                              |
| `setMode`           | `mode`, `destination`              | 권한 모드를 변경합니다. 유효한 모드: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`                                                           |
| `addDirectories`    | `directories`, `destination`       | 작업 디렉토리를 추가합니다. `directories`는 경로 문자열 배열입니다                                                                                                         |
| `removeDirectories` | `directories`, `destination`       | 작업 디렉토리를 제거합니다                                                                                                                                 |

모든 항목의 `destination` 필드는 변경 사항이 메모리에만 남을지 설정 파일에 유지될지를 결정합니다.

| `destination`     | 기록 대상                                       |
| :---------------- | :---------------------------------------------- |
| `session`         | 메모리에만, 세션 종료 시 삭제됨 |
| `localSettings`   | `.claude/settings.local.json`                   |
| `projectSettings` | `.claude/settings.json`                         |
| `userSettings`    | `~/.claude/settings.json`                       |

hook은 수신한 `permission_suggestions` 중 하나를 자체 `updatedPermissions` 출력으로 에코할 수 있으며, 이는 사용자가 대화상자에서 해당 "항상 허용" 옵션을 선택하는 것과 동일합니다.

### PostToolUse

tool이 성공적으로 완료된 직후에 실행됩니다.

PreToolUse와 동일한 값으로 tool 이름에 매칭합니다.

#### PostToolUse 입력

`PostToolUse` hook은 tool이 이미 성공적으로 실행된 후에 실행됩니다. 입력에는 tool에 전송된 인수인 `tool_input`과 반환된 결과인 `tool_response`가 모두 포함됩니다. 둘 다의 정확한 스키마는 tool에 따라 다릅니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

#### PostToolUse 결정 제어

`PostToolUse` hook은 tool 실행 후 Claude에게 피드백을 제공할 수 있습니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 hook 스크립트는 다음 이벤트별 필드를 반환할 수 있습니다:

| 필드                   | 설명                                                                                |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `decision`             | `"block"`은 `reason`과 함께 Claude에 프롬프트합니다. 작업을 진행하려면 생략            |
| `reason`               | `decision`이 `"block"`일 때 Claude에게 표시되는 설명                                   |
| `additionalContext`    | Claude가 고려할 추가 컨텍스트                                                  |
| `updatedMCPToolOutput` | [MCP tool](#mcp-tool-매칭) 전용: tool의 출력을 제공된 값으로 교체 |

```json
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Additional information for Claude"
  }
}
```

### PostToolUseFailure

tool 실행이 실패할 때 실행됩니다. 이 이벤트는 오류를 throw하거나 실패 결과를 반환하는 tool call에 대해 실행됩니다. 실패를 로깅하거나, 경고를 보내거나, Claude에게 수정 피드백을 제공하는 데 사용합니다.

PreToolUse와 동일한 값으로 tool 이름에 매칭합니다.

#### PostToolUseFailure 입력

PostToolUseFailure hook은 PostToolUse와 동일한 `tool_name`과 `tool_input` 필드를 수신하며, 최상위 필드로 오류 정보도 수신합니다:

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUseFailure",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite"
  },
  "tool_use_id": "toolu_01ABC123...",
  "error": "Command exited with non-zero status code 1",
  "is_interrupt": false
}
```

| 필드           | 설명                                                                     |
| :------------- | :------------------------------------------------------------------------------ |
| `error`        | 무엇이 잘못되었는지 설명하는 문자열                                               |
| `is_interrupt` | 실패가 사용자 중단에 의해 발생했는지를 나타내는 선택적 boolean |

#### PostToolUseFailure 결정 제어

`PostToolUseFailure` hook은 tool 실패 후 Claude에게 컨텍스트를 제공할 수 있습니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 hook 스크립트는 다음 이벤트별 필드를 반환할 수 있습니다:

| 필드                | 설명                                                   |
| :------------------ | :------------------------------------------------------------ |
| `additionalContext` | 오류와 함께 Claude가 고려할 추가 컨텍스트 |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUseFailure",
    "additionalContext": "Additional information about the failure for Claude"
  }
}
```

### PermissionDenied

[auto mode](/permission-modes#eliminate-prompts-with-auto-mode) classifier가 tool call을 거부할 때 실행됩니다. 이 hook은 auto mode에서만 실행됩니다: 수동으로 권한 대화상자를 거부하거나, `PreToolUse` hook이 호출을 차단하거나, `deny` 규칙이 일치할 때는 실행되지 않습니다. classifier 거부를 로깅하거나, 구성을 조정하거나, 모델에 tool call을 재시도할 수 있음을 알리는 데 사용합니다.

PreToolUse와 동일한 값으로 tool 이름에 매칭합니다.

#### PermissionDenied 입력

[공통 입력 필드](#공통-입력-필드) 외에 PermissionDenied hook은 `tool_name`, `tool_input`, `tool_use_id`, `reason`을 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "auto",
  "hook_event_name": "PermissionDenied",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/build",
    "description": "Clean build directory"
  },
  "tool_use_id": "toolu_01ABC123...",
  "reason": "Auto mode denied: command targets a path outside the project"
}
```

| 필드     | 설명                                                   |
| :------- | :------------------------------------------------------------ |
| `reason` | classifier가 tool call을 거부한 이유 설명 |

#### PermissionDenied 결정 제어

PermissionDenied hook은 모델에 거부된 tool call을 재시도할 수 있음을 알릴 수 있습니다. `hookSpecificOutput.retry`가 `true`로 설정된 JSON 객체를 반환합니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionDenied",
    "retry": true
  }
}
```

`retry`가 `true`이면 Claude Code는 모델에 tool call을 재시도할 수 있다는 메시지를 대화에 추가합니다. 거부 자체는 취소되지 않습니다. hook이 JSON을 반환하지 않거나 `retry: false`를 반환하면 거부가 유지되고 모델은 원래 거부 메시지를 수신합니다.

### Notification

Claude Code가 알림을 보낼 때 실행됩니다. 알림 유형에 매칭합니다: `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`. 모든 알림 유형에 대해 hook을 실행하려면 matcher를 생략하세요.

별도의 matcher를 사용하여 알림 유형에 따라 다른 handler를 실행합니다. 이 구성은 Claude가 권한 승인이 필요할 때 권한별 경고 스크립트를 트리거하고, Claude가 유휴 상태일 때 다른 알림을 트리거합니다:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/permission-alert.sh"
          }
        ]
      },
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/idle-notification.sh"
          }
        ]
      }
    ]
  }
}
```

#### Notification 입력

[공통 입력 필드](#공통-입력-필드) 외에 Notification hook은 알림 텍스트가 포함된 `message`, 선택적 `title`, 어떤 유형이 실행되었는지를 나타내는 `notification_type`을 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "title": "Permission needed",
  "notification_type": "permission_prompt"
}
```

Notification hook은 알림을 차단하거나 수정할 수 없습니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 `additionalContext`를 반환하여 대화에 컨텍스트를 추가할 수 있습니다:

| 필드                | 설명                      |
| :------------------ | :------------------------------- |
| `additionalContext` | Claude의 컨텍스트에 추가되는 문자열 |

### SubagentStart

Agent tool을 통해 Claude Code subagent가 생성될 때 실행됩니다. agent 유형 이름으로 필터링하는 matcher를 지원합니다(내장 agent인 `Bash`, `Explore`, `Plan` 또는 `.claude/agents/`의 커스텀 agent 이름).

#### SubagentStart 입력

[공통 입력 필드](#공통-입력-필드) 외에 SubagentStart hook은 subagent의 고유 식별자인 `agent_id`와 agent 이름(내장 agent인 `"Bash"`, `"Explore"`, `"Plan"` 또는 커스텀 agent 이름)인 `agent_type`을 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SubagentStart",
  "agent_id": "agent-abc123",
  "agent_type": "Explore"
}
```

SubagentStart hook은 subagent 생성을 차단할 수 없지만 subagent에 컨텍스트를 주입할 수 있습니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 반환할 수 있는 필드:

| 필드                | 설명                            |
| :------------------ | :------------------------------------- |
| `additionalContext` | subagent의 컨텍스트에 추가되는 문자열 |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Follow security guidelines for this task"
  }
}
```

### SubagentStop

Claude Code subagent가 응답을 완료했을 때 실행됩니다. SubagentStart와 동일한 값으로 agent 유형에 매칭합니다.

#### SubagentStop 입력

[공통 입력 필드](#공통-입력-필드) 외에 SubagentStop hook은 `stop_hook_active`, `agent_id`, `agent_type`, `agent_transcript_path`, `last_assistant_message`를 수신합니다. `agent_type` 필드는 matcher 필터링에 사용되는 값입니다. `transcript_path`는 메인 세션의 대화록이고, `agent_transcript_path`는 중첩된 `subagents/` 폴더에 저장된 subagent 자체의 대화록입니다. `last_assistant_message` 필드는 subagent의 최종 응답의 텍스트 내용을 포함하므로 대화록 파일을 파싱하지 않고도 hook이 접근할 수 있습니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false,
  "agent_id": "def456",
  "agent_type": "Explore",
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl",
  "last_assistant_message": "Analysis complete. Found 3 potential issues..."
}
```

SubagentStop hook은 [Stop hook](#stop-결정-제어)과 동일한 결정 제어 형식을 사용합니다.

### TaskCreated

`TaskCreate` tool을 통해 task가 생성될 때 실행됩니다. 이를 사용하여 이름 규칙을 시행하거나, task 설명을 요구하거나, 특정 task의 생성을 방지할 수 있습니다.

`TaskCreated` hook이 exit code 2로 종료하면 task가 생성되지 않고 stderr 메시지가 모델에 피드백으로 전달됩니다. 팀원을 다시 실행하는 대신 완전히 중지하려면 `{"continue": false, "stopReason": "..."}`가 포함된 JSON을 반환하세요. TaskCreated hook은 matcher를 지원하지 않으며 모든 발생 시 실행됩니다.

#### TaskCreated 입력

[공통 입력 필드](#공통-입력-필드) 외에 TaskCreated hook은 `task_id`, `task_subject`, 선택적으로 `task_description`, `teammate_name`, `team_name`을 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TaskCreated",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

| 필드               | 설명                                           |
| :----------------- | :---------------------------------------------------- |
| `task_id`          | 생성 중인 task의 식별자                  |
| `task_subject`     | task 제목                                     |
| `task_description` | task의 상세 설명. 없을 수 있음       |
| `teammate_name`    | task를 생성하는 팀원의 이름. 없을 수 있음 |
| `team_name`        | 팀 이름. 없을 수 있음                       |

#### TaskCreated 결정 제어

TaskCreated hook은 task 생성을 제어하는 두 가지 방법을 지원합니다:

* **Exit code 2**: task가 생성되지 않고 stderr 메시지가 모델에 피드백으로 전달됩니다.
* **JSON `{"continue": false, "stopReason": "..."}`**: 팀원을 완전히 중지하며, `Stop` hook 동작과 일치합니다. `stopReason`은 사용자에게 표시됩니다.

이 예시는 제목이 필수 형식을 따르지 않는 task를 차단합니다:

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if [[ ! "$TASK_SUBJECT" =~ ^\[TICKET-[0-9]+\] ]]; then
  echo "Task subject must start with a ticket number, e.g. '[TICKET-123] Add feature'" >&2
  exit 2
fi

exit 0
```

### TaskCompleted

task가 완료로 표시될 때 실행됩니다. 이는 두 가지 상황에서 실행됩니다: agent가 TaskUpdate tool을 통해 task를 명시적으로 완료로 표시할 때, 또는 [agent team](/agent-teams) 팀원이 진행 중인 task와 함께 턴을 마칠 때. 이를 사용하여 task를 닫기 전에 테스트 통과나 린트 검사와 같은 완료 기준을 시행할 수 있습니다.

`TaskCompleted` hook이 exit code 2로 종료하면 task가 완료로 표시되지 않고 stderr 메시지가 모델에 피드백으로 전달됩니다. 팀원을 다시 실행하는 대신 완전히 중지하려면 `{"continue": false, "stopReason": "..."}`가 포함된 JSON을 반환하세요. TaskCompleted hook은 matcher를 지원하지 않으며 모든 발생 시 실행됩니다.

#### TaskCompleted 입력

[공통 입력 필드](#공통-입력-필드) 외에 TaskCompleted hook은 `task_id`, `task_subject`, 선택적으로 `task_description`, `teammate_name`, `team_name`을 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TaskCompleted",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

| 필드               | 설명                                             |
| :----------------- | :------------------------------------------------------ |
| `task_id`          | 완료되는 task의 식별자                  |
| `task_subject`     | task 제목                                       |
| `task_description` | task의 상세 설명. 없을 수 있음         |
| `teammate_name`    | task를 완료하는 팀원의 이름. 없을 수 있음 |
| `team_name`        | 팀 이름. 없을 수 있음                         |

#### TaskCompleted 결정 제어

TaskCompleted hook은 task 완료를 제어하는 두 가지 방법을 지원합니다:

* **Exit code 2**: task가 완료로 표시되지 않고 stderr 메시지가 모델에 피드백으로 전달됩니다.
* **JSON `{"continue": false, "stopReason": "..."}`**: 팀원을 완전히 중지하며, `Stop` hook 동작과 일치합니다. `stopReason`은 사용자에게 표시됩니다.

이 예시는 테스트를 실행하고 실패하면 task 완료를 차단합니다:

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

# Run the test suite
if ! npm test 2>&1; then
  echo "Tests not passing. Fix failing tests before completing: $TASK_SUBJECT" >&2
  exit 2
fi

exit 0
```

### Stop

메인 Claude Code agent가 응답을 완료했을 때 실행됩니다. 사용자 중단으로 인한 중지에서는 실행되지 않습니다. API 오류는 [StopFailure](#stopfailure)를 대신 실행합니다.

#### Stop 입력

[공통 입력 필드](#공통-입력-필드) 외에 Stop hook은 `stop_hook_active`와 `last_assistant_message`를 수신합니다. `stop_hook_active` 필드는 Claude Code가 이미 stop hook의 결과로 계속하고 있을 때 `true`입니다. 이 값을 확인하거나 대화록을 처리하여 Claude Code가 무한히 실행되는 것을 방지하세요. `last_assistant_message` 필드는 Claude의 최종 응답의 텍스트 내용을 포함하므로 대화록 파일을 파싱하지 않고도 hook이 접근할 수 있습니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true,
  "last_assistant_message": "I've completed the refactoring. Here's a summary..."
}
```

#### Stop 결정 제어

`Stop`과 `SubagentStop` hook은 Claude가 계속할지 여부를 제어할 수 있습니다. 모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 hook 스크립트는 다음 이벤트별 필드를 반환할 수 있습니다:

| 필드       | 설명                                                                |
| :--------- | :------------------------------------------------------------------------- |
| `decision` | `"block"`은 Claude의 중지를 방지합니다. Claude를 중지시키려면 생략      |
| `reason`   | `decision`이 `"block"`일 때 필수. Claude에게 계속해야 하는 이유를 알림 |

```json
{
  "decision": "block",
  "reason": "Must be provided when Claude is blocked from stopping"
}
```

### StopFailure

턴이 API 오류로 종료될 때 [Stop](#stop) 대신 실행됩니다. 출력과 exit code는 무시됩니다. rate limit, 인증 문제 또는 기타 API 오류로 인해 Claude가 응답을 완료할 수 없을 때 실패를 로깅하거나, 경고를 보내거나, 복구 작업을 수행하는 데 사용합니다.

#### StopFailure 입력

[공통 입력 필드](#공통-입력-필드) 외에 StopFailure hook은 `error`, 선택적 `error_details`, 선택적 `last_assistant_message`를 수신합니다. `error` 필드는 오류 유형을 식별하며 matcher 필터링에 사용됩니다.

| 필드                     | 설명                                                                                                                                                                                                                                      |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`                  | 오류 유형: `rate_limit`, `authentication_failed`, `billing_error`, `invalid_request`, `server_error`, `max_output_tokens`, 또는 `unknown`                                                         |
| `error_details`          | 사용 가능한 경우 오류에 대한 추가 세부 정보                                                                                                                                                                                               |
| `last_assistant_message` | 대화에 표시되는 렌더링된 오류 텍스트. `Stop`과 `SubagentStop`에서 이 필드가 Claude의 대화 출력을 담는 것과 달리, `StopFailure`에서는 `"API Error: Rate limit reached"` 같은 API 오류 문자열 자체를 포함합니다 |

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "StopFailure",
  "error": "rate_limit",
  "error_details": "429 Too Many Requests",
  "last_assistant_message": "API Error: Rate limit reached"
}
```

StopFailure hook에는 결정 제어가 없습니다. 알림 및 로깅 목적으로만 실행됩니다.

### TeammateIdle

[agent team](/agent-teams) 팀원이 턴을 마친 후 유휴 상태로 전환하려 할 때 실행됩니다. 팀원이 작업을 중지하기 전에 린트 검사 통과 또는 출력 파일 존재 확인과 같은 품질 게이트를 시행하는 데 사용합니다.

`TeammateIdle` hook이 exit code 2로 종료하면 팀원은 stderr 메시지를 피드백으로 받고 유휴 상태로 전환하는 대신 계속 작업합니다. 팀원을 다시 실행하는 대신 완전히 중지하려면 `{"continue": false, "stopReason": "..."}`가 포함된 JSON을 반환하세요. TeammateIdle hook은 matcher를 지원하지 않으며 모든 발생 시 실행됩니다.

#### TeammateIdle 입력

[공통 입력 필드](#공통-입력-필드) 외에 TeammateIdle hook은 `teammate_name`과 `team_name`을 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TeammateIdle",
  "teammate_name": "researcher",
  "team_name": "my-project"
}
```

| 필드            | 설명                                   |
| :-------------- | :-------------------------------------------- |
| `teammate_name` | 유휴 상태로 전환하려는 팀원의 이름 |
| `team_name`     | 팀 이름                              |

#### TeammateIdle 결정 제어

TeammateIdle hook은 팀원 동작을 제어하는 두 가지 방법을 지원합니다:

* **Exit code 2**: 팀원이 stderr 메시지를 피드백으로 받고 유휴 상태로 전환하는 대신 계속 작업합니다.
* **JSON `{"continue": false, "stopReason": "..."}`**: 팀원을 완전히 중지하며, `Stop` hook 동작과 일치합니다. `stopReason`은 사용자에게 표시됩니다.

이 예시는 팀원이 유휴 상태로 전환하기 전에 빌드 아티팩트가 존재하는지 확인합니다:

```bash
#!/bin/bash

if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2
fi

exit 0
```

### ConfigChange

세션 중 구성 파일이 변경될 때 실행됩니다. 설정 변경 감사, 보안 정책 시행, 구성 파일에 대한 무단 수정 차단에 사용합니다.

ConfigChange hook은 설정 파일, 관리형 정책 설정, skill 파일의 변경에 대해 실행됩니다. 입력의 `source` 필드는 어떤 유형의 구성이 변경되었는지 알려주고, 선택적 `file_path` 필드는 변경된 파일의 경로를 제공합니다.

matcher는 구성 소스로 필터링합니다:

| Matcher            | 실행 시점                             |
| :----------------- | :---------------------------------------- |
| `user_settings`    | `~/.claude/settings.json` 변경         |
| `project_settings` | `.claude/settings.json` 변경           |
| `local_settings`   | `.claude/settings.local.json` 변경     |
| `policy_settings`  | 관리형 정책 설정 변경            |
| `skills`           | `.claude/skills/`의 skill 파일 변경 |

이 예시는 보안 감사를 위해 모든 구성 변경을 로깅합니다:

```json
{
  "hooks": {
    "ConfigChange": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/audit-config-change.sh"
          }
        ]
      }
    ]
  }
}
```

#### ConfigChange 입력

[공통 입력 필드](#공통-입력-필드) 외에 ConfigChange hook은 `source`와 선택적으로 `file_path`를 수신합니다. `source` 필드는 어떤 구성 유형이 변경되었는지 나타내고, `file_path`는 수정된 특정 파일의 경로를 제공합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "ConfigChange",
  "source": "project_settings",
  "file_path": "/Users/.../my-project/.claude/settings.json"
}
```

#### ConfigChange 결정 제어

ConfigChange hook은 구성 변경이 적용되는 것을 차단할 수 있습니다. exit code 2 또는 JSON `decision`을 사용하여 변경을 방지합니다. 차단되면 새 설정이 실행 중인 세션에 적용되지 않습니다.

| 필드       | 설명                                                                              |
| :--------- | :--------------------------------------------------------------------------------------- |
| `decision` | `"block"`은 구성 변경이 적용되는 것을 방지합니다. 변경을 허용하려면 생략 |
| `reason`   | `decision`이 `"block"`일 때 사용자에게 표시되는 설명                               |

```json
{
  "decision": "block",
  "reason": "Configuration changes to project settings require admin approval"
}
```

`policy_settings` 변경은 차단할 수 없습니다. `policy_settings` 소스에 대해 hook은 여전히 실행되므로 감사 로깅에 사용할 수 있지만, 차단 결정은 무시됩니다. 이를 통해 엔터프라이즈 관리형 설정이 항상 적용됩니다.

### CwdChanged

세션 중 작업 디렉토리가 변경될 때 실행됩니다. 예를 들어 Claude가 `cd` 명령을 실행할 때입니다. 디렉토리 변경에 반응하는 데 사용합니다: 환경 변수 다시 로드, 프로젝트별 도구 체인 활성화, 설정 스크립트 자동 실행 등. 디렉토리별 환경을 관리하는 [direnv](https://direnv.net/) 같은 도구와 [FileChanged](#filechanged)를 함께 사용합니다.

CwdChanged hook은 `CLAUDE_ENV_FILE`에 접근할 수 있습니다. 해당 파일에 작성된 변수는 [SessionStart hook](#환경-변수-유지)과 마찬가지로 세션의 후속 Bash 명령에 유지됩니다. `type: "command"` hook만 지원됩니다.

CwdChanged는 matcher를 지원하지 않으며 모든 디렉토리 변경 시 실행됩니다.

#### CwdChanged 입력

[공통 입력 필드](#공통-입력-필드) 외에 CwdChanged hook은 `old_cwd`와 `new_cwd`를 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project/src",
  "hook_event_name": "CwdChanged",
  "old_cwd": "/Users/my-project",
  "new_cwd": "/Users/my-project/src"
}
```

#### CwdChanged 출력

모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 CwdChanged hook은 `watchPaths`를 반환하여 [FileChanged](#filechanged)가 감시하는 파일 경로를 동적으로 설정할 수 있습니다:

| 필드         | 설명                                                                                                                                                                                                                     |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `watchPaths` | 절대 경로 배열. 현재 동적 감시 목록을 교체합니다(`matcher` 구성의 경로는 항상 감시됨). 빈 배열을 반환하면 동적 목록이 지워지며, 이는 새 디렉토리에 진입할 때 일반적입니다 |

CwdChanged hook에는 결정 제어가 없습니다. 디렉토리 변경을 차단할 수 없습니다.

### FileChanged

감시 중인 파일이 디스크에서 변경될 때 실행됩니다. 프로젝트 구성 파일이 수정될 때 환경 변수를 다시 로드하는 데 유용합니다.

이 이벤트의 `matcher`는 두 가지 역할을 합니다:

* **감시 목록 구성**: 값이 `|`로 분할되고 각 세그먼트가 작업 디렉토리의 리터럴 파일명으로 등록되므로, `".envrc|.env"`는 정확히 해당 두 파일을 감시합니다. 정규식 패턴은 여기서 유용하지 않습니다: `^\.env`와 같은 값은 리터럴로 `^\.env`라는 이름의 파일을 감시합니다.
* **실행할 hook 필터링**: 감시 중인 파일이 변경되면 동일한 값이 변경된 파일의 basename에 대해 표준 [matcher 규칙](#matcher-패턴)을 사용하여 어떤 hook 그룹이 실행되는지 필터링합니다.

FileChanged hook은 `CLAUDE_ENV_FILE`에 접근할 수 있습니다. 해당 파일에 작성된 변수는 [SessionStart hook](#환경-변수-유지)과 마찬가지로 세션의 후속 Bash 명령에 유지됩니다. `type: "command"` hook만 지원됩니다.

#### FileChanged 입력

[공통 입력 필드](#공통-입력-필드) 외에 FileChanged hook은 `file_path`와 `event`를 수신합니다.

| 필드        | 설명                                                                                     |
| :---------- | :---------------------------------------------------------------------------------------------- |
| `file_path` | 변경된 파일의 절대 경로                                                          |
| `event`     | 무슨 일이 일어났는지: `"change"` (파일 수정), `"add"` (파일 생성), 또는 `"unlink"` (파일 삭제) |

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "FileChanged",
  "file_path": "/Users/my-project/.envrc",
  "event": "change"
}
```

#### FileChanged 출력

모든 hook에 사용 가능한 [JSON 출력 필드](#json-출력) 외에 FileChanged hook은 `watchPaths`를 반환하여 감시하는 파일 경로를 동적으로 업데이트할 수 있습니다:

| 필드         | 설명                                                                                                                                                                                                                 |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `watchPaths` | 절대 경로 배열. 현재 동적 감시 목록을 교체합니다(`matcher` 구성의 경로는 항상 감시됨). 변경된 파일을 기반으로 hook 스크립트가 감시할 추가 파일을 발견할 때 사용 |

FileChanged hook에는 결정 제어가 없습니다. 파일 변경이 발생하는 것을 차단할 수 없습니다.

### WorktreeCreate

`claude --worktree`를 실행하거나 [subagent가 `isolation: "worktree"`를 사용](/sub-agents#choose-the-subagent-scope)하면 Claude Code가 `git worktree`를 사용하여 격리된 작업 복사본을 생성합니다. WorktreeCreate hook을 구성하면 기본 git 동작을 대체하여 SVN, Perforce, Mercurial과 같은 다른 버전 관리 시스템을 사용할 수 있습니다.

hook이 기본 동작을 완전히 대체하므로 [`.worktreeinclude`](/common-workflows#copy-gitignored-files-to-worktrees)는 처리되지 않습니다. `.env`와 같은 로컬 구성 파일을 새 worktree에 복사해야 하면 hook 스크립트 내에서 수행하세요.

hook은 생성된 worktree 디렉토리의 절대 경로를 반환해야 합니다. Claude Code는 이 경로를 격리된 세션의 작업 디렉토리로 사용합니다. Command hook은 stdout에 출력하고, HTTP hook은 `hookSpecificOutput.worktreePath`를 통해 반환합니다.

이 예시는 SVN 작업 복사본을 생성하고 Claude Code가 사용할 경로를 출력합니다. 저장소 URL을 자신의 것으로 교체하세요:

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); DIR=\"$HOME/.claude/worktrees/$NAME\"; svn checkout https://svn.example.com/repo/trunk \"$DIR\" >&2 && echo \"$DIR\"'"
          }
        ]
      }
    ]
  }
}
```

hook은 stdin의 JSON 입력에서 worktree `name`을 읽고, 새 디렉토리에 새 복사본을 체크아웃하며, 디렉토리 경로를 출력합니다. 마지막 줄의 `echo`가 Claude Code가 worktree 경로로 읽는 것입니다. 경로에 방해가 되지 않도록 다른 모든 출력을 stderr로 리디렉션하세요.

#### WorktreeCreate 입력

[공통 입력 필드](#공통-입력-필드) 외에 WorktreeCreate hook은 `name` 필드를 수신합니다. 이는 새 worktree의 슬러그 식별자로, 사용자가 지정하거나 자동 생성됩니다(예: `bold-oak-a3f2`).

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "WorktreeCreate",
  "name": "feature-auth"
}
```

#### WorktreeCreate 출력

WorktreeCreate hook은 표준 allow/block 결정 모델을 사용하지 않습니다. 대신 hook의 성공 또는 실패가 결과를 결정합니다. hook은 생성된 worktree 디렉토리의 절대 경로를 반환해야 합니다:

* **Command hook** (`type: "command"`): stdout에 경로를 출력합니다.
* **HTTP hook** (`type: "http"`): 응답 본문에 `{ "hookSpecificOutput": { "hookEventName": "WorktreeCreate", "worktreePath": "/absolute/path" } }`를 반환합니다.

hook이 실패하거나 경로를 생성하지 않으면 worktree 생성이 오류와 함께 실패합니다.

### WorktreeRemove

[WorktreeCreate](#worktreecreate)의 정리 대응입니다. 이 hook은 worktree가 제거될 때 실행됩니다. `--worktree` 세션을 종료하고 제거를 선택할 때 또는 `isolation: "worktree"`가 있는 subagent가 완료될 때입니다. git 기반 worktree의 경우 Claude가 `git worktree remove`로 자동 정리합니다. 비git 버전 관리 시스템을 위해 WorktreeCreate hook을 구성했다면 정리를 처리하는 WorktreeRemove hook과 함께 사용하세요. 없으면 worktree 디렉토리가 디스크에 남습니다.

Claude Code는 WorktreeCreate가 반환한 경로를 hook 입력의 `worktree_path`로 전달합니다. 이 예시는 해당 경로를 읽고 디렉토리를 제거합니다:

```json
{
  "hooks": {
    "WorktreeRemove": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'jq -r .worktree_path | xargs rm -rf'"
          }
        ]
      }
    ]
  }
}
```

#### WorktreeRemove 입력

[공통 입력 필드](#공통-입력-필드) 외에 WorktreeRemove hook은 제거되는 worktree의 절대 경로인 `worktree_path` 필드를 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "WorktreeRemove",
  "worktree_path": "/Users/.../my-project/.claude/worktrees/feature-auth"
}
```

WorktreeRemove hook에는 결정 제어가 없습니다. worktree 제거를 차단할 수 없지만 버전 관리 상태 제거 또는 변경 사항 보관과 같은 정리 작업을 수행할 수 있습니다. hook 실패는 디버그 모드에서만 로그됩니다.

### PreCompact

Claude Code가 compact 작업을 수행하려 할 때 실행됩니다.

matcher 값은 압축이 수동으로 트리거되었는지 자동으로 트리거되었는지를 나타냅니다:

| Matcher  | 실행 시점                                |
| :------- | :------------------------------------------- |
| `manual` | `/compact`                                   |
| `auto`   | 컨텍스트 윈도우가 가득 찼을 때 자동 압축 |

exit code 2로 종료하여 압축을 차단합니다. 수동 `/compact`의 경우 stderr 메시지가 사용자에게 표시됩니다. `"decision": "block"`이 포함된 JSON을 반환하여 차단할 수도 있습니다.

자동 압축 차단은 실행 시점에 따라 다른 효과를 가집니다. 컨텍스트 한도 전에 사전에 트리거된 압축이면 Claude Code가 건너뛰고 대화가 압축되지 않은 채로 계속됩니다. API에서 이미 반환된 컨텍스트 한도 오류로부터 복구하기 위해 트리거된 압축이면 기본 오류가 표면화되고 현재 요청이 실패합니다.

#### PreCompact 입력

[공통 입력 필드](#공통-입력-필드) 외에 PreCompact hook은 `trigger`와 `custom_instructions`를 수신합니다. `manual`의 경우 `custom_instructions`에는 사용자가 `/compact`에 전달한 내용이 포함됩니다. `auto`의 경우 `custom_instructions`는 비어 있습니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PreCompact",
  "trigger": "manual",
  "custom_instructions": ""
}
```

### PostCompact

Claude Code가 compact 작업을 완료한 후 실행됩니다. 이 이벤트를 사용하여 새로운 압축 상태에 반응합니다. 예를 들어 생성된 요약을 로깅하거나 외부 상태를 업데이트합니다.

`PreCompact`와 동일한 matcher 값이 적용됩니다:

| Matcher  | 실행 시점                                      |
| :------- | :------------------------------------------------- |
| `manual` | `/compact` 이후                                   |
| `auto`   | 컨텍스트 윈도우가 가득 찼을 때 자동 압축 이후 |

#### PostCompact 입력

[공통 입력 필드](#공통-입력-필드) 외에 PostCompact hook은 `trigger`와 `compact_summary`를 수신합니다. `compact_summary` 필드에는 compact 작업에서 생성된 대화 요약이 포함됩니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PostCompact",
  "trigger": "manual",
  "compact_summary": "Summary of the compacted conversation..."
}
```

PostCompact hook에는 결정 제어가 없습니다. 압축 결과에 영향을 줄 수 없지만 후속 작업을 수행할 수 있습니다.

### SessionEnd

Claude Code 세션이 종료될 때 실행됩니다. 정리 작업, 세션 통계 로깅, 세션 상태 저장에 유용합니다. 종료 이유로 필터링하는 matcher를 지원합니다.

hook 입력의 `reason` 필드는 세션이 종료된 이유를 나타냅니다:

| Reason                        | 설명                                |
| :---------------------------- | :----------------------------------------- |
| `clear`                       | `/clear` 명령으로 세션 정리됨      |
| `resume`                      | 대화형 `/resume`을 통해 세션 전환 |
| `logout`                      | 사용자 로그아웃                            |
| `prompt_input_exit`           | prompt 입력이 표시된 상태에서 사용자 종료 |
| `bypass_permissions_disabled` | bypass permissions 모드가 비활성화됨       |
| `other`                       | 기타 종료 이유                         |

#### SessionEnd 입력

[공통 입력 필드](#공통-입력-필드) 외에 SessionEnd hook은 세션이 종료된 이유를 나타내는 `reason` 필드를 수신합니다. 모든 값은 위의 [이유 표](#sessionend)를 참조하세요.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```

SessionEnd hook에는 결정 제어가 없습니다. 세션 종료를 차단할 수 없지만 정리 작업을 수행할 수 있습니다.

SessionEnd hook의 기본 타임아웃은 1.5초입니다. 이는 세션 종료, `/clear`, 대화형 `/resume`을 통한 세션 전환에 적용됩니다. hook이 더 많은 시간이 필요하면 hook 구성에서 hook별 `timeout`을 설정하세요. 전체 예산은 설정 파일에 구성된 가장 높은 hook별 타임아웃으로 자동 상향되며, 최대 60초입니다. 플러그인이 제공하는 hook에 설정된 타임아웃은 예산을 올리지 않습니다. 예산을 명시적으로 재정의하려면 `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` 환경 변수를 밀리초로 설정하세요.

```bash
CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=5000 claude
```

### Elicitation

MCP 서버가 작업 중 사용자 입력을 요청할 때 실행됩니다. 기본적으로 Claude Code는 사용자가 응답할 수 있는 대화형 대화상자를 표시합니다. hook은 이 요청을 가로채고 대화상자를 완전히 건너뛰고 프로그래밍 방식으로 응답할 수 있습니다.

matcher 필드는 MCP 서버 이름에 매칭합니다.

#### Elicitation 입력

[공통 입력 필드](#공통-입력-필드) 외에 Elicitation hook은 `mcp_server_name`, `message`, 선택적 `mode`, `url`, `elicitation_id`, `requested_schema` 필드를 수신합니다.

폼 모드 elicitation (가장 일반적인 경우):

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Elicitation",
  "mcp_server_name": "my-mcp-server",
  "message": "Please provide your credentials",
  "mode": "form",
  "requested_schema": {
    "type": "object",
    "properties": {
      "username": { "type": "string", "title": "Username" }
    }
  }
}
```

URL 모드 elicitation (브라우저 기반 인증):

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Elicitation",
  "mcp_server_name": "my-mcp-server",
  "message": "Please authenticate",
  "mode": "url",
  "url": "https://auth.example.com/login"
}
```

#### Elicitation 출력

대화상자를 표시하지 않고 프로그래밍 방식으로 응답하려면 `hookSpecificOutput`이 포함된 JSON 객체를 반환합니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "Elicitation",
    "action": "accept",
    "content": {
      "username": "alice"
    }
  }
}
```

| 필드      | 값                            | 설명                                                      |
| :-------- | :---------------------------- | :--------------------------------------------------------------- |
| `action`  | `accept`, `decline`, `cancel` | 요청을 수락, 거절 또는 취소할지 여부                |
| `content` | object                        | 제출할 폼 필드 값. `action`이 `accept`일 때만 사용 |

Exit code 2는 elicitation을 거부하고 stderr를 사용자에게 표시합니다.

### ElicitationResult

사용자가 MCP elicitation에 응답한 후 실행됩니다. hook은 응답이 MCP 서버로 다시 전송되기 전에 관찰, 수정 또는 차단할 수 있습니다.

matcher 필드는 MCP 서버 이름에 매칭합니다.

#### ElicitationResult 입력

[공통 입력 필드](#공통-입력-필드) 외에 ElicitationResult hook은 `mcp_server_name`, `action`, 선택적 `mode`, `elicitation_id`, `content` 필드를 수신합니다.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "ElicitationResult",
  "mcp_server_name": "my-mcp-server",
  "action": "accept",
  "content": { "username": "alice" },
  "mode": "form",
  "elicitation_id": "elicit-123"
}
```

#### ElicitationResult 출력

사용자의 응답을 재정의하려면 `hookSpecificOutput`이 포함된 JSON 객체를 반환합니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "ElicitationResult",
    "action": "decline",
    "content": {}
  }
}
```

| 필드      | 값                            | 설명                                                            |
| :-------- | :---------------------------- | :--------------------------------------------------------------------- |
| `action`  | `accept`, `decline`, `cancel` | 사용자의 action을 재정의                                            |
| `content` | object                        | 폼 필드 값을 재정의. `action`이 `accept`일 때만 의미 있음 |

Exit code 2는 응답을 차단하고 유효 action을 `decline`으로 변경합니다.

## Prompt 기반 hook

command 및 HTTP hook 외에도 Claude Code는 LLM을 사용하여 작업의 허용 또는 차단 여부를 평가하는 prompt 기반 hook(`type: "prompt"`)과 tool 접근이 가능한 에이전트 검증기를 생성하는 agent hook(`type: "agent"`)을 지원합니다. 모든 이벤트가 모든 hook 유형을 지원하는 것은 아닙니다.

네 가지 hook 유형(`command`, `http`, `prompt`, `agent`)을 모두 지원하는 이벤트:

* `PermissionRequest`
* `PostToolUse`
* `PostToolUseFailure`
* `PreToolUse`
* `Stop`
* `SubagentStop`
* `TaskCompleted`
* `TaskCreated`
* `UserPromptSubmit`

`command`와 `http` hook은 지원하지만 `prompt`나 `agent`는 지원하지 않는 이벤트:

* `ConfigChange`
* `CwdChanged`
* `Elicitation`
* `ElicitationResult`
* `FileChanged`
* `InstructionsLoaded`
* `Notification`
* `PermissionDenied`
* `PostCompact`
* `PreCompact`
* `SessionEnd`
* `StopFailure`
* `SubagentStart`
* `TeammateIdle`
* `WorktreeCreate`
* `WorktreeRemove`

`SessionStart`는 `command` hook만 지원합니다.

### Prompt 기반 hook의 작동 방식

Bash 명령을 실행하는 대신 prompt 기반 hook은:

1. hook 입력과 prompt를 Claude 모델(기본적으로 Haiku)에 전송합니다
2. LLM이 결정이 포함된 구조화된 JSON으로 응답합니다
3. Claude Code가 자동으로 결정을 처리합니다

### Prompt hook 구성

`type`을 `"prompt"`로 설정하고 `command` 대신 `prompt` 문자열을 제공합니다. hook의 JSON 입력 데이터를 prompt 텍스트에 주입하려면 `$ARGUMENTS` 플레이스홀더를 사용합니다. Claude Code는 결합된 prompt와 입력을 빠른 Claude 모델에 전송하고, 모델이 JSON 결정을 반환합니다.

이 `Stop` hook은 Claude가 완료하기 전에 모든 작업이 완료되었는지 평가하도록 LLM에 요청합니다:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete."
          }
        ]
      }
    ]
  }
}
```

| 필드      | 필수 여부 | 설명                                                                                                                                                         |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`    | 예       | `"prompt"`여야 합니다                                                                                                                                                  |
| `prompt`  | 예       | LLM에 보낼 prompt 텍스트. hook 입력 JSON의 플레이스홀더로 `$ARGUMENTS`를 사용합니다. `$ARGUMENTS`가 없으면 입력 JSON이 prompt에 추가됩니다 |
| `model`   | 아니오   | 평가에 사용할 모델. 기본값은 빠른 모델                                                                                                               |
| `timeout` | 아니오   | 타임아웃(초). 기본값: 30                                                                                                                                     |

### 응답 스키마

LLM은 다음을 포함하는 JSON으로 응답해야 합니다:

```json
{
  "ok": true | false,
  "reason": "Explanation for the decision"
}
```

| 필드     | 설명                                                |
| :------- | :--------------------------------------------------------- |
| `ok`     | `true`는 작업을 허용하고, `false`는 방지합니다              |
| `reason` | `ok`가 `false`일 때 필수. Claude에게 표시되는 설명 |

### 예시: 다중 기준 Stop hook

이 `Stop` hook은 Claude가 멈추기 전에 세 가지 조건을 확인하는 상세한 prompt를 사용합니다. `"ok"`가 `false`이면 Claude는 제공된 이유를 다음 지시로 사용하여 작업을 계속합니다. `SubagentStop` hook은 [subagent](/sub-agents)가 멈춰야 하는지 평가하기 위해 동일한 형식을 사용합니다:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "You are evaluating whether Claude should stop working. Context: $ARGUMENTS\n\nAnalyze the conversation and determine if:\n1. All user-requested tasks are complete\n2. Any errors need to be addressed\n3. Follow-up work is needed\n\nRespond with JSON: {\"ok\": true} to allow stopping, or {\"ok\": false, \"reason\": \"your explanation\"} to continue working.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## Agent 기반 hook

Agent 기반 hook(`type: "agent"`)은 prompt 기반 hook과 유사하지만 다중 턴 tool 접근이 가능합니다. 단일 LLM 호출 대신, agent hook은 파일을 읽고, 코드를 검색하고, 코드베이스를 검사하여 조건을 확인할 수 있는 subagent를 생성합니다. Agent hook은 prompt 기반 hook과 동일한 이벤트를 지원합니다.

### Agent hook의 작동 방식

Agent hook이 실행되면:

1. Claude Code가 prompt와 hook의 JSON 입력을 사용하여 subagent를 생성합니다
2. subagent가 Read, Grep, Glob 같은 tool을 사용하여 조사할 수 있습니다
3. 최대 50턴 후 subagent가 구조화된 `{ "ok": true/false }` 결정을 반환합니다
4. Claude Code가 prompt hook과 동일한 방식으로 결정을 처리합니다

Agent hook은 검증에 hook 입력 데이터만으로는 부족하고 실제 파일이나 테스트 출력을 검사해야 할 때 유용합니다.

### Agent hook 구성

`type`을 `"agent"`로 설정하고 `prompt` 문자열을 제공합니다. 구성 필드는 [prompt hook](#prompt-hook-구성)과 동일하며 기본 타임아웃이 더 깁니다:

| 필드      | 필수 여부 | 설명                                                                                 |
| :-------- | :------- | :------------------------------------------------------------------------------------------ |
| `type`    | 예       | `"agent"`여야 합니다                                                                           |
| `prompt`  | 예       | 확인할 내용을 설명하는 prompt. hook 입력 JSON의 플레이스홀더로 `$ARGUMENTS`를 사용합니다 |
| `model`   | 아니오   | 사용할 모델. 기본값은 빠른 모델                                                      |
| `timeout` | 아니오   | 타임아웃(초). 기본값: 60                                                             |

응답 스키마는 prompt hook과 동일합니다: 허용하려면 `{ "ok": true }`, 차단하려면 `{ "ok": false, "reason": "..." }`.

이 `Stop` hook은 Claude가 완료하기 전에 모든 단위 테스트가 통과하는지 확인합니다:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## 백그라운드에서 hook 실행

기본적으로 hook은 완료될 때까지 Claude의 실행을 차단합니다. 배포, 테스트 스위트, 외부 API 호출과 같은 장기 실행 작업의 경우 `"async": true`를 설정하여 Claude가 계속 작업하는 동안 백그라운드에서 hook을 실행합니다. Async hook은 Claude의 동작을 차단하거나 제어할 수 없습니다: `decision`, `permissionDecision`, `continue` 같은 응답 필드는 효과가 없습니다. 이는 해당 필드가 제어했을 작업이 이미 완료되었기 때문입니다.

### Async hook 구성

command hook의 구성에 `"async": true`를 추가하여 Claude를 차단하지 않고 백그라운드에서 실행합니다. 이 필드는 `type: "command"` hook에서만 사용할 수 있습니다.

이 hook은 모든 `Write` tool call 후 테스트 스크립트를 실행합니다. Claude는 `run-tests.sh`가 최대 120초 동안 실행되는 동안 즉시 작업을 계속합니다. 스크립트가 완료되면 출력이 다음 대화 턴에 전달됩니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/run-tests.sh",
            "async": true,
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

`timeout` 필드는 백그라운드 프로세스의 최대 시간을 초 단위로 설정합니다. 지정하지 않으면 async hook은 동기 hook과 동일한 10분 기본값을 사용합니다.

### Async hook의 실행 방식

async hook이 실행되면 Claude Code는 hook 프로세스를 시작하고 완료를 기다리지 않고 즉시 계속합니다. hook은 동기 hook과 동일한 JSON 입력을 stdin으로 수신합니다.

백그라운드 프로세스가 종료된 후 hook이 `systemMessage` 또는 `additionalContext` 필드가 포함된 JSON 응답을 생성했다면, 해당 내용이 다음 대화 턴에 Claude에게 컨텍스트로 전달됩니다.

Async hook 완료 알림은 기본적으로 억제됩니다. 이를 보려면 `Ctrl+O`로 verbose 모드를 활성화하거나 `--verbose`로 Claude Code를 시작하세요.

### 예시: 파일 변경 후 테스트 실행

이 hook은 Claude가 파일을 작성할 때마다 백그라운드에서 테스트 스위트를 시작한 다음, 테스트가 완료되면 결과를 Claude에게 보고합니다. 이 스크립트를 프로젝트의 `.claude/hooks/run-tests-async.sh`에 저장하고 `chmod +x`로 실행 가능하게 만드세요:

```bash
#!/bin/bash
# run-tests-async.sh

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run tests for source files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then
  exit 0
fi

# Run tests and report results via systemMessage
RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"Tests passed after editing $FILE_PATH\"}"
else
  echo "{\"systemMessage\": \"Tests failed after editing $FILE_PATH: $RESULT\"}"
fi
```

그런 다음 프로젝트 루트의 `.claude/settings.json`에 이 구성을 추가하세요. `async: true` 플래그를 사용하면 테스트가 실행되는 동안 Claude가 계속 작업할 수 있습니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/run-tests-async.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

### 제한 사항

Async hook은 동기 hook에 비해 여러 제약이 있습니다:

* `type: "command"` hook만 `async`를 지원합니다. Prompt 기반 hook은 비동기적으로 실행할 수 없습니다.
* Async hook은 tool call을 차단하거나 결정을 반환할 수 없습니다. hook이 완료될 때까지 트리거 작업은 이미 진행되었습니다.
* Hook 출력은 다음 대화 턴에 전달됩니다. 세션이 유휴 상태이면 응답은 다음 사용자 상호작용까지 대기합니다. 예외: exit code 2로 종료하는 `asyncRewake` hook은 세션이 유휴 상태여도 즉시 Claude를 깨웁니다.
* 각 실행은 별도의 백그라운드 프로세스를 생성합니다. 동일한 async hook의 여러 실행 간에 중복 제거가 없습니다.

## 보안 고려 사항

### 면책 조항

Command hook은 시스템 사용자의 전체 권한으로 실행됩니다.

::: warning
Command hook은 전체 사용자 권한으로 셸 명령을 실행합니다. 사용자 계정이 접근할 수 있는 모든 파일을 수정, 삭제 또는 접근할 수 있습니다. 구성에 추가하기 전에 모든 hook 명령을 검토하고 테스트하세요.
:::

### 보안 모범 사례

Hook을 작성할 때 다음 관행을 염두에 두세요:

* **입력 검증 및 새니타이징**: 입력 데이터를 무조건 신뢰하지 마세요
* **항상 셸 변수를 따옴표로 감싸기**: `$VAR`가 아닌 `"$VAR"`를 사용하세요
* **경로 순회 차단**: 파일 경로에서 `..`를 확인하세요
* **절대 경로 사용**: 프로젝트 루트를 위해 `"$CLAUDE_PROJECT_DIR"`를 사용하여 스크립트의 전체 경로를 지정하세요
* **민감한 파일 건너뛰기**: `.env`, `.git/`, 키 등을 피하세요

## Windows PowerShell tool

Windows에서는 command hook에 `"shell": "powershell"`을 설정하여 개별 hook을 PowerShell에서 실행할 수 있습니다. hook이 직접 PowerShell을 생성하므로 `CLAUDE_CODE_USE_POWERSHELL_TOOL` 설정 여부에 관계없이 작동합니다. Claude Code는 `pwsh.exe`(PowerShell 7+)를 자동 감지하고 `powershell.exe`(5.1)로 폴백합니다.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "shell": "powershell",
            "command": "Write-Host 'File written'"
          }
        ]
      }
    ]
  }
}
```

## Hook 디버깅

hook 실행 세부 정보(어떤 hook이 매칭되었는지, exit code, 전체 stdout 및 stderr 포함)는 디버그 로그 파일에 기록됩니다. `claude --debug-file <path>`로 Claude Code를 시작하여 알려진 위치에 로그를 기록하거나, `claude --debug`를 실행하고 `~/.claude/debug/<session-id>.txt`에서 로그를 읽습니다. `--debug` 플래그는 터미널에 출력하지 않습니다.

```text
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Found 1 hook commands to execute
[DEBUG] Executing hook command: <Your command> with timeout 600000ms
[DEBUG] Hook command completed with status 0: <Your stdout>
```

더 세밀한 hook 매칭 세부 정보를 보려면 `CLAUDE_CODE_DEBUG_LOG_LEVEL=verbose`를 설정하여 hook matcher 수와 쿼리 매칭 같은 추가 로그 줄을 확인하세요.

hook이 실행되지 않거나, 무한 Stop hook 루프, 구성 오류 등 일반적인 문제의 문제 해결은 가이드의 [제한 사항 및 문제 해결](/hooks-guide#limitations-and-troubleshooting)을 참조하세요.
