---
title: "Hook으로 워크플로우 자동화하기"
description: "Claude Code가 파일을 편집하거나 작업을 완료하거나 입력이 필요할 때 셸 명령을 자동으로 실행하세요."
---

# Hook으로 워크플로우 자동화하기

> Claude Code가 파일을 편집하거나, 작업을 완료하거나, 입력이 필요할 때 셸 명령을 자동으로 실행합니다. 코드 포맷팅, 알림 전송, 명령 검증, 프로젝트 규칙 적용 등을 할 수 있습니다.

Hook은 Claude Code의 라이프사이클 중 특정 시점에 실행되는 사용자 정의 셸 명령입니다. LLM이 실행 여부를 선택하는 것에 의존하지 않고, 특정 작업이 항상 수행되도록 Claude Code의 동작을 결정적으로 제어할 수 있습니다. Hook을 사용하여 프로젝트 규칙을 적용하고, 반복 작업을 자동화하며, Claude Code를 기존 도구와 통합하세요.

결정적 규칙이 아닌 판단이 필요한 결정에는 [prompt 기반 hook](#prompt-기반-hook)이나 [agent 기반 hook](#agent-기반-hook)을 사용하여 Claude 모델이 조건을 평가하도록 할 수도 있습니다.

Claude Code를 확장하는 다른 방법으로는, Claude에게 추가 지침과 실행 가능한 명령을 제공하는 [skills](/skills), 격리된 컨텍스트에서 작업을 실행하는 [subagent](/sub-agents), 프로젝트 간에 공유할 확장을 패키징하는 [plugin](/plugins)을 참조하세요.

::: tip
이 가이드에서는 일반적인 사용 사례와 시작하는 방법을 다룹니다. 전체 이벤트 스키마, JSON 입출력 형식, 비동기 hook 및 MCP 도구 hook 등 고급 기능은 [Hook 레퍼런스](/hooks)를 참조하세요.
:::

## 첫 번째 hook 설정하기

Hook을 만들려면 [설정 파일](#hook-위치-설정)에 `hooks` 블록을 추가합니다. 이 가이드에서는 데스크톱 알림 hook을 만들어서, 터미널을 계속 확인하는 대신 Claude가 입력을 기다릴 때 알림을 받을 수 있도록 합니다.

### 1단계: 설정에 hook 추가하기

`~/.claude/settings.json`을 열고 `Notification` hook을 추가합니다. 아래 예시는 macOS용 `osascript`를 사용합니다. Linux와 Windows 명령은 [Claude가 입력을 기다릴 때 알림 받기](#claude가-입력을-기다릴-때-알림-받기)를 참조하세요.

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

설정 파일에 이미 `hooks` 키가 있다면, 기존 객체를 교체하지 말고 기존 이벤트 키의 형제로 `Notification`을 추가하세요. 각 이벤트 이름은 단일 `hooks` 객체 안의 키입니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'" }]
      }
    ]
  }
}
```

CLI에서 원하는 내용을 설명하여 Claude에게 hook을 작성하도록 요청할 수도 있습니다.

### 2단계: 설정 확인하기

`/hooks`를 입력하여 hook 브라우저를 엽니다. 사용 가능한 모든 hook 이벤트 목록이 표시되며, hook이 설정된 각 이벤트 옆에 개수가 표시됩니다. `Notification`을 선택하여 새 hook이 목록에 나타나는지 확인하세요. Hook을 선택하면 이벤트, matcher, 유형, 소스 파일, 명령 등의 세부 정보가 표시됩니다.

### 3단계: hook 테스트하기

`Esc`를 눌러 CLI로 돌아갑니다. Claude에게 권한이 필요한 작업을 요청한 다음 터미널에서 벗어나세요. 데스크톱 알림을 받아야 합니다.

::: tip
`/hooks` 메뉴는 읽기 전용입니다. Hook을 추가, 수정 또는 제거하려면 설정 JSON을 직접 편집하거나 Claude에게 변경을 요청하세요.
:::

## 자동화할 수 있는 것들

Hook을 사용하면 Claude Code 라이프사이클의 주요 시점에서 코드를 실행할 수 있습니다: 편집 후 파일 포맷팅, 명령 실행 전 차단, Claude가 입력을 기다릴 때 알림 전송, 세션 시작 시 컨텍스트 주입 등. 전체 hook 이벤트 목록은 [Hook 레퍼런스](/hooks#hook-lifecycle)를 참조하세요.

각 예시에는 [설정 파일](#hook-위치-설정)에 추가하는 바로 사용할 수 있는 설정 블록이 포함되어 있습니다. 가장 일반적인 패턴들:

* [Claude가 입력을 기다릴 때 알림 받기](#claude가-입력을-기다릴-때-알림-받기)
* [편집 후 코드 자동 포맷팅](#편집-후-코드-자동-포맷팅)
* [보호된 파일 편집 차단](#보호된-파일-편집-차단)
* [압축 후 컨텍스트 재주입](#압축-후-컨텍스트-재주입)
* [설정 변경 감사](#설정-변경-감사)
* [디렉토리 또는 파일 변경 시 환경 리로드](#디렉토리-또는-파일-변경-시-환경-리로드)
* [특정 권한 프롬프트 자동 승인](#특정-권한-프롬프트-자동-승인)

### Claude가 입력을 기다릴 때 알림 받기

Claude가 작업을 마치고 입력을 기다릴 때마다 데스크톱 알림을 받으면, 터미널을 확인하지 않고도 다른 작업으로 전환할 수 있습니다.

이 hook은 Claude가 입력 또는 권한을 기다릴 때 발생하는 `Notification` 이벤트를 사용합니다. 아래 각 탭은 플랫폼의 기본 알림 명령을 사용합니다. `~/.claude/settings.json`에 추가하세요:

#### macOS

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

<details><summary>알림이 표시되지 않는 경우</summary>

`osascript`는 내장 Script Editor 앱을 통해 알림을 라우팅합니다. Script Editor에 알림 권한이 없으면 명령이 조용히 실패하며, macOS는 권한 부여를 요청하지 않습니다. 터미널에서 다음을 한 번 실행하여 Script Editor가 알림 설정에 나타나도록 하세요:

```bash
osascript -e 'display notification "test"'
```

아직 아무것도 표시되지 않습니다. **시스템 설정 > 알림**을 열고 목록에서 **Script Editor**를 찾아 **알림 허용**을 켜세요. 명령을 다시 실행하여 테스트 알림이 표시되는지 확인하세요.

</details>

#### Linux

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
          }
        ]
      }
    ]
  }
}
```

