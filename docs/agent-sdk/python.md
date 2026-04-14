---
title: "Agent SDK 레퍼런스 - Python"
description: "Python Agent SDK의 전체 API 레퍼런스로, 모든 함수, 타입 및 클래스를 포함합니다."
---

# Agent SDK 레퍼런스 - Python

> Python Agent SDK의 전체 API 레퍼런스로, 모든 함수, 타입 및 클래스를 포함합니다.

## 설치

```bash
pip install claude-agent-sdk
```

## `query()`와 `ClaudeSDKClient` 중 선택하기

Python SDK는 Claude Code와 상호작용하는 두 가지 방법을 제공합니다:

### 간단 비교

| 기능 | `query()` | `ClaudeSDKClient` |
| :--- | :--- | :--- |
| **세션** | 매번 새 세션 생성 | 동일 세션 재사용 |
| **대화** | 단일 교환 | 동일 컨텍스트에서 여러 교환 |
| **연결** | 자동 관리 | 수동 제어 |
| **스트리밍 입력** | ✅ 지원 | ✅ 지원 |
| **인터럽트** | ❌ 미지원 | ✅ 지원 |
| **Hooks** | ✅ 지원 | ✅ 지원 |
| **커스텀 도구** | ✅ 지원 | ✅ 지원 |
| **대화 이어가기** | ❌ 매번 새 세션 | ✅ 대화 유지 |
| **사용 사례** | 일회성 작업 | 지속적인 대화 |

### `query()` 사용 시점 (매번 새 세션)

**적합한 경우:**

* 대화 기록이 필요 없는 일회성 질문
* 이전 교환의 컨텍스트가 필요 없는 독립적인 작업
* 단순 자동화 스크립트
* 매번 새로 시작하고 싶을 때

### `ClaudeSDKClient` 사용 시점 (지속적 대화)

**적합한 경우:**

* **대화 이어가기** - Claude가 컨텍스트를 기억해야 할 때
* **후속 질문** - 이전 응답을 기반으로 구축할 때
* **대화형 애플리케이션** - 채팅 인터페이스, REPL
* **응답 기반 로직** - 다음 동작이 Claude의 응답에 따라 달라질 때
* **세션 제어** - 대화 수명 주기를 명시적으로 관리할 때

## 함수

### `query()`

각 상호작용마다 새 세션을 생성합니다. 메시지가 도착하면 yield하는 비동기 이터레이터를 반환합니다. `query()`를 호출할 때마다 이전 상호작용의 기억 없이 새로 시작합니다.

```python
async def query(
    *,
    prompt: str | AsyncIterable[dict[str, Any]],
    options: ClaudeAgentOptions | None = None,
    transport: Transport | None = None
) -> AsyncIterator[Message]
```

#### 매개변수

| 매개변수 | 타입 | 설명 |
| :--- | :--- | :--- |
| `prompt` | `str \| AsyncIterable[dict]` | 문자열 또는 스트리밍 모드용 비동기 이터러블로 된 입력 프롬프트 |
| `options` | `ClaudeAgentOptions \| None` | 선택적 설정 객체 (None이면 `ClaudeAgentOptions()`로 기본 설정) |
| `transport` | `Transport \| None` | CLI 프로세스와 통신하기 위한 선택적 커스텀 트랜스포트 |

#### 반환값

대화에서 메시지를 yield하는 `AsyncIterator[Message]`를 반환합니다.

#### 예제 - 옵션 사용

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    options = ClaudeAgentOptions(
        system_prompt="You are an expert Python developer",
        permission_mode="acceptEdits",
        cwd="/home/user/project",
    )

    async for message in query(prompt="Create a Python web server", options=options):
        print(message)


asyncio.run(main())
```

### `tool()`

타입 안전성을 갖춘 MCP 도구를 정의하는 데코레이터입니다.

```python
def tool(
    name: str,
    description: str,
    input_schema: type | dict[str, Any],
    annotations: ToolAnnotations | None = None
) -> Callable[[Callable[[Any], Awaitable[dict[str, Any]]]], SdkMcpTool[Any]]
```

#### 매개변수

| 매개변수 | 타입 | 설명 |
| :--- | :--- | :--- |
| `name` | `str` | 도구의 고유 식별자 |
| `description` | `str` | 도구가 하는 일에 대한 사람이 읽을 수 있는 설명 |
| `input_schema` | `type \| dict[str, Any]` | 도구의 입력 매개변수를 정의하는 스키마 (아래 참조) |
| `annotations` | [`ToolAnnotations`](#tool-annotations)` \| None` | 클라이언트에 동작 힌트를 제공하는 선택적 MCP 도구 어노테이션 |

#### 입력 스키마 옵션

1. **간단한 타입 매핑** (권장):

   ```python
   {"text": str, "count": int, "enabled": bool}
   ```

2. **JSON Schema 형식** (복잡한 유효성 검사용):
   ```python
   {
       "type": "object",
       "properties": {
           "text": {"type": "string"},
           "count": {"type": "integer", "minimum": 0},
       },
       "required": ["text"],
   }
   ```

#### 반환값

도구 구현을 래핑하고 `SdkMcpTool` 인스턴스를 반환하는 데코레이터 함수입니다.

#### 예제

```python
from claude_agent_sdk import tool
from typing import Any


