---
title: TypeScript SDK V2 인터페이스 (프리뷰)
description: 멀티턴 대화를 위한 세션 기반 send/stream 패턴을 갖춘 간소화된 V2 TypeScript Agent SDK 프리뷰입니다.
---

# TypeScript SDK V2 인터페이스 (프리뷰)

::: warning
V2 인터페이스는 **불안정한 프리뷰**입니다. 안정화 전에 피드백에 따라 API가 변경될 수 있습니다. 세션 포킹과 같은 일부 기능은 [V1 SDK](/agent-sdk/typescript)에서만 사용할 수 있습니다.
:::

V2 Claude Agent TypeScript SDK는 async 제너레이터와 yield 조정의 필요성을 제거합니다. 이를 통해 멀티턴 대화가 더 간단해집니다. 턴 간에 제너레이터 상태를 관리하는 대신, 각 턴은 별도의 `send()`/`stream()` 사이클입니다. API 표면은 세 가지 개념으로 줄어듭니다:

* `createSession()` / `resumeSession()`: 대화 시작 또는 계속
* `session.send()`: 메시지 전송
* `session.stream()`: 응답 수신

## 설치

V2 인터페이스는 기존 SDK 패키지에 포함되어 있습니다:

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## 빠른 시작

### 단일 프롬프트

세션을 유지할 필요 없는 간단한 단일턴 쿼리의 경우 `unstable_v2_prompt()`를 사용합니다. 이 예제는 수학 질문을 보내고 답변을 로그에 출력합니다:

```typescript
import { unstable_v2_prompt } from "@anthropic-ai/claude-agent-sdk";

const result = await unstable_v2_prompt("What is 2 + 2?", {
  model: "claude-opus-4-6"
});
if (result.subtype === "success") {
  console.log(result.result);
}
```

<details>
  <summary>V1에서의 동일한 작업 보기</summary>

  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const q = query({
    prompt: "What is 2 + 2?",
    options: { model: "claude-opus-4-6" }
  });

  for await (const msg of q) {
    if (msg.type === "result" && msg.subtype === "success") {
      console.log(msg.result);
    }
  }
  ```
</details>

### 기본 세션

단일 프롬프트를 넘어서는 상호작용의 경우 세션을 생성합니다. V2는 전송과 스트리밍을 별도의 단계로 분리합니다:

* `send()`는 메시지를 전달합니다
* `stream()`은 응답을 스트리밍합니다

이러한 명시적인 분리를 통해 턴 사이에 로직을 추가하기가 더 쉬워집니다 (예: 후속 메시지를 보내기 전에 응답을 처리).

아래 예제는 세션을 생성하고 Claude에게 "Hello!"를 보낸 후 텍스트 응답을 출력합니다. [`await using`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) (TypeScript 5.2+)을 사용하여 블록이 종료될 때 자동으로 세션을 닫습니다. `session.close()`를 수동으로 호출할 수도 있습니다.

```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

await using session = unstable_v2_createSession({
  model: "claude-opus-4-6"
});

await session.send("Hello!");
for await (const msg of session.stream()) {
  if (msg.type === "assistant") {
    const text = msg.message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    console.log(text);
  }
}
```

<details>
  <summary>V1에서의 동일한 작업 보기</summary>

  V1에서는 입력과 출력이 모두 단일 async 제너레이터를 통해 흐릅니다. 기본 프롬프트에서는 비슷하게 보이지만, 멀티턴 로직을 추가하려면 입력 제너레이터를 사용하도록 재구성해야 합니다.

  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const q = query({
    prompt: "Hello!",
    options: { model: "claude-opus-4-6" }
  });

  for await (const msg of q) {
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log(text);
    }
  }
  ```
</details>

### 멀티턴 대화

세션은 여러 교환에 걸쳐 컨텍스트를 유지합니다. 대화를 계속하려면 동일한 세션에서 `send()`를 다시 호출하면 됩니다. Claude는 이전 턴을 기억합니다.

이 예제는 수학 질문을 한 후 이전 답변을 참조하는 후속 질문을 합니다:

```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

await using session = unstable_v2_createSession({
  model: "claude-opus-4-6"
});

// 턴 1
await session.send("What is 5 + 3?");
for await (const msg of session.stream()) {
  if (msg.type === "assistant") {
    const text = msg.message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    console.log(text);
  }
}

// 턴 2
await session.send("Multiply that by 2");
for await (const msg of session.stream()) {
  if (msg.type === "assistant") {
    const text = msg.message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    console.log(text);
  }
}
```

