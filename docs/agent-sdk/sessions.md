---
title: 세션 다루기
description: SDK가 에이전트 대화 기록을 어떻게 유지하는지, 그리고 이전 실행으로 돌아가기 위해 continue, resume, fork를 언제 사용해야 하는지 설명합니다.
---

# 세션 다루기

세션은 에이전트가 작업하는 동안 SDK가 축적하는 대화 기록입니다. 여기에는 프롬프트, 에이전트가 수행한 모든 도구 호출, 모든 도구 결과, 모든 응답이 포함됩니다. SDK는 나중에 돌아올 수 있도록 자동으로 디스크에 기록합니다.

세션으로 돌아온다는 것은 에이전트가 이전의 완전한 컨텍스트를 갖는다는 의미입니다. 이미 읽은 파일, 이미 수행한 분석, 이미 내린 결정 등이 모두 포함됩니다. 후속 질문을 하거나, 중단에서 복구하거나, 다른 접근 방식을 시도하기 위해 분기할 수 있습니다.

::: info
세션은 **대화**를 유지하며, 파일시스템은 유지하지 않습니다. 에이전트가 수행한 파일 변경 사항을 스냅샷으로 저장하고 되돌리려면 [파일 체크포인팅](/agent-sdk/file-checkpointing)을 사용하세요.
:::

이 가이드에서는 애플리케이션에 맞는 접근 방식 선택, 세션을 자동으로 추적하는 SDK 인터페이스, 세션 ID를 캡처하고 `resume` 및 `fork`를 수동으로 사용하는 방법, 그리고 호스트 간 세션 재개 시 알아야 할 사항을 다룹니다.

## 접근 방식 선택

필요한 세션 처리 수준은 애플리케이션의 형태에 따라 다릅니다. 세션 관리는 컨텍스트를 공유해야 하는 여러 프롬프트를 전송할 때 필요합니다. 단일 `query()` 호출 내에서 에이전트는 이미 필요한 만큼 여러 턴을 수행하며, 권한 프롬프트와 `AskUserQuestion`은 [루프 내에서 처리](/agent-sdk/user-input)됩니다(호출을 종료하지 않음).