@tool("greet", "Greet a user", {"name": str})
async def greet(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": f"Hello, {args['name']}!"}]}
```

#### `ToolAnnotations`

`mcp.types`에서 재내보내기됨 (`from claude_agent_sdk import ToolAnnotations`로도 사용 가능). 모든 필드는 선택적 힌트이며, 클라이언트는 보안 결정에 이를 의존해서는 안 됩니다.

| 필드 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `title` | `str \| None` | `None` | 도구의 사람이 읽을 수 있는 제목 |
| `readOnlyHint` | `bool \| None` | `False` | `True`이면 도구가 환경을 수정하지 않음 |
| `destructiveHint` | `bool \| None` | `True` | `True`이면 도구가 파괴적 업데이트를 수행할 수 있음 (`readOnlyHint`가 `False`일 때만 의미 있음) |
| `idempotentHint` | `bool \| None` | `False` | `True`이면 같은 인자로 반복 호출해도 추가 효과 없음 (`readOnlyHint`가 `False`일 때만 의미 있음) |
| `openWorldHint` | `bool \| None` | `True` | `True`이면 도구가 외부 엔티티와 상호작용함 (예: 웹 검색). `False`이면 도구의 도메인이 폐쇄적임 (예: 메모리 도구) |

```python
from claude_agent_sdk import tool, ToolAnnotations
from typing import Any


@tool(
    "search",
    "Search the web",
    {"query": str},
    annotations=ToolAnnotations(readOnlyHint=True, openWorldHint=True),
)
async def search(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": f"Results for: {args['query']}"}]}
```

### `create_sdk_mcp_server()`

Python 애플리케이션 내에서 실행되는 인프로세스 MCP 서버를 생성합니다.

```python
def create_sdk_mcp_server(
    name: str,
    version: str = "1.0.0",
    tools: list[SdkMcpTool[Any]] | None = None
) -> McpSdkServerConfig
```

#### 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `name` | `str` | - | 서버의 고유 식별자 |
| `version` | `str` | `"1.0.0"` | 서버 버전 문자열 |
| `tools` | `list[SdkMcpTool[Any]] \| None` | `None` | `@tool` 데코레이터로 생성된 도구 함수 목록 |

#### 반환값

`ClaudeAgentOptions.mcp_servers`에 전달할 수 있는 `McpSdkServerConfig` 객체를 반환합니다.

#### 예제

```python
from claude_agent_sdk import tool, create_sdk_mcp_server


@tool("add", "Add two numbers", {"a": float, "b": float})
async def add(args):
    return {"content": [{"type": "text", "text": f"Sum: {args['a'] + args['b']}"}]}


@tool("multiply", "Multiply two numbers", {"a": float, "b": float})
async def multiply(args):
    return {"content": [{"type": "text", "text": f"Product: {args['a'] * args['b']}"}]}


calculator = create_sdk_mcp_server(
    name="calculator",
    version="2.0.0",
    tools=[add, multiply],  # 데코레이팅된 함수 전달
)

# Claude와 함께 사용
options = ClaudeAgentOptions(
    mcp_servers={"calc": calculator},
    allowed_tools=["mcp__calc__add", "mcp__calc__multiply"],
)
```

### `list_sessions()`

메타데이터와 함께 과거 세션 목록을 조회합니다. 프로젝트 디렉터리로 필터링하거나 모든 프로젝트의 세션을 나열할 수 있습니다. 동기식으로 즉시 반환합니다.

```python
def list_sessions(
    directory: str | None = None,
    limit: int | None = None,
    include_worktrees: bool = True
) -> list[SDKSessionInfo]
```

#### 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `directory` | `str \| None` | `None` | 세션을 조회할 디렉터리. 생략 시 모든 프로젝트의 세션을 반환 |
| `limit` | `int \| None` | `None` | 반환할 최대 세션 수 |
| `include_worktrees` | `bool` | `True` | `directory`가 git 저장소 안에 있을 때 모든 worktree 경로의 세션을 포함 |

#### 반환 타입: `SDKSessionInfo`

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `session_id` | `str` | 고유 세션 식별자 |
| `summary` | `str` | 표시 제목: 사용자 지정 제목, 자동 생성 요약 또는 첫 번째 프롬프트 |
| `last_modified` | `int` | 에포크 이후 밀리초 단위의 마지막 수정 시간 |
| `file_size` | `int \| None` | 세션 파일 크기(바이트) (원격 저장소 백엔드의 경우 `None`) |
| `custom_title` | `str \| None` | 사용자 설정 세션 제목 |
| `first_prompt` | `str \| None` | 세션의 첫 번째 의미 있는 사용자 프롬프트 |
| `git_branch` | `str \| None` | 세션 종료 시점의 Git 브랜치 |
| `cwd` | `str \| None` | 세션의 작업 디렉터리 |
| `tag` | `str \| None` | 사용자 설정 세션 태그 ([`tag_session()`](#tag-session) 참조) |
| `created_at` | `int \| None` | 에포크 이후 밀리초 단위의 세션 생성 시간 |

#### 예제

프로젝트의 최근 10개 세션을 출력합니다. 결과는 `last_modified` 내림차순으로 정렬되므로 첫 번째 항목이 가장 최신입니다. 모든 프로젝트를 검색하려면 `directory`를 생략하세요.

```python
from claude_agent_sdk import list_sessions

for session in list_sessions(directory="/path/to/project", limit=10):
    print(f"{session.summary} ({session.session_id})")
```

### `get_session_messages()`

과거 세션의 메시지를 가져옵니다. 동기식으로 즉시 반환합니다.

```python
def get_session_messages(
    session_id: str,
    directory: str | None = None,
    limit: int | None = None,
    offset: int = 0
) -> list[SessionMessage]
```

#### 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `session_id` | `str` | 필수 | 메시지를 가져올 세션 ID |
| `directory` | `str \| None` | `None` | 조회할 프로젝트 디렉터리. 생략 시 모든 프로젝트를 검색 |
| `limit` | `int \| None` | `None` | 반환할 최대 메시지 수 |
| `offset` | `int` | `0` | 처음부터 건너뛸 메시지 수 |

#### 반환 타입: `SessionMessage`

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `type` | `Literal["user", "assistant"]` | 메시지 역할 |
| `uuid` | `str` | 고유 메시지 식별자 |
| `session_id` | `str` | 세션 식별자 |
| `message` | `Any` | 원시 메시지 내용 |
| `parent_tool_use_id` | `None` | 향후 사용을 위해 예약됨 |

#### 예제

```python
from claude_agent_sdk import list_sessions, get_session_messages

sessions = list_sessions(limit=1)
if sessions:
    messages = get_session_messages(sessions[0].session_id)
    for msg in messages:
        print(f"[{msg.type}] {msg.uuid}")
```

### `get_session_info()`

전체 프로젝트 디렉터리를 스캔하지 않고 ID로 단일 세션의 메타데이터를 읽습니다. 동기식으로 즉시 반환합니다.

```python
def get_session_info(
    session_id: str,
    directory: str | None = None,
) -> SDKSessionInfo | None
```

#### 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `session_id` | `str` | 필수 | 조회할 세션의 UUID |
| `directory` | `str \| None` | `None` | 프로젝트 디렉터리 경로. 생략 시 모든 프로젝트 디렉터리를 검색 |

세션을 찾지 못하면 [`SDKSessionInfo`](#반환-타입-sdksessioninfo)를 반환하거나 `None`을 반환합니다.

#### 예제

프로젝트 디렉터리를 스캔하지 않고 단일 세션의 메타데이터를 조회합니다. 이전 실행에서 세션 ID를 이미 가지고 있을 때 유용합니다.

```python
from claude_agent_sdk import get_session_info

info = get_session_info("550e8400-e29b-41d4-a716-446655440000")
if info:
    print(f"{info.summary} (branch: {info.git_branch}, tag: {info.tag})")
```

### `rename_session()`

커스텀 제목 항목을 추가하여 세션 이름을 변경합니다. 반복 호출해도 안전하며, 가장 최근 제목이 적용됩니다. 동기식입니다.

```python
def rename_session(
    session_id: str,
    title: str,
    directory: str | None = None,
) -> None
```

#### 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `session_id` | `str` | 필수 | 이름을 변경할 세션의 UUID |
| `title` | `str` | 필수 | 새 제목. 공백 제거 후 비어 있지 않아야 함 |
| `directory` | `str \| None` | `None` | 프로젝트 디렉터리 경로. 생략 시 모든 프로젝트 디렉터리를 검색 |

`session_id`가 유효한 UUID가 아니거나 `title`이 비어 있으면 `ValueError`를 발생시키고, 세션을 찾을 수 없으면 `FileNotFoundError`를 발생시킵니다.

#### 예제

가장 최근 세션의 이름을 변경하여 나중에 쉽게 찾을 수 있게 합니다. 새 제목은 이후 읽기에서 [`SDKSessionInfo.custom_title`](#반환-타입-sdksessioninfo)에 나타납니다.

```python
from claude_agent_sdk import list_sessions, rename_session

sessions = list_sessions(directory="/path/to/project", limit=1)
if sessions:
    rename_session(sessions[0].session_id, "Refactor auth module")
```

### `tag_session()`

세션에 태그를 지정합니다. `None`을 전달하면 태그를 지웁니다. 반복 호출해도 안전하며, 가장 최근 태그가 적용됩니다. 동기식입니다.

```python
def tag_session(
    session_id: str,
    tag: str | None,
    directory: str | None = None,
) -> None
```

#### 매개변수

| 매개변수 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `session_id` | `str` | 필수 | 태그할 세션의 UUID |
| `tag` | `str \| None` | 필수 | 태그 문자열 또는 지우려면 `None`. 저장 전 유니코드 정리됨 |
| `directory` | `str \| None` | `None` | 프로젝트 디렉터리 경로. 생략 시 모든 프로젝트 디렉터리를 검색 |

`session_id`가 유효한 UUID가 아니거나 `tag`가 정리 후 비어 있으면 `ValueError`를 발생시키고, 세션을 찾을 수 없으면 `FileNotFoundError`를 발생시킵니다.

#### 예제

세션에 태그를 지정한 후 나중에 해당 태그로 필터링합니다. 기존 태그를 지우려면 `None`을 전달합니다.

```python
from claude_agent_sdk import list_sessions, tag_session

# 세션 태그 지정
tag_session("550e8400-e29b-41d4-a716-446655440000", "needs-review")

# 나중에: 해당 태그가 있는 모든 세션 찾기
for session in list_sessions(directory="/path/to/project"):
    if session.tag == "needs-review":
        print(session.summary)
```

## 클래스

### `ClaudeSDKClient`

**여러 교환에 걸쳐 대화 세션을 유지합니다.** 이는 TypeScript SDK의 `query()` 함수가 내부적으로 작동하는 방식과 동일한 Python 구현입니다 - 대화를 이어갈 수 있는 클라이언트 객체를 생성합니다.

#### 주요 기능

* **세션 연속성**: 여러 `query()` 호출에 걸쳐 대화 컨텍스트 유지
* **동일 대화**: 세션이 이전 메시지를 보존
* **인터럽트 지원**: 실행 중인 작업 중단 가능
* **명시적 수명 주기**: 세션 시작과 종료를 직접 제어
* **응답 기반 흐름**: 응답에 반응하여 후속 메시지 전송 가능
* **커스텀 도구 및 Hook**: `@tool` 데코레이터로 생성한 커스텀 도구와 Hook 지원

```python
class ClaudeSDKClient:
    def __init__(self, options: ClaudeAgentOptions | None = None, transport: Transport | None = None)
    async def connect(self, prompt: str | AsyncIterable[dict] | None = None) -> None
    async def query(self, prompt: str | AsyncIterable[dict], session_id: str = "default") -> None
    async def receive_messages(self) -> AsyncIterator[Message]
    async def receive_response(self) -> AsyncIterator[Message]
    async def interrupt(self) -> None
    async def set_permission_mode(self, mode: str) -> None
    async def set_model(self, model: str | None = None) -> None
    async def rewind_files(self, user_message_id: str) -> None
    async def get_mcp_status(self) -> McpStatusResponse
    async def reconnect_mcp_server(self, server_name: str) -> None
    async def toggle_mcp_server(self, server_name: str, enabled: bool) -> None
    async def stop_task(self, task_id: str) -> None
    async def get_server_info(self) -> dict[str, Any] | None
    async def disconnect(self) -> None
```

#### 메서드

| 메서드 | 설명 |
| :--- | :--- |
| `__init__(options)` | 선택적 설정으로 클라이언트 초기화 |
| `connect(prompt)` | 선택적 초기 프롬프트 또는 메시지 스트림으로 Claude에 연결 |
| `query(prompt, session_id)` | 스트리밍 모드에서 새 요청 전송 |
| `receive_messages()` | Claude에서 모든 메시지를 비동기 이터레이터로 수신 |
| `receive_response()` | ResultMessage를 포함하여 메시지를 수신 |
| `interrupt()` | 인터럽트 신호 전송 (스트리밍 모드에서만 작동) |
| `set_permission_mode(mode)` | 현재 세션의 권한 모드 변경 |
| `set_model(model)` | 현재 세션의 모델 변경. `None`을 전달하면 기본값으로 재설정 |
| `rewind_files(user_message_id)` | 지정된 사용자 메시지 시점의 파일 상태로 복원. `enable_file_checkpointing=True` 필요. [파일 체크포인팅](/agent-sdk/file-checkpointing) 참조 |
| `get_mcp_status()` | 구성된 모든 MCP 서버의 상태 조회. [`McpStatusResponse`](#mcp-status-response) 반환 |
| `reconnect_mcp_server(server_name)` | 실패했거나 연결이 끊어진 MCP 서버에 재연결 시도 |
| `toggle_mcp_server(server_name, enabled)` | 세션 중간에 MCP 서버 활성화 또는 비활성화. 비활성화하면 해당 도구가 제거됨 |
| `stop_task(task_id)` | 실행 중인 백그라운드 작업 중지. 메시지 스트림에 상태가 `"stopped"`인 [`TaskNotificationMessage`](#tasknotificationmessage)가 뒤따름 |
| `get_server_info()` | 세션 ID 및 기능을 포함한 서버 정보 조회 |
| `disconnect()` | Claude와의 연결 해제 |

#### 컨텍스트 매니저 지원

클라이언트는 자동 연결 관리를 위한 비동기 컨텍스트 매니저로 사용할 수 있습니다:

```python
async with ClaudeSDKClient() as client:
    await client.query("Hello Claude")
    async for message in client.receive_response():
        print(message)
```

> **중요:** 메시지를 순회할 때 `break`를 사용하여 조기 종료하면 asyncio 정리 문제가 발생할 수 있습니다. 대신 순회가 자연스럽게 완료되도록 하거나 플래그를 사용하여 필요한 것을 찾았는지 추적하세요.

#### 예제 - 대화 이어가기

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient, AssistantMessage, TextBlock, ResultMessage


async def main():
    async with ClaudeSDKClient() as client:
        # 첫 번째 질문
        await client.query("What's the capital of France?")

        # 응답 처리
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")

        # 후속 질문 - 세션이 이전 컨텍스트를 유지
        await client.query("What's the population of that city?")

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")

        # 또 다른 후속 질문 - 여전히 동일한 대화
        await client.query("What are some famous landmarks there?")

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")


asyncio.run(main())
```

#### 예제 - ClaudeSDKClient에서 스트리밍 입력

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient


async def message_stream():
    """동적으로 메시지를 생성합니다."""
    yield {
        "type": "user",
        "message": {"role": "user", "content": "Analyze the following data:"},
    }
    await asyncio.sleep(0.5)
    yield {
        "type": "user",
        "message": {"role": "user", "content": "Temperature: 25°C, Humidity: 60%"},
    }
    await asyncio.sleep(0.5)
    yield {
        "type": "user",
        "message": {"role": "user", "content": "What patterns do you see?"},
    }


async def main():
    async with ClaudeSDKClient() as client:
        # Claude에 입력 스트리밍
        await client.query(message_stream())

        # 응답 처리
        async for message in client.receive_response():
            print(message)

        # 동일 세션에서 후속 질문
        await client.query("Should we be concerned about these readings?")

        async for message in client.receive_response():
            print(message)


asyncio.run(main())
```

#### 예제 - 인터럽트 사용

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, ResultMessage


async def interruptible_task():
    options = ClaudeAgentOptions(allowed_tools=["Bash"], permission_mode="acceptEdits")

    async with ClaudeSDKClient(options=options) as client:
        # 장시간 실행 작업 시작
        await client.query("Count from 1 to 100 slowly, using the bash sleep command")

        # 잠시 실행되도록 허용
        await asyncio.sleep(2)

        # 작업 인터럽트
        await client.interrupt()
        print("Task interrupted!")

        # 인터럽트된 작업의 메시지 드레인 (ResultMessage 포함)
        async for message in client.receive_response():
            if isinstance(message, ResultMessage):
                print(f"Interrupted task finished with subtype={message.subtype!r}")
                # 인터럽트된 작업의 subtype은 "error_during_execution"

        # 새 명령 전송
        await client.query("Just say hello instead")

        # 새 응답 수신
        async for message in client.receive_response():
            if isinstance(message, ResultMessage) and message.subtype == "success":
                print(f"New result: {message.result}")


asyncio.run(interruptible_task())
```

::: info
**인터럽트 후 버퍼 동작:** `interrupt()`는 중지 신호를 보내지만 메시지 버퍼를 지우지 않습니다. 인터럽트된 작업이 이미 생성한 메시지(subtype이 `"error_during_execution"`인 `ResultMessage` 포함)는 스트림에 남아 있습니다. 새 쿼리의 응답을 읽기 전에 `receive_response()`로 이를 드레인해야 합니다. `interrupt()` 직후 새 쿼리를 보내고 `receive_response()`를 한 번만 호출하면, 새 쿼리의 응답이 아니라 인터럽트된 작업의 메시지를 받게 됩니다.
:::

#### 예제 - 고급 권한 제어

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
from claude_agent_sdk.types import (
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)


async def custom_permission_handler(
    tool_name: str, input_data: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    """도구 권한에 대한 커스텀 로직."""

    # 시스템 디렉터리에 대한 쓰기 차단
    if tool_name == "Write" and input_data.get("file_path", "").startswith("/system/"):
        return PermissionResultDeny(
            message="System directory write not allowed", interrupt=True
        )

    # 민감한 파일 작업 리다이렉트
    if tool_name in ["Write", "Edit"] and "config" in input_data.get("file_path", ""):
        safe_path = f"./sandbox/{input_data['file_path']}"
        return PermissionResultAllow(
            updated_input={**input_data, "file_path": safe_path}
        )

    # 그 외 모두 허용
    return PermissionResultAllow(updated_input=input_data)


async def main():
    options = ClaudeAgentOptions(
        can_use_tool=custom_permission_handler, allowed_tools=["Read", "Write", "Edit"]
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Update the system config file")

        async for message in client.receive_response():
            # 샌드박스 경로를 대신 사용
            print(message)


asyncio.run(main())
```

## 타입

::: info
**`@dataclass` vs `TypedDict`:** 이 SDK는 두 종류의 타입을 사용합니다. `@dataclass`로 데코레이팅된 클래스(`ResultMessage`, `AgentDefinition`, `TextBlock` 등)는 런타임에 객체 인스턴스이며 속성 접근을 지원합니다: `msg.result`. `TypedDict`로 정의된 클래스(`ThinkingConfigEnabled`, `McpStdioServerConfig`, `SyncHookJSONOutput` 등)는 **런타임에 일반 dict**이며 키 접근이 필요합니다: `config["budget_tokens"]`이지 `config.budget_tokens`가 아닙니다. `ClassName(field=value)` 호출 구문은 둘 다 작동하지만, dataclass만 속성이 있는 객체를 생성합니다.
:::

### `SdkMcpTool`

`@tool` 데코레이터로 생성된 SDK MCP 도구 정의입니다.

```python
@dataclass
class SdkMcpTool(Generic[T]):
    name: str
    description: str
    input_schema: type[T] | dict[str, Any]
    handler: Callable[[T], Awaitable[dict[str, Any]]]
    annotations: ToolAnnotations | None = None
```

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `name` | `str` | 도구의 고유 식별자 |
| `description` | `str` | 사람이 읽을 수 있는 설명 |
| `input_schema` | `type[T] \| dict[str, Any]` | 입력 유효성 검사를 위한 스키마 |
| `handler` | `Callable[[T], Awaitable[dict[str, Any]]]` | 도구 실행을 처리하는 비동기 함수 |
| `annotations` | `ToolAnnotations \| None` | 선택적 MCP 도구 어노테이션 (예: `readOnlyHint`, `destructiveHint`, `openWorldHint`). `mcp.types`에서 제공 |

### `Transport`

커스텀 트랜스포트 구현을 위한 추상 기본 클래스입니다. Claude 프로세스와 커스텀 채널(예: 로컬 서브프로세스 대신 원격 연결)을 통해 통신하는 데 사용합니다.

::: warning
이것은 저수준 내부 API입니다. 향후 릴리스에서 인터페이스가 변경될 수 있습니다. 커스텀 구현은 인터페이스 변경에 맞춰 업데이트해야 합니다.
:::

```python
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any


class Transport(ABC):
    @abstractmethod
    async def connect(self) -> None: ...

    @abstractmethod
    async def write(self, data: str) -> None: ...

    @abstractmethod
    def read_messages(self) -> AsyncIterator[dict[str, Any]]: ...

    @abstractmethod
    async def close(self) -> None: ...

    @abstractmethod
    def is_ready(self) -> bool: ...

    @abstractmethod
    async def end_input(self) -> None: ...
```

| 메서드 | 설명 |
| :--- | :--- |
| `connect()` | 트랜스포트를 연결하고 통신 준비 |
| `write(data)` | 트랜스포트에 원시 데이터(JSON + 개행) 쓰기 |
| `read_messages()` | 파싱된 JSON 메시지를 yield하는 비동기 이터레이터 |
| `close()` | 연결을 닫고 리소스 정리 |
| `is_ready()` | 트랜스포트가 송수신 가능하면 `True` 반환 |
| `end_input()` | 입력 스트림 닫기 (예: 서브프로세스 트랜스포트의 stdin 닫기) |

임포트: `from claude_agent_sdk import Transport`

### `ClaudeAgentOptions`

Claude Code 쿼리를 위한 설정 dataclass입니다.

```python
@dataclass
class ClaudeAgentOptions:
    tools: list[str] | ToolsPreset | None = None
    allowed_tools: list[str] = field(default_factory=list)
    system_prompt: str | SystemPromptPreset | None = None
    mcp_servers: dict[str, McpServerConfig] | str | Path = field(default_factory=dict)
    permission_mode: PermissionMode | None = None
    continue_conversation: bool = False
    resume: str | None = None
    max_turns: int | None = None
    max_budget_usd: float | None = None
    disallowed_tools: list[str] = field(default_factory=list)
    model: str | None = None
    fallback_model: str | None = None
    betas: list[SdkBeta] = field(default_factory=list)
    output_format: dict[str, Any] | None = None
    permission_prompt_tool_name: str | None = None
    cwd: str | Path | None = None
    cli_path: str | Path | None = None
    settings: str | None = None
    add_dirs: list[str | Path] = field(default_factory=list)
    env: dict[str, str] = field(default_factory=dict)
    extra_args: dict[str, str | None] = field(default_factory=dict)
    max_buffer_size: int | None = None
    debug_stderr: Any = sys.stderr  # Deprecated
    stderr: Callable[[str], None] | None = None
    can_use_tool: CanUseTool | None = None
    hooks: dict[HookEvent, list[HookMatcher]] | None = None
    user: str | None = None
    include_partial_messages: bool = False
    fork_session: bool = False
    agents: dict[str, AgentDefinition] | None = None
    setting_sources: list[SettingSource] | None = None
    sandbox: SandboxSettings | None = None
    plugins: list[SdkPluginConfig] = field(default_factory=list)
    max_thinking_tokens: int | None = None  # Deprecated: thinking을 대신 사용
    thinking: ThinkingConfig | None = None
    effort: Literal["low", "medium", "high", "max"] | None = None
    enable_file_checkpointing: bool = False
```

| 속성 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `tools` | `list[str] \| ToolsPreset \| None` | `None` | 도구 설정. Claude Code의 기본 도구에는 `{"type": "preset", "preset": "claude_code"}` 사용 |
| `allowed_tools` | `list[str]` | `[]` | 프롬프트 없이 자동 승인할 도구. Claude를 이 도구들로만 제한하지 않으며, 목록에 없는 도구는 `permission_mode`와 `can_use_tool`로 처리됨. 도구를 차단하려면 `disallowed_tools` 사용. [권한](/agent-sdk/permissions#allow-and-deny-rules) 참조 |
| `system_prompt` | `str \| SystemPromptPreset \| None` | `None` | 시스템 프롬프트 설정. 커스텀 프롬프트는 문자열 전달, Claude Code의 시스템 프롬프트에는 `{"type": "preset", "preset": "claude_code"}` 사용. `"append"`를 추가하여 프리셋 확장 가능 |
| `mcp_servers` | `dict[str, McpServerConfig] \| str \| Path` | `{}` | MCP 서버 설정 또는 설정 파일 경로 |
| `permission_mode` | `PermissionMode \| None` | `None` | 도구 사용을 위한 권한 모드 |
| `continue_conversation` | `bool` | `False` | 가장 최근 대화 이어가기 |
| `resume` | `str \| None` | `None` | 재개할 세션 ID |
| `max_turns` | `int \| None` | `None` | 최대 에이전트 턴 수 (도구 사용 왕복 횟수) |
| `max_budget_usd` | `float \| None` | `None` | 세션의 최대 예산 (USD) |
| `disallowed_tools` | `list[str]` | `[]` | 항상 거부할 도구. 거부 규칙이 먼저 확인되며 `allowed_tools`와 `permission_mode`(`bypassPermissions` 포함)를 재정의 |
| `enable_file_checkpointing` | `bool` | `False` | 되감기를 위한 파일 변경 추적 활성화. [파일 체크포인팅](/agent-sdk/file-checkpointing) 참조 |
| `model` | `str \| None` | `None` | 사용할 Claude 모델 |
| `fallback_model` | `str \| None` | `None` | 기본 모델 실패 시 사용할 대체 모델 |
| `betas` | `list[SdkBeta]` | `[]` | 활성화할 베타 기능. 사용 가능한 옵션은 [`SdkBeta`](#sdkbeta) 참조 |
| `output_format` | `dict[str, Any] \| None` | `None` | 구조화된 응답을 위한 출력 형식 (예: `{"type": "json_schema", "schema": {...}}`). 자세한 내용은 [구조화된 출력](/agent-sdk/structured-outputs) 참조 |
| `permission_prompt_tool_name` | `str \| None` | `None` | 권한 프롬프트용 MCP 도구 이름 |
| `cwd` | `str \| Path \| None` | `None` | 현재 작업 디렉터리 |
| `cli_path` | `str \| Path \| None` | `None` | Claude Code CLI 실행 파일의 커스텀 경로 |
| `settings` | `str \| None` | `None` | 설정 파일 경로 |
| `add_dirs` | `list[str \| Path]` | `[]` | Claude가 접근할 수 있는 추가 디렉터리 |
| `env` | `dict[str, str]` | `{}` | 환경 변수 |
| `extra_args` | `dict[str, str \| None]` | `{}` | CLI에 직접 전달할 추가 CLI 인수 |
| `max_buffer_size` | `int \| None` | `None` | CLI stdout 버퍼링 시 최대 바이트 |
| `debug_stderr` | `Any` | `sys.stderr` | *더 이상 사용되지 않음* - 디버그 출력용 파일 유사 객체. 대신 `stderr` 콜백 사용 |
| `stderr` | `Callable[[str], None] \| None` | `None` | CLI의 stderr 출력을 위한 콜백 함수 |
| `can_use_tool` | [`CanUseTool`](#canusetool) ` \| None` | `None` | 도구 권한 콜백 함수. 자세한 내용은 [권한 타입](#canusetool) 참조 |
| `hooks` | `dict[HookEvent, list[HookMatcher]] \| None` | `None` | 이벤트 인터셉트를 위한 Hook 설정 |
| `user` | `str \| None` | `None` | 사용자 식별자 |
| `include_partial_messages` | `bool` | `False` | 부분 메시지 스트리밍 이벤트 포함. 활성화하면 [`StreamEvent`](#streamevent) 메시지가 yield됨 |
| `fork_session` | `bool` | `False` | `resume`으로 재개할 때 원래 세션을 계속하는 대신 새 세션 ID로 분기 |
| `agents` | `dict[str, AgentDefinition] \| None` | `None` | 프로그래밍 방식으로 정의된 서브에이전트 |
| `plugins` | `list[SdkPluginConfig]` | `[]` | 로컬 경로에서 커스텀 플러그인 로드. 자세한 내용은 [플러그인](/agent-sdk/plugins) 참조 |
| `sandbox` | [`SandboxSettings`](#sandboxsettings) ` \| None` | `None` | 프로그래밍 방식으로 샌드박스 동작 구성. 자세한 내용은 [샌드박스 설정](#sandboxsettings) 참조 |
| `setting_sources` | `list[SettingSource] \| None` | `None` (설정 없음) | 로드할 파일 시스템 설정 제어. 생략 시 파일 시스템 설정이 로드되지 않음. **참고:** CLAUDE.md 파일을 로드하려면 `"project"`를 포함해야 함 |
| `max_thinking_tokens` | `int \| None` | `None` | *더 이상 사용되지 않음* - thinking 블록의 최대 토큰 수. 대신 `thinking` 사용 |
| `thinking` | [`ThinkingConfig`](#thinkingconfig) ` \| None` | `None` | 확장 사고 동작 제어. `max_thinking_tokens`보다 우선 |
| `effort` | `Literal["low", "medium", "high", "max"] \| None` | `None` | 사고 깊이의 노력 수준 |

### `OutputFormat`

구조화된 출력 유효성 검사 설정입니다. `ClaudeAgentOptions`의 `output_format` 필드에 `dict`로 전달합니다:

```python
# output_format의 예상 dict 형태
{
    "type": "json_schema",
    "schema": {...},  # JSON Schema 정의
}
```

| 필드 | 필수 | 설명 |
| :--- | :--- | :--- |
| `type` | 예 | JSON Schema 유효성 검사의 경우 `"json_schema"` |
| `schema` | 예 | 출력 유효성 검사를 위한 JSON Schema 정의 |

### `SystemPromptPreset`

Claude Code의 프리셋 시스템 프롬프트에 선택적 추가를 할 수 있는 설정입니다.

```python
class SystemPromptPreset(TypedDict):
    type: Literal["preset"]
    preset: Literal["claude_code"]
    append: NotRequired[str]
```

| 필드 | 필수 | 설명 |
| :--- | :--- | :--- |
| `type` | 예 | 프리셋 시스템 프롬프트를 사용하려면 `"preset"` |
| `preset` | 예 | Claude Code의 시스템 프롬프트를 사용하려면 `"claude_code"` |
| `append` | 아니오 | 프리셋 시스템 프롬프트에 추가할 지시사항 |

### `SettingSource`

SDK가 설정을 로드할 파일 시스템 기반 구성 소스를 제어합니다.

```python
SettingSource = Literal["user", "project", "local"]
```

| 값 | 설명 | 위치 |
| :--- | :--- | :--- |
| `"user"` | 전역 사용자 설정 | `~/.claude/settings.json` |
| `"project"` | 공유 프로젝트 설정 (버전 관리 대상) | `.claude/settings.json` |
| `"local"` | 로컬 프로젝트 설정 (gitignore 대상) | `.claude/settings.local.json` |

#### 기본 동작

`setting_sources`가 **생략**되거나 **`None`**이면 SDK는 파일 시스템 설정을 **로드하지 않습니다**. 이는 SDK 애플리케이션에 격리를 제공합니다.

#### setting\_sources를 사용하는 이유

**모든 파일 시스템 설정 로드 (레거시 동작):**

```python
# SDK v0.0.x처럼 모든 설정 로드
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Analyze this code",
    options=ClaudeAgentOptions(
        setting_sources=["user", "project", "local"]  # 모든 설정 로드
    ),
):
    print(message)
```

**특정 설정 소스만 로드:**

```python
# 프로젝트 설정만 로드, 사용자 및 로컬 설정 무시
async for message in query(
    prompt="Run CI checks",
    options=ClaudeAgentOptions(
        setting_sources=["project"]  # .claude/settings.json만
    ),
):
    print(message)
```

**테스트 및 CI 환경:**

```python
# 로컬 설정을 제외하여 CI에서 일관된 동작 보장
async for message in query(
    prompt="Run tests",
    options=ClaudeAgentOptions(
        setting_sources=["project"],  # 팀 공유 설정만
        permission_mode="bypassPermissions",
    ),
):
    print(message)
```

**SDK 전용 애플리케이션:**

```python
# 모든 것을 프로그래밍 방식으로 정의 (기본 동작)
# 파일 시스템 의존성 없음 - setting_sources는 기본적으로 None
async for message in query(
    prompt="Review this PR",
    options=ClaudeAgentOptions(
        # setting_sources=None이 기본값, 지정할 필요 없음
        agents={...},
        mcp_servers={...},
        allowed_tools=["Read", "Grep", "Glob"],
    ),
):
    print(message)
```

**CLAUDE.md 프로젝트 지시사항 로드:**

```python
# CLAUDE.md 파일을 포함하기 위해 프로젝트 설정 로드
async for message in query(
    prompt="Add a new feature following project conventions",
    options=ClaudeAgentOptions(
        system_prompt={
            "type": "preset",
            "preset": "claude_code",  # Claude Code의 시스템 프롬프트 사용
        },
        setting_sources=["project"],  # 프로젝트에서 CLAUDE.md를 로드하는 데 필요
        allowed_tools=["Read", "Write", "Edit"],
    ),
):
    print(message)
```

#### 설정 우선순위

여러 소스가 로드될 때 설정은 다음 우선순위로 병합됩니다 (높은 것부터 낮은 것 순):

1. 로컬 설정 (`.claude/settings.local.json`)
2. 프로젝트 설정 (`.claude/settings.json`)
3. 사용자 설정 (`~/.claude/settings.json`)

프로그래밍 방식의 옵션(`agents`, `allowed_tools` 등)은 항상 파일 시스템 설정을 재정의합니다.

### `AgentDefinition`

프로그래밍 방식으로 정의된 서브에이전트 설정입니다.

```python
@dataclass
class AgentDefinition:
    description: str
    prompt: str
    tools: list[str] | None = None
    model: Literal["sonnet", "opus", "haiku", "inherit"] | None = None
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
```

| 필드 | 필수 | 설명 |
| :--- | :--- | :--- |
| `description` | 예 | 이 에이전트를 사용할 시기에 대한 자연어 설명 |
| `prompt` | 예 | 에이전트의 시스템 프롬프트 |
| `tools` | 아니오 | 허용된 도구 이름 배열. 생략 시 모든 도구 상속 |
| `model` | 아니오 | 이 에이전트의 모델 재정의. 생략 시 메인 모델 사용 |
| `skills` | 아니오 | 이 에이전트에서 사용 가능한 스킬 이름 목록 |
| `memory` | 아니오 | 이 에이전트의 메모리 소스: `"user"`, `"project"` 또는 `"local"` |
| `mcpServers` | 아니오 | 이 에이전트에서 사용 가능한 MCP 서버. 각 항목은 서버 이름 또는 인라인 `{name: config}` dict |

### `PermissionMode`

도구 실행을 제어하기 위한 권한 모드입니다.

```python
PermissionMode = Literal[
    "default",  # 표준 권한 동작
    "acceptEdits",  # 파일 편집 자동 수락
    "plan",  # 계획 모드 - 실행 없음
    "dontAsk",  # 사전 승인되지 않은 것은 프롬프트 대신 거부
    "bypassPermissions",  # 모든 권한 검사 우회 (주의하여 사용)
]
```

### `CanUseTool`

도구 권한 콜백 함수의 타입 별칭입니다.

```python
CanUseTool = Callable[
    [str, dict[str, Any], ToolPermissionContext], Awaitable[PermissionResult]
]
```

콜백이 받는 인자:

* `tool_name`: 호출되는 도구의 이름
* `input_data`: 도구의 입력 매개변수
* `context`: 추가 정보가 있는 `ToolPermissionContext`

`PermissionResult`(`PermissionResultAllow` 또는 `PermissionResultDeny`)를 반환합니다.

### `ToolPermissionContext`

도구 권한 콜백에 전달되는 컨텍스트 정보입니다.

```python
@dataclass
class ToolPermissionContext:
    signal: Any | None = None  # 향후: abort signal 지원
    suggestions: list[PermissionUpdate] = field(default_factory=list)
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `signal` | `Any \| None` | 향후 abort signal 지원을 위해 예약됨 |
| `suggestions` | `list[PermissionUpdate]` | CLI의 권한 업데이트 제안 |

### `PermissionResult`

권한 콜백 결과의 유니온 타입입니다.

```python
PermissionResult = PermissionResultAllow | PermissionResultDeny
```

### `PermissionResultAllow`

도구 호출을 허용해야 함을 나타내는 결과입니다.

```python
@dataclass
class PermissionResultAllow:
    behavior: Literal["allow"] = "allow"
    updated_input: dict[str, Any] | None = None
    updated_permissions: list[PermissionUpdate] | None = None
```

| 필드 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `behavior` | `Literal["allow"]` | `"allow"` | "allow"여야 함 |
| `updated_input` | `dict[str, Any] \| None` | `None` | 원본 대신 사용할 수정된 입력 |
| `updated_permissions` | `list[PermissionUpdate] \| None` | `None` | 적용할 권한 업데이트 |

### `PermissionResultDeny`

도구 호출을 거부해야 함을 나타내는 결과입니다.

```python
@dataclass
class PermissionResultDeny:
    behavior: Literal["deny"] = "deny"
    message: str = ""
    interrupt: bool = False
```

| 필드 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `behavior` | `Literal["deny"]` | `"deny"` | "deny"여야 함 |
| `message` | `str` | `""` | 도구가 거부된 이유를 설명하는 메시지 |
| `interrupt` | `bool` | `False` | 현재 실행을 인터럽트할지 여부 |

### `PermissionUpdate`

프로그래밍 방식으로 권한을 업데이트하기 위한 설정입니다.

```python
@dataclass
class PermissionUpdate:
    type: Literal[
        "addRules",
        "replaceRules",
        "removeRules",
        "setMode",
        "addDirectories",
        "removeDirectories",
    ]
    rules: list[PermissionRuleValue] | None = None
    behavior: Literal["allow", "deny", "ask"] | None = None
    mode: PermissionMode | None = None
    directories: list[str] | None = None
    destination: (
        Literal["userSettings", "projectSettings", "localSettings", "session"] | None
    ) = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `type` | `Literal[...]` | 권한 업데이트 작업 유형 |
| `rules` | `list[PermissionRuleValue] \| None` | 추가/교체/제거 작업을 위한 규칙 |
| `behavior` | `Literal["allow", "deny", "ask"] \| None` | 규칙 기반 작업의 동작 |
| `mode` | `PermissionMode \| None` | setMode 작업을 위한 모드 |
| `directories` | `list[str] \| None` | 디렉터리 추가/제거 작업을 위한 디렉터리 |
| `destination` | `Literal[...] \| None` | 권한 업데이트를 적용할 위치 |

### `PermissionRuleValue`

권한 업데이트에서 추가, 교체 또는 제거할 규칙입니다.

```python
@dataclass
class PermissionRuleValue:
    tool_name: str
    rule_content: str | None = None
```

### `ToolsPreset`

Claude Code의 기본 도구 세트를 사용하기 위한 프리셋 도구 설정입니다.

```python
class ToolsPreset(TypedDict):
    type: Literal["preset"]
    preset: Literal["claude_code"]
```

### `ThinkingConfig`

확장 사고 동작을 제어합니다. 세 가지 설정의 유니온입니다:

```python
class ThinkingConfigAdaptive(TypedDict):
    type: Literal["adaptive"]


class ThinkingConfigEnabled(TypedDict):
    type: Literal["enabled"]
    budget_tokens: int


class ThinkingConfigDisabled(TypedDict):
    type: Literal["disabled"]


ThinkingConfig = ThinkingConfigAdaptive | ThinkingConfigEnabled | ThinkingConfigDisabled
```

| 변형 | 필드 | 설명 |
| :--- | :--- | :--- |
| `adaptive` | `type` | Claude가 생각할 시점을 적응적으로 결정 |
| `enabled` | `type`, `budget_tokens` | 특정 토큰 예산으로 사고 활성화 |
| `disabled` | `type` | 사고 비활성화 |

이들은 `TypedDict` 클래스이므로 런타임에 일반 dict입니다. dict 리터럴로 구성하거나 클래스를 생성자처럼 호출할 수 있으며, 둘 다 `dict`를 생성합니다. `config["budget_tokens"]`으로 필드에 접근하세요, `config.budget_tokens`가 아닙니다:

```python
from claude_agent_sdk import ClaudeAgentOptions, ThinkingConfigEnabled

# 옵션 1: dict 리터럴 (권장, 임포트 불필요)
options = ClaudeAgentOptions(thinking={"type": "enabled", "budget_tokens": 20000})

# 옵션 2: 생성자 스타일 (일반 dict 반환)
config = ThinkingConfigEnabled(type="enabled", budget_tokens=20000)
print(config["budget_tokens"])  # 20000
# config.budget_tokens는 AttributeError 발생
```

### `SdkBeta`

SDK 베타 기능을 위한 Literal 타입입니다.

```python
SdkBeta = Literal["context-1m-2025-08-07"]
```

`ClaudeAgentOptions`의 `betas` 필드와 함께 사용하여 베타 기능을 활성화합니다.

::: warning
`context-1m-2025-08-07` 베타는 2026년 4월 30일부로 종료되었습니다. Claude Sonnet 4.5 또는 Sonnet 4에 이 헤더를 전달해도 효과가 없으며, 표준 200k 토큰 컨텍스트 윈도우를 초과하는 요청은 오류를 반환합니다. 1M 토큰 컨텍스트 윈도우를 사용하려면 베타 헤더 없이 표준 가격으로 1M 컨텍스트를 포함하는 [Claude Sonnet 4.6 또는 Claude Opus 4.6](https://platform.claude.com/docs/en/about-claude/models/overview)으로 마이그레이션하세요.
:::

### `McpSdkServerConfig`

`create_sdk_mcp_server()`로 생성된 SDK MCP 서버 설정입니다.

```python
class McpSdkServerConfig(TypedDict):
    type: Literal["sdk"]
    name: str
    instance: Any  # MCP Server 인스턴스
```

### `McpServerConfig`

MCP 서버 설정의 유니온 타입입니다.

```python
McpServerConfig = (
    McpStdioServerConfig | McpSSEServerConfig | McpHttpServerConfig | McpSdkServerConfig
)
```

#### `McpStdioServerConfig`

```python
class McpStdioServerConfig(TypedDict):
    type: NotRequired[Literal["stdio"]]  # 하위 호환성을 위해 선택적
    command: str
    args: NotRequired[list[str]]
    env: NotRequired[dict[str, str]]
```

#### `McpSSEServerConfig`

```python
class McpSSEServerConfig(TypedDict):
    type: Literal["sse"]
    url: str
    headers: NotRequired[dict[str, str]]
```

#### `McpHttpServerConfig`

```python
class McpHttpServerConfig(TypedDict):
    type: Literal["http"]
    url: str
    headers: NotRequired[dict[str, str]]
```

### `McpServerStatusConfig`

[`get_mcp_status()`](#메서드)에서 보고하는 MCP 서버의 설정입니다. 모든 [`McpServerConfig`](#mcpserverconfig) 트랜스포트 변형과 claude.ai를 통해 프록시되는 서버를 위한 출력 전용 `claudeai-proxy` 변형의 유니온입니다.

```python
McpServerStatusConfig = (
    McpStdioServerConfig
    | McpSSEServerConfig
    | McpHttpServerConfig
    | McpSdkServerConfigStatus
    | McpClaudeAIProxyServerConfig
)
```

`McpSdkServerConfigStatus`는 `type`(`"sdk"`)과 `name`(`str`) 필드만 있는 [`McpSdkServerConfig`](#mcpsdkserverconfig)의 직렬화 가능한 형태이며, 인프로세스 `instance`는 생략됩니다. `McpClaudeAIProxyServerConfig`는 `type`(`"claudeai-proxy"`), `url`(`str`), `id`(`str`) 필드를 가집니다.

### `McpStatusResponse`

[`ClaudeSDKClient.get_mcp_status()`](#메서드)의 응답입니다. `mcpServers` 키 아래 서버 상태 목록을 래핑합니다.

```python
class McpStatusResponse(TypedDict):
    mcpServers: list[McpServerStatus]
```

### `McpServerStatus`

[`McpStatusResponse`](#mcpstatusresponse)에 포함된 연결된 MCP 서버의 상태입니다.

```python
class McpServerStatus(TypedDict):
    name: str
    status: McpServerConnectionStatus  # "connected" | "failed" | "needs-auth" | "pending" | "disabled"
    serverInfo: NotRequired[McpServerInfo]
    error: NotRequired[str]
    config: NotRequired[McpServerStatusConfig]
    scope: NotRequired[str]
    tools: NotRequired[list[McpToolInfo]]
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `name` | `str` | 서버 이름 |
| `status` | `str` | `"connected"`, `"failed"`, `"needs-auth"`, `"pending"` 또는 `"disabled"` 중 하나 |
| `serverInfo` | `dict` (선택적) | 서버 이름과 버전 (`{"name": str, "version": str}`) |
| `error` | `str` (선택적) | 서버 연결 실패 시 오류 메시지 |
| `config` | [`McpServerStatusConfig`](#mcpserverstatusconfig) (선택적) | 서버 설정. [`McpServerConfig`](#mcpserverconfig)와 동일한 형태(stdio, SSE, HTTP 또는 SDK)에 claude.ai를 통해 연결된 서버를 위한 `claudeai-proxy` 변형 추가 |
| `scope` | `str` (선택적) | 설정 범위 |
| `tools` | `list` (선택적) | 이 서버가 제공하는 도구로, 각각 `name`, `description`, `annotations` 필드를 가짐 |

### `SdkPluginConfig`

SDK에서 플러그인을 로드하기 위한 설정입니다.

```python
class SdkPluginConfig(TypedDict):
    type: Literal["local"]
    path: str
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `type` | `Literal["local"]` | `"local"`이어야 함 (현재 로컬 플러그인만 지원) |
| `path` | `str` | 플러그인 디렉터리의 절대 또는 상대 경로 |

**예제:**

```python
plugins = [
    {"type": "local", "path": "./my-plugin"},
    {"type": "local", "path": "/absolute/path/to/plugin"},
]
```

플러그인 생성 및 사용에 대한 전체 정보는 [플러그인](/agent-sdk/plugins)을 참조하세요.

## 메시지 타입

### `Message`

모든 가능한 메시지의 유니온 타입입니다.

```python
Message = (
    UserMessage
    | AssistantMessage
    | SystemMessage
    | ResultMessage
    | StreamEvent
    | RateLimitEvent
)
```

### `UserMessage`

사용자 입력 메시지입니다.

```python
@dataclass
class UserMessage:
    content: str | list[ContentBlock]
    uuid: str | None = None
    parent_tool_use_id: str | None = None
    tool_use_result: dict[str, Any] | None = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `content` | `str \| list[ContentBlock]` | 텍스트 또는 콘텐츠 블록으로 된 메시지 내용 |
| `uuid` | `str \| None` | 고유 메시지 식별자 |
| `parent_tool_use_id` | `str \| None` | 이 메시지가 도구 결과 응답인 경우의 도구 사용 ID |
| `tool_use_result` | `dict[str, Any] \| None` | 해당되는 경우 도구 결과 데이터 |

### `AssistantMessage`

콘텐츠 블록이 있는 어시스턴트 응답 메시지입니다.

```python
@dataclass
class AssistantMessage:
    content: list[ContentBlock]
    model: str
    parent_tool_use_id: str | None = None
    error: AssistantMessageError | None = None
    usage: dict[str, Any] | None = None
    message_id: str | None = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `content` | `list[ContentBlock]` | 응답의 콘텐츠 블록 목록 |
| `model` | `str` | 응답을 생성한 모델 |
| `parent_tool_use_id` | `str \| None` | 중첩된 응답인 경우의 도구 사용 ID |
| `error` | [`AssistantMessageError`](#assistantmessageerror) ` \| None` | 응답에서 오류가 발생한 경우의 오류 유형 |
| `usage` | `dict[str, Any] \| None` | 메시지별 토큰 사용량 ([`ResultMessage.usage`](#resultmessage)와 동일한 키) |
| `message_id` | `str \| None` | API 메시지 ID. 한 턴의 여러 메시지가 동일한 ID를 공유 |

### `AssistantMessageError`

어시스턴트 메시지의 가능한 오류 유형입니다.

```python
AssistantMessageError = Literal[
    "authentication_failed",
    "billing_error",
    "rate_limit",
    "invalid_request",
    "server_error",
    "max_output_tokens",
    "unknown",
]
```

### `SystemMessage`

메타데이터가 있는 시스템 메시지입니다.

```python
@dataclass
class SystemMessage:
    subtype: str
    data: dict[str, Any]
```

### `ResultMessage`

비용 및 사용량 정보가 있는 최종 결과 메시지입니다.

```python
@dataclass
class ResultMessage:
    subtype: str
    duration_ms: int
    duration_api_ms: int
    is_error: bool
    num_turns: int
    session_id: str
    total_cost_usd: float | None = None
    usage: dict[str, Any] | None = None
    result: str | None = None
    stop_reason: str | None = None
    structured_output: Any = None
    model_usage: dict[str, Any] | None = None
```

`usage` dict에는 존재 시 다음 키가 포함됩니다:

| 키 | 타입 | 설명 |
| --- | --- | --- |
| `input_tokens` | `int` | 소비된 총 입력 토큰 |
| `output_tokens` | `int` | 생성된 총 출력 토큰 |
| `cache_creation_input_tokens` | `int` | 새 캐시 항목 생성에 사용된 토큰 |
| `cache_read_input_tokens` | `int` | 기존 캐시 항목에서 읽은 토큰 |

`model_usage` dict는 모델 이름을 모델별 사용량에 매핑합니다. 내부 dict 키는 기본 CLI 프로세스에서 수정 없이 전달되는 값이므로 camelCase를 사용하며, TypeScript [`ModelUsage`](/agent-sdk/typescript#model-usage) 타입과 일치합니다:

| 키 | 타입 | 설명 |
| --- | --- | --- |
| `inputTokens` | `int` | 이 모델의 입력 토큰 |
| `outputTokens` | `int` | 이 모델의 출력 토큰 |
| `cacheReadInputTokens` | `int` | 이 모델의 캐시 읽기 토큰 |
| `cacheCreationInputTokens` | `int` | 이 모델의 캐시 생성 토큰 |
| `webSearchRequests` | `int` | 이 모델의 웹 검색 요청 수 |
| `costUSD` | `float` | 이 모델의 USD 비용 |
| `contextWindow` | `int` | 이 모델의 컨텍스트 윈도우 크기 |
| `maxOutputTokens` | `int` | 이 모델의 최대 출력 토큰 제한 |

### `StreamEvent`

스트리밍 중 부분 메시지 업데이트를 위한 스트림 이벤트입니다. `ClaudeAgentOptions`에서 `include_partial_messages=True`일 때만 수신됩니다. 임포트: `from claude_agent_sdk.types import StreamEvent`.

```python
@dataclass
class StreamEvent:
    uuid: str
    session_id: str
    event: dict[str, Any]  # 원시 Claude API 스트림 이벤트
    parent_tool_use_id: str | None = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `uuid` | `str` | 이 이벤트의 고유 식별자 |
| `session_id` | `str` | 세션 식별자 |
| `event` | `dict[str, Any]` | 원시 Claude API 스트림 이벤트 데이터 |
| `parent_tool_use_id` | `str \| None` | 이 이벤트가 서브에이전트에서 온 경우의 부모 도구 사용 ID |

### `RateLimitEvent`

속도 제한 상태가 변경될 때 발생합니다 (예: `"allowed"`에서 `"allowed_warning"`으로). 사용자가 하드 제한에 도달하기 전에 경고하거나 상태가 `"rejected"`일 때 백오프하는 데 사용합니다.

```python
@dataclass
class RateLimitEvent:
    rate_limit_info: RateLimitInfo
    uuid: str
    session_id: str
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `rate_limit_info` | [`RateLimitInfo`](#ratelimitinfo) | 현재 속도 제한 상태 |
| `uuid` | `str` | 고유 이벤트 식별자 |
| `session_id` | `str` | 세션 식별자 |

### `RateLimitInfo`

[`RateLimitEvent`](#ratelimitevent)가 전달하는 속도 제한 상태입니다.

```python
RateLimitStatus = Literal["allowed", "allowed_warning", "rejected"]
RateLimitType = Literal[
    "five_hour", "seven_day", "seven_day_opus", "seven_day_sonnet", "overage"
]


@dataclass
class RateLimitInfo:
    status: RateLimitStatus
    resets_at: int | None = None
    rate_limit_type: RateLimitType | None = None
    utilization: float | None = None
    overage_status: RateLimitStatus | None = None
    overage_resets_at: int | None = None
    overage_disabled_reason: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `status` | `RateLimitStatus` | 현재 상태. `"allowed_warning"`은 제한에 접근 중임을, `"rejected"`는 제한에 도달했음을 의미 |
| `resets_at` | `int \| None` | 속도 제한 윈도우가 재설정되는 Unix 타임스탬프 |
| `rate_limit_type` | `RateLimitType \| None` | 적용되는 속도 제한 윈도우 |
| `utilization` | `float \| None` | 소비된 속도 제한 비율 (0.0~1.0) |
| `overage_status` | `RateLimitStatus \| None` | 해당되는 경우 종량제 초과 사용 상태 |
| `overage_resets_at` | `int \| None` | 초과 사용 윈도우가 재설정되는 Unix 타임스탬프 |
| `overage_disabled_reason` | `str \| None` | 상태가 `"rejected"`인 경우 초과 사용이 불가능한 이유 |
| `raw` | `dict[str, Any]` | 위에서 모델링되지 않은 필드를 포함한 CLI의 전체 원시 dict |

### `TaskStartedMessage`

백그라운드 작업이 시작될 때 발생합니다. 백그라운드 작업은 메인 턴 외부에서 추적되는 모든 것입니다: 백그라운드 Bash 명령, [Monitor](#monitor) 감시, Agent 도구로 생성된 서브에이전트 또는 원격 에이전트. `task_type` 필드로 종류를 구분합니다. 이 이름은 `Task`에서 `Agent` 도구로의 이름 변경과 무관합니다.

```python
@dataclass
class TaskStartedMessage(SystemMessage):
    task_id: str
    description: str
    uuid: str
    session_id: str
    tool_use_id: str | None = None
    task_type: str | None = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `task_id` | `str` | 작업의 고유 식별자 |
| `description` | `str` | 작업 설명 |
| `uuid` | `str` | 고유 메시지 식별자 |
| `session_id` | `str` | 세션 식별자 |
| `tool_use_id` | `str \| None` | 연관된 도구 사용 ID |
| `task_type` | `str \| None` | 백그라운드 작업 종류: 백그라운드 Bash 및 Monitor 감시의 경우 `"local_bash"`, `"local_agent"` 또는 `"remote_agent"` |

### `TaskUsage`

백그라운드 작업의 토큰 및 타이밍 데이터입니다.

```python
class TaskUsage(TypedDict):
    total_tokens: int
    tool_uses: int
    duration_ms: int
```

### `TaskProgressMessage`

실행 중인 백그라운드 작업의 진행 상황 업데이트를 주기적으로 발생시킵니다.

```python
@dataclass
class TaskProgressMessage(SystemMessage):
    task_id: str
    description: str
    usage: TaskUsage
    uuid: str
    session_id: str
    tool_use_id: str | None = None
    last_tool_name: str | None = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `task_id` | `str` | 작업의 고유 식별자 |
| `description` | `str` | 현재 상태 설명 |
| `usage` | `TaskUsage` | 현재까지의 작업 토큰 사용량 |
| `uuid` | `str` | 고유 메시지 식별자 |
| `session_id` | `str` | 세션 식별자 |
| `tool_use_id` | `str \| None` | 연관된 도구 사용 ID |
| `last_tool_name` | `str \| None` | 작업이 마지막으로 사용한 도구 이름 |

### `TaskNotificationMessage`

백그라운드 작업이 완료, 실패 또는 중지될 때 발생합니다. 백그라운드 작업에는 `run_in_background` Bash 명령, Monitor 감시 및 백그라운드 서브에이전트가 포함됩니다.

```python
@dataclass
class TaskNotificationMessage(SystemMessage):
    task_id: str
    status: TaskNotificationStatus  # "completed" | "failed" | "stopped"
    output_file: str
    summary: str
    uuid: str
    session_id: str
    tool_use_id: str | None = None
    usage: TaskUsage | None = None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `task_id` | `str` | 작업의 고유 식별자 |
| `status` | `TaskNotificationStatus` | `"completed"`, `"failed"` 또는 `"stopped"` 중 하나 |
| `output_file` | `str` | 작업 출력 파일 경로 |
| `summary` | `str` | 작업 결과 요약 |
| `uuid` | `str` | 고유 메시지 식별자 |
| `session_id` | `str` | 세션 식별자 |
| `tool_use_id` | `str \| None` | 연관된 도구 사용 ID |
| `usage` | `TaskUsage \| None` | 작업의 최종 토큰 사용량 |

## 콘텐츠 블록 타입

### `ContentBlock`

모든 콘텐츠 블록의 유니온 타입입니다.

```python
ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock
```

### `TextBlock`

텍스트 콘텐츠 블록입니다.

```python
@dataclass
class TextBlock:
    text: str
```

### `ThinkingBlock`

사고 콘텐츠 블록입니다 (사고 기능이 있는 모델용).

```python
@dataclass
class ThinkingBlock:
    thinking: str
    signature: str
```

### `ToolUseBlock`

도구 사용 요청 블록입니다.

```python
@dataclass
class ToolUseBlock:
    id: str
    name: str
    input: dict[str, Any]
```

### `ToolResultBlock`

도구 실행 결과 블록입니다.

```python
@dataclass
class ToolResultBlock:
    tool_use_id: str
    content: str | list[dict[str, Any]] | None = None
    is_error: bool | None = None
```

## 오류 타입

### `ClaudeSDKError`

모든 SDK 오류의 기본 예외 클래스입니다.

```python
class ClaudeSDKError(Exception):
    """Base error for Claude SDK."""
```

### `CLINotFoundError`

Claude Code CLI가 설치되지 않았거나 찾을 수 없을 때 발생합니다.

```python
class CLINotFoundError(CLIConnectionError):
    def __init__(
        self, message: str = "Claude Code not found", cli_path: str | None = None
    ):
        """
        Args:
            message: 오류 메시지 (기본값: "Claude Code not found")
            cli_path: 찾을 수 없었던 CLI의 선택적 경로
        """
```

### `CLIConnectionError`

Claude Code 연결 실패 시 발생합니다.

```python
class CLIConnectionError(ClaudeSDKError):
    """Failed to connect to Claude Code."""
```

### `ProcessError`

Claude Code 프로세스 실패 시 발생합니다.

```python
class ProcessError(ClaudeSDKError):
    def __init__(
        self, message: str, exit_code: int | None = None, stderr: str | None = None
    ):
        self.exit_code = exit_code
        self.stderr = stderr
```

### `CLIJSONDecodeError`

JSON 파싱 실패 시 발생합니다.

```python
class CLIJSONDecodeError(ClaudeSDKError):
    def __init__(self, line: str, original_error: Exception):
        """
        Args:
            line: 파싱에 실패한 줄
            original_error: 원래 JSON 디코드 예외
        """
        self.line = line
        self.original_error = original_error
```

## Hook 타입

Hook 사용에 대한 예제와 일반적인 패턴이 포함된 종합 가이드는 [Hook 가이드](/agent-sdk/hooks)를 참조하세요.

### `HookEvent`

지원되는 Hook 이벤트 유형입니다.

```python
HookEvent = Literal[
    "PreToolUse",  # 도구 실행 전 호출
    "PostToolUse",  # 도구 실행 후 호출
    "PostToolUseFailure",  # 도구 실행 실패 시 호출
    "UserPromptSubmit",  # 사용자가 프롬프트를 제출할 때 호출
    "Stop",  # 실행 중지 시 호출
    "SubagentStop",  # 서브에이전트 중지 시 호출
    "PreCompact",  # 메시지 압축 전 호출
    "Notification",  # 알림 이벤트 시 호출
    "SubagentStart",  # 서브에이전트 시작 시 호출
    "PermissionRequest",  # 권한 결정이 필요할 때 호출
]
```

::: info
TypeScript SDK는 Python에서 아직 사용할 수 없는 추가 Hook 이벤트를 지원합니다: `SessionStart`, `SessionEnd`, `Setup`, `TeammateIdle`, `TaskCompleted`, `ConfigChange`, `WorktreeCreate`, `WorktreeRemove`.
:::

### `HookCallback`

Hook 콜백 함수의 타입 정의입니다.

```python
HookCallback = Callable[[HookInput, str | None, HookContext], Awaitable[HookJSONOutput]]
```

매개변수:

* `input`: `hook_event_name`에 기반한 판별 유니온이 있는 강타입 Hook 입력 ([`HookInput`](#hookinput) 참조)
* `tool_use_id`: 선택적 도구 사용 식별자 (도구 관련 Hook용)
* `context`: 추가 정보가 있는 Hook 컨텍스트

다음을 포함할 수 있는 [`HookJSONOutput`](#hookjsonoutput)을 반환합니다:

* `decision`: 동작을 차단하려면 `"block"`
* `systemMessage`: 트랜스크립트에 추가할 시스템 메시지
* `hookSpecificOutput`: Hook별 출력 데이터

### `HookContext`

Hook 콜백에 전달되는 컨텍스트 정보입니다.

```python
class HookContext(TypedDict):
    signal: Any | None  # 향후: abort signal 지원
```

### `HookMatcher`

특정 이벤트나 도구에 Hook을 매칭하기 위한 설정입니다.

```python
@dataclass
class HookMatcher:
    matcher: str | None = (
        None  # 매칭할 도구 이름 또는 패턴 (예: "Bash", "Write|Edit")
    )
    hooks: list[HookCallback] = field(
        default_factory=list
    )  # 실행할 콜백 목록
    timeout: float | None = (
        None  # 이 매처의 모든 Hook에 대한 타임아웃(초) (기본값: 60)
    )
```

### `HookInput`

모든 Hook 입력 타입의 유니온 타입입니다. 실제 타입은 `hook_event_name` 필드에 따라 달라집니다.

```python
HookInput = (
    PreToolUseHookInput
    | PostToolUseHookInput
    | PostToolUseFailureHookInput
    | UserPromptSubmitHookInput
    | StopHookInput
    | SubagentStopHookInput
    | PreCompactHookInput
    | NotificationHookInput
    | SubagentStartHookInput
    | PermissionRequestHookInput
)
```

### `BaseHookInput`

모든 Hook 입력 타입에 존재하는 기본 필드입니다.

```python
class BaseHookInput(TypedDict):
    session_id: str
    transcript_path: str
    cwd: str
    permission_mode: NotRequired[str]
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `session_id` | `str` | 현재 세션 식별자 |
| `transcript_path` | `str` | 세션 트랜스크립트 파일 경로 |
| `cwd` | `str` | 현재 작업 디렉터리 |
| `permission_mode` | `str` (선택적) | 현재 권한 모드 |

### `PreToolUseHookInput`

`PreToolUse` Hook 이벤트의 입력 데이터입니다.

```python
class PreToolUseHookInput(BaseHookInput):
    hook_event_name: Literal["PreToolUse"]
    tool_name: str
    tool_input: dict[str, Any]
    tool_use_id: str
    agent_id: NotRequired[str]
    agent_type: NotRequired[str]
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["PreToolUse"]` | 항상 "PreToolUse" |
| `tool_name` | `str` | 실행 예정인 도구의 이름 |
| `tool_input` | `dict[str, Any]` | 도구의 입력 매개변수 |
| `tool_use_id` | `str` | 이 도구 사용의 고유 식별자 |
| `agent_id` | `str` (선택적) | 서브에이전트 식별자, Hook이 서브에이전트 내에서 발생할 때 존재 |
| `agent_type` | `str` (선택적) | 서브에이전트 유형, Hook이 서브에이전트 내에서 발생할 때 존재 |

### `PostToolUseHookInput`

`PostToolUse` Hook 이벤트의 입력 데이터입니다.

```python
class PostToolUseHookInput(BaseHookInput):
    hook_event_name: Literal["PostToolUse"]
    tool_name: str
    tool_input: dict[str, Any]
    tool_response: Any
    tool_use_id: str
    agent_id: NotRequired[str]
    agent_type: NotRequired[str]
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["PostToolUse"]` | 항상 "PostToolUse" |
| `tool_name` | `str` | 실행된 도구의 이름 |
| `tool_input` | `dict[str, Any]` | 사용된 입력 매개변수 |
| `tool_response` | `Any` | 도구 실행의 응답 |
| `tool_use_id` | `str` | 이 도구 사용의 고유 식별자 |
| `agent_id` | `str` (선택적) | 서브에이전트 식별자, Hook이 서브에이전트 내에서 발생할 때 존재 |
| `agent_type` | `str` (선택적) | 서브에이전트 유형, Hook이 서브에이전트 내에서 발생할 때 존재 |

### `PostToolUseFailureHookInput`

`PostToolUseFailure` Hook 이벤트의 입력 데이터입니다. 도구 실행이 실패할 때 호출됩니다.

```python
class PostToolUseFailureHookInput(BaseHookInput):
    hook_event_name: Literal["PostToolUseFailure"]
    tool_name: str
    tool_input: dict[str, Any]
    tool_use_id: str
    error: str
    is_interrupt: NotRequired[bool]
    agent_id: NotRequired[str]
    agent_type: NotRequired[str]
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["PostToolUseFailure"]` | 항상 "PostToolUseFailure" |
| `tool_name` | `str` | 실패한 도구의 이름 |
| `tool_input` | `dict[str, Any]` | 사용된 입력 매개변수 |
| `tool_use_id` | `str` | 이 도구 사용의 고유 식별자 |
| `error` | `str` | 실패한 실행의 오류 메시지 |
| `is_interrupt` | `bool` (선택적) | 실패가 인터럽트에 의해 발생했는지 여부 |
| `agent_id` | `str` (선택적) | 서브에이전트 식별자, Hook이 서브에이전트 내에서 발생할 때 존재 |
| `agent_type` | `str` (선택적) | 서브에이전트 유형, Hook이 서브에이전트 내에서 발생할 때 존재 |

### `UserPromptSubmitHookInput`

`UserPromptSubmit` Hook 이벤트의 입력 데이터입니다.

```python
class UserPromptSubmitHookInput(BaseHookInput):
    hook_event_name: Literal["UserPromptSubmit"]
    prompt: str
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["UserPromptSubmit"]` | 항상 "UserPromptSubmit" |
| `prompt` | `str` | 사용자가 제출한 프롬프트 |

### `StopHookInput`

`Stop` Hook 이벤트의 입력 데이터입니다.

```python
class StopHookInput(BaseHookInput):
    hook_event_name: Literal["Stop"]
    stop_hook_active: bool
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["Stop"]` | 항상 "Stop" |
| `stop_hook_active` | `bool` | 중지 Hook이 활성 상태인지 여부 |

### `SubagentStopHookInput`

`SubagentStop` Hook 이벤트의 입력 데이터입니다.

```python
class SubagentStopHookInput(BaseHookInput):
    hook_event_name: Literal["SubagentStop"]
    stop_hook_active: bool
    agent_id: str
    agent_transcript_path: str
    agent_type: str
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["SubagentStop"]` | 항상 "SubagentStop" |
| `stop_hook_active` | `bool` | 중지 Hook이 활성 상태인지 여부 |
| `agent_id` | `str` | 서브에이전트의 고유 식별자 |
| `agent_transcript_path` | `str` | 서브에이전트의 트랜스크립트 파일 경로 |
| `agent_type` | `str` | 서브에이전트의 유형 |

### `PreCompactHookInput`

`PreCompact` Hook 이벤트의 입력 데이터입니다.

```python
class PreCompactHookInput(BaseHookInput):
    hook_event_name: Literal["PreCompact"]
    trigger: Literal["manual", "auto"]
    custom_instructions: str | None
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["PreCompact"]` | 항상 "PreCompact" |
| `trigger` | `Literal["manual", "auto"]` | 압축을 트리거한 것 |
| `custom_instructions` | `str \| None` | 압축을 위한 커스텀 지시사항 |

### `NotificationHookInput`

`Notification` Hook 이벤트의 입력 데이터입니다.

```python
class NotificationHookInput(BaseHookInput):
    hook_event_name: Literal["Notification"]
    message: str
    title: NotRequired[str]
    notification_type: str
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["Notification"]` | 항상 "Notification" |
| `message` | `str` | 알림 메시지 내용 |
| `title` | `str` (선택적) | 알림 제목 |
| `notification_type` | `str` | 알림 유형 |

### `SubagentStartHookInput`

`SubagentStart` Hook 이벤트의 입력 데이터입니다.

```python
class SubagentStartHookInput(BaseHookInput):
    hook_event_name: Literal["SubagentStart"]
    agent_id: str
    agent_type: str
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["SubagentStart"]` | 항상 "SubagentStart" |
| `agent_id` | `str` | 서브에이전트의 고유 식별자 |
| `agent_type` | `str` | 서브에이전트의 유형 |

### `PermissionRequestHookInput`

`PermissionRequest` Hook 이벤트의 입력 데이터입니다. Hook이 프로그래밍 방식으로 권한 결정을 처리할 수 있게 합니다.

```python
class PermissionRequestHookInput(BaseHookInput):
    hook_event_name: Literal["PermissionRequest"]
    tool_name: str
    tool_input: dict[str, Any]
    permission_suggestions: NotRequired[list[Any]]
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `hook_event_name` | `Literal["PermissionRequest"]` | 항상 "PermissionRequest" |
| `tool_name` | `str` | 권한을 요청하는 도구 이름 |
| `tool_input` | `dict[str, Any]` | 도구의 입력 매개변수 |
| `permission_suggestions` | `list[Any]` (선택적) | CLI의 권한 업데이트 제안 |

### `HookJSONOutput`

Hook 콜백 반환 값의 유니온 타입입니다.

```python
HookJSONOutput = AsyncHookJSONOutput | SyncHookJSONOutput
```

#### `SyncHookJSONOutput`

제어 및 결정 필드가 있는 동기 Hook 출력입니다.

```python
class SyncHookJSONOutput(TypedDict):
    # 제어 필드
    continue_: NotRequired[bool]  # 진행 여부 (기본값: True)
    suppressOutput: NotRequired[bool]  # 트랜스크립트에서 stdout 숨기기
    stopReason: NotRequired[str]  # continue가 False일 때의 메시지

    # 결정 필드
    decision: NotRequired[Literal["block"]]
    systemMessage: NotRequired[str]  # 사용자를 위한 경고 메시지
    reason: NotRequired[str]  # Claude를 위한 피드백

    # Hook별 출력
    hookSpecificOutput: NotRequired[HookSpecificOutput]
```

::: info
Python 코드에서는 `continue_` (밑줄 포함)를 사용합니다. CLI로 전송될 때 자동으로 `continue`로 변환됩니다.
:::

#### `HookSpecificOutput`

Hook 이벤트 이름과 이벤트별 필드를 포함하는 `TypedDict`입니다. 형태는 `hookEventName` 값에 따라 달라집니다. Hook 이벤트별 사용 가능한 필드에 대한 전체 내용은 [Hook으로 실행 제어하기](/agent-sdk/hooks#outputs)를 참조하세요.

이벤트별 출력 타입의 판별 유니온입니다. `hookEventName` 필드가 유효한 필드를 결정합니다.

```python
class PreToolUseHookSpecificOutput(TypedDict):
    hookEventName: Literal["PreToolUse"]
    permissionDecision: NotRequired[Literal["allow", "deny", "ask"]]
    permissionDecisionReason: NotRequired[str]
    updatedInput: NotRequired[dict[str, Any]]
    additionalContext: NotRequired[str]


class PostToolUseHookSpecificOutput(TypedDict):
    hookEventName: Literal["PostToolUse"]
    additionalContext: NotRequired[str]
    updatedMCPToolOutput: NotRequired[Any]


class PostToolUseFailureHookSpecificOutput(TypedDict):
    hookEventName: Literal["PostToolUseFailure"]
    additionalContext: NotRequired[str]


class UserPromptSubmitHookSpecificOutput(TypedDict):
    hookEventName: Literal["UserPromptSubmit"]
    additionalContext: NotRequired[str]


class NotificationHookSpecificOutput(TypedDict):
    hookEventName: Literal["Notification"]
    additionalContext: NotRequired[str]


class SubagentStartHookSpecificOutput(TypedDict):
    hookEventName: Literal["SubagentStart"]
    additionalContext: NotRequired[str]


class PermissionRequestHookSpecificOutput(TypedDict):
    hookEventName: Literal["PermissionRequest"]
    decision: dict[str, Any]


HookSpecificOutput = (
    PreToolUseHookSpecificOutput
    | PostToolUseHookSpecificOutput
    | PostToolUseFailureHookSpecificOutput
    | UserPromptSubmitHookSpecificOutput
    | NotificationHookSpecificOutput
    | SubagentStartHookSpecificOutput
    | PermissionRequestHookSpecificOutput
)
```

#### `AsyncHookJSONOutput`

Hook 실행을 지연시키는 비동기 Hook 출력입니다.

```python
class AsyncHookJSONOutput(TypedDict):
    async_: Literal[True]  # 실행을 지연하려면 True로 설정
    asyncTimeout: NotRequired[int]  # 밀리초 단위 타임아웃
```

::: info
Python 코드에서는 `async_` (밑줄 포함)를 사용합니다. CLI로 전송될 때 자동으로 `async`로 변환됩니다.
:::

### Hook 사용 예제

이 예제는 두 개의 Hook을 등록합니다: `rm -rf /`와 같은 위험한 bash 명령을 차단하는 것과 감사를 위해 모든 도구 사용을 로깅하는 것입니다. 보안 Hook은 Bash 명령에만 실행되고(`matcher`를 통해), 로깅 Hook은 모든 도구에서 실행됩니다.

```python
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher, HookContext
from typing import Any


async def validate_bash_command(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """위험한 bash 명령을 유효성 검사하고 잠재적으로 차단합니다."""
    if input_data["tool_name"] == "Bash":
        command = input_data["tool_input"].get("command", "")
        if "rm -rf /" in command:
            return {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": "Dangerous command blocked",
                }
            }
    return {}


async def log_tool_use(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """감사를 위해 모든 도구 사용을 로깅합니다."""
    print(f"Tool used: {input_data.get('tool_name')}")
    return {}


options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [
            HookMatcher(
                matcher="Bash", hooks=[validate_bash_command], timeout=120
            ),  # 유효성 검사를 위해 2분
            HookMatcher(
                hooks=[log_tool_use]
            ),  # 모든 도구에 적용 (기본 60초 타임아웃)
        ],
        "PostToolUse": [HookMatcher(hooks=[log_tool_use])],
    }
)

async for message in query(prompt="Analyze this codebase", options=options):
    print(message)
```

## 도구 입력/출력 타입

모든 내장 Claude Code 도구의 입력/출력 스키마 문서입니다. Python SDK가 이를 타입으로 내보내지는 않지만, 메시지에서 도구 입력 및 출력의 구조를 나타냅니다.

### Agent

**도구 이름:** `Agent` (이전에는 `Task`였으며, 별칭으로 여전히 사용 가능)

**입력:**

```python
{
    "description": str,  # 작업의 짧은 (3-5 단어) 설명
    "prompt": str,  # 에이전트가 수행할 작업
    "subagent_type": str,  # 사용할 전문 에이전트 유형
}
```

**출력:**

```python
{
    "result": str,  # 서브에이전트의 최종 결과
    "usage": dict | None,  # 토큰 사용량 통계
    "total_cost_usd": float | None,  # USD 단위 총 비용
    "duration_ms": int | None,  # 밀리초 단위 실행 시간
}
```

### AskUserQuestion

**도구 이름:** `AskUserQuestion`

실행 중 사용자에게 명확한 질문을 합니다. 사용 방법은 [승인 및 사용자 입력 처리](/agent-sdk/user-input#handle-clarifying-questions)를 참조하세요.

**입력:**

```python
{
    "questions": [  # 사용자에게 할 질문 (1-4개)
        {
            "question": str,  # 사용자에게 할 전체 질문
            "header": str,  # 칩/태그로 표시되는 매우 짧은 레이블 (최대 12자)
            "options": [  # 선택 가능한 항목 (2-4개)
                {
                    "label": str,  # 이 옵션의 표시 텍스트 (1-5 단어)
                    "description": str,  # 이 옵션의 의미 설명
                }
            ],
            "multiSelect": bool,  # 복수 선택 허용 시 true
        }
    ],
    "answers": dict | None,  # 권한 시스템에 의해 채워지는 사용자 답변
}
```

**출력:**

```python
{
    "questions": [  # 질문했던 내용
        {
            "question": str,
            "header": str,
            "options": [{"label": str, "description": str}],
            "multiSelect": bool,
        }
    ],
    "answers": dict[str, str],  # 질문 텍스트를 답변 문자열에 매핑
    # 복수 선택 답변은 쉼표로 구분
}
```

### Bash

**도구 이름:** `Bash`

**입력:**

```python
{
    "command": str,  # 실행할 명령
    "timeout": int | None,  # 선택적 밀리초 단위 타임아웃 (최대 600000)
    "description": str | None,  # 명확하고 간결한 설명 (5-10 단어)
    "run_in_background": bool | None,  # 백그라운드에서 실행하려면 true
}
```

**출력:**

```python
{
    "output": str,  # stdout과 stderr 결합 출력
    "exitCode": int,  # 명령의 종료 코드
    "killed": bool | None,  # 타임아웃으로 인해 종료되었는지 여부
    "shellId": str | None,  # 백그라운드 프로세스의 셸 ID
}
```

### Monitor

**도구 이름:** `Monitor`

백그라운드 스크립트를 실행하고 각 stdout 줄을 Claude에 이벤트로 전달하여 폴링 없이 반응할 수 있게 합니다. Monitor는 Bash와 동일한 권한 규칙을 따릅니다. 동작 및 제공자 가용성에 대한 자세한 내용은 [Monitor 도구 레퍼런스](/tools-reference#monitor-tool)를 참조하세요.

**입력:**

```python
{
    "command": str,  # 셸 스크립트; 각 stdout 줄이 이벤트, 종료하면 감시 종료
    "description": str,  # 알림에 표시되는 짧은 설명
    "timeout_ms": int | None,  # 이 기한 후 종료 (기본값 300000, 최대 3600000)
    "persistent": bool | None,  # 세션 수명 동안 실행; TaskStop으로 중지
}
```

**출력:**

```python
{
    "taskId": str,  # 백그라운드 모니터 작업의 ID
    "timeoutMs": int,  # 밀리초 단위 타임아웃 기한 (persistent일 때 0)
    "persistent": bool | None,  # TaskStop 또는 세션 종료까지 실행할 때 True
}
```

### Edit

**도구 이름:** `Edit`

**입력:**

```python
{
    "file_path": str,  # 수정할 파일의 절대 경로
    "old_string": str,  # 교체할 텍스트
    "new_string": str,  # 교체할 새 텍스트
    "replace_all": bool | None,  # 모든 발생 교체 (기본값 False)
}
```

**출력:**

```python
{
    "message": str,  # 확인 메시지
    "replacements": int,  # 수행된 교체 수
    "file_path": str,  # 편집된 파일 경로
}
```

### Read

**도구 이름:** `Read`

**입력:**

```python
{
    "file_path": str,  # 읽을 파일의 절대 경로
    "offset": int | None,  # 읽기 시작할 줄 번호
    "limit": int | None,  # 읽을 줄 수
}
```

**출력 (텍스트 파일):**

```python
{
    "content": str,  # 줄 번호가 있는 파일 내용
    "total_lines": int,  # 파일의 총 줄 수
    "lines_returned": int,  # 실제 반환된 줄 수
}
```

**출력 (이미지):**

```python
{
    "image": str,  # Base64 인코딩된 이미지 데이터
    "mime_type": str,  # 이미지 MIME 타입
    "file_size": int,  # 파일 크기(바이트)
}
```

### Write

**도구 이름:** `Write`

**입력:**

```python
{
    "file_path": str,  # 쓸 파일의 절대 경로
    "content": str,  # 파일에 쓸 내용
}
```

**출력:**

```python
{
    "message": str,  # 성공 메시지
    "bytes_written": int,  # 쓴 바이트 수
    "file_path": str,  # 쓴 파일 경로
}
```

### Glob

**도구 이름:** `Glob`

**입력:**

```python
{
    "pattern": str,  # 파일과 매칭할 glob 패턴
    "path": str | None,  # 검색할 디렉터리 (기본값 cwd)
}
```

**출력:**

```python
{
    "matches": list[str],  # 매칭된 파일 경로 배열
    "count": int,  # 매칭된 수
    "search_path": str,  # 사용된 검색 디렉터리
}
```

### Grep

**도구 이름:** `Grep`

**입력:**

```python
{
    "pattern": str,  # 정규 표현식 패턴
    "path": str | None,  # 검색할 파일 또는 디렉터리
    "glob": str | None,  # 파일 필터링을 위한 glob 패턴
    "type": str | None,  # 검색할 파일 유형
    "output_mode": str | None,  # "content", "files_with_matches" 또는 "count"
    "-i": bool | None,  # 대소문자 구분 없는 검색
    "-n": bool | None,  # 줄 번호 표시
    "-B": int | None,  # 각 매치 앞에 표시할 줄 수
    "-A": int | None,  # 각 매치 뒤에 표시할 줄 수
    "-C": int | None,  # 앞뒤로 표시할 줄 수
    "head_limit": int | None,  # 출력을 처음 N개 줄/항목으로 제한
    "multiline": bool | None,  # 여러 줄 모드 활성화
}
```

**출력 (content 모드):**

```python
{
    "matches": [
        {
            "file": str,
            "line_number": int | None,
            "line": str,
            "before_context": list[str] | None,
            "after_context": list[str] | None,
        }
    ],
    "total_matches": int,
}
```

**출력 (files\_with\_matches 모드):**

```python
{
    "files": list[str],  # 매치를 포함하는 파일
    "count": int,  # 매치를 포함하는 파일 수
}
```

### NotebookEdit

**도구 이름:** `NotebookEdit`

**입력:**

```python
{
    "notebook_path": str,  # Jupyter 노트북의 절대 경로
    "cell_id": str | None,  # 편집할 셀의 ID
    "new_source": str,  # 셀의 새 소스
    "cell_type": "code" | "markdown" | None,  # 셀 유형
    "edit_mode": "replace" | "insert" | "delete" | None,  # 편집 작업 유형
}
```

**출력:**

```python
{
    "message": str,  # 성공 메시지
    "edit_type": "replaced" | "inserted" | "deleted",  # 수행된 편집 유형
    "cell_id": str | None,  # 영향받은 셀 ID
    "total_cells": int,  # 편집 후 노트북의 총 셀 수
}
```

### WebFetch

**도구 이름:** `WebFetch`

**입력:**

```python
{
    "url": str,  # 콘텐츠를 가져올 URL
    "prompt": str,  # 가져온 콘텐츠에 실행할 프롬프트
}
```

**출력:**

```python
{
    "response": str,  # 프롬프트에 대한 AI 모델의 응답
    "url": str,  # 가져온 URL
    "final_url": str | None,  # 리다이렉트 후 최종 URL
    "status_code": int | None,  # HTTP 상태 코드
}
```

### WebSearch

**도구 이름:** `WebSearch`

**입력:**

```python
{
    "query": str,  # 사용할 검색 쿼리
    "allowed_domains": list[str] | None,  # 이 도메인의 결과만 포함
    "blocked_domains": list[str] | None,  # 이 도메인의 결과 제외
}
```

**출력:**

```python
{
    "results": [{"title": str, "url": str, "snippet": str, "metadata": dict | None}],
    "total_results": int,
    "query": str,
}
```

### TodoWrite

**도구 이름:** `TodoWrite`

**입력:**

```python
{
    "todos": [
        {
            "content": str,  # 작업 설명
            "status": "pending" | "in_progress" | "completed",  # 작업 상태
            "activeForm": str,  # 설명의 능동형
        }
    ]
}
```

**출력:**

```python
{
    "message": str,  # 성공 메시지
    "stats": {"total": int, "pending": int, "in_progress": int, "completed": int},
}
```

### BashOutput

**도구 이름:** `BashOutput`

**입력:**

```python
{
    "bash_id": str,  # 백그라운드 셸의 ID
    "filter": str | None,  # 출력 줄 필터링을 위한 선택적 정규식
}
```

**출력:**

```python
{
    "output": str,  # 마지막 확인 이후의 새 출력
    "status": "running" | "completed" | "failed",  # 현재 셸 상태
    "exitCode": int | None,  # 완료 시 종료 코드
}
```

### KillBash

**도구 이름:** `KillBash`

**입력:**

```python
{
    "shell_id": str  # 종료할 백그라운드 셸의 ID
}
```

**출력:**

```python
{
    "message": str,  # 성공 메시지
    "shell_id": str,  # 종료된 셸의 ID
}
```

### ExitPlanMode

**도구 이름:** `ExitPlanMode`

**입력:**

```python
{
    "plan": str  # 사용자 승인을 위해 실행할 계획
}
```

**출력:**

```python
{
    "message": str,  # 확인 메시지
    "approved": bool | None,  # 사용자가 계획을 승인했는지 여부
}
```

### ListMcpResources

**도구 이름:** `ListMcpResources`

**입력:**

```python
{
    "server": str | None  # 리소스를 필터링할 선택적 서버 이름
}
```

**출력:**

```python
{
    "resources": [
        {
            "uri": str,
            "name": str,
            "description": str | None,
            "mimeType": str | None,
            "server": str,
        }
    ],
    "total": int,
}
```

### ReadMcpResource

**도구 이름:** `ReadMcpResource`

**입력:**

```python
{
    "server": str,  # MCP 서버 이름
    "uri": str,  # 읽을 리소스 URI
}
```

**출력:**

```python
{
    "contents": [
        {"uri": str, "mimeType": str | None, "text": str | None, "blob": str | None}
    ],
    "server": str,
}
```

## ClaudeSDKClient를 사용한 고급 기능

### 지속적 대화 인터페이스 구축

```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    TextBlock,
)
import asyncio


class ConversationSession:
    """Claude와의 단일 대화 세션을 유지합니다."""

    def __init__(self, options: ClaudeAgentOptions | None = None):
        self.client = ClaudeSDKClient(options)
        self.turn_count = 0

    async def start(self):
        await self.client.connect()
        print("Starting conversation session. Claude will remember context.")
        print(
            "Commands: 'exit' to quit, 'interrupt' to stop current task, 'new' for new session"
        )

        while True:
            user_input = input(f"\n[Turn {self.turn_count + 1}] You: ")

            if user_input.lower() == "exit":
                break
            elif user_input.lower() == "interrupt":
                await self.client.interrupt()
                print("Task interrupted!")
                continue
            elif user_input.lower() == "new":
                # 새 세션을 위해 연결 해제 후 재연결
                await self.client.disconnect()
                await self.client.connect()
                self.turn_count = 0
                print("Started new conversation session (previous context cleared)")
                continue

            # 메시지 전송 - 세션이 이전 모든 메시지를 유지
            await self.client.query(user_input)
            self.turn_count += 1

            # 응답 처리
            print(f"[Turn {self.turn_count}] Claude: ", end="")
            async for message in self.client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(block.text, end="")
            print()  # 응답 후 줄바꿈

        await self.client.disconnect()
        print(f"Conversation ended after {self.turn_count} turns.")


async def main():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Write", "Bash"], permission_mode="acceptEdits"
    )
    session = ConversationSession(options)
    await session.start()


# 대화 예시:
# Turn 1 - You: "Create a file called hello.py"
# Turn 1 - Claude: "I'll create a hello.py file for you..."
# Turn 2 - You: "What's in that file?"
# Turn 2 - Claude: "The hello.py file I just created contains..." (기억합니다!)
# Turn 3 - You: "Add a main function to it"
# Turn 3 - Claude: "I'll add a main function to hello.py..." (어떤 파일인지 알고 있습니다!)

asyncio.run(main())
```

### Hook을 사용한 동작 수정

```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    HookMatcher,
    HookContext,
)
import asyncio
from typing import Any


async def pre_tool_logger(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """실행 전 모든 도구 사용을 로깅합니다."""
    tool_name = input_data.get("tool_name", "unknown")
    print(f"[PRE-TOOL] About to use: {tool_name}")

    # 여기서 도구 실행을 수정하거나 차단할 수 있습니다
    if tool_name == "Bash" and "rm -rf" in str(input_data.get("tool_input", {})):
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Dangerous command blocked",
            }
        }
    return {}


