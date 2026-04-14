---
title: .claude 디렉토리 탐색
description: Claude Code가 CLAUDE.md, settings.json, hooks, skills, commands, subagents, rules, 자동 메모리를 읽는 위치를 알아봅니다. 프로젝트의 .claude 디렉토리와 홈 디렉토리의 ~/.claude를 탐색합니다.
---

# .claude 디렉토리 탐색

> Claude Code가 CLAUDE.md, settings.json, hooks, skills, commands, subagents, rules, 자동 메모리를 읽는 위치를 알아봅니다. 프로젝트의 .claude 디렉토리와 홈 디렉토리의 ~/.claude를 탐색합니다.

Claude Code는 프로젝트 디렉토리와 홈 디렉토리의 `~/.claude`에서 지침, 설정, skills, subagents, 메모리를 읽습니다. 프로젝트 파일을 git에 커밋하여 팀과 공유하고, `~/.claude`의 파일은 모든 프로젝트에 적용되는 개인 설정입니다.

[`CLAUDE_CONFIG_DIR`](/env-vars)를 설정하면 이 페이지의 모든 `~/.claude` 경로가 해당 디렉토리 아래에 위치합니다.

대부분의 사용자는 `CLAUDE.md`와 `settings.json`만 편집합니다. 나머지 디렉토리는 선택 사항이며 필요에 따라 skills, rules, subagents를 추가합니다.

## 프로젝트 디렉토리 구조

다음은 프로젝트에서 Claude Code가 읽는 파일과 디렉토리의 개요입니다.

### `CLAUDE.md`

- **범위:** 프로젝트
- **상태:** committed
- **한줄 요약:** 모든 세션에서 Claude가 읽는 프로젝트 지침
- **로드 시점:** 모든 세션 시작 시 컨텍스트에 로드됨

프로젝트별 지침으로 이 저장소에서 Claude가 작동하는 방식을 결정합니다. 팀이 사용하는 것과 같은 전제를 가지고 Claude가 작동하도록 규약, 일반적인 명령어, 아키텍처 컨텍스트를 여기에 넣으세요.

