---
title: Hooks로 에이전트 동작 가로채기 및 제어
description: Hooks를 사용하여 주요 실행 지점에서 에이전트 동작을 가로채고 커스터마이징하는 방법을 알아봅니다.
---

# Hooks로 에이전트 동작 가로채기 및 제어

> 주요 실행 지점에서 Hooks를 사용해 에이전트 동작을 가로채고 커스터마이징하세요.

Hooks는 에이전트 이벤트(도구 호출, 세션 시작, 실행 중단 등)에 반응하여 코드를 실행하는 콜백 함수입니다. Hooks를 사용하면 다음이 가능합니다:

* **위험한 작업 차단** — 파괴적인 셸 명령이나 무단 파일 접근처럼 실행 전에 막아야 하는 작업 차단
* **로깅 및 감사** — 컴플라이언스, 디버깅, 분석을 위해 모든 도구 호출 기록
* **입출력 변환** — 데이터 정제, 자격 증명 주입, 파일 경로 리다이렉션
* **사람의 승인 요구** — 데이터베이스 쓰기나 API 호출처럼 민감한 작업에 대한 수동 승인
* **세션 생명주기 추적** — 상태 관리, 리소스 정리, 알림 전송

이 가이드에서는 Hooks의 동작 원리, 설정 방법, 그리고 도구 차단, 입력 수정, 알림 전달 같은 일반적인 패턴의 예제를 다룹니다.

## Hooks 동작 원리

### 1단계: 이벤트 발생

