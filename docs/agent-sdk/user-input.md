---
title: 승인 및 사용자 입력 처리
description: Claude의 승인 요청과 명확화 질문을 사용자에게 표시하고, 사용자의 결정을 SDK에 반환하는 방법을 설명합니다.
---

# 승인 및 사용자 입력 처리

작업을 수행하는 동안 Claude는 때때로 사용자에게 확인이 필요합니다. 파일을 삭제하기 전에 권한이 필요하거나, 새 프로젝트에 사용할 데이터베이스를 물어봐야 할 수 있습니다. 애플리케이션은 이러한 요청을 사용자에게 표시하여 Claude가 사용자의 입력으로 계속 진행할 수 있도록 해야 합니다.

Claude는 두 가지 상황에서 사용자 입력을 요청합니다: **도구 사용 권한**이 필요할 때 (예: 파일 삭제 또는 명령 실행)와 **명확화 질문**이 있을 때 (`AskUserQuestion` 도구를 통해). 두 경우 모두 `canUseTool` 콜백을 트리거하며, 응답을 반환할 때까지 실행이 일시 중지됩니다. 이는 Claude가 작업을 완료하고 다음 메시지를 기다리는 일반적인 대화 턴과는 다릅니다.

명확화 질문의 경우 Claude가 질문과 옵션을 생성합니다. 여러분의 역할은 이를 사용자에게 표시하고 선택을 반환하는 것입니다. 이 흐름에 자체 질문을 추가할 수는 없습니다. 사용자에게 직접 무언가를 물어봐야 한다면 애플리케이션 로직에서 별도로 처리하세요.

이 가이드는 각 유형의 요청을 감지하고 적절하게 응답하는 방법을 보여줍니다.

## Claude가 입력을 필요로 하는 시점 감지

쿼리 옵션에 `canUseTool` 콜백을 전달합니다. 콜백은 Claude가 사용자 입력을 필요로 할 때마다 발생하며, 도구 이름과 입력을 인수로 받습니다:

::: code-group
```python [Python]
async def handle_tool_request(tool_name, input_data, context):
    # 사용자에게 프롬프트를 표시하고 허용 또는 거부를 반환
    ...


options = ClaudeAgentOptions(can_use_tool=handle_tool_request)
```

```typescript [TypeScript]
async function handleToolRequest(toolName, input, options) {
  // options에는 { signal: AbortSignal, suggestions?: PermissionUpdate[] }가 포함됨
  // 사용자에게 프롬프트를 표시하고 허용 또는 거부를 반환
}

const options = { canUseTool: handleToolRequest };
```
:::

콜백은 두 가지 경우에 발생합니다:

