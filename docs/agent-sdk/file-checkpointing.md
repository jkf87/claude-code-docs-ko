---
title: 체크포인팅으로 파일 변경 되돌리기
description: 에이전트 세션 중 파일 변경 사항을 추적하고 이전 상태로 복원하는 방법
---

# 체크포인팅으로 파일 변경 되돌리기

> 에이전트 세션 중 파일 변경 사항을 추적하고 이전 상태로 복원하세요

파일 체크포인팅은 에이전트 세션 중 Write, Edit, NotebookEdit 도구를 통해 이루어진 파일 수정 사항을 추적하여, 파일을 이전 상태로 되돌릴 수 있게 해줍니다. 바로 체험해보고 싶으신가요? [인터랙티브 예제](#직접-체험해보기)로 이동하세요.

체크포인팅을 사용하면 다음이 가능합니다:

* **원치 않는 변경 취소** - 파일을 알려진 정상 상태로 복원
* **대안 탐색** - 체크포인트로 복원 후 다른 방법 시도
* **오류 복구** - 에이전트가 잘못된 수정을 했을 때 복원

::: warning
Write, Edit, NotebookEdit 도구를 통한 변경 사항만 추적됩니다. Bash 명령(`echo > file.txt` 또는 `sed -i` 등)을 통한 변경은 체크포인트 시스템에 캡처되지 않습니다.
:::

## 체크포인팅 작동 방식

파일 체크포인팅을 활성화하면, SDK는 Write, Edit, NotebookEdit 도구를 통해 파일을 수정하기 전에 백업을 생성합니다. 응답 스트림의 사용자 메시지에는 복원 지점으로 사용할 수 있는 checkpoint UUID가 포함됩니다.

체크포인트는 에이전트가 파일을 수정하는 데 사용하는 다음 내장 도구들과 함께 작동합니다:

| 도구         | 설명                                                        |
| ------------ | ----------------------------------------------------------- |
| Write        | 새 파일 생성 또는 기존 파일을 새 내용으로 덮어쓰기          |
| Edit         | 기존 파일의 특정 부분에 대한 선택적 편집                    |
| NotebookEdit | Jupyter 노트북(`.ipynb` 파일)의 셀 수정                     |

::: info
파일 되돌리기는 디스크의 파일을 이전 상태로 복원합니다. 대화 자체를 되돌리지는 않습니다. `rewindFiles()` (TypeScript) 또는 `rewind_files()` (Python) 호출 후에도 대화 기록과 컨텍스트는 그대로 유지됩니다.
:::

체크포인트 시스템이 추적하는 항목:

* 세션 중 생성된 파일
* 세션 중 수정된 파일
* 수정된 파일의 원본 내용

체크포인트로 되돌리면, 생성된 파일은 삭제되고 수정된 파일은 해당 시점의 내용으로 복원됩니다.

## 체크포인팅 구현

파일 체크포인팅을 사용하려면, 옵션에서 활성화하고, 응답 스트림에서 checkpoint UUID를 캡처한 다음, 복원이 필요할 때 `rewindFiles()` (TypeScript) 또는 `rewind_files()` (Python)를 호출합니다.

다음 예제는 전체 흐름을 보여줍니다: 체크포인팅 활성화, 응답 스트림에서 checkpoint UUID와 session ID 캡처, 나중에 세션을 재개하여 파일 되돌리기. 각 단계는 아래에서 자세히 설명합니다.

::: code-group
```python [Python]
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    UserMessage,
    ResultMessage,
)


async def main():
    # Step 1: Enable checkpointing
    options = ClaudeAgentOptions(
        enable_file_checkpointing=True,
        permission_mode="acceptEdits",  # Auto-accept file edits without prompting
        extra_args={
            "replay-user-messages": None
        },  # Required to receive checkpoint UUIDs in the response stream
    )

    checkpoint_id = None
    session_id = None

    # Run the query and capture checkpoint UUID and session ID
    async with ClaudeSDKClient(options) as client:
        await client.query("Refactor the authentication module")

        # Step 2: Capture checkpoint UUID from the first user message
        async for message in client.receive_response():
            if isinstance(message, UserMessage) and message.uuid and not checkpoint_id:
                checkpoint_id = message.uuid
            if isinstance(message, ResultMessage) and not session_id:
                session_id = message.session_id

    # Step 3: Later, rewind by resuming the session with an empty prompt
    if checkpoint_id and session_id:
        async with ClaudeSDKClient(
            ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
        ) as client:
            await client.query("")  # Empty prompt to open the connection
            async for message in client.receive_response():
                await client.rewind_files(checkpoint_id)
                break
        print(f"Rewound to checkpoint: {checkpoint_id}")


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  // Step 1: Enable checkpointing
  const opts = {
    enableFileCheckpointing: true,
    permissionMode: "acceptEdits" as const, // Auto-accept file edits without prompting
    extraArgs: { "replay-user-messages": null } // Required to receive checkpoint UUIDs in the response stream
  };

  const response = query({
    prompt: "Refactor the authentication module",
    options: opts
  });

  let checkpointId: string | undefined;
  let sessionId: string | undefined;

  // Step 2: Capture checkpoint UUID from the first user message
  for await (const message of response) {
    if (message.type === "user" && message.uuid && !checkpointId) {
      checkpointId = message.uuid;
    }
    if ("session_id" in message && !sessionId) {
      sessionId = message.session_id;
    }
  }

  // Step 3: Later, rewind by resuming the session with an empty prompt
  if (checkpointId && sessionId) {
    const rewindQuery = query({
      prompt: "", // Empty prompt to open the connection
      options: { ...opts, resume: sessionId }
    });

    for await (const msg of rewindQuery) {
      await rewindQuery.rewindFiles(checkpointId);
      break;
    }
    console.log(`Rewound to checkpoint: ${checkpointId}`);
  }
}

main();
```
:::

### 1. 체크포인팅 활성화

체크포인팅을 활성화하고 checkpoint UUID를 받을 수 있도록 SDK 옵션을 설정합니다:

| 옵션                     | Python                                      | TypeScript                                    | 설명                                             |
| ------------------------ | ------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| 체크포인팅 활성화        | `enable_file_checkpointing=True`            | `enableFileCheckpointing: true`               | 되돌리기를 위한 파일 변경 추적                   |
| Checkpoint UUID 수신     | `extra_args={"replay-user-messages": None}` | `extraArgs: { 'replay-user-messages': null }` | 스트림에서 사용자 메시지 UUID를 받기 위해 필요   |

::: code-group
```python [Python]
options = ClaudeAgentOptions(
    enable_file_checkpointing=True,
    permission_mode="acceptEdits",
    extra_args={"replay-user-messages": None},
)

async with ClaudeSDKClient(options) as client:
    await client.query("Refactor the authentication module")
```

```typescript [TypeScript]
const response = query({
  prompt: "Refactor the authentication module",
  options: {
    enableFileCheckpointing: true,
    permissionMode: "acceptEdits" as const,
    extraArgs: { "replay-user-messages": null }
  }
});
```
:::

### 2. Checkpoint UUID 및 Session ID 캡처

위에서 설정한 `replay-user-messages` 옵션이 적용되면, 응답 스트림의 각 사용자 메시지에는 체크포인트 역할을 하는 UUID가 포함됩니다.

대부분의 경우, 첫 번째 사용자 메시지의 UUID(`message.uuid`)를 캡처하면 됩니다. 이 시점으로 되돌리면 모든 파일이 원래 상태로 복원됩니다. 여러 체크포인트를 저장하고 중간 상태로 되돌리려면 [여러 복원 지점](#여러-복원-지점)을 참조하세요.

session ID(`message.session_id`) 캡처는 선택 사항입니다. 스트림이 완료된 후 나중에 되돌리고 싶을 때만 필요합니다. 메시지를 처리하는 중에 즉시 `rewindFiles()`를 호출하는 경우([위험한 작업 전 체크포인트](#위험한-작업-전-체크포인트) 예제처럼), session ID 캡처를 건너뛸 수 있습니다.

::: code-group
```python [Python]
checkpoint_id = None
session_id = None

async for message in client.receive_response():
    # Update checkpoint on each user message (keeps the latest)
    if isinstance(message, UserMessage) and message.uuid:
        checkpoint_id = message.uuid
    # Capture session ID from the result message
    if isinstance(message, ResultMessage):
        session_id = message.session_id
```

```typescript [TypeScript]
let checkpointId: string | undefined;
let sessionId: string | undefined;

for await (const message of response) {
  // Update checkpoint on each user message (keeps the latest)
  if (message.type === "user" && message.uuid) {
    checkpointId = message.uuid;
  }
  // Capture session ID from any message that has it
  if ("session_id" in message) {
    sessionId = message.session_id;
  }
}
```
:::

### 3. 파일 되돌리기

스트림이 완료된 후 되돌리려면, 빈 프롬프트로 세션을 재개하고 checkpoint UUID와 함께 `rewind_files()` (Python) 또는 `rewindFiles()` (TypeScript)를 호출합니다. 스트림 처리 중에도 되돌릴 수 있습니다. 해당 패턴은 [위험한 작업 전 체크포인트](#위험한-작업-전-체크포인트)를 참조하세요.

::: code-group
```python [Python]
async with ClaudeSDKClient(
    ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
) as client:
    await client.query("")  # Empty prompt to open the connection
    async for message in client.receive_response():
        await client.rewind_files(checkpoint_id)
        break
```

```typescript [TypeScript]
const rewindQuery = query({
  prompt: "", // Empty prompt to open the connection
  options: { ...opts, resume: sessionId }
});

for await (const msg of rewindQuery) {
  await rewindQuery.rewindFiles(checkpointId);
  break;
}
```
:::

session ID와 checkpoint ID를 캡처했다면 CLI에서도 되돌릴 수 있습니다:

```bash
claude -p --resume <session-id> --rewind-files <checkpoint-uuid>
```

## 일반적인 패턴

이 패턴들은 사용 사례에 따라 checkpoint UUID를 캡처하고 활용하는 다양한 방법을 보여줍니다.

### 위험한 작업 전 체크포인트

이 패턴은 가장 최근의 checkpoint UUID만 유지하며, 각 에이전트 턴 전에 업데이트합니다. 처리 중에 문제가 발생하면, 즉시 마지막 안전 상태로 되돌리고 루프에서 빠져나올 수 있습니다.

::: code-group
```python [Python]
import asyncio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, UserMessage


async def main():
    options = ClaudeAgentOptions(
        enable_file_checkpointing=True,
        permission_mode="acceptEdits",
        extra_args={"replay-user-messages": None},
    )

    safe_checkpoint = None

    async with ClaudeSDKClient(options) as client:
        await client.query("Refactor the authentication module")

        async for message in client.receive_response():
            # Update checkpoint before each agent turn starts
            # This overwrites the previous checkpoint. Only keep the latest
            if isinstance(message, UserMessage) and message.uuid:
                safe_checkpoint = message.uuid

            # Decide when to revert based on your own logic
            # For example: error detection, validation failure, or user input
            if your_revert_condition and safe_checkpoint:
                await client.rewind_files(safe_checkpoint)
                # Exit the loop after rewinding, files are restored
                break


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const response = query({
    prompt: "Refactor the authentication module",
    options: {
      enableFileCheckpointing: true,
      permissionMode: "acceptEdits" as const,
      extraArgs: { "replay-user-messages": null }
    }
  });

  let safeCheckpoint: string | undefined;

  for await (const message of response) {
    // Update checkpoint before each agent turn starts
    // This overwrites the previous checkpoint. Only keep the latest
    if (message.type === "user" && message.uuid) {
      safeCheckpoint = message.uuid;
    }

    // Decide when to revert based on your own logic
    // For example: error detection, validation failure, or user input
    if (yourRevertCondition && safeCheckpoint) {
      await response.rewindFiles(safeCheckpoint);
      // Exit the loop after rewinding, files are restored
      break;
    }
  }
}

main();
```
:::

### 여러 복원 지점

Claude가 여러 턴에 걸쳐 변경을 수행하는 경우, 처음으로 완전히 되돌리는 것이 아니라 특정 지점으로 되돌리고 싶을 수 있습니다. 예를 들어, Claude가 첫 번째 턴에서 파일을 리팩터링하고 두 번째 턴에서 테스트를 추가했다면, 리팩터링은 유지하면서 테스트만 취소하고 싶을 수 있습니다.

이 패턴은 모든 checkpoint UUID를 메타데이터와 함께 배열에 저장합니다. 세션이 완료된 후 원하는 체크포인트로 되돌릴 수 있습니다:

::: code-group
```python [Python]
import asyncio
from dataclasses import dataclass
from datetime import datetime
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    UserMessage,
    ResultMessage,
)


# Store checkpoint metadata for better tracking
@dataclass
class Checkpoint:
    id: str
    description: str
    timestamp: datetime


async def main():
    options = ClaudeAgentOptions(
        enable_file_checkpointing=True,
        permission_mode="acceptEdits",
        extra_args={"replay-user-messages": None},
    )

    checkpoints = []
    session_id = None

    async with ClaudeSDKClient(options) as client:
        await client.query("Refactor the authentication module")

        async for message in client.receive_response():
            if isinstance(message, UserMessage) and message.uuid:
                checkpoints.append(
                    Checkpoint(
                        id=message.uuid,
                        description=f"After turn {len(checkpoints) + 1}",
                        timestamp=datetime.now(),
                    )
                )
            if isinstance(message, ResultMessage) and not session_id:
                session_id = message.session_id

    # Later: rewind to any checkpoint by resuming the session
    if checkpoints and session_id:
        target = checkpoints[0]  # Pick any checkpoint
        async with ClaudeSDKClient(
            ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
        ) as client:
            await client.query("")  # Empty prompt to open the connection
            async for message in client.receive_response():
                await client.rewind_files(target.id)
                break
        print(f"Rewound to: {target.description}")


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// Store checkpoint metadata for better tracking
interface Checkpoint {
  id: string;
  description: string;
  timestamp: Date;
}

async function main() {
  const opts = {
    enableFileCheckpointing: true,
    permissionMode: "acceptEdits" as const,
    extraArgs: { "replay-user-messages": null }
  };

  const response = query({
    prompt: "Refactor the authentication module",
    options: opts
  });

  const checkpoints: Checkpoint[] = [];
  let sessionId: string | undefined;

  for await (const message of response) {
    if (message.type === "user" && message.uuid) {
      checkpoints.push({
        id: message.uuid,
        description: `After turn ${checkpoints.length + 1}`,
        timestamp: new Date()
      });
    }
    if ("session_id" in message && !sessionId) {
      sessionId = message.session_id;
    }
  }

  // Later: rewind to any checkpoint by resuming the session
  if (checkpoints.length > 0 && sessionId) {
    const target = checkpoints[0]; // Pick any checkpoint
    const rewindQuery = query({
      prompt: "", // Empty prompt to open the connection
      options: { ...opts, resume: sessionId }
    });

    for await (const msg of rewindQuery) {
      await rewindQuery.rewindFiles(target.id);
      break;
    }
    console.log(`Rewound to: ${target.description}`);
  }
}

main();
```
:::

## 직접 체험해보기

이 완전한 예제는 작은 유틸리티 파일을 생성하고, 에이전트가 문서 주석을 추가하도록 한 다음, 변경 사항을 보여주고, 되돌릴지 여부를 묻습니다.

시작하기 전에 [Claude Agent SDK가 설치](/agent-sdk/quickstart)되어 있는지 확인하세요.

### 1. 테스트 파일 생성

`utils.py` (Python) 또는 `utils.ts` (TypeScript)라는 새 파일을 만들고 다음 코드를 붙여넣으세요:

::: code-group
```python [utils.py]
def add(a, b):
    return a + b


def subtract(a, b):
    return a - b


def multiply(a, b):
    return a * b


def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

```typescript [utils.ts]
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}
```
:::

### 2. 인터랙티브 예제 실행

유틸리티 파일과 같은 디렉토리에 `try_checkpointing.py` (Python) 또는 `try_checkpointing.ts` (TypeScript)라는 새 파일을 만들고 다음 코드를 붙여넣으세요.

이 스크립트는 Claude에게 유틸리티 파일에 문서 주석을 추가하도록 요청한 다음, 되돌려서 원본을 복원할 옵션을 제공합니다.

::: code-group
```python [try_checkpointing.py]
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    UserMessage,
    ResultMessage,
)


async def main():
    # Configure the SDK with checkpointing enabled
    # - enable_file_checkpointing: Track file changes for rewinding
    # - permission_mode: Auto-accept file edits without prompting
    # - extra_args: Required to receive user message UUIDs in the stream
    options = ClaudeAgentOptions(
        enable_file_checkpointing=True,
        permission_mode="acceptEdits",
        extra_args={"replay-user-messages": None},
    )

    checkpoint_id = None  # Store the user message UUID for rewinding
    session_id = None  # Store the session ID for resuming

    print("Running agent to add doc comments to utils.py...\n")

    # Run the agent and capture checkpoint data from the response stream
    async with ClaudeSDKClient(options) as client:
        await client.query("Add doc comments to utils.py")

        async for message in client.receive_response():
            # Capture the first user message UUID - this is our restore point
            if isinstance(message, UserMessage) and message.uuid and not checkpoint_id:
                checkpoint_id = message.uuid
            # Capture the session ID so we can resume later
            if isinstance(message, ResultMessage):
                session_id = message.session_id

    print("Done! Open utils.py to see the added doc comments.\n")

    # Ask the user if they want to rewind the changes
    if checkpoint_id and session_id:
        response = input("Rewind to remove the doc comments? (y/n): ")

        if response.lower() == "y":
            # Resume the session with an empty prompt, then rewind
            async with ClaudeSDKClient(
                ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
            ) as client:
                await client.query("")  # Empty prompt opens the connection
                async for message in client.receive_response():
                    await client.rewind_files(checkpoint_id)  # Restore files
                    break

            print(
                "\n✓ File restored! Open utils.py to verify the doc comments are gone."
            )
        else:
            print("\nKept the modified file.")


asyncio.run(main())
```

```typescript [try_checkpointing.ts]
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as readline from "readline";

async function main() {
  // Configure the SDK with checkpointing enabled
  // - enableFileCheckpointing: Track file changes for rewinding
  // - permissionMode: Auto-accept file edits without prompting
  // - extraArgs: Required to receive user message UUIDs in the stream
  const opts = {
    enableFileCheckpointing: true,
    permissionMode: "acceptEdits" as const,
    extraArgs: { "replay-user-messages": null }
  };

  let sessionId: string | undefined; // Store the session ID for resuming
  let checkpointId: string | undefined; // Store the user message UUID for rewinding

  console.log("Running agent to add doc comments to utils.ts...\n");

  // Run the agent and capture checkpoint data from the response stream
  const response = query({
    prompt: "Add doc comments to utils.ts",
    options: opts
  });

  for await (const message of response) {
    // Capture the first user message UUID - this is our restore point
    if (message.type === "user" && message.uuid && !checkpointId) {
      checkpointId = message.uuid;
    }
    // Capture the session ID so we can resume later
    if ("session_id" in message) {
      sessionId = message.session_id;
    }
  }

  console.log("Done! Open utils.ts to see the added doc comments.\n");

  // Ask the user if they want to rewind the changes
  if (checkpointId && sessionId) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question("Rewind to remove the doc comments? (y/n): ", resolve);
    });
    rl.close();

    if (answer.toLowerCase() === "y") {
      // Resume the session with an empty prompt, then rewind
      const rewindQuery = query({
        prompt: "", // Empty prompt opens the connection
        options: { ...opts, resume: sessionId }
      });

      for await (const msg of rewindQuery) {
        await rewindQuery.rewindFiles(checkpointId); // Restore files
        break;
      }

      console.log("\n✓ File restored! Open utils.ts to verify the doc comments are gone.");
    } else {
      console.log("\nKept the modified file.");
    }
  }
}