async def post_tool_logger(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """도구 실행 후 결과를 로깅합니다."""
    tool_name = input_data.get("tool_name", "unknown")
    print(f"[POST-TOOL] Completed: {tool_name}")
    return {}


async def user_prompt_modifier(
    input_data: dict[str, Any], tool_use_id: str | None, context: HookContext
) -> dict[str, Any]:
    """사용자 프롬프트에 컨텍스트를 추가합니다."""
    original_prompt = input_data.get("prompt", "")

    # Claude가 볼 수 있는 추가 컨텍스트로 타임스탬프 추가
    from datetime import datetime

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": f"[Submitted at {timestamp}] Original prompt: {original_prompt}",
        }
    }


async def main():
    options = ClaudeAgentOptions(
        hooks={
            "PreToolUse": [
                HookMatcher(hooks=[pre_tool_logger]),
                HookMatcher(matcher="Bash", hooks=[pre_tool_logger]),
            ],
            "PostToolUse": [HookMatcher(hooks=[post_tool_logger])],
            "UserPromptSubmit": [HookMatcher(hooks=[user_prompt_modifier])],
        },
        allowed_tools=["Read", "Write", "Bash"],
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("List files in current directory")

        async for message in client.receive_response():
            # Hook이 자동으로 도구 사용을 로깅합니다
            pass


asyncio.run(main())
```

### 실시간 진행 상황 모니터링

```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ToolUseBlock,
    ToolResultBlock,
    TextBlock,
)
import asyncio


