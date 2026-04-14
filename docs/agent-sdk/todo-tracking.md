---
title: Todo 목록
description: Claude Agent SDK를 사용하여 체계적인 작업 관리를 위한 Todo 추적 및 표시
---

# Todo 목록

> Claude Agent SDK를 사용하여 Todo를 추적하고 표시하여 체계적인 작업 관리를 구현합니다.

Todo 추적은 작업을 체계적으로 관리하고 사용자에게 진행 상황을 표시하는 구조화된 방법을 제공합니다. Claude Agent SDK에는 복잡한 워크플로우를 정리하고 작업 진행 상황을 사용자에게 지속적으로 알려주는 내장 Todo 기능이 포함되어 있습니다.

### Todo 생명 주기

Todo는 예측 가능한 생명 주기를 따릅니다.

1. 작업이 식별되면 `pending` 상태로 **생성**됨
2. 작업이 시작되면 `in_progress` 상태로 **활성화**됨
3. 작업이 성공적으로 완료되면 **완료**됨
4. 그룹 내 모든 작업이 완료되면 **제거**됨

### Todo가 사용되는 경우

SDK는 다음과 같은 상황에서 자동으로 Todo를 생성합니다.

* 3개 이상의 별도 작업이 필요한 **복잡한 다단계 작업**
* 여러 항목이 언급된 경우의 **사용자가 제공한 작업 목록**
* 진행 상황 추적이 유용한 **중요한 작업**
* 사용자가 Todo 정리를 요청하는 **명시적 요청**

## 예시

### Todo 변경 사항 모니터링

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Optimize my React app performance and track progress with todos",
  options: { maxTurns: 15 }
})) {
  // Todo 업데이트는 메시지 스트림에 반영됩니다
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "tool_use" && block.name === "TodoWrite") {
        const todos = block.input.todos;

        console.log("Todo Status Update:");
        todos.forEach((todo, index) => {
          const status =
            todo.status === "completed" ? "✅" : todo.status === "in_progress" ? "🔧" : "❌";
          console.log(`${index + 1}. ${status} ${todo.content}`);
        });
      }
    }
  }
}
```

```python [Python]
from claude_agent_sdk import query, AssistantMessage, ToolUseBlock

async for message in query(
    prompt="Optimize my React app performance and track progress with todos",
    options={"max_turns": 15},
):
    # Todo 업데이트는 메시지 스트림에 반영됩니다
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, ToolUseBlock) and block.name == "TodoWrite":
                todos = block.input["todos"]

                print("Todo Status Update:")
                for i, todo in enumerate(todos):
                    status = (
                        "✅"
                        if todo["status"] == "completed"
                        else "🔧"
                        if todo["status"] == "in_progress"
                        else "❌"
                    )
                    print(f"{i + 1}. {status} {todo['content']}")
```

:::

### 실시간 진행 상황 표시

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

class TodoTracker {
  private todos: any[] = [];

  displayProgress() {
    if (this.todos.length === 0) return;

    const completed = this.todos.filter((t) => t.status === "completed").length;
    const inProgress = this.todos.filter((t) => t.status === "in_progress").length;
    const total = this.todos.length;

    console.log(`\nProgress: ${completed}/${total} completed`);
    console.log(`Currently working on: ${inProgress} task(s)\n`);

    this.todos.forEach((todo, index) => {
      const icon =
        todo.status === "completed" ? "✅" : todo.status === "in_progress" ? "🔧" : "❌";
      const text = todo.status === "in_progress" ? todo.activeForm : todo.content;
      console.log(`${index + 1}. ${icon} ${text}`);
    });
  }

  async trackQuery(prompt: string) {
    for await (const message of query({
      prompt,
      options: { maxTurns: 20 }
    })) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "tool_use" && block.name === "TodoWrite") {
            this.todos = block.input.todos;
            this.displayProgress();
          }
        }
      }
    }
  }
}

// 사용 예시
const tracker = new TodoTracker();
await tracker.trackQuery("Build a complete authentication system with todos");
```

```python [Python]
from claude_agent_sdk import query, AssistantMessage, ToolUseBlock
from typing import List, Dict


class TodoTracker:
    def __init__(self):
        self.todos: List[Dict] = []

    def display_progress(self):
        if not self.todos:
            return

        completed = len([t for t in self.todos if t["status"] == "completed"])
        in_progress = len([t for t in self.todos if t["status"] == "in_progress"])
        total = len(self.todos)

        print(f"\nProgress: {completed}/{total} completed")
        print(f"Currently working on: {in_progress} task(s)\n")

        for i, todo in enumerate(self.todos):
            icon = (
                "✅"
                if todo["status"] == "completed"
                else "🔧"
                if todo["status"] == "in_progress"
                else "❌"
            )
            text = (
                todo["activeForm"]
                if todo["status"] == "in_progress"
                else todo["content"]
            )
            print(f"{i + 1}. {icon} {text}")

    async def track_query(self, prompt: str):
        async for message in query(prompt=prompt, options={"max_turns": 20}):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, ToolUseBlock) and block.name == "TodoWrite":
                        self.todos = block.input["todos"]
                        self.display_progress()


# 사용 예시
tracker = TodoTracker()
await tracker.track_query("Build a complete authentication system with todos")
```

:::

## 관련 문서

* [TypeScript SDK 레퍼런스](/agent-sdk/typescript)
* [Python SDK 레퍼런스](/agent-sdk/python)
* [스트리밍 vs 단일 모드](/agent-sdk/streaming-vs-single-mode)
* [커스텀 도구](/agent-sdk/custom-tools)
