# 플러그인 만들기

> 스킬, 에이전트, 훅, MCP 서버로 Claude Code를 확장하는 사용자 정의 플러그인을 만듭니다.

플러그인을 사용하면 프로젝트와 팀 간에 공유할 수 있는 사용자 정의 기능으로 Claude Code를 확장할 수 있습니다. 이 가이드에서는 스킬, 에이전트, 훅, MCP 서버를 포함하는 플러그인 만들기를 다룹니다.

기존 플러그인을 설치하려면 [플러그인 찾기 및 설치](/discover-plugins)를 참조하세요. 전체 기술 사양은 [플러그인 참조](/plugins-reference)를 참조하세요.

## 플러그인과 독립 설정의 사용 시기

Claude Code는 사용자 정의 스킬, 에이전트, 훅을 추가하는 두 가지 방법을 지원합니다:

| 접근 방식                                                   | 스킬 이름            | 적합한 용도                                                                                     |
| :---------------------------------------------------------- | :------------------- | :---------------------------------------------------------------------------------------------- |
| **독립** (`.claude/` 디렉토리)                              | `/hello`             | 개인 워크플로, 프로젝트별 맞춤화, 빠른 실험                                                    |
| **플러그인** (`.claude-plugin/plugin.json`이 있는 디렉토리) | `/plugin-name:hello` | 팀원과 공유, 커뮤니티 배포, 버전 관리 릴리스, 프로젝트 간 재사용                                |

**독립 설정을 사용하는 경우**:

* 단일 프로젝트를 위해 Claude Code를 맞춤화하는 경우
* 설정이 개인적이고 공유할 필요가 없는 경우
* 패키지로 만들기 전에 스킬이나 훅을 실험하는 경우
* `/hello`나 `/deploy`와 같은 짧은 스킬 이름을 원하는 경우

**플러그인을 사용하는 경우**:

* 팀이나 커뮤니티와 기능을 공유하려는 경우
* 여러 프로젝트에서 동일한 스킬/에이전트가 필요한 경우
* 확장의 버전 관리와 쉬운 업데이트를 원하는 경우
* 마켓플레이스를 통해 배포하는 경우
* `/my-plugin:hello`와 같은 네임스페이스 스킬을 사용해도 괜찮은 경우 (네임스페이싱은 플러그인 간 충돌을 방지합니다)

