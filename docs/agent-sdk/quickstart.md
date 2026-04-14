---
title: 빠른 시작
description: Python 또는 TypeScript Agent SDK로 자율적으로 동작하는 AI 에이전트를 만들어 보세요.
---

# 빠른 시작

> Python 또는 TypeScript Agent SDK를 사용해 자율적으로 동작하는 AI 에이전트를 만들어 보세요.

Agent SDK를 활용하면 코드를 읽고, 버그를 찾아내고, 수동 개입 없이 스스로 수정하는 AI 에이전트를 구축할 수 있습니다.

**이 가이드에서 할 일:**

1. Agent SDK로 프로젝트 설정하기
2. 버그가 있는 파일 만들기
3. 버그를 자동으로 찾아 수정하는 에이전트 실행하기

## 사전 조건

* **Node.js 18+** 또는 **Python 3.10+**
* **Anthropic 계정** ([여기서 가입](https://platform.claude.com/))

## 설정

### 1단계: 프로젝트 폴더 만들기

이 빠른 시작을 위한 새 디렉터리를 만듭니다:

```bash
mkdir my-agent && cd my-agent
```

직접 만드는 프로젝트에서는 어떤 폴더에서든 SDK를 실행할 수 있으며, 기본적으로 해당 디렉터리와 하위 디렉터리의 파일에 접근할 수 있습니다.

### 2단계: SDK 설치하기

사용하는 언어에 맞는 Agent SDK 패키지를 설치합니다:

::: code-group

```bash [TypeScript]
npm install @anthropic-ai/claude-agent-sdk
```

```bash [Python (uv)]
uv init && uv add claude-agent-sdk
```

```bash [Python (pip)]
python3 -m venv .venv && source .venv/bin/activate
pip3 install claude-agent-sdk
```

:::

[uv Python 패키지 관리자](https://docs.astral.sh/uv/)는 가상 환경을 자동으로 처리하는 빠른 Python 패키지 관리자입니다. (Python (uv) 탭 해당)

### 3단계: API 키 설정하기

[Claude Console](https://platform.claude.com/)에서 API 키를 발급받은 후, 프로젝트 디렉터리에 `.env` 파일을 만들고 다음 내용을 입력합니다:

```bash
ANTHROPIC_API_KEY=your-api-key
```

SDK는 서드파티 API 공급자를 통한 인증도 지원합니다:

* **Amazon Bedrock**: `CLAUDE_CODE_USE_BEDROCK=1` 환경 변수를 설정하고 AWS 자격 증명을 구성합니다.
* **Google Vertex AI**: `CLAUDE_CODE_USE_VERTEX=1` 환경 변수를 설정하고 Google Cloud 자격 증명을 구성합니다.
* **Microsoft Azure**: `CLAUDE_CODE_USE_FOUNDRY=1` 환경 변수를 설정하고 Azure 자격 증명을 구성합니다.

자세한 내용은 [Bedrock](/amazon-bedrock), [Vertex AI](/google-vertex-ai), [Azure AI Foundry](/microsoft-foundry) 설정 가이드를 참고하세요.

::: info
별도의 사전 승인이 없는 한, Anthropic은 서드파티 개발자가 Claude Agent SDK로 만든 에이전트를 포함한 제품에 claude.ai 로그인이나 요금 제한을 제공하는 것을 허용하지 않습니다. 이 문서에서 설명하는 API 키 인증 방식을 사용해 주세요.
:::

## 버그 파일 만들기

이 가이드에서는 코드의 버그를 찾아 수정하는 에이전트를 만듭니다. 먼저 에이전트가 수정할 의도적인 버그가 담긴 파일이 필요합니다. `my-agent` 디렉터리에 `utils.py`를 만들고 아래 코드를 붙여넣으세요:

```python
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)


def get_user_name(user):
    return user["name"].upper()
```

이 코드에는 두 가지 버그가 있습니다:

1. `calculate_average([])`를 호출하면 0으로 나누기 오류가 발생합니다.
2. `get_user_name(None)`을 호출하면 TypeError가 발생합니다.

## 버그를 찾아 수정하는 에이전트 만들기

Python SDK를 사용한다면 `agent.py`를, TypeScript를 사용한다면 `agent.ts`를 만드세요:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage


async def main():
    # 에이전트 루프: Claude가 작업하는 동안 메시지를 스트리밍합니다
    async for message in query(
        prompt="Review utils.py for bugs that would cause crashes. Fix any issues you find.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Edit", "Glob"],  # Claude가 사용할 수 있는 도구
            permission_mode="acceptEdits",  # 파일 편집 자동 승인
        ),
    ):
        # 사람이 읽기 쉬운 출력 형식으로 출력
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    print(block.text)  # Claude의 추론 과정
                elif hasattr(block, "name"):
                    print(f"Tool: {block.name}")  # 호출 중인 도구
        elif isinstance(message, ResultMessage):
            print(f"Done: {message.subtype}")  # 최종 결과


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// 에이전트 루프: Claude가 작업하는 동안 메시지를 스트리밍합니다
for await (const message of query({
  prompt: "Review utils.py for bugs that would cause crashes. Fix any issues you find.",
  options: {
    allowedTools: ["Read", "Edit", "Glob"], // Claude가 사용할 수 있는 도구
    permissionMode: "acceptEdits" // 파일 편집 자동 승인
  }
})) {
  // 사람이 읽기 쉬운 출력 형식으로 출력
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if ("text" in block) {
        console.log(block.text); // Claude의 추론 과정
      } else if ("name" in block) {
        console.log(`Tool: ${block.name}`); // 호출 중인 도구
      }
    }
  } else if (message.type === "result") {
    console.log(`Done: ${message.subtype}`); // 최종 결과
  }
}
```

:::

이 코드는 세 가지 핵심 요소로 구성됩니다:

1. **`query`**: 에이전트 루프를 생성하는 메인 진입점입니다. 비동기 이터레이터를 반환하므로 `async for`를 사용해 Claude가 작업하는 동안 메시지를 스트리밍할 수 있습니다. 전체 API는 [Python](/agent-sdk/python#query) 또는 [TypeScript](/agent-sdk/typescript#query) SDK 레퍼런스를 참고하세요.

2. **`prompt`**: Claude에게 수행할 작업을 지시합니다. Claude는 작업에 따라 적합한 도구를 스스로 선택합니다.

3. **`options`**: 에이전트 설정입니다. 이 예제에서는 `allowedTools`로 `Read`, `Edit`, `Glob`을 사전 승인하고, `permissionMode: "acceptEdits"`로 파일 변경을 자동 승인합니다. `systemPrompt`, `mcpServers` 등 다른 옵션도 있습니다. [Python](/agent-sdk/python#claude-agent-options) 또는 [TypeScript](/agent-sdk/typescript#options)에서 모든 옵션을 확인하세요.

`async for` 루프는 Claude가 생각하고, 도구를 호출하고, 결과를 확인하며, 다음 행동을 결정하는 동안 계속 실행됩니다. 매 반복마다 메시지가 하나씩 전달됩니다: Claude의 추론, 도구 호출, 도구 결과, 또는 최종 결과입니다. SDK가 오케스트레이션(도구 실행, 컨텍스트 관리, 재시도)을 처리하므로, 사용자는 스트림만 소비하면 됩니다. 루프는 Claude가 작업을 완료하거나 오류가 발생하면 종료됩니다.

루프 내부의 메시지 처리는 사람이 읽기 쉬운 출력만 필터링합니다. 필터링 없이 실행하면 시스템 초기화 및 내부 상태를 포함한 원시 메시지 객체가 모두 출력되는데, 이는 디버깅에는 유용하지만 일반적으로는 잡음이 많습니다.

::: info
이 예제는 스트리밍을 사용하여 진행 상황을 실시간으로 보여줍니다. 실시간 출력이 필요 없는 경우(예: 백그라운드 작업이나 CI 파이프라인), 모든 메시지를 한 번에 수집할 수 있습니다. 자세한 내용은 [스트리밍 vs. 단일 턴 모드](/agent-sdk/streaming-vs-single-mode)를 참고하세요.
:::

### 에이전트 실행하기

에이전트 준비가 끝났습니다. 다음 명령으로 실행하세요:

::: code-group

```bash [Python]
python3 agent.py
```

```bash [TypeScript]
npx tsx agent.ts
```

:::

실행 후 `utils.py`를 확인해 보세요. 빈 리스트와 null 사용자를 처리하는 방어 코드가 추가되어 있을 것입니다. 에이전트가 자율적으로 수행한 작업은 다음과 같습니다:

1. **Read** `utils.py`를 읽어 코드를 파악했습니다.
2. **Analyzed** 로직을 분석하고 크래시를 유발할 엣지 케이스를 식별했습니다.
3. **Edited** 파일을 편집해 적절한 오류 처리를 추가했습니다.

이것이 Agent SDK의 차별점입니다: Claude가 사용자에게 구현을 요청하는 대신 도구를 직접 실행합니다.

::: info
"API key not found" 메시지가 표시되면, `.env` 파일이나 셸 환경에 `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있는지 확인하세요. 더 많은 도움말은 [전체 문제 해결 가이드](/troubleshooting)를 참고하세요.
:::

