---
title: 비용 및 사용량 추적
description: Claude Agent SDK를 사용하여 토큰 사용량을 추적하고, 병렬 도구 호출을 중복 제거하고, 비용을 계산하는 방법을 알아봅니다.
---

# 비용 및 사용량 추적

> Claude Agent SDK를 사용하여 토큰 사용량을 추적하고, 병렬 도구 호출을 중복 제거하고, 비용을 계산하는 방법을 알아봅니다.

Claude Agent SDK는 Claude와의 각 상호작용에 대한 상세한 토큰 사용량 정보를 제공합니다. 이 가이드에서는 병렬 도구 사용 및 다단계 대화를 처리할 때 비용을 올바르게 추적하고 사용량 보고를 이해하는 방법을 설명합니다.

완전한 API 문서는 [TypeScript SDK 레퍼런스](/agent-sdk/typescript) 및 [Python SDK 레퍼런스](/agent-sdk/python)를 참고하세요.

## 토큰 사용량 이해

TypeScript와 Python SDK는 필드 이름만 다를 뿐 동일한 사용량 데이터를 제공합니다:

* **TypeScript**는 각 어시스턴트 메시지(`message.message.id`, `message.message.usage`)에 단계별 토큰 분석을 제공하고, 결과 메시지의 `modelUsage`를 통해 모델별 비용을, 결과 메시지에 누적 합계를 제공합니다.
* **Python**은 각 어시스턴트 메시지(`message.usage`, `message.message_id`)에 단계별 토큰 분석을 제공하고, 결과 메시지의 `model_usage`를 통해 모델별 비용을, 결과 메시지(`total_cost_usd` 및 `usage` dict)에 누적 합계를 제공합니다.

두 SDK 모두 동일한 기본 비용 모델을 사용하며 동일한 수준의 세분화된 정보를 제공합니다. 차이점은 필드 이름과 단계별 사용량이 중첩되는 위치에 있습니다.

비용 추적은 SDK가 사용량 데이터를 범위화하는 방식을 이해하는 것에서 시작합니다:

