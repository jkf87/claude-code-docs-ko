---
title: 실시간 응답 스트리밍
description: Agent SDK에서 텍스트와 도구 호출이 생성되는 즉시 실시간으로 수신하는 방법
---

# 실시간 응답 스트리밍

Agent SDK에서 텍스트와 도구 호출이 생성되는 즉시 실시간으로 수신하세요.

기본적으로 Agent SDK는 Claude가 각 응답 생성을 완료한 후에 전체 `AssistantMessage` 객체를 반환합니다. 텍스트와 도구 호출이 생성되는 과정에서 증분 업데이트를 받으려면, 옵션에서 `include_partial_messages`(Python) 또는 `includePartialMessages`(TypeScript)를 `true`로 설정하여 부분 메시지 스트리밍을 활성화하세요.

::: tip
이 페이지는 출력 스트리밍(실시간으로 토큰 수신)을 다룹니다. 입력 모드(메시지 전송 방법)에 대해서는 [에이전트에 메시지 보내기](/agent-sdk/streaming-vs-single-mode)를 참조하세요. 또한 [CLI를 통해 Agent SDK로 응답을 스트리밍](/headless)할 수도 있습니다.
:::

## 스트리밍 출력 활성화

스트리밍을 활성화하려면 옵션에서 `include_partial_messages`(Python) 또는 `includePartialMessages`(TypeScript)를 `true`로 설정하세요. 이렇게 하면 SDK가 도착하는 원시 API 이벤트를 담은 `StreamEvent` 메시지를 기존의 `AssistantMessage`, `ResultMessage`와 함께 반환합니다.

그러면 코드에서 다음을 처리해야 합니다:

1. 각 메시지의 타입을 확인하여 `StreamEvent`와 다른 메시지 타입을 구별
2. `StreamEvent`의 경우 `event` 필드를 추출하고 `type` 확인
3. `delta.type`이 `text_delta`인 `content_block_delta` 이벤트에서 실제 텍스트 청크 추출

아래 예제는 스트리밍을 활성화하고 텍스트 청크가 도착하는 즉시 출력합니다. 중첩된 타입 검사에 주목하세요: 먼저 `StreamEvent`, 그 다음 `content_block_delta`, 마지막으로 `text_delta` 순서입니다:

::: code-group

```python [Python]
from claude_agent_sdk import query, ClaudeAgentOptions
from claude_agent_sdk.types import StreamEvent
import asyncio


async def stream_response():
    options = ClaudeAgentOptions(
        include_partial_messages=True,
        allowed_tools=["Bash", "Read"],
    )

    async for message in query(prompt="List the files in my project", options=options):
        if isinstance(message, StreamEvent):
            event = message.event
            if event.get("type") == "content_block_delta":
                delta = event.get("delta", {})
                if delta.get("type") == "text_delta":
                    print(delta.get("text", ""), end="", flush=True)


asyncio.run(stream_response())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "List the files in my project",
  options: {
    includePartialMessages: true,
    allowedTools: ["Bash", "Read"]
  }
})) {
  if (message.type === "stream_event") {
    const event = message.event;
    if (event.type === "content_block_delta") {
      if (event.delta.type === "text_delta") {
        process.stdout.write(event.delta.text);
      }
    }
  }
}
```

:::

## StreamEvent 레퍼런스

부분 메시지가 활성화되면 원시 Claude API 스트리밍 이벤트가 객체에 래핑되어 수신됩니다. 타입의 이름은 각 SDK에서 다릅니다:

- **Python**: `StreamEvent` (`claude_agent_sdk.types`에서 임포트)
- **TypeScript**: `type: 'stream_event'`를 가진 `SDKPartialAssistantMessage`

둘 다 누적된 텍스트가 아닌 원시 Claude API 이벤트를 포함합니다. 텍스트 델타를 직접 추출하고 누적해야 합니다. 각 타입의 구조는 다음과 같습니다:

::: code-group