1. **도구에 승인이 필요**: Claude가 [권한 규칙](/agent-sdk/permissions)이나 모드에 의해 자동 승인되지 않은 도구를 사용하려 합니다. `tool_name`에서 도구를 확인합니다 (예: `"Bash"`, `"Write"`).
2. **Claude가 질문**: Claude가 `AskUserQuestion` 도구를 호출합니다. `tool_name == "AskUserQuestion"`인지 확인하여 다르게 처리합니다. `tools` 배열을 지정하는 경우 이것이 작동하려면 `AskUserQuestion`을 포함해야 합니다. 자세한 내용은 [명확화 질문 처리](#명확화-질문-처리)를 참조하세요.

::: info
사용자에게 프롬프트를 표시하지 않고 도구를 자동으로 허용하거나 거부하려면 대신 [hooks](/agent-sdk/hooks)를 사용하세요. Hooks는 `canUseTool` 전에 실행되며 자체 로직에 따라 요청을 허용, 거부 또는 수정할 수 있습니다. [`PermissionRequest` hook](/agent-sdk/hooks#available-hooks)을 사용하여 Claude가 승인을 기다리고 있을 때 외부 알림 (Slack, 이메일, 푸시)을 보낼 수도 있습니다.
:::

## 도구 승인 요청 처리

쿼리 옵션에 `canUseTool` 콜백을 전달하면 Claude가 자동 승인되지 않은 도구를 사용하려 할 때 콜백이 발생합니다. 콜백은 세 가지 인수를 받습니다:

| 인수 | 설명 |
| --- | --- |
| `toolName` | Claude가 사용하려는 도구의 이름 (예: `"Bash"`, `"Write"`, `"Edit"`) |
| `input` | Claude가 도구에 전달하는 매개변수. 내용은 도구에 따라 다릅니다. |
| `options` (TS) / `context` (Python) | 선택적 `suggestions` (재프롬프트를 방지하기 위한 제안된 `PermissionUpdate` 항목)와 취소 신호를 포함한 추가 컨텍스트. TypeScript에서 `signal`은 `AbortSignal`이고, Python에서 signal 필드는 향후 사용을 위해 예약되어 있습니다. Python은 [`ToolPermissionContext`](/agent-sdk/python#tool-permission-context)를 참조하세요. |

`input` 객체에는 도구별 매개변수가 포함됩니다. 일반적인 예:

| 도구 | 입력 필드 |
| --- | --- |
| `Bash` | `command`, `description`, `timeout` |
| `Write` | `file_path`, `content` |
| `Edit` | `file_path`, `old_string`, `new_string` |
| `Read` | `file_path`, `offset`, `limit` |

전체 입력 스키마는 SDK 레퍼런스를 참조하세요: [Python](/agent-sdk/python#tool-input-output-types) | [TypeScript](/agent-sdk/typescript#tool-input-types).

이 정보를 사용자에게 표시하여 작업을 허용할지 거부할지 결정할 수 있도록 한 다음 적절한 응답을 반환합니다.

다음 예제는 Claude에게 테스트 파일을 생성하고 삭제하도록 요청합니다. Claude가 각 작업을 시도할 때 콜백은 도구 요청을 터미널에 출력하고 y/n 승인을 요청합니다.

::: code-group
```python [Python]
import asyncio

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
from claude_agent_sdk.types import (
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)


async def can_use_tool(
    tool_name: str, input_data: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    # 도구 요청 표시
    print(f"\nTool: {tool_name}")
    if tool_name == "Bash":
        print(f"Command: {input_data.get('command')}")
        if input_data.get("description"):
            print(f"Description: {input_data.get('description')}")
    else:
        print(f"Input: {input_data}")

    # 사용자 승인 받기
    response = input("Allow this action? (y/n): ")

    # 사용자 응답에 따라 허용 또는 거부 반환
    if response.lower() == "y":
        # 허용: 도구가 원래(또는 수정된) 입력으로 실행됨
        return PermissionResultAllow(updated_input=input_data)
    else:
        # 거부: 도구가 실행되지 않으며 Claude가 메시지를 봄
        return PermissionResultDeny(message="User denied this action")


# 필수 우회방법: 더미 hook이 can_use_tool을 위해 스트림을 열어둠
async def dummy_hook(input_data, tool_use_id, context):
    return {"continue_": True}


async def prompt_stream():
    yield {
        "type": "user",
        "message": {
            "role": "user",
            "content": "Create a test file in /tmp and then delete it",
        },
    }


async def main():
    async for message in query(
        prompt=prompt_stream(),
        options=ClaudeAgentOptions(
            can_use_tool=can_use_tool,
            hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
        ),
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as readline from "readline";

// 터미널에서 사용자 입력을 받기 위한 헬퍼
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

for await (const message of query({
  prompt: "Create a test file in /tmp and then delete it",
  options: {
    canUseTool: async (toolName, input) => {
      // 도구 요청 표시
      console.log(`\nTool: ${toolName}`);
      if (toolName === "Bash") {
        console.log(`Command: ${input.command}`);
        if (input.description) console.log(`Description: ${input.description}`);
      } else {
        console.log(`Input: ${JSON.stringify(input, null, 2)}`);
      }

      // 사용자 승인 받기
      const response = await prompt("Allow this action? (y/n): ");

      // 사용자 응답에 따라 허용 또는 거부 반환
      if (response.toLowerCase() === "y") {
        // 허용: 도구가 원래(또는 수정된) 입력으로 실행됨
        return { behavior: "allow", updatedInput: input };
      } else {
        // 거부: 도구가 실행되지 않으며 Claude가 메시지를 봄
        return { behavior: "deny", message: "User denied this action" };
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```
:::

::: info
Python에서 `can_use_tool`은 [스트리밍 모드](/agent-sdk/streaming-vs-single-mode)와 스트림을 열어두기 위해 `{"continue_": True}`를 반환하는 `PreToolUse` hook이 필요합니다. 이 hook이 없으면 권한 콜백이 호출되기 전에 스트림이 닫힙니다.
:::

이 예제는 `y` 이외의 입력을 거부로 처리하는 `y/n` 흐름을 사용합니다. 실제로는 사용자가 요청을 수정하거나, 피드백을 제공하거나, Claude를 완전히 다른 방향으로 이끌 수 있는 더 풍부한 UI를 구축할 수 있습니다. 응답할 수 있는 모든 방법은 [도구 요청에 응답하기](#도구-요청에-응답하기)를 참조하세요.

### 도구 요청에 응답하기

콜백은 두 가지 응답 유형 중 하나를 반환합니다:

| 응답 | Python | TypeScript |
| --- | --- | --- |
| **허용** | `PermissionResultAllow(updated_input=...)` | `{ behavior: "allow", updatedInput }` |
| **거부** | `PermissionResultDeny(message=...)` | `{ behavior: "deny", message }` |

허용할 때는 도구 입력 (원본 또는 수정된)을 전달합니다. 거부할 때는 이유를 설명하는 메시지를 제공합니다. Claude는 이 메시지를 보고 접근 방식을 조정할 수 있습니다.

::: code-group
```python [Python]
from claude_agent_sdk.types import PermissionResultAllow, PermissionResultDeny

# 도구 실행 허용
return PermissionResultAllow(updated_input=input_data)

# 도구 차단
return PermissionResultDeny(message="User rejected this action")
```

```typescript [TypeScript]
// 도구 실행 허용
return { behavior: "allow", updatedInput: input };

// 도구 차단
return { behavior: "deny", message: "User rejected this action" };
```
:::

허용과 거부 외에도 도구의 입력을 수정하거나 Claude가 접근 방식을 조정하는 데 도움이 되는 컨텍스트를 제공할 수 있습니다:

* **승인**: Claude가 요청한 대로 도구를 실행합니다
* **변경과 함께 승인**: 실행 전에 입력을 수정합니다 (예: 경로 정리, 제약 조건 추가)
* **거부**: 도구를 차단하고 Claude에게 이유를 알려줍니다
* **대안 제안**: 차단하지만 사용자가 원하는 것으로 Claude를 안내합니다
* **완전히 리디렉션**: [스트리밍 입력](/agent-sdk/streaming-vs-single-mode)을 사용하여 Claude에게 완전히 새로운 지시를 보냅니다

### 승인

사용자가 작업을 있는 그대로 승인합니다. 콜백에서 `input`을 변경하지 않고 그대로 전달하면 도구가 Claude가 요청한 대로 정확히 실행됩니다.

::: code-group
```python [Python]
async def can_use_tool(tool_name, input_data, context):
    print(f"Claude wants to use {tool_name}")
    approved = await ask_user("Allow this action?")

    if approved:
        return PermissionResultAllow(updated_input=input_data)
    return PermissionResultDeny(message="User declined")
```

```typescript [TypeScript]
canUseTool: async (toolName, input) => {
  console.log(`Claude wants to use ${toolName}`);
  const approved = await askUser("Allow this action?");

  if (approved) {
    return { behavior: "allow", updatedInput: input };
  }
  return { behavior: "deny", message: "User declined" };
};
```
:::

### 변경과 함께 승인

사용자가 승인하지만 먼저 요청을 수정하려 합니다. 도구가 실행되기 전에 입력을 변경할 수 있습니다. Claude는 결과를 보지만 변경 사항을 알지 못합니다. 매개변수 정리, 제약 조건 추가 또는 접근 범위 설정에 유용합니다.

::: code-group
```python [Python]
async def can_use_tool(tool_name, input_data, context):
    if tool_name == "Bash":
        # 사용자가 승인했지만 모든 명령을 샌드박스로 범위 제한
        sandboxed_input = {**input_data}
        sandboxed_input["command"] = input_data["command"].replace(
            "/tmp", "/tmp/sandbox"
        )
        return PermissionResultAllow(updated_input=sandboxed_input)
    return PermissionResultAllow(updated_input=input_data)
```

```typescript [TypeScript]
canUseTool: async (toolName, input) => {
  if (toolName === "Bash") {
    // 사용자가 승인했지만 모든 명령을 샌드박스로 범위 제한
    const sandboxedInput = {
      ...input,
      command: input.command.replace("/tmp", "/tmp/sandbox")
    };
    return { behavior: "allow", updatedInput: sandboxedInput };
  }
  return { behavior: "allow", updatedInput: input };
};
```
:::

### 거부

사용자가 이 작업을 원하지 않습니다. 도구를 차단하고 이유를 설명하는 메시지를 제공합니다. Claude는 이 메시지를 보고 다른 접근 방식을 시도할 수 있습니다.

::: code-group
```python [Python]
async def can_use_tool(tool_name, input_data, context):
    approved = await ask_user(f"Allow {tool_name}?")

    if not approved:
        return PermissionResultDeny(message="User rejected this action")
    return PermissionResultAllow(updated_input=input_data)
```

```typescript [TypeScript]
canUseTool: async (toolName, input) => {
  const approved = await askUser(`Allow ${toolName}?`);

  if (!approved) {
    return {
      behavior: "deny",
      message: "User rejected this action"
    };
  }
  return { behavior: "allow", updatedInput: input };
};
```
:::

### 대안 제안

사용자가 이 특정 작업을 원하지 않지만 다른 아이디어가 있습니다. 도구를 차단하고 메시지에 안내를 포함합니다. Claude는 이를 읽고 피드백에 따라 진행 방법을 결정합니다.

::: code-group
```python [Python]
async def can_use_tool(tool_name, input_data, context):
    if tool_name == "Bash" and "rm" in input_data.get("command", ""):
        # 사용자가 삭제를 원하지 않으며 대신 압축을 제안
        return PermissionResultDeny(
            message="User doesn't want to delete files. They asked if you could compress them into an archive instead."
        )
    return PermissionResultAllow(updated_input=input_data)
```

```typescript [TypeScript]
canUseTool: async (toolName, input) => {
  if (toolName === "Bash" && input.command.includes("rm")) {
    // 사용자가 삭제를 원하지 않으며 대신 압축을 제안
    return {
      behavior: "deny",
      message:
        "User doesn't want to delete files. They asked if you could compress them into an archive instead."
    };
  }
  return { behavior: "allow", updatedInput: input };
};
```
:::

### 완전히 리디렉션

완전히 방향을 바꾸려면 (단순한 제안이 아닌) [스트리밍 입력](/agent-sdk/streaming-vs-single-mode)을 사용하여 Claude에게 새로운 지시를 직접 보냅니다. 이는 현재 도구 요청을 우회하고 Claude에게 따라야 할 완전히 새로운 지시를 제공합니다.

## 명확화 질문 처리

Claude가 여러 유효한 접근 방식이 있는 작업에서 더 많은 방향이 필요할 때 `AskUserQuestion` 도구를 호출합니다. 이는 `toolName`이 `AskUserQuestion`으로 설정된 `canUseTool` 콜백을 트리거합니다. 입력에는 Claude의 질문이 객관식 옵션으로 포함되어 있으며, 이를 사용자에게 표시하고 선택을 반환합니다.

::: tip
명확화 질문은 [`plan` 모드](/agent-sdk/permissions#plan-mode-plan)에서 특히 일반적입니다. 이 모드에서 Claude는 계획을 제안하기 전에 코드베이스를 탐색하고 질문을 합니다. 이는 plan 모드를 Claude가 변경하기 전에 요구사항을 수집하는 대화형 워크플로우에 이상적으로 만듭니다.
:::

다음 단계는 명확화 질문을 처리하는 방법을 보여줍니다:

#### 1단계: canUseTool 콜백 전달

쿼리 옵션에 `canUseTool` 콜백을 전달합니다. 기본적으로 `AskUserQuestion`은 사용 가능합니다. Claude의 기능을 제한하기 위해 `tools` 배열을 지정하는 경우 (예: `Read`, `Glob`, `Grep`만 있는 읽기 전용 에이전트) 해당 배열에 `AskUserQuestion`을 포함해야 합니다. 그렇지 않으면 Claude가 명확화 질문을 할 수 없습니다:

::: code-group
```python [Python]
async for message in query(
    prompt="Analyze this codebase",
    options=ClaudeAgentOptions(
        # tools 목록에 AskUserQuestion 포함
        tools=["Read", "Glob", "Grep", "AskUserQuestion"],
        can_use_tool=can_use_tool,
    ),
):
    print(message)
```

```typescript [TypeScript]
for await (const message of query({
  prompt: "Analyze this codebase",
  options: {
    // tools 목록에 AskUserQuestion 포함
    tools: ["Read", "Glob", "Grep", "AskUserQuestion"],
    canUseTool: async (toolName, input) => {
      // 여기서 명확화 질문을 처리
    }
  }
})) {
  console.log(message);
}
```
:::

#### 2단계: AskUserQuestion 감지

콜백에서 `toolName`이 `AskUserQuestion`과 같은지 확인하여 다른 도구와 다르게 처리합니다:

::: code-group
```python [Python]
async def can_use_tool(tool_name: str, input_data: dict, context):
    if tool_name == "AskUserQuestion":
        # 사용자로부터 답변을 수집하는 구현
        return await handle_clarifying_questions(input_data)
    # 다른 도구는 정상적으로 처리
    return await prompt_for_approval(tool_name, input_data)
```

```typescript [TypeScript]
canUseTool: async (toolName, input) => {
  if (toolName === "AskUserQuestion") {
    // 사용자로부터 답변을 수집하는 구현
    return handleClarifyingQuestions(input);
  }
  // 다른 도구는 정상적으로 처리
  return promptForApproval(toolName, input);
};
```
:::

#### 3단계: 질문 입력 파싱

입력에는 `questions` 배열에 Claude의 질문이 포함되어 있습니다. 각 질문에는 `question` (표시할 텍스트), `options` (선택지), `multiSelect` (다중 선택 허용 여부)가 있습니다:

```json
{
  "questions": [
    {
      "question": "How should I format the output?",
      "header": "Format",
      "options": [
        { "label": "Summary", "description": "Brief overview" },
        { "label": "Detailed", "description": "Full explanation" }
      ],
      "multiSelect": false
    },
    {
      "question": "Which sections should I include?",
      "header": "Sections",
      "options": [
        { "label": "Introduction", "description": "Opening context" },
        { "label": "Conclusion", "description": "Final summary" }
      ],
      "multiSelect": true
    }
  ]
}
```

전체 필드 설명은 [질문 형식](#질문-형식)을 참조하세요.

#### 4단계: 사용자로부터 답변 수집

사용자에게 질문을 표시하고 선택을 수집합니다. 방법은 애플리케이션에 따라 다릅니다: 터미널 프롬프트, 웹 폼, 모바일 대화상자 등.

#### 5단계: Claude에게 답변 반환

각 키가 `question` 텍스트이고 각 값이 선택된 옵션의 `label`인 레코드로 `answers` 객체를 구성합니다:

| 질문 객체에서 | 용도 |
| --- | --- |
| `question` 필드 (예: `"How should I format the output?"`) | 키 |
| 선택된 옵션의 `label` 필드 (예: `"Summary"`) | 값 |

다중 선택 질문의 경우 여러 레이블을 `", "`로 결합합니다. [자유 텍스트 입력을 지원](#자유-텍스트-입력-지원)하는 경우 사용자의 커스텀 텍스트를 값으로 사용합니다.

::: code-group
```python [Python]
return PermissionResultAllow(
    updated_input={
        "questions": input_data.get("questions", []),
        "answers": {
            "How should I format the output?": "Summary",
            "Which sections should I include?": "Introduction, Conclusion",
        },
    }
)
```

```typescript [TypeScript]
return {
  behavior: "allow",
  updatedInput: {
    questions: input.questions,
    answers: {
      "How should I format the output?": "Summary",
      "Which sections should I include?": "Introduction, Conclusion"
    }
  }
};
```
:::

### 질문 형식

입력에는 `questions` 배열에 Claude가 생성한 질문이 포함됩니다. 각 질문에는 다음 필드가 있습니다:

| 필드 | 설명 |
| --- | --- |
| `question` | 표시할 전체 질문 텍스트 |
| `header` | 질문의 짧은 레이블 (최대 12자) |
| `options` | 각각 `label`과 `description`을 가진 2-4개의 선택지 배열. TypeScript: 선택적으로 `preview` (아래 [참조](#옵션-미리보기-typescript)) |
| `multiSelect` | `true`이면 사용자가 여러 옵션을 선택할 수 있음 |

콜백이 받는 구조:

```json
{
  "questions": [
    {
      "question": "How should I format the output?",
      "header": "Format",
      "options": [
        { "label": "Summary", "description": "Brief overview of key points" },
        { "label": "Detailed", "description": "Full explanation with examples" }
      ],
      "multiSelect": false
    }
  ]
}
```

#### 옵션 미리보기 (TypeScript)

`toolConfig.askUserQuestion.previewFormat`은 각 옵션에 `preview` 필드를 추가하여 앱이 레이블과 함께 시각적 미리보기를 표시할 수 있도록 합니다. 이 설정이 없으면 Claude는 미리보기를 생성하지 않으며 필드가 없습니다.

| `previewFormat` | `preview` 내용 |
| :--- | :--- |
| 미설정 (기본값) | 필드가 없음. Claude가 미리보기를 생성하지 않음. |
| `"markdown"` | ASCII 아트와 펜스드 코드 블록 |
| `"html"` | 스타일이 적용된 `<div>` 프래그먼트 (SDK가 콜백 실행 전에 `<script>`, `<style>`, `<!DOCTYPE>`를 거부함) |

형식은 세션의 모든 질문에 적용됩니다. Claude는 시각적 비교가 도움이 되는 옵션 (레이아웃 선택, 색상 체계)에 `preview`를 포함하고 그렇지 않은 경우 (예/아니오 확인, 텍스트 전용 선택)에는 생략합니다. 렌더링 전에 `undefined`를 확인하세요.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Help me choose a card layout",
  options: {
    toolConfig: {
      askUserQuestion: { previewFormat: "html" }
    },
    canUseTool: async (toolName, input) => {
      // input.questions[].options[].preview는 HTML 문자열 또는 undefined
      return { behavior: "allow", updatedInput: input };
    }
  }
})) {
  // ...
}
```

HTML 미리보기가 있는 옵션:

```json
{
  "label": "Compact",
  "description": "Title and metric value only",
  "preview": "<div style=\"padding:12px;border:1px solid #ddd;border-radius:8px\"><div style=\"font-size:12px;color:#666\">Active users</div><div style=\"font-size:28px;font-weight:600\">1,284</div></div>"
}
```

### 응답 형식

각 질문의 `question` 필드를 선택된 옵션의 `label`에 매핑하는 `answers` 객체를 반환합니다:

| 필드 | 설명 |
| --- | --- |
| `questions` | 원래 질문 배열을 그대로 전달 (도구 처리에 필요) |
| `answers` | 키가 질문 텍스트이고 값이 선택된 레이블인 객체 |

다중 선택 질문의 경우 여러 레이블을 `", "`로 결합합니다. 자유 텍스트 입력의 경우 사용자의 커스텀 텍스트를 직접 사용합니다.

```json
{
  "questions": [
    // ...
  ],
  "answers": {
    "How should I format the output?": "Summary",
    "Which sections should I include?": "Introduction, Conclusion"
  }
}
```

#### 자유 텍스트 입력 지원

Claude의 사전 정의된 옵션이 항상 사용자가 원하는 것을 다루지는 않습니다. 사용자가 자체 답변을 입력할 수 있도록 하려면:

* Claude의 옵션 뒤에 텍스트 입력을 받는 추가 "Other" 선택지를 표시합니다
* 사용자의 커스텀 텍스트를 답변 값으로 사용합니다 ("Other"라는 단어가 아닌)

전체 구현은 아래의 [전체 예제](#전체-예제)를 참조하세요.

### 전체 예제

Claude는 진행하기 위해 사용자 입력이 필요할 때 명확화 질문을 합니다. 예를 들어 모바일 앱의 기술 스택을 결정하는 데 도움을 요청받으면 Claude는 크로스 플랫폼 대 네이티브, 백엔드 선호도 또는 대상 플랫폼에 대해 물어볼 수 있습니다. 이러한 질문은 Claude가 추측하지 않고 사용자의 선호도에 맞는 결정을 내리는 데 도움이 됩니다.

이 예제는 터미널 애플리케이션에서 이러한 질문을 처리합니다. 각 단계에서 일어나는 일:

1. **요청 라우팅**: `canUseTool` 콜백이 도구 이름이 `"AskUserQuestion"`인지 확인하고 전용 핸들러로 라우팅합니다
2. **질문 표시**: 핸들러가 `questions` 배열을 순회하며 번호가 매겨진 옵션과 함께 각 질문을 출력합니다
3. **입력 수집**: 사용자는 옵션을 선택하기 위해 숫자를 입력하거나 자유 텍스트를 직접 입력할 수 있습니다 (예: "jquery", "i don't know")
4. **답변 매핑**: 코드가 입력이 숫자인지 (옵션의 레이블 사용) 자유 텍스트인지 (텍스트 직접 사용) 확인합니다
5. **Claude에게 반환**: 응답에는 원래 `questions` 배열과 `answers` 매핑이 모두 포함됩니다

::: code-group
```python [Python]
import asyncio

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
from claude_agent_sdk.types import HookMatcher, PermissionResultAllow


def parse_response(response: str, options: list) -> str:
    """사용자 입력을 옵션 번호 또는 자유 텍스트로 파싱합니다."""
    try:
        indices = [int(s.strip()) - 1 for s in response.split(",")]
        labels = [options[i]["label"] for i in indices if 0 <= i < len(options)]
        return ", ".join(labels) if labels else response
    except ValueError:
        return response


async def handle_ask_user_question(input_data: dict) -> PermissionResultAllow:
    """Claude의 질문을 표시하고 사용자 답변을 수집합니다."""
    answers = {}

    for q in input_data.get("questions", []):
        print(f"\n{q['header']}: {q['question']}")

        options = q["options"]
        for i, opt in enumerate(options):
            print(f"  {i + 1}. {opt['label']} - {opt['description']}")
        if q.get("multiSelect"):
            print("  (Enter numbers separated by commas, or type your own answer)")
        else:
            print("  (Enter a number, or type your own answer)")

        response = input("Your choice: ").strip()
        answers[q["question"]] = parse_response(response, options)

    return PermissionResultAllow(
        updated_input={
            "questions": input_data.get("questions", []),
            "answers": answers,
        }
    )


async def can_use_tool(
    tool_name: str, input_data: dict, context
) -> PermissionResultAllow:
    # AskUserQuestion을 질문 핸들러로 라우팅
    if tool_name == "AskUserQuestion":
        return await handle_ask_user_question(input_data)
    # 이 예제에서는 다른 도구를 자동 승인
    return PermissionResultAllow(updated_input=input_data)


async def prompt_stream():
    yield {
        "type": "user",
        "message": {
            "role": "user",
            "content": "Help me decide on the tech stack for a new mobile app",
        },
    }


# 필수 우회방법: 더미 hook이 can_use_tool을 위해 스트림을 열어둠
async def dummy_hook(input_data, tool_use_id, context):
    return {"continue_": True}


async def main():
    async for message in query(
        prompt=prompt_stream(),
        options=ClaudeAgentOptions(
            can_use_tool=can_use_tool,
            hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
        ),
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as readline from "readline/promises";

// 터미널에서 사용자 입력을 받기 위한 헬퍼
async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

// 사용자 입력을 옵션 번호 또는 자유 텍스트로 파싱
function parseResponse(response: string, options: any[]): string {
  const indices = response.split(",").map((s) => parseInt(s.trim()) - 1);
  const labels = indices
    .filter((i) => !isNaN(i) && i >= 0 && i < options.length)
    .map((i) => options[i].label);
  return labels.length > 0 ? labels.join(", ") : response;
}

// Claude의 질문을 표시하고 사용자 답변을 수집
async function handleAskUserQuestion(input: any) {
  const answers: Record<string, string> = {};

  for (const q of input.questions) {
    console.log(`\n${q.header}: ${q.question}`);

    const options = q.options;
    options.forEach((opt: any, i: number) => {
      console.log(`  ${i + 1}. ${opt.label} - ${opt.description}`);
    });
    if (q.multiSelect) {
      console.log("  (Enter numbers separated by commas, or type your own answer)");
    } else {
      console.log("  (Enter a number, or type your own answer)");
    }

    const response = (await prompt("Your choice: ")).trim();
    answers[q.question] = parseResponse(response, options);
  }

  // 답변을 Claude에게 반환 (원래 질문을 포함해야 함)
  return {
    behavior: "allow",
    updatedInput: { questions: input.questions, answers }
  };
}

async function main() {
  for await (const message of query({
    prompt: "Help me decide on the tech stack for a new mobile app",
    options: {
      canUseTool: async (toolName, input) => {
        // AskUserQuestion을 질문 핸들러로 라우팅
        if (toolName === "AskUserQuestion") {
          return handleAskUserQuestion(input);
        }
        // 이 예제에서는 다른 도구를 자동 승인
        return { behavior: "allow", updatedInput: input };
      }
    }
  })) {
    if ("result" in message) console.log(message.result);
  }
}

main();
```
:::

## 제한 사항

* **서브에이전트**: `AskUserQuestion`은 현재 Agent 도구를 통해 생성된 서브에이전트에서 사용할 수 없습니다
* **질문 제한**: 각 `AskUserQuestion` 호출은 각각 2-4개의 옵션이 있는 1-4개의 질문을 지원합니다

## 사용자 입력을 받는 다른 방법

`canUseTool` 콜백과 `AskUserQuestion` 도구는 대부분의 승인 및 명확화 시나리오를 다루지만, SDK는 사용자로부터 입력을 받는 다른 방법을 제공합니다:

### 스트리밍 입력

다음이 필요할 때 [스트리밍 입력](/agent-sdk/streaming-vs-single-mode)을 사용합니다:

* **작업 중 에이전트 중단**: Claude가 작업하는 동안 취소 신호를 보내거나 방향을 변경
* **추가 컨텍스트 제공**: Claude가 요청하기를 기다리지 않고 필요한 정보를 추가
* **채팅 인터페이스 구축**: 장기 실행 작업 중에 사용자가 후속 메시지를 보낼 수 있도록 함

스트리밍 입력은 승인 체크포인트에서만이 아니라 실행 전반에 걸쳐 사용자가 에이전트와 상호작용하는 대화형 UI에 이상적입니다.

### 커스텀 도구

다음이 필요할 때 [커스텀 도구](/agent-sdk/custom-tools)를 사용합니다:

* **구조화된 입력 수집**: `AskUserQuestion`의 객관식 형식을 넘어서는 폼, 위자드 또는 다단계 워크플로우 구축
* **외부 승인 시스템 통합**: 기존 티켓팅, 워크플로우 또는 승인 플랫폼에 연결
* **도메인별 상호작용 구현**: 코드 리뷰 인터페이스나 배포 체크리스트와 같이 애플리케이션의 요구에 맞춘 도구 생성

커스텀 도구는 상호작용에 대한 완전한 제어를 제공하지만 내장 `canUseTool` 콜백을 사용하는 것보다 더 많은 구현 작업이 필요합니다.

## 관련 리소스

* [권한 설정](/agent-sdk/permissions): 권한 모드 및 규칙 설정
* [Hooks로 실행 제어](/agent-sdk/hooks): 에이전트 라이프사이클의 주요 지점에서 커스텀 코드 실행
* [TypeScript SDK 레퍼런스](/agent-sdk/typescript#can-use-tool): 전체 canUseTool API 문서