#### Windows (PowerShell)

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')\""
          }
        ]
      }
    ]
  }
}
```

### 편집 후 코드 자동 포맷팅

Claude가 편집하는 모든 파일에 자동으로 [Prettier](https://prettier.io/)를 실행하여 수동 개입 없이 포맷팅 일관성을 유지합니다.

이 hook은 `PostToolUse` 이벤트와 `Edit|Write` matcher를 사용하여 파일 편집 도구 이후에만 실행됩니다. 명령은 [`jq`](https://jqlang.github.io/jq/)로 편집된 파일 경로를 추출하고 Prettier에 전달합니다. 프로젝트 루트의 `.claude/settings.json`에 추가하세요:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

::: info
이 페이지의 Bash 예시는 JSON 파싱을 위해 `jq`를 사용합니다. `brew install jq` (macOS), `apt-get install jq` (Debian/Ubuntu)로 설치하거나 [`jq` 다운로드](https://jqlang.github.io/jq/download/)를 참조하세요.
:::

### 보호된 파일 편집 차단

`.env`, `package-lock.json` 또는 `.git/` 내의 파일과 같은 민감한 파일을 Claude가 수정하지 못하도록 합니다. Claude는 편집이 차단된 이유를 설명하는 피드백을 받아 접근 방식을 조정할 수 있습니다.

이 예시는 hook이 호출하는 별도의 스크립트 파일을 사용합니다. 스크립트는 대상 파일 경로를 보호된 패턴 목록과 비교하고 exit code 2로 종료하여 편집을 차단합니다.

#### 1단계: hook 스크립트 생성

`.claude/hooks/protect-files.sh`에 저장하세요:

```bash
#!/bin/bash
# protect-files.sh

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

#### 2단계: 스크립트를 실행 가능하게 만들기 (macOS/Linux)

Hook 스크립트는 Claude Code가 실행할 수 있도록 실행 가능해야 합니다:

```bash
chmod +x .claude/hooks/protect-files.sh
```

#### 3단계: hook 등록

`.claude/settings.json`에 `Edit` 또는 `Write` 도구 호출 전에 스크립트를 실행하는 `PreToolUse` hook을 추가하세요:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

### 압축 후 컨텍스트 재주입

Claude의 컨텍스트 윈도우가 가득 차면, 압축(compaction)이 대화를 요약하여 공간을 확보합니다. 이 과정에서 중요한 세부 정보가 손실될 수 있습니다. `compact` matcher와 함께 `SessionStart` hook을 사용하여 매번 압축 후 중요한 컨텍스트를 재주입하세요.

명령이 stdout에 출력하는 모든 텍스트는 Claude의 컨텍스트에 추가됩니다. 이 예시는 Claude에게 프로젝트 규칙과 최근 작업을 상기시킵니다. 프로젝트 루트의 `.claude/settings.json`에 추가하세요:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

