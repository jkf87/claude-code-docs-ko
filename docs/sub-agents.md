---
title: 커스텀 서브에이전트 생성
description: 작업별 워크플로우와 컨텍스트 관리 개선을 위해 Claude Code에서 특화된 AI 서브에이전트를 생성하고 사용하는 방법
---

# 커스텀 서브에이전트 생성

서브에이전트는 특정 유형의 작업을 처리하는 특화된 AI 어시스턴트입니다. 부수적인 작업이 검색 결과, 로그, 파일 내용으로 메인 대화를 가득 채울 것 같을 때 사용하세요. 서브에이전트는 자체 컨텍스트에서 해당 작업을 수행하고 요약만 반환합니다. 동일한 종류의 워커를 같은 지시사항으로 계속 생성하게 된다면 커스텀 서브에이전트를 정의하세요.

각 서브에이전트는 커스텀 시스템 프롬프트, 특정 도구 접근 권한, 독립적인 권한을 가진 자체 컨텍스트 창에서 실행됩니다. Claude가 서브에이전트의 설명과 일치하는 작업을 만나면 해당 서브에이전트에 위임하고, 서브에이전트는 독립적으로 작업하여 결과를 반환합니다. 컨텍스트 절약 효과를 실제로 확인하려면 [컨텍스트 창 시각화](/context-window)에서 서브에이전트가 별도의 창에서 리서치를 처리하는 세션을 살펴보세요.

::: info
여러 에이전트가 병렬로 작동하며 서로 소통해야 하는 경우에는 [에이전트 팀](/agent-teams)을 참조하세요. 서브에이전트는 단일 세션 내에서 작동하며, 에이전트 팀은 별도의 세션에 걸쳐 조율합니다.
:::

서브에이전트를 사용하면:

* **컨텍스트 보존**: 탐색과 구현을 메인 대화 밖에서 유지합니다
* **제약 적용**: 서브에이전트가 사용할 수 있는 도구를 제한합니다
* **설정 재사용**: 사용자 레벨 서브에이전트를 여러 프로젝트에서 사용합니다
* **동작 특화**: 특정 도메인을 위한 집중된 시스템 프롬프트를 작성합니다
* **비용 제어**: Haiku 같은 빠르고 저렴한 모델로 작업을 라우팅합니다

Claude는 각 서브에이전트의 설명을 사용하여 언제 작업을 위임할지 결정합니다. 서브에이전트를 생성할 때는 Claude가 언제 사용해야 하는지 알 수 있도록 명확한 설명을 작성하세요.

