---
title: SDK의 슬래시 명령어
description: SDK를 통해 Claude Code 세션을 제어하는 슬래시 명령어 사용 방법
---

# SDK의 슬래시 명령어

슬래시 명령어는 `/`로 시작하는 특수 명령어를 통해 Claude Code 세션을 제어하는 방법을 제공합니다. SDK를 통해 대화 기록 초기화, 메시지 압축, 도움말 조회 등 다양한 작업을 수행할 수 있습니다.

## 사용 가능한 슬래시 명령어 확인

Claude Agent SDK는 시스템 초기화 메시지를 통해 사용 가능한 슬래시 명령어 정보를 제공합니다. 세션 시작 시 다음과 같이 확인할 수 있습니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Hello Claude",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Available slash commands:", message.slash_commands);
    // Example output: ["/compact", "/clear", "/help"]
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage


async def main():
    async for message in query(prompt="Hello Claude", options=ClaudeAgentOptions(max_turns=1)):
        if isinstance(message, SystemMessage) and message.subtype == "init":
            print("Available slash commands:", message.data["slash_commands"])
            # Example output: ["/compact", "/clear", "/help"]


asyncio.run(main())
```

:::

## 슬래시 명령어 전송

슬래시 명령어는 일반 텍스트와 동일하게 프롬프트 문자열에 포함하여 전송합니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Send a slash command
for await (const message of query({
  prompt: "/compact",
  options: { maxTurns: 1 }
})) {
  if (message.type === "result") {
    console.log("Command executed:", message.result);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def main():
    # Send a slash command
    async for message in query(prompt="/compact", options=ClaudeAgentOptions(max_turns=1)):
        if isinstance(message, ResultMessage):
            print("Command executed:", message.result)


asyncio.run(main())
```

:::

## 주요 슬래시 명령어

### `/compact` - 대화 기록 압축