::: tip 팁
- 200줄 이하를 목표로 하세요. 더 긴 파일도 전체 로드되지만 준수도가 떨어질 수 있습니다
- CLAUDE.md는 모든 세션에 로드됩니다. 특정 작업에만 해당하는 내용은 [skill](/skills)이나 경로 범위의 [rule](/memory#organize-rules-with-claude/rules/)로 옮겨 필요할 때만 로드되게 하세요
- 빌드, 테스트, 포맷 등 자주 사용하는 명령어를 나열하면 Claude가 매번 설명 없이 알 수 있습니다
- `/memory`를 실행하여 세션 내에서 CLAUDE.md를 열고 편집할 수 있습니다
- 프로젝트 루트를 깔끔하게 유지하려면 `.claude/CLAUDE.md`에 둘 수도 있습니다
:::

예시 (TypeScript + React 프로젝트):

```markdown
# Project conventions

## Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Stack
- TypeScript with strict mode
- React 19, functional components only

## Rules
- Named exports, never default exports
- Tests live next to source: `foo.ts` -> `foo.test.ts`
- All API routes return `{ data, error }` shape
```

[전체 문서 보기 →](/memory)

---

### `.mcp.json`

- **범위:** 프로젝트 (루트에 위치)
- **상태:** committed
- **한줄 요약:** 팀과 공유하는 프로젝트 범위 MCP 서버
- **로드 시점:** 세션 시작 시 서버가 연결됨. 도구 스키마는 기본적으로 지연 로드되며 [tool search](/mcp#scale-with-mcp-tool-search)를 통해 요청 시 로드됨

Model Context Protocol (MCP) 서버를 구성하여 Claude가 외부 도구(데이터베이스, API, 브라우저 등)에 접근할 수 있게 합니다. 이 파일은 팀 전체가 사용하는 프로젝트 범위 서버를 보유합니다. 개인 서버는 `~/.claude.json`에 둡니다.

::: tip 팁
- 시크릿에는 환경 변수 참조를 사용하세요: `${GITHUB_TOKEN}`
- 프로젝트 루트에 위치하며, `.claude/` 내부가 아닙니다
- 본인만 필요한 서버는 `claude mcp add --scope user`를 실행하세요. `~/.claude.json`에 기록됩니다
:::

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

[전체 문서 보기 →](/mcp)

---

### `.worktreeinclude`

- **범위:** 프로젝트 (루트에 위치)
- **상태:** committed
- **한줄 요약:** 새 worktree에 복사할 gitignored 파일
- **로드 시점:** Claude가 `--worktree`, `EnterWorktree` 도구, 또는 subagent `isolation: worktree`를 통해 git worktree를 생성할 때 읽힘

gitignored 파일을 메인 저장소에서 각 새 worktree로 복사할 파일 목록입니다. Worktree는 새로운 체크아웃이므로 `.env`같은 추적되지 않는 파일이 기본적으로 없습니다. 여기의 패턴은 `.gitignore` 구문을 사용합니다. 패턴에 매칭되면서 동시에 gitignored인 파일만 복사되므로 추적된 파일은 절대 중복되지 않습니다.

::: tip 팁
- 프로젝트 루트에 위치하며, `.claude/` 내부가 아닙니다
- Git 전용: 다른 VCS용 [WorktreeCreate hook](/hooks#worktreecreate)을 구성하면 이 파일은 읽히지 않습니다. 대신 hook 스크립트에서 파일을 복사하세요
- [데스크톱 앱](/desktop#work-in-parallel-with-sessions)의 병렬 세션에도 적용됩니다
:::

```text
# Local environment
.env
.env.local

# API credentials
config/secrets.json
```

[전체 문서 보기 →](/common-workflows#copy-gitignored-files-to-worktrees)

---

### `.claude/` 디렉토리

프로젝트 수준의 설정, 규칙, 확장 기능을 모두 포함합니다. git을 사용한다면 대부분의 파일을 커밋하여 팀과 공유하세요. `settings.local.json`과 같은 일부 파일은 자동으로 gitignore됩니다.

#### `settings.json`

- **상태:** committed
- **한줄 요약:** 권한, hooks, 설정
- **로드 시점:** 전역 `~/.claude/settings.json`을 오버라이드. 로컬 설정, CLI 플래그, managed settings가 이를 오버라이드

Claude Code가 직접 적용하는 설정입니다. 권한은 Claude가 사용할 수 있는 명령어와 도구를 제어합니다. hooks는 세션의 특정 시점에서 스크립트를 실행합니다. Claude가 가이드로 읽는 CLAUDE.md와 달리, 이 설정은 Claude의 따름 여부와 관계없이 강제됩니다.

**주요 키:**
- [permissions](/permissions): Claude가 특정 도구나 명령어를 사용하기 전에 허용, 거부, 또는 확인
- [hooks](/hooks): 도구 호출 전이나 파일 편집 후 같은 이벤트에서 스크립트 실행
- [statusLine](/statusline): Claude 작업 중 하단에 표시되는 줄 커스터마이즈
- [model](/settings#available-settings): 이 프로젝트의 기본 모델 선택
- [env](/settings#environment-variables): 모든 세션에 설정되는 환경 변수
- [outputStyle](/output-styles): output-styles/에서 커스텀 시스템 프롬프트 스타일 선택

::: tip 팁
- Bash 권한 패턴은 와일드카드를 지원합니다: `Bash(npm test *)`는 `npm test`로 시작하는 모든 명령어와 매칭됩니다
- `permissions.allow` 같은 배열 설정은 모든 범위에서 결합되고, `model` 같은 스칼라 설정은 가장 구체적인 값을 사용합니다
:::

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run *)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

[전체 문서 보기 →](/settings)

#### `settings.local.json`

- **상태:** gitignored
- **한줄 요약:** 이 프로젝트의 개인 설정 오버라이드
- **로드 시점:** 사용자 편집 가능한 설정 파일 중 가장 높은 우선순위. CLI 플래그와 managed settings만 이를 오버라이드

프로젝트 기본값보다 우선하는 개인 설정입니다. settings.json과 동일한 JSON 형식이지만 커밋되지 않습니다. 팀 설정과 다른 권한이나 기본값이 필요할 때 사용하세요.

::: tip 팁
- settings.json과 동일한 스키마입니다. `permissions.allow` 같은 배열 설정은 범위 간 결합되고, `model` 같은 스칼라 설정은 로컬 값을 사용합니다
- Claude Code는 처음 이 파일을 작성할 때 `~/.config/git/ignore`에 추가합니다. 커스텀 `core.excludesFile`을 사용하는 경우 해당 파일에도 패턴을 추가하세요. 팀과 무시 규칙을 공유하려면 프로젝트의 `.gitignore`에도 추가하세요
:::

```json
{
  "permissions": {
    "allow": [
      "Bash(docker *)"
    ]
  }
}
```

[전체 문서 보기 →](/settings)

#### `rules/`

- **한줄 요약:** 주제별 지침, 선택적으로 파일 경로로 게이트
- **로드 시점:** `paths:`가 없는 규칙은 세션 시작 시 로드. `paths:`가 있는 규칙은 매칭 파일이 컨텍스트에 들어올 때 로드

프로젝트 지침을 주제별 파일로 나누어 파일 경로에 따라 조건부로 로드할 수 있습니다. `paths:` 프론트매터가 없는 규칙은 CLAUDE.md처럼 세션 시작 시 로드됩니다. `paths:`가 있는 규칙은 Claude가 매칭 파일을 읽을 때만 로드됩니다.

CLAUDE.md와 마찬가지로 규칙은 Claude가 읽는 가이드이며, Claude Code가 강제하는 설정이 아닙니다. 보장된 동작이 필요하면 [hooks](/hooks)이나 [permissions](/permissions)를 사용하세요.

::: tip 팁
- `paths:` 프론트매터에 glob을 사용하여 디렉토리나 파일 유형에 규칙 범위를 지정하세요
- 하위 디렉토리도 동작합니다: `.claude/rules/frontend/react.md`는 자동으로 발견됩니다
- CLAUDE.md가 200줄에 가까워지면 규칙으로 분리를 시작하세요
:::

**예시: `testing.md`** (테스트 파일에 범위 지정)

```markdown
---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Testing Rules

- Use descriptive test names: "should [expected] when [condition]"
- Mock external dependencies, not internal modules
- Clean up side effects in afterEach
```

**예시: `api-design.md`** (백엔드 코드에 범위 지정)

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Design Rules

- All endpoints must validate input with Zod schemas
- Return shape: { data: T } | { error: string }
- Rate limit all public endpoints
```

[전체 문서 보기 →](/memory#organize-rules-with-claude/rules/)

#### `skills/`

- **한줄 요약:** 이름으로 호출하는 재사용 가능한 프롬프트
- **로드 시점:** `/skill-name`으로 호출하거나 Claude가 작업에 매칭할 때

각 skill은 SKILL.md 파일과 필요한 지원 파일이 있는 폴더입니다. 기본적으로 사용자와 Claude 모두 skill을 호출할 수 있습니다. 프론트매터로 제어합니다: 사용자 전용 워크플로우(예: `/deploy`)에는 `disable-model-invocation: true`, Claude만 호출하도록 `/` 메뉴에서 숨기려면 `user-invocable: false`를 설정합니다.

::: tip 팁
- Skills는 인자를 받습니다: `/deploy staging`은 "staging"을 `$ARGUMENTS`로 전달합니다. 위치별 접근에는 `$0`, `$1` 등을 사용하세요
- `description` 프론트매터가 Claude의 자동 호출 시점을 결정합니다
- SKILL.md 옆에 참조 문서를 번들하세요. Claude는 skill 디렉토리 경로를 알고 있으며 언급 시 지원 파일을 읽을 수 있습니다
:::

**예시: `security-review/SKILL.md`**

```markdown
---
description: Reviews code changes for security vulnerabilities, authentication gaps, and injection risks
disable-model-invocation: true
argument-hint: <branch-or-path>
---

## Diff to review

!`git diff $ARGUMENTS`

Audit the changes above for:

1. Injection vulnerabilities (SQL, XSS, command)
2. Authentication and authorization gaps
3. Hardcoded secrets or credentials

Use checklist.md in this skill directory for the full review checklist.

Report findings with severity ratings and remediation steps.
```

**예시: `security-review/checklist.md`** (skill에 번들된 지원 파일)

```markdown
# Security Review Checklist

## Input Validation
- [ ] All user input sanitized before DB queries
- [ ] File upload MIME types validated
- [ ] Path traversal prevented on file operations

## Authentication
- [ ] JWT tokens expire after 24 hours
- [ ] API keys stored in environment variables
- [ ] Passwords hashed with bcrypt or argon2
```

[전체 문서 보기 →](/skills)

#### `commands/`

- **한줄 요약:** `/name`으로 호출하는 단일 파일 프롬프트
- **로드 시점:** 사용자가 `/command-name`을 입력할 때

::: info
Commands와 skills는 이제 동일한 메커니즘입니다. 새 워크플로우에는 [skills/](/skills)를 대신 사용하세요: 동일한 `/name` 호출에 지원 파일을 번들할 수 있습니다.
:::

`commands/deploy.md` 파일은 `skills/deploy/SKILL.md`의 skill과 같은 방식으로 `/deploy`를 생성하며, 둘 다 Claude가 자동 호출할 수 있습니다. Skills는 SKILL.md가 있는 디렉토리를 사용하여 참조 문서, 템플릿, 스크립트를 프롬프트와 함께 번들할 수 있습니다.

::: tip 팁
- 파일에 `$ARGUMENTS`를 사용하여 매개변수를 받을 수 있습니다: `/fix-issue 123`
- skill과 command가 이름을 공유하면 skill이 우선합니다
- 새 commands는 보통 skills로 만들어야 합니다. commands는 계속 지원됩니다
:::

**예시: `fix-issue.md`**

```markdown
---
argument-hint: <issue-number>
---

!`gh issue view $ARGUMENTS`

Investigate and fix the issue above.

1. Trace the bug to its root cause
2. Implement the fix
3. Write or update tests
4. Summarize what you changed and why
```

[전체 문서 보기 →](/skills)

#### `output-styles/`

- **한줄 요약:** 팀에서 공유하는 프로젝트 범위 output styles
- **로드 시점:** outputStyle 설정을 통해 선택 시 세션 시작 시 적용

Output styles는 보통 개인적이므로 대부분 `~/.claude/output-styles/`에 있습니다. 팀이 공유하는 스타일(예: 모든 사람이 사용하는 리뷰 모드)이 있으면 여기에 둡니다. 전체 설명과 예시는 아래 [전역 탭](#전역-디렉토리-구조) 섹션을 참조하세요.

[전체 문서 보기 →](/output-styles)

#### `agents/`

- **한줄 요약:** 자체 컨텍스트 윈도우를 가진 특수 subagents
- **로드 시점:** 사용자나 Claude가 호출할 때 자체 컨텍스트 윈도우에서 실행

각 마크다운 파일은 자체 시스템 프롬프트, 도구 접근, 선택적으로 자체 모델을 가진 subagent를 정의합니다. Subagents는 새로운 컨텍스트 윈도우에서 실행되어 메인 대화를 깔끔하게 유지합니다. 병렬 작업이나 격리된 작업에 유용합니다.

::: tip 팁
- 각 agent는 메인 세션과 별도의 새로운 컨텍스트 윈도우를 받습니다
- `tools:` 프론트매터 필드로 agent별 도구 접근을 제한하세요
- @를 입력하고 자동완성에서 agent를 선택하여 직접 위임할 수 있습니다
:::

**예시: `code-reviewer.md`**

```markdown
---
name: code-reviewer
description: Reviews code for correctness, security, and maintainability
tools: Read, Grep, Glob
---

You are a senior code reviewer. Review for:

1. Correctness: logic errors, edge cases, null handling
2. Security: injection, auth bypass, data exposure
3. Maintainability: naming, complexity, duplication

Every finding must include a concrete fix.
```

[전체 문서 보기 →](/sub-agents)

#### `agent-memory/`

- **상태:** committed (자동 생성)
- **한줄 요약:** 메인 세션 자동 메모리와 별도인 subagent 영구 메모리
- **로드 시점:** subagent 실행 시 MEMORY.md의 처음 200줄(25KB 상한)이 subagent 시스템 프롬프트에 로드

프론트매터에 `memory: project`가 있는 subagents는 여기에 전용 메모리 디렉토리를 갖습니다. 이것은 `~/.claude/projects/`의 [메인 세션 자동 메모리](/memory#auto-memory)와 구별됩니다: 각 subagent는 사용자의 것이 아닌 자체 MEMORY.md를 읽고 씁니다.

::: tip 팁
- `memory:` 프론트매터 필드를 설정한 subagents에 대해서만 생성됩니다
- 이 디렉토리는 팀과 공유하도록 의도된 프로젝트 범위 subagent 메모리를 보유합니다. 버전 관리에서 메모리를 제외하려면 `memory: local`을 사용하세요(`.claude/agent-memory-local/`에 기록). 프로젝트 간 메모리에는 `memory: user`를 사용하세요(`~/.claude/agent-memory/`에 기록)
- 메인 세션 자동 메모리는 다른 기능입니다. 전역 탭의 `~/.claude/projects/`를 참조하세요
:::

**예시: MEMORY.md** (subagent가 자동으로 작성 및 관리)

```markdown
# code-reviewer memory

## Patterns seen
- Project uses custom Result<T, E> type, not exceptions
- Auth middleware expects Bearer token in Authorization header
- Tests use factory functions in test/factories/

## Recurring issues
- Missing null checks on API responses (src/api/*)
- Unhandled promise rejections in background jobs
```

[전체 문서 보기 →](/sub-agents#enable-persistent-memory)

---

## 전역 디렉토리 구조

전역(`~/`) 디렉토리의 파일은 모든 프로젝트에 적용됩니다.

### `~/.claude.json`

- **상태:** local only
- **한줄 요약:** 앱 상태와 UI 환경설정
- **로드 시점:** 세션 시작 시 환경설정과 MCP 서버를 위해 읽힘. `/config`에서 설정을 변경하거나 신뢰 프롬프트를 승인하면 Claude Code가 다시 기록

settings.json에 속하지 않는 상태를 보유합니다: 테마, OAuth 세션, 프로젝트별 신뢰 결정, 개인 MCP 서버, UI 토글. 직접 편집하기보다 `/config`를 통해 주로 관리됩니다.

::: tip 팁
- `showTurnDuration`이나 `terminalProgressBarEnabled` 같은 UI 토글은 settings.json이 아닌 여기에 있습니다
- `projects` 키는 신뢰 대화 수락이나 마지막 세션 지표 같은 프로젝트별 상태를 추적합니다. 세션 중 승인한 권한 규칙은 `.claude/settings.local.json`에 들어갑니다
- 여기의 MCP 서버는 본인 전용입니다: user 범위는 모든 프로젝트에 적용, local 범위는 프로젝트별이지만 커밋되지 않음. 팀 공유 서버는 프로젝트 루트의 `.mcp.json`에 둡니다
:::

```json
{
  "editorMode": "vim",
  "showTurnDuration": false,
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"]
    }
  }
}
```

[전체 문서 보기 →](/settings#global-config-settings)

### `~/.claude/`

모든 프로젝트에 걸친 개인 설정입니다. 프로젝트의 `.claude/` 디렉토리의 전역 대응물입니다. 여기의 파일은 모든 프로젝트에 적용되며 어떤 저장소에도 커밋되지 않습니다.

#### `CLAUDE.md`

- **상태:** local only
- **한줄 요약:** 모든 프로젝트에 걸친 개인 환경설정
- **로드 시점:** 모든 프로젝트에서 모든 세션 시작 시 로드

전역 지침 파일입니다. 세션 시작 시 프로젝트 CLAUDE.md와 함께 로드되어 둘 다 컨텍스트에 있습니다. 지침이 충돌하면 프로젝트 수준 지침이 우선합니다. 응답 스타일, 커밋 형식, 개인 규약 등 어디에서나 적용되는 환경설정을 유지하세요.

::: tip 팁
- 모든 프로젝트에서 해당 프로젝트의 CLAUDE.md와 함께 로드되므로 짧게 유지하세요
- 응답 스타일, 커밋 형식, 개인 규약에 적합합니다
:::

```markdown
# Global preferences

- Keep explanations concise
- Use conventional commit format
- Show the terminal command to verify changes
- Prefer composition over inheritance
```

[전체 문서 보기 →](/memory)

#### `settings.json`

- **상태:** local only
- **한줄 요약:** 모든 프로젝트의 기본 설정
- **로드 시점:** 사용자 기본값. 프로젝트 및 로컬 settings.json이 여기 설정한 키를 오버라이드

프로젝트 `settings.json`과 동일한 키: 권한, hooks, 모델, 환경 변수 등. 항상 허용하는 권한, 선호 모델, 프로젝트와 무관하게 실행되는 알림 hook 등 모든 프로젝트에서 원하는 설정을 여기에 넣으세요.

설정은 우선순위를 따릅니다: 프로젝트 `settings.json`이 여기 설정한 매칭 키를 오버라이드합니다. 전역과 프로젝트 파일이 모두 컨텍스트에 로드되는 CLAUDE.md와는 다르게 키별로 병합됩니다.

```json
{
  "permissions": {
    "allow": [
      "Bash(git log *)",
      "Bash(git diff *)"
    ]
  }
}
```

[전체 문서 보기 →](/settings)

#### `keybindings.json`

- **상태:** local only
- **한줄 요약:** 커스텀 키보드 단축키
- **로드 시점:** 세션 시작 시 읽히며 파일 편집 시 핫 리로드

대화형 CLI에서 키보드 단축키를 재바인딩합니다. `/keybindings`를 실행하여 스키마 참조가 포함된 이 파일을 생성하거나 엽니다. Ctrl+C, Ctrl+D, Ctrl+M은 예약되어 있으며 재바인딩할 수 없습니다.

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

[전체 문서 보기 →](/keybindings)

#### `projects/` (자동 메모리)

- **상태:** local only (자동 생성)
- **한줄 요약:** 자동 메모리 - Claude가 프로젝트별로 자신에게 남기는 메모
- **로드 시점:** MEMORY.md는 세션 시작 시 로드. 주제 파일은 요청 시 읽힘

자동 메모리를 통해 Claude는 사용자가 아무것도 작성하지 않아도 세션 간에 지식을 축적할 수 있습니다. Claude는 작업하면서 메모를 저장합니다: 빌드 명령어, 디버깅 인사이트, 아키텍처 노트. 각 프로젝트는 저장소 경로로 키가 지정된 자체 메모리 디렉토리를 갖습니다.

::: tip 팁
- 기본으로 활성화됩니다. `/memory` 또는 설정의 `autoMemoryEnabled`로 토글하세요
- MEMORY.md는 각 세션에서 로드되는 인덱스입니다. 처음 200줄 또는 25KB 중 먼저 도달하는 것까지 읽힙니다
- debugging.md 같은 주제 파일은 요청 시에만 읽히며, 시작 시에는 읽히지 않습니다
- 일반 마크다운입니다. 언제든 편집하거나 삭제할 수 있습니다
:::

**예시: MEMORY.md**

```markdown
# Memory Index

## Project
- [build-and-test.md](build-and-test.md): npm run build (~45s), Vitest, dev server on 3001
- [architecture.md](architecture.md): API client singleton, refresh-token auth

## Reference
- [debugging.md](debugging.md): auth token rotation and DB connection troubleshooting
```

**예시: 주제 파일 (`debugging.md`)**

```markdown
---
name: Debugging patterns
description: Auth token rotation and database connection troubleshooting for this project
type: reference
---

## Auth Token Issues
- Refresh token rotation: old token invalidated immediately
- If 401 after refresh: check clock skew between client and server

## Database Connection Drops
- Connection pool: max 10 in dev, 50 in prod
- Always check `docker compose ps` first
```

[전체 문서 보기 →](/memory#auto-memory)

#### `rules/`

- **한줄 요약:** 모든 프로젝트에 적용되는 사용자 수준 규칙
- **로드 시점:** `paths:`가 없는 규칙은 세션 시작 시 로드. `paths:`가 있는 규칙은 매칭 파일이 컨텍스트에 들어올 때 로드

프로젝트 `.claude/rules/`와 동일하지만 모든 곳에 적용됩니다. 개인 코드 스타일이나 커밋 메시지 형식 등 모든 작업에 걸쳐 원하는 규약에 사용하세요.

[전체 문서 보기 →](/memory#organize-rules-with-claude/rules/)

#### `skills/`

- **한줄 요약:** 모든 프로젝트에서 사용 가능한 개인 skills
- **로드 시점:** 모든 프로젝트에서 `/skill-name`으로 호출

어디서나 작동하는 개인용 skills입니다. 프로젝트 skills와 동일한 구조: 각각 SKILL.md가 있는 폴더이며, 단일 프로젝트가 아닌 사용자 계정에 범위가 지정됩니다.

[전체 문서 보기 →](/skills)

#### `commands/`

- **한줄 요약:** 모든 프로젝트에서 사용 가능한 개인 단일 파일 commands

::: info
Commands와 skills는 이제 동일한 메커니즘입니다. 새 워크플로우에는 [skills/](/skills)를 대신 사용하세요: 동일한 `/name` 호출에 지원 파일을 번들할 수 있습니다.
:::

프로젝트 commands/와 동일하지만 사용자 계정에 범위가 지정됩니다. 각 마크다운 파일이 모든 곳에서 사용 가능한 command가 됩니다.

[전체 문서 보기 →](/skills)

#### `output-styles/`

- **한줄 요약:** Claude의 작동 방식을 조정하는 커스텀 시스템 프롬프트 섹션
- **로드 시점:** outputStyle 설정을 통해 선택 시 세션 시작 시 적용

각 마크다운 파일은 output style을 정의합니다: 기본적으로 내장된 소프트웨어 엔지니어링 작업 지침도 제거하는 시스템 프롬프트에 추가되는 섹션입니다. 코딩 이외의 용도에 Claude Code를 적용하거나 교육이나 리뷰 모드를 추가하는 데 사용하세요.

`/config` 또는 설정의 `outputStyle` 키로 내장 또는 커스텀 스타일을 선택하세요. 여기의 스타일은 모든 프로젝트에서 사용 가능하며, 동일한 이름의 프로젝트 수준 스타일이 우선합니다.

::: tip 팁
- 내장 스타일 Explanatory와 Learning은 Claude Code에 포함되어 있습니다. 커스텀 스타일은 여기에 둡니다
- 프론트매터에 `keep-coding-instructions: true`를 설정하면 추가 내용과 함께 기본 작업 지침을 유지합니다
- 시스템 프롬프트는 시작 시 캐싱을 위해 고정되므로 변경 사항은 다음 세션에서 적용됩니다
:::

**예시: `teaching.md`**

```markdown
---
description: Explains reasoning and asks you to implement small pieces
keep-coding-instructions: true
---

After completing each task, add a brief "Why this approach" note
explaining the key design decision.

When a change is under 10 lines, ask the user to implement it
themselves by leaving a TODO(human) marker instead of writing it.
```

[전체 문서 보기 →](/output-styles)

#### `agents/`

- **한줄 요약:** 모든 프로젝트에서 사용 가능한 개인 subagents
- **로드 시점:** 모든 프로젝트에서 Claude가 위임하거나 @-멘션할 때

여기 정의된 subagents는 모든 프로젝트에서 사용 가능합니다. 프로젝트 agents와 동일한 형식입니다.

[전체 문서 보기 →](/sub-agents)

#### `agent-memory/`

- **상태:** 자동 생성
- **한줄 요약:** `memory: user`인 subagents의 영구 메모리
- **로드 시점:** subagent 시작 시 subagent 시스템 프롬프트에 로드

프론트매터에 `memory: user`가 있는 subagents는 모든 프로젝트에 걸쳐 지속되는 지식을 여기에 저장합니다. 프로젝트 범위의 subagent 메모리는 `.claude/agent-memory/`를 대신 참조하세요.

[전체 문서 보기 →](/sub-agents#enable-persistent-memory)

---

## 표시되지 않는 것들

위 탐색기는 사용자가 작성하고 편집하는 파일을 다룹니다. 관련된 몇 가지 파일은 다른 곳에 있습니다:

| 파일 | 위치 | 용도 |
| --- | --- | --- |
| `managed-settings.json` | 시스템 수준, OS에 따라 다름 | 사용자가 오버라이드할 수 없는 기업 강제 설정. [서버 관리 설정](/server-managed-settings) 참조. |
| `CLAUDE.local.md` | 프로젝트 루트 | 이 프로젝트의 개인 환경설정, CLAUDE.md와 함께 로드됨. 수동으로 생성하고 `.gitignore`에 추가하세요. |
| 설치된 플러그인 | `~/.claude/plugins/` | 클론된 마켓플레이스, 설치된 플러그인 버전, 플러그인별 데이터. `claude plugin` 명령어로 관리됨. 고아 버전은 플러그인 업데이트나 제거 7일 후 삭제됨. [플러그인 캐싱](/plugins-reference#plugin-caching-and-file-resolution) 참조. |

`~/.claude`는 작업 중 Claude Code가 기록하는 데이터도 보유합니다: 트랜스크립트, 프롬프트 기록, 파일 스냅샷, 캐시, 로그. 아래 [애플리케이션 데이터](#애플리케이션-데이터)를 참조하세요.

## 파일 레퍼런스

이 테이블은 위 탐색기가 다루는 모든 파일을 나열합니다. 프로젝트 범위 파일은 저장소의 `.claude/` 아래에 있습니다(`CLAUDE.md`, `.mcp.json`, `.worktreeinclude`는 루트에 위치). 전역 범위 파일은 `~/.claude/`에 있으며 모든 프로젝트에 적용됩니다.

::: info
이 파일들에 넣은 내용을 오버라이드할 수 있는 여러 가지가 있습니다:

* 조직에서 배포한 [관리 설정](/server-managed-settings)이 모든 것에 우선합니다
* `--permission-mode`이나 `--settings` 같은 CLI 플래그는 해당 세션의 `settings.json`을 오버라이드합니다
* 일부 환경 변수는 동등한 설정보다 우선하지만 이는 다양합니다: 각각의 [환경 변수 레퍼런스](/env-vars)를 확인하세요

전체 순서는 [설정 우선순위](/settings#settings-precedence)를 참조하세요.
:::

| 파일 | 범위 | 커밋 | 기능 | 레퍼런스 |
| --- | --- | --- | --- | --- |
| [`CLAUDE.md`](#ce-claude-md) | 프로젝트 및 전역 | ✓ | 매 세션 로드되는 지침 | [Memory](/memory) |
| [`rules/*.md`](#ce-rules) | 프로젝트 및 전역 | ✓ | 주제별 지침, 선택적 경로 게이트 | [Rules](/memory#organize-rules-with-claude/rules/) |
| [`settings.json`](#ce-settings-json) | 프로젝트 및 전역 | ✓ | 권한, hooks, 환경 변수, 모델 기본값 | [Settings](/settings) |
| [`settings.local.json`](#ce-settings-local-json) | 프로젝트 전용 | | 개인 오버라이드, 자동 gitignore | [Settings scopes](/settings#settings-files) |
| [`.mcp.json`](#ce-mcp-json) | 프로젝트 전용 | ✓ | 팀 공유 MCP 서버 | [MCP scopes](/mcp#mcp-installation-scopes) |
| [`.worktreeinclude`](#ce-worktreeinclude) | 프로젝트 전용 | ✓ | 새 worktree에 복사할 gitignored 파일 | [Worktrees](/common-workflows#copy-gitignored-files-to-worktrees) |
| [`skills/<name>/SKILL.md`](#ce-skills) | 프로젝트 및 전역 | ✓ | `/name`으로 호출하거나 자동 호출되는 재사용 프롬프트 | [Skills](/skills) |
| [`commands/*.md`](#ce-commands) | 프로젝트 및 전역 | ✓ | 단일 파일 프롬프트; skills와 동일한 메커니즘 | [Skills](/skills) |
| [`output-styles/*.md`](#ce-output-styles) | 프로젝트 및 전역 | ✓ | 커스텀 시스템 프롬프트 섹션 | [Output styles](/output-styles) |
| [`agents/*.md`](#ce-agents) | 프로젝트 및 전역 | ✓ | 자체 프롬프트와 도구를 가진 subagent 정의 | [Subagents](/sub-agents) |
| [`agent-memory/<name>/`](#ce-agent-memory) | 프로젝트 및 전역 | ✓ | subagents의 영구 메모리 | [Persistent memory](/sub-agents#enable-persistent-memory) |
| [`~/.claude.json`](#ce-claude-json) | 전역 전용 | | 앱 상태, OAuth, UI 토글, 개인 MCP 서버 | [Global config](/settings#global-config-settings) |
| [`projects/<project>/memory/`](#ce-global-projects) | 전역 전용 | | 자동 메모리: 세션 간 Claude의 자체 메모 | [Auto memory](/memory#auto-memory) |
| [`keybindings.json`](#ce-keybindings) | 전역 전용 | | 커스텀 키보드 단축키 | [Keybindings](/keybindings) |

## 로드된 내용 확인

위 탐색기는 존재할 수 있는 파일을 보여줍니다. 현재 세션에서 실제로 로드된 내용을 보려면 다음 명령어를 사용하세요:

| 명령어 | 표시 내용 |
| --- | --- |
| `/context` | 카테고리별 토큰 사용량: 시스템 프롬프트, 메모리 파일, skills, MCP 도구, 메시지 |
| `/memory` | 로드된 CLAUDE.md 및 rules 파일, 자동 메모리 항목 |
| `/agents` | 구성된 subagents와 설정 |
| `/hooks` | 활성 hook 설정 |
| `/mcp` | 연결된 MCP 서버와 상태 |
| `/skills` | 프로젝트, 사용자, 플러그인 소스에서 사용 가능한 skills |
| `/permissions` | 현재 허용 및 거부 규칙 |
| `/doctor` | 설치 및 설정 진단 |

전체 개요를 보려면 먼저 `/context`를 실행한 다음, 조사하려는 영역에 대한 특정 명령어를 실행하세요.

## 애플리케이션 데이터

사용자가 작성하는 설정 외에, `~/.claude`는 세션 중 Claude Code가 기록하는 데이터를 보유합니다. 이 파일들은 일반 텍스트입니다. 도구를 통과하는 모든 것(파일 내용, 명령어 출력, 붙여넣은 텍스트)은 디스크의 트랜스크립트에 기록됩니다.

### 자동으로 정리됨

아래 경로의 파일은 [`cleanupPeriodDays`](/settings#available-settings)보다 오래되면 시작 시 삭제됩니다. 기본값은 30일입니다.

| `~/.claude/` 하위 경로 | 내용 |
| --- | --- |
| `projects/<project>/<session>.jsonl` | 전체 대화 트랜스크립트: 모든 메시지, 도구 호출, 도구 결과 |
| `projects/<project>/<session>/tool-results/` | 별도 파일로 분리된 대형 도구 출력 |
| `file-history/<session>/` | Claude가 변경한 파일의 편집 전 스냅샷, [체크포인트 복원](/checkpointing)에 사용 |
| `plans/` | [plan 모드](/permission-modes#analyze-before-you-edit-with-plan-mode) 중 작성된 계획 파일 |
| `debug/` | 세션별 디버그 로그, `--debug`로 시작하거나 `/debug`를 실행할 때만 기록 |
| `paste-cache/`, `image-cache/` | 대형 붙여넣기와 첨부 이미지의 내용 |
| `session-env/` | 세션별 환경 메타데이터 |

### 삭제할 때까지 유지됨

다음 경로는 자동 정리 대상이 아니며 무기한 유지됩니다.

| `~/.claude/` 하위 경로 | 내용 |
| --- | --- |
| `history.jsonl` | 입력한 모든 프롬프트(타임스탬프 및 프로젝트 경로 포함). 위쪽 화살표 기록에 사용. |
| `stats-cache.json` | `/cost`에서 표시하는 집계 토큰 및 비용 수 |
| `backups/` | 설정 마이그레이션 전 `~/.claude.json`의 타임스탬프 사본 |
| `todos/` | 레거시 세션별 작업 목록. 현재 버전에서는 더 이상 기록되지 않음. 삭제해도 안전. |

`shell-snapshots/`는 세션이 정상 종료될 때 제거되는 런타임 파일을 보유합니다. 사용하는 기능에 따라 다른 소형 캐시 및 잠금 파일이 나타나며 삭제해도 안전합니다.

### 일반 텍스트 저장

트랜스크립트와 기록은 저장 시 암호화되지 않습니다. OS 파일 권한이 유일한 보호 수단입니다. 도구가 `.env` 파일을 읽거나 명령어가 자격 증명을 출력하면 해당 값이 `projects/<project>/<session>.jsonl`에 기록됩니다. 노출을 줄이려면:

* `cleanupPeriodDays`를 낮추어 트랜스크립트 보관 기간을 단축하세요
* 비대화형 모드에서 `-p`와 함께 `--no-session-persistence`를 전달하여 트랜스크립트 기록을 완전히 건너뛰세요. Agent SDK에서는 `persistSession: false`를 설정하세요. 대화형 모드에는 동등한 옵션이 없습니다.
* [권한 규칙](/permissions)을 사용하여 자격 증명 파일 읽기를 거부하세요

### 로컬 데이터 삭제

위의 애플리케이션 데이터 경로는 언제든지 삭제할 수 있습니다. 새 세션에는 영향이 없습니다. 아래 테이블은 과거 세션에서 잃게 되는 것을 보여줍니다.

| 삭제 항목 | 잃게 되는 것 |
| --- | --- |
| `~/.claude/projects/` | 과거 세션의 이어하기, 계속하기, 되감기 |
| `~/.claude/history.jsonl` | 위쪽 화살표 프롬프트 기록 |
| `~/.claude/file-history/` | 과거 세션의 체크포인트 복원 |
| `~/.claude/stats-cache.json` | `/cost`에서 표시하는 과거 총계 |
| `~/.claude/backups/` | 과거 설정 마이그레이션의 `~/.claude.json` 롤백 사본 |
| `~/.claude/debug/`, `~/.claude/plans/`, `~/.claude/paste-cache/`, `~/.claude/image-cache/`, `~/.claude/session-env/` | 사용자에게 보이는 것 없음 |
| `~/.claude/todos/` | 없음. 현재 버전에서 기록되지 않는 레거시 디렉토리. |

`~/.claude.json`, `~/.claude/settings.json`, `~/.claude/plugins/`는 삭제하지 마세요: 인증, 환경설정, 설치된 플러그인이 포함되어 있습니다.

## 관련 리소스

* [Claude의 메모리 관리](/memory): CLAUDE.md, rules, 자동 메모리 작성 및 정리
* [설정 구성](/settings): 권한, hooks, 환경 변수, 모델 기본값 설정
* [Skills 생성](/skills): 재사용 가능한 프롬프트와 워크플로우 구축
* [Subagents 구성](/sub-agents): 자체 컨텍스트를 가진 특수 agents 정의