async def monitor_progress():
    options = ClaudeAgentOptions(
        allowed_tools=["Write", "Bash"], permission_mode="acceptEdits"
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Create 5 Python files with different sorting algorithms")

        # 실시간으로 진행 상황 모니터링
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, ToolUseBlock):
                        if block.name == "Write":
                            file_path = block.input.get("file_path", "")
                            print(f"Creating: {file_path}")
                    elif isinstance(block, ToolResultBlock):
                        print("Completed tool execution")
                    elif isinstance(block, TextBlock):
                        print(f"Claude says: {block.text[:100]}...")

        print("Task completed!")


asyncio.run(monitor_progress())
```

## 사용 예제

### 기본 파일 작업 (query 사용)

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ToolUseBlock
import asyncio


async def create_project():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Write", "Bash"],
        permission_mode="acceptEdits",
        cwd="/home/user/project",
    )

    async for message in query(
        prompt="Create a Python project structure with setup.py", options=options
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, ToolUseBlock):
                    print(f"Using tool: {block.name}")


asyncio.run(create_project())
```

### 오류 처리

```python
from claude_agent_sdk import query, CLINotFoundError, ProcessError, CLIJSONDecodeError

try:
    async for message in query(prompt="Hello"):
        print(message)
except CLINotFoundError:
    print(
        "Claude Code CLI not found. Try reinstalling: pip install --force-reinstall claude-agent-sdk"
    )
except ProcessError as e:
    print(f"Process failed with exit code: {e.exit_code}")
except CLIJSONDecodeError as e:
    print(f"Failed to parse response: {e}")
```