`echo`를 `git log --oneline -5`와 같이 동적 출력을 생성하는 명령으로 대체할 수 있습니다. 모든 세션 시작 시 컨텍스트를 주입하려면 [CLAUDE.md](/memory)를 사용하는 것이 좋습니다. 환경 변수에 대해서는 레퍼런스의 [`CLAUDE_ENV_FILE`](/hooks#persist-environment-variables)을 참조하세요.

### 설정 변경 감사

세션 중 설정 또는 skills 파일이 변경될 때 추적합니다. `ConfigChange` 이벤트는 외부 프로세스나 편집기가 설정 파일을 수정할 때 발생하므로, 규정 준수를 위해 변경 사항을 로깅하거나 무단 수정을 차단할 수 있습니다.

이 예시는 각 변경을 감사 로그에 추가합니다. `~/.claude/settings.json`에 추가하세요:

```json
{
  "hooks": {
    "ConfigChange": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "jq -c '{timestamp: now | todate, source: .source, file: .file_path}' >> ~/claude-config-audit.log"
          }
        ]
      }
    ]
  }
}
```

matcher는 설정 유형으로 필터링합니다: `user_settings`, `project_settings`, `local_settings`, `policy_settings` 또는 `skills`. 변경이 적용되지 않도록 차단하려면 exit code 2로 종료하거나 `{"decision": "block"}`을 반환하세요. 전체 입력 스키마는 [ConfigChange 레퍼런스](/hooks#configchange)를 참조하세요.

### 디렉토리 또는 파일 변경 시 환경 리로드

일부 프로젝트는 현재 디렉토리에 따라 다른 환경 변수를 설정합니다. [direnv](https://direnv.net/)와 같은 도구는 셸에서 이를 자동으로 처리하지만, Claude의 Bash 도구는 이러한 변경을 자체적으로 감지하지 못합니다.

`CwdChanged` hook으로 이를 해결할 수 있습니다: Claude가 디렉토리를 변경할 때마다 실행되어 새 위치에 맞는 올바른 변수를 리로드합니다. Hook은 업데이트된 값을 `CLAUDE_ENV_FILE`에 기록하며, Claude Code는 각 Bash 명령 전에 이를 적용합니다. `~/.claude/settings.json`에 추가하세요:

```json
{
  "hooks": {
    "CwdChanged": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash >> \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

모든 디렉토리 변경이 아닌 특정 파일에 반응하려면, 감시할 파일명을 `|`로 구분하여 `matcher`에 나열한 `FileChanged`를 사용하세요. 감시 목록을 구성하기 위해 이 값은 정규식이 아닌 리터럴 파일명으로 분할됩니다. 파일이 변경될 때 어떤 hook 그룹이 실행되는지 필터링하는 방법은 [FileChanged](/hooks#filechanged)를 참조하세요. 이 예시는 작업 디렉토리의 `.envrc`와 `.env`를 감시합니다:

```json
{
  "hooks": {
    "FileChanged": [
      {
        "matcher": ".envrc|.env",
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash >> \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

입력 스키마, `watchPaths` 출력, `CLAUDE_ENV_FILE` 세부 정보는 [CwdChanged](/hooks#cwdchanged) 및 [FileChanged](/hooks#filechanged) 레퍼런스 항목을 참조하세요.

### 특정 권한 프롬프트 자동 승인

항상 허용하는 도구 호출에 대해 승인 대화 상자를 건너뜁니다. 이 예시는 Claude가 계획 발표를 마치고 진행을 요청할 때 호출하는 도구인 `ExitPlanMode`를 자동 승인하여, 계획이 준비될 때마다 프롬프트가 표시되지 않도록 합니다.

위의 exit code 예시와 달리, 자동 승인은 hook이 JSON 결정을 stdout에 작성해야 합니다. `PermissionRequest` hook은 Claude Code가 권한 대화 상자를 표시하려 할 때 발생하며, `"behavior": "allow"`를 반환하면 자동으로 승인됩니다.

matcher는 `ExitPlanMode`에만 scope를 지정하므로 다른 프롬프트에는 영향을 미치지 않습니다. `~/.claude/settings.json`에 추가하세요:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PermissionRequest\", \"decision\": {\"behavior\": \"allow\"}}}'"
          }
        ]
      }
    ]
  }
}
```

Hook이 승인하면 Claude Code는 plan mode를 종료하고 plan mode에 진입하기 전에 활성화되어 있던 권한 모드를 복원합니다. 트랜스크립트에는 대화 상자가 표시되었을 위치에 "Allowed by PermissionRequest hook"이 표시됩니다. Hook 경로는 항상 현재 대화를 유지합니다: 대화 상자처럼 컨텍스트를 지우고 새 구현 세션을 시작할 수는 없습니다.

특정 권한 모드를 설정하려면, hook의 출력에 `setMode` 항목이 포함된 `updatedPermissions` 배열을 포함시킬 수 있습니다. `mode` 값은 `default`, `acceptEdits` 또는 `bypassPermissions`와 같은 권한 모드이며, `destination: "session"`은 현재 세션에만 적용합니다.

세션을 `acceptEdits`로 전환하려면 hook이 다음 JSON을 stdout에 작성합니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedPermissions": [
        { "type": "setMode", "mode": "acceptEdits", "destination": "session" }
      ]
    }
  }
}
```

matcher를 가능한 좁게 유지하세요. `.*`로 매칭하거나 matcher를 비워두면 파일 쓰기와 셸 명령을 포함한 모든 권한 프롬프트를 자동 승인하게 됩니다. 전체 결정 필드는 [PermissionRequest 레퍼런스](/hooks#permissionrequest-decision-control)를 참조하세요.

## Hook 작동 방식

Hook 이벤트는 Claude Code의 특정 라이프사이클 시점에서 발생합니다. 이벤트가 발생하면 매칭되는 모든 hook이 병렬로 실행되며, 동일한 hook 명령은 자동으로 중복 제거됩니다. 아래 표는 각 이벤트와 발생 시점을 보여줍니다:

| 이벤트                | 발생 시점                                                                                                                                          |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`       | 세션이 시작되거나 재개될 때                                                                                                                       |
| `UserPromptSubmit`   | 프롬프트를 제출할 때, Claude가 처리하기 전                                                                                                   |
| `PreToolUse`         | 도구 호출 실행 전. 차단 가능                                                                                              |
| `PermissionRequest`  | 권한 대화 상자가 나타날 때                                                                                                                       |
| `PermissionDenied`   | auto mode 분류기에 의해 도구 호출이 거부될 때. `{retry: true}`를 반환하면 모델에게 거부된 도구 호출을 재시도할 수 있음을 알림                     |
| `PostToolUse`        | 도구 호출 성공 후                                                                                                             |
| `PostToolUseFailure` | 도구 호출 실패 후                                                                                                                |
| `Notification`       | Claude Code가 알림을 보낼 때                                                                                                  |
| `SubagentStart`      | subagent가 생성될 때                                                                                                                             |
| `SubagentStop`       | subagent가 완료될 때                                                                                                               |
| `TaskCreated`        | `TaskCreate`를 통해 작업이 생성될 때                                                                                          |
| `TaskCompleted`      | 작업이 완료로 표시될 때                                                                                               |
| `Stop`               | Claude가 응답을 마칠 때                                                                                                        |
| `StopFailure`        | API 오류로 턴이 종료될 때. 출력과 exit code는 무시됨                                                                               |
| `TeammateIdle`       | [에이전트 팀](/agent-teams) 팀원이 유휴 상태에 들어가려 할 때                                                                                     |
| `InstructionsLoaded` | CLAUDE.md 또는 `.claude/rules/*.md` 파일이 컨텍스트에 로드될 때. 세션 시작 시와 세션 중 지연 로드될 때 발생         |
| `ConfigChange`       | 세션 중 설정 파일이 변경될 때                                                                                                     |
| `CwdChanged`         | 작업 디렉토리가 변경될 때 (예: Claude가 `cd` 명령을 실행할 때). direnv 같은 도구를 사용한 반응형 환경 관리에 유용 |
| `FileChanged`        | 감시 중인 파일이 디스크에서 변경될 때. `matcher` 필드가 감시할 파일명을 지정                                                            |
| `WorktreeCreate`     | `--worktree` 또는 `isolation: "worktree"`를 통해 worktree가 생성될 때. 기본 git 동작을 대체                                            |
| `WorktreeRemove`     | 세션 종료 시 또는 subagent 완료 시 worktree가 제거될 때                                                                   |
| `PreCompact`         | 컨텍스트 압축 전                                                                                                                              |
| `PostCompact`        | 컨텍스트 압축 완료 후                                                                                                                     |
| `Elicitation`        | MCP 서버가 도구 호출 중 사용자 입력을 요청할 때                                                                                              |
| `ElicitationResult`  | 사용자가 MCP elicitation에 응답한 후, 응답이 서버로 전송되기 전                                                            |
| `SessionEnd`         | 세션이 종료될 때                                                                                                              |

여러 hook이 매칭되면 각각 자체 결과를 반환합니다. 결정의 경우, Claude Code는 가장 제한적인 답변을 선택합니다. `PreToolUse` hook이 `deny`를 반환하면 다른 hook이 무엇을 반환하든 도구 호출이 취소됩니다. 하나의 hook이 `ask`를 반환하면 나머지가 `allow`를 반환하더라도 권한 프롬프트가 강제됩니다. `additionalContext`의 텍스트는 모든 hook에서 유지되어 함께 Claude에 전달됩니다.

각 hook에는 실행 방식을 결정하는 `type`이 있습니다. 대부분의 hook은 셸 명령을 실행하는 `"type": "command"`를 사용합니다. 세 가지 다른 유형도 사용할 수 있습니다:

* `"type": "http"`: 이벤트 데이터를 URL로 POST합니다. [HTTP hook](#http-hook)을 참조하세요.
* `"type": "prompt"`: 단일 턴 LLM 평가. [Prompt 기반 hook](#prompt-기반-hook)을 참조하세요.
* `"type": "agent"`: 도구 접근이 가능한 멀티턴 검증. [Agent 기반 hook](#agent-기반-hook)을 참조하세요.

### 입력 읽기와 출력 반환

Hook은 stdin, stdout, stderr, exit code를 통해 Claude Code와 통신합니다. 이벤트가 발생하면 Claude Code가 이벤트별 데이터를 JSON으로 스크립트의 stdin에 전달합니다. 스크립트는 해당 데이터를 읽고 작업을 수행한 후 exit code를 통해 Claude Code에 다음 동작을 알려줍니다.

#### Hook 입력

모든 이벤트에는 `session_id`와 `cwd` 같은 공통 필드가 포함되지만, 각 이벤트 유형마다 다른 데이터가 추가됩니다. 예를 들어 Claude가 Bash 명령을 실행할 때, `PreToolUse` hook은 stdin에서 다음과 같은 데이터를 받습니다:

```json
{
  "session_id": "abc123",          // unique ID for this session
  "cwd": "/Users/sarah/myproject", // working directory when the event fired
  "hook_event_name": "PreToolUse", // which event triggered this hook
  "tool_name": "Bash",             // the tool Claude is about to use
  "tool_input": {                  // the arguments Claude passed to the tool
    "command": "npm test"          // for Bash, this is the shell command
  }
}
```

스크립트에서 해당 JSON을 파싱하여 모든 필드에 대해 작업할 수 있습니다. `UserPromptSubmit` hook은 대신 `prompt` 텍스트를 받고, `SessionStart` hook은 `source` (startup, resume, clear, compact) 등을 받습니다. 공유 필드는 레퍼런스의 [공통 입력 필드](/hooks#common-input-fields)를, 이벤트별 스키마는 각 이벤트 섹션을 참조하세요.

#### Hook 출력

스크립트는 stdout이나 stderr에 쓰고 특정 코드로 종료하여 Claude Code에 다음 동작을 알려줍니다. 예를 들어, 명령을 차단하려는 `PreToolUse` hook:

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "drop table"; then
  echo "Blocked: dropping tables is not allowed" >&2  # stderr becomes Claude's feedback
  exit 2                                               # exit 2 = block the action
fi

exit 0  # exit 0 = let it proceed
```

exit code가 다음 동작을 결정합니다:

* **Exit 0**: 작업이 진행됩니다. `UserPromptSubmit`과 `SessionStart` hook의 경우, stdout에 쓴 내용이 Claude의 컨텍스트에 추가됩니다.
* **Exit 2**: 작업이 차단됩니다. stderr에 이유를 쓰면 Claude가 피드백으로 받아 조정할 수 있습니다.
* **기타 exit code**: 작업이 진행됩니다. 트랜스크립트에 `<hook name> hook error` 알림과 stderr의 첫 번째 줄이 표시되며, 전체 stderr는 [디버그 로그](/hooks#debug-hooks)에 기록됩니다.

#### 구조화된 JSON 출력

exit code는 허용 또는 차단 두 가지 옵션을 제공합니다. 더 세밀한 제어를 위해 exit 0으로 종료하고 대신 JSON 객체를 stdout에 출력하세요.

::: info
stderr 메시지로 차단하려면 exit 2를 사용하고, 구조화된 제어를 위해서는 JSON과 함께 exit 0을 사용하세요. 둘을 섞지 마세요: exit 2일 때 Claude Code는 JSON을 무시합니다.
:::

예를 들어, `PreToolUse` hook은 도구 호출을 거부하고 Claude에게 이유를 알려주거나, 사용자 승인을 위해 에스컬레이션할 수 있습니다:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

`"deny"`를 사용하면 Claude Code가 도구 호출을 취소하고 `permissionDecisionReason`을 Claude에 피드백합니다. 이러한 `permissionDecision` 값은 `PreToolUse`에만 해당됩니다:

* `"allow"`: 대화형 권한 프롬프트를 건너뜁니다. deny 및 ask 규칙(엔터프라이즈 관리형 deny 목록 포함)은 여전히 적용됩니다
* `"deny"`: 도구 호출을 취소하고 이유를 Claude에 전송합니다
* `"ask"`: 사용자에게 정상적으로 권한 프롬프트를 표시합니다

네 번째 값 `"defer"`는 `-p` 플래그를 사용하는 [비대화형 모드](/headless)에서 사용할 수 있습니다. 도구 호출을 보존한 채 프로세스를 종료하여 Agent SDK 래퍼가 입력을 수집하고 재개할 수 있습니다. 레퍼런스의 [도구 호출 지연](/hooks#defer-a-tool-call-for-later)을 참조하세요.

`"allow"`를 반환하면 대화형 프롬프트를 건너뛰지만 [권한 규칙](/permissions#manage-permissions)을 재정의하지는 않습니다. deny 규칙이 도구 호출과 일치하면, hook이 `"allow"`를 반환하더라도 호출이 차단됩니다. ask 규칙이 일치하면 여전히 사용자에게 프롬프트가 표시됩니다. 즉, [관리형 설정](/settings#settings-files)을 포함한 모든 설정 범위의 deny 규칙이 항상 hook 승인보다 우선합니다.

다른 이벤트는 다른 결정 패턴을 사용합니다. 예를 들어 `PostToolUse`와 `Stop` hook은 최상위 `decision: "block"` 필드를 사용하고, `PermissionRequest`는 `hookSpecificOutput.decision.behavior`를 사용합니다. 이벤트별 전체 분류는 레퍼런스의 [요약 표](/hooks#decision-control)를 참조하세요.

`UserPromptSubmit` hook의 경우 대신 `additionalContext`를 사용하여 Claude의 컨텍스트에 텍스트를 주입하세요. Prompt 기반 hook(`type: "prompt"`)은 출력을 다르게 처리합니다: [Prompt 기반 hook](#prompt-기반-hook)을 참조하세요.

### Matcher로 hook 필터링하기

matcher 없이는 hook이 해당 이벤트의 모든 발생에서 실행됩니다. Matcher를 사용하면 범위를 좁힐 수 있습니다. 예를 들어 모든 도구 호출이 아닌 파일 편집 후에만 포맷터를 실행하려면 `PostToolUse` hook에 matcher를 추가하세요:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "prettier --write ..." }
        ]
      }
    ]
  }
}
```

`"Edit|Write"` matcher는 Claude가 `Edit` 또는 `Write` 도구를 사용할 때만 실행되며, `Bash`, `Read` 또는 다른 도구를 사용할 때는 실행되지 않습니다. 일반 이름과 정규식의 평가 방법은 [Matcher 패턴](/hooks#matcher-patterns)을 참조하세요.

각 이벤트 유형은 특정 필드에 대해 매칭됩니다:

| 이벤트                                                                                                                        | matcher 필터 대상                                              | matcher 값 예시                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`                                   | 도구 이름                                                             | `Bash`, `Edit\|Write`, `mcp__.*`                                                                                          |
| `SessionStart`                                                                                                               | 세션 시작 방식                                               | `startup`, `resume`, `clear`, `compact`                                                                                   |
| `SessionEnd`                                                                                                                 | 세션 종료 이유                                                 | `clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`                                  |
| `Notification`                                                                                                               | 알림 유형                                                     | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`                                                  |
| `SubagentStart`                                                                                                              | 에이전트 유형                                                            | `Bash`, `Explore`, `Plan` 또는 커스텀 에이전트 이름                                                                          |
| `PreCompact`, `PostCompact`                                                                                                  | 압축 트리거                                             | `manual`, `auto`                                                                                                          |
| `SubagentStop`                                                                                                               | 에이전트 유형                                                            | `SubagentStart`와 동일                                                                          |
| `ConfigChange`                                                                                                               | 설정 소스                                                  | `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills`                                        |
| `StopFailure`                                                                                                                | 오류 유형                                                            | `rate_limit`, `authentication_failed`, `billing_error`, `invalid_request`, `server_error`, `max_output_tokens`, `unknown` |
| `InstructionsLoaded`                                                                                                         | 로드 이유                                                           | `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`                                              |
| `Elicitation`                                                                                                                | MCP 서버 이름                                                       | 설정된 MCP 서버 이름                                                                                          |
| `ElicitationResult`                                                                                                          | MCP 서버 이름                                                       | `Elicitation`과 동일                                                                              |
| `FileChanged`                                                                                                                | 감시할 리터럴 파일명 ([FileChanged](/hooks#filechanged) 참조) | `.envrc\|.env`                                                                                                            |
| `UserPromptSubmit`, `Stop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove`, `CwdChanged` | matcher 미지원                                                    | 모든 발생에서 항상 실행                                                                                          |

다른 이벤트 유형의 matcher를 보여주는 추가 예시:

#### 모든 Bash 명령 로깅

`Bash` 도구 호출만 매칭하고 각 명령을 파일에 로깅합니다. `PostToolUse` 이벤트는 명령 완료 후 발생하므로, `tool_input.command`에 실행된 내용이 포함됩니다. Hook은 이벤트 데이터를 stdin에서 JSON으로 받으며, `jq -r '.tool_input.command'`가 명령 문자열만 추출하고, `>>`가 로그 파일에 추가합니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

#### MCP 도구 매칭

MCP 도구는 내장 도구와 다른 명명 규칙을 사용합니다: `mcp__<server>__<tool>`, 여기서 `<server>`는 MCP 서버 이름이고 `<tool>`은 제공하는 도구입니다. 예를 들어 `mcp__github__search_repositories` 또는 `mcp__filesystem__read_file`. 특정 서버의 모든 도구를 대상으로 하려면 regex matcher를 사용하거나, `mcp__.*__write.*` 같은 패턴으로 서버 간 매칭할 수 있습니다. 전체 예시 목록은 레퍼런스의 [MCP 도구 매칭](/hooks#match-mcp-tools)을 참조하세요.

아래 명령은 hook의 JSON 입력에서 `jq`로 도구 이름을 추출하고 stderr에 씁니다. stderr에 쓰면 stdout은 JSON 출력을 위해 깨끗하게 유지되고 메시지는 [디버그 로그](/hooks#debug-hooks)로 전송됩니다:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"GitHub tool called: $(jq -r '.tool_name')\" >&2"
          }
        ]
      }
    ]
  }
}
```

#### 세션 종료 시 정리

`SessionEnd` 이벤트는 세션 종료 이유에 대한 matcher를 지원합니다. 이 hook은 정상 종료가 아닌 `clear` (`/clear` 실행 시)에서만 발생합니다:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "clear",
        "hooks": [
          {
            "type": "command",
            "command": "rm -f /tmp/claude-scratch-*.txt"
          }
        ]
      }
    ]
  }
}
```

전체 matcher 구문은 [Hook 레퍼런스](/hooks#configuration)를 참조하세요.

#### `if` 필드로 도구 이름과 인수 필터링

::: info
`if` 필드는 Claude Code v2.1.85 이상이 필요합니다. 이전 버전에서는 이를 무시하고 매칭되는 모든 호출에서 hook을 실행합니다.
:::

`if` 필드는 [권한 규칙 구문](/permissions)을 사용하여 도구 이름과 인수를 함께 필터링하므로, 도구 호출이 일치할 때만 hook 프로세스가 생성됩니다. 이는 그룹 수준에서 도구 이름만으로 필터링하는 `matcher`를 넘어서는 것입니다.

예를 들어 모든 Bash 명령이 아닌 Claude가 `git` 명령을 사용할 때만 hook을 실행하려면:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-git-policy.sh"
          }
        ]
      }
    ]
  }
}
```

Bash 명령이 `git`으로 시작할 때만 hook 프로세스가 생성됩니다. 다른 Bash 명령은 이 핸들러를 완전히 건너뜁니다. `if` 필드는 권한 규칙과 동일한 패턴을 허용합니다: `"Bash(git *)"`, `"Edit(*.ts)"` 등. 여러 도구 이름을 매칭하려면 각각 고유한 `if` 값을 가진 별도의 핸들러를 사용하거나, 파이프 교대가 지원되는 `matcher` 수준에서 매칭하세요.

`if`는 도구 이벤트에서만 작동합니다: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`. 다른 이벤트에 추가하면 hook이 실행되지 않습니다.

### Hook 위치 설정

Hook을 추가하는 위치에 따라 범위가 결정됩니다:

| 위치                                                   | 범위                              | 공유 가능 여부                          |
| :--------------------------------------------------------- | :--------------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 모든 프로젝트                  | 아니오, 로컬 머신에만 해당          |
| `.claude/settings.json`                                    | 단일 프로젝트                     | 예, 저장소에 커밋 가능  |
| `.claude/settings.local.json`                              | 단일 프로젝트                     | 아니오, gitignore 대상                     |
| 관리형 정책 설정                                    | 조직 전체                  | 예, 관리자 제어              |
| [Plugin](/plugins) `hooks/hooks.json`                   | plugin이 활성화된 경우             | 예, plugin에 번들       |
| [Skill](/skills) 또는 [agent](/sub-agents) frontmatter | skill 또는 agent가 활성화된 동안 | 예, 컴포넌트 파일에 정의 |

Claude Code에서 [`/hooks`](/hooks#the-hooks-menu)를 실행하여 이벤트별로 그룹화된 모든 설정된 hook을 탐색할 수 있습니다. 모든 hook을 한 번에 비활성화하려면 설정 파일에 `"disableAllHooks": true`를 설정하세요.

Claude Code가 실행 중일 때 설정 파일을 직접 편집하면, 파일 감시기가 보통 hook 변경을 자동으로 감지합니다.

## Prompt 기반 hook

결정적 규칙이 아닌 판단이 필요한 결정에는 `type: "prompt"` hook을 사용하세요. 셸 명령을 실행하는 대신, Claude Code가 프롬프트와 hook의 입력 데이터를 Claude 모델(기본적으로 Haiku)에 전송하여 결정하도록 합니다. 더 높은 능력이 필요하면 `model` 필드로 다른 모델을 지정할 수 있습니다.

모델의 유일한 역할은 yes/no 결정을 JSON으로 반환하는 것입니다:

* `"ok": true`: 작업이 진행됩니다
* `"ok": false`: 작업이 차단됩니다. 모델의 `"reason"`이 Claude에 피드백되어 조정할 수 있습니다.

이 예시는 `Stop` hook을 사용하여 모델에게 요청된 모든 작업이 완료되었는지 확인합니다. 모델이 `"ok": false`를 반환하면 Claude는 계속 작업하며 `reason`을 다음 지침으로 사용합니다:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains to be done\"}."
          }
        ]
      }
    ]
  }
}
```

전체 설정 옵션은 레퍼런스의 [Prompt 기반 hook](/hooks#prompt-based-hooks)을 참조하세요.

## Agent 기반 hook

검증에 파일 검사나 명령 실행이 필요한 경우 `type: "agent"` hook을 사용하세요. 단일 LLM 호출을 하는 prompt hook과 달리, agent hook은 파일을 읽고, 코드를 검색하고, 다른 도구를 사용하여 결정을 반환하기 전에 조건을 검증할 수 있는 subagent를 생성합니다.

Agent hook은 prompt hook과 동일한 `"ok"` / `"reason"` 응답 형식을 사용하지만, 기본 타임아웃이 60초이고 최대 50턴의 도구 사용이 가능합니다.

이 예시는 Claude가 중지하기 전에 테스트가 통과하는지 검증합니다:

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

Hook 입력 데이터만으로 결정을 내릴 수 있으면 prompt hook을 사용하세요. 코드베이스의 실제 상태를 확인해야 하면 agent hook을 사용하세요.

전체 설정 옵션은 레퍼런스의 [Agent 기반 hook](/hooks#agent-based-hooks)을 참조하세요.

## HTTP hook

셸 명령 대신 HTTP 엔드포인트로 이벤트 데이터를 POST하려면 `type: "http"` hook을 사용하세요. 엔드포인트는 command hook이 stdin으로 받는 것과 동일한 JSON을 수신하고, 동일한 JSON 형식을 사용하여 HTTP 응답 본문으로 결과를 반환합니다.

HTTP hook은 웹 서버, 클라우드 함수 또는 외부 서비스가 hook 로직을 처리하도록 하려는 경우에 유용합니다. 예를 들어 팀 전체의 도구 사용 이벤트를 로깅하는 공유 감사 서비스를 구현할 수 있습니다.

이 예시는 모든 도구 사용을 로컬 로깅 서비스에 전송합니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "http://localhost:8080/hooks/tool-use",
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

엔드포인트는 command hook과 동일한 [출력 형식](/hooks#json-output)을 사용하는 JSON 응답 본문을 반환해야 합니다. 도구 호출을 차단하려면 적절한 `hookSpecificOutput` 필드와 함께 2xx 응답을 반환하세요. HTTP 상태 코드만으로는 작업을 차단할 수 없습니다.

헤더 값은 `$VAR_NAME` 또는 `${VAR_NAME}` 구문을 사용한 환경 변수 보간을 지원합니다. `allowedEnvVars` 배열에 나열된 변수만 해석되며, 다른 모든 `$VAR` 참조는 빈 값으로 유지됩니다.

전체 설정 옵션 및 응답 처리는 레퍼런스의 [HTTP hook](/hooks#http-hook-fields)을 참조하세요.

## 제한 사항 및 문제 해결

### 제한 사항

* Command hook은 stdout, stderr, exit code를 통해서만 통신합니다. `/` 명령이나 도구 호출을 트리거할 수 없습니다. `additionalContext`를 통해 반환된 텍스트는 Claude가 일반 텍스트로 읽는 시스템 리마인더로 주입됩니다. HTTP hook은 대신 응답 본문을 통해 통신합니다.
* Hook 타임아웃은 기본적으로 10분이며, `timeout` 필드(초 단위)로 hook별 설정이 가능합니다.
* `PostToolUse` hook은 도구가 이미 실행되었으므로 작업을 되돌릴 수 없습니다.
* `PermissionRequest` hook은 [비대화형 모드](/headless) (`-p`)에서 실행되지 않습니다. 자동 권한 결정에는 `PreToolUse` hook을 사용하세요.
* `Stop` hook은 작업 완료 시에만 실행되는 것이 아니라 Claude가 응답을 마칠 때마다 실행됩니다. 사용자 인터럽트 시에는 실행되지 않습니다. API 오류는 대신 [StopFailure](/hooks#stopfailure)를 발생시킵니다.
* 여러 PreToolUse hook이 [`updatedInput`](/hooks#pretooluse)을 반환하여 도구의 인수를 다시 작성할 때, 마지막으로 완료된 것이 적용됩니다. Hook이 병렬로 실행되므로 순서가 비결정적입니다. 동일한 도구의 입력을 수정하는 hook이 둘 이상 되지 않도록 하세요.

### Hook과 권한 모드

PreToolUse hook은 모든 권한 모드 검사 전에 실행됩니다. `permissionDecision: "deny"`를 반환하는 hook은 `bypassPermissions` 모드나 `--dangerously-skip-permissions` 사용 시에도 도구를 차단합니다. 이를 통해 사용자가 권한 모드를 변경하여 우회할 수 없는 정책을 적용할 수 있습니다.

반대는 성립하지 않습니다: `"allow"`를 반환하는 hook은 설정의 deny 규칙을 우회하지 않습니다. Hook은 제한을 강화할 수는 있지만 권한 규칙이 허용하는 것 이상으로 완화할 수는 없습니다.

### Hook이 실행되지 않는 경우

Hook이 설정되어 있지만 실행되지 않는 경우입니다.

* `/hooks`를 실행하여 올바른 이벤트 아래에 hook이 표시되는지 확인하세요
* matcher 패턴이 도구 이름과 정확히 일치하는지 확인하세요 (matcher는 대소문자를 구분합니다)
* 올바른 이벤트 유형을 트리거하고 있는지 확인하세요 (예: `PreToolUse`는 도구 실행 전, `PostToolUse`는 실행 후)
* 비대화형 모드(`-p`)에서 `PermissionRequest` hook을 사용하는 경우 `PreToolUse`로 전환하세요

### 출력의 hook 오류

트랜스크립트에 "PreToolUse hook error: ..."와 같은 메시지가 표시되는 경우입니다.

* 스크립트가 예기치 않게 0이 아닌 코드로 종료되었습니다. 샘플 JSON을 파이핑하여 수동으로 테스트하세요:
  ```bash
  echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
  echo $?  # Check the exit code
  ```
* "command not found"가 표시되면 절대 경로 또는 `$CLAUDE_PROJECT_DIR`를 사용하여 스크립트를 참조하세요
* "jq: command not found"가 표시되면 `jq`를 설치하거나 Python/Node.js를 사용하여 JSON을 파싱하세요
* 스크립트가 전혀 실행되지 않으면 실행 가능하게 만드세요: `chmod +x ./my-hook.sh`

### `/hooks`에 설정된 hook이 표시되지 않는 경우

설정 파일을 편집했지만 메뉴에 hook이 나타나지 않는 경우입니다.

* 파일 편집은 보통 자동으로 감지됩니다. 몇 초 후에도 나타나지 않으면 파일 감시기가 변경을 놓쳤을 수 있습니다: 세션을 재시작하여 강제로 리로드하세요.
* JSON이 유효한지 확인하세요 (후행 쉼표와 주석은 허용되지 않습니다)
* 설정 파일이 올바른 위치에 있는지 확인하세요: 프로젝트 hook은 `.claude/settings.json`, 전역 hook은 `~/.claude/settings.json`

### Stop hook이 무한 실행되는 경우

Claude가 멈추지 않고 무한 루프에서 계속 작업하는 경우입니다.

Stop hook 스크립트는 이미 연속 실행을 트리거했는지 확인해야 합니다. JSON 입력의 `stop_hook_active` 필드를 파싱하고 `true`이면 일찍 종료하세요:

```bash
#!/bin/bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow Claude to stop
fi
# ... rest of your hook logic
```

### JSON 검증 실패

Hook 스크립트가 유효한 JSON을 출력하는데도 Claude Code가 JSON 파싱 오류를 표시하는 경우입니다.

Claude Code가 hook을 실행할 때 프로필(`~/.zshrc` 또는 `~/.bashrc`)을 소싱하는 셸을 생성합니다. 프로필에 조건 없는 `echo` 문이 포함되어 있으면 해당 출력이 hook의 JSON 앞에 추가됩니다:

```text
Shell ready on arm64
{"decision": "block", "reason": "Not allowed"}
```

Claude Code는 이를 JSON으로 파싱하려 하고 실패합니다. 이를 수정하려면 셸 프로필의 echo 문을 대화형 셸에서만 실행되도록 래핑하세요:

```bash
# In ~/.zshrc or ~/.bashrc
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

`$-` 변수는 셸 플래그를 포함하며, `i`는 대화형을 의미합니다. Hook은 비대화형 셸에서 실행되므로 echo가 건너뛰어집니다.

### 디버그 기법

`Ctrl+O`로 토글하는 트랜스크립트 뷰는 실행된 각 hook에 대한 한 줄 요약을 보여줍니다: 성공은 조용하고, 차단 오류는 stderr를 표시하며, 비차단 오류는 `<hook name> hook error` 알림과 stderr의 첫 번째 줄을 표시합니다.

매칭된 hook, exit code, stdout, stderr를 포함한 전체 실행 세부 정보는 디버그 로그를 읽으세요. `claude --debug-file /tmp/claude.log`로 Claude Code를 시작하여 알려진 경로에 쓰고, 다른 터미널에서 `tail -f /tmp/claude.log`로 확인하세요. 해당 플래그 없이 시작한 경우 세션 중 `/debug`를 실행하여 로깅을 활성화하고 로그 경로를 찾을 수 있습니다.

## 더 알아보기

* [Hook 레퍼런스](/hooks): 전체 이벤트 스키마, JSON 출력 형식, 비동기 hook, MCP 도구 hook
* [보안 고려사항](/hooks#security-considerations): 공유 또는 프로덕션 환경에 hook을 배포하기 전에 검토
* [Bash 명령 검증기 예시](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py): 완전한 참조 구현