* **`query()` 호출:** SDK의 `query()` 함수를 한 번 호출하는 것입니다. 단일 호출에는 여러 단계(Claude가 응답하고, 도구를 사용하고, 결과를 받고, 다시 응답)가 포함될 수 있습니다. 각 호출은 마지막에 하나의 [`result`](/agent-sdk/typescript#sdk-result-message) 메시지를 생성합니다.
* **단계(Step):** `query()` 호출 내의 단일 요청/응답 사이클입니다. 각 단계는 토큰 사용량이 포함된 어시스턴트 메시지를 생성합니다.
* **세션(Session):** 세션 ID로 연결된 일련의 `query()` 호출(`resume` 옵션 사용)입니다. 세션 내의 각 `query()` 호출은 자체 비용을 독립적으로 보고합니다.

다음 다이어그램은 단일 `query()` 호출의 메시지 스트림을 보여주며, 각 단계에서 토큰 사용량이 보고되고 마지막에 권위 있는 합계가 표시됩니다:

<img src="https://mintcdn.com/claude-code/gvy2DIUELtNA8qD3/images/agent-sdk/message-usage-flow.svg?fit=max&auto=format&n=gvy2DIUELtNA8qD3&q=85&s=88cba82134f8f7994d780c3f153b83fc" alt="쿼리가 두 단계의 메시지를 생성하는 다이어그램. Step 1은 동일한 ID와 사용량을 공유하는 네 개의 어시스턴트 메시지(한 번만 카운트), Step 2는 새 ID를 가진 하나의 어시스턴트 메시지, 최종 결과 메시지는 청구를 위한 total_cost_usd를 표시합니다." width="760" height="520" data-path="images/agent-sdk/message-usage-flow.svg" />

## 1단계: 각 단계에서 어시스턴트 메시지 생성

Claude가 응답하면 하나 이상의 어시스턴트 메시지를 전송합니다. TypeScript에서 각 어시스턴트 메시지는 `id`와 토큰 수(`input_tokens`, `output_tokens`)가 포함된 [`usage`](https://platform.claude.com/docs/en/api/messages) 객체를 가진 중첩된 `BetaMessage`(`message.message`를 통해 접근)를 포함합니다. Python에서 `AssistantMessage` 데이터클래스는 `message.usage`와 `message.message_id`를 통해 동일한 데이터를 직접 제공합니다. Claude가 한 번의 턴에 여러 도구를 사용할 경우, 해당 턴의 모든 메시지는 동일한 ID를 공유하므로 이중 카운팅을 피하기 위해 ID로 중복 제거해야 합니다.

## 2단계: 결과 메시지가 권위 있는 합계를 제공

`query()` 호출이 완료되면 SDK는 `total_cost_usd`와 누적 `usage`가 포함된 결과 메시지를 내보냅니다. 이는 TypeScript([`SDKResultMessage`](/agent-sdk/typescript#sdk-result-message))와 Python([`ResultMessage`](/agent-sdk/python#result-message)) 모두에서 사용 가능합니다. 여러 `query()` 호출을 수행하는 경우(예: 다중 턴 세션), 각 결과는 해당 개별 호출의 비용만 반영합니다. 총 비용만 필요하다면 단계별 사용량은 무시하고 이 단일 값을 읽을 수 있습니다.

## 쿼리의 총 비용 가져오기

결과 메시지([TypeScript](/agent-sdk/typescript#sdk-result-message), [Python](/agent-sdk/python#result-message))는 모든 `query()` 호출의 마지막 메시지입니다. 해당 호출의 모든 단계에 걸친 누적 비용인 `total_cost_usd`를 포함합니다. 이는 성공 및 오류 결과 모두에서 작동합니다. 세션을 사용하여 여러 `query()` 호출을 수행하는 경우, 각 결과는 해당 개별 호출의 비용만 반영합니다.

다음 예시는 `query()` 호출의 메시지 스트림을 순회하며 `result` 메시지가 도착하면 총 비용을 출력합니다:

::: code-group
```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({ prompt: "Summarize this project" })) {
  if (message.type === "result") {
    console.log(`Total cost: $${message.total_cost_usd}`);
  }
}
```

```python [Python]
from claude_agent_sdk import query, ResultMessage
import asyncio


async def main():
    async for message in query(prompt="Summarize this project"):
        if isinstance(message, ResultMessage):
            print(f"Total cost: ${message.total_cost_usd or 0}")


asyncio.run(main())
```
:::

## 단계별 및 모델별 사용량 추적

이 섹션의 예시는 TypeScript 필드 이름을 사용합니다. Python에서 동등한 필드는 단계별 사용량의 경우 [`AssistantMessage.usage`](/agent-sdk/python#assistant-message)와 `AssistantMessage.message_id`이고, 모델별 분석의 경우 [`ResultMessage.model_usage`](/agent-sdk/python#result-message)입니다.

### 단계별 사용량 추적

각 어시스턴트 메시지는 `id`와 토큰 수가 포함된 `usage` 객체를 가진 중첩된 `BetaMessage`(`message.message`를 통해 접근)를 포함합니다. Claude가 병렬로 도구를 사용할 때 여러 메시지가 동일한 `id`와 동일한 사용량 데이터를 공유합니다. 이미 카운트된 ID를 추적하고 중복을 건너뛰어 부풀려진 합계를 방지하세요.

::: warning
병렬 도구 호출은 중첩된 `BetaMessage`가 동일한 `id`와 동일한 사용량을 공유하는 여러 어시스턴트 메시지를 생성합니다. 정확한 단계별 토큰 수를 얻으려면 항상 ID로 중복 제거하세요.
:::

다음 예시는 고유한 메시지 ID를 한 번만 카운트하여 모든 단계에서 input 및 output 토큰을 누적합니다:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const seenIds = new Set<string>();
let totalInputTokens = 0;
let totalOutputTokens = 0;

for await (const message of query({ prompt: "Summarize this project" })) {
  if (message.type === "assistant") {
    const msgId = message.message.id;

    // Parallel tool calls share the same ID, only count once
    if (!seenIds.has(msgId)) {
      seenIds.add(msgId);
      totalInputTokens += message.message.usage.input_tokens;
      totalOutputTokens += message.message.usage.output_tokens;
    }
  }
}

console.log(`Steps: ${seenIds.size}`);
console.log(`Input tokens: ${totalInputTokens}`);
console.log(`Output tokens: ${totalOutputTokens}`);
```

### 모델별 사용량 분석

결과 메시지는 모델 이름에서 모델별 토큰 수와 비용으로의 맵인 [`modelUsage`](/agent-sdk/typescript#model-usage)를 포함합니다. 이는 여러 모델을 실행할 때(예: 서브에이전트에는 Haiku, 메인 에이전트에는 Opus) 토큰이 어디에 사용되는지 파악하는 데 유용합니다.

다음 예시는 쿼리를 실행하고 사용된 각 모델의 비용과 토큰 분석을 출력합니다:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({ prompt: "Summarize this project" })) {
  if (message.type !== "result") continue;

  for (const [modelName, usage] of Object.entries(message.modelUsage)) {
    console.log(`${modelName}: $${usage.costUSD.toFixed(4)}`);
    console.log(`  Input tokens: ${usage.inputTokens}`);
    console.log(`  Output tokens: ${usage.outputTokens}`);
    console.log(`  Cache read: ${usage.cacheReadInputTokens}`);
    console.log(`  Cache creation: ${usage.cacheCreationInputTokens}`);
  }
}
```

## 여러 호출에 걸쳐 비용 누적

각 `query()` 호출은 자체 `total_cost_usd`를 반환합니다. SDK는 세션 수준의 합계를 제공하지 않으므로, 애플리케이션이 여러 `query()` 호출을 수행하는 경우(예: 다중 턴 세션 또는 다른 사용자에 걸쳐) 합계를 직접 누적해야 합니다.

다음 예시는 두 개의 `query()` 호출을 순차적으로 실행하고, 각 호출의 `total_cost_usd`를 누적 합계에 추가하며, 호출별 및 전체 비용을 모두 출력합니다:

::: code-group
```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Track cumulative cost across multiple query() calls
let totalSpend = 0;

const prompts = [
  "Read the files in src/ and summarize the architecture",
  "List all exported functions in src/auth.ts"
];

for (const prompt of prompts) {
  for await (const message of query({ prompt })) {
    if (message.type === "result") {
      totalSpend += message.total_cost_usd;
      console.log(`This call: $${message.total_cost_usd}`);
    }
  }
}

console.log(`Total spend: $${totalSpend.toFixed(4)}`);
```

```python [Python]
from claude_agent_sdk import query, ResultMessage
import asyncio


async def main():
    # Track cumulative cost across multiple query() calls
    total_spend = 0.0

    prompts = [
        "Read the files in src/ and summarize the architecture",
        "List all exported functions in src/auth.ts",
    ]

    for prompt in prompts:
        async for message in query(prompt=prompt):
            if isinstance(message, ResultMessage):
                cost = message.total_cost_usd or 0
                total_spend += cost
                print(f"This call: ${cost}")

    print(f"Total spend: ${total_spend:.4f}")


asyncio.run(main())
```
:::

## 오류, 캐싱, 토큰 불일치 처리

정확한 비용 추적을 위해 실패한 대화, 캐시 토큰 가격 책정, 가끔 발생하는 보고 불일치를 고려하세요.

### output 토큰 불일치 해결

드물게 동일한 ID를 가진 메시지에 대해 서로 다른 `output_tokens` 값을 관찰할 수 있습니다. 이런 경우:

1. **가장 높은 값을 사용하세요:** 그룹의 마지막 메시지에는 일반적으로 정확한 합계가 포함됩니다.
2. **총 비용과 대조하여 확인하세요:** 결과 메시지의 `total_cost_usd`가 권위 있는 값입니다.
3. **불일치를 보고하세요:** [Claude Code GitHub 저장소](https://github.com/anthropics/claude-code/issues)에 이슈를 제출하세요.

### 실패한 대화의 비용 추적

성공 및 오류 결과 메시지 모두 `usage`와 `total_cost_usd`를 포함합니다. 대화가 중간에 실패하더라도 실패 지점까지의 토큰은 이미 소비된 것입니다. 결과의 `subtype`에 관계없이 항상 결과 메시지에서 비용 데이터를 읽으세요.

### 캐시 토큰 추적

Agent SDK는 반복되는 콘텐츠에 대한 비용 절감을 위해 [프롬프트 캐싱](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)을 자동으로 사용합니다. 캐싱을 직접 설정할 필요가 없습니다. usage 객체에는 캐시 추적을 위한 두 가지 추가 필드가 포함됩니다:

* `cache_creation_input_tokens`: 새 캐시 항목을 생성하는 데 사용된 토큰 수(표준 input 토큰보다 높은 요금으로 청구됩니다).
* `cache_read_input_tokens`: 기존 캐시 항목에서 읽은 토큰 수(감소된 요금으로 청구됩니다).

캐싱 절감 효과를 파악하기 위해 `input_tokens`와 별도로 이를 추적하세요. TypeScript에서 이 필드들은 [`Usage`](/agent-sdk/typescript#usage) 객체에 타입이 지정되어 있습니다. Python에서는 [`ResultMessage.usage`](/agent-sdk/python#result-message) dict의 키로 나타납니다(예: `message.usage.get("cache_read_input_tokens", 0)`).

## 관련 문서

* [TypeScript SDK 레퍼런스](/agent-sdk/typescript) - 완전한 API 문서
* [SDK 개요](/agent-sdk/overview) - SDK 시작하기
* [SDK 권한](/agent-sdk/permissions) - 도구 권한 관리
