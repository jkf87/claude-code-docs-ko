---
title: 에이전트에서 구조화된 출력 받기
description: JSON Schema, Zod, Pydantic을 사용해 에이전트 워크플로우에서 검증된 JSON을 반환합니다. 멀티턴 도구 사용 후에도 타입 안전한 구조화 데이터를 받아볼 수 있습니다.
---

# 에이전트에서 구조화된 출력 받기

구조화된 출력(structured outputs)을 사용하면 에이전트로부터 돌려받을 데이터의 정확한 형태를 정의할 수 있습니다. 에이전트는 작업을 완료하기 위해 필요한 도구를 자유롭게 사용하면서도, 마지막에는 스키마에 맞게 검증된 JSON을 반환합니다. 원하는 구조를 [JSON Schema](https://json-schema.org/understanding-json-schema/about)로 정의하면, SDK가 출력이 스키마와 일치하도록 보장합니다.

완전한 타입 안전성을 원한다면 [Zod](#zod와-pydantic으로-타입-안전한-스키마-정의하기)(TypeScript) 또는 [Pydantic](#zod와-pydantic으로-타입-안전한-스키마-정의하기)(Python)을 사용해 스키마를 정의하고, 강하게 타입이 지정된 객체를 받아볼 수 있습니다.

## 구조화된 출력이 필요한 이유

에이전트는 기본적으로 자유 형식의 텍스트를 반환합니다. 이는 채팅에는 적합하지만, 출력을 프로그래밍 방식으로 활용해야 할 때는 불편합니다. 구조화된 출력을 사용하면 타입이 지정된 데이터를 직접 애플리케이션 로직, 데이터베이스, 또는 UI 컴포넌트에 전달할 수 있습니다.

예를 들어 에이전트가 웹을 검색해 레시피를 가져오는 요리 앱을 생각해 봅시다. 구조화된 출력 없이는 직접 파싱해야 하는 자유 형식 텍스트를 받게 됩니다. 구조화된 출력을 사용하면 원하는 형태를 정의하고 앱에서 바로 사용할 수 있는 타입 데이터를 얻을 수 있습니다.

<details>
<summary>구조화된 출력 없이</summary>

```text
Here's a classic chocolate chip cookie recipe!

**Chocolate Chip Cookies**
Prep time: 15 minutes | Cook time: 10 minutes

Ingredients:
- 2 1/4 cups all-purpose flour
- 1 cup butter, softened
...
```

이 텍스트를 앱에서 사용하려면 제목을 추출하고, "15 minutes"를 숫자로 변환하고, 재료와 조리 방법을 분리하고, 응답마다 다른 포맷을 처리해야 합니다.

</details>

<details>
<summary>구조화된 출력 사용 시</summary>

```json
{
  "name": "Chocolate Chip Cookies",
  "prep_time_minutes": 15,
  "cook_time_minutes": 10,
  "ingredients": [
    { "item": "all-purpose flour", "amount": 2.25, "unit": "cups" },
    { "item": "butter, softened", "amount": 1, "unit": "cup" }
    // ...
  ],
  "steps": ["Preheat oven to 375°F", "Cream butter and sugar" /* ... */]
}
```

UI에서 바로 활용할 수 있는 타입 데이터입니다.

</details>

## 빠른 시작

구조화된 출력을 사용하려면 원하는 데이터 형태를 [JSON Schema](https://json-schema.org/understanding-json-schema/about)로 정의한 후, `query()`의 `outputFormat` 옵션(TypeScript) 또는 `output_format` 옵션(Python)으로 전달합니다. 에이전트가 작업을 마치면 결과 메시지의 `structured_output` 필드에 스키마에 맞게 검증된 데이터가 담겨 있습니다.

아래 예제는 에이전트에게 Anthropic을 조사해 회사명, 설립 연도, 본사 위치를 구조화된 출력으로 반환하도록 요청합니다.

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// 받고 싶은 데이터 형태 정의
const schema = {
  type: "object",
  properties: {
    company_name: { type: "string" },
    founded_year: { type: "number" },
    headquarters: { type: "string" }
  },
  required: ["company_name"]
};

for await (const message of query({
  prompt: "Research Anthropic and provide key company information",
  options: {
    outputFormat: {
      type: "json_schema",
      schema: schema
    }
  }
})) {
  // 결과 메시지의 structured_output에 검증된 데이터가 담겨 있습니다
  if (message.type === "result" && message.subtype === "success" && message.structured_output) {
    console.log(message.structured_output);
    // { company_name: "Anthropic", founded_year: 2021, headquarters: "San Francisco, CA" }
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

# 받고 싶은 데이터 형태 정의
schema = {
    "type": "object",
    "properties": {
        "company_name": {"type": "string"},
        "founded_year": {"type": "number"},
        "headquarters": {"type": "string"},
    },
    "required": ["company_name"],
}


async def main():
    async for message in query(
        prompt="Research Anthropic and provide key company information",
        options=ClaudeAgentOptions(
            output_format={"type": "json_schema", "schema": schema}
        ),
    ):
        # 결과 메시지의 structured_output에 검증된 데이터가 담겨 있습니다
        if isinstance(message, ResultMessage) and message.structured_output:
            print(message.structured_output)
            # {'company_name': 'Anthropic', 'founded_year': 2021, 'headquarters': 'San Francisco, CA'}


asyncio.run(main())
```

:::

## Zod와 Pydantic으로 타입 안전한 스키마 정의하기

JSON Schema를 직접 작성하는 대신, [Zod](https://zod.dev/)(TypeScript) 또는 [Pydantic](https://docs.pydantic.dev/latest/)(Python)을 사용해 스키마를 정의할 수 있습니다. 이 라이브러리들은 JSON Schema를 자동으로 생성하고, 응답을 완전히 타입이 지정된 객체로 파싱해 코드베이스 전반에서 자동완성과 타입 검사를 활용할 수 있게 해줍니다.

아래 예제는 기능 구현 계획을 위한 스키마를 정의합니다. 스키마에는 요약, 단계 목록(각 단계마다 복잡도 수준 포함), 잠재적 위험 요소가 포함됩니다. 에이전트가 기능을 계획하고 타입이 지정된 `FeaturePlan` 객체를 반환합니다. 이후 `plan.summary`와 같은 속성에 접근하거나 `plan.steps`를 순회할 때 완전한 타입 안전성을 보장받을 수 있습니다.

::: code-group

```typescript [TypeScript]
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";

// Zod로 스키마 정의
const FeaturePlan = z.object({
  feature_name: z.string(),
  summary: z.string(),
  steps: z.array(
    z.object({
      step_number: z.number(),
      description: z.string(),
      estimated_complexity: z.enum(["low", "medium", "high"])
    })
  ),
  risks: z.array(z.string())
});

type FeaturePlan = z.infer<typeof FeaturePlan>;

// JSON Schema로 변환
const schema = z.toJSONSchema(FeaturePlan);

// query에서 사용
for await (const message of query({
  prompt:
    "Plan how to add dark mode support to a React app. Break it into implementation steps.",
  options: {
    outputFormat: {
      type: "json_schema",
      schema: schema
    }
  }
})) {
  if (message.type === "result" && message.subtype === "success" && message.structured_output) {
    // 검증 후 완전히 타입이 지정된 결과 얻기
    const parsed = FeaturePlan.safeParse(message.structured_output);
    if (parsed.success) {
      const plan: FeaturePlan = parsed.data;
      console.log(`Feature: ${plan.feature_name}`);
      console.log(`Summary: ${plan.summary}`);
      plan.steps.forEach((step) => {
        console.log(`${step.step_number}. [${step.estimated_complexity}] ${step.description}`);
      });
    }
  }
}
```

```python [Python]
import asyncio
from pydantic import BaseModel
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


class Step(BaseModel):
    step_number: int
    description: str
    estimated_complexity: str  # 'low', 'medium', 'high'


class FeaturePlan(BaseModel):
    feature_name: str
    summary: str
    steps: list[Step]
    risks: list[str]


async def main():
    async for message in query(
        prompt="Plan how to add dark mode support to a React app. Break it into implementation steps.",
        options=ClaudeAgentOptions(
            output_format={
                "type": "json_schema",
                "schema": FeaturePlan.model_json_schema(),
            }
        ),
    ):
        if isinstance(message, ResultMessage) and message.structured_output:
            # 검증 후 완전히 타입이 지정된 결과 얻기
            plan = FeaturePlan.model_validate(message.structured_output)
            print(f"Feature: {plan.feature_name}")
            print(f"Summary: {plan.summary}")
            for step in plan.steps:
                print(
                    f"{step.step_number}. [{step.estimated_complexity}] {step.description}"
                )


asyncio.run(main())
```

:::

**장점:**

- 완전한 타입 추론 (TypeScript) 및 타입 힌트 (Python)
- `safeParse()` 또는 `model_validate()`를 통한 런타임 검증
- 더 나은 오류 메시지
- 조합 가능하고 재사용 가능한 스키마

## 출력 형식 설정

`outputFormat`(TypeScript) 또는 `output_format`(Python) 옵션은 다음 속성을 가진 객체를 받습니다:

- `type`: 구조화된 출력을 위해 `"json_schema"`로 설정
- `schema`: 출력 구조를 정의하는 [JSON Schema](https://json-schema.org/understanding-json-schema/about) 객체. Zod 스키마에서는 `z.toJSONSchema()`로, Pydantic 모델에서는 `.model_json_schema()`로 생성할 수 있습니다.

SDK는 모든 기본 타입(object, array, string, number, boolean, null), `enum`, `const`, `required`, 중첩 객체, `$ref` 정의를 포함한 표준 JSON Schema 기능을 지원합니다. 지원 기능과 제한 사항의 전체 목록은 [JSON Schema 제한 사항](https://platform.claude.com/docs/en/build-with-claude/structured-outputs#json-schema-limitations)을 참고하세요.

## 예제: TODO 추적 에이전트

이 예제는 멀티스텝 도구 사용에서 구조화된 출력이 어떻게 동작하는지 보여줍니다. 에이전트는 코드베이스에서 TODO 주석을 찾은 다음, 각각의 git blame 정보를 조회해야 합니다. 에이전트는 사용할 도구(검색을 위한 Grep, git 명령 실행을 위한 Bash)를 자율적으로 결정하고 결과를 하나의 구조화된 응답으로 합칩니다.

스키마에는 선택적 필드(`author`와 `date`)가 포함되어 있습니다. git blame 정보를 모든 파일에서 구할 수 없을 수 있기 때문입니다. 에이전트는 찾을 수 있는 정보를 채우고 나머지는 생략합니다.

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// TODO 추출을 위한 구조 정의
const todoSchema = {
  type: "object",
  properties: {
    todos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          file: { type: "string" },
          line: { type: "number" },
          author: { type: "string" },
          date: { type: "string" }
        },
        required: ["text", "file", "line"]
      }
    },
    total_count: { type: "number" }
  },
  required: ["todos", "total_count"]
};

// 에이전트가 Grep으로 TODO를 찾고, Bash로 git blame 정보를 가져옵니다
for await (const message of query({
  prompt: "Find all TODO comments in this codebase and identify who added them",
  options: {
    outputFormat: {
      type: "json_schema",
      schema: todoSchema
    }
  }
})) {
  if (message.type === "result" && message.subtype === "success" && message.structured_output) {
    const data = message.structured_output as { total_count: number; todos: Array<{ file: string; line: number; text: string; author?: string; date?: string }> };
    console.log(`Found ${data.total_count} TODOs`);
    data.todos.forEach((todo) => {
      console.log(`${todo.file}:${todo.line} - ${todo.text}`);
      if (todo.author) {
        console.log(`  Added by ${todo.author} on ${todo.date}`);
      }
    });
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

# TODO 추출을 위한 구조 정의
todo_schema = {
    "type": "object",
    "properties": {
        "todos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "file": {"type": "string"},
                    "line": {"type": "number"},
                    "author": {"type": "string"},
                    "date": {"type": "string"},
                },
                "required": ["text", "file", "line"],
            },
        },
        "total_count": {"type": "number"},
    },
    "required": ["todos", "total_count"],
}


async def main():
    # 에이전트가 Grep으로 TODO를 찾고, Bash로 git blame 정보를 가져옵니다
    async for message in query(
        prompt="Find all TODO comments in this codebase and identify who added them",
        options=ClaudeAgentOptions(
            output_format={"type": "json_schema", "schema": todo_schema}
        ),
    ):
        if isinstance(message, ResultMessage) and message.structured_output:
            data = message.structured_output
            print(f"Found {data['total_count']} TODOs")
            for todo in data["todos"]:
                print(f"{todo['file']}:{todo['line']} - {todo['text']}")
                if "author" in todo:
                    print(f"  Added by {todo['author']} on {todo['date']}")


asyncio.run(main())
```

:::

## 오류 처리

에이전트가 스키마에 맞는 유효한 JSON을 생성하지 못할 때 구조화된 출력 생성이 실패할 수 있습니다. 이는 주로 스키마가 작업에 비해 너무 복잡하거나, 작업 자체가 모호하거나, 에이전트가 검증 오류를 수정하려는 재시도 한도에 도달했을 때 발생합니다.

오류가 발생하면 결과 메시지의 `subtype`이 무엇이 잘못되었는지를 나타냅니다:

| Subtype                               | 의미                                                      |
| ------------------------------------- | --------------------------------------------------------- |
| `success`                             | 출력이 정상적으로 생성되고 검증됨                          |
| `error_max_structured_output_retries` | 여러 번 시도했지만 유효한 출력을 생성하지 못함             |

아래 예제는 `subtype` 필드를 확인해 출력이 성공적으로 생성되었는지, 아니면 실패를 처리해야 하는지 판단합니다:

::: code-group

```typescript [TypeScript]
for await (const msg of query({
  prompt: "Extract contact info from the document",
  options: {
    outputFormat: {
      type: "json_schema",
      schema: contactSchema
    }
  }
})) {
  if (msg.type === "result") {
    if (msg.subtype === "success" && msg.structured_output) {
      // 검증된 출력 사용
      console.log(msg.structured_output);
    } else if (msg.subtype === "error_max_structured_output_retries") {
      // 실패 처리 - 더 간단한 프롬프트로 재시도, 비구조화 출력으로 폴백 등
      console.error("Could not produce valid output");
    }
  }
}
```

```python [Python]
async for message in query(
    prompt="Extract contact info from the document",
    options=ClaudeAgentOptions(
        output_format={"type": "json_schema", "schema": contact_schema}
    ),
):
    if isinstance(message, ResultMessage):
        if message.subtype == "success" and message.structured_output:
            # 검증된 출력 사용
            print(message.structured_output)
        elif message.subtype == "error_max_structured_output_retries":
            # 실패 처리
            print("Could not produce valid output")
```

:::

**오류 방지 팁:**

- **스키마를 간결하게 유지하세요.** 필수 필드가 많고 깊이 중첩된 스키마는 충족하기 어렵습니다. 단순하게 시작해서 필요에 따라 복잡도를 높이세요.
- **스키마를 작업에 맞추세요.** 작업에서 스키마가 요구하는 모든 정보를 얻을 수 없을 수도 있다면, 해당 필드를 선택적(optional)으로 만드세요.
- **명확한 프롬프트를 사용하세요.** 모호한 프롬프트는 에이전트가 어떤 출력을 생성해야 할지 파악하기 어렵게 만듭니다.

## 관련 리소스

- [JSON Schema 문서](https://json-schema.org/): 중첩 객체, 배열, enum, 검증 제약 조건을 포함한 복잡한 스키마를 정의하는 JSON Schema 문법을 학습합니다.
- [API 구조화된 출력](https://platform.claude.com/docs/en/build-with-claude/structured-outputs): 도구 사용 없이 단일 턴 요청에서 Claude API로 직접 구조화된 출력 사용하기
- [커스텀 도구](/agent-sdk/custom-tools): 에이전트에게 구조화된 출력을 반환하기 전 실행 중에 호출할 커스텀 도구 제공하기
