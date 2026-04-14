---
title: Agent SDK 개요
description: Claude Code를 라이브러리로 활용하여 프로덕션 AI 에이전트를 구축하세요.
---

# Agent SDK 개요

> Claude Code를 라이브러리로 활용하여 프로덕션 AI 에이전트를 구축하세요

::: info
Claude Code SDK의 이름이 Claude Agent SDK로 변경되었습니다. 기존 SDK에서 마이그레이션하는 경우, [마이그레이션 가이드](/agent-sdk/migration-guide)를 참고하세요.
:::

파일을 자율적으로 읽고, 명령을 실행하고, 웹을 검색하고, 코드를 편집하는 AI 에이전트를 구축하세요. Agent SDK는 Claude Code를 구동하는 동일한 도구, 에이전트 루프, 컨텍스트 관리를 Python과 TypeScript로 프로그래밍할 수 있게 제공합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
    ):
        print(message)  # Claude reads the file, finds the bug, edits it


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.py",
  options: { allowedTools: ["Read", "Edit", "Bash"] }
})) {
  console.log(message); // Claude reads the file, finds the bug, edits it
}
```

:::

Agent SDK에는 파일 읽기, 명령 실행, 코드 편집을 위한 내장 도구가 포함되어 있어, 도구 실행을 직접 구현하지 않고도 에이전트를 즉시 사용할 수 있습니다. 빠른 시작 가이드를 따라가거나, SDK로 구축된 실제 에이전트 예시를 살펴보세요:

- [빠른 시작](/agent-sdk/quickstart) — 몇 분 안에 버그 수정 에이전트를 구축해보세요
- [에이전트 예시](https://github.com/anthropics/claude-agent-sdk-demos) — 이메일 어시스턴트, 리서치 에이전트 등

## 시작하기

### 1. SDK 설치

#### TypeScript

```bash
npm install @anthropic-ai/claude-agent-sdk
```

#### Python

```bash
pip install claude-agent-sdk
```

### 2. API 키 설정

[Console](https://platform.claude.com/)에서 API 키를 발급받은 후 환경 변수로 설정하세요:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

SDK는 서드파티 API 공급자를 통한 인증도 지원합니다:

* **Amazon Bedrock**: `CLAUDE_CODE_USE_BEDROCK=1` 환경 변수를 설정하고 AWS 자격 증명을 구성하세요
* **Google Vertex AI**: `CLAUDE_CODE_USE_VERTEX=1` 환경 변수를 설정하고 Google Cloud 자격 증명을 구성하세요
* **Microsoft Azure**: `CLAUDE_CODE_USE_FOUNDRY=1` 환경 변수를 설정하고 Azure 자격 증명을 구성하세요

자세한 내용은 [Bedrock](/amazon-bedrock), [Vertex AI](/google-vertex-ai), [Azure AI Foundry](/microsoft-foundry) 설정 가이드를 참고하세요.

::: info
사전에 승인된 경우가 아니라면, Anthropic은 서드파티 개발자가 Claude Agent SDK로 구축된 에이전트를 포함한 제품에 claude.ai 로그인 또는 속도 제한을 제공하는 것을 허용하지 않습니다. 이 문서에 설명된 API 키 인증 방식을 사용하세요.
:::

### 3. 첫 번째 에이전트 실행

이 예시는 내장 도구를 사용하여 현재 디렉토리의 파일 목록을 나열하는 에이전트를 만듭니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    async for message in query(
        prompt="What files are in this directory?",
        options=ClaudeAgentOptions(allowed_tools=["Bash", "Glob"]),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "What files are in this directory?",
  options: { allowedTools: ["Bash", "Glob"] }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

**바로 구축을 시작하고 싶으신가요?** [빠른 시작](/agent-sdk/quickstart)을 따라 몇 분 안에 버그를 찾고 수정하는 에이전트를 만들어보세요.

## 기능

Claude Code를 강력하게 만드는 모든 기능이 SDK에서도 사용 가능합니다:

### 내장 도구

에이전트는 별도 설정 없이 파일 읽기, 명령 실행, 코드베이스 검색이 가능합니다. 주요 도구는 다음과 같습니다:

| 도구 | 기능 |
| --- | --- |
| **Read** | 작업 디렉토리의 모든 파일 읽기 |
| **Write** | 새 파일 생성 |
| **Edit** | 기존 파일의 정밀 편집 |
| **Bash** | 터미널 명령, 스크립트, git 작업 실행 |
| **Monitor** | 백그라운드 스크립트를 감시하고 각 출력 줄을 이벤트로 처리 |
| **Glob** | 패턴으로 파일 찾기 (`**/*.ts`, `src/**/*.py`) |
| **Grep** | 정규식으로 파일 내용 검색 |
| **WebSearch** | 최신 정보를 위한 웹 검색 |
| **WebFetch** | 웹 페이지 콘텐츠 가져오기 및 파싱 |
| **[AskUserQuestion](/agent-sdk/user-input#handle-clarifying-questions)** | 다중 선택지를 포함한 사용자 확인 질문 |

이 예시는 코드베이스에서 TODO 주석을 검색하는 에이전트를 만듭니다:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    async for message in query(
        prompt="Find all TODO comments and create a summary",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Glob", "Grep"]),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find all TODO comments and create a summary",
  options: { allowedTools: ["Read", "Glob", "Grep"] }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

### Hooks

에이전트 생명주기의 핵심 시점에 커스텀 코드를 실행합니다. SDK Hooks는 콜백 함수를 사용하여 에이전트 동작을 검증, 로깅, 차단, 또는 변환합니다.

**사용 가능한 Hooks:** `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit` 등

이 예시는 모든 파일 변경 사항을 감사 파일에 기록합니다:

::: code-group

```python [Python]
import asyncio
from datetime import datetime
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher


async def log_file_change(input_data, tool_use_id, context):
    file_path = input_data.get("tool_input", {}).get("file_path", "unknown")
    with open("./audit.log", "a") as f:
        f.write(f"{datetime.now()}: modified {file_path}\n")
    return {}


async def main():
    async for message in query(
        prompt="Refactor utils.py to improve readability",
        options=ClaudeAgentOptions(
            permission_mode="acceptEdits",
            hooks={
                "PostToolUse": [
                    HookMatcher(matcher="Edit|Write", hooks=[log_file_change])
                ]
            },
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query, HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { appendFile } from "fs/promises";

const logFileChange: HookCallback = async (input) => {
  const filePath = (input as any).tool_input?.file_path ?? "unknown";
  await appendFile("./audit.log", `${new Date().toISOString()}: modified ${filePath}\n`);
  return {};
};

for await (const message of query({
  prompt: "Refactor utils.py to improve readability",
  options: {
    permissionMode: "acceptEdits",
    hooks: {
      PostToolUse: [{ matcher: "Edit|Write", hooks: [logFileChange] }]
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

[Hooks에 대해 더 알아보기 →](/agent-sdk/hooks)

### Subagents

특정 하위 작업을 처리하기 위해 전문화된 에이전트를 생성합니다. 메인 에이전트가 작업을 위임하면, Subagents가 결과를 보고합니다.

전문화된 지시사항으로 커스텀 에이전트를 정의하세요. Subagents는 Agent 도구를 통해 호출되므로 `allowedTools`에 `Agent`를 포함해야 합니다:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


async def main():
    async for message in query(
        prompt="Use the code-reviewer agent to review this codebase",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep", "Agent"],
            agents={
                "code-reviewer": AgentDefinition(
                    description="Expert code reviewer for quality and security reviews.",
                    prompt="Analyze code quality and suggest improvements.",
                    tools=["Read", "Glob", "Grep"],
                )
            },
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Use the code-reviewer agent to review this codebase",
  options: {
    allowedTools: ["Read", "Glob", "Grep", "Agent"],
    agents: {
      "code-reviewer": {
        description: "Expert code reviewer for quality and security reviews.",
        prompt: "Analyze code quality and suggest improvements.",
        tools: ["Read", "Glob", "Grep"]
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

Subagent 컨텍스트 내에서 발생한 메시지에는 `parent_tool_use_id` 필드가 포함되어, 어떤 메시지가 어떤 Subagent 실행에 속하는지 추적할 수 있습니다.

[Subagents에 대해 더 알아보기 →](/agent-sdk/subagents)

### MCP

Model Context Protocol을 통해 외부 시스템(데이터베이스, 브라우저, API, [그리고 수백 가지 이상](https://github.com/modelcontextprotocol/servers))에 연결합니다.

이 예시는 [Playwright MCP 서버](https://github.com/microsoft/playwright-mcp)를 연결하여 에이전트에 브라우저 자동화 기능을 부여합니다:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    async for message in query(
        prompt="Open example.com and describe what you see",
        options=ClaudeAgentOptions(
            mcp_servers={
                "playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}
            }
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Open example.com and describe what you see",
  options: {
    mcpServers: {
      playwright: { command: "npx", args: ["@playwright/mcp@latest"] }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

[MCP에 대해 더 알아보기 →](/agent-sdk/mcp)

### Permissions

에이전트가 사용할 수 있는 도구를 정밀하게 제어합니다. 안전한 작업은 허용하고, 위험한 작업은 차단하거나, 민감한 작업에는 승인을 요청하도록 설정할 수 있습니다.

::: info
인터랙티브 승인 프롬프트와 `AskUserQuestion` 도구에 대해서는 [승인 및 사용자 입력 처리](/agent-sdk/user-input)를 참고하세요.
:::

이 예시는 코드를 분석하되 수정은 할 수 없는 읽기 전용 에이전트를 만듭니다. `allowed_tools`로 `Read`, `Glob`, `Grep`을 사전 승인합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    async for message in query(
        prompt="Review this code for best practices",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep"],
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Review this code for best practices",
  options: {
    allowedTools: ["Read", "Glob", "Grep"]
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

[Permissions에 대해 더 알아보기 →](/agent-sdk/permissions)

### Sessions

여러 교환에 걸쳐 컨텍스트를 유지합니다. Claude는 읽은 파일, 수행한 분석, 대화 기록을 기억합니다. 나중에 세션을 재개하거나, 다른 접근 방식을 탐색하기 위해 세션을 분기할 수도 있습니다.

이 예시는 첫 번째 쿼리에서 세션 ID를 캡처한 후, 전체 컨텍스트를 유지하며 작업을 이어갑니다:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage, ResultMessage


async def main():
    session_id = None

    # First query: capture the session ID
    async for message in query(
        prompt="Read the authentication module",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Glob"]),
    ):
        if isinstance(message, SystemMessage) and message.subtype == "init":
            session_id = message.data["session_id"]

    # Resume with full context from the first query
    async for message in query(
        prompt="Now find all places that call it",  # "it" = auth module
        options=ClaudeAgentOptions(resume=session_id),
    ):
        if isinstance(message, ResultMessage):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

let sessionId: string | undefined;

// First query: capture the session ID
for await (const message of query({
  prompt: "Read the authentication module",
  options: { allowedTools: ["Read", "Glob"] }
})) {
  if (message.type === "system" && message.subtype === "init") {
    sessionId = message.session_id;
  }
}

// Resume with full context from the first query
for await (const message of query({
  prompt: "Now find all places that call it", // "it" = auth module
  options: { resume: sessionId }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

[Sessions에 대해 더 알아보기 →](/agent-sdk/sessions)

### Claude Code 기능

SDK는 Claude Code의 파일시스템 기반 설정도 지원합니다. 이 기능을 사용하려면 옵션에서 `setting_sources=["project"]` (Python) 또는 `settingSources: ['project']` (TypeScript)를 설정하세요.

| 기능 | 설명 | 위치 |
| --- | --- | --- |
| [Skills](/agent-sdk/skills) | Markdown으로 정의된 전문화된 기능 | `.claude/skills/*/SKILL.md` |
| [슬래시 명령](/agent-sdk/slash-commands) | 일반 작업을 위한 커스텀 명령 | `.claude/commands/*.md` |
| [메모리](/agent-sdk/modifying-system-prompts) | 프로젝트 컨텍스트 및 지시사항 | `CLAUDE.md` 또는 `.claude/CLAUDE.md` |
| [플러그인](/agent-sdk/plugins) | 커스텀 명령, 에이전트, MCP 서버 확장 | `plugins` 옵션을 통해 프로그래밍 방식으로 |

## Agent SDK와 다른 Claude 도구 비교

Claude 플랫폼은 Claude로 구축할 수 있는 다양한 방법을 제공합니다. Agent SDK가 어디에 적합한지 살펴보세요:

### Agent SDK vs Client SDK

[Anthropic Client SDK](https://platform.claude.com/docs/en/api/client-sdks)는 직접 API 접근을 제공합니다: 프롬프트를 전송하고 도구 실행을 직접 구현해야 합니다. **Agent SDK**는 내장 도구 실행이 포함된 Claude를 제공합니다.

Client SDK는 도구 루프를 직접 구현해야 하지만, Agent SDK에서는 Claude가 알아서 처리합니다:

::: code-group

```python [Python]
# Client SDK: You implement the tool loop
response = client.messages.create(...)
while response.stop_reason == "tool_use":
    result = your_tool_executor(response.tool_use)
    response = client.messages.create(tool_result=result, **params)

# Agent SDK: Claude handles tools autonomously
async for message in query(prompt="Fix the bug in auth.py"):
    print(message)
```

```typescript [TypeScript]
// Client SDK: You implement the tool loop
let response = await client.messages.create({ ...params });
while (response.stop_reason === "tool_use") {
  const result = yourToolExecutor(response.tool_use);
  response = await client.messages.create({ tool_result: result, ...params });
}

// Agent SDK: Claude handles tools autonomously
for await (const message of query({ prompt: "Fix the bug in auth.py" })) {
  console.log(message);
}
```

:::

### Agent SDK vs Claude Code CLI

동일한 기능을 다른 인터페이스로 제공합니다:

| 사용 사례 | 최적 선택 |
| --- | --- |
| 인터랙티브 개발 | CLI |
| CI/CD 파이프라인 | SDK |
| 커스텀 애플리케이션 | SDK |
| 일회성 작업 | CLI |
| 프로덕션 자동화 | SDK |

많은 팀이 두 가지를 함께 사용합니다: 일상적인 개발에는 CLI, 프로덕션에는 SDK. 워크플로우는 둘 사이에서 직접 변환됩니다.

## 변경 이력

SDK 업데이트, 버그 수정, 새로운 기능에 대한 전체 변경 이력을 확인하세요:

* **TypeScript SDK**: [CHANGELOG.md 보기](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md)
* **Python SDK**: [CHANGELOG.md 보기](https://github.com/anthropics/claude-agent-sdk-python/blob/main/CHANGELOG.md)

## 버그 신고

Agent SDK에서 버그나 문제가 발생한 경우:

* **TypeScript SDK**: [GitHub에 이슈 신고](https://github.com/anthropics/claude-agent-sdk-typescript/issues)
* **Python SDK**: [GitHub에 이슈 신고](https://github.com/anthropics/claude-agent-sdk-python/issues)

## 브랜딩 가이드라인

Claude Agent SDK를 통합하는 파트너의 경우, Claude 브랜딩 사용은 선택 사항입니다. 제품에서 Claude를 언급할 때:

**허용:**

* "Claude Agent" (드롭다운 메뉴에서 선호)
* "Claude" (이미 "Agents"라는 레이블이 붙은 메뉴 내에서)
* "{YourAgentName} Powered by Claude" (기존 에이전트 이름이 있는 경우)

**불허:**

* "Claude Code" 또는 "Claude Code Agent"
* Claude Code를 모방하는 Claude Code 브랜드 ASCII 아트 또는 시각적 요소

귀하의 제품은 자체 브랜딩을 유지해야 하며, Claude Code 또는 Anthropic 제품처럼 보여서는 안 됩니다. 브랜딩 컴플라이언스에 대한 문의는 Anthropic [영업팀](https://www.anthropic.com/contact-sales)에 연락하세요.

## 라이선스 및 약관

Claude Agent SDK 사용은 [Anthropic 상업 서비스 약관](https://www.anthropic.com/legal/commercial-terms)의 적용을 받습니다. 여기에는 고객 및 최종 사용자에게 제공하는 제품 및 서비스를 구동하는 데 사용하는 경우도 포함되며, 특정 컴포넌트나 종속성이 해당 컴포넌트의 LICENSE 파일에 명시된 다른 라이선스의 적용을 받는 경우는 예외입니다.

## 다음 단계

- [빠른 시작](/agent-sdk/quickstart) — 몇 분 안에 버그를 찾고 수정하는 에이전트를 구축하세요
- [에이전트 예시](https://github.com/anthropics/claude-agent-sdk-demos) — 이메일 어시스턴트, 리서치 에이전트 등
- [TypeScript SDK](/agent-sdk/typescript) — 전체 TypeScript API 레퍼런스 및 예시
- [Python SDK](/agent-sdk/python) — 전체 Python API 레퍼런스 및 예시
