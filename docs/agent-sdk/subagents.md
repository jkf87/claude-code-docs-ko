---
title: SDK에서의 서브에이전트
description: 컨텍스트 격리, 병렬 작업 실행, 전문화된 지시 적용을 위해 서브에이전트를 정의하고 호출하는 방법을 설명합니다.
---

# SDK에서의 서브에이전트

서브에이전트는 메인 에이전트가 집중적인 하위 작업을 처리하기 위해 생성하는 별도의 에이전트 인스턴스입니다.
서브에이전트를 활용하면 집중적인 하위 작업의 컨텍스트를 격리하고, 여러 분석을 병렬로 실행하며, 메인 에이전트의 프롬프트를 비대하게 만들지 않으면서 전문화된 지시를 적용할 수 있습니다.

이 가이드는 `agents` 파라미터를 사용하여 SDK에서 서브에이전트를 정의하고 활용하는 방법을 설명합니다.

## 개요

서브에이전트를 생성하는 방법은 세 가지입니다.

* **프로그래밍 방식**: `query()` 옵션에서 `agents` 파라미터 사용 ([TypeScript](/agent-sdk/typescript#agent-definition), [Python](/agent-sdk/python#agent-definition))
* **파일시스템 기반**: `.claude/agents/` 디렉토리에 마크다운 파일로 에이전트 정의 ([서브에이전트를 파일로 정의하기](/sub-agents) 참조)
* **내장 범용 에이전트**: Claude는 별도의 정의 없이도 언제든지 Agent 도구를 통해 내장된 `general-purpose` 서브에이전트를 호출할 수 있습니다.

이 가이드는 SDK 애플리케이션에 권장되는 프로그래밍 방식에 초점을 맞춥니다.

서브에이전트를 정의하면, Claude는 각 서브에이전트의 `description` 필드를 기반으로 언제 호출할지 판단합니다. 서브에이전트를 언제 사용해야 하는지 명확하게 설명하면, Claude가 적절한 작업을 자동으로 위임합니다. 프롬프트에서 서브에이전트 이름을 직접 지정하여 명시적으로 호출하는 것도 가능합니다 (예: "code-reviewer 에이전트를 사용하여...").

## 서브에이전트 사용의 이점

### 컨텍스트 격리

각 서브에이전트는 자체적인 새 대화 안에서 실행됩니다. 중간 도구 호출과 결과는 서브에이전트 내부에 머물며, 최종 메시지만 상위 에이전트로 반환됩니다. 서브에이전트의 컨텍스트에 포함되는 내용은 [서브에이전트가 상속하는 것](#서브에이전트가-상속하는-것) 섹션을 참조하세요.

**예시:** `research-assistant` 서브에이전트가 수십 개의 파일을 탐색하더라도, 그 내용이 메인 대화에 누적되지 않습니다. 상위 에이전트는 서브에이전트가 읽은 모든 파일 내용이 아닌, 간결한 요약만 수신합니다.

### 병렬화

여러 서브에이전트를 동시에 실행하여 복잡한 워크플로를 크게 가속할 수 있습니다.

**예시:** 코드 리뷰 시, `style-checker`, `security-scanner`, `test-coverage` 서브에이전트를 동시에 실행하여 리뷰 시간을 몇 분에서 몇 초로 단축할 수 있습니다.

### 전문화된 지시 및 지식

각 서브에이전트는 특정 전문 지식, 모범 사례, 제약 조건이 담긴 맞춤형 시스템 프롬프트를 가질 수 있습니다.

**예시:** `database-migration` 서브에이전트는 SQL 모범 사례, 롤백 전략, 데이터 무결성 검사에 대한 상세한 지식을 보유할 수 있으며, 이는 메인 에이전트의 지시에는 불필요한 노이즈가 됩니다.

### 도구 제한

서브에이전트의 도구 접근을 특정 도구로 제한하여 의도치 않은 동작의 위험을 줄일 수 있습니다.

**예시:** `doc-reviewer` 서브에이전트는 Read와 Grep 도구만 사용할 수 있도록 제한하여, 문서 파일을 분석하되 실수로 수정하지 않도록 보장할 수 있습니다.

## 서브에이전트 생성

### 프로그래밍 방식 정의 (권장)

`agents` 파라미터를 사용하여 코드에서 직접 서브에이전트를 정의합니다. 아래 예시는 읽기 전용 접근 권한을 가진 코드 리뷰어와 명령을 실행할 수 있는 테스트 러너, 두 개의 서브에이전트를 생성합니다. Claude는 Agent 도구를 통해 서브에이전트를 호출하므로, `allowedTools`에 `Agent` 도구가 반드시 포함되어야 합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


async def main():
    async for message in query(
        prompt="Review the authentication module for security issues",
        options=ClaudeAgentOptions(
            # Agent tool is required for subagent invocation
            allowed_tools=["Read", "Grep", "Glob", "Agent"],
            agents={
                "code-reviewer": AgentDefinition(
                    # description tells Claude when to use this subagent
                    description="Expert code review specialist. Use for quality, security, and maintainability reviews.",
                    # prompt defines the subagent's behavior and expertise
                    prompt="""You are a code review specialist with expertise in security, performance, and best practices.

When reviewing code:
- Identify security vulnerabilities
- Check for performance issues
- Verify adherence to coding standards
- Suggest specific improvements

Be thorough but concise in your feedback.""",
                    # tools restricts what the subagent can do (read-only here)
                    tools=["Read", "Grep", "Glob"],
                    # model overrides the default model for this subagent
                    model="sonnet",
                ),
                "test-runner": AgentDefinition(
                    description="Runs and analyzes test suites. Use for test execution and coverage analysis.",
                    prompt="""You are a test execution specialist. Run tests and provide clear analysis of results.

Focus on:
- Running test commands
- Analyzing test output
- Identifying failing tests
- Suggesting fixes for failures""",
                    # Bash access lets this subagent run test commands
                    tools=["Bash", "Read", "Grep"],
                ),
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
  prompt: "Review the authentication module for security issues",
  options: {
    // Agent tool is required for subagent invocation
    allowedTools: ["Read", "Grep", "Glob", "Agent"],
    agents: {
      "code-reviewer": {
        // description tells Claude when to use this subagent
        description:
          "Expert code review specialist. Use for quality, security, and maintainability reviews.",
        // prompt defines the subagent's behavior and expertise
        prompt: `You are a code review specialist with expertise in security, performance, and best practices.

When reviewing code:
- Identify security vulnerabilities
- Check for performance issues
- Verify adherence to coding standards
- Suggest specific improvements

Be thorough but concise in your feedback.`,
        // tools restricts what the subagent can do (read-only here)
        tools: ["Read", "Grep", "Glob"],
        // model overrides the default model for this subagent
        model: "sonnet"
      },
      "test-runner": {
        description:
          "Runs and analyzes test suites. Use for test execution and coverage analysis.",
        prompt: `You are a test execution specialist. Run tests and provide clear analysis of results.

Focus on:
- Running test commands
- Analyzing test output
- Identifying failing tests
- Suggesting fixes for failures`,
        // Bash access lets this subagent run test commands
        tools: ["Bash", "Read", "Grep"]
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

### AgentDefinition 구성

| 필드          | 타입                                         | 필수 여부 | 설명                                                           |
| :------------ | :------------------------------------------- | :-------- | :------------------------------------------------------------- |
| `description` | `string`                                     | 필수      | 이 에이전트를 언제 사용해야 하는지 자연어로 설명               |
| `prompt`      | `string`                                     | 필수      | 에이전트의 역할과 동작을 정의하는 시스템 프롬프트              |
| `tools`       | `string[]`                                   | 선택      | 허용된 도구 이름 배열. 생략 시 모든 도구 상속                  |
| `model`       | `'sonnet' \| 'opus' \| 'haiku' \| 'inherit'` | 선택      | 이 에이전트의 모델 재정의. 생략 시 메인 모델 사용              |
| `skills`      | `string[]`                                   | 선택      | 이 에이전트가 사용할 수 있는 스킬 이름 목록                    |
| `memory`      | `'user' \| 'project' \| 'local'`             | 선택      | 이 에이전트의 메모리 소스 (Python 전용)                        |
| `mcpServers`  | `(string \| object)[]`                       | 선택      | 이 에이전트에서 사용 가능한 MCP 서버 (이름 또는 인라인 설정)   |

::: info
서브에이전트는 자체 서브에이전트를 생성할 수 없습니다. 서브에이전트의 `tools` 배열에 `Agent`를 포함하지 마세요.
:::

### 파일시스템 기반 정의 (대안)

`.claude/agents/` 디렉토리에 마크다운 파일로 서브에이전트를 정의할 수도 있습니다. 이 방식에 대한 자세한 내용은 [Claude Code 서브에이전트 문서](/sub-agents)를 참조하세요. 프로그래밍 방식으로 정의된 에이전트는 동일한 이름의 파일시스템 기반 에이전트보다 우선합니다.

::: info
커스텀 서브에이전트를 별도로 정의하지 않아도, `allowedTools`에 `Agent`가 포함되어 있으면 Claude는 내장 `general-purpose` 서브에이전트를 생성할 수 있습니다. 이는 전문화된 에이전트를 만들지 않고도 조사나 탐색 작업을 위임할 때 유용합니다.
:::

## 서브에이전트가 상속하는 것

서브에이전트의 컨텍스트 윈도우는 새롭게 시작되지만(상위 대화 없음) 비어 있지는 않습니다. 상위 에이전트에서 서브에이전트로의 유일한 채널은 Agent 도구의 프롬프트 문자열이므로, 서브에이전트가 필요로 하는 파일 경로, 오류 메시지, 결정 사항 등을 해당 프롬프트에 직접 포함해야 합니다.

| 서브에이전트가 받는 것                                                                  | 서브에이전트가 받지 않는 것                             |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| 자체 시스템 프롬프트 (`AgentDefinition.prompt`)와 Agent 도구의 프롬프트                 | 상위 에이전트의 대화 기록 또는 도구 결과                |
| 프로젝트 CLAUDE.md (`settingSources`를 통해 로드됨)                                    | 스킬 (`AgentDefinition.skills`에 명시된 것 제외)        |
| 도구 정의 (상위에서 상속되거나 `tools`에 지정된 하위 집합)                              | 상위 에이전트의 시스템 프롬프트                         |

::: info
상위 에이전트는 서브에이전트의 최종 메시지를 Agent 도구 결과로 그대로 수신하지만, 자체 응답에서 이를 요약할 수 있습니다. 사용자에게 표시되는 응답에서 서브에이전트의 출력을 그대로 유지하려면, **메인** `query()` 호출에 전달하는 프롬프트 또는 `systemPrompt` 옵션에 그렇게 하라는 지시를 포함하세요.
:::

## 서브에이전트 호출

### 자동 호출

Claude는 작업 내용과 각 서브에이전트의 `description`을 기반으로 서브에이전트를 언제 호출할지 자동으로 결정합니다. 예를 들어, "쿼리 튜닝을 위한 성능 최적화 전문가"라는 설명을 가진 `performance-optimizer` 서브에이전트를 정의했다면, 프롬프트에서 쿼리 최적화를 언급할 때 Claude가 이를 호출합니다.

Claude가 올바른 서브에이전트와 작업을 매칭할 수 있도록 명확하고 구체적인 설명을 작성하세요.

### 명시적 호출

특정 서브에이전트를 반드시 사용하게 하려면, 프롬프트에서 이름을 직접 언급하세요.

```text
"Use the code-reviewer agent to check the authentication module"
```

이렇게 하면 자동 매칭을 건너뛰고 지정된 서브에이전트를 직접 호출합니다.

### 동적 에이전트 구성

런타임 조건에 따라 동적으로 에이전트 정의를 생성할 수 있습니다. 아래 예시는 보안 검토 수준에 따라 다른 엄격도를 가진 보안 리뷰어를 생성하며, 엄격 모드에서는 더 강력한 모델을 사용합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


# Factory function that returns an AgentDefinition
# This pattern lets you customize agents based on runtime conditions
def create_security_agent(security_level: str) -> AgentDefinition:
    is_strict = security_level == "strict"
    return AgentDefinition(
        description="Security code reviewer",
        # Customize the prompt based on strictness level
        prompt=f"You are a {'strict' if is_strict else 'balanced'} security reviewer...",
        tools=["Read", "Grep", "Glob"],
        # Key insight: use a more capable model for high-stakes reviews
        model="opus" if is_strict else "sonnet",
    )


async def main():
    # The agent is created at query time, so each request can use different settings
    async for message in query(
        prompt="Review this PR for security issues",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "Agent"],
            agents={
                # Call the factory with your desired configuration
                "security-reviewer": create_security_agent("strict")
            },
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query, type AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

// Factory function that returns an AgentDefinition
// This pattern lets you customize agents based on runtime conditions
function createSecurityAgent(securityLevel: "basic" | "strict"): AgentDefinition {
  const isStrict = securityLevel === "strict";
  return {
    description: "Security code reviewer",
    // Customize the prompt based on strictness level
    prompt: `You are a ${isStrict ? "strict" : "balanced"} security reviewer...`,
    tools: ["Read", "Grep", "Glob"],
    // Key insight: use a more capable model for high-stakes reviews
    model: isStrict ? "opus" : "sonnet"
  };
}

// The agent is created at query time, so each request can use different settings
for await (const message of query({
  prompt: "Review this PR for security issues",
  options: {
    allowedTools: ["Read", "Grep", "Glob", "Agent"],
    agents: {
      // Call the factory with your desired configuration
      "security-reviewer": createSecurityAgent("strict")
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

## 서브에이전트 호출 감지

서브에이전트는 Agent 도구를 통해 호출됩니다. 서브에이전트 호출을 감지하려면, `name`이 `"Agent"`인 `tool_use` 블록을 확인하세요. 서브에이전트의 컨텍스트 내부에서 온 메시지에는 `parent_tool_use_id` 필드가 포함됩니다.

::: info
도구 이름이 Claude Code v2.1.63에서 `"Task"`에서 `"Agent"`로 변경되었습니다. 현재 SDK 릴리스는 `tool_use` 블록에서 `"Agent"`를 내보내지만, `system:init` 도구 목록과 `result.permission_denials[].tool_name`에서는 여전히 `"Task"`를 사용합니다. `block.name`에서 두 값을 모두 확인하면 SDK 버전 간 호환성을 보장할 수 있습니다.
:::

아래 예시는 스트리밍 메시지를 순회하며 서브에이전트가 호출될 때와 이후 메시지가 해당 서브에이전트의 실행 컨텍스트 내에서 발생할 때를 로깅합니다.

::: info
메시지 구조는 SDK마다 다릅니다. Python에서는 `message.content`로 콘텐츠 블록에 직접 접근합니다. TypeScript에서는 `SDKAssistantMessage`가 Claude API 메시지를 감싸므로, `message.message.content`를 통해 콘텐츠에 접근합니다.
:::

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
                    description="Expert code reviewer.",
                    prompt="Analyze code quality and suggest improvements.",
                    tools=["Read", "Glob", "Grep"],
                )
            },
        ),
    ):
        # Check for subagent invocation. Match both names: older SDK
        # versions emitted "Task", current versions emit "Agent".
        if hasattr(message, "content") and message.content:
            for block in message.content:
                if getattr(block, "type", None) == "tool_use" and block.name in (
                    "Task",
                    "Agent",
                ):
                    print(f"Subagent invoked: {block.input.get('subagent_type')}")

        # Check if this message is from within a subagent's context
        if hasattr(message, "parent_tool_use_id") and message.parent_tool_use_id:
            print("  (running inside subagent)")

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
        description: "Expert code reviewer.",
        prompt: "Analyze code quality and suggest improvements.",
        tools: ["Read", "Glob", "Grep"]
      }
    }
  }
})) {
  const msg = message as any;

  // Check for subagent invocation. Match both names: older SDK versions
  // emitted "Task", current versions emit "Agent".
  for (const block of msg.message?.content ?? []) {
    if (block.type === "tool_use" && (block.name === "Task" || block.name === "Agent")) {
      console.log(`Subagent invoked: ${block.input.subagent_type}`);
    }
  }

  // Check if this message is from within a subagent's context
  if (msg.parent_tool_use_id) {
    console.log("  (running inside subagent)");
  }

  if ("result" in message) {
    console.log(message.result);
  }
}
```

:::

## 서브에이전트 재개

서브에이전트는 중단된 지점에서 이어서 계속할 수 있습니다. 재개된 서브에이전트는 이전 모든 도구 호출, 결과, 추론을 포함한 전체 대화 기록을 유지합니다. 서브에이전트는 처음부터 시작하는 것이 아니라 정확히 멈췄던 지점에서 재개됩니다.

서브에이전트가 완료되면, Claude는 Agent 도구 결과에서 해당 에이전트 ID를 받습니다. 서브에이전트를 프로그래밍 방식으로 재개하려면:

1. **세션 ID 캡처**: 첫 번째 쿼리 중 메시지에서 `session_id` 추출
2. **에이전트 ID 추출**: 메시지 콘텐츠에서 `agentId` 파싱
3. **세션 재개**: 두 번째 쿼리 옵션에 `resume: sessionId`를 전달하고, 프롬프트에 에이전트 ID 포함

::: info
서브에이전트의 트랜스크립트에 접근하려면 동일한 세션을 재개해야 합니다. 각 `query()` 호출은 기본적으로 새 세션을 시작하므로, 동일한 세션을 계속 사용하려면 `resume: sessionId`를 전달해야 합니다.

커스텀 에이전트(내장 에이전트가 아닌 경우)를 사용한다면, 두 쿼리 모두에서 `agents` 파라미터에 동일한 에이전트 정의를 전달해야 합니다.
:::

아래 예시는 이 흐름을 보여줍니다. 첫 번째 쿼리에서 서브에이전트를 실행하고 세션 ID와 에이전트 ID를 캡처한 후, 두 번째 쿼리에서 세션을 재개하여 첫 번째 분석의 컨텍스트가 필요한 후속 질문을 합니다.

::: code-group

```typescript [TypeScript]
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

// Helper to extract agentId from message content
// Stringify to avoid traversing different block types (TextBlock, ToolResultBlock, etc.)
function extractAgentId(message: SDKMessage): string | undefined {
  if (!("message" in message)) return undefined;
  // Stringify the content so we can search it without traversing nested blocks
  const content = JSON.stringify(message.message.content);
  const match = content.match(/agentId:\s*([a-f0-9-]+)/);
  return match?.[1];
}

let agentId: string | undefined;
let sessionId: string | undefined;

// First invocation - use the Explore agent to find API endpoints
for await (const message of query({
  prompt: "Use the Explore agent to find all API endpoints in this codebase",
  options: { allowedTools: ["Read", "Grep", "Glob", "Agent"] }
})) {
  // Capture session_id from ResultMessage (needed to resume this session)
  if ("session_id" in message) sessionId = message.session_id;
  // Search message content for the agentId (appears in Agent tool results)
  const extractedId = extractAgentId(message);
  if (extractedId) agentId = extractedId;
  // Print the final result
  if ("result" in message) console.log(message.result);
}

// Second invocation - resume and ask follow-up
if (agentId && sessionId) {
  for await (const message of query({
    prompt: `Resume agent ${agentId} and list the top 3 most complex endpoints`,
    options: { allowedTools: ["Read", "Grep", "Glob", "Agent"], resume: sessionId }
  })) {
    if ("result" in message) console.log(message.result);
  }
}
```

```python [Python]
import asyncio
import json
import re
from claude_agent_sdk import query, ClaudeAgentOptions


def extract_agent_id(text: str) -> str | None:
    """Extract agentId from Agent tool result text."""
    match = re.search(r"agentId:\s*([a-f0-9-]+)", text)
    return match.group(1) if match else None


async def main():
    agent_id = None
    session_id = None

    # First invocation - use the Explore agent to find API endpoints
    async for message in query(
        prompt="Use the Explore agent to find all API endpoints in this codebase",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Grep", "Glob", "Agent"]),
    ):
        # Capture session_id from ResultMessage (needed to resume this session)
        if hasattr(message, "session_id"):
            session_id = message.session_id
        # Search message content for the agentId (appears in Agent tool results)
        if hasattr(message, "content"):
            # Stringify the content so we can search it without traversing nested blocks
            content_str = json.dumps(message.content, default=str)
            extracted = extract_agent_id(content_str)
            if extracted:
                agent_id = extracted
        # Print the final result
        if hasattr(message, "result"):
            print(message.result)

    # Second invocation - resume and ask follow-up
    if agent_id and session_id:
        async for message in query(
            prompt=f"Resume agent {agent_id} and list the top 3 most complex endpoints",
            options=ClaudeAgentOptions(
                allowed_tools=["Read", "Grep", "Glob", "Agent"], resume=session_id
            ),
        ):
            if hasattr(message, "result"):
                print(message.result)


asyncio.run(main())
```

:::

서브에이전트 트랜스크립트는 메인 대화와 독립적으로 유지됩니다.

* **메인 대화 컴팩션**: 메인 대화가 컴팩션될 때 서브에이전트 트랜스크립트는 영향받지 않습니다. 별도의 파일에 저장됩니다.
* **세션 지속성**: 서브에이전트 트랜스크립트는 해당 세션 내에서 지속됩니다. Claude Code를 재시작한 후에도 동일한 세션을 재개하면 서브에이전트를 다시 시작할 수 있습니다.
* **자동 정리**: 트랜스크립트는 `cleanupPeriodDays` 설정(기본값: 30일)에 따라 정리됩니다.

## 도구 제한

서브에이전트의 도구 접근은 `tools` 필드를 통해 제한할 수 있습니다.

* **필드 생략**: 에이전트가 사용 가능한 모든 도구를 상속합니다 (기본값)
* **도구 지정**: 에이전트는 나열된 도구만 사용할 수 있습니다.

아래 예시는 코드를 검사할 수 있지만 파일을 수정하거나 명령을 실행할 수 없는 읽기 전용 분석 에이전트를 생성합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


async def main():
    async for message in query(
        prompt="Analyze the architecture of this codebase",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "Agent"],
            agents={
                "code-analyzer": AgentDefinition(
                    description="Static code analysis and architecture review",
                    prompt="""You are a code architecture analyst. Analyze code structure,
identify patterns, and suggest improvements without making changes.""",
                    # Read-only tools: no Edit, Write, or Bash access
                    tools=["Read", "Grep", "Glob"],
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
  prompt: "Analyze the architecture of this codebase",
  options: {
    allowedTools: ["Read", "Grep", "Glob", "Agent"],
    agents: {
      "code-analyzer": {
        description: "Static code analysis and architecture review",
        prompt: `You are a code architecture analyst. Analyze code structure,
identify patterns, and suggest improvements without making changes.`,
        // Read-only tools: no Edit, Write, or Bash access
        tools: ["Read", "Grep", "Glob"]
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

:::

### 일반적인 도구 조합

| 사용 사례       | 도구                                    | 설명                                               |
| :-------------- | :-------------------------------------- | :------------------------------------------------- |
| 읽기 전용 분석  | `Read`, `Grep`, `Glob`                  | 코드를 검사하되 수정하거나 실행하지 않음           |
| 테스트 실행     | `Bash`, `Read`, `Grep`                  | 명령을 실행하고 출력을 분석할 수 있음              |
| 코드 수정       | `Read`, `Edit`, `Write`, `Grep`, `Glob` | 명령 실행 없이 완전한 읽기/쓰기 접근               |
| 전체 접근       | 모든 도구                               | 상위 에이전트의 모든 도구 상속 (`tools` 필드 생략) |

## 문제 해결

### Claude가 서브에이전트에 위임하지 않는 경우

Claude가 서브에이전트에 위임하는 대신 직접 작업을 완료한다면:

1. **Agent 도구 포함**: 서브에이전트는 Agent 도구를 통해 호출되므로, `allowedTools`에 반드시 포함되어야 합니다.
2. **명시적 프롬프팅 사용**: 프롬프트에서 서브에이전트를 이름으로 언급하세요 (예: "code-reviewer 에이전트를 사용하여...").
3. **명확한 설명 작성**: Claude가 적절한 작업과 서브에이전트를 매칭할 수 있도록 언제 사용해야 하는지 정확하게 설명하세요.

### 파일시스템 기반 에이전트가 로드되지 않는 경우

`.claude/agents/`에 정의된 에이전트는 시작 시에만 로드됩니다. Claude Code가 실행 중인 상태에서 새 에이전트 파일을 생성했다면, 세션을 재시작하여 로드하세요.

### Windows: 긴 프롬프트 실패

Windows에서는 매우 긴 프롬프트를 가진 서브에이전트가 명령줄 길이 제한(8191자)으로 인해 실패할 수 있습니다. 프롬프트를 간결하게 유지하거나, 복잡한 지시에는 파일시스템 기반 에이전트를 사용하세요.

## 관련 문서

* [Claude Code 서브에이전트](/sub-agents): 파일시스템 기반 정의를 포함한 서브에이전트 전체 문서
* [SDK 개요](/agent-sdk/overview): Claude Agent SDK 시작하기