### 다른 프롬프트 시도해 보기

에이전트 설정이 완료되었으니 다양한 프롬프트를 시험해 보세요:

* `"Add docstrings to all functions in utils.py"`
* `"Add type hints to all functions in utils.py"`
* `"Create a README.md documenting the functions in utils.py"`

### 에이전트 커스터마이징

옵션을 변경해 에이전트 동작을 조정할 수 있습니다. 몇 가지 예시를 소개합니다:

**웹 검색 기능 추가:**

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit", "Glob", "WebSearch"], permission_mode="acceptEdits"
)
```

```typescript [TypeScript]
const options = {
  allowedTools: ["Read", "Edit", "Glob", "WebSearch"],
  permissionMode: "acceptEdits"
};
```

:::

**Claude에게 커스텀 시스템 프롬프트 제공:**

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit", "Glob"],
    permission_mode="acceptEdits",
    system_prompt="You are a senior Python developer. Always follow PEP 8 style guidelines.",
)
```

```typescript [TypeScript]
const options = {
  allowedTools: ["Read", "Edit", "Glob"],
  permissionMode: "acceptEdits",
  systemPrompt: "You are a senior Python developer. Always follow PEP 8 style guidelines."
};
```

:::

**터미널에서 명령어 실행:**

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit", "Glob", "Bash"], permission_mode="acceptEdits"
)
```

```typescript [TypeScript]
const options = {
  allowedTools: ["Read", "Edit", "Glob", "Bash"],
  permissionMode: "acceptEdits"
};
```

:::

`Bash`가 활성화되면 이런 프롬프트를 시도해 보세요: `"Write unit tests for utils.py, run them, and fix any failures"`

## 핵심 개념

**도구(Tools)**는 에이전트가 할 수 있는 작업을 제어합니다:

| 도구                                   | 에이전트가 할 수 있는 작업 |
| -------------------------------------- | -------------------------- |
| `Read`, `Glob`, `Grep`                 | 읽기 전용 분석             |
| `Read`, `Edit`, `Glob`                 | 코드 분석 및 수정          |
| `Read`, `Edit`, `Bash`, `Glob`, `Grep` | 완전 자동화                |

**권한 모드(Permission modes)**는 사람의 감독 수준을 제어합니다:

| 모드                     | 동작                                                                         | 사용 사례                              |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------- |
| `acceptEdits`            | 파일 편집 및 일반적인 파일 시스템 명령을 자동 승인하고, 그 외 작업은 질문함  | 신뢰할 수 있는 개발 워크플로우         |
| `dontAsk`                | `allowedTools`에 없는 모든 것을 거부함                                       | 잠긴 헤드리스 에이전트                 |
| `auto` (TypeScript 전용) | 모델 분류기가 각 도구 호출을 승인하거나 거부함                               | 안전 장치가 있는 자율 에이전트         |
| `bypassPermissions`      | 프롬프트 없이 모든 도구를 실행함                                             | 샌드박스 CI, 완전히 신뢰된 환경        |
| `default`                | 승인을 처리하는 `canUseTool` 콜백이 필요함                                   | 커스텀 승인 흐름                       |

위 예제는 `acceptEdits` 모드를 사용하며, 파일 작업을 자동 승인하여 에이전트가 대화형 프롬프트 없이 실행될 수 있습니다. 사용자에게 승인을 요청하고 싶다면 `default` 모드를 사용하고 사용자 입력을 수집하는 [`canUseTool` 콜백](/agent-sdk/user-input)을 제공하세요. 더 많은 제어 옵션은 [권한](/agent-sdk/permissions)을 참고하세요.

## 다음 단계

첫 번째 에이전트를 만들었으니, 이제 기능을 확장하고 사용 사례에 맞게 조정하는 방법을 알아보세요:

* **[권한](/agent-sdk/permissions)**: 에이전트가 할 수 있는 작업과 승인이 필요한 시점을 제어합니다.
* **[훅](/agent-sdk/hooks)**: 도구 호출 전후에 커스텀 코드를 실행합니다.
* **[세션](/agent-sdk/sessions)**: 컨텍스트를 유지하는 멀티턴 에이전트를 만듭니다.
* **[MCP 서버](/agent-sdk/mcp)**: 데이터베이스, 브라우저, API 등 외부 시스템에 연결합니다.
* **[호스팅](/agent-sdk/hosting)**: Docker, 클라우드, CI/CD에 에이전트를 배포합니다.
* **[예제 에이전트](https://github.com/anthropics/claude-agent-sdk-demos)**: 이메일 어시스턴트, 리서치 에이전트 등 완전한 예제를 확인하세요.
