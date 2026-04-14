---
title: 플러그인 레퍼런스
description: Claude Code 플러그인 시스템의 완전한 기술 레퍼런스로, 스키마, CLI 명령어 및 컴포넌트 사양을 포함합니다.
---

# 플러그인 레퍼런스

:::tip
플러그인을 설치하려면 [플러그인 탐색 및 설치](/discover-plugins)를 참조하세요. 플러그인 생성은 [플러그인](/plugins)을, 플러그인 배포는 [플러그인 마켓플레이스](/plugin-marketplaces)를 참조하세요.
:::

이 레퍼런스는 Claude Code 플러그인 시스템의 완전한 기술 사양을 제공합니다. 컴포넌트 스키마, CLI 명령어, 개발 도구를 포함합니다.

**플러그인**은 커스텀 기능으로 Claude Code를 확장하는 독립적인 컴포넌트 디렉터리입니다. 플러그인 컴포넌트로는 스킬, 에이전트, 훅, MCP 서버, LSP 서버가 있습니다.

## 플러그인 컴포넌트 레퍼런스

### 스킬

플러그인은 Claude Code에 스킬을 추가하여 사용자 또는 Claude가 호출할 수 있는 `/name` 단축키를 만듭니다.

**위치**: 플러그인 루트의 `skills/` 또는 `commands/` 디렉터리

**파일 형식**: 스킬은 `SKILL.md`가 있는 디렉터리이며, 커맨드는 단순한 마크다운 파일입니다.

**스킬 구조**:

```text
skills/
├── pdf-processor/
│   ├── SKILL.md
│   ├── reference.md (선택사항)
│   └── scripts/ (선택사항)
└── code-reviewer/
    └── SKILL.md
```

**통합 동작**:

* 스킬과 커맨드는 플러그인이 설치될 때 자동으로 검색됩니다.
* Claude는 작업 컨텍스트에 따라 자동으로 스킬을 호출할 수 있습니다.
* 스킬은 SKILL.md 외에 지원 파일을 포함할 수 있습니다.

자세한 내용은 [스킬](/skills)을 참조하세요.

### 에이전트

플러그인은 Claude가 적절한 상황에서 자동으로 호출할 수 있는 특정 작업을 위한 전문 서브에이전트를 제공할 수 있습니다.

**위치**: 플러그인 루트의 `agents/` 디렉터리

**파일 형식**: 에이전트 기능을 설명하는 마크다운 파일

**에이전트 구조**:

```markdown
---
name: agent-name
description: 이 에이전트의 전문 분야와 Claude가 호출해야 하는 시점
model: sonnet
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
---

역할, 전문성, 동작을 설명하는 에이전트 시스템 프롬프트.
```

플러그인 에이전트는 `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation` 프론트매터 필드를 지원합니다. `isolation`의 유효한 값은 `"worktree"`뿐입니다. 보안상의 이유로 플러그인에서 제공하는 에이전트에는 `hooks`, `mcpServers`, `permissionMode`가 지원되지 않습니다.

**통합 포인트**:

* 에이전트는 `/agents` 인터페이스에 표시됩니다.
* Claude는 작업 컨텍스트에 따라 에이전트를 자동으로 호출할 수 있습니다.
* 사용자가 에이전트를 수동으로 호출할 수 있습니다.
* 플러그인 에이전트는 Claude 내장 에이전트와 함께 동작합니다.

자세한 내용은 [서브에이전트](/sub-agents)를 참조하세요.

### 훅

플러그인은 Claude Code 이벤트에 자동으로 응답하는 이벤트 핸들러를 제공할 수 있습니다.

**위치**: 플러그인 루트의 `hooks/hooks.json` 또는 plugin.json에 인라인으로 포함

**형식**: 이벤트 매처와 액션이 있는 JSON 구성

**훅 구성**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

플러그인 훅은 [사용자 정의 훅](/hooks)과 동일한 라이프사이클 이벤트에 응답합니다:

| 이벤트                | 발생 시점                                                                                                                                              |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`       | 세션이 시작되거나 재개될 때                                                                                                                            |
| `UserPromptSubmit`   | 프롬프트를 제출할 때, Claude가 처리하기 전에                                                                                                           |
| `PreToolUse`         | 도구 호출이 실행되기 전에. 차단 가능                                                                                                                   |
| `PermissionRequest`  | 권한 대화상자가 표시될 때                                                                                                                              |
| `PermissionDenied`   | 자동 모드 분류기가 도구 호출을 거부할 때. `{retry: true}`를 반환하면 모델이 거부된 도구 호출을 재시도할 수 있음                                         |
| `PostToolUse`        | 도구 호출이 성공한 후                                                                                                                                  |
| `PostToolUseFailure` | 도구 호출이 실패한 후                                                                                                                                  |
| `Notification`       | Claude Code가 알림을 보낼 때                                                                                                                           |
| `SubagentStart`      | 서브에이전트가 생성될 때                                                                                                                               |
| `SubagentStop`       | 서브에이전트가 완료될 때                                                                                                                               |
| `TaskCreated`        | `TaskCreate`를 통해 작업이 생성될 때                                                                                                                   |
| `TaskCompleted`      | 작업이 완료로 표시될 때                                                                                                                                |
| `Stop`               | Claude가 응답을 마칠 때                                                                                                                                |
| `StopFailure`        | API 오류로 인해 턴이 종료될 때. 출력 및 종료 코드는 무시됨                                                                                             |
| `TeammateIdle`       | [에이전트 팀](/agent-teams)의 팀원이 유휴 상태가 될 때                                                                                                 |
| `InstructionsLoaded` | CLAUDE.md 또는 `.claude/rules/*.md` 파일이 컨텍스트에 로드될 때. 세션 시작 시 및 세션 중 파일이 지연 로드될 때 발생                                     |
| `ConfigChange`       | 세션 중 구성 파일이 변경될 때                                                                                                                          |
| `CwdChanged`         | 작업 디렉터리가 변경될 때 (예: Claude가 `cd` 명령을 실행할 때). direnv 같은 도구로 반응형 환경 관리에 유용                                              |
| `FileChanged`        | 감시 중인 파일이 디스크에서 변경될 때. `matcher` 필드가 감시할 파일명을 지정                                                                           |
| `WorktreeCreate`     | `--worktree` 또는 `isolation: "worktree"`를 통해 워크트리가 생성될 때. 기본 git 동작을 대체                                                             |
| `WorktreeRemove`     | 세션 종료 시 또는 서브에이전트가 완료될 때 워크트리가 제거될 때                                                                                        |
| `PreCompact`         | 컨텍스트 압축 전                                                                                                                                       |
| `PostCompact`        | 컨텍스트 압축 완료 후                                                                                                                                  |
| `Elicitation`        | MCP 서버가 도구 호출 중에 사용자 입력을 요청할 때                                                                                                     |
| `ElicitationResult`  | 사용자가 MCP elicitation에 응답한 후, 서버로 응답이 전송되기 전                                                                                        |
| `SessionEnd`         | 세션이 종료될 때                                                                                                                                       |

**훅 유형**:

* `command`: 셸 명령어 또는 스크립트 실행
* `http`: 이벤트 JSON을 URL로 POST 요청으로 전송
* `prompt`: LLM으로 프롬프트 평가 (컨텍스트에 `$ARGUMENTS` 플레이스홀더 사용)
* `agent`: 복잡한 검증 작업을 위해 도구를 갖춘 에이전틱 검증기 실행

### MCP 서버

플러그인은 Claude Code를 외부 도구 및 서비스에 연결하는 Model Context Protocol (MCP) 서버를 번들로 포함할 수 있습니다.

**위치**: 플러그인 루트의 `.mcp.json` 또는 plugin.json에 인라인으로 포함

**형식**: 표준 MCP 서버 구성

**MCP 서버 구성**:

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    },
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

**통합 동작**:

* 플러그인 MCP 서버는 플러그인이 활성화될 때 자동으로 시작됩니다.
* 서버는 Claude의 도구킷에서 표준 MCP 도구로 표시됩니다.
* 서버 기능은 Claude의 기존 도구와 원활하게 통합됩니다.
* 플러그인 서버는 사용자 MCP 서버와 독립적으로 구성할 수 있습니다.

### LSP 서버

:::tip
LSP 플러그인을 사용하려면 공식 마켓플레이스에서 설치하세요: `/plugin` Discover 탭에서 "lsp"를 검색하세요. 이 섹션은 공식 마켓플레이스에서 지원하지 않는 언어를 위한 LSP 플러그인 생성 방법을 설명합니다.
:::

플러그인은 [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) (LSP) 서버를 제공하여 코드베이스 작업 중에 Claude에게 실시간 코드 인텔리전스를 제공할 수 있습니다.

LSP 통합은 다음을 제공합니다:

* **즉각적인 진단**: 각 편집 후 Claude가 오류와 경고를 즉시 확인
* **코드 탐색**: 정의로 이동, 참조 찾기, 호버 정보
* **언어 인식**: 코드 심볼에 대한 타입 정보 및 문서

**위치**: 플러그인 루트의 `.lsp.json` 또는 `plugin.json`에 인라인으로 포함

**형식**: 언어 서버 이름을 구성에 매핑하는 JSON 구성

**`.lsp.json` 파일 형식**:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

**`plugin.json`에 인라인으로 포함**:

```json
{
  "name": "my-plugin",
  "lspServers": {
    "go": {
      "command": "gopls",
      "args": ["serve"],
      "extensionToLanguage": {
        ".go": "go"
      }
    }
  }
}
```

**필수 필드:**

| 필드                  | 설명                                            |
| :-------------------- | :---------------------------------------------- |
| `command`             | 실행할 LSP 바이너리 (PATH에 있어야 함)           |
| `extensionToLanguage` | 파일 확장자를 언어 식별자에 매핑                 |

**선택적 필드:**

| 필드                    | 설명                                                       |
| :---------------------- | :--------------------------------------------------------- |
| `args`                  | LSP 서버의 커맨드 라인 인수                                |
| `transport`             | 통신 전송: `stdio` (기본값) 또는 `socket`                  |
| `env`                   | 서버 시작 시 설정할 환경 변수                              |
| `initializationOptions` | 초기화 중 서버에 전달되는 옵션                             |
| `settings`              | `workspace/didChangeConfiguration`으로 전달되는 설정       |
| `workspaceFolder`       | 서버의 워크스페이스 폴더 경로                              |
| `startupTimeout`        | 서버 시작 대기 최대 시간 (밀리초)                          |
| `shutdownTimeout`       | 정상 종료 대기 최대 시간 (밀리초)                          |
| `restartOnCrash`        | 서버가 충돌할 경우 자동으로 재시작할지 여부                |
| `maxRestarts`           | 포기하기 전 최대 재시작 시도 횟수                          |

:::warning
**언어 서버 바이너리는 별도로 설치해야 합니다.** LSP 플러그인은 Claude Code가 언어 서버에 연결하는 방법을 구성하지만 서버 자체는 포함하지 않습니다. `/plugin` Errors 탭에서 `Executable not found in $PATH`가 표시되면 해당 언어에 필요한 바이너리를 설치하세요.
:::

**사용 가능한 LSP 플러그인:**

| 플러그인          | 언어 서버                  | 설치 명령어                                                                                |
| :--------------- | :------------------------- | :----------------------------------------------------------------------------------------- |
| `pyright-lsp`    | Pyright (Python)           | `pip install pyright` 또는 `npm install -g pyright`                                        |
| `typescript-lsp` | TypeScript Language Server | `npm install -g typescript-language-server typescript`                                     |
| `rust-lsp`       | rust-analyzer              | [rust-analyzer 설치 방법 참조](https://rust-analyzer.github.io/manual.html#installation)  |

언어 서버를 먼저 설치한 다음 마켓플레이스에서 플러그인을 설치하세요.

---

## 플러그인 설치 스코프

플러그인을 설치할 때 플러그인이 사용 가능한 위치와 다른 사람이 사용할 수 있는지를 결정하는 **스코프**를 선택합니다:

| 스코프    | 설정 파일                                       | 사용 사례                                                 |
| :-------- | :---------------------------------------------- | :-------------------------------------------------------- |
| `user`    | `~/.claude/settings.json`                       | 모든 프로젝트에서 사용 가능한 개인 플러그인 (기본값)      |
| `project` | `.claude/settings.json`                         | 버전 관리를 통해 공유되는 팀 플러그인                     |
| `local`   | `.claude/settings.local.json`                   | 프로젝트별 플러그인 (gitignore 적용)                      |
| `managed` | [관리형 설정](/settings#settings-files)         | 관리형 플러그인 (읽기 전용, 업데이트만 가능)              |

플러그인은 다른 Claude Code 구성과 동일한 스코프 시스템을 사용합니다. 설치 지침과 스코프 플래그는 [플러그인 설치](/discover-plugins#install-plugins)를 참조하세요. 스코프에 대한 자세한 설명은 [구성 스코프](/settings#configuration-scopes)를 참조하세요.

---

## 플러그인 매니페스트 스키마

`.claude-plugin/plugin.json` 파일은 플러그인의 메타데이터와 구성을 정의합니다. 이 섹션에서는 지원되는 모든 필드와 옵션을 설명합니다.

매니페스트는 선택사항입니다. 생략하면 Claude Code가 [기본 위치](#파일-위치-레퍼런스)에서 컴포넌트를 자동으로 검색하고 디렉터리 이름에서 플러그인 이름을 추출합니다. 메타데이터를 제공하거나 커스텀 컴포넌트 경로가 필요할 때 매니페스트를 사용하세요.

### 전체 스키마

```json
{
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "플러그인에 대한 간략한 설명",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/special.md"],
  "agents": "./custom/agents/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json",
  "monitors": "./monitors.json"
}
```

### 필수 필드

매니페스트를 포함하는 경우 `name`이 유일한 필수 필드입니다.

| 필드   | 유형   | 설명                                      | 예시                 |
| :----- | :----- | :---------------------------------------- | :------------------- |
| `name` | string | 고유 식별자 (kebab-case, 공백 없음)       | `"deployment-tools"` |

이 이름은 컴포넌트 네임스페이싱에 사용됩니다. 예를 들어 UI에서 `plugin-dev`라는 이름의 플러그인에 있는 에이전트 `agent-creator`는 `plugin-dev:agent-creator`로 표시됩니다.

### 메타데이터 필드

| 필드          | 유형   | 설명                                                                                                                           | 예시                                               |
| :------------ | :----- | :----------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| `version`     | string | 시맨틱 버전. 마켓플레이스 항목에도 설정된 경우 `plugin.json`이 우선됩니다. 한 곳에만 설정하면 됩니다.                          | `"2.1.0"`                                          |
| `description` | string | 플러그인 목적에 대한 간략한 설명                                                                                               | `"Deployment automation tools"`                    |
| `author`      | object | 작성자 정보                                                                                                                    | `{"name": "Dev Team", "email": "dev@company.com"}` |
| `homepage`    | string | 문서 URL                                                                                                                       | `"https://docs.example.com"`                       |
| `repository`  | string | 소스 코드 URL                                                                                                                  | `"https://github.com/user/plugin"`                 |
| `license`     | string | 라이선스 식별자                                                                                                                | `"MIT"`, `"Apache-2.0"`                            |
| `keywords`    | array  | 검색 태그                                                                                                                      | `["deployment", "ci-cd"]`                          |

### 컴포넌트 경로 필드

| 필드           | 유형                  | 설명                                                                                                                                                              | 예시                                   |
| :------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| `skills`       | string\|array         | `<name>/SKILL.md`를 포함하는 커스텀 스킬 디렉터리 (기본 `skills/` 대체)                                                                                           | `"./custom/skills/"`                   |
| `commands`     | string\|array         | 커스텀 플랫 `.md` 스킬 파일 또는 디렉터리 (기본 `commands/` 대체)                                                                                                 | `"./custom/cmd.md"` 또는 `["./cmd1.md"]` |
| `agents`       | string\|array         | 커스텀 에이전트 파일 (기본 `agents/` 대체)                                                                                                                        | `"./custom/agents/reviewer.md"`        |
| `hooks`        | string\|array\|object | 훅 구성 경로 또는 인라인 구성                                                                                                                                     | `"./my-extra-hooks.json"`              |
| `mcpServers`   | string\|array\|object | MCP 구성 경로 또는 인라인 구성                                                                                                                                    | `"./my-extra-mcp-config.json"`         |
| `outputStyles` | string\|array         | 커스텀 출력 스타일 파일/디렉터리 (기본 `output-styles/` 대체)                                                                                                     | `"./styles/"`                          |
| `lspServers`   | string\|array\|object | 코드 인텔리전스를 위한 [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) 구성 (정의로 이동, 참조 찾기 등)                          | `"./.lsp.json"`                        |
| `monitors`     | string\|array\|object | 플러그인이 활성화될 때 세션 시작 시 또는 이 플러그인의 스킬이 호출될 때 자동으로 활성화되는 백그라운드 [Monitor](/tools-reference#monitor-tool) 구성              | `"./monitors.json"`                    |
| `userConfig`   | object                | 플러그인이 활성화될 때 사용자에게 프롬프트되는 사용자 구성 가능 값. [사용자 구성](#사용자-구성) 참조                                                               | 아래 참조                              |
| `channels`     | array                 | 메시지 주입을 위한 채널 선언 (Telegram, Slack, Discord 스타일). [채널](#채널) 참조                                                                                 | 아래 참조                              |

### 사용자 구성

`userConfig` 필드는 플러그인이 활성화될 때 Claude Code가 사용자에게 프롬프트하는 값을 선언합니다. 사용자가 직접 `settings.json`을 편집하도록 요구하는 대신 이 방법을 사용하세요.

```json
{
  "userConfig": {
    "api_endpoint": {
      "description": "팀의 API 엔드포인트",
      "sensitive": false
    },
    "api_token": {
      "description": "API 인증 토큰",
      "sensitive": true
    }
  }
}
```

키는 유효한 식별자여야 합니다. 각 값은 MCP 및 LSP 서버 구성, 훅 커맨드, (비민감한 값만) 스킬 및 에이전트 콘텐츠에서 `${user_config.KEY}`로 치환하여 사용할 수 있습니다. 값은 플러그인 서브프로세스에 `CLAUDE_PLUGIN_OPTION_<KEY>` 환경 변수로도 내보내집니다.

비민감한 값은 `settings.json`의 `pluginConfigs[<plugin-id>].options` 하위에 저장됩니다. 민감한 값은 시스템 키체인에 저장됩니다 (키체인을 사용할 수 없는 경우 `~/.claude/.credentials.json`에 저장). 키체인 스토리지는 OAuth 토큰과 공유되며 약 2KB의 총 한도가 있으므로 민감한 값은 작게 유지하세요.

### 채널

`channels` 필드는 플러그인이 대화에 콘텐츠를 주입하는 하나 이상의 메시지 채널을 선언할 수 있게 합니다. 각 채널은 플러그인이 제공하는 MCP 서버에 바인딩됩니다.

```json
{
  "channels": [
    {
      "server": "telegram",
      "userConfig": {
        "bot_token": { "description": "Telegram 봇 토큰", "sensitive": true },
        "owner_id": { "description": "Telegram 사용자 ID", "sensitive": false }
      }
    }
  ]
}
```

`server` 필드는 필수이며 플러그인의 `mcpServers`에 있는 키와 일치해야 합니다. 선택적인 채널별 `userConfig`는 최상위 필드와 동일한 스키마를 사용하며, 플러그인이 활성화될 때 봇 토큰 또는 소유자 ID를 프롬프트할 수 있습니다.

### 경로 동작 규칙

`skills`, `commands`, `agents`, `outputStyles`, `monitors`의 경우 커스텀 경로가 기본값을 대체합니다. 매니페스트에 `skills`가 지정되면 기본 `skills/` 디렉터리는 스캔되지 않으며, `monitors`가 지정되면 기본 `monitors/monitors.json`은 로드되지 않습니다. [훅](#훅), [MCP 서버](#mcp-서버), [LSP 서버](#lsp-서버)는 여러 소스를 처리하는 다른 시맨틱을 가집니다.

* 모든 경로는 플러그인 루트에 상대적이며 `./`로 시작해야 합니다.
* 커스텀 경로의 컴포넌트는 동일한 명명 및 네임스페이싱 규칙을 사용합니다.
* 배열로 여러 경로를 지정할 수 있습니다.
* 스킬, 커맨드, 에이전트, 출력 스타일에서 기본 디렉터리를 유지하면서 경로를 추가하려면 배열에 기본값을 포함하세요: `"skills": ["./skills/", "./extras/"]`
* 스킬 경로가 `SKILL.md`를 직접 포함하는 디렉터리를 가리키는 경우 (예: `"skills": ["./"]`가 플러그인 루트를 가리킴), `SKILL.md`의 프론트매터 `name` 필드가 스킬의 호출 이름을 결정합니다. 이는 설치 디렉터리에 관계없이 안정적인 이름을 제공합니다. `name`이 프론트매터에 설정되지 않은 경우 디렉터리 basename이 폴백으로 사용됩니다.

**경로 예시**:

```json
{
  "commands": [
    "./specialized/deploy.md",
    "./utilities/batch-process.md"
  ],
  "agents": [
    "./custom-agents/reviewer.md",
    "./custom-agents/tester.md"
  ]
}
```

### 환경 변수

Claude Code는 플러그인 경로 참조를 위한 두 가지 변수를 제공합니다. 두 변수 모두 스킬 콘텐츠, 에이전트 콘텐츠, 훅 커맨드, MCP 또는 LSP 서버 구성에서 나타나는 곳 어디에서나 인라인으로 치환됩니다. 두 변수 모두 훅 프로세스와 MCP 또는 LSP 서버 서브프로세스에 환경 변수로 내보내집니다.

**`${CLAUDE_PLUGIN_ROOT}`**: 플러그인 설치 디렉터리의 절대 경로입니다. 플러그인과 함께 번들된 스크립트, 바이너리, 구성 파일을 참조하는 데 사용하세요. 이 경로는 플러그인 업데이트 시 변경되므로 여기에 작성하는 파일은 업데이트 후에도 유지되지 않습니다.

**`${CLAUDE_PLUGIN_DATA}`**: 업데이트 후에도 유지되는 플러그인 상태를 위한 영속적 디렉터리입니다. `node_modules` 또는 Python 가상 환경과 같은 설치된 의존성, 생성된 코드, 캐시, 플러그인 버전 간에 유지되어야 하는 파일에 사용하세요. 이 변수가 처음 참조될 때 디렉터리가 자동으로 생성됩니다.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
          }
        ]
      }
    ]
  }
}
```

#### 영속 데이터 디렉터리

`${CLAUDE_PLUGIN_DATA}` 디렉터리는 `~/.claude/plugins/data/{id}/`로 해석됩니다. 여기서 `{id}`는 `a-z`, `A-Z`, `0-9`, `_`, `-` 외의 문자가 `-`로 대체된 플러그인 식별자입니다. `formatter@my-marketplace`로 설치된 플러그인의 경우 디렉터리는 `~/.claude/plugins/data/formatter-my-marketplace/`입니다.

일반적인 사용 사례는 언어 의존성을 한 번 설치하고 세션과 플러그인 업데이트에 걸쳐 재사용하는 것입니다. 데이터 디렉터리는 단일 플러그인 버전보다 오래 지속되므로 디렉터리 존재 여부만으로는 업데이트가 플러그인의 의존성 매니페스트를 변경했는지 감지할 수 없습니다. 권장 패턴은 번들된 매니페스트를 데이터 디렉터리의 복사본과 비교하고 다를 경우 재설치하는 것입니다.

이 `SessionStart` 훅은 첫 실행 시와 플러그인 업데이트에 변경된 `package.json`이 포함될 때마다 `node_modules`를 설치합니다:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "diff -q \"${CLAUDE_PLUGIN_ROOT}/package.json\" \"${CLAUDE_PLUGIN_DATA}/package.json\" >/dev/null 2>&1 || (cd \"${CLAUDE_PLUGIN_DATA}\" && cp \"${CLAUDE_PLUGIN_ROOT}/package.json\" . && npm install) || rm -f \"${CLAUDE_PLUGIN_DATA}/package.json\""
          }
        ]
      }
    ]
  }
}
```

저장된 복사본이 없거나 번들된 것과 다를 경우 `diff`가 0이 아닌 값으로 종료되어 첫 실행과 의존성 변경 업데이트 모두를 처리합니다. `npm install`이 실패하면 후속 `rm`이 복사된 매니페스트를 제거하여 다음 세션에서 재시도합니다.

`${CLAUDE_PLUGIN_ROOT}`에 번들된 스크립트는 영속된 `node_modules`에 대해 실행할 수 있습니다:

```json
{
  "mcpServers": {
    "routines": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
      "env": {
        "NODE_PATH": "${CLAUDE_PLUGIN_DATA}/node_modules"
      }
    }
  }
}
```

데이터 디렉터리는 마지막으로 설치된 스코프에서 플러그인을 제거할 때 자동으로 삭제됩니다. `/plugin` 인터페이스는 디렉터리 크기를 표시하고 삭제 전에 확인을 요청합니다. CLI는 기본적으로 삭제하며, 유지하려면 [`--keep-data`](#plugin-uninstall)를 전달하세요.

---

## 플러그인 캐싱 및 파일 해석

플러그인은 두 가지 방법 중 하나로 지정됩니다:

* 세션 동안 `claude --plugin-dir`을 통해.
* 마켓플레이스를 통해 향후 세션을 위해 설치.

보안 및 검증 목적으로 Claude Code는 *마켓플레이스* 플러그인을 제자리에서 사용하는 대신 사용자의 로컬 **플러그인 캐시** (`~/.claude/plugins/cache`)에 복사합니다. 이 동작은 외부 파일을 참조하는 플러그인을 개발할 때 중요합니다.

각 설치된 버전은 캐시의 별도 디렉터리입니다. 플러그인을 업데이트하거나 제거하면 이전 버전 디렉터리가 고아 상태로 표시되고 7일 후에 자동으로 제거됩니다. 유예 기간은 이미 이전 버전을 로드한 동시 Claude Code 세션이 오류 없이 계속 실행될 수 있도록 합니다.

### 경로 탐색 제한

설치된 플러그인은 디렉터리 외부의 파일을 참조할 수 없습니다. 플러그인 루트 외부를 탐색하는 경로 (예: `../shared-utils`)는 해당 외부 파일이 캐시에 복사되지 않기 때문에 설치 후 작동하지 않습니다.

### 외부 의존성 작업

플러그인이 디렉터리 외부의 파일에 접근해야 하는 경우 플러그인 디렉터리 내에서 외부 파일로의 심볼릭 링크를 만들 수 있습니다. 심볼릭 링크는 역참조되지 않고 캐시에 보존되며 런타임에 대상으로 해석됩니다. 다음 명령어는 플러그인 디렉터리 내부에서 공유 유틸리티 위치로의 링크를 만듭니다:

```bash
ln -s /path/to/shared-utils ./shared-utils
```

이는 캐싱 시스템의 보안 이점을 유지하면서 유연성을 제공합니다.

---

## 플러그인 디렉터리 구조

### 표준 플러그인 레이아웃

완전한 플러그인은 다음 구조를 따릅니다:

```text
enterprise-plugin/
├── .claude-plugin/           # 메타데이터 디렉터리 (선택사항)
│   └── plugin.json             # 플러그인 매니페스트
├── skills/                   # 스킬
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── commands/                 # 플랫 .md 파일로 된 스킬
│   ├── status.md
│   └── logs.md
├── agents/                   # 서브에이전트 정의
│   ├── security-reviewer.md
│   ├── performance-tester.md
│   └── compliance-checker.md
├── output-styles/            # 출력 스타일 정의
│   └── terse.md
├── monitors/                 # 백그라운드 모니터 구성
│   └── monitors.json
├── hooks/                    # 훅 구성
│   ├── hooks.json           # 메인 훅 구성
│   └── security-hooks.json  # 추가 훅
├── bin/                      # PATH에 추가되는 플러그인 실행 파일
│   └── my-tool               # Bash 도구에서 bare 명령어로 호출 가능
├── settings.json            # 플러그인의 기본 설정
├── .mcp.json                # MCP 서버 정의
├── .lsp.json                # LSP 서버 구성
├── scripts/                 # 훅 및 유틸리티 스크립트
│   ├── security-scan.sh
│   ├── format-code.py
│   └── deploy.js
├── LICENSE                  # 라이선스 파일
└── CHANGELOG.md             # 버전 이력
```

:::warning
`.claude-plugin/` 디렉터리에는 `plugin.json` 파일이 포함됩니다. 다른 모든 디렉터리 (commands/, agents/, skills/, output-styles/, monitors/, hooks/)는 `.claude-plugin/` 내부가 아닌 플러그인 루트에 있어야 합니다.
:::

### 파일 위치 레퍼런스

| 컴포넌트          | 기본 위치                    | 목적                                                                                                                                                              |
| :---------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **매니페스트**    | `.claude-plugin/plugin.json` | 플러그인 메타데이터 및 구성 (선택사항)                                                                                                                            |
| **스킬**          | `skills/`                    | `<name>/SKILL.md` 구조의 스킬                                                                                                                                     |
| **커맨드**        | `commands/`                  | 플랫 마크다운 파일로 된 스킬. 새 플러그인에는 `skills/` 사용                                                                                                     |
| **에이전트**      | `agents/`                    | 서브에이전트 마크다운 파일                                                                                                                                        |
| **출력 스타일**   | `output-styles/`             | 출력 스타일 정의                                                                                                                                                  |
| **훅**            | `hooks/hooks.json`           | 훅 구성                                                                                                                                                           |
| **MCP 서버**      | `.mcp.json`                  | MCP 서버 정의                                                                                                                                                     |
| **LSP 서버**      | `.lsp.json`                  | 언어 서버 구성                                                                                                                                                    |
| **모니터**        | `monitors/monitors.json`     | 백그라운드 모니터 구성                                                                                                                                            |
| **실행 파일**     | `bin/`                       | Bash 도구의 `PATH`에 추가되는 실행 파일. 플러그인이 활성화된 동안 모든 Bash 도구 호출에서 bare 명령어로 호출 가능                                                  |
| **설정**          | `settings.json`              | 플러그인 활성화 시 적용되는 기본 구성. 현재 [`agent`](/sub-agents) 및 [`subagentStatusLine`](/statusline#subagent-status-lines) 키만 지원                          |

---

## CLI 명령어 레퍼런스

Claude Code는 스크립팅 및 자동화에 유용한 비대화형 플러그인 관리를 위한 CLI 명령어를 제공합니다.

### plugin install

사용 가능한 마켓플레이스에서 플러그인을 설치합니다.

```bash
claude plugin install <plugin> [options]
```

**인수:**

* `<plugin>`: 플러그인 이름 또는 특정 마켓플레이스를 위한 `plugin-name@marketplace-name`

**옵션:**

| 옵션                  | 설명                                              | 기본값  |
| :-------------------- | :------------------------------------------------ | :------ |
| `-s, --scope <scope>` | 설치 스코프: `user`, `project`, 또는 `local`      | `user`  |
| `-h, --help`          | 명령어 도움말 표시                                |         |

스코프는 설치된 플러그인이 추가되는 설정 파일을 결정합니다. 예를 들어 `--scope project`는 .claude/settings.json의 `enabledPlugins`에 작성하여 프로젝트 저장소를 클론하는 모든 사람이 플러그인을 사용할 수 있게 합니다.

**예시:**

```bash
# 사용자 스코프에 설치 (기본값)
claude plugin install formatter@my-marketplace

# 프로젝트 스코프에 설치 (팀과 공유)
claude plugin install formatter@my-marketplace --scope project

# 로컬 스코프에 설치 (gitignore 적용)
claude plugin install formatter@my-marketplace --scope local
```

### plugin uninstall

설치된 플러그인을 제거합니다.

```bash
claude plugin uninstall <plugin> [options]
```

**인수:**

* `<plugin>`: 플러그인 이름 또는 `plugin-name@marketplace-name`

**옵션:**

| 옵션                  | 설명                                                                    | 기본값  |
| :-------------------- | :---------------------------------------------------------------------- | :------ |
| `-s, --scope <scope>` | 제거할 스코프: `user`, `project`, 또는 `local`                          | `user`  |
| `--keep-data`         | 플러그인의 [영속 데이터 디렉터리](#영속-데이터-디렉터리)를 유지         |         |
| `-h, --help`          | 명령어 도움말 표시                                                      |         |

**별칭:** `remove`, `rm`

기본적으로 마지막 남은 스코프에서 제거하면 플러그인의 `${CLAUDE_PLUGIN_DATA}` 디렉터리도 삭제됩니다. 새 버전 테스트 후 재설치할 경우처럼 유지하려면 `--keep-data`를 사용하세요.

### plugin enable

비활성화된 플러그인을 활성화합니다.

```bash
claude plugin enable <plugin> [options]
```

**인수:**

* `<plugin>`: 플러그인 이름 또는 `plugin-name@marketplace-name`

**옵션:**

| 옵션                  | 설명                                      | 기본값  |
| :-------------------- | :---------------------------------------- | :------ |
| `-s, --scope <scope>` | 활성화할 스코프: `user`, `project`, 또는 `local` | `user`  |
| `-h, --help`          | 명령어 도움말 표시                        |         |

### plugin disable

플러그인을 제거하지 않고 비활성화합니다.

```bash
claude plugin disable <plugin> [options]
```

**인수:**

* `<plugin>`: 플러그인 이름 또는 `plugin-name@marketplace-name`

**옵션:**

| 옵션                  | 설명                                       | 기본값  |
| :-------------------- | :----------------------------------------- | :------ |
| `-s, --scope <scope>` | 비활성화할 스코프: `user`, `project`, 또는 `local` | `user`  |
| `-h, --help`          | 명령어 도움말 표시                         |         |

### plugin update

플러그인을 최신 버전으로 업데이트합니다.

```bash
claude plugin update <plugin> [options]
```

**인수:**

* `<plugin>`: 플러그인 이름 또는 `plugin-name@marketplace-name`

**옵션:**

| 옵션                  | 설명                                                         | 기본값  |
| :-------------------- | :----------------------------------------------------------- | :------ |
| `-s, --scope <scope>` | 업데이트할 스코프: `user`, `project`, `local`, 또는 `managed` | `user`  |
| `-h, --help`          | 명령어 도움말 표시                                           |         |

---

## 디버깅 및 개발 도구

### 디버깅 명령어

`claude --debug`를 사용하여 플러그인 로딩 세부 정보를 확인합니다:

다음이 표시됩니다:

* 어떤 플러그인이 로드되고 있는지
* 플러그인 매니페스트의 오류
* 스킬, 에이전트, 훅 등록
* MCP 서버 초기화

### 일반적인 문제

| 문제                                | 원인                            | 해결 방법                                                                                                                                                        |
| :---------------------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 플러그인이 로드되지 않음            | 유효하지 않은 `plugin.json`     | `claude plugin validate` 또는 `/plugin validate`를 실행하여 `plugin.json`, 스킬/에이전트/커맨드 프론트매터, `hooks/hooks.json`의 구문 및 스키마 오류 확인        |
| 스킬이 표시되지 않음                | 잘못된 디렉터리 구조            | `skills/` 또는 `commands/`가 `.claude-plugin/` 내부가 아닌 플러그인 루트에 있는지 확인                                                                          |
| 훅이 실행되지 않음                  | 스크립트가 실행 불가능          | `chmod +x script.sh` 실행                                                                                                                                        |
| MCP 서버 실패                       | `${CLAUDE_PLUGIN_ROOT}` 누락    | 모든 플러그인 경로에 변수 사용                                                                                                                                   |
| 경로 오류                           | 절대 경로 사용                  | 모든 경로는 상대적이어야 하며 `./`로 시작해야 함                                                                                                                 |
| LSP `Executable not found in $PATH` | 언어 서버가 설치되지 않음       | 바이너리 설치 (예: `npm install -g typescript-language-server typescript`)                                                                                       |

### 오류 메시지 예시

**매니페스트 유효성 검사 오류**:

* `Invalid JSON syntax: Unexpected token } in JSON at position 142`: 누락된 쉼표, 여분의 쉼표, 따옴표 없는 문자열 확인
* `Plugin has an invalid manifest file at .claude-plugin/plugin.json. Validation errors: name: Required`: 필수 필드가 누락됨
* `Plugin has a corrupt manifest file at .claude-plugin/plugin.json. JSON parse error: ...`: JSON 구문 오류

**플러그인 로딩 오류**:

* `Warning: No commands found in plugin my-plugin custom directory: ./cmds. Expected .md files or SKILL.md in subdirectories.`: 커맨드 경로는 존재하지만 유효한 커맨드 파일이 없음
* `Plugin directory not found at path: ./plugins/my-plugin. Check that the marketplace entry has the correct path.`: marketplace.json의 `source` 경로가 존재하지 않는 디렉터리를 가리킴
* `Plugin my-plugin has conflicting manifests: both plugin.json and marketplace entry specify components.`: 중복된 컴포넌트 정의를 제거하거나 marketplace 항목에서 `strict: false`를 제거

### 훅 문제 해결

**훅 스크립트가 실행되지 않는 경우**:

1. 스크립트가 실행 가능한지 확인: `chmod +x ./scripts/your-script.sh`
2. 셔뱅 라인 확인: 첫 줄이 `#!/bin/bash` 또는 `#!/usr/bin/env bash`여야 함
3. 경로에 `${CLAUDE_PLUGIN_ROOT}`가 사용되는지 확인: `"command": "${CLAUDE_PLUGIN_ROOT}/scripts/your-script.sh"`
4. 스크립트를 수동으로 테스트: `./scripts/your-script.sh`

**예상 이벤트에서 훅이 트리거되지 않는 경우**:

1. 이벤트 이름이 올바른지 확인 (대소문자 구분): `postToolUse`가 아닌 `PostToolUse`
2. 매처 패턴이 도구와 일치하는지 확인: 파일 작업에는 `"matcher": "Write|Edit"`
3. 훅 유형이 유효한지 확인: `command`, `http`, `prompt`, 또는 `agent`

### MCP 서버 문제 해결

**서버가 시작되지 않는 경우**:

1. 명령어가 존재하고 실행 가능한지 확인
2. 모든 경로에 `${CLAUDE_PLUGIN_ROOT}` 변수가 사용되는지 확인
3. MCP 서버 로그 확인: `claude --debug`로 초기화 오류 표시
4. Claude Code 외부에서 서버를 수동으로 테스트

**서버 도구가 표시되지 않는 경우**:

1. `.mcp.json` 또는 `plugin.json`에 서버가 올바르게 구성되어 있는지 확인
2. 서버가 MCP 프로토콜을 올바르게 구현하는지 확인
3. 디버그 출력에서 연결 타임아웃 확인

### 디렉터리 구조 실수

**증상**: 플러그인이 로드되지만 컴포넌트 (스킬, 에이전트, 훅)가 누락됨.

**올바른 구조**: 컴포넌트는 `.claude-plugin/` 내부가 아닌 플러그인 루트에 있어야 합니다. `plugin.json`만 `.claude-plugin/`에 속합니다.

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json      ← 매니페스트만 여기에
├── commands/            ← 루트 레벨에
├── agents/              ← 루트 레벨에
└── hooks/               ← 루트 레벨에
```

컴포넌트가 `.claude-plugin/` 안에 있는 경우 플러그인 루트로 이동하세요.

**디버그 체크리스트**:

1. `claude --debug`를 실행하고 "loading plugin" 메시지 확인
2. 각 컴포넌트 디렉터리가 디버그 출력에 나열되는지 확인
3. 플러그인 파일을 읽을 수 있는 파일 권한 확인

---

## 배포 및 버전 관리 레퍼런스

### 버전 관리

플러그인 릴리스에는 시맨틱 버저닝을 따르세요:

```json
{
  "name": "my-plugin",
  "version": "2.1.0"
}
```

**버전 형식**: `MAJOR.MINOR.PATCH`

* **MAJOR**: 호환되지 않는 API 변경 (breaking changes)
* **MINOR**: 새 기능 (하위 호환 추가)
* **PATCH**: 버그 수정 (하위 호환 수정)

**모범 사례**:

* 첫 번째 안정적인 릴리스는 `1.0.0`으로 시작
* 변경 사항을 배포하기 전에 `plugin.json`의 버전 업데이트
* `CHANGELOG.md` 파일에 변경 사항 문서화
* 테스트를 위해 `2.0.0-beta.1`과 같은 사전 릴리스 버전 사용

:::warning
Claude Code는 버전을 사용하여 플러그인을 업데이트할지 결정합니다. 플러그인 코드를 변경했지만 `plugin.json`의 버전을 업데이트하지 않으면 캐싱으로 인해 기존 사용자가 변경 사항을 볼 수 없습니다.

플러그인이 [마켓플레이스](/plugin-marketplaces) 디렉터리 내에 있는 경우 `marketplace.json`을 통해 버전을 관리하고 `plugin.json`에서 `version` 필드를 생략할 수 있습니다.
:::

---

## 참고 자료

* [플러그인](/plugins) - 튜토리얼 및 실용적인 사용법
* [플러그인 마켓플레이스](/plugin-marketplaces) - 마켓플레이스 생성 및 관리
* [스킬](/skills) - 스킬 개발 세부 정보
* [서브에이전트](/sub-agents) - 에이전트 구성 및 기능
* [훅](/hooks) - 이벤트 처리 및 자동화
* [MCP](/mcp) - 외부 도구 통합
* [설정](/settings) - 플러그인 구성 옵션