Claude Code에는 **Explore**, **Plan**, **general-purpose** 같은 기본 제공 서브에이전트가 포함되어 있습니다. 또한 특정 작업을 처리하는 커스텀 서브에이전트를 만들 수도 있습니다. 이 페이지에서는 [기본 제공 서브에이전트](#기본-제공-서브에이전트), [직접 만드는 방법](#빠른-시작-첫-번째-서브에이전트-만들기), [전체 설정 옵션](#서브에이전트-설정), [서브에이전트 작업 패턴](#서브에이전트-활용), [예제 서브에이전트](#예제-서브에이전트)를 다룹니다.

## 기본 제공 서브에이전트

Claude Code에는 Claude가 적절한 시점에 자동으로 사용하는 기본 제공 서브에이전트가 있습니다. 각각은 상위 대화의 권한을 상속받으며 추가적인 도구 제한이 적용됩니다.

### Explore

코드베이스를 검색하고 분석하는 데 최적화된 빠른 읽기 전용 에이전트입니다.

* **모델**: Haiku (빠른 저지연)
* **도구**: 읽기 전용 도구 (Write 및 Edit 도구 접근 불가)
* **목적**: 파일 탐색, 코드 검색, 코드베이스 탐색

Claude는 변경 없이 코드베이스를 검색하거나 이해해야 할 때 Explore에 위임합니다. 이렇게 하면 탐색 결과가 메인 대화 컨텍스트에 쌓이지 않습니다.

Explore를 호출할 때 Claude는 철저함 수준을 지정합니다: 목표한 조회에는 **quick**, 균형 잡힌 탐색에는 **medium**, 포괄적인 분석에는 **very thorough**.

### Plan

[plan 모드](/common-workflows#plan-모드로-안전한-코드-분석-사용)에서 계획 제시 전에 컨텍스트를 수집하는 데 사용되는 리서치 에이전트입니다.

* **모델**: 메인 대화에서 상속
* **도구**: 읽기 전용 도구 (Write 및 Edit 도구 접근 불가)
* **목적**: 계획을 위한 코드베이스 리서치

plan 모드에서 Claude가 코드베이스를 이해해야 할 때 Plan 서브에이전트에 리서치를 위임합니다. 이렇게 하면 서브에이전트가 다른 서브에이전트를 생성할 수 없는 무한 중첩을 방지하면서도 필요한 컨텍스트를 수집할 수 있습니다.

### General-purpose

탐색과 실행을 모두 필요로 하는 복잡한 멀티스텝 작업을 처리하는 유능한 에이전트입니다.

* **모델**: 메인 대화에서 상속
* **도구**: 모든 도구
* **목적**: 복잡한 리서치, 멀티스텝 작업, 코드 수정

Claude는 작업에 탐색과 수정이 모두 필요하거나, 결과를 해석하는 데 복잡한 추론이 필요하거나, 여러 종속 단계가 있을 때 general-purpose에 위임합니다.

### 기타 에이전트

Claude Code에는 특정 작업을 위한 추가 헬퍼 에이전트가 포함되어 있습니다. 이 에이전트들은 일반적으로 자동으로 호출되므로 직접 사용할 필요가 없습니다.

| 에이전트          | 모델   | Claude가 사용하는 시점                                     |
| :---------------- | :----- | :------------------------------------------------------- |
| statusline-setup  | Sonnet | 상태 표시줄 설정을 위해 `/statusline`을 실행할 때          |
| Claude Code Guide | Haiku  | Claude Code 기능에 대한 질문을 할 때                       |

이러한 기본 제공 서브에이전트 외에도 커스텀 프롬프트, 도구 제한, 권한 모드, 훅, 스킬을 포함하는 자체 서브에이전트를 만들 수 있습니다. 다음 섹션에서는 시작 방법과 서브에이전트 커스터마이즈 방법을 설명합니다.

## 빠른 시작: 첫 번째 서브에이전트 만들기

서브에이전트는 YAML frontmatter가 있는 Markdown 파일로 정의됩니다. [직접 만들거나](#서브에이전트-파일-작성) `/agents` 명령어를 사용할 수 있습니다.

이 안내는 `/agents` 명령어로 사용자 레벨 서브에이전트를 만드는 과정을 안내합니다. 이 서브에이전트는 코드베이스의 코드를 검토하고 개선 사항을 제안합니다.

**1단계: 서브에이전트 인터페이스 열기**

Claude Code에서 다음을 실행합니다:

```text
/agents
```

**2단계: 위치 선택**

**Library** 탭으로 전환하고, **Create new agent**를 선택한 다음 **Personal**을 선택합니다. 이렇게 하면 서브에이전트가 `~/.claude/agents/`에 저장되어 모든 프로젝트에서 사용할 수 있습니다.

**3단계: Claude로 생성**

**Generate with Claude**를 선택합니다. 메시지가 표시되면 서브에이전트를 설명합니다:

```text
A code improvement agent that scans files and suggests improvements
for readability, performance, and best practices. It should explain
each issue, show the current code, and provide an improved version.
```

Claude가 식별자, 설명, 시스템 프롬프트를 생성합니다.

**4단계: 도구 선택**

읽기 전용 검토자의 경우 **Read-only tools** 외에 모두 선택 해제합니다. 모든 도구를 선택한 상태로 유지하면 서브에이전트가 메인 대화에서 사용 가능한 모든 도구를 상속합니다.

**5단계: 모델 선택**

서브에이전트가 사용할 모델을 선택합니다. 이 예제 에이전트의 경우 코드 패턴 분석에 있어 역량과 속도의 균형을 맞추는 **Sonnet**을 선택합니다.

**6단계: 색상 선택**

서브에이전트의 배경 색상을 선택합니다. UI에서 어떤 서브에이전트가 실행 중인지 식별하는 데 도움이 됩니다.

**7단계: 메모리 설정**

`~/.claude/agent-memory/`에 [영구 메모리 디렉터리](#영구-메모리-활성화)를 제공하려면 **User scope**를 선택합니다. 서브에이전트는 이를 사용하여 코드베이스 패턴 및 반복 이슈 같은 인사이트를 대화 전반에 걸쳐 축적합니다. 학습 내용을 지속하지 않으려면 **None**을 선택합니다.

**8단계: 저장하고 테스트**

설정 요약을 검토합니다. `s` 또는 `Enter`를 눌러 저장하거나, `e`를 눌러 저장 후 에디터에서 파일을 편집합니다. 서브에이전트는 즉시 사용 가능합니다. 다음과 같이 테스트해보세요:

```text
Use the code-improver agent to suggest improvements in this project
```

Claude가 새 서브에이전트에 위임하고, 서브에이전트는 코드베이스를 스캔하여 개선 제안을 반환합니다.

이제 머신의 모든 프로젝트에서 코드베이스를 분석하고 개선 사항을 제안하는 데 사용할 수 있는 서브에이전트가 생겼습니다.

서브에이전트를 Markdown 파일로 직접 만들거나 CLI 플래그로 정의하거나 플러그인으로 배포할 수도 있습니다. 다음 섹션에서 모든 설정 옵션을 다룹니다.

## 서브에이전트 설정

### /agents 명령어 사용

`/agents` 명령어는 서브에이전트 관리를 위한 탭 인터페이스를 엽니다. **Running** 탭은 실행 중인 서브에이전트를 보여주고 열거나 중지할 수 있습니다. **Library** 탭에서는 다음을 할 수 있습니다:

* 사용 가능한 모든 서브에이전트 보기 (기본 제공, 사용자, 프로젝트, 플러그인)
* 안내 설정 또는 Claude 생성으로 새 서브에이전트 만들기
* 기존 서브에이전트 설정 및 도구 접근 편집
* 커스텀 서브에이전트 삭제
* 중복이 있을 때 어떤 서브에이전트가 활성화되는지 확인

이것이 서브에이전트를 만들고 관리하는 권장 방법입니다. 수동 생성이나 자동화의 경우 서브에이전트 파일을 직접 추가할 수도 있습니다.

인터랙티브 세션 없이 명령줄에서 설정된 모든 서브에이전트를 나열하려면 `claude agents`를 실행합니다. 이 명령어는 소스별로 그룹화된 에이전트를 보여주고 어떤 것이 높은 우선순위 정의에 의해 재정의되었는지 표시합니다.

### 서브에이전트 범위 선택

서브에이전트는 YAML frontmatter가 있는 Markdown 파일입니다. 범위에 따라 다른 위치에 저장하세요. 여러 서브에이전트가 같은 이름을 공유할 때 우선순위가 높은 위치가 이깁니다.

| 위치                         | 범위                    | 우선순위    | 생성 방법                                      |
| :--------------------------- | :---------------------- | :---------- | :--------------------------------------------- |
| 관리형 설정                  | 조직 전체               | 1 (최고)    | [관리형 설정](/settings)을 통해 배포           |
| `--agents` CLI 플래그        | 현재 세션               | 2           | Claude Code 실행 시 JSON 전달                  |
| `.claude/agents/`            | 현재 프로젝트           | 3           | 인터랙티브 또는 수동                           |
| `~/.claude/agents/`          | 모든 프로젝트           | 4           | 인터랙티브 또는 수동                           |
| 플러그인의 `agents/` 디렉터리| 플러그인 활성화된 곳    | 5 (최저)    | [플러그인](/plugins)으로 설치                  |

**프로젝트 서브에이전트** (`.claude/agents/`)는 코드베이스에 특화된 서브에이전트에 이상적입니다. 버전 컨트롤에 체크인하여 팀이 협업으로 사용하고 개선할 수 있습니다.

프로젝트 서브에이전트는 현재 작업 디렉터리에서 상위로 이동하며 탐색됩니다. `--add-dir`로 추가된 디렉터리는 [파일 접근 권한만 부여](/permissions#추가-디렉터리는-파일-접근-권한만-제공)하고 서브에이전트는 스캔하지 않습니다. 프로젝트 간에 서브에이전트를 공유하려면 `~/.claude/agents/` 또는 [플러그인](/plugins)을 사용하세요.

**사용자 서브에이전트** (`~/.claude/agents/`)는 모든 프로젝트에서 사용 가능한 개인 서브에이전트입니다.

**CLI 정의 서브에이전트**는 Claude Code 실행 시 JSON으로 전달됩니다. 해당 세션에만 존재하며 디스크에 저장되지 않아 빠른 테스트나 자동화 스크립트에 유용합니다. 단일 `--agents` 호출로 여러 서브에이전트를 정의할 수 있습니다:

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

`--agents` 플래그는 파일 기반 서브에이전트와 동일한 [frontmatter](#지원되는-frontmatter-필드) 필드를 가진 JSON을 허용합니다: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, `initialPrompt`, `memory`, `effort`, `background`, `isolation`, `color`. 파일 기반 서브에이전트의 마크다운 본문에 해당하는 시스템 프롬프트에는 `prompt`를 사용하세요.

**관리형 서브에이전트**는 조직 관리자가 배포합니다. [관리형 설정 디렉터리](/settings#설정-파일) 내 `.claude/agents/`에 프로젝트 및 사용자 서브에이전트와 동일한 frontmatter 형식으로 markdown 파일을 배치합니다. 관리형 정의는 같은 이름의 프로젝트 및 사용자 서브에이전트보다 우선합니다.

**플러그인 서브에이전트**는 설치한 [플러그인](/plugins)에서 제공됩니다. `/agents`에서 커스텀 서브에이전트와 함께 표시됩니다. 플러그인 서브에이전트 생성 방법은 [플러그인 컴포넌트 레퍼런스](/plugins-reference#agents)를 참조하세요.

::: info
보안상의 이유로 플러그인 서브에이전트는 `hooks`, `mcpServers`, `permissionMode` frontmatter 필드를 지원하지 않습니다. 이 필드들은 플러그인에서 에이전트를 로드할 때 무시됩니다. 필요하다면 에이전트 파일을 `.claude/agents/` 또는 `~/.claude/agents/`에 복사하세요. `settings.json` 또는 `settings.local.json`의 [`permissions.allow`](/settings#권한-설정)에 규칙을 추가할 수도 있지만 이 규칙은 플러그인 서브에이전트가 아닌 전체 세션에 적용됩니다.
:::

이러한 범위 중 어떤 것에서든 서브에이전트 정의는 [에이전트 팀](/agent-teams#서브에이전트-정의를-팀원으로-사용)에서도 사용 가능합니다: 팀원을 생성할 때 서브에이전트 타입을 참조할 수 있으며 팀원은 해당 `tools`와 `model`을 사용하고, 정의의 본문이 팀원의 시스템 프롬프트에 추가 지시사항으로 추가됩니다. 해당 경로에 적용되는 frontmatter 필드는 [에이전트 팀](/agent-teams#서브에이전트-정의를-팀원으로-사용)을 참조하세요.

### 서브에이전트 파일 작성

서브에이전트 파일은 설정을 위한 YAML frontmatter와 그 뒤에 Markdown으로 작성된 시스템 프롬프트를 사용합니다:

::: info
서브에이전트는 세션 시작 시 로드됩니다. 파일을 직접 추가하여 서브에이전트를 만든 경우, 즉시 로드하려면 세션을 재시작하거나 `/agents`를 사용하세요.
:::

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

frontmatter는 서브에이전트의 메타데이터와 설정을 정의합니다. 본문은 서브에이전트의 동작을 안내하는 시스템 프롬프트가 됩니다. 서브에이전트는 이 시스템 프롬프트(와 작업 디렉터리 같은 기본 환경 정보)만 받으며, 전체 Claude Code 시스템 프롬프트는 받지 않습니다.

서브에이전트는 메인 대화의 현재 작업 디렉터리에서 시작합니다. 서브에이전트 내에서 `cd` 명령어는 Bash 또는 PowerShell 도구 호출 간에 지속되지 않으며 메인 대화의 작업 디렉터리에 영향을 미치지 않습니다. 서브에이전트에 격리된 저장소 복사본을 제공하려면 [`isolation: worktree`](#지원되는-frontmatter-필드)를 설정하세요.

#### 지원되는 frontmatter 필드

다음 필드는 YAML frontmatter에 사용할 수 있습니다. `name`과 `description`만 필수입니다.

| 필드              | 필수 여부 | 설명                                                                                                                                                                                                                                                                         |
| :---------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | 예       | 소문자와 하이픈을 사용하는 고유 식별자                                                                                                                                                                                                                                        |
| `description`     | 예       | Claude가 이 서브에이전트에 위임해야 하는 시점                                                                                                                                                                                                                                |
| `tools`           | 아니오   | 서브에이전트가 사용할 수 있는 [도구](#사용-가능한-도구). 생략하면 모든 도구를 상속                                                                                                                                                                                            |
| `disallowedTools` | 아니오   | 거부할 도구, 상속되거나 지정된 목록에서 제거됨                                                                                                                                                                                                                               |
| `model`           | 아니오   | 사용할 [모델](#모델-선택): `sonnet`, `opus`, `haiku`, 전체 모델 ID (예: `claude-opus-4-6`), 또는 `inherit`. 기본값은 `inherit`                                                                                                                                               |
| `permissionMode`  | 아니오   | [권한 모드](#권한-모드): `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, 또는 `plan`                                                                                                                                                                       |
| `maxTurns`        | 아니오   | 서브에이전트가 중지하기 전 최대 에이전틱 턴 수                                                                                                                                                                                                                               |
| `skills`          | 아니오   | 시작 시 서브에이전트 컨텍스트에 로드할 [스킬](/skills). 전체 스킬 내용이 주입되며, 호출을 위해 제공되는 것이 아닙니다. 서브에이전트는 상위 대화에서 스킬을 상속하지 않습니다                                                                                                  |
| `mcpServers`      | 아니오   | 이 서브에이전트가 사용할 수 있는 [MCP 서버](/mcp). 각 항목은 이미 설정된 서버 이름(예: `"slack"`) 또는 서버 이름을 키로 하는 인라인 정의와 전체 [MCP 서버 설정](/mcp#mcp-서버-설치) 값                                                                                       |
| `hooks`           | 아니오   | 이 서브에이전트에 범위가 지정된 [라이프사이클 훅](#서브에이전트용-훅-정의)                                                                                                                                                                                                    |
| `memory`          | 아니오   | [영구 메모리 범위](#영구-메모리-활성화): `user`, `project`, 또는 `local`. 세션 간 학습 활성화                                                                                                                                                                                |
| `background`      | 아니오   | 이 서브에이전트를 항상 [백그라운드 작업](#서브에이전트를-포그라운드-또는-백그라운드로-실행)으로 실행하려면 `true`로 설정. 기본값: `false`                                                                                                                                     |
| `effort`          | 아니오   | 이 서브에이전트가 활성화될 때의 노력 수준. 세션 노력 수준을 재정의합니다. 기본값: 세션에서 상속. 옵션: `low`, `medium`, `high`, `max` (Opus 4.6 전용)                                                                                                                        |
| `isolation`       | 아니오   | 서브에이전트를 임시 [git worktree](/common-workflows#git-worktree로-병렬-claude-code-세션-실행)에서 실행하여 격리된 저장소 복사본을 제공하려면 `worktree`로 설정. 서브에이전트가 변경하지 않으면 worktree가 자동으로 정리됨                                                    |
| `color`           | 아니오   | 작업 목록 및 트랜스크립트에서 서브에이전트의 표시 색상. `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan` 허용                                                                                                                                            |
| `initialPrompt`   | 아니오   | 이 에이전트가 메인 세션 에이전트로 실행될 때(`--agent` 또는 `agent` 설정을 통해) 첫 번째 사용자 턴으로 자동 제출됨. [명령어](/commands)와 [스킬](/skills)이 처리됩니다. 사용자가 제공한 프롬프트 앞에 추가됨                                                                  |

### 모델 선택

`model` 필드는 서브에이전트가 사용하는 [AI 모델](/model-config)을 제어합니다:

* **모델 별칭**: `sonnet`, `opus`, `haiku` 중 하나 사용
* **전체 모델 ID**: `claude-opus-4-6` 또는 `claude-sonnet-4-6` 같은 전체 모델 ID 사용. `--model` 플래그와 동일한 값 허용
* **inherit**: 메인 대화와 동일한 모델 사용
* **생략**: 지정하지 않으면 기본값은 `inherit` (메인 대화와 동일한 모델 사용)

Claude가 서브에이전트를 호출할 때 특정 호출에 대한 `model` 파라미터를 전달할 수도 있습니다. Claude Code는 다음 순서로 서브에이전트의 모델을 결정합니다:

1. [`CLAUDE_CODE_SUBAGENT_MODEL`](/model-config#환경-변수) 환경 변수 (설정된 경우)
2. 호출별 `model` 파라미터
3. 서브에이전트 정의의 `model` frontmatter
4. 메인 대화의 모델

### 서브에이전트 기능 제어

도구 접근 권한, 권한 모드, 조건부 규칙을 통해 서브에이전트가 할 수 있는 일을 제어할 수 있습니다.

#### 사용 가능한 도구

서브에이전트는 Claude Code의 [내부 도구](/tools-reference) 중 어느 것이든 사용할 수 있습니다. 기본적으로 서브에이전트는 MCP 도구를 포함하여 메인 대화의 모든 도구를 상속합니다.

도구를 제한하려면 `tools` 필드(허용 목록) 또는 `disallowedTools` 필드(거부 목록)를 사용합니다. 이 예시는 `tools`를 사용하여 Read, Grep, Glob, Bash만 허용합니다. 서브에이전트는 파일을 편집하거나 작성하거나 MCP 도구를 사용할 수 없습니다:

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

이 예시는 `disallowedTools`를 사용하여 Write와 Edit를 제외한 메인 대화의 모든 도구를 상속합니다. 서브에이전트는 Bash, MCP 도구 등 나머지 모든 것을 유지합니다:

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

둘 다 설정된 경우 `disallowedTools`가 먼저 적용되고 `tools`가 남은 풀에 대해 결정됩니다. 둘 다에 나열된 도구는 제거됩니다.

#### 생성 가능한 서브에이전트 제한

에이전트가 `claude --agent`로 메인 스레드로 실행될 때 Agent 도구를 사용하여 서브에이전트를 생성할 수 있습니다. 생성할 수 있는 서브에이전트 타입을 제한하려면 `tools` 필드에 `Agent(agent_type)` 구문을 사용하세요.

::: info
버전 2.1.63에서 Task 도구가 Agent로 이름이 변경되었습니다. 설정 및 에이전트 정의의 기존 `Task(...)` 참조는 여전히 별칭으로 작동합니다.
:::

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

이것은 허용 목록입니다: `worker`와 `researcher` 서브에이전트만 생성할 수 있습니다. 에이전트가 다른 타입을 생성하려고 하면 요청이 실패하고 에이전트는 프롬프트에서 허용된 타입만 볼 수 있습니다. 특정 에이전트를 차단하면서 다른 모든 에이전트를 허용하려면 대신 [`permissions.deny`](#특정-서브에이전트-비활성화)를 사용하세요.

괄호 없이 `Agent`를 사용하면 제한 없이 모든 서브에이전트를 생성할 수 있습니다:

```yaml
tools: Agent, Read, Bash
```

`Agent`가 `tools` 목록에서 완전히 생략된 경우 에이전트는 서브에이전트를 생성할 수 없습니다. 이 제한은 `claude --agent`로 메인 스레드로 실행되는 에이전트에만 적용됩니다. 서브에이전트는 다른 서브에이전트를 생성할 수 없으므로 `Agent(agent_type)`는 서브에이전트 정의에서 효과가 없습니다.

#### 서브에이전트에 MCP 서버 범위 지정

`mcpServers` 필드를 사용하여 메인 대화에서 사용할 수 없는 [MCP](/mcp) 서버에 서브에이전트가 접근할 수 있도록 합니다. 여기에 인라인으로 정의된 서버는 서브에이전트가 시작할 때 연결되고 완료되면 연결이 끊어집니다. 문자열 참조는 상위 세션의 연결을 공유합니다.

목록의 각 항목은 인라인 서버 정의이거나 세션에 이미 설정된 MCP 서버를 참조하는 문자열입니다:

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # 인라인 정의: 이 서브에이전트에만 범위 지정
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # 이름으로 참조: 이미 설정된 서버 재사용
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

인라인 정의는 `.mcp.json` 서버 항목과 동일한 스키마 (`stdio`, `http`, `sse`, `ws`)를 사용하며 서버 이름을 키로 합니다.

MCP 서버를 메인 대화에서 완전히 제외하고 해당 도구 설명이 거기서 컨텍스트를 소비하지 않도록 하려면, `.mcp.json` 대신 여기서 인라인으로 정의하세요. 서브에이전트는 도구를 가지지만 상위 대화는 그렇지 않습니다.

#### 권한 모드

`permissionMode` 필드는 서브에이전트가 권한 프롬프트를 처리하는 방법을 제어합니다. 서브에이전트는 메인 대화에서 권한 컨텍스트를 상속하며 모드를 재정의할 수 있습니다. 단, 아래에 설명된 대로 상위 모드가 우선하는 경우는 제외입니다.

| 모드                | 동작                                                                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `default`           | 프롬프트를 통한 표준 권한 확인                                                                                                              |
| `acceptEdits`       | 작업 디렉터리 또는 `additionalDirectories`의 경로에 대한 파일 편집 및 일반적인 파일시스템 명령을 자동으로 수락                              |
| `auto`              | [자동 모드](/permission-modes#auto-모드로-프롬프트-제거): 백그라운드 분류기가 명령과 보호된 디렉터리 쓰기를 검토                            |
| `dontAsk`           | 권한 프롬프트 자동 거부 (명시적으로 허용된 도구는 여전히 작동)                                                                              |
| `bypassPermissions` | 권한 프롬프트 건너뜀                                                                                                                        |
| `plan`              | Plan 모드 (읽기 전용 탐색)                                                                                                                  |

::: warning
`bypassPermissions`는 주의하여 사용하세요. 권한 프롬프트를 건너뛰어 서브에이전트가 승인 없이 작업을 실행할 수 있습니다. `.git`, `.claude`, `.vscode`, `.idea`, `.husky` 디렉터리에 대한 쓰기는 `.claude/commands`, `.claude/agents`, `.claude/skills`를 제외하고 여전히 확인을 요청합니다. 자세한 내용은 [권한 모드](/permission-modes#bypasspermissions-모드로-모든-확인-건너뜀)를 참조하세요.
:::

상위가 `bypassPermissions`를 사용하면 이것이 우선하며 재정의할 수 없습니다. 상위가 [자동 모드](/permission-modes#auto-모드로-프롬프트-제거)를 사용하면 서브에이전트가 자동 모드를 상속하고 frontmatter의 `permissionMode`는 무시됩니다: 분류기는 상위 세션과 동일한 차단 및 허용 규칙으로 서브에이전트의 도구 호출을 평가합니다.

#### 서브에이전트에 스킬 미리 로드

`skills` 필드를 사용하여 시작 시 서브에이전트 컨텍스트에 스킬 내용을 주입합니다. 이렇게 하면 서브에이전트가 실행 중에 스킬을 발견하고 로드할 필요 없이 도메인 지식을 갖출 수 있습니다.

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

각 스킬의 전체 내용이 서브에이전트의 컨텍스트에 주입되며, 호출을 위해 제공되는 것이 아닙니다. 서브에이전트는 상위 대화에서 스킬을 상속하지 않으므로 명시적으로 나열해야 합니다.

::: info
이것은 [서브에이전트에서 스킬 실행](/skills#서브에이전트에서-스킬-실행)의 역입니다. 서브에이전트의 `skills`를 사용하면 서브에이전트가 시스템 프롬프트를 제어하고 스킬 내용을 로드합니다. 스킬의 `context: fork`를 사용하면 스킬 내용이 지정한 에이전트에 주입됩니다. 둘 다 동일한 기본 시스템을 사용합니다.
:::

#### 영구 메모리 활성화

`memory` 필드는 서브에이전트에 대화 간에 살아남는 영구 디렉터리를 제공합니다. 서브에이전트는 이 디렉터리를 사용하여 코드베이스 패턴, 디버깅 인사이트, 아키텍처 결정 같은 지식을 시간이 지남에 따라 축적합니다.

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

메모리가 얼마나 광범위하게 적용되어야 하는지에 따라 범위를 선택하세요:

| 범위      | 위치                                          | 사용 시점                                                                                    |
| :-------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `user`    | `~/.claude/agent-memory/<name-of-agent>/`     | 서브에이전트가 모든 프로젝트에 걸쳐 학습 내용을 기억해야 할 때                              |
| `project` | `.claude/agent-memory/<name-of-agent>/`       | 서브에이전트의 지식이 프로젝트 특화적이고 버전 컨트롤로 공유 가능할 때                      |
| `local`   | `.claude/agent-memory-local/<name-of-agent>/` | 서브에이전트의 지식이 프로젝트 특화적이지만 버전 컨트롤에 체크인해서는 안 될 때             |

메모리가 활성화된 경우:

* 서브에이전트의 시스템 프롬프트에 메모리 디렉터리를 읽고 쓰는 지시사항이 포함됩니다.
* 서브에이전트의 시스템 프롬프트에는 메모리 디렉터리의 `MEMORY.md` 첫 200줄 또는 25KB(먼저 도달하는 것) 내용과 해당 한도를 초과하면 `MEMORY.md`를 정리하라는 지시사항이 포함됩니다.
* Read, Write, Edit 도구가 자동으로 활성화되어 서브에이전트가 메모리 파일을 관리할 수 있습니다.

##### 영구 메모리 팁

* `project`는 권장 기본 범위입니다. 버전 컨트롤을 통해 서브에이전트 지식을 공유할 수 있습니다. 서브에이전트의 지식이 프로젝트 전반에 광범위하게 적용될 때는 `user`를, 지식이 버전 컨트롤에 체크인해서는 안 될 때는 `local`을 사용하세요.
* 작업 시작 전에 메모리를 참조하도록 요청하세요: "이 PR을 검토하고, 이전에 발견한 패턴에 대해 메모리를 확인하세요."
* 작업 완료 후 메모리를 업데이트하도록 요청하세요: "완료했으면 배운 것을 메모리에 저장하세요." 시간이 지남에 따라 서브에이전트를 더 효과적으로 만드는 지식 기반이 구축됩니다.
* 서브에이전트가 자체 지식 기반을 능동적으로 유지하도록 서브에이전트의 markdown 파일에 직접 메모리 지시사항을 포함하세요:

  ```markdown
  Update your agent memory as you discover codepaths, patterns, library
  locations, and key architectural decisions. This builds up institutional
  knowledge across conversations. Write concise notes about what you found
  and where.
  ```

#### 훅을 이용한 조건부 규칙

도구 사용에 대한 더 동적인 제어를 위해 `PreToolUse` 훅을 사용하여 실행 전에 작업을 검증하세요. 이것은 도구의 일부 작업을 허용하면서 다른 작업을 차단해야 할 때 유용합니다.

이 예시는 읽기 전용 데이터베이스 쿼리만 허용하는 서브에이전트를 만듭니다. `PreToolUse` 훅은 각 Bash 명령이 실행되기 전에 `command`에 지정된 스크립트를 실행합니다:

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

Claude Code는 [훅 입력을 JSON으로](/hooks#pretooluse-입력) 훅 명령의 stdin에 전달합니다. 검증 스크립트는 이 JSON을 읽고 Bash 명령을 추출하여 쓰기 작업을 차단하기 위해 [exit code 2로](/hooks#exit-code-2-동작) 종료합니다:

```bash
#!/bin/bash
# ./scripts/validate-readonly-query.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# SQL 쓰기 작업 차단 (대소문자 구분 없음)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi

exit 0
```

완전한 입력 스키마는 [훅 입력](/hooks#pretooluse-입력)을, exit code가 동작에 미치는 영향은 [exit code](/hooks#exit-code-출력)를 참조하세요.

#### 특정 서브에이전트 비활성화

[설정](/settings#권한-설정)의 `deny` 배열에 특정 서브에이전트를 추가하여 Claude가 사용하지 못하도록 할 수 있습니다. 서브에이전트의 name 필드와 일치하는 `Agent(subagent-name)` 형식을 사용하세요.

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

이것은 기본 제공 및 커스텀 서브에이전트 모두에 작동합니다. `--disallowedTools` CLI 플래그도 사용할 수 있습니다:

```bash
claude --disallowedTools "Agent(Explore)"
```

권한 규칙에 대한 자세한 내용은 [권한 문서](/permissions#도구별-권한-규칙)를 참조하세요.

### 서브에이전트용 훅 정의

서브에이전트는 서브에이전트의 라이프사이클 중에 실행되는 [훅](/hooks)을 정의할 수 있습니다. 훅을 설정하는 두 가지 방법이 있습니다:

1. **서브에이전트의 frontmatter에서**: 해당 서브에이전트가 활성화된 동안에만 실행되는 훅 정의
2. **`settings.json`에서**: 서브에이전트가 시작하거나 중지할 때 메인 세션에서 실행되는 훅 정의

#### 서브에이전트 frontmatter의 훅

서브에이전트의 markdown 파일에 직접 훅을 정의합니다. 이 훅은 해당 특정 서브에이전트가 활성화된 동안에만 실행되며 완료되면 정리됩니다.

::: info
Frontmatter 훅은 에이전트가 Agent 도구 또는 @-멘션을 통해 서브에이전트로 생성될 때 실행됩니다. [`--agent`](#서브에이전트-명시적-호출) 또는 `agent` 설정을 통해 메인 세션으로 실행될 때는 실행되지 않습니다. 세션 전체 훅은 [`settings.json`](/hooks)에서 설정하세요.
:::

모든 [훅 이벤트](/hooks#훅-이벤트)가 지원됩니다. 서브에이전트에 가장 일반적인 이벤트는:

| 이벤트        | 매처 입력     | 실행 시점                                                              |
| :------------ | :------------ | :--------------------------------------------------------------------- |
| `PreToolUse`  | 도구 이름     | 서브에이전트가 도구를 사용하기 전                                       |
| `PostToolUse` | 도구 이름     | 서브에이전트가 도구를 사용한 후                                         |
| `Stop`        | (없음)        | 서브에이전트가 완료될 때 (런타임에 `SubagentStop`으로 변환됨)          |

이 예시는 `PreToolUse` 훅으로 Bash 명령을 검증하고 `PostToolUse`로 파일 편집 후 린터를 실행합니다:

```yaml
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

frontmatter의 `Stop` 훅은 자동으로 `SubagentStop` 이벤트로 변환됩니다.

#### 서브에이전트 이벤트를 위한 프로젝트 레벨 훅

메인 세션에서 서브에이전트 라이프사이클 이벤트에 응답하는 훅을 `settings.json`에 설정합니다.

| 이벤트          | 매처 입력       | 실행 시점                          |
| :-------------- | :-------------- | :--------------------------------- |
| `SubagentStart` | 에이전트 타입명 | 서브에이전트가 실행을 시작할 때    |
| `SubagentStop`  | 에이전트 타입명 | 서브에이전트가 완료될 때           |

두 이벤트 모두 이름으로 특정 에이전트 타입을 대상으로 하는 매처를 지원합니다. 이 예시는 `db-agent` 서브에이전트가 시작할 때만 설정 스크립트를 실행하고, 모든 서브에이전트가 중지할 때 정리 스크립트를 실행합니다:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

완전한 훅 설정 형식은 [훅](/hooks)을 참조하세요.

## 서브에이전트 활용

### 자동 위임 이해

Claude는 요청의 작업 설명, 서브에이전트 설정의 `description` 필드, 현재 컨텍스트를 기반으로 자동으로 작업을 위임합니다. 능동적인 위임을 장려하려면 서브에이전트의 description 필드에 "use proactively" 같은 문구를 포함하세요.

### 서브에이전트 명시적 호출

자동 위임이 충분하지 않을 때 직접 서브에이전트를 요청할 수 있습니다. 세 가지 패턴은 일회성 제안부터 세션 전체 기본값까지 단계적으로 확장됩니다:

* **자연어**: 프롬프트에서 서브에이전트 이름을 언급하면 Claude가 위임 여부를 결정합니다
* **@-멘션**: 하나의 작업에 대해 서브에이전트가 실행되도록 보장합니다
* **세션 전체**: `--agent` 플래그 또는 `agent` 설정을 통해 전체 세션이 해당 서브에이전트의 시스템 프롬프트, 도구 제한, 모델을 사용합니다

자연어의 경우 특별한 구문이 없습니다. 서브에이전트 이름을 언급하면 Claude가 일반적으로 위임합니다:

```text
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

**서브에이전트를 @-멘션합니다.** `@`를 입력하고 타입어헤드에서 서브에이전트를 선택합니다. 파일을 @-멘션하는 것과 동일한 방식입니다. 이렇게 하면 Claude의 선택에 맡기는 것이 아니라 해당 특정 서브에이전트가 실행되도록 보장합니다:

```text
@"code-reviewer (agent)" look at the auth changes
```

전체 메시지는 Claude에게 전달되고, Claude는 요청한 내용을 기반으로 서브에이전트의 작업 프롬프트를 작성합니다. @-멘션은 Claude가 호출하는 서브에이전트를 제어하며 받는 프롬프트를 제어하지 않습니다.

활성화된 [플러그인](/plugins)에서 제공하는 서브에이전트는 타입어헤드에 `<plugin-name>:<agent-name>`으로 표시됩니다. 세션에서 현재 실행 중인 이름이 지정된 백그라운드 서브에이전트도 이름 옆에 상태를 표시하며 타입어헤드에 나타납니다. 피커를 사용하지 않고 직접 입력할 수도 있습니다: 로컬 서브에이전트는 `@agent-<name>`, 플러그인 서브에이전트는 `@agent-<plugin-name>:<agent-name>`.

**전체 세션을 서브에이전트로 실행합니다.** [`--agent <name>`](/cli-reference)를 전달하여 메인 스레드 자체가 해당 서브에이전트의 시스템 프롬프트, 도구 제한, 모델을 사용하는 세션을 시작합니다:

```bash
claude --agent code-reviewer
```

서브에이전트의 시스템 프롬프트는 [`--system-prompt`](/cli-reference)와 동일한 방식으로 기본 Claude Code 시스템 프롬프트를 완전히 대체합니다. `CLAUDE.md` 파일과 프로젝트 메모리는 여전히 일반 메시지 흐름을 통해 로드됩니다. 에이전트 이름은 시작 헤더에 `@<name>`으로 표시되어 활성 상태를 확인할 수 있습니다.

이것은 기본 제공 및 커스텀 서브에이전트 모두에 작동하며 세션을 재개할 때 선택이 유지됩니다.

플러그인에서 제공하는 서브에이전트의 경우 범위가 지정된 이름을 전달합니다: `claude --agent <plugin-name>:<agent-name>`.

프로젝트의 모든 세션에서 기본값으로 만들려면 `.claude/settings.json`에 `agent`를 설정합니다:

```json
{
  "agent": "code-reviewer"
}
```

CLI 플래그가 설정보다 우선합니다.

### 서브에이전트를 포그라운드 또는 백그라운드로 실행

서브에이전트는 포그라운드(블로킹) 또는 백그라운드(동시)로 실행될 수 있습니다:

* **포그라운드 서브에이전트**는 완료될 때까지 메인 대화를 블록합니다. 권한 프롬프트와 명확화 질문([`AskUserQuestion`](/tools-reference) 포함)이 전달됩니다.
* **백그라운드 서브에이전트**는 계속 작업하는 동안 동시에 실행됩니다. 실행 전에 Claude Code는 서브에이전트에 필요한 도구 권한을 프롬프트하여 필요한 승인을 미리 확보합니다. 실행 중에 서브에이전트는 이러한 권한을 상속하고 사전 승인되지 않은 것은 자동으로 거부합니다. 백그라운드 서브에이전트가 명확화 질문을 해야 하는 경우 해당 도구 호출은 실패하지만 서브에이전트는 계속됩니다.

백그라운드 서브에이전트가 권한 부족으로 실패하면 대화형 프롬프트로 재시도하기 위해 동일한 작업으로 새 포그라운드 서브에이전트를 시작할 수 있습니다.

Claude는 작업을 기반으로 서브에이전트를 포그라운드 또는 백그라운드로 실행할지 결정합니다. 다음과 같이 할 수도 있습니다:

* Claude에게 "run this in the background"라고 요청
* **Ctrl+B**를 눌러 실행 중인 작업을 백그라운드로 전환

모든 백그라운드 작업 기능을 비활성화하려면 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` 환경 변수를 `1`로 설정합니다. [환경 변수](/env-vars)를 참조하세요.

### 일반적인 패턴

#### 대용량 작업 격리

서브에이전트의 가장 효과적인 용도 중 하나는 대량의 출력을 생성하는 작업을 격리하는 것입니다. 테스트 실행, 문서 가져오기, 로그 파일 처리는 상당한 컨텍스트를 소비할 수 있습니다. 이를 서브에이전트에 위임하면 자세한 출력이 서브에이전트의 컨텍스트에 유지되고 관련 요약만 메인 대화로 반환됩니다.

```text
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### 병렬 리서치 실행

독립적인 조사의 경우 여러 서브에이전트를 동시에 작동하도록 생성합니다:

```text
Research the authentication, database, and API modules in parallel using separate subagents
```

각 서브에이전트는 자신의 영역을 독립적으로 탐색하고, Claude가 결과를 종합합니다. 리서치 경로가 서로 의존하지 않을 때 가장 효과적입니다.

::: warning
서브에이전트가 완료되면 결과가 메인 대화로 반환됩니다. 각각 상세한 결과를 반환하는 많은 서브에이전트를 실행하면 상당한 컨텍스트를 소비할 수 있습니다.
:::

지속적인 병렬 처리가 필요하거나 컨텍스트 창을 초과하는 작업의 경우 [에이전트 팀](/agent-teams)이 각 워커에게 독립적인 컨텍스트를 제공합니다.

#### 서브에이전트 체인

멀티스텝 워크플로우의 경우 Claude에게 서브에이전트를 순서대로 사용하도록 요청합니다. 각 서브에이전트는 작업을 완료하고 결과를 Claude에게 반환하며, Claude는 다음 서브에이전트에 관련 컨텍스트를 전달합니다.

```text
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### 서브에이전트와 메인 대화 중 선택

다음 경우에 **메인 대화**를 사용하세요:

* 작업에 잦은 주고받기나 반복적인 정교화가 필요할 때
* 여러 단계가 상당한 컨텍스트를 공유할 때 (계획 → 구현 → 테스트)
* 빠르고 목표가 명확한 변경을 할 때
* 지연 시간이 중요할 때. 서브에이전트는 새로 시작하여 컨텍스트를 수집하는 데 시간이 걸릴 수 있습니다

다음 경우에 **서브에이전트**를 사용하세요:

* 작업이 메인 컨텍스트에 필요하지 않은 자세한 출력을 생성할 때
* 특정 도구 제한이나 권한을 적용하고 싶을 때
* 작업이 독립적이고 요약을 반환할 수 있을 때

격리된 서브에이전트 컨텍스트가 아닌 메인 대화 컨텍스트에서 실행되는 재사용 가능한 프롬프트나 워크플로우를 원할 때는 대신 [스킬](/skills)을 고려하세요.

대화에 이미 있는 것에 대한 빠른 질문의 경우 서브에이전트 대신 [`/btw`](/interactive-mode#btw로-사이드-질문)를 사용하세요. 전체 컨텍스트를 볼 수 있지만 도구 접근이 없으며, 답변은 기록에 추가되지 않고 버려집니다.

::: info
서브에이전트는 다른 서브에이전트를 생성할 수 없습니다. 중첩 위임이 필요한 워크플로우의 경우 [스킬](/skills)을 사용하거나 메인 대화에서 [서브에이전트를 체인](#서브에이전트-체인)으로 연결하세요.
:::

### 서브에이전트 컨텍스트 관리

#### 서브에이전트 재개

각 서브에이전트 호출은 새로운 컨텍스트로 새 인스턴스를 만듭니다. 처음부터 시작하는 것이 아니라 기존 서브에이전트의 작업을 계속하려면 Claude에게 재개를 요청하세요.

재개된 서브에이전트는 모든 이전 도구 호출, 결과, 추론을 포함한 전체 대화 기록을 유지합니다. 서브에이전트는 처음부터 시작하는 것이 아니라 중단된 곳에서 정확히 계속됩니다.

서브에이전트가 완료되면 Claude는 에이전트 ID를 받습니다. Claude는 `SendMessage` 도구를 에이전트의 ID를 `to` 필드로 사용하여 재개합니다. `SendMessage` 도구는 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`을 통해 [에이전트 팀](/agent-teams)이 활성화된 경우에만 사용 가능합니다.

서브에이전트를 재개하려면 Claude에게 이전 작업을 계속하도록 요청합니다:

```text
Use the code-reviewer subagent to review the authentication module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

중지된 서브에이전트가 `SendMessage`를 받으면 새 `Agent` 호출 없이 백그라운드에서 자동으로 재개됩니다.

에이전트 ID를 명시적으로 참조하려면 Claude에게 요청하거나 `~/.claude/projects/{project}/{sessionId}/subagents/`의 트랜스크립트 파일에서 찾을 수 있습니다. 각 트랜스크립트는 `agent-{agentId}.jsonl`로 저장됩니다.

서브에이전트 트랜스크립트는 메인 대화와 독립적으로 유지됩니다:

* **메인 대화 압축**: 메인 대화가 압축되어도 서브에이전트 트랜스크립트는 영향을 받지 않습니다. 별도의 파일에 저장됩니다.
* **세션 지속성**: 서브에이전트 트랜스크립트는 세션 내에서 유지됩니다. 동일한 세션을 재개하여 Claude Code 재시작 후에 [서브에이전트를 재개](#서브에이전트-재개)할 수 있습니다.
* **자동 정리**: 트랜스크립트는 `cleanupPeriodDays` 설정(기본값: 30일)에 따라 정리됩니다.

#### 자동 압축

서브에이전트는 메인 대화와 동일한 로직을 사용하여 자동 압축을 지원합니다. 기본적으로 자동 압축은 약 95% 용량에서 트리거됩니다. 더 일찍 압축을 트리거하려면 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`를 더 낮은 백분율(예: `50`)로 설정합니다. 자세한 내용은 [환경 변수](/env-vars)를 참조하세요.

압축 이벤트는 서브에이전트 트랜스크립트 파일에 기록됩니다:

```json
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

`preTokens` 값은 압축이 발생하기 전에 사용된 토큰 수를 보여줍니다.

## 예제 서브에이전트

이 예시들은 서브에이전트 구축을 위한 효과적인 패턴을 보여줍니다. 시작점으로 사용하거나 Claude로 커스터마이즈된 버전을 생성하세요.

::: tip
**모범 사례:**

* **집중된 서브에이전트 설계**: 각 서브에이전트가 하나의 특정 작업에서 뛰어나야 합니다
* **상세한 설명 작성**: Claude는 설명을 사용하여 언제 위임할지 결정합니다
* **도구 접근 제한**: 보안과 집중을 위해 필요한 권한만 부여합니다
* **버전 컨트롤에 체크인**: 팀과 프로젝트 서브에이전트를 공유합니다
:::

### 코드 검토자

수정 없이 코드를 검토하는 읽기 전용 서브에이전트입니다. 이 예시는 제한된 도구 접근(Edit 또는 Write 없음)과 무엇을 찾고 출력 형식을 정확히 지정하는 상세한 프롬프트로 집중된 서브에이전트를 설계하는 방법을 보여줍니다.

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### 디버거

이슈를 분석하고 수정할 수 있는 서브에이전트입니다. 코드 검토자와 달리 버그 수정에 코드 수정이 필요하므로 Edit이 포함됩니다. 프롬프트는 진단에서 검증까지 명확한 워크플로우를 제공합니다.

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### 데이터 과학자

데이터 분석 작업을 위한 도메인 특화 서브에이전트입니다. 이 예시는 일반적인 코딩 작업 외의 특화된 워크플로우를 위한 서브에이전트를 만드는 방법을 보여줍니다. 더 유능한 분석을 위해 명시적으로 `model: sonnet`을 설정합니다.

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

### 데이터베이스 쿼리 검증자

Bash 접근을 허용하지만 읽기 전용 SQL 쿼리만 허용하도록 명령을 검증하는 서브에이전트입니다. 이 예시는 `tools` 필드가 제공하는 것보다 더 세밀한 제어가 필요할 때 조건부 검증을 위해 `PreToolUse` 훅을 사용하는 방법을 보여줍니다.

```markdown
---
name: db-reader
description: Execute read-only database queries. Use when analyzing data or generating reports.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries to answer questions about the data.

When asked to analyze data:
1. Identify which tables contain the relevant data
2. Write efficient SELECT queries with appropriate filters
3. Present results clearly with context

You cannot modify data. If asked to INSERT, UPDATE, DELETE, or modify schema, explain that you only have read access.
```

Claude Code는 [훅 입력을 JSON으로](/hooks#pretooluse-입력) 훅 명령의 stdin에 전달합니다. 검증 스크립트는 이 JSON을 읽고, 실행 중인 명령을 추출하여 SQL 쓰기 작업 목록과 비교합니다. 쓰기 작업이 감지되면 스크립트는 실행을 차단하기 위해 [exit code 2로](/hooks#exit-code-2-동작) 종료하고 stderr를 통해 Claude에게 오류 메시지를 반환합니다.

프로젝트 어디에나 검증 스크립트를 만드세요. 경로는 훅 설정의 `command` 필드와 일치해야 합니다:

```bash
#!/bin/bash
# Blocks SQL write operations, allows SELECT queries

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command field from tool_input using jq
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed. Use SELECT queries only." >&2
  exit 2
fi

exit 0
```

스크립트를 실행 가능하도록 설정합니다:

```bash
chmod +x ./scripts/validate-readonly-query.sh
```

훅은 `tool_input.command`에 Bash 명령이 있는 JSON을 stdin으로 받습니다. Exit code 2는 작업을 차단하고 오류 메시지를 Claude에게 피드백합니다. exit code에 대한 자세한 내용은 [훅](/hooks#exit-code-출력)을, 완전한 입력 스키마는 [훅 입력](/hooks#pretooluse-입력)을 참조하세요.

## 다음 단계

서브에이전트를 이해했으면 이러한 관련 기능을 살펴보세요:

* [플러그인으로 서브에이전트 배포](/plugins)하여 팀 또는 프로젝트 전반에 서브에이전트 공유
* CI/CD 및 자동화를 위해 Agent SDK로 [Claude Code 프로그래밍 방식으로 실행](/headless)
* [MCP 서버 사용](/mcp)으로 서브에이전트에 외부 도구 및 데이터 접근 권한 부여