### 클라이언트를 사용한 스트리밍 모드

```python
from claude_agent_sdk import ClaudeSDKClient
import asyncio


async def interactive_session():
    async with ClaudeSDKClient() as client:
        # 초기 메시지 전송
        await client.query("What's the weather like?")

        # 응답 처리
        async for msg in client.receive_response():
            print(msg)

        # 후속 메시지 전송
        await client.query("Tell me more about that")

        # 후속 응답 처리
        async for msg in client.receive_response():
            print(msg)


asyncio.run(interactive_session())
```

### ClaudeSDKClient에서 커스텀 도구 사용

```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    tool,
    create_sdk_mcp_server,
    AssistantMessage,
    TextBlock,
)
import asyncio
from typing import Any


# @tool 데코레이터로 커스텀 도구 정의
@tool("calculate", "Perform mathematical calculations", {"expression": str})
async def calculate(args: dict[str, Any]) -> dict[str, Any]:
    try:
        result = eval(args["expression"], {"__builtins__": {}})
        return {"content": [{"type": "text", "text": f"Result: {result}"}]}
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"Error: {str(e)}"}],
            "is_error": True,
        }


@tool("get_time", "Get current time", {})
async def get_time(args: dict[str, Any]) -> dict[str, Any]:
    from datetime import datetime

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {"content": [{"type": "text", "text": f"Current time: {current_time}"}]}


async def main():
    # 커스텀 도구로 SDK MCP 서버 생성
    my_server = create_sdk_mcp_server(
        name="utilities", version="1.0.0", tools=[calculate, get_time]
    )

    # 서버로 옵션 구성
    options = ClaudeAgentOptions(
        mcp_servers={"utils": my_server},
        allowed_tools=["mcp__utils__calculate", "mcp__utils__get_time"],
    )

    # 대화형 도구 사용을 위해 ClaudeSDKClient 사용
    async with ClaudeSDKClient(options=options) as client:
        await client.query("What's 123 * 456?")

        # 계산 응답 처리
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Calculation: {block.text}")

        # 시간 쿼리로 후속 질문
        await client.query("What time is it now?")

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Time: {block.text}")


asyncio.run(main())
```

