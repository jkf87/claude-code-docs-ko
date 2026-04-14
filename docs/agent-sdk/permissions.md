---
title: 권한 설정
description: 권한 모드, 훅, 선언적 허용/거부 규칙으로 에이전트의 도구 사용 방식을 제어합니다.
---

# 권한 설정

> 권한 모드, 훅, 선언적 허용/거부 규칙으로 에이전트의 도구 사용 방식을 제어합니다.

Claude Agent SDK는 Claude의 도구 사용 방식을 관리하는 권한 제어 기능을 제공합니다. 권한 모드와 규칙을 사용해 자동으로 허용할 항목을 정의하고, [`canUseTool` 콜백](/agent-sdk/user-input)으로 런타임에 나머지 항목을 처리합니다.

::: info
이 페이지는 권한 모드와 규칙을 다룹니다. 사용자가 런타임에 도구 요청을 승인하거나 거부하는 인터랙티브 승인 흐름을 구축하려면 [승인 및 사용자 입력 처리](/agent-sdk/user-input)를 참고하세요.
:::

## 권한 평가 방식

Claude가 도구를 요청하면 SDK는 다음 순서로 권한을 확인합니다.

### 1단계: Hooks

[훅](/agent-sdk/hooks)을 먼저 실행하며, 훅은 허용, 거부, 또는 다음 단계로 넘기기를 결정할 수 있습니다.

### 2단계: 거부 규칙