`/compact` 명령어는 중요한 컨텍스트를 유지하면서 이전 메시지를 요약하여 대화 기록의 크기를 줄입니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "/compact",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "compact_boundary") {
    console.log("Compaction completed");
    console.log("Pre-compaction tokens:", message.compact_metadata.pre_tokens);
    console.log("Trigger:", message.compact_metadata.trigger);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage


async def main():
    async for message in query(prompt="/compact", options=ClaudeAgentOptions(max_turns=1)):
        if isinstance(message, SystemMessage) and message.subtype == "compact_boundary":
            print("Compaction completed")
            print("Pre-compaction tokens:", message.data["compact_metadata"]["pre_tokens"])
            print("Trigger:", message.data["compact_metadata"]["trigger"])


asyncio.run(main())
```

:::

### `/clear` - 대화 초기화

`/clear` 명령어는 이전 대화 기록을 모두 지우고 새 대화를 시작합니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Clear conversation and start fresh
for await (const message of query({
  prompt: "/clear",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Conversation cleared, new session started");
    console.log("Session ID:", message.session_id);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage


async def main():
    # Clear conversation and start fresh
    async for message in query(prompt="/clear", options=ClaudeAgentOptions(max_turns=1)):
        if isinstance(message, SystemMessage) and message.subtype == "init":
            print("Conversation cleared, new session started")
            print("Session ID:", message.data["session_id"])


asyncio.run(main())
```

:::

## 커스텀 슬래시 명령어 만들기

내장 슬래시 명령어 외에도, SDK를 통해 사용할 수 있는 커스텀 명령어를 직접 만들 수 있습니다. 커스텀 명령어는 서브에이전트 설정 방식과 유사하게 특정 디렉토리에 마크다운 파일로 정의합니다.

::: info
`.claude/commands/` 디렉토리는 레거시 형식입니다. 권장 형식은 `.claude/skills/<name>/SKILL.md`이며, 이 형식은 동일한 슬래시 명령어 호출(`/name`)과 Claude의 자율 호출을 모두 지원합니다. 현재 형식에 대한 자세한 내용은 [Skills](/agent-sdk/skills)를 참고하세요. CLI는 두 형식 모두 지원하며, 아래 예시는 `.claude/commands/`에도 그대로 적용됩니다.
:::

### 파일 위치

커스텀 슬래시 명령어는 적용 범위에 따라 지정된 디렉토리에 저장합니다:

- **프로젝트 명령어**: `.claude/commands/` - 현재 프로젝트에서만 사용 가능 (레거시; `.claude/skills/` 권장)
- **개인 명령어**: `~/.claude/commands/` - 모든 프로젝트에서 사용 가능 (레거시; `~/.claude/skills/` 권장)

### 파일 형식

각 커스텀 명령어는 마크다운 파일로 작성합니다:

- 파일명(`.md` 확장자 제외)이 명령어 이름이 됩니다
- 파일 내용이 명령어의 동작을 정의합니다
- 선택적 YAML 프론트매터로 추가 설정을 할 수 있습니다

#### 기본 예시

`.claude/commands/refactor.md` 파일 생성:

```markdown
Refactor the selected code to improve readability and maintainability.
Focus on clean code principles and best practices.
```

이렇게 하면 SDK에서 사용할 수 있는 `/refactor` 명령어가 생성됩니다.

#### 프론트매터 사용

`.claude/commands/security-check.md` 파일 생성:

```markdown
---
allowed-tools: Read, Grep, Glob
description: Run security vulnerability scan
model: claude-opus-4-6
---

Analyze the codebase for security vulnerabilities including:
- SQL injection risks
- XSS vulnerabilities
- Exposed credentials
- Insecure configurations
```

### SDK에서 커스텀 명령어 사용

파일 시스템에 정의된 커스텀 명령어는 SDK에서 자동으로 사용 가능합니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Use a custom command
for await (const message of query({
  prompt: "/refactor src/auth/login.ts",
  options: { maxTurns: 3 }
})) {
  if (message.type === "assistant") {
    console.log("Refactoring suggestions:", message.message);
  }
}

// Custom commands appear in the slash_commands list
for await (const message of query({
  prompt: "Hello",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "init") {
    // Will include both built-in and custom commands
    console.log("Available commands:", message.slash_commands);
    // Example: ["/compact", "/clear", "/help", "/refactor", "/security-check"]
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, SystemMessage


async def main():
    # Use a custom command
    async for message in query(
        prompt="/refactor src/auth/login.py", options=ClaudeAgentOptions(max_turns=3)
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    print("Refactoring suggestions:", block.text)

    # Custom commands appear in the slash_commands list
    async for message in query(prompt="Hello", options=ClaudeAgentOptions(max_turns=1)):
        if isinstance(message, SystemMessage) and message.subtype == "init":
            # Will include both built-in and custom commands
            print("Available commands:", message.data["slash_commands"])
            # Example: ["/compact", "/clear", "/help", "/refactor", "/security-check"]


asyncio.run(main())
```

:::

### 고급 기능

#### 인수와 플레이스홀더

커스텀 명령어는 플레이스홀더를 통해 동적 인수를 지원합니다:

`.claude/commands/fix-issue.md` 파일 생성:

```markdown
---
argument-hint: [issue-number] [priority]
description: Fix a GitHub issue
---

Fix issue #$1 with priority $2.
Check the issue description and implement the necessary changes.
```

SDK에서 사용:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Pass arguments to custom command
for await (const message of query({
  prompt: "/fix-issue 123 high",
  options: { maxTurns: 5 }
})) {
  // Command will process with $1="123" and $2="high"
  if (message.type === "result") {
    console.log("Issue fixed:", message.result);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def main():
    # Pass arguments to custom command
    async for message in query(prompt="/fix-issue 123 high", options=ClaudeAgentOptions(max_turns=5)):
        # Command will process with $1="123" and $2="high"
        if isinstance(message, ResultMessage):
            print("Issue fixed:", message.result)


asyncio.run(main())
```

:::

#### Bash 명령어 실행

커스텀 명령어는 bash 명령어를 실행하고 그 결과를 포함할 수 있습니다:

`.claude/commands/git-commit.md` 파일 생성:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current status: !`git status`
- Current diff: !`git diff HEAD`

## Task

Create a git commit with appropriate message based on the changes.
```

#### 파일 참조

`@` 접두사를 사용하여 파일 내용을 포함할 수 있습니다:

`.claude/commands/review-config.md` 파일 생성:

```markdown
---
description: Review configuration files
---

Review the following configuration files for issues:
- Package config: @package.json
- TypeScript config: @tsconfig.json
- Environment config: @.env

Check for security issues, outdated dependencies, and misconfigurations.
```

### 네임스페이싱을 통한 구조화

하위 디렉토리를 활용하면 명령어를 체계적으로 정리할 수 있습니다:

```bash
.claude/commands/
├── frontend/
│   ├── component.md      # /component 명령어 생성 (project:frontend)
│   └── style-check.md    # /style-check 명령어 생성 (project:frontend)
├── backend/
│   ├── api-test.md       # /api-test 명령어 생성 (project:backend)
│   └── db-migrate.md     # /db-migrate 명령어 생성 (project:backend)
└── review.md             # /review 명령어 생성 (project)
```

하위 디렉토리 이름은 명령어 설명에 표시되지만, 명령어 이름 자체에는 영향을 주지 않습니다.

### 실용적인 예시

#### 코드 리뷰 명령어

`.claude/commands/code-review.md` 파일 생성:

```markdown
---
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
description: Comprehensive code review
---

## Changed Files
!`git diff --name-only HEAD~1`

## Detailed Changes
!`git diff HEAD~1`

## Review Checklist

Review the above changes for:
1. Code quality and readability
2. Security vulnerabilities
3. Performance implications
4. Test coverage
5. Documentation completeness

Provide specific, actionable feedback organized by priority.
```

#### 테스트 실행 명령어

`.claude/commands/test.md` 파일 생성:

```markdown
---
allowed-tools: Bash, Read, Edit
argument-hint: [test-pattern]
description: Run tests with optional pattern
---

Run tests matching pattern: $ARGUMENTS

1. Detect the test framework (Jest, pytest, etc.)
2. Run tests with the provided pattern
3. If tests fail, analyze and fix them
4. Re-run to verify fixes
```

SDK에서 이 명령어들을 사용하는 방법:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Run code review
for await (const message of query({
  prompt: "/code-review",
  options: { maxTurns: 3 }
})) {
  // Process review feedback
}

// Run specific tests
for await (const message of query({
  prompt: "/test auth",
  options: { maxTurns: 5 }
})) {
  // Handle test results
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    # Run code review
    async for message in query(prompt="/code-review", options=ClaudeAgentOptions(max_turns=3)):
        # Process review feedback
        pass

    # Run specific tests
    async for message in query(prompt="/test auth", options=ClaudeAgentOptions(max_turns=5)):
        # Handle test results
        pass


asyncio.run(main())
```

:::

## 관련 문서

- [슬래시 명령어](/skills) - 슬래시 명령어 전체 문서
- [SDK의 서브에이전트](/agent-sdk/subagents) - 서브에이전트의 파일 시스템 기반 설정
- [TypeScript SDK 참조](/agent-sdk/typescript) - 전체 API 문서
- [SDK 개요](/agent-sdk/overview) - SDK 일반 개념
- [CLI 참조](/cli-reference) - 커맨드 라인 인터페이스