::: tip
빠른 반복을 위해 `.claude/`의 독립 설정으로 시작한 다음, 공유할 준비가 되면 [플러그인으로 변환](#기존-설정을-플러그인으로-변환)하세요.
:::

## 빠른 시작

이 빠른 시작에서는 사용자 정의 스킬이 포함된 플러그인을 만드는 과정을 안내합니다. 매니페스트(플러그인을 정의하는 설정 파일)를 만들고, 스킬을 추가하고, `--plugin-dir` 플래그를 사용하여 로컬에서 테스트합니다.

### 사전 요구사항

* Claude Code [설치 및 인증 완료](/quickstart#step-1-install-claude-code)

::: info
`/plugin` 명령어가 보이지 않으면 Claude Code를 최신 버전으로 업데이트하세요. 업그레이드 지침은 [문제 해결](/troubleshooting)을 참조하세요.
:::

### 첫 번째 플러그인 만들기

**1단계: 플러그인 디렉토리 만들기**

모든 플러그인은 매니페스트와 스킬, 에이전트 또는 훅을 포함하는 자체 디렉토리에 있습니다. 지금 하나를 만드세요:

```bash
mkdir my-first-plugin
```

**2단계: 플러그인 매니페스트 만들기**

`.claude-plugin/plugin.json`의 매니페스트 파일은 플러그인의 아이덴티티, 즉 이름, 설명, 버전을 정의합니다. Claude Code는 이 메타데이터를 사용하여 플러그인 관리자에 플러그인을 표시합니다.

플러그인 폴더 내에 `.claude-plugin` 디렉토리를 만드세요:

```bash
mkdir my-first-plugin/.claude-plugin
```

그런 다음 다음 내용으로 `my-first-plugin/.claude-plugin/plugin.json`을 만드세요:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| 필드          | 용도                                                                                               |
| :------------ | :------------------------------------------------------------------------------------------------- |
| `name`        | 고유 식별자 및 스킬 네임스페이스. 스킬에 이 접두사가 붙습니다 (예: `/my-first-plugin:hello`).       |
| `description` | 플러그인을 찾아보거나 설치할 때 플러그인 관리자에 표시됩니다.                                      |
| `version`     | [시맨틱 버전 관리](/plugins-reference#version-management)를 사용하여 릴리스를 추적합니다.           |
| `author`      | 선택사항. 귀속에 유용합니다.                                                                       |

`homepage`, `repository`, `license`와 같은 추가 필드는 [전체 매니페스트 스키마](/plugins-reference#plugin-manifest-schema)를 참조하세요.

**3단계: 스킬 추가**

스킬은 `skills/` 디렉토리에 있습니다. 각 스킬은 `SKILL.md` 파일을 포함하는 폴더입니다. 폴더 이름이 플러그인의 네임스페이스를 접두사로 하여 스킬 이름이 됩니다 (`my-first-plugin`이라는 플러그인의 `hello/`는 `/my-first-plugin:hello`를 생성합니다).

플러그인 폴더에 스킬 디렉토리를 만드세요:

```bash
mkdir -p my-first-plugin/skills/hello
```

그런 다음 다음 내용으로 `my-first-plugin/skills/hello/SKILL.md`를 만드세요:

```markdown
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

**4단계: 플러그인 테스트**

`--plugin-dir` 플래그를 사용하여 플러그인을 로드하고 Claude Code를 실행하세요:

```bash
claude --plugin-dir ./my-first-plugin
```

Claude Code가 시작되면 새 스킬을 시도하세요:

```shell
/my-first-plugin:hello
```

Claude가 인사말로 응답하는 것을 볼 수 있습니다. `/help`를 실행하면 플러그인 네임스페이스 아래에 스킬이 나열됩니다.

::: info
**네임스페이싱이 필요한 이유?** 플러그인 스킬은 항상 네임스페이스가 지정됩니다 (`/my-first-plugin:hello`처럼). 이는 여러 플러그인이 같은 이름의 스킬을 가질 때 충돌을 방지합니다.

네임스페이스 접두사를 변경하려면 `plugin.json`의 `name` 필드를 업데이트하세요.
:::

**5단계: 스킬 인수 추가**

사용자 입력을 받아 스킬을 동적으로 만드세요. `$ARGUMENTS` 플레이스홀더는 사용자가 스킬 이름 뒤에 제공하는 텍스트를 캡처합니다.

`SKILL.md` 파일을 업데이트하세요:

```markdown
---
description: Greet the user with a personalized message
---

# Hello Skill

Greet the user named "$ARGUMENTS" warmly and ask how you can help them today. Make the greeting personal and encouraging.
```

`/reload-plugins`를 실행하여 변경 사항을 적용한 다음, 이름과 함께 스킬을 시도하세요:

```shell
/my-first-plugin:hello Alex
```

Claude가 이름을 부르며 인사합니다. 스킬에 인수를 전달하는 방법에 대한 자세한 내용은 [스킬](/skills#pass-arguments-to-skills)을 참조하세요.

이제 다음 핵심 구성 요소로 플러그인을 성공적으로 만들고 테스트했습니다:

* **플러그인 매니페스트** (`.claude-plugin/plugin.json`): 플러그인의 메타데이터를 설명합니다
* **스킬 디렉토리** (`skills/`): 사용자 정의 스킬을 포함합니다
* **스킬 인수** (`$ARGUMENTS`): 동적 동작을 위해 사용자 입력을 캡처합니다

::: tip
`--plugin-dir` 플래그는 개발 및 테스트에 유용합니다. 다른 사람과 플러그인을 공유할 준비가 되면 [플러그인 마켓플레이스 만들기 및 배포](/plugin-marketplaces)를 참조하세요.
:::

## 플러그인 구조 개요

스킬이 포함된 플러그인을 만들었지만, 플러그인에는 사용자 정의 에이전트, 훅, MCP 서버, LSP 서버 등 훨씬 더 많은 것을 포함할 수 있습니다.

::: warning
**흔한 실수**: `commands/`, `agents/`, `skills/`, `hooks/`를 `.claude-plugin/` 디렉토리 안에 넣지 마세요. `.claude-plugin/` 안에는 `plugin.json`만 들어갑니다. 다른 모든 디렉토리는 플러그인 루트 수준에 있어야 합니다.
:::

| 디렉토리          | 위치        | 용도                                                                       |
| :---------------- | :---------- | :------------------------------------------------------------------------- |
| `.claude-plugin/` | 플러그인 루트 | `plugin.json` 매니페스트 포함 (컴포넌트가 기본 위치를 사용하면 선택사항)   |
| `skills/`         | 플러그인 루트 | `<name>/SKILL.md` 디렉토리로 된 스킬                                      |
| `commands/`       | 플러그인 루트 | 플랫 Markdown 파일로 된 스킬. 새 플러그인에는 `skills/`를 사용하세요       |
| `agents/`         | 플러그인 루트 | 사용자 정의 에이전트 정의                                                  |
| `hooks/`          | 플러그인 루트 | `hooks.json`의 이벤트 핸들러                                               |
| `.mcp.json`       | 플러그인 루트 | MCP 서버 설정                                                              |
| `.lsp.json`       | 플러그인 루트 | 코드 인텔리전스를 위한 LSP 서버 설정                                       |
| `bin/`            | 플러그인 루트 | 플러그인이 활성화된 동안 Bash 도구의 `PATH`에 추가되는 실행 파일           |
| `settings.json`   | 플러그인 루트 | 플러그인 활성화 시 적용되는 기본 [설정](/settings)                         |

::: info
**다음 단계**: 더 많은 기능을 추가할 준비가 되셨나요? 에이전트, 훅, MCP 서버, LSP 서버를 추가하려면 [더 복잡한 플러그인 개발](#더-복잡한-플러그인-개발)로 이동하세요. 모든 플러그인 컴포넌트의 전체 기술 사양은 [플러그인 참조](/plugins-reference)를 참조하세요.
:::

## 더 복잡한 플러그인 개발

기본 플러그인에 익숙해지면 더 정교한 확장을 만들 수 있습니다.

### 플러그인에 스킬 추가

플러그인에 [에이전트 스킬](/skills)을 포함하여 Claude의 기능을 확장할 수 있습니다. 스킬은 모델이 호출합니다: Claude가 작업 컨텍스트에 따라 자동으로 사용합니다.

플러그인 루트에 `SKILL.md` 파일이 포함된 스킬 폴더가 있는 `skills/` 디렉토리를 추가하세요:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

각 `SKILL.md`에는 `name`과 `description` 필드가 있는 프론트매터가 필요하며, 그 뒤에 지침이 옵니다:

```yaml
---
name: code-review
description: Reviews code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
---

When reviewing code, check for:
1. Code organization and structure
2. Error handling
3. Security concerns
4. Test coverage
```

플러그인을 설치한 후 `/reload-plugins`를 실행하여 스킬을 로드하세요. 프로그레시브 디스클로저 및 도구 제한을 포함한 전체 스킬 작성 가이드는 [에이전트 스킬](/skills)을 참조하세요.

### 플러그인에 LSP 서버 추가

::: tip
TypeScript, Python, Rust와 같은 일반적인 언어의 경우 공식 마켓플레이스에서 미리 빌드된 LSP 플러그인을 설치하세요. 이미 지원되는 언어가 아닌 경우에만 사용자 정의 LSP 플러그인을 만드세요.
:::

LSP (Language Server Protocol) 플러그인은 Claude에게 실시간 코드 인텔리전스를 제공합니다. 공식 LSP 플러그인이 없는 언어를 지원해야 하는 경우 플러그인에 `.lsp.json` 파일을 추가하여 직접 만들 수 있습니다:

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

플러그인을 설치하는 사용자는 자신의 컴퓨터에 언어 서버 바이너리가 설치되어 있어야 합니다.

전체 LSP 설정 옵션은 [LSP 서버](/plugins-reference#lsp-servers)를 참조하세요.

### 플러그인과 함께 기본 설정 제공

플러그인에는 플러그인이 활성화될 때 기본 설정을 적용하기 위한 `settings.json` 파일을 플러그인 루트에 포함할 수 있습니다. 현재 `agent`와 `subagentStatusLine` 키만 지원됩니다.

`agent`를 설정하면 플러그인의 [사용자 정의 에이전트](/sub-agents) 중 하나를 메인 스레드로 활성화하여 시스템 프롬프트, 도구 제한, 모델을 적용합니다. 이를 통해 플러그인은 활성화 시 Claude Code의 기본 동작을 변경할 수 있습니다.

```json
{
  "agent": "security-reviewer"
}
```

이 예시는 플러그인의 `agents/` 디렉토리에 정의된 `security-reviewer` 에이전트를 활성화합니다. `settings.json`의 설정은 `plugin.json`에 선언된 `settings`보다 우선합니다. 알 수 없는 키는 조용히 무시됩니다.

### 복잡한 플러그인 구성

많은 컴포넌트가 있는 플러그인의 경우 기능별로 디렉토리 구조를 구성하세요. 전체 디렉토리 레이아웃과 구성 패턴은 [플러그인 디렉토리 구조](/plugins-reference#plugin-directory-structure)를 참조하세요.

### 플러그인 로컬 테스트

개발 중에 `--plugin-dir` 플래그를 사용하여 플러그인을 테스트하세요. 이렇게 하면 설치 없이 플러그인을 직접 로드합니다.

```bash
claude --plugin-dir ./my-plugin
```

`--plugin-dir` 플러그인이 설치된 마켓플레이스 플러그인과 같은 이름을 가지면 해당 세션에서 로컬 복사본이 우선합니다. 이를 통해 이미 설치한 플러그인의 변경 사항을 먼저 제거하지 않고도 테스트할 수 있습니다. 관리형 설정에서 강제 활성화된 마켓플레이스 플러그인은 유일한 예외이며 재정의할 수 없습니다.

플러그인을 변경할 때 재시작 없이 업데이트를 적용하려면 `/reload-plugins`를 실행하세요. 이렇게 하면 플러그인, 스킬, 에이전트, 훅, 플러그인 MCP 서버, 플러그인 LSP 서버가 다시 로드됩니다. 플러그인 컴포넌트를 테스트하세요:

* `/plugin-name:skill-name`으로 스킬을 시도하세요
* `/agents`에 에이전트가 표시되는지 확인하세요
* 훅이 예상대로 작동하는지 확인하세요

::: tip
여러 플러그인을 한 번에 로드하려면 플래그를 여러 번 지정하세요:

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```
:::

### 플러그인 문제 디버깅

플러그인이 예상대로 작동하지 않는 경우:

1. **구조 확인**: 디렉토리가 `.claude-plugin/` 안이 아닌 플러그인 루트에 있는지 확인하세요
2. **컴포넌트 개별 테스트**: 각 스킬, 에이전트, 훅을 별도로 확인하세요
3. **검증 및 디버깅 도구 사용**: CLI 명령어와 문제 해결 기법은 [디버깅 및 개발 도구](/plugins-reference#debugging-and-development-tools)를 참조하세요

### 플러그인 공유

플러그인을 공유할 준비가 되면:

1. **문서 추가**: 설치 및 사용 지침이 포함된 `README.md`를 포함하세요
2. **플러그인 버전 관리**: `plugin.json`에서 [시맨틱 버전 관리](/plugins-reference#version-management)를 사용하세요
3. **마켓플레이스 만들기 또는 사용**: 설치를 위해 [플러그인 마켓플레이스](/plugin-marketplaces)를 통해 배포하세요
4. **다른 사람과 테스트**: 더 넓은 배포 전에 팀원이 플러그인을 테스트하도록 하세요

플러그인이 마켓플레이스에 올라가면 다른 사람이 [플러그인 찾기 및 설치](/discover-plugins)의 지침에 따라 설치할 수 있습니다.

### 공식 마켓플레이스에 플러그인 제출

공식 Anthropic 마켓플레이스에 플러그인을 제출하려면 인앱 제출 양식 중 하나를 사용하세요:

* **Claude.ai**: [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
* **Console**: [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

::: info
전체 기술 사양, 디버깅 기법, 배포 전략은 [플러그인 참조](/plugins-reference)를 참조하세요.
:::

## 기존 설정을 플러그인으로 변환

`.claude/` 디렉토리에 이미 스킬이나 훅이 있다면 더 쉬운 공유와 배포를 위해 플러그인으로 변환할 수 있습니다.

### 마이그레이션 단계

**1단계: 플러그인 구조 만들기**

새 플러그인 디렉토리를 만드세요:

```bash
mkdir -p my-plugin/.claude-plugin
```

`my-plugin/.claude-plugin/plugin.json`에 매니페스트 파일을 만드세요:

```json
{
  "name": "my-plugin",
  "description": "Migrated from standalone configuration",
  "version": "1.0.0"
}
```

**2단계: 기존 파일 복사**

기존 설정을 플러그인 디렉토리로 복사하세요:

```bash
# 명령어 복사
cp -r .claude/commands my-plugin/

# 에이전트 복사 (있는 경우)
cp -r .claude/agents my-plugin/

# 스킬 복사 (있는 경우)
cp -r .claude/skills my-plugin/
```

**3단계: 훅 마이그레이션**

설정에 훅이 있다면 hooks 디렉토리를 만드세요:

```bash
mkdir my-plugin/hooks
```

훅 설정으로 `my-plugin/hooks/hooks.json`을 만드세요. `.claude/settings.json` 또는 `settings.local.json`에서 `hooks` 객체를 복사하세요. 형식이 동일합니다. 명령어는 stdin에서 JSON으로 훅 입력을 받으므로 `jq`를 사용하여 파일 경로를 추출하세요:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix" }]
      }
    ]
  }
}
```

**4단계: 마이그레이션된 플러그인 테스트**

플러그인을 로드하여 모든 것이 작동하는지 확인하세요:

```bash
claude --plugin-dir ./my-plugin
```

각 컴포넌트를 테스트하세요: 명령어를 실행하고, `/agents`에 에이전트가 표시되는지 확인하고, 훅이 올바르게 트리거되는지 확인하세요.

### 마이그레이션 시 변경 사항

| 독립 (`.claude/`)              | 플러그인                         |
| :----------------------------- | :------------------------------- |
| 하나의 프로젝트에서만 사용 가능 | 마켓플레이스를 통해 공유 가능    |
| `.claude/commands/`의 파일     | `plugin-name/commands/`의 파일   |
| `settings.json`의 훅           | `hooks/hooks.json`의 훅          |
| 공유하려면 수동 복사 필요       | `/plugin install`로 설치         |

::: info
마이그레이션 후 중복을 피하기 위해 `.claude/`에서 원본 파일을 제거할 수 있습니다. 로드 시 플러그인 버전이 우선합니다.
:::

## 다음 단계

Claude Code의 플러그인 시스템을 이해했으므로 다양한 목표에 대한 권장 경로는 다음과 같습니다:

### 플러그인 사용자

* [플러그인 찾기 및 설치](/discover-plugins): 마켓플레이스를 탐색하고 플러그인을 설치
* [팀 마켓플레이스 설정](/discover-plugins#configure-team-marketplaces): 팀을 위한 저장소 수준 플러그인 설정

### 플러그인 개발자

* [마켓플레이스 만들기 및 배포](/plugin-marketplaces): 플러그인을 패키지화하고 공유
* [플러그인 참조](/plugins-reference): 전체 기술 사양
* 특정 플러그인 컴포넌트 심화:
  * [스킬](/skills): 스킬 개발 세부사항
  * [서브에이전트](/sub-agents): 에이전트 설정 및 기능
  * [훅](/hooks): 이벤트 처리 및 자동화
  * [MCP](/mcp): 외부 도구 통합
