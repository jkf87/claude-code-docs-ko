---
title: 도구 레퍼런스
description: 권한 요구사항을 포함한 Claude Code가 사용할 수 있는 도구들의 완전한 레퍼런스
---

# 도구 레퍼런스

> Claude Code가 사용할 수 있는 도구들과 권한 요구사항에 대한 완전한 레퍼런스입니다.

Claude Code는 코드베이스를 이해하고 수정하는 데 도움이 되는 내장 도구 세트를 제공합니다. 도구 이름은 [권한 규칙](/permissions#tool-specific-permission-rules), [서브에이전트 도구 목록](/sub-agents), [훅 매처](/hooks)에서 사용하는 정확한 문자열입니다. 도구를 완전히 비활성화하려면 [권한 설정](/permissions#tool-specific-permission-rules)의 `deny` 배열에 도구 이름을 추가하세요.

커스텀 도구를 추가하려면 [MCP 서버](/mcp)를 연결하세요. 재사용 가능한 프롬프트 기반 워크플로우로 Claude를 확장하려면 [스킬](/skills)을 작성하세요. 스킬은 새 도구 항목을 추가하는 대신 기존 `Skill` 도구를 통해 실행됩니다.

| 도구                   | 설명                                                                                                                                                                                                                                                 | 권한 필요 여부 |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| `Agent`                | 작업을 처리하기 위해 자체 컨텍스트 창을 가진 [서브에이전트](/sub-agents)를 생성합니다                                                                                                                                                               | 아니오        |
| `AskUserQuestion`      | 요구사항 수집이나 모호함 해소를 위해 객관식 질문을 합니다                                                                                                                                                                                           | 아니오        |
| `Bash`                 | 환경에서 셸 명령을 실행합니다. [Bash 도구 동작](#bash-도구-동작) 참조                                                                                                                                                                              | 예            |
| `CronCreate`           | 현재 세션 내에서 반복 또는 일회성 프롬프트를 예약합니다 (Claude 종료 시 삭제됨). [예약된 작업](/scheduled-tasks) 참조                                                                                                                               | 아니오        |
| `CronDelete`           | ID로 예약된 작업을 취소합니다                                                                                                                                                                                                                        | 아니오        |
| `CronList`             | 세션의 모든 예약된 작업을 나열합니다                                                                                                                                                                                                                 | 아니오        |
| `Edit`                 | 특정 파일에 대한 타겟 편집을 수행합니다                                                                                                                                                                                                              | 예            |
| `EnterPlanMode`        | 코딩 전에 접근 방식을 설계하기 위해 플랜 모드로 전환합니다                                                                                                                                                                                          | 아니오        |
| `EnterWorktree`        | 격리된 [git worktree](/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees)를 생성하고 전환합니다. `path`를 전달하면 새로 생성하는 대신 현재 저장소의 기존 worktree로 전환합니다                                                   | 아니오        |
| `ExitPlanMode`         | 승인을 위한 계획을 제시하고 플랜 모드를 종료합니다                                                                                                                                                                                                  | 예            |
| `ExitWorktree`         | worktree 세션을 종료하고 원래 디렉토리로 돌아갑니다                                                                                                                                                                                                 | 아니오        |
| `Glob`                 | 패턴 매칭을 기반으로 파일을 찾습니다                                                                                                                                                                                                                 | 아니오        |
| `Grep`                 | 파일 내용에서 패턴을 검색합니다                                                                                                                                                                                                                      | 아니오        |
| `ListMcpResourcesTool` | 연결된 [MCP 서버](/mcp)가 노출하는 리소스를 나열합니다                                                                                                                                                                                              | 아니오        |
| `LSP`                  | 언어 서버를 통한 코드 인텔리전스: 정의로 이동, 참조 찾기, 타입 오류 및 경고 보고. [LSP 도구 동작](#lsp-도구-동작) 참조                                                                                                                              | 아니오        |
| `Monitor`              | 백그라운드에서 명령을 실행하고 각 출력 줄을 Claude에 전달하여 대화 중에 로그 항목, 파일 변경, 폴링된 상태에 반응할 수 있게 합니다. [Monitor 도구](#monitor-도구) 참조                                                                               | 예            |
| `NotebookEdit`         | Jupyter 노트북 셀을 수정합니다                                                                                                                                                                                                                       | 예            |
| `PowerShell`           | Windows에서 PowerShell 명령을 실행합니다. 옵트인 프리뷰. [PowerShell 도구](#powershell-도구) 참조                                                                                                                                                   | 예            |
| `Read`                 | 파일 내용을 읽습니다                                                                                                                                                                                                                                 | 아니오        |
| `ReadMcpResourceTool`  | URI로 특정 MCP 리소스를 읽습니다                                                                                                                                                                                                                     | 아니오        |
| `SendMessage`          | [에이전트 팀](/agent-teams) 팀원에게 메시지를 보내거나 에이전트 ID로 [서브에이전트를 재개](/sub-agents#resume-subagents)합니다. 중지된 서브에이전트는 백그라운드에서 자동으로 재개됩니다. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 설정 시에만 사용 가능 | 아니오        |
| `Skill`                | 메인 대화 내에서 [스킬](/skills#control-who-invokes-a-skill)을 실행합니다                                                                                                                                                                           | 예            |
| `TaskCreate`           | 작업 목록에 새 작업을 생성합니다                                                                                                                                                                                                                     | 아니오        |
| `TaskGet`              | 특정 작업의 전체 상세 정보를 가져옵니다                                                                                                                                                                                                              | 아니오        |
| `TaskList`             | 현재 상태와 함께 모든 작업을 나열합니다                                                                                                                                                                                                              | 아니오        |
| `TaskOutput`           | (더 이상 사용되지 않음) 백그라운드 작업의 출력을 가져옵니다. 작업 출력 파일 경로에서 `Read`를 사용하는 것이 권장됩니다                                                                                                                              | 아니오        |
| `TaskStop`             | ID로 실행 중인 백그라운드 작업을 종료합니다                                                                                                                                                                                                          | 아니오        |
| `TaskUpdate`           | 작업 상태, 의존성, 상세 정보를 업데이트하거나 작업을 삭제합니다                                                                                                                                                                                     | 아니오        |
| `TeamCreate`           | 여러 팀원으로 구성된 [에이전트 팀](/agent-teams)을 생성합니다. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 설정 시에만 사용 가능                                                                                                                        | 아니오        |
| `TeamDelete`           | 에이전트 팀을 해산하고 팀원 프로세스를 정리합니다. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 설정 시에만 사용 가능                                                                                                                                    | 아니오        |
| `TodoWrite`            | 세션 작업 체크리스트를 관리합니다. 비대화형 모드와 [Agent SDK](/headless)에서 사용 가능하며, 대화형 세션에서는 TaskCreate, TaskGet, TaskList, TaskUpdate를 대신 사용합니다                                                                           | 아니오        |
| `ToolSearch`           | [도구 검색](/mcp#scale-with-mcp-tool-search)이 활성화된 경우 지연 로드된 도구를 검색하고 로드합니다                                                                                                                                                 | 아니오        |
| `WebFetch`             | 지정된 URL에서 콘텐츠를 가져옵니다                                                                                                                                                                                                                   | 예            |
| `WebSearch`            | 웹 검색을 수행합니다                                                                                                                                                                                                                                 | 예            |
| `Write`                | 파일을 생성하거나 덮어씁니다                                                                                                                                                                                                                         | 예            |

권한 규칙은 `/permissions`를 사용하거나 [권한 설정](/settings#available-settings)에서 구성할 수 있습니다. [도구별 권한 규칙](/permissions#tool-specific-permission-rules)도 참조하세요.

## Bash 도구 동작

Bash 도구는 다음과 같은 지속성 동작으로 각 명령을 별도의 프로세스에서 실행합니다:

* Claude가 메인 세션에서 `cd`를 실행하면, 새 작업 디렉토리는 프로젝트 디렉토리 또는 `--add-dir`, `/add-dir`, 또는 설정의 `additionalDirectories`로 추가한 [추가 작업 디렉토리](/permissions#working-directories) 내에 있는 한 이후 Bash 명령에 유지됩니다. 서브에이전트 세션은 작업 디렉토리 변경이 유지되지 않습니다.
  * `cd`가 해당 디렉토리 외부로 이동하면, Claude Code는 프로젝트 디렉토리로 재설정하고 도구 결과에 `Shell cwd was reset to <dir>`을 추가합니다.
  * 이 유지 동작을 비활성화하여 모든 Bash 명령이 프로젝트 디렉토리에서 시작하게 하려면, `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1`을 설정하세요.
* 환경 변수는 지속되지 않습니다. 한 명령에서의 `export`는 다음 명령에서 사용할 수 없습니다.

Claude Code를 시작하기 전에 virtualenv 또는 conda 환경을 활성화하세요. Bash 명령 전반에 걸쳐 환경 변수를 유지하려면, Claude Code를 시작하기 전에 [`CLAUDE_ENV_FILE`](/env-vars)을 셸 스크립트로 설정하거나, [SessionStart 훅](/hooks#persist-environment-variables)을 사용하여 동적으로 설정하세요.

## LSP 도구 동작

LSP 도구는 실행 중인 언어 서버로부터 Claude에게 코드 인텔리전스를 제공합니다. 각 파일 편집 후 자동으로 타입 오류와 경고를 보고하여 Claude가 별도의 빌드 단계 없이 문제를 수정할 수 있게 합니다. Claude는 코드 탐색을 위해 직접 호출할 수도 있습니다:

* 심볼 정의로 이동
* 심볼에 대한 모든 참조 찾기
* 특정 위치의 타입 정보 가져오기
* 파일 또는 워크스페이스의 심볼 나열
* 인터페이스 구현 찾기
* 호출 계층 추적

이 도구는 언어용 [코드 인텔리전스 플러그인](/discover-plugins#code-intelligence)을 설치할 때까지 비활성 상태입니다. 플러그인에는 언어 서버 구성이 포함되어 있으며, 서버 바이너리는 별도로 설치합니다.

## Monitor 도구

:::info
Monitor 도구는 Claude Code v2.1.98 이상이 필요합니다.
:::

Monitor 도구를 사용하면 Claude가 대화를 중단하지 않고 백그라운드에서 무언가를 감시하고 변경 시 반응할 수 있습니다. Claude에게 다음을 요청하세요:

* 로그 파일을 추적하고 오류가 나타날 때 알림
* PR 또는 CI 작업을 폴링하고 상태가 변경될 때 보고
* 파일 변경을 위한 디렉토리 감시
* 지정한 장기 실행 스크립트의 출력 추적

Claude는 감시를 위한 작은 스크립트를 작성하고 백그라운드에서 실행하며, 도착하는 각 출력 줄을 수신합니다. 동일한 세션에서 계속 작업할 수 있으며 이벤트가 발생하면 Claude가 끼어듭니다. 모니터를 중지하려면 Claude에게 취소를 요청하거나 세션을 종료하세요.

Monitor는 [Bash와 동일한 권한 규칙](/permissions#tool-specific-permission-rules)을 사용하므로 Bash에 설정된 `allow` 및 `deny` 패턴이 여기에도 적용됩니다. Amazon Bedrock, Google Vertex AI, Microsoft Foundry에서는 사용할 수 없습니다. `DISABLE_TELEMETRY` 또는 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`이 설정된 경우에도 사용할 수 없습니다.

## PowerShell 도구

Windows에서 Claude Code는 Git Bash를 통해 라우팅하는 대신 PowerShell 명령을 네이티브로 실행할 수 있습니다. 이것은 옵트인 프리뷰입니다.

### PowerShell 도구 활성화

환경 또는 `settings.json`에서 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`을 설정하세요:

```json
{
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1"
  }
}
```

Claude Code는 `pwsh.exe` (PowerShell 7+)를 자동 감지하며 `powershell.exe` (PowerShell 5.1)로 대체합니다. Bash 도구는 PowerShell 도구와 함께 등록된 상태로 유지되므로, Claude에게 PowerShell을 사용하도록 요청해야 할 수 있습니다.

### 설정, 훅, 스킬에서의 셸 선택

PowerShell이 사용되는 위치를 제어하는 세 가지 추가 설정이 있습니다:

* [`settings.json`](/settings#available-settings)의 `"defaultShell": "powershell"`: 대화형 `!` 명령을 PowerShell을 통해 라우팅합니다. PowerShell 도구가 활성화되어 있어야 합니다.
* 개별 [명령 훅](/hooks#command-hook-fields)의 `"shell": "powershell"`: 해당 훅을 PowerShell에서 실행합니다. 훅은 PowerShell을 직접 생성하므로 `CLAUDE_CODE_USE_POWERSHELL_TOOL`과 무관하게 작동합니다.
* [스킬 프론트매터](/skills#frontmatter-reference)의 `shell: powershell`: `` !`command` `` 블록을 PowerShell에서 실행합니다. PowerShell 도구가 활성화되어 있어야 합니다.

Bash 도구 섹션에서 설명한 것과 동일한 메인 세션 작업 디렉토리 재설정 동작이 PowerShell 명령에도 적용되며, `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` 환경 변수도 포함됩니다.

### 프리뷰 제한 사항

PowerShell 도구는 프리뷰 기간 중 다음과 같은 알려진 제한 사항이 있습니다:

* Auto 모드는 아직 PowerShell 도구와 함께 작동하지 않습니다
* PowerShell 프로파일이 로드되지 않습니다
* 샌드박싱이 지원되지 않습니다
* 네이티브 Windows에서만 지원되며, WSL은 지원되지 않습니다
* Claude Code를 시작하려면 여전히 Git Bash가 필요합니다

## 사용 가능한 도구 확인

정확한 도구 세트는 프로바이더, 플랫폼, 설정에 따라 다릅니다. 실행 중인 세션에서 로드된 내용을 확인하려면 Claude에게 직접 물어보세요:

```text
What tools do you have access to?
```

Claude가 대화 형식으로 요약을 제공합니다. 정확한 MCP 도구 이름은 `/mcp`를 실행하세요.

## 참고 항목

* [MCP 서버](/mcp): 외부 서버를 연결하여 커스텀 도구 추가
* [권한](/permissions): 권한 시스템, 규칙 구문, 도구별 패턴
* [서브에이전트](/sub-agents): 서브에이전트의 도구 접근 구성
* [훅](/hooks-guide): 도구 실행 전후에 커스텀 명령 실행