<details>
  <summary>V1에서의 동일한 작업 보기</summary>

  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  async function* createInputStream() {
    yield {
      type: "user",
      session_id: "",
      message: { role: "user", content: [{ type: "text", text: "What is 5 + 3?" }] },
      parent_tool_use_id: null
    };
    yield {
      type: "user",
      session_id: "",
      message: { role: "user", content: [{ type: "text", text: "Multiply by 2" }] },
      parent_tool_use_id: null
    };
  }

  const q = query({
    prompt: createInputStream(),
    options: { model: "claude-opus-4-6" }
  });

  for await (const msg of q) {
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log(text);
    }
  }
  ```
</details>

### 세션 재개

이전 상호작용의 세션 ID가 있다면 나중에 세션을 재개할 수 있습니다. 이는 장기 실행 워크플로우나 애플리케이션 재시작 간에 대화를 유지해야 할 때 유용합니다.

이 예제는 세션을 생성하고 ID를 저장한 후 닫고, 그런 다음 대화를 재개합니다:

```typescript
import {
  unstable_v2_createSession,
  unstable_v2_resumeSession,
  type SDKMessage
} from "@anthropic-ai/claude-agent-sdk";

function getAssistantText(msg: SDKMessage): string | null {
  if (msg.type !== "assistant") return null;
  return msg.message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

const session = unstable_v2_createSession({
  model: "claude-opus-4-6"
});

await session.send("Remember this number: 42");

let sessionId: string | undefined;
for await (const msg of session.stream()) {
  sessionId = msg.session_id;
  const text = getAssistantText(msg);
  if (text) console.log("Initial response:", text);
}

console.log("Session ID:", sessionId);
session.close();

await using resumedSession = unstable_v2_resumeSession(sessionId!, {
  model: "claude-opus-4-6"
});

await resumedSession.send("What number did I ask you to remember?");
for await (const msg of resumedSession.stream()) {
  const text = getAssistantText(msg);
  if (text) console.log("Resumed response:", text);
}
```

<details>
  <summary>V1에서의 동일한 작업 보기</summary>

  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const initialQuery = query({
    prompt: "Remember this number: 42",
    options: { model: "claude-opus-4-6" }
  });

  let sessionId: string | undefined;
  for await (const msg of initialQuery) {
    sessionId = msg.session_id;
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log("Initial response:", text);
    }
  }

  console.log("Session ID:", sessionId);

  const resumedQuery = query({
    prompt: "What number did I ask you to remember?",
    options: {
      model: "claude-opus-4-6",
      resume: sessionId
    }
  });

  for await (const msg of resumedQuery) {
    if (msg.type === "assistant") {
      const text = msg.message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      console.log("Resumed response:", text);
    }
  }
  ```
</details>

### 정리

세션은 수동으로 닫거나 [`await using`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management)을 사용하여 자동으로 닫을 수 있습니다. 이는 자동 리소스 정리를 위한 TypeScript 5.2+ 기능입니다. 이전 TypeScript 버전을 사용하거나 호환성 문제가 발생하는 경우 수동 정리를 사용하세요.

**자동 정리 (TypeScript 5.2+):**

```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

await using session = unstable_v2_createSession({
  model: "claude-opus-4-6"
});
// 블록이 종료되면 세션이 자동으로 닫힙니다
```

**수동 정리:**

```typescript
import { unstable_v2_createSession } from "@anthropic-ai/claude-agent-sdk";

const session = unstable_v2_createSession({
  model: "claude-opus-4-6"
});
// ... 세션 사용 ...
session.close();
```

## API 레퍼런스

### `unstable_v2_createSession()`

멀티턴 대화를 위한 새로운 세션을 생성합니다.

```typescript
function unstable_v2_createSession(options: {
  model: string;
}): SDKSession;
```

### `unstable_v2_resumeSession()`

ID로 기존 세션을 재개합니다.

```typescript
function unstable_v2_resumeSession(
  sessionId: string,
  options: {
    model: string;
  }
): SDKSession;
```

### `unstable_v2_prompt()`

단일턴 쿼리를 위한 편의 함수입니다.

```typescript
function unstable_v2_prompt(
  prompt: string,
  options: {
    model: string;
  }
): Promise<SDKResultMessage>;
```

### SDKSession 인터페이스

```typescript
interface SDKSession {
  readonly sessionId: string;
  send(message: string | SDKUserMessage): Promise<void>;
  stream(): AsyncGenerator<SDKMessage, void>;
  close(): void;
}
```

## 기능 가용성

아직 모든 V1 기능이 V2에서 사용 가능한 것은 아닙니다. 다음 기능은 [V1 SDK](/agent-sdk/typescript)를 사용해야 합니다:

* 세션 포킹 (`forkSession` 옵션)
* 일부 고급 스트리밍 입력 패턴

## 피드백

V2 인터페이스가 안정화되기 전에 피드백을 공유해 주세요. 이슈와 제안 사항은 [GitHub Issues](https://github.com/anthropics/claude-code/issues)를 통해 보고해 주세요.

## 참고 자료

* [TypeScript SDK 레퍼런스 (V1)](/agent-sdk/typescript) - 전체 V1 SDK 문서
* [SDK 개요](/agent-sdk/overview) - 일반 SDK 개념
* [GitHub의 V2 예제](https://github.com/anthropics/claude-agent-sdk-demos/tree/main/hello-world-v2) - 작동하는 코드 예제