## 샌드박스 설정

### `SandboxSettings`

샌드박스 동작 설정입니다. 명령 샌드박싱을 활성화하고 네트워크 제한을 프로그래밍 방식으로 구성하는 데 사용합니다.

```python
class SandboxSettings(TypedDict, total=False):
    enabled: bool
    autoAllowBashIfSandboxed: bool
    excludedCommands: list[str]
    allowUnsandboxedCommands: bool
    network: SandboxNetworkConfig
    ignoreViolations: SandboxIgnoreViolations
    enableWeakerNestedSandbox: bool
```

| 속성 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `enabled` | `bool` | `False` | 명령 실행을 위한 샌드박스 모드 활성화 |
| `autoAllowBashIfSandboxed` | `bool` | `True` | 샌드박스 활성화 시 bash 명령 자동 승인 |
| `excludedCommands` | `list[str]` | `[]` | 항상 샌드박스 제한을 우회하는 명령 (예: `["docker"]`). 모델 관여 없이 자동으로 샌드박스 외부에서 실행 |
| `allowUnsandboxedCommands` | `bool` | `True` | 모델이 샌드박스 외부에서 명령 실행을 요청할 수 있도록 허용. `True`이면 모델이 도구 입력에서 `dangerouslyDisableSandbox`를 설정할 수 있으며, [권한 시스템](#샌드박스-외부-명령의-권한-대체)으로 대체됨 |
| `network` | [`SandboxNetworkConfig`](#sandboxnetworkconfig) | `None` | 네트워크 관련 샌드박스 설정 |
| `ignoreViolations` | [`SandboxIgnoreViolations`](#sandboxignoreviolations) | `None` | 무시할 샌드박스 위반 설정 |
| `enableWeakerNestedSandbox` | `bool` | `False` | 호환성을 위한 약한 중첩 샌드박스 활성화 |

::: info
**파일 시스템 및 네트워크 접근 제한**은 샌드박스 설정으로 구성되지 않습니다. 대신 [권한 규칙](/settings#permission-settings)에서 파생됩니다:

* **파일 시스템 읽기 제한**: Read deny 규칙
* **파일 시스템 쓰기 제한**: Edit allow/deny 규칙
* **네트워크 제한**: WebFetch allow/deny 규칙

명령 실행 샌드박싱에는 샌드박스 설정을 사용하고, 파일 시스템 및 네트워크 접근 제어에는 권한 규칙을 사용하세요.
:::

#### 사용 예제

```python
from claude_agent_sdk import query, ClaudeAgentOptions, SandboxSettings

sandbox_settings: SandboxSettings = {
    "enabled": True,
    "autoAllowBashIfSandboxed": True,
    "network": {"allowLocalBinding": True},
}

async for message in query(
    prompt="Build and test my project",
    options=ClaudeAgentOptions(sandbox=sandbox_settings),
):
    print(message)
```

::: warning
**Unix 소켓 보안**: `allowUnixSockets` 옵션은 강력한 시스템 서비스에 대한 접근을 부여할 수 있습니다. 예를 들어 `/var/run/docker.sock`을 허용하면 Docker API를 통해 사실상 전체 호스트 시스템 접근을 부여하여 샌드박스 격리를 우회합니다. 반드시 필요한 Unix 소켓만 허용하고 각각의 보안 영향을 이해하세요.
:::

### `SandboxNetworkConfig`

샌드박스 모드의 네트워크별 설정입니다.

```python
class SandboxNetworkConfig(TypedDict, total=False):
    allowLocalBinding: bool
    allowUnixSockets: list[str]
    allowAllUnixSockets: bool
    httpProxyPort: int
    socksProxyPort: int
```

| 속성 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `allowLocalBinding` | `bool` | `False` | 프로세스가 로컬 포트에 바인딩할 수 있도록 허용 (예: 개발 서버용) |
| `allowUnixSockets` | `list[str]` | `[]` | 프로세스가 접근할 수 있는 Unix 소켓 경로 (예: Docker 소켓) |
| `allowAllUnixSockets` | `bool` | `False` | 모든 Unix 소켓에 대한 접근 허용 |
| `httpProxyPort` | `int` | `None` | 네트워크 요청용 HTTP 프록시 포트 |
| `socksProxyPort` | `int` | `None` | 네트워크 요청용 SOCKS 프록시 포트 |

### `SandboxIgnoreViolations`

특정 샌드박스 위반을 무시하기 위한 설정입니다.

```python
class SandboxIgnoreViolations(TypedDict, total=False):
    file: list[str]
    network: list[str]
```

| 속성 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `file` | `list[str]` | `[]` | 위반을 무시할 파일 경로 패턴 |
| `network` | `list[str]` | `[]` | 위반을 무시할 네트워크 패턴 |

### 샌드박스 외부 명령의 권한 대체

`allowUnsandboxedCommands`가 활성화되면, 모델은 도구 입력에서 `dangerouslyDisableSandbox: True`를 설정하여 샌드박스 외부에서 명령을 실행하도록 요청할 수 있습니다. 이러한 요청은 기존 권한 시스템으로 대체되므로 `can_use_tool` 핸들러가 호출되어 커스텀 인증 로직을 구현할 수 있습니다.

::: info
**`excludedCommands` vs `allowUnsandboxedCommands`:**

* `excludedCommands`: 항상 샌드박스를 자동으로 우회하는 정적 명령 목록 (예: `["docker"]`). 모델이 이를 제어할 수 없습니다.
* `allowUnsandboxedCommands`: 모델이 런타임에 도구 입력에서 `dangerouslyDisableSandbox: True`를 설정하여 샌드박스 외부 실행을 요청할지 결정할 수 있게 합니다.
:::

```python
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)


async def can_use_tool(
    tool: str, input: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    # 모델이 샌드박스 우회를 요청하는지 확인
    if tool == "Bash" and input.get("dangerouslyDisableSandbox"):
        # 모델이 이 명령을 샌드박스 외부에서 실행하도록 요청합니다
        print(f"Unsandboxed command requested: {input.get('command')}")

        if is_command_authorized(input.get("command")):
            return PermissionResultAllow()
        return PermissionResultDeny(
            message="Command not authorized for unsandboxed execution"
        )
    return PermissionResultAllow()


# 필수: can_use_tool을 위해 스트림을 열어두는 더미 Hook
async def dummy_hook(input_data, tool_use_id, context):
    return {"continue_": True}


async def prompt_stream():
    yield {
        "type": "user",
        "message": {"role": "user", "content": "Deploy my application"},
    }


async def main():
    async for message in query(
        prompt=prompt_stream(),
        options=ClaudeAgentOptions(
            sandbox={
                "enabled": True,
                "allowUnsandboxedCommands": True,  # 모델이 샌드박스 외부 실행을 요청할 수 있음
            },
            permission_mode="default",
            can_use_tool=can_use_tool,
            hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
        ),
    ):
        print(message)
```

이 패턴을 사용하면 다음이 가능합니다:

* **모델 요청 감사**: 모델이 샌드박스 외부 실행을 요청할 때 로깅
* **허용 목록 구현**: 특정 명령만 샌드박스 외부 실행 허용
* **승인 워크플로우 추가**: 권한이 필요한 작업에 명시적 인증 요구

::: warning
`dangerouslyDisableSandbox: True`로 실행되는 명령은 전체 시스템 접근 권한을 가집니다. `can_use_tool` 핸들러가 이러한 요청을 신중하게 검증하는지 확인하세요.

`permission_mode`가 `bypassPermissions`로 설정되고 `allow_unsandboxed_commands`가 활성화된 경우, 모델은 승인 프롬프트 없이 자율적으로 샌드박스 외부에서 명령을 실행할 수 있습니다. 이 조합은 사실상 모델이 샌드박스 격리를 조용히 벗어날 수 있게 합니다.
:::

## 참고 자료

* [SDK 개요](/agent-sdk/overview) - 일반 SDK 개념
* [TypeScript SDK 레퍼런스](/agent-sdk/typescript) - TypeScript SDK 문서
* [CLI 레퍼런스](/cli-reference) - 명령줄 인터페이스
* [일반 워크플로우](/common-workflows) - 단계별 가이드