main();
```
:::

이 예제는 완전한 체크포인팅 워크플로우를 보여줍니다:

1. **체크포인팅 활성화**: `enable_file_checkpointing=True`와 `permission_mode="acceptEdits"`로 SDK를 설정하여 파일 편집을 자동 승인
2. **체크포인트 데이터 캡처**: 에이전트가 실행되는 동안 첫 번째 사용자 메시지 UUID(복원 지점)와 session ID를 저장
3. **되돌리기 여부 확인**: 에이전트가 완료된 후 유틸리티 파일에서 문서 주석을 확인한 다음, 변경을 취소할지 결정
4. **세션 재개 및 되돌리기**: 원하는 경우 빈 프롬프트로 세션을 재개하고 `rewind_files()`를 호출하여 원본 파일 복원

### 3. 예제 실행

유틸리티 파일과 같은 디렉토리에서 스크립트를 실행하세요.

::: tip
스크립트를 실행하기 전에 IDE나 에디터에서 유틸리티 파일(`utils.py` 또는 `utils.ts`)을 열어두세요. 에이전트가 문서 주석을 추가할 때 파일이 실시간으로 업데이트되는 것을 볼 수 있고, 되돌리기를 선택하면 원본으로 되돌아가는 것도 확인할 수 있습니다.
:::

**Python:**
```bash
python try_checkpointing.py
```

**TypeScript:**
```bash
npx tsx try_checkpointing.ts
```

에이전트가 문서 주석을 추가하고, 되돌릴지 여부를 묻는 프롬프트가 표시됩니다. 예를 선택하면 파일이 원래 상태로 복원됩니다.

## 제한 사항

파일 체크포인팅에는 다음과 같은 제한 사항이 있습니다:

| 제한 사항                              | 설명                                                              |
| -------------------------------------- | ----------------------------------------------------------------- |
| Write/Edit/NotebookEdit 도구만 해당    | Bash 명령을 통한 변경은 추적되지 않음                             |
| 동일 세션                              | 체크포인트는 생성된 세션에 연결됨                                 |
| 파일 내용만 해당                       | 디렉토리 생성, 이동, 삭제는 되돌리기로 취소되지 않음             |
| 로컬 파일                              | 원격 또는 네트워크 파일은 추적되지 않음                          |

## 문제 해결

### 체크포인팅 옵션이 인식되지 않음

`enableFileCheckpointing` 또는 `rewindFiles()`를 사용할 수 없는 경우, 이전 버전의 SDK를 사용 중일 수 있습니다.

**해결 방법**: 최신 SDK 버전으로 업데이트하세요:

* **Python**: `pip install --upgrade claude-agent-sdk`
* **TypeScript**: `npm install @anthropic-ai/claude-agent-sdk@latest`

### 사용자 메시지에 UUID가 없음

`message.uuid`가 `undefined`이거나 없는 경우, checkpoint UUID를 받지 못하고 있는 것입니다.

**원인**: `replay-user-messages` 옵션이 설정되지 않았습니다.

**해결 방법**: 옵션에 `extra_args={"replay-user-messages": None}` (Python) 또는 `extraArgs: { 'replay-user-messages': null }` (TypeScript)를 추가하세요.

### "No file checkpoint found for message" 오류

이 오류는 지정된 사용자 메시지 UUID에 대한 체크포인트 데이터가 존재하지 않을 때 발생합니다.

**일반적인 원인**:

* 원본 세션에서 파일 체크포인팅이 활성화되지 않았음 (`enable_file_checkpointing` 또는 `enableFileCheckpointing`이 `true`로 설정되지 않음)
* 세션 재개 및 되돌리기 시도 전에 세션이 올바르게 완료되지 않았음

**해결 방법**: 원본 세션에서 `enable_file_checkpointing=True` (Python) 또는 `enableFileCheckpointing: true` (TypeScript)가 설정되어 있는지 확인한 다음, 예제에 표시된 패턴을 사용하세요: 첫 번째 사용자 메시지 UUID를 캡처하고, 세션을 완전히 완료한 다음, 빈 프롬프트로 재개하고 `rewindFiles()`를 한 번 호출합니다.

### "ProcessTransport is not ready for writing" 오류

이 오류는 응답 반복이 완료된 후 `rewindFiles()` 또는 `rewind_files()`를 호출할 때 발생합니다. 루프가 완료되면 CLI 프로세스와의 연결이 닫힙니다.

**해결 방법**: 빈 프롬프트로 세션을 재개한 다음 새 쿼리에서 되돌리기를 호출하세요:

::: code-group
```python [Python]
# Resume session with empty prompt, then rewind
async with ClaudeSDKClient(
    ClaudeAgentOptions(enable_file_checkpointing=True, resume=session_id)
) as client:
    await client.query("")
    async for message in client.receive_response():
        await client.rewind_files(checkpoint_id)
        break
```

```typescript [TypeScript]
// Resume session with empty prompt, then rewind
const rewindQuery = query({
  prompt: "",
  options: { ...opts, resume: sessionId }
});

for await (const msg of rewindQuery) {
  await rewindQuery.rewindFiles(checkpointId);
  break;
}
```
:::

## 다음 단계

* **[세션](/agent-sdk/sessions)**: 스트림이 완료된 후 되돌리기에 필요한 세션 재개 방법을 알아보세요. session ID, 대화 재개, 세션 포크 등을 다룹니다.
* **[권한](/agent-sdk/permissions)**: Claude가 사용할 수 있는 도구와 파일 수정 승인 방법을 설정하세요. 편집 시점을 더 세밀하게 제어하고 싶을 때 유용합니다.
* **[TypeScript SDK 레퍼런스](/agent-sdk/typescript)**: `query()`의 모든 옵션과 `rewindFiles()` 메서드를 포함한 완전한 API 레퍼런스.
* **[Python SDK 레퍼런스](/agent-sdk/python)**: `ClaudeAgentOptions`의 모든 옵션과 `rewind_files()` 메서드를 포함한 완전한 API 레퍼런스.