```python [Python]
@dataclass
class StreamEvent:
    uuid: str  # 이 이벤트의 고유 식별자
    session_id: str  # 세션 식별자
    event: dict[str, Any]  # 원시 Claude API 스트림 이벤트
    parent_tool_use_id: str | None  # 서브에이전트에서 온 경우 상위 도구 ID
```

```typescript [TypeScript]
type SDKPartialAssistantMessage = {
  type: "stream_event";
  event: RawMessageStreamEvent; // Anthropic SDK에서
  parent_tool_use_id: string | null;
  uuid: UUID;
  session_id: string;
};
```

:::

`event` 필드는 [Claude API](https://platform.claude.com/docs/en/build-with-claude/streaming#event-types)의 원시 스트리밍 이벤트를 포함합니다. 주요 이벤트 타입은 다음과 같습니다:

| 이벤트 타입            | 설명                                              |
| :-------------------- | :------------------------------------------------ |
| `message_start`       | 새 메시지 시작                                     |
| `content_block_start` | 새 콘텐츠 블록 시작 (텍스트 또는 도구 사용)          |
| `content_block_delta` | 콘텐츠 증분 업데이트                               |
| `content_block_stop`  | 콘텐츠 블록 종료                                   |
| `message_delta`       | 메시지 수준 업데이트 (중단 이유, 사용량)             |
| `message_stop`        | 메시지 종료                                        |

## 메시지 흐름

부분 메시지가 활성화되면 다음 순서로 메시지를 수신합니다:

```text
StreamEvent (message_start)
StreamEvent (content_block_start) - 텍스트 블록
StreamEvent (content_block_delta) - 텍스트 청크...
StreamEvent (content_block_stop)
StreamEvent (content_block_start) - tool_use 블록
StreamEvent (content_block_delta) - 도구 입력 청크...
StreamEvent (content_block_stop)
StreamEvent (message_delta)
StreamEvent (message_stop)
AssistantMessage - 모든 콘텐츠가 포함된 완전한 메시지
... 도구 실행 ...
... 다음 턴을 위한 추가 스트리밍 이벤트 ...
ResultMessage - 최종 결과
```

부분 메시지가 비활성화된 경우(Python에서 `include_partial_messages`, TypeScript에서 `includePartialMessages`), `StreamEvent`를 제외한 모든 메시지 타입을 수신합니다. 주요 타입으로는 `SystemMessage`(세션 초기화), `AssistantMessage`(완전한 응답), `ResultMessage`(최종 결과), 그리고 대화 기록이 압축되었을 때를 나타내는 경계 메시지(TypeScript에서 `SDKCompactBoundaryMessage`; Python에서 서브타입이 `"compact_boundary"`인 `SystemMessage`)가 있습니다.

## 텍스트 응답 스트리밍

생성 중인 텍스트를 표시하려면 `delta.type`이 `text_delta`인 `content_block_delta` 이벤트를 찾으세요. 이 이벤트들은 증분 텍스트 청크를 포함합니다. 아래 예제는 각 청크가 도착하는 즉시 출력합니다:

::: code-group

```python [Python]
from claude_agent_sdk import query, ClaudeAgentOptions
from claude_agent_sdk.types import StreamEvent
import asyncio


async def stream_text():
    options = ClaudeAgentOptions(include_partial_messages=True)

    async for message in query(prompt="Explain how databases work", options=options):
        if isinstance(message, StreamEvent):
            event = message.event
            if event.get("type") == "content_block_delta":
                delta = event.get("delta", {})
                if delta.get("type") == "text_delta":
                    # 각 텍스트 청크가 도착하는 즉시 출력
                    print(delta.get("text", ""), end="", flush=True)

    print()  # 마지막 줄바꿈


asyncio.run(stream_text())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Explain how databases work",
  options: { includePartialMessages: true }
})) {
  if (message.type === "stream_event") {
    const event = message.event;
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      process.stdout.write(event.delta.text);
    }
  }
}

console.log(); // 마지막 줄바꿈
```

:::

## 도구 호출 스트리밍

도구 호출도 증분으로 스트리밍됩니다. 도구가 시작될 때, 입력이 생성되는 과정, 완료될 때를 추적할 수 있습니다. 아래 예제는 현재 호출 중인 도구를 추적하고 JSON 입력이 스트리밍되는 동안 누적합니다. 세 가지 이벤트 타입을 사용합니다:

- `content_block_start`: 도구 시작
- `input_json_delta`가 있는 `content_block_delta`: 입력 청크 도착
- `content_block_stop`: 도구 호출 완료

::: code-group

```python [Python]
from claude_agent_sdk import query, ClaudeAgentOptions
from claude_agent_sdk.types import StreamEvent
import asyncio


async def stream_tool_calls():
    options = ClaudeAgentOptions(
        include_partial_messages=True,
        allowed_tools=["Read", "Bash"],
    )

    # 현재 도구를 추적하고 JSON 입력을 누적
    current_tool = None
    tool_input = ""

    async for message in query(prompt="Read the README.md file", options=options):
        if isinstance(message, StreamEvent):
            event = message.event
            event_type = event.get("type")

            if event_type == "content_block_start":
                # 새 도구 호출이 시작됨
                content_block = event.get("content_block", {})
                if content_block.get("type") == "tool_use":
                    current_tool = content_block.get("name")
                    tool_input = ""
                    print(f"Starting tool: {current_tool}")

            elif event_type == "content_block_delta":
                delta = event.get("delta", {})
                if delta.get("type") == "input_json_delta":
                    # JSON 입력이 스트리밍되는 동안 누적
                    chunk = delta.get("partial_json", "")
                    tool_input += chunk
                    print(f"  Input chunk: {chunk}")

            elif event_type == "content_block_stop":
                # 도구 호출 완료 - 최종 입력 표시
                if current_tool:
                    print(f"Tool {current_tool} called with: {tool_input}")
                    current_tool = None


asyncio.run(stream_tool_calls())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// 현재 도구를 추적하고 JSON 입력을 누적
let currentTool: string | null = null;
let toolInput = "";

for await (const message of query({
  prompt: "Read the README.md file",
  options: {
    includePartialMessages: true,
    allowedTools: ["Read", "Bash"]
  }
})) {
  if (message.type === "stream_event") {
    const event = message.event;

    if (event.type === "content_block_start") {
      // 새 도구 호출이 시작됨
      if (event.content_block.type === "tool_use") {
        currentTool = event.content_block.name;
        toolInput = "";
        console.log(`Starting tool: ${currentTool}`);
      }
    } else if (event.type === "content_block_delta") {
      if (event.delta.type === "input_json_delta") {
        // JSON 입력이 스트리밍되는 동안 누적
        const chunk = event.delta.partial_json;
        toolInput += chunk;
        console.log(`  Input chunk: ${chunk}`);
      }
    } else if (event.type === "content_block_stop") {
      // 도구 호출 완료 - 최종 입력 표시
      if (currentTool) {
        console.log(`Tool ${currentTool} called with: ${toolInput}`);
        currentTool = null;
      }
    }
  }
}
```

:::

## 스트리밍 UI 구축

이 예제는 텍스트와 도구 스트리밍을 통합된 UI로 결합합니다. 도구가 실행 중일 때 `[Using Read...]`와 같은 상태 표시기를 보여주기 위해 에이전트가 현재 도구를 실행 중인지 추적하는 `in_tool` 플래그를 사용합니다. 도구가 아닌 경우에는 텍스트가 정상적으로 스트리밍되고, 도구 완료 시 "done" 메시지가 출력됩니다. 이 패턴은 다단계 에이전트 작업 중 진행 상황을 표시해야 하는 채팅 인터페이스에 유용합니다.

::: code-group

```python [Python]
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
from claude_agent_sdk.types import StreamEvent
import asyncio
import sys


async def streaming_ui():
    options = ClaudeAgentOptions(
        include_partial_messages=True,
        allowed_tools=["Read", "Bash", "Grep"],
    )

    # 현재 도구 호출 중인지 추적
    in_tool = False

    async for message in query(
        prompt="Find all TODO comments in the codebase", options=options
    ):
        if isinstance(message, StreamEvent):
            event = message.event
            event_type = event.get("type")

            if event_type == "content_block_start":
                content_block = event.get("content_block", {})
                if content_block.get("type") == "tool_use":
                    # 도구 호출 시작 - 상태 표시기 표시
                    tool_name = content_block.get("name")
                    print(f"\n[Using {tool_name}...]", end="", flush=True)
                    in_tool = True

            elif event_type == "content_block_delta":
                delta = event.get("delta", {})
                # 도구 실행 중이 아닐 때만 텍스트 스트리밍
                if delta.get("type") == "text_delta" and not in_tool:
                    sys.stdout.write(delta.get("text", ""))
                    sys.stdout.flush()

            elif event_type == "content_block_stop":
                if in_tool:
                    # 도구 호출 완료
                    print(" done", flush=True)
                    in_tool = False

        elif isinstance(message, ResultMessage):
            # 에이전트가 모든 작업 완료
            print(f"\n\n--- Complete ---")


asyncio.run(streaming_ui())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// 현재 도구 호출 중인지 추적
let inTool = false;

for await (const message of query({
  prompt: "Find all TODO comments in the codebase",
  options: {
    includePartialMessages: true,
    allowedTools: ["Read", "Bash", "Grep"]
  }
})) {
  if (message.type === "stream_event") {
    const event = message.event;

    if (event.type === "content_block_start") {
      if (event.content_block.type === "tool_use") {
        // 도구 호출 시작 - 상태 표시기 표시
        process.stdout.write(`\n[Using ${event.content_block.name}...]`);
        inTool = true;
      }
    } else if (event.type === "content_block_delta") {
      // 도구 실행 중이 아닐 때만 텍스트 스트리밍
      if (event.delta.type === "text_delta" && !inTool) {
        process.stdout.write(event.delta.text);
      }
    } else if (event.type === "content_block_stop") {
      if (inTool) {
        // 도구 호출 완료
        console.log(" done");
        inTool = false;
      }
    }
  } else if (message.type === "result") {
    // 에이전트가 모든 작업 완료
    console.log("\n\n--- Complete ---");
  }
}
```

:::

## 알려진 제한 사항

일부 SDK 기능은 스트리밍과 호환되지 않습니다:

- **확장 사고(Extended thinking)**: `max_thinking_tokens`(Python) 또는 `maxThinkingTokens`(TypeScript)를 명시적으로 설정하면 `StreamEvent` 메시지가 전송되지 않습니다. 각 턴 이후 완전한 메시지만 수신됩니다. 사고 기능은 SDK에서 기본적으로 비활성화되어 있으므로, 이를 활성화하지 않으면 스트리밍이 정상 동작합니다.
- **구조화된 출력(Structured output)**: JSON 결과는 스트리밍 델타가 아닌 최종 `ResultMessage.structured_output`에만 표시됩니다. 자세한 내용은 [구조화된 출력](/agent-sdk/structured-outputs)을 참조하세요.

## 다음 단계

텍스트와 도구 호출을 실시간으로 스트리밍하는 방법을 익혔으니, 다음 관련 주제를 탐색해 보세요:

- [대화형 vs 단일 쿼리](/agent-sdk/streaming-vs-single-mode): 사용 사례에 맞는 입력 모드 선택
- [구조화된 출력](/agent-sdk/structured-outputs): 에이전트에서 타입이 지정된 JSON 응답 받기
- [권한](/agent-sdk/permissions): 에이전트가 사용할 수 있는 도구 제어