| 빌드하는 것                                                          | 사용할 방법                                                                                                                                                      |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 단일 작업: 프롬프트 하나, 후속 없음                                  | 추가 작업 없음. `query()` 호출 하나로 처리됩니다.                                                                                                                |
| 단일 프로세스 내 멀티턴 채팅                                         | [`ClaudeSDKClient` (Python) 또는 `continue: true` (TypeScript)](#자동-세션-관리). SDK가 ID 처리 없이 세션을 추적합니다.                                         |
| 프로세스 재시작 후 이어받기                                          | `continue_conversation=True` (Python) / `continue: true` (TypeScript). ID 없이 디렉토리의 가장 최근 세션을 재개합니다.                                          |
| 특정 과거 세션 재개 (가장 최근이 아닌)                               | 세션 ID를 캡처하고 `resume`에 전달합니다.                                                                                                                        |
| 원본을 잃지 않고 대안 접근 방식 시도                                 | 세션을 포크합니다.                                                                                                                                               |
| 상태 없는 작업, 디스크에 저장하지 않음 (TypeScript 전용)            | [`persistSession: false`](/agent-sdk/typescript#options)를 설정합니다. 세션은 호출 기간 동안 메모리에만 존재합니다. Python은 항상 디스크에 저장합니다.           |

### Continue, resume, fork

Continue, resume, fork는 `query()`에 설정하는 옵션 필드입니다 (Python의 [`ClaudeAgentOptions`](/agent-sdk/python#claude-agent-options), TypeScript의 [`Options`](/agent-sdk/typescript#options)).

**Continue**와 **resume**은 모두 기존 세션을 이어받아 추가합니다. 차이점은 세션을 찾는 방법입니다.

* **Continue**는 현재 디렉토리에서 가장 최근 세션을 찾습니다. 아무것도 추적할 필요가 없습니다. 앱이 한 번에 하나의 대화를 실행하는 경우 잘 작동합니다.
* **Resume**은 특정 세션 ID를 받습니다. ID를 직접 추적해야 합니다. 여러 세션이 있거나 (예: 멀티유저 앱에서 사용자당 하나) 가장 최근이 아닌 세션으로 돌아가려는 경우에 필요합니다.

**Fork**는 다릅니다. 원본 기록의 복사본으로 시작하는 새 세션을 만들지만, 그 시점부터 분기됩니다. 원본은 변경되지 않은 채로 유지됩니다. 돌아갈 옵션을 유지하면서 다른 방향을 시도하려면 포크를 사용하세요.

## 자동 세션 관리

두 SDK 모두 호출 간에 세션 상태를 자동으로 추적하는 인터페이스를 제공하므로, ID를 수동으로 전달할 필요가 없습니다. 단일 프로세스 내 멀티턴 대화에 사용하세요.

### Python: `ClaudeSDKClient`

[`ClaudeSDKClient`](/agent-sdk/python#claude-sdk-client)는 내부적으로 세션 ID를 처리합니다. `client.query()`에 대한 각 호출은 자동으로 같은 세션을 이어갑니다. [`client.receive_response()`](/agent-sdk/python#claude-sdk-client)를 호출하여 현재 쿼리의 메시지를 순회합니다. 클라이언트는 비동기 컨텍스트 매니저로 사용해야 합니다.

이 예시는 동일한 `client`에 대해 두 개의 쿼리를 실행합니다. 첫 번째는 에이전트에게 모듈 분석을 요청하고, 두 번째는 해당 모듈을 리팩토링하도록 요청합니다. 두 호출 모두 동일한 클라이언트 인스턴스를 통해 이루어지므로, 두 번째 쿼리는 명시적인 `resume`이나 세션 ID 없이 첫 번째 쿼리의 전체 컨텍스트를 갖습니다.

```python Python
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ResultMessage,
    TextBlock,
)


def print_response(message):
    """메시지에서 사람이 읽을 수 있는 부분만 출력합니다."""
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
    elif isinstance(message, ResultMessage):
        cost = (
            f"${message.total_cost_usd:.4f}"
            if message.total_cost_usd is not None
            else "N/A"
        )
        print(f"[done: {message.subtype}, cost: {cost}]")


async def main():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Edit", "Glob", "Grep"],
    )

    async with ClaudeSDKClient(options=options) as client:
        # 첫 번째 쿼리: 클라이언트가 세션 ID를 내부적으로 캡처합니다
        await client.query("Analyze the auth module")
        async for message in client.receive_response():
            print_response(message)

        # 두 번째 쿼리: 자동으로 같은 세션을 이어갑니다
        await client.query("Now refactor it to use JWT")
        async for message in client.receive_response():
            print_response(message)


asyncio.run(main())
```

`ClaudeSDKClient`와 독립형 `query()` 함수 중 언제 무엇을 사용해야 하는지에 대한 자세한 내용은 [Python SDK 레퍼런스](/agent-sdk/python#choosing-between-query-and-claude-sdk-client)를 참조하세요.

### TypeScript: `continue: true`

안정 버전 TypeScript SDK(`query()` 함수, 이 문서에서 V1이라고도 함)는 Python의 `ClaudeSDKClient`와 같은 세션 보유 클라이언트 객체가 없습니다. 대신, 이후의 각 `query()` 호출에 `continue: true`를 전달하면 SDK가 현재 디렉토리의 가장 최근 세션을 이어받습니다. ID 추적이 필요하지 않습니다.

이 예시는 두 개의 별도 `query()` 호출을 수행합니다. 첫 번째는 새 세션을 생성하고, 두 번째는 `continue: true`를 설정하여 SDK가 디스크에서 가장 최근 세션을 찾아 재개하도록 합니다. 에이전트는 첫 번째 호출의 전체 컨텍스트를 갖습니다.

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

// 첫 번째 쿼리: 새 세션을 생성합니다
for await (const message of query({
  prompt: "Analyze the auth module",
  options: { allowedTools: ["Read", "Glob", "Grep"] }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

// 두 번째 쿼리: continue: true가 가장 최근 세션을 재개합니다
for await (const message of query({
  prompt: "Now refactor it to use JWT",
  options: {
    continue: true,
    allowedTools: ["Read", "Edit", "Write", "Glob", "Grep"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

::: info
TypeScript SDK의 [V2 프리뷰](/agent-sdk/typescript-v2-preview)도 있습니다. `send` / `stream` 패턴을 사용하는 `createSession()`을 제공하며, 느낌상 Python의 `ClaudeSDKClient`에 더 가깝습니다. V2는 불안정하며 API가 변경될 수 있습니다. 이 문서의 나머지 부분은 안정적인 V1 `query()` 함수를 사용합니다.
:::

## `query()`에서 세션 옵션 사용하기

### 세션 ID 캡처

resume과 fork는 세션 ID가 필요합니다. 결과 메시지의 `session_id` 필드에서 읽을 수 있습니다 (Python의 [`ResultMessage`](/agent-sdk/python#result-message), TypeScript의 [`SDKResultMessage`](/agent-sdk/typescript#sdk-result-message)). 이 필드는 성공 여부와 관계없이 모든 결과에 존재합니다. TypeScript에서는 init `SystemMessage`의 직접 필드로 더 일찍 사용할 수 있으며, Python에서는 `SystemMessage.data` 안에 중첩되어 있습니다.

::: code-group

```python Python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def main():
    session_id = None

    async for message in query(
        prompt="Analyze the auth module and suggest improvements",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep"],
        ),
    ):
        if isinstance(message, ResultMessage):
            session_id = message.session_id
            if message.subtype == "success":
                print(message.result)

    print(f"Session ID: {session_id}")
    return session_id


session_id = asyncio.run(main())
```

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

let sessionId: string | undefined;

for await (const message of query({
  prompt: "Analyze the auth module and suggest improvements",
  options: { allowedTools: ["Read", "Glob", "Grep"] }
})) {
  if (message.type === "result") {
    sessionId = message.session_id;
    if (message.subtype === "success") {
      console.log(message.result);
    }
  }
}

console.log(`Session ID: ${sessionId}`);
```

:::

### ID로 재개하기

`resume`에 세션 ID를 전달하여 해당 특정 세션으로 돌아갑니다. 에이전트는 세션이 중단된 곳부터 전체 컨텍스트와 함께 이어받습니다. 재개가 필요한 일반적인 이유:

* **완료된 작업 후속 처리.** 에이전트가 이미 분석을 완료했고, 파일을 다시 읽지 않고 그 분석에 따라 행동하도록 하려는 경우.
* **제한에서 복구.** 첫 번째 실행이 `error_max_turns` 또는 `error_max_budget_usd`로 종료된 경우 ([결과 처리](/agent-sdk/agent-loop#handle-the-result) 참조). 더 높은 제한으로 재개합니다.
* **프로세스 재시작.** 종료 전에 ID를 캡처했고 대화를 복원하려는 경우.

이 예시는 [세션 ID 캡처](#세션-id-캡처)의 세션을 후속 프롬프트로 재개합니다. 재개하기 때문에 에이전트는 이미 이전 분석을 컨텍스트에 갖고 있습니다.

::: code-group

```python Python
# 이전 세션에서 코드를 분석했으므로, 그 분석을 바탕으로 진행합니다
async for message in query(
    prompt="Now implement the refactoring you suggested",
    options=ClaudeAgentOptions(
        resume=session_id,
        allowed_tools=["Read", "Edit", "Write", "Glob", "Grep"],
    ),
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(message.result)
```

```typescript TypeScript
// 이전 세션에서 코드를 분석했으므로, 그 분석을 바탕으로 진행합니다
for await (const message of query({
  prompt: "Now implement the refactoring you suggested",
  options: {
    resume: sessionId,
    allowedTools: ["Read", "Edit", "Write", "Glob", "Grep"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

:::

::: tip
`resume` 호출이 예상한 기록 대신 새 세션을 반환하는 경우, 가장 일반적인 원인은 `cwd`가 일치하지 않는 것입니다. 세션은 `~/.claude/projects/<encoded-cwd>/*.jsonl`에 저장되며, `<encoded-cwd>`는 영문자·숫자가 아닌 모든 문자가 `-`로 대체된 절대 작업 디렉토리입니다 (예: `/Users/me/proj`는 `-Users-me-proj`가 됩니다). resume 호출이 다른 디렉토리에서 실행되면 SDK가 잘못된 위치를 찾습니다. 세션 파일도 현재 머신에 존재해야 합니다.
:::

### 포크로 대안 탐색하기

포크는 원본 기록의 복사본으로 시작하지만 그 시점부터 분기하는 새 세션을 생성합니다. 포크는 자체 세션 ID를 갖고, 원본의 ID와 기록은 변경되지 않습니다. 결과적으로 별도로 재개할 수 있는 두 개의 독립적인 세션이 생깁니다.

::: info
포크는 대화 기록을 분기하며, 파일시스템을 분기하지 않습니다. 포크된 에이전트가 파일을 편집하면 그 변경 사항은 실제로 반영되며 같은 디렉토리에서 작업하는 모든 세션에서 볼 수 있습니다. 파일 변경 사항을 분기하고 되돌리려면 [파일 체크포인팅](/agent-sdk/file-checkpointing)을 사용하세요.
:::

이 예시는 [세션 ID 캡처](#세션-id-캡처)를 기반으로 합니다. `session_id`에서 이미 auth 모듈을 분석했고, JWT 중심의 흐름을 잃지 않으면서 OAuth2를 탐색하려는 상황입니다. 첫 번째 블록은 세션을 포크하고 포크의 ID(`forked_id`)를 캡처합니다. 두 번째 블록은 원본 `session_id`를 재개하여 JWT 경로를 계속합니다. 이제 두 개의 별개 기록을 가리키는 두 개의 세션 ID가 있습니다.

::: code-group

```python Python
# 포크: session_id에서 새 세션으로 분기합니다
forked_id = None
async for message in query(
    prompt="Instead of JWT, implement OAuth2 for the auth module",
    options=ClaudeAgentOptions(
        resume=session_id,
        fork_session=True,
    ),
):
    if isinstance(message, ResultMessage):
        forked_id = message.session_id  # 포크의 ID, session_id와 다릅니다
        if message.subtype == "success":
            print(message.result)

print(f"Forked session: {forked_id}")

# 원본 세션은 그대로입니다; 재개하면 JWT 흐름이 계속됩니다
async for message in query(
    prompt="Continue with the JWT approach",
    options=ClaudeAgentOptions(resume=session_id),
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(message.result)
```

```typescript TypeScript
// 포크: sessionId에서 새 세션으로 분기합니다
let forkedId: string | undefined;

for await (const message of query({
  prompt: "Instead of JWT, implement OAuth2 for the auth module",
  options: {
    resume: sessionId,
    forkSession: true
  }
})) {
  if (message.type === "system" && message.subtype === "init") {
    forkedId = message.session_id; // 포크의 ID, sessionId와 다릅니다
  }
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

console.log(`Forked session: ${forkedId}`);

// 원본 세션은 그대로입니다; 재개하면 JWT 흐름이 계속됩니다
for await (const message of query({
  prompt: "Continue with the JWT approach",
  options: { resume: sessionId }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

:::

## 호스트 간 세션 재개

세션 파일은 생성한 머신에 로컬로 저장됩니다. 다른 호스트(CI 워커, 임시 컨테이너, 서버리스)에서 세션을 재개하려면 두 가지 옵션이 있습니다.

* **세션 파일을 이동합니다.** 첫 번째 실행에서 `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`을 유지하고, `resume`을 호출하기 전에 새 호스트의 같은 경로로 복원합니다. `cwd`가 일치해야 합니다.
* **세션 재개에 의존하지 않습니다.** 필요한 결과(분석 출력, 결정 사항, 파일 diff)를 애플리케이션 상태로 캡처하여 새 세션의 프롬프트에 전달합니다. 트랜스크립트 파일을 이동하는 것보다 이 방법이 더 견고한 경우가 많습니다.

두 SDK 모두 디스크의 세션을 열거하고 메시지를 읽는 함수를 제공합니다. TypeScript의 [`listSessions()`](/agent-sdk/typescript#list-sessions)와 [`getSessionMessages()`](/agent-sdk/typescript#get-session-messages), Python의 [`list_sessions()`](/agent-sdk/python#list-sessions)와 [`get_session_messages()`](/agent-sdk/python#get-session-messages). 이를 사용하여 커스텀 세션 선택기, 정리 로직, 또는 트랜스크립트 뷰어를 만들 수 있습니다.

두 SDK 모두 개별 세션을 조회하고 수정하는 함수도 제공합니다. Python의 [`get_session_info()`](/agent-sdk/python#get-session-info), [`rename_session()`](/agent-sdk/python#rename-session), [`tag_session()`](/agent-sdk/python#tag-session), TypeScript의 [`getSessionInfo()`](/agent-sdk/typescript#get-session-info), [`renameSession()`](/agent-sdk/typescript#rename-session), [`tagSession()`](/agent-sdk/typescript#tag-session). 태그로 세션을 정리하거나 사람이 읽기 쉬운 제목을 붙이는 데 사용하세요.

## 관련 리소스

* [에이전트 루프 작동 방식](/agent-sdk/agent-loop): 세션 내 턴, 메시지, 컨텍스트 축적 이해하기
* [파일 체크포인팅](/agent-sdk/file-checkpointing): 세션 간 파일 변경 사항 추적 및 되돌리기
* [Python `ClaudeAgentOptions`](/agent-sdk/python#claude-agent-options): Python용 전체 세션 옵션 레퍼런스
* [TypeScript `Options`](/agent-sdk/typescript#options): TypeScript용 전체 세션 옵션 레퍼런스