`deny` 규칙을 확인합니다 (`disallowed_tools` 및 [settings.json](/settings#permission-settings)에서 정의). 거부 규칙에 일치하면 `bypassPermissions` 모드에서도 해당 도구는 차단됩니다.

### 3단계: 권한 모드

활성화된 [권한 모드](#permission-modes)를 적용합니다. `bypassPermissions`는 이 단계까지 도달한 모든 것을 승인합니다. `acceptEdits`는 파일 작업을 승인합니다. 다른 모드는 다음 단계로 넘어갑니다.

### 4단계: 허용 규칙

`allow` 규칙을 확인합니다 (`allowed_tools` 및 settings.json에서 정의). 규칙에 일치하면 도구가 승인됩니다.

### 5단계: canUseTool 콜백

위 단계에서 결정되지 않으면 [`canUseTool` 콜백](/agent-sdk/user-input)을 호출해 결정을 요청합니다. `dontAsk` 모드에서는 이 단계를 건너뛰고 도구가 거부됩니다.

<img src="https://mintcdn.com/claude-code/gvy2DIUELtNA8qD3/images/agent-sdk/permissions-flow.svg?fit=max&auto=format&n=gvy2DIUELtNA8qD3&q=85&s=0ccd63043a9ffc2a34d863602e043f72" alt="권한 평가 흐름 다이어그램" width="920" height="260" data-path="images/agent-sdk/permissions-flow.svg" />

이 페이지는 **허용 및 거부 규칙**과 **권한 모드**에 집중합니다. 다른 단계에 대해서는:

* **Hooks:** 도구 요청을 허용, 거부 또는 수정하는 커스텀 코드를 실행합니다. [훅으로 실행 제어하기](/agent-sdk/hooks)를 참고하세요.
* **canUseTool 콜백:** 런타임에 사용자에게 승인을 요청합니다. [승인 및 사용자 입력 처리](/agent-sdk/user-input)를 참고하세요.

## 허용 및 거부 규칙

`allowed_tools`와 `disallowed_tools` (TypeScript: `allowedTools` / `disallowedTools`)는 위 평가 흐름의 허용 및 거부 규칙 목록에 항목을 추가합니다. 이 옵션은 도구 호출의 승인 여부를 제어하며, 도구 자체가 Claude에게 제공되는지 여부는 제어하지 않습니다.

| 옵션 | 효과 |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `allowed_tools=["Read", "Grep"]` | `Read`와 `Grep`은 자동 승인됩니다. 목록에 없는 도구는 여전히 존재하며, 권한 모드와 `canUseTool`로 넘어갑니다. |
| `disallowed_tools=["Bash"]`      | `Bash`는 항상 거부됩니다. 거부 규칙은 가장 먼저 확인되며 `bypassPermissions`를 포함한 모든 권한 모드에서 유효합니다. |

잠긴 에이전트를 만들려면 `allowedTools`와 `permissionMode: "dontAsk"`를 함께 사용하세요. 목록에 있는 도구는 승인되고, 나머지는 프롬프트 없이 즉시 거부됩니다.

```typescript  theme={null}
const options = {
  allowedTools: ["Read", "Glob", "Grep"],
  permissionMode: "dontAsk"
};
```

::: warning
**`allowed_tools`는 `bypassPermissions`를 제한하지 않습니다.** `allowed_tools`는 목록에 있는 도구를 사전 승인할 뿐입니다. 목록에 없는 도구는 허용 규칙에 일치하지 않아 권한 모드로 넘어가며, `bypassPermissions`에서는 승인됩니다. `allowed_tools=["Read"]`와 `permission_mode="bypassPermissions"`를 함께 설정하면 `Bash`, `Write`, `Edit`를 포함한 모든 도구가 승인됩니다. `bypassPermissions`에서 특정 도구를 차단하려면 `disallowed_tools`를 사용하세요.
:::

`.claude/settings.json`에서 허용, 거부, 확인 규칙을 선언적으로 설정할 수도 있습니다. SDK는 기본적으로 파일시스템 설정을 불러오지 않으므로, 이 규칙을 적용하려면 옵션에서 `setting_sources=["project"]` (TypeScript: `settingSources: ["project"]`)를 설정해야 합니다. 규칙 문법은 [권한 설정](/settings#permission-settings)을 참고하세요.

## 권한 모드 {#permission-modes}

권한 모드는 Claude의 도구 사용 방식을 전역으로 제어합니다. `query()` 호출 시 권한 모드를 설정하거나, 스트리밍 세션 중에 동적으로 변경할 수 있습니다.

### 사용 가능한 모드

SDK가 지원하는 권한 모드:

| 모드 | 설명 | 도구 동작 |
| :----------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`                | 표준 권한 동작 | 자동 승인 없음. 일치하지 않는 도구는 `canUseTool` 콜백을 트리거 |
| `dontAsk`                | 프롬프트 대신 거부 | `allowed_tools` 또는 규칙으로 사전 승인되지 않은 것은 거부됨. `canUseTool`은 호출되지 않음 |
| `acceptEdits`            | 파일 편집 자동 승인 | 파일 편집 및 [파일시스템 작업](#accept-edits-mode-acceptedits) (`mkdir`, `rm`, `mv` 등)이 자동으로 승인됨 |
| `bypassPermissions`      | 모든 권한 검사 우회 | 모든 도구가 권한 프롬프트 없이 실행됨 (주의해서 사용) |
| `plan`                   | 계획 모드 | 도구가 실행되지 않음. Claude는 변경 없이 계획만 수립 |
| `auto` (TypeScript 전용) | 모델 기반 자동 승인 | 모델 분류기가 각 도구 호출을 승인하거나 거부함. 사용 가능 여부는 [Auto 모드](/permission-modes#eliminate-prompts-with-auto-mode)를 참고 |

::: warning
**서브에이전트 상속:** `bypassPermissions`를 사용하면 모든 서브에이전트가 이 모드를 상속하며 재정의할 수 없습니다. 서브에이전트는 메인 에이전트와 다른 시스템 프롬프트를 가질 수 있고 더 적은 제약을 받을 수 있습니다. `bypassPermissions`를 활성화하면 서브에이전트에게도 승인 프롬프트 없이 전체 시스템 접근 권한이 부여됩니다.
:::

### 권한 모드 설정

쿼리를 시작할 때 권한 모드를 한 번 설정하거나, 세션이 활성화된 동안 동적으로 변경할 수 있습니다.

#### 쿼리 시 설정

쿼리를 생성할 때 `permission_mode` (Python) 또는 `permissionMode` (TypeScript)를 전달합니다. 이 모드는 동적으로 변경하지 않는 한 세션 전체에 적용됩니다.

::: code-group
```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    async for message in query(
        prompt="Help me refactor this code",
        options=ClaudeAgentOptions(
            permission_mode="default",  # Set the mode here
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  for await (const message of query({
    prompt: "Help me refactor this code",
    options: {
      permissionMode: "default" // Set the mode here
    }
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}

main();
```
:::

#### 스트리밍 중 변경

`set_permission_mode()` (Python) 또는 `setPermissionMode()` (TypeScript)를 호출해 세션 중간에 모드를 변경합니다. 새 모드는 이후의 모든 도구 요청에 즉시 적용됩니다. 이를 통해 처음에는 제한적으로 시작하다가 신뢰가 쌓이면 권한을 완화할 수 있습니다. 예를 들어 Claude의 초기 접근 방식을 검토한 후 `acceptEdits`로 전환하는 식으로 활용할 수 있습니다.

::: code-group
```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    q = query(
        prompt="Help me refactor this code",
        options=ClaudeAgentOptions(
            permission_mode="default",  # Start in default mode
        ),
    )

    # Change mode dynamically mid-session
    await q.set_permission_mode("acceptEdits")

    # Process messages with the new permission mode
    async for message in q:
        if hasattr(message, "result"):
            print(message.result)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const q = query({
    prompt: "Help me refactor this code",
    options: {
      permissionMode: "default" // Start in default mode
    }
  });

  // Change mode dynamically mid-session
  await q.setPermissionMode("acceptEdits");

  // Process messages with the new permission mode
  for await (const message of q) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}

main();
```
:::

### 모드 상세 설명

#### 편집 수락 모드 (`acceptEdits`) {#accept-edits-mode-acceptedits}

파일 작업을 자동 승인하여 Claude가 프롬프트 없이 코드를 편집할 수 있게 합니다. 파일시스템 작업이 아닌 Bash 명령과 같은 다른 도구는 여전히 일반 권한이 필요합니다.

**자동 승인되는 작업:**

* 파일 편집 (Edit, Write 도구)
* 파일시스템 명령: `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed`

두 경우 모두 작업 디렉토리 또는 `additionalDirectories` 내부 경로에만 적용됩니다. 해당 범위 외부의 경로와 보호된 경로에 대한 쓰기는 여전히 프롬프트가 표시됩니다.

**사용 시기:** Claude의 편집을 신뢰하고 빠른 반복이 필요할 때, 예를 들어 프로토타이핑 중이거나 격리된 디렉토리에서 작업할 때.

#### 묻지 않기 모드 (`dontAsk`)

권한 프롬프트를 거부로 전환합니다. `allowed_tools`, `settings.json` 허용 규칙, 또는 훅으로 사전 승인된 도구는 정상적으로 실행됩니다. 나머지는 `canUseTool`을 호출하지 않고 거부됩니다.

**사용 시기:** 헤드리스 에이전트에 고정된 명시적 도구 집합을 원하고, `canUseTool`이 없을 때의 조용한 동작보다 명확한 거부를 선호할 때.

#### 권한 우회 모드 (`bypassPermissions`)

프롬프트 없이 모든 도구 사용을 자동 승인합니다. Hooks는 여전히 실행되며 필요시 작업을 차단할 수 있습니다.

::: warning
극도의 주의를 기울여 사용하세요. 이 모드에서 Claude는 전체 시스템 접근 권한을 가집니다. 가능한 모든 작업을 신뢰하는 통제된 환경에서만 사용하세요.

`allowed_tools`는 이 모드를 제한하지 않습니다. 목록에 있는 도구뿐 아니라 모든 도구가 승인됩니다. 거부 규칙 (`disallowed_tools`), 명시적 `ask` 규칙, 훅은 모드 확인 전에 평가되므로 여전히 도구를 차단할 수 있습니다.
:::

#### 계획 모드 (`plan`)

도구 실행을 완전히 차단합니다. Claude는 코드를 분석하고 계획을 세울 수 있지만 변경할 수 없습니다. Claude는 계획을 확정하기 전에 요구사항을 명확히 하기 위해 `AskUserQuestion`을 사용할 수 있습니다. 이 프롬프트 처리에 대해서는 [승인 및 사용자 입력 처리](/agent-sdk/user-input#handle-clarifying-questions)를 참고하세요.

**사용 시기:** 코드 리뷰 중이거나 변경 사항을 적용하기 전에 승인이 필요한 경우처럼, Claude가 변경을 실행하지 않고 제안만 하기를 원할 때.

## 관련 자료

권한 평가 흐름의 다른 단계에 대해서는:

* [승인 및 사용자 입력 처리](/agent-sdk/user-input): 인터랙티브 승인 프롬프트 및 명확화 질문
* [Hooks 가이드](/agent-sdk/hooks): 에이전트 생명주기의 핵심 지점에서 커스텀 코드 실행
* [권한 규칙](/settings#permission-settings): `settings.json`의 선언적 허용/거부 규칙