에이전트 실행 중 무언가가 발생하면 SDK가 이벤트를 발생시킵니다. 도구가 호출되려 할 때(`PreToolUse`), 도구가 결과를 반환했을 때(`PostToolUse`), 서브에이전트가 시작 또는 종료했을 때, 에이전트가 유휴 상태일 때, 또는 실행이 종료되었을 때가 해당됩니다. [전체 이벤트 목록](#사용-가능한-hooks)을 참고하세요.

### 2단계: SDK가 등록된 Hooks 수집

SDK는 해당 이벤트 타입에 등록된 Hooks를 확인합니다. 여기에는 `options.hooks`에 전달한 콜백 Hooks와 설정 파일의 셸 명령 Hooks가 포함되는데, 후자는 [`settingSources`](/agent-sdk/typescript#setting-source)(TypeScript) 또는 [`setting_sources`](/agent-sdk/python#setting-source)(Python)로 명시적으로 로드해야 합니다.

### 3단계: Matchers로 실행할 Hooks 필터링

Hook에 [`matcher`](#matchers) 패턴(예: `"Write|Edit"`)이 있으면 SDK가 해당 패턴을 이벤트의 대상(예: 도구 이름)과 대조합니다. Matcher가 없는 Hooks는 해당 타입의 모든 이벤트에서 실행됩니다.

### 4단계: 콜백 함수 실행

매칭된 각 Hook의 [콜백 함수](#콜백-함수)는 현재 상황에 대한 정보(도구 이름, 인수, 세션 ID, 이벤트별 세부 정보)를 입력으로 받습니다.

### 5단계: 콜백이 결정을 반환

작업(로깅, API 호출, 유효성 검사 등)을 수행한 후, 콜백은 에이전트가 수행할 동작을 담은 [출력 객체](#outputs)를 반환합니다. 작업 허용, 차단, 입력 수정, 또는 대화에 컨텍스트 주입 등이 가능합니다.

---

다음 예제는 이 단계들을 하나로 묶어서 보여줍니다. `PreToolUse` Hook(1단계)을 `"Write|Edit"` matcher(3단계)와 함께 등록하여 파일 쓰기 도구에서만 콜백이 실행되도록 합니다. 트리거되면 콜백은 도구의 입력을 받아(4단계) 파일 경로가 `.env` 파일을 대상으로 하는지 확인하고, `permissionDecision: "deny"`를 반환하여 작업을 차단합니다(5단계):

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import (
    AssistantMessage,
    ClaudeSDKClient,
    ClaudeAgentOptions,
    HookMatcher,
    ResultMessage,
)


# 도구 호출 세부 정보를 받는 Hook 콜백 정의
async def protect_env_files(input_data, tool_use_id, context):
    # 도구의 입력 인수에서 파일 경로 추출
    file_path = input_data["tool_input"].get("file_path", "")
    file_name = file_path.split("/")[-1]

    # .env 파일을 대상으로 하는 경우 작업 차단
    if file_name == ".env":
        return {
            "hookSpecificOutput": {
                "hookEventName": input_data["hook_event_name"],
                "permissionDecision": "deny",
                "permissionDecisionReason": "Cannot modify .env files",
            }
        }

    # 빈 객체를 반환하여 작업 허용
    return {}


async def main():
    options = ClaudeAgentOptions(
        hooks={
            # PreToolUse 이벤트에 Hook 등록
            # Matcher가 Write와 Edit 도구 호출만 필터링
            "PreToolUse": [HookMatcher(matcher="Write|Edit", hooks=[protect_env_files])]
        }
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Update the database configuration")
        async for message in client.receive_response():
            # 어시스턴트 메시지와 결과 메시지만 필터링
            if isinstance(message, (AssistantMessage, ResultMessage)):
                print(message)


asyncio.run(main())
```

```typescript [TypeScript]
import { query, HookCallback, PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

// HookCallback 타입으로 Hook 콜백 정의
const protectEnvFiles: HookCallback = async (input, toolUseID, { signal }) => {
  // 타입 안전성을 위해 특정 Hook 타입으로 캐스팅
  const preInput = input as PreToolUseHookInput;

  // tool_input에 접근하기 위해 캐스팅 (SDK에서 unknown으로 타입 지정)
  const toolInput = preInput.tool_input as Record<string, unknown>;
  const filePath = toolInput?.file_path as string;
  const fileName = filePath?.split("/").pop();

  // .env 파일을 대상으로 하는 경우 작업 차단
  if (fileName === ".env") {
    return {
      hookSpecificOutput: {
        hookEventName: preInput.hook_event_name,
        permissionDecision: "deny",
        permissionDecisionReason: "Cannot modify .env files"
      }
    };
  }

  // 빈 객체를 반환하여 작업 허용
  return {};
};

for await (const message of query({
  prompt: "Update the database configuration",
  options: {
    hooks: {
      // PreToolUse 이벤트에 Hook 등록
      // Matcher가 Write와 Edit 도구 호출만 필터링
      PreToolUse: [{ matcher: "Write|Edit", hooks: [protectEnvFiles] }]
    }
  }
})) {
  // 어시스턴트 메시지와 결과 메시지만 필터링
  if (message.type === "assistant" || message.type === "result") {
    console.log(message);
  }
}
```

:::

## 사용 가능한 Hooks

SDK는 에이전트 실행의 여러 단계에 대한 Hooks를 제공합니다. 일부 Hooks는 두 SDK 모두에서 사용 가능하며, 일부는 TypeScript 전용입니다.

| Hook 이벤트          | Python SDK | TypeScript SDK | 트리거 조건                              | 사용 예시                                          |
| -------------------- | ---------- | -------------- | --------------------------------------- | -------------------------------------------------- |
| `PreToolUse`         | 지원       | 지원           | 도구 호출 요청 (차단 또는 수정 가능)    | 위험한 셸 명령 차단                                |
| `PostToolUse`        | 지원       | 지원           | 도구 실행 결과                          | 모든 파일 변경사항을 감사 로그에 기록              |
| `PostToolUseFailure` | 지원       | 지원           | 도구 실행 실패                          | 도구 오류 처리 또는 기록                           |
| `UserPromptSubmit`   | 지원       | 지원           | 사용자 프롬프트 제출                    | 프롬프트에 추가 컨텍스트 주입                      |
| `Stop`               | 지원       | 지원           | 에이전트 실행 중단                      | 종료 전 세션 상태 저장                             |
| `SubagentStart`      | 지원       | 지원           | 서브에이전트 초기화                     | 병렬 태스크 생성 추적                              |
| `SubagentStop`       | 지원       | 지원           | 서브에이전트 완료                       | 병렬 태스크 결과 집계                              |
| `PreCompact`         | 지원       | 지원           | 대화 압축 요청                          | 요약 전 전체 대화록 아카이브                       |
| `PermissionRequest`  | 지원       | 지원           | 권한 다이얼로그가 표시될 상황           | 커스텀 권한 처리                                   |
| `SessionStart`       | 미지원     | 지원           | 세션 초기화                             | 로깅 및 텔레메트리 초기화                          |
| `SessionEnd`         | 미지원     | 지원           | 세션 종료                               | 임시 리소스 정리                                   |
| `Notification`       | 지원       | 지원           | 에이전트 상태 메시지                    | 에이전트 상태 업데이트를 Slack 또는 PagerDuty로 전송 |
| `Setup`              | 미지원     | 지원           | 세션 설정/유지보수                      | 초기화 태스크 실행                                 |
| `TeammateIdle`       | 미지원     | 지원           | 팀원이 유휴 상태로 전환                 | 작업 재할당 또는 알림                              |
| `TaskCompleted`      | 미지원     | 지원           | 백그라운드 태스크 완료                  | 병렬 태스크 결과 집계                              |
| `ConfigChange`       | 미지원     | 지원           | 설정 파일 변경                          | 설정 동적 재로드                                   |
| `WorktreeCreate`     | 미지원     | 지원           | Git worktree 생성                       | 격리된 워크스페이스 추적                           |
| `WorktreeRemove`     | 미지원     | 지원           | Git worktree 삭제                       | 워크스페이스 리소스 정리                           |

## Hooks 설정

Hook을 설정하려면 에이전트 옵션(Python의 `ClaudeAgentOptions` 또는 TypeScript의 `options` 객체)의 `hooks` 필드에 전달합니다:

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[my_callback])]}
)

async with ClaudeSDKClient(options=options) as client:
    await client.query("Your prompt")
    async for message in client.receive_response():
        print(message)
```

```typescript [TypeScript]
for await (const message of query({
  prompt: "Your prompt",
  options: {
    hooks: {
      PreToolUse: [{ matcher: "Bash", hooks: [myCallback] }]
    }
  }
})) {
  console.log(message);
}
```

:::

`hooks` 옵션은 딕셔너리(Python) 또는 객체(TypeScript)로 구성됩니다:

* **키(Keys)**: [Hook 이벤트 이름](#사용-가능한-hooks) (예: `'PreToolUse'`, `'PostToolUse'`, `'Stop'`)
* **값(Values)**: [Matchers](#matchers) 배열로, 각 matcher는 선택적 필터 패턴과 [콜백 함수](#콜백-함수)를 포함합니다

### Matchers

Matchers를 사용하여 콜백이 실행될 시점을 필터링합니다. `matcher` 필드는 Hook 이벤트 타입에 따라 다른 값과 대조하는 regex 문자열입니다. 예를 들어, 도구 기반 Hooks는 도구 이름을 기준으로 매칭하고, `Notification` Hooks는 알림 타입을 기준으로 매칭합니다. 각 이벤트 타입별 전체 matcher 값 목록은 [Claude Code hooks 레퍼런스](/hooks#matcher-patterns)를 참고하세요.

| 옵션      | 타입             | 기본값      | 설명                                                                                                                                                                                                                                                                                                                                               |
| --------- | ---------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matcher` | `string`         | `undefined` | 이벤트의 필터 필드와 대조하는 Regex 패턴. 도구 Hooks의 경우 도구 이름을 기준으로 합니다. 기본 제공 도구에는 `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `Agent` 등이 있습니다 ([Tool Input Types](/agent-sdk/typescript#tool-input-types)에서 전체 목록 확인). MCP 도구는 `mcp__<server>__<action>` 패턴을 사용합니다. |
| `hooks`   | `HookCallback[]` | -           | 필수. 패턴이 매칭될 때 실행할 콜백 함수 배열                                                                                                                                                                                                                                                                                                       |
| `timeout` | `number`         | `60`        | 타임아웃 (초 단위)                                                                                                                                                                                                                                                                                                                                 |

가능하면 `matcher` 패턴을 사용하여 특정 도구를 대상으로 지정하세요. `'Bash'` matcher는 Bash 명령에서만 실행되지만, 패턴을 생략하면 해당 이벤트의 모든 발생에 콜백이 실행됩니다. 도구 기반 Hooks의 경우, Matchers는 **도구 이름**만 기준으로 필터링하며 파일 경로나 기타 인수를 기준으로 하지 않습니다. 파일 경로로 필터링하려면 콜백 내부에서 `tool_input.file_path`를 확인하세요.

::: tip
**도구 이름 확인:** 기본 제공 도구 이름의 전체 목록은 [Tool Input Types](/agent-sdk/typescript#tool-input-types)를 참고하거나, Matcher 없이 Hook을 추가하여 세션에서 발생하는 모든 도구 호출을 로깅하세요.

**MCP 도구 이름 규칙:** MCP 도구는 항상 `mcp__`로 시작하고 서버 이름과 액션이 뒤따릅니다: `mcp__<server>__<action>`. 예를 들어 `playwright`라는 서버를 설정했다면, 해당 도구들은 `mcp__playwright__browser_screenshot`, `mcp__playwright__browser_click` 등으로 이름 붙여집니다. 서버 이름은 `mcpServers` 설정에서 사용한 키에서 가져옵니다.
:::

### 콜백 함수

#### 입력값

모든 Hook 콜백은 세 가지 인수를 받습니다:

* **입력 데이터:** 이벤트 세부 정보를 포함하는 타입 지정 객체. 각 Hook 타입마다 고유한 입력 구조가 있습니다(예: `PreToolUseHookInput`에는 `tool_name`과 `tool_input`이 포함되고, `NotificationHookInput`에는 `message`가 포함됩니다). 전체 타입 정의는 [TypeScript](/agent-sdk/typescript#hook-input) 및 [Python](/agent-sdk/python#hook-input) SDK 레퍼런스를 참고하세요.
  * 모든 Hook 입력은 `session_id`, `cwd`, `hook_event_name`을 공유합니다.
  * `agent_id`와 `agent_type`은 서브에이전트 내부에서 Hook이 발생할 때 채워집니다. TypeScript에서는 기본 Hook 입력에 있어 모든 Hook 타입에서 사용 가능합니다. Python에서는 `PreToolUse`, `PostToolUse`, `PostToolUseFailure`에서만 사용 가능합니다.
* **Tool use ID** (`str | None` / `string | undefined`): 동일한 도구 호출에 대한 `PreToolUse`와 `PostToolUse` 이벤트를 연결합니다.
* **Context:** TypeScript에서는 취소를 위한 `signal` 속성(`AbortSignal`)을 포함합니다. Python에서는 이 인수가 향후 사용을 위해 예약되어 있습니다.

#### Outputs

콜백은 두 가지 카테고리의 필드를 가진 객체를 반환합니다:

* **최상위 필드(Top-level fields)**: 대화를 제어합니다. `systemMessage`는 모델에게 보이는 메시지를 대화에 주입하고, `continue`(Python에서는 `continue_`)는 이 Hook 이후에 에이전트가 계속 실행될지를 결정합니다.
* **`hookSpecificOutput`**: 현재 작업을 제어합니다. 내부 필드는 Hook 이벤트 타입에 따라 다릅니다. `PreToolUse` Hooks에서는 `permissionDecision`(`"allow"`, `"deny"`, `"ask"`), `permissionDecisionReason`, `updatedInput`을 설정합니다. `PostToolUse` Hooks에서는 `additionalContext`로 도구 결과에 정보를 추가할 수 있습니다.

변경 없이 작업을 허용하려면 `{}`를 반환합니다. SDK 콜백 Hooks는 [Claude Code 셸 명령 Hooks](/hooks#json-output)와 동일한 JSON 출력 형식을 사용합니다. SDK 타입 정의는 [TypeScript](/agent-sdk/typescript#sync-hook-json-output) 및 [Python](/agent-sdk/python#sync-hook-json-output) SDK 레퍼런스를 참고하세요.

::: info
여러 Hooks 또는 권한 규칙이 적용될 때 **deny**가 **ask**보다 우선하며, **ask**는 **allow**보다 우선합니다. 어느 Hook이라도 `deny`를 반환하면 다른 Hooks에 관계없이 작업이 차단됩니다.
:::

#### 비동기 출력

기본적으로 에이전트는 Hook이 반환될 때까지 기다립니다. Hook이 에이전트 동작에 영향을 줄 필요 없이 사이드 이펙트(로깅, 웹훅 전송)만 수행하는 경우, 비동기 출력을 반환할 수 있습니다. 이렇게 하면 에이전트가 Hook 완료를 기다리지 않고 즉시 계속 실행됩니다:

::: code-group

```python [Python]
async def async_hook(input_data, tool_use_id, context):
    # 백그라운드 태스크를 시작하고 즉시 반환
    asyncio.create_task(send_to_logging_service(input_data))
    return {"async_": True, "asyncTimeout": 30000}
```

```typescript [TypeScript]
const asyncHook: HookCallback = async (input, toolUseID, { signal }) => {
  // 백그라운드 태스크를 시작하고 즉시 반환
  sendToLoggingService(input).catch(console.error);
  return { async: true, asyncTimeout: 30000 };
};
```

:::

| 필드           | 타입     | 설명                                                                                                      |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `async`        | `true`   | 비동기 모드를 신호합니다. 에이전트가 기다리지 않고 진행합니다. Python에서는 예약어를 피하기 위해 `async_`를 사용합니다. |
| `asyncTimeout` | `number` | 백그라운드 작업의 선택적 타임아웃 (밀리초 단위)                                                           |

::: info
비동기 출력은 에이전트가 이미 진행한 이후이므로 작업을 차단, 수정하거나 컨텍스트를 주입할 수 없습니다. 로깅, 메트릭, 알림 같은 사이드 이펙트에만 사용하세요.
:::

## 예제

### 도구 입력 수정

이 예제는 Write 도구 호출을 가로채어 `file_path` 인수를 재작성하여 `/sandbox`를 앞에 추가함으로써, 모든 파일 쓰기를 샌드박스 디렉토리로 리다이렉트합니다. 콜백은 수정된 경로가 포함된 `updatedInput`과 재작성된 작업을 자동 승인하는 `permissionDecision: 'allow'`를 반환합니다:

::: code-group

```python [Python]
async def redirect_to_sandbox(input_data, tool_use_id, context):
    if input_data["hook_event_name"] != "PreToolUse":
        return {}

    if input_data["tool_name"] == "Write":
        original_path = input_data["tool_input"].get("file_path", "")
        return {
            "hookSpecificOutput": {
                "hookEventName": input_data["hook_event_name"],
                "permissionDecision": "allow",
                "updatedInput": {
                    **input_data["tool_input"],
                    "file_path": f"/sandbox{original_path}",
                },
            }
        }
    return {}
```

```typescript [TypeScript]
const redirectToSandbox: HookCallback = async (input, toolUseID, { signal }) => {
  if (input.hook_event_name !== "PreToolUse") return {};

  const preInput = input as PreToolUseHookInput;
  const toolInput = preInput.tool_input as Record<string, unknown>;
  if (preInput.tool_name === "Write") {
    const originalPath = toolInput.file_path as string;
    return {
      hookSpecificOutput: {
        hookEventName: preInput.hook_event_name,
        permissionDecision: "allow",
        updatedInput: {
          ...toolInput,
          file_path: `/sandbox${originalPath}`
        }
      }
    };
  }
  return {};
};
```

:::

::: info
`updatedInput`을 사용할 때는 반드시 `permissionDecision: 'allow'`도 함께 포함해야 합니다. 항상 원본 `tool_input`을 변경하지 않고 새 객체를 반환하세요.
:::

### 컨텍스트 추가 및 도구 차단

이 예제는 `/etc` 디렉토리에 쓰려는 모든 시도를 차단하면서, 두 가지 출력 필드를 함께 사용합니다. `permissionDecision: 'deny'`로 도구 호출을 중단하고, `systemMessage`로 에이전트가 차단 이유를 인식하고 재시도를 피할 수 있도록 대화에 리마인더를 주입합니다:

::: code-group

```python [Python]
async def block_etc_writes(input_data, tool_use_id, context):
    file_path = input_data["tool_input"].get("file_path", "")

    if file_path.startswith("/etc"):
        return {
            # 최상위 필드: 대화에 안내 주입
            "systemMessage": "Remember: system directories like /etc are protected.",
            # hookSpecificOutput: 작업 차단
            "hookSpecificOutput": {
                "hookEventName": input_data["hook_event_name"],
                "permissionDecision": "deny",
                "permissionDecisionReason": "Writing to /etc is not allowed",
            },
        }
    return {}
```

```typescript [TypeScript]
const blockEtcWrites: HookCallback = async (input, toolUseID, { signal }) => {
  const preInput = input as PreToolUseHookInput;
  const toolInput = preInput.tool_input as Record<string, unknown>;
  const filePath = toolInput?.file_path as string;

  if (filePath?.startsWith("/etc")) {
    return {
      // 최상위 필드: 대화에 안내 주입
      systemMessage: "Remember: system directories like /etc are protected.",
      // hookSpecificOutput: 작업 차단
      hookSpecificOutput: {
        hookEventName: preInput.hook_event_name,
        permissionDecision: "deny",
        permissionDecisionReason: "Writing to /etc is not allowed"
      }
    };
  }
  return {};
};
```

:::

### 특정 도구 자동 승인

기본적으로 에이전트는 특정 도구 사용 전에 권한을 요청할 수 있습니다. 이 예제는 읽기 전용 파일 시스템 도구(Read, Glob, Grep)를 `permissionDecision: 'allow'` 반환으로 자동 승인하여, 사용자 확인 없이 실행될 수 있도록 하면서 다른 모든 도구는 일반적인 권한 검사를 받도록 합니다:

::: code-group

```python [Python]
async def auto_approve_read_only(input_data, tool_use_id, context):
    if input_data["hook_event_name"] != "PreToolUse":
        return {}

    read_only_tools = ["Read", "Glob", "Grep"]
    if input_data["tool_name"] in read_only_tools:
        return {
            "hookSpecificOutput": {
                "hookEventName": input_data["hook_event_name"],
                "permissionDecision": "allow",
                "permissionDecisionReason": "Read-only tool auto-approved",
            }
        }
    return {}
```

```typescript [TypeScript]
const autoApproveReadOnly: HookCallback = async (input, toolUseID, { signal }) => {
  if (input.hook_event_name !== "PreToolUse") return {};

  const preInput = input as PreToolUseHookInput;
  const readOnlyTools = ["Read", "Glob", "Grep"];
  if (readOnlyTools.includes(preInput.tool_name)) {
    return {
      hookSpecificOutput: {
        hookEventName: preInput.hook_event_name,
        permissionDecision: "allow",
        permissionDecisionReason: "Read-only tool auto-approved"
      }
    };
  }
  return {};
};
```

:::

### 여러 Hooks 체이닝

Hooks는 배열에 나타나는 순서대로 실행됩니다. 각 Hook을 단일 책임에 집중시키고 복잡한 로직을 위해 여러 Hooks를 체이닝하세요:

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [
            HookMatcher(hooks=[rate_limiter]),  # 첫 번째: 속도 제한 확인
            HookMatcher(hooks=[authorization_check]),  # 두 번째: 권한 검증
            HookMatcher(hooks=[input_sanitizer]),  # 세 번째: 입력 정제
            HookMatcher(hooks=[audit_logger]),  # 마지막: 액션 로깅
        ]
    }
)
```

```typescript [TypeScript]
const options = {
  hooks: {
    PreToolUse: [
      { hooks: [rateLimiter] }, // 첫 번째: 속도 제한 확인
      { hooks: [authorizationCheck] }, // 두 번째: 권한 검증
      { hooks: [inputSanitizer] }, // 세 번째: 입력 정제
      { hooks: [auditLogger] } // 마지막: 액션 로깅
    ]
  }
};
```

:::

### Regex Matchers로 필터링

Regex 패턴을 사용하여 여러 도구를 매칭하세요. 이 예제는 세 가지 matchers를 서로 다른 범위로 등록합니다: 첫 번째는 파일 수정 도구에서만 `file_security_hook`을 트리거하고, 두 번째는 모든 MCP 도구(`mcp__`로 시작하는 이름)에서 `mcp_audit_hook`을 트리거하고, 세 번째는 도구 이름에 관계없이 모든 도구 호출에서 `global_logger`를 트리거합니다:

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [
            # 파일 수정 도구 매칭
            HookMatcher(matcher="Write|Edit|Delete", hooks=[file_security_hook]),
            # 모든 MCP 도구 매칭
            HookMatcher(matcher="^mcp__", hooks=[mcp_audit_hook]),
            # 전체 매칭 (matcher 없음)
            HookMatcher(hooks=[global_logger]),
        ]
    }
)
```

```typescript [TypeScript]
const options = {
  hooks: {
    PreToolUse: [
      // 파일 수정 도구 매칭
      { matcher: "Write|Edit|Delete", hooks: [fileSecurityHook] },

      // 모든 MCP 도구 매칭
      { matcher: "^mcp__", hooks: [mcpAuditHook] },

      // 전체 매칭 (matcher 없음)
      { hooks: [globalLogger] }
    ]
  }
};
```

:::

### 서브에이전트 활동 추적

`SubagentStop` Hooks를 사용하여 서브에이전트가 작업을 마쳤을 때 모니터링하세요. 전체 입력 타입은 [TypeScript](/agent-sdk/typescript#hook-input) 및 [Python](/agent-sdk/python#hook-input) SDK 레퍼런스를 참고하세요. 이 예제는 서브에이전트가 완료될 때마다 요약을 로깅합니다:

::: code-group

```python [Python]
async def subagent_tracker(input_data, tool_use_id, context):
    # 서브에이전트가 완료되면 세부 정보 로깅
    print(f"[SUBAGENT] Completed: {input_data['agent_id']}")
    print(f"  Transcript: {input_data['agent_transcript_path']}")
    print(f"  Tool use ID: {tool_use_id}")
    print(f"  Stop hook active: {input_data.get('stop_hook_active')}")
    return {}


options = ClaudeAgentOptions(
    hooks={"SubagentStop": [HookMatcher(hooks=[subagent_tracker])]}
)
```

```typescript [TypeScript]
import { HookCallback, SubagentStopHookInput } from "@anthropic-ai/claude-agent-sdk";

const subagentTracker: HookCallback = async (input, toolUseID, { signal }) => {
  // 서브에이전트별 필드에 접근하기 위해 SubagentStopHookInput으로 캐스팅
  const subInput = input as SubagentStopHookInput;

  // 서브에이전트가 완료되면 세부 정보 로깅
  console.log(`[SUBAGENT] Completed: ${subInput.agent_id}`);
  console.log(`  Transcript: ${subInput.agent_transcript_path}`);
  console.log(`  Tool use ID: ${toolUseID}`);
  console.log(`  Stop hook active: ${subInput.stop_hook_active}`);
  return {};
};

const options = {
  hooks: {
    SubagentStop: [{ hooks: [subagentTracker] }]
  }
};
```

:::

### Hooks에서 HTTP 요청 만들기

Hooks는 HTTP 요청 같은 비동기 작업을 수행할 수 있습니다. 처리되지 않은 예외가 에이전트를 중단시킬 수 있으므로, 에러를 Hook 내부에서 처리하고 외부로 전파시키지 마세요.

이 예제는 각 도구가 완료된 후 웹훅을 전송하여 어떤 도구가 실행되었는지와 실행 시간을 기록합니다. Hook이 에러를 처리하므로 웹훅 실패가 에이전트를 중단시키지 않습니다:

::: code-group

```python [Python]
import asyncio
import json
import urllib.request
from datetime import datetime


def _send_webhook(tool_name):
    """외부 웹훅에 도구 사용 데이터를 POST하는 동기 헬퍼."""
    data = json.dumps(
        {
            "tool": tool_name,
            "timestamp": datetime.now().isoformat(),
        }
    ).encode()
    req = urllib.request.Request(
        "https://api.example.com/webhook",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    urllib.request.urlopen(req)


async def webhook_notifier(input_data, tool_use_id, context):
    # 도구가 완료된 후에만 실행 (PostToolUse), 실행 전이 아님
    if input_data["hook_event_name"] != "PostToolUse":
        return {}

    try:
        # 이벤트 루프 차단을 피하기 위해 스레드에서 블로킹 HTTP 호출 실행
        await asyncio.to_thread(_send_webhook, input_data["tool_name"])
    except Exception as e:
        # 에러를 로깅하되 raise하지 않음. 웹훅 실패가 에이전트를 멈춰서는 안 됨
        print(f"Webhook request failed: {e}")

    return {}
```

```typescript [TypeScript]
import { query, HookCallback, PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

const webhookNotifier: HookCallback = async (input, toolUseID, { signal }) => {
  // 도구가 완료된 후에만 실행 (PostToolUse), 실행 전이 아님
  if (input.hook_event_name !== "PostToolUse") return {};

  try {
    await fetch("https://api.example.com/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: (input as PostToolUseHookInput).tool_name,
        timestamp: new Date().toISOString()
      }),
      // Hook 타임아웃 시 요청이 취소되도록 signal 전달
      signal
    });
  } catch (error) {
    // 취소와 다른 에러를 별도로 처리
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Webhook request cancelled");
    }
    // re-throw하지 않음. 웹훅 실패가 에이전트를 멈춰서는 안 됨
  }

  return {};
};

// PostToolUse Hook으로 등록
for await (const message of query({
  prompt: "Refactor the auth module",
  options: {
    hooks: {
      PostToolUse: [{ hooks: [webhookNotifier] }]
    }
  }
})) {
  console.log(message);
}
```

:::

### Slack으로 알림 전달

`Notification` Hooks를 사용하여 에이전트의 시스템 알림을 수신하고 외부 서비스로 전달합니다. 알림은 특정 이벤트 타입에서 발생합니다: `permission_prompt`(Claude가 권한이 필요할 때), `idle_prompt`(Claude가 입력을 기다릴 때), `auth_success`(인증 완료), `elicitation_dialog`(Claude가 사용자에게 프롬프트를 표시할 때). 각 알림에는 사람이 읽을 수 있는 설명이 담긴 `message` 필드와 선택적으로 `title`이 포함됩니다.

이 예제는 모든 알림을 Slack 채널로 전달합니다. [Slack incoming webhook URL](https://api.slack.com/messaging/webhooks)이 필요하며, Slack 워크스페이스에 앱을 추가하고 incoming webhooks를 활성화하여 생성합니다:

::: code-group

```python [Python]
import asyncio
import json
import urllib.request

from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher


def _send_slack_notification(message):
    """incoming webhook을 통해 Slack에 메시지를 전송하는 동기 헬퍼."""
    data = json.dumps({"text": f"Agent status: {message}"}).encode()
    req = urllib.request.Request(
        "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    urllib.request.urlopen(req)


async def notification_handler(input_data, tool_use_id, context):
    try:
        # 이벤트 루프 차단을 피하기 위해 스레드에서 블로킹 HTTP 호출 실행
        await asyncio.to_thread(_send_slack_notification, input_data.get("message", ""))
    except Exception as e:
        print(f"Failed to send notification: {e}")

    # 빈 객체 반환. Notification Hooks는 에이전트 동작을 수정하지 않음
    return {}


async def main():
    options = ClaudeAgentOptions(
        hooks={
            # Notification 이벤트에 Hook 등록 (matcher 불필요)
            "Notification": [HookMatcher(hooks=[notification_handler])],
        },
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Analyze this codebase")
        async for message in client.receive_response():
            print(message)


asyncio.run(main())
```

```typescript [TypeScript]
import { query, HookCallback, NotificationHookInput } from "@anthropic-ai/claude-agent-sdk";

// Slack으로 알림을 전송하는 Hook 콜백 정의
const notificationHandler: HookCallback = async (input, toolUseID, { signal }) => {
  // message 필드에 접근하기 위해 NotificationHookInput으로 캐스팅
  const notification = input as NotificationHookInput;

  try {
    // Slack incoming webhook으로 알림 메시지 POST
    await fetch("https://hooks.slack.com/services/YOUR/WEBHOOK/URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Agent status: ${notification.message}`
      }),
      // Hook 타임아웃 시 요청이 취소되도록 signal 전달
      signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Notification cancelled");
    } else {
      console.error("Failed to send notification:", error);
    }
  }

  // 빈 객체 반환. Notification Hooks는 에이전트 동작을 수정하지 않음
  return {};
};

// Notification 이벤트에 Hook 등록 (matcher 불필요)
for await (const message of query({
  prompt: "Analyze this codebase",
  options: {
    hooks: {
      Notification: [{ hooks: [notificationHandler] }]
    }
  }
})) {
  console.log(message);
}
```

:::

## 일반적인 문제 해결

### Hook이 실행되지 않는 경우

* Hook 이벤트 이름이 정확하고 대소문자가 맞는지 확인하세요 (`preToolUse`가 아닌 `PreToolUse`)
* Matcher 패턴이 도구 이름과 정확히 일치하는지 확인하세요
* `options.hooks`의 올바른 이벤트 타입 아래에 Hook이 있는지 확인하세요
* `Stop`, `SubagentStop` 같은 비도구 Hooks의 경우, Matchers는 다른 필드를 기준으로 매칭합니다 ([matcher 패턴](/hooks#matcher-patterns) 참고)
* 세션이 Hooks를 실행하기 전에 종료되므로 에이전트가 [`max_turns`](/agent-sdk/python#claude-agent-options) 제한에 도달하면 Hooks가 실행되지 않을 수 있습니다

### Matcher가 예상대로 필터링되지 않는 경우

Matchers는 **도구 이름**만 매칭하며, 파일 경로나 기타 인수는 매칭하지 않습니다. 파일 경로로 필터링하려면 Hook 내부에서 `tool_input.file_path`를 확인하세요:

```typescript
const myHook: HookCallback = async (input, toolUseID, { signal }) => {
  const preInput = input as PreToolUseHookInput;
  const toolInput = preInput.tool_input as Record<string, unknown>;
  const filePath = toolInput?.file_path as string;
  if (!filePath?.endsWith(".md")) return {}; // 마크다운 파일이 아닌 경우 건너뜀
  // 마크다운 파일 처리...
  return {};
};
```

### Hook 타임아웃

* `HookMatcher` 설정에서 `timeout` 값을 늘리세요
* TypeScript에서는 세 번째 콜백 인수의 `AbortSignal`을 사용하여 취소를 우아하게 처리하세요

### 도구가 예상치 않게 차단되는 경우

* 모든 `PreToolUse` Hooks에서 `permissionDecision: 'deny'` 반환이 있는지 확인하세요
* Hooks에 로깅을 추가하여 `permissionDecisionReason`을 확인하세요
* Matcher 패턴이 너무 넓지 않은지 확인하세요 (빈 matcher는 모든 도구와 매칭됩니다)

### 수정된 입력이 적용되지 않는 경우

* `updatedInput`이 최상위 레벨이 아닌 `hookSpecificOutput` 안에 있는지 확인하세요:

  ```typescript
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      updatedInput: { command: "new command" }
    }
  };
  ```

* 입력 수정이 적용되려면 `permissionDecision: 'allow'`도 함께 반환해야 합니다

* 어떤 Hook 타입의 출력인지 식별하기 위해 `hookSpecificOutput`에 `hookEventName`을 포함하세요

### Python에서 세션 Hooks를 사용할 수 없는 경우

`SessionStart`와 `SessionEnd`는 TypeScript에서 SDK 콜백 Hooks로 등록할 수 있지만, Python SDK에서는 사용 불가합니다(`HookEvent`에 포함되지 않음). Python에서는 설정 파일(예: `.claude/settings.json`)에 정의된 [셸 명령 Hooks](/hooks#hook-events)로만 사용 가능합니다. SDK 애플리케이션에서 셸 명령 Hooks를 로드하려면 [`setting_sources`](/agent-sdk/python#setting-source) 또는 [`settingSources`](/agent-sdk/typescript#setting-source)로 적절한 설정 소스를 포함하세요:

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    setting_sources=["project"],  # .claude/settings.json (Hooks 포함) 로드
)
```

```typescript [TypeScript]
const options = {
  settingSources: ["project"] // .claude/settings.json (Hooks 포함) 로드
};
```

:::

Python SDK 콜백으로 초기화 로직을 실행하려면, `client.receive_response()`의 첫 번째 메시지를 트리거로 사용하세요.

### 서브에이전트 권한 프롬프트 중복

여러 서브에이전트를 생성할 때 각 서브에이전트가 별도로 권한을 요청할 수 있습니다. 서브에이전트는 자동으로 상위 에이전트의 권한을 상속받지 않습니다. 반복적인 프롬프트를 방지하려면 `PreToolUse` Hooks를 사용하여 특정 도구를 자동 승인하거나, 서브에이전트 세션에 적용되는 권한 규칙을 설정하세요.

### 서브에이전트로 인한 재귀 Hook 루프

서브에이전트를 생성하는 `UserPromptSubmit` Hook은 해당 서브에이전트가 동일한 Hook을 트리거하면 무한 루프를 만들 수 있습니다. 이를 방지하려면:

* 생성하기 전에 Hook 입력에서 서브에이전트 표시를 확인하세요
* 공유 변수 또는 세션 상태를 사용하여 이미 서브에이전트 내부에 있는지 추적하세요
* 최상위 에이전트 세션에서만 실행되도록 Hooks 범위를 지정하세요

### systemMessage가 출력에 나타나지 않는 경우

`systemMessage` 필드는 모델이 볼 수 있는 컨텍스트를 대화에 추가하지만, 모든 SDK 출력 모드에서 나타나지 않을 수 있습니다. Hook 결정 사항을 애플리케이션에 노출해야 한다면 별도로 로깅하거나 전용 출력 채널을 사용하세요.

## 관련 리소스

* [Claude Code hooks 레퍼런스](/hooks): 전체 JSON 입출력 스키마, 이벤트 문서, matcher 패턴
* [Claude Code hooks 가이드](/hooks-guide): 셸 명령 Hook 예제 및 연습
* [TypeScript SDK 레퍼런스](/agent-sdk/typescript): Hook 타입, 입출력 정의, 설정 옵션
* [Python SDK 레퍼런스](/agent-sdk/python): Hook 타입, 입출력 정의, 설정 옵션
* [권한(Permissions)](/agent-sdk/permissions): 에이전트가 할 수 있는 작업 제어
* [커스텀 도구(Custom tools)](/agent-sdk/custom-tools): 에이전트 기능을 확장하는 도구 빌드
