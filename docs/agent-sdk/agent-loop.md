---
title: 에이전트 루프 동작 방식
description: SDK 에이전트를 구동하는 메시지 생명주기, 도구 실행, 컨텍스트 창, 아키텍처를 이해합니다.
---

# 에이전트 루프 동작 방식

> SDK 에이전트를 구동하는 메시지 생명주기, 도구 실행, 컨텍스트 창, 아키텍처를 이해합니다.

Agent SDK를 사용하면 Claude Code의 자율 에이전트 루프를 여러분의 애플리케이션에 직접 내장할 수 있습니다. SDK는 독립형 패키지로, 도구, 권한, 비용 한도, 출력을 프로그래밍 방식으로 제어할 수 있게 해줍니다. Claude Code CLI가 설치되어 있지 않아도 사용할 수 있습니다.

에이전트를 시작하면 SDK는 [Claude Code를 구동하는 것과 동일한 실행 루프](/how-claude-code-works#the-agentic-loop)를 실행합니다. Claude가 프롬프트를 평가하고, 도구를 호출해 작업을 수행하고, 결과를 받아 처리하는 과정을 작업이 완료될 때까지 반복합니다. 이 페이지에서는 루프 내부에서 일어나는 일을 설명하여, 에이전트를 효과적으로 구축하고 디버깅하고 최적화할 수 있도록 안내합니다.

## 루프 한눈에 보기

모든 에이전트 세션은 동일한 사이클을 따릅니다:

<img src="https://mintcdn.com/claude-code/gvy2DIUELtNA8qD3/images/agent-loop-diagram.svg?fit=max&auto=format&n=gvy2DIUELtNA8qD3&q=85&s=192e1bd6c8a2950a16e5ee0b94e27e26" alt="에이전트 루프: 프롬프트 입력, Claude 평가, 도구 호출 또는 최종 응답으로 분기" width="680" height="150" data-path="images/agent-loop-diagram.svg" />

1. **프롬프트 수신.** Claude는 시스템 프롬프트, 도구 정의, 대화 기록과 함께 프롬프트를 받습니다. SDK는 세션 메타데이터가 담긴 subtype `"init"`의 [`SystemMessage`](#메시지-타입)를 yield합니다.
2. **평가 및 응답.** Claude는 현재 상태를 평가하고 어떻게 진행할지 결정합니다. 텍스트로 응답하거나, 하나 이상의 도구 호출을 요청하거나, 둘 다 할 수 있습니다. SDK는 텍스트와 도구 호출 요청이 담긴 [`AssistantMessage`](#메시지-타입)를 yield합니다.
3. **도구 실행.** SDK는 요청된 각 도구를 실행하고 결과를 수집합니다. 각 도구 결과는 다음 결정을 위해 Claude에게 다시 전달됩니다. [hooks](/agent-sdk/hooks)를 사용하면 도구 호출을 실행 전에 가로채거나, 수정하거나, 차단할 수 있습니다.
4. **반복.** 2단계와 3단계가 사이클로 반복됩니다. 각 전체 사이클이 하나의 턴입니다. Claude는 도구 호출 없이 응답을 생성할 때까지 계속해서 도구를 호출하고 결과를 처리합니다.
5. **결과 반환.** SDK는 텍스트 응답만 담긴 최종 [`AssistantMessage`](#메시지-타입)를 yield하고, 이어서 최종 텍스트, 토큰 사용량, 비용, 세션 ID가 담긴 [`ResultMessage`](#메시지-타입)를 yield합니다.

"여기에 어떤 파일들이 있나요?" 같은 간단한 질문은 `Glob`을 호출하고 결과를 응답하는 1~2턴으로 끝날 수 있습니다. "인증 모듈을 리팩터링하고 테스트를 업데이트해줘" 같은 복잡한 작업은 파일 읽기, 코드 수정, 테스트 실행 등을 거치며 수십 번의 도구 호출을 여러 턴에 걸쳐 체이닝할 수 있으며, Claude는 각 결과를 바탕으로 접근 방식을 조정합니다.

## 턴과 메시지

턴은 루프 내의 한 번의 왕복입니다. Claude가 도구 호출을 포함한 출력을 생성하면, SDK가 해당 도구를 실행하고, 결과가 자동으로 Claude에게 다시 전달됩니다. 이 과정은 여러분의 코드로 제어권을 반환하지 않고 진행됩니다. 턴은 Claude가 도구 호출 없이 출력을 생성할 때까지 계속되며, 그 시점에 루프가 종료되고 최종 결과가 전달됩니다.

"auth.ts의 실패하는 테스트를 수정해줘"라는 프롬프트에 대한 전체 세션이 어떻게 진행되는지 살펴보겠습니다.

먼저, SDK가 프롬프트를 Claude에게 전송하고 세션 메타데이터가 담긴 [`SystemMessage`](#메시지-타입)를 yield합니다. 그런 다음 루프가 시작됩니다:

1. **턴 1:** Claude가 `npm test`를 실행하기 위해 `Bash`를 호출합니다. SDK는 도구 호출이 담긴 [`AssistantMessage`](#메시지-타입)를 yield하고, 명령을 실행한 후 출력(3개 실패)이 담긴 [`UserMessage`](#메시지-타입)를 yield합니다.
2. **턴 2:** Claude가 `auth.ts`와 `auth.test.ts`에 대해 `Read`를 호출합니다. SDK는 파일 내용을 반환하고 `AssistantMessage`를 yield합니다.
3. **턴 3:** Claude가 `auth.ts`를 수정하기 위해 `Edit`를 호출하고, 다시 `npm test`를 실행하기 위해 `Bash`를 호출합니다. 세 테스트가 모두 통과됩니다. SDK는 `AssistantMessage`를 yield합니다.
4. **최종 턴:** Claude가 도구 호출 없이 텍스트만으로 응답합니다: "인증 버그를 수정했으며, 세 테스트 모두 통과합니다." SDK는 이 텍스트가 담긴 최종 `AssistantMessage`를 yield하고, 동일한 텍스트와 비용 및 사용량이 담긴 [`ResultMessage`](#메시지-타입)를 yield합니다.

이것은 4개의 턴이었습니다: 도구 호출이 있는 3개, 텍스트만 있는 최종 응답 1개.

`max_turns` / `maxTurns`로 루프를 제한할 수 있으며, 이는 도구 사용 턴만 계산합니다. 예를 들어 위 루프에서 `max_turns=2`를 설정하면 수정 단계 전에 중단됩니다. `max_budget_usd` / `maxBudgetUsd`를 사용해 지출 임계값 기준으로 턴을 제한할 수도 있습니다.

제한 없이는 Claude가 스스로 완료할 때까지 루프가 실행됩니다. 범위가 명확한 작업에는 괜찮지만, "이 코드베이스를 개선해줘"처럼 열린 프롬프트에서는 오래 걸릴 수 있습니다. 프로덕션 에이전트의 경우 예산 설정이 좋은 기본값입니다. 옵션 참조는 아래 [턴과 예산](#턴과-예산)을 참고하세요.

## 메시지 타입

루프가 실행되면서 SDK는 메시지 스트림을 yield합니다. 각 메시지에는 루프의 어느 단계에서 온 것인지를 알려주는 타입이 있습니다. 5가지 핵심 타입은 다음과 같습니다:

* **`SystemMessage`:** 세션 생명주기 이벤트입니다. `subtype` 필드로 구분됩니다: `"init"`은 첫 번째 메시지(세션 메타데이터)이고, `"compact_boundary"`는 [압축](#자동-압축) 후에 발생합니다. TypeScript에서 compact boundary는 `SDKSystemMessage`의 subtype이 아닌 별도의 [`SDKCompactBoundaryMessage`](/agent-sdk/typescript#sdk-compact-boundary-message) 타입입니다.
* **`AssistantMessage`:** 각 Claude 응답 후에 emit되며, 최종 텍스트 전용 응답도 포함됩니다. 해당 턴의 텍스트 콘텐츠 블록과 도구 호출 블록을 포함합니다.
* **`UserMessage`:** 각 도구 실행 후 Claude에게 다시 전송되는 도구 결과 콘텐츠와 함께 emit됩니다. 루프 중간에 스트리밍하는 사용자 입력에 대해서도 emit됩니다.
* **`StreamEvent`:** 부분 메시지가 활성화된 경우에만 emit됩니다. 원시 API 스트리밍 이벤트(텍스트 델타, 도구 입력 청크)를 포함합니다. [스트림 응답](/agent-sdk/streaming-output)을 참조하세요.
* **`ResultMessage`:** 항상 마지막 메시지입니다. 최종 텍스트 결과, 토큰 사용량, 비용, 세션 ID를 포함합니다. `subtype` 필드로 작업 성공 여부 또는 제한 도달 여부를 확인하세요. [결과 처리](#결과-처리)를 참조하세요.

이 5가지 타입은 두 SDK 모두에서 전체 에이전트 루프 생명주기를 커버합니다. TypeScript SDK는 추가적인 관측 가능성 이벤트(hook 이벤트, 도구 진행 상황, 속도 제한, 작업 알림)도 yield하여 추가적인 세부 정보를 제공하지만, 루프를 구동하는 데 필수적이지는 않습니다. 전체 목록은 [Python 메시지 타입 참조](/agent-sdk/python#message-types)와 [TypeScript 메시지 타입 참조](/agent-sdk/typescript#message-types)를 참조하세요.

### 메시지 처리

어떤 메시지를 처리할지는 무엇을 만드느냐에 따라 다릅니다:

* **최종 결과만 필요한 경우:** `ResultMessage`를 처리하여 출력, 비용, 작업 성공 여부를 확인합니다.
* **진행 상황 업데이트:** `AssistantMessage`를 처리하여 각 턴에서 Claude가 무엇을 하는지, 어떤 도구를 호출했는지 확인합니다.
* **실시간 스트리밍:** 부분 메시지를 활성화하면(`include_partial_messages` in Python, `includePartialMessages` in TypeScript) 실시간으로 `StreamEvent` 메시지를 받을 수 있습니다. [실시간 응답 스트리밍](/agent-sdk/streaming-output)을 참조하세요.

메시지 타입을 확인하는 방법은 SDK마다 다릅니다:

* **Python:** `claude_agent_sdk`에서 임포트한 클래스에 대해 `isinstance()`로 타입을 확인합니다 (예: `isinstance(message, ResultMessage)`).
* **TypeScript:** `type` 문자열 필드를 확인합니다 (예: `message.type === "result"`). `AssistantMessage`와 `UserMessage`는 원시 API 메시지를 `.message` 필드에 래핑하므로, 콘텐츠 블록은 `message.content`가 아닌 `message.message.content`에 있습니다.

::: details 예시: 메시지 타입 확인 및 결과 처리

::: code-group

```python [Python]
from claude_agent_sdk import query, AssistantMessage, ResultMessage

async for message in query(prompt="Summarize this project"):
    if isinstance(message, AssistantMessage):
        print(f"Turn completed: {len(message.content)} content blocks")
    if isinstance(message, ResultMessage):
        if message.subtype == "success":
            print(message.result)
        else:
            print(f"Stopped: {message.subtype}")
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({ prompt: "Summarize this project" })) {
  if (message.type === "assistant") {
    console.log(`Turn completed: ${message.message.content.length} content blocks`);
  }
  if (message.type === "result") {
    if (message.subtype === "success") {
      console.log(message.result);
    } else {
      console.log(`Stopped: ${message.subtype}`);
    }
  }
}
```

:::

## 도구 실행

도구는 에이전트가 실제로 작업을 수행할 수 있게 해줍니다. 도구 없이는 Claude가 텍스트만 응답할 수 있습니다. 도구를 사용하면 Claude는 파일을 읽고, 명령을 실행하고, 코드를 검색하고, 외부 서비스와 상호작용할 수 있습니다.

### 내장 도구

SDK에는 Claude Code를 구동하는 것과 동일한 도구들이 포함되어 있습니다:

| 카테고리           | 도구                                             | 기능                                                                    |
| :----------------- | :----------------------------------------------- | :---------------------------------------------------------------------- |
| **파일 작업**      | `Read`, `Edit`, `Write`                          | 파일 읽기, 수정, 생성                                                   |
| **검색**           | `Glob`, `Grep`                                   | 패턴으로 파일 찾기, 정규식으로 콘텐츠 검색                              |
| **실행**           | `Bash`                                           | 셸 명령, 스크립트, git 작업 실행                                        |
| **웹**             | `WebSearch`, `WebFetch`                          | 웹 검색, 페이지 가져오기 및 파싱                                        |
| **탐색**           | `ToolSearch`                                     | 모든 도구를 미리 로드하지 않고 필요할 때 동적으로 도구를 찾아 로드      |
| **오케스트레이션** | `Agent`, `Skill`, `AskUserQuestion`, `TodoWrite` | 서브에이전트 생성, 스킬 호출, 사용자에게 질문, 작업 추적               |

내장 도구 외에도 다음을 사용할 수 있습니다:

* [MCP 서버](/agent-sdk/mcp)로 **외부 서비스 연결** (데이터베이스, 브라우저, API)
* [커스텀 도구 핸들러](/agent-sdk/custom-tools)로 **커스텀 도구 정의**
* [설정 소스](/agent-sdk/claude-code-features)를 통해 **프로젝트 스킬 로드** (재사용 가능한 워크플로우)

### 도구 권한

Claude는 작업에 따라 어떤 도구를 호출할지 결정하지만, 해당 호출이 실제로 실행되도록 허용할지는 여러분이 제어합니다. 특정 도구를 자동 승인하거나, 다른 도구를 완전히 차단하거나, 모든 것에 대해 승인을 요구할 수 있습니다. 세 가지 옵션이 함께 작동하여 무엇이 실행되는지 결정합니다:

* **`allowed_tools` / `allowedTools`**: 나열된 도구를 자동 승인합니다. 허용 도구 목록에 `["Read", "Glob", "Grep"]`이 있는 읽기 전용 에이전트는 프롬프트 없이 해당 도구를 실행합니다. 목록에 없는 도구는 여전히 사용 가능하지만 권한이 필요합니다.
* **`disallowed_tools` / `disallowedTools`**: 다른 설정에 관계없이 나열된 도구를 차단합니다. 도구가 실행되기 전에 규칙이 확인되는 순서는 [권한](/agent-sdk/permissions)을 참조하세요.
* **`permission_mode` / `permissionMode`**: 허용 또는 거부 규칙에 해당하지 않는 도구에 대해 어떻게 처리할지 제어합니다. 사용 가능한 모드는 [권한 모드](#권한-모드)를 참조하세요.

`"Bash(npm:*)"` 같은 규칙으로 개별 도구의 범위를 설정하여 특정 명령만 허용할 수도 있습니다. 전체 규칙 문법은 [권한](/agent-sdk/permissions)을 참조하세요.

도구가 거부되면 Claude는 도구 결과로 거부 메시지를 받으며, 일반적으로 다른 방법을 시도하거나 진행할 수 없다고 보고합니다.

### 병렬 도구 실행

Claude가 단일 턴에서 여러 도구 호출을 요청하면, 두 SDK 모두 도구에 따라 동시에 또는 순차적으로 실행할 수 있습니다. 읽기 전용 도구(`Read`, `Glob`, `Grep`, 읽기 전용으로 표시된 MCP 도구)는 동시에 실행할 수 있습니다. 상태를 수정하는 도구(`Edit`, `Write`, `Bash`)는 충돌을 피하기 위해 순차적으로 실행됩니다.

커스텀 도구는 기본적으로 순차적으로 실행됩니다. 커스텀 도구에 대해 병렬 실행을 활성화하려면, 어노테이션에서 읽기 전용으로 표시하세요: [TypeScript](/agent-sdk/typescript#tool)의 `readOnly` 또는 [Python](/agent-sdk/python#tool)의 `readOnlyHint`.

## 루프 실행 제어

루프가 실행되는 턴 수, 비용, Claude의 추론 깊이, 도구 실행 전 승인 필요 여부를 제한할 수 있습니다. 이 모든 것은 [`ClaudeAgentOptions`](/agent-sdk/python#claude-agent-options) (Python) / [`Options`](/agent-sdk/typescript#options) (TypeScript)의 필드입니다.

### 턴과 예산

| 옵션                                           | 제어 대상                  | 기본값   |
| :--------------------------------------------- | :------------------------- | :------- |
| 최대 턴 수 (`max_turns` / `maxTurns`)          | 최대 도구 사용 왕복 횟수   | 제한 없음 |
| 최대 예산 (`max_budget_usd` / `maxBudgetUsd`)  | 중지 전 최대 비용          | 제한 없음 |

어느 한도에 도달하면 SDK는 해당 오류 subtype(`error_max_turns` 또는 `error_max_budget_usd`)이 있는 `ResultMessage`를 반환합니다. 이러한 subtype을 확인하는 방법은 [결과 처리](#결과-처리)를, 문법은 [`ClaudeAgentOptions`](/agent-sdk/python#claude-agent-options) / [`Options`](/agent-sdk/typescript#options)를 참조하세요.

### 추론 노력 수준

`effort` 옵션은 Claude가 얼마나 많은 추론을 적용할지 제어합니다. 낮은 노력 수준은 턴당 더 적은 토큰을 사용하고 비용을 줄입니다. 모든 모델이 effort 파라미터를 지원하는 것은 아닙니다. 지원 모델은 [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)를 참조하세요.

| 수준       | 동작                            | 적합한 경우                             |
| :--------- | :------------------------------ | :-------------------------------------- |
| `"low"`    | 최소 추론, 빠른 응답             | 파일 조회, 디렉토리 목록                |
| `"medium"` | 균형 잡힌 추론                  | 일반 편집, 표준 작업                    |
| `"high"`   | 철저한 분석                     | 리팩터링, 디버깅                        |
| `"max"`    | 최대 추론 깊이                  | 깊은 분석이 필요한 다단계 문제          |

`effort`를 설정하지 않으면 Python SDK는 파라미터를 설정하지 않고 모델의 기본 동작에 맡깁니다. TypeScript SDK는 기본값이 `"high"`입니다.

::: info
`effort`는 각 응답 내의 추론 깊이에 대해 지연 시간과 토큰 비용을 트레이드오프합니다. [Extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)은 출력에 가시적인 사고 체인 블록을 생성하는 별도 기능입니다. 두 기능은 독립적입니다: extended thinking을 활성화하면서 `effort: "low"`를 설정하거나, extended thinking 없이 `effort: "max"`를 설정할 수 있습니다.
:::

파일 목록이나 단일 grep 실행과 같이 간단하고 범위가 명확한 작업을 수행하는 에이전트에는 낮은 effort를 사용하여 비용과 지연 시간을 줄이세요. `effort`는 서브에이전트별이 아닌 최상위 `query()` 옵션에서 설정됩니다.

### 권한 모드

권한 모드 옵션(`permission_mode` in Python, `permissionMode` in TypeScript)은 에이전트가 도구를 사용하기 전에 승인을 요청할지 여부를 제어합니다:

| 모드                       | 동작                                                                                                                                     |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `"default"`                | 허용 규칙에 해당하지 않는 도구는 승인 콜백을 트리거합니다; 콜백이 없으면 거부됩니다                                                      |
| `"acceptEdits"`            | 파일 편집과 일반적인 파일시스템 명령(`mkdir`, `touch`, `mv`, `cp` 등)을 자동 승인합니다; 다른 Bash 명령은 기본 규칙을 따릅니다           |
| `"plan"`                   | 도구를 실행하지 않습니다; Claude가 검토를 위한 계획을 생성합니다                                                                         |
| `"dontAsk"`                | 프롬프트를 표시하지 않습니다. [권한 규칙](/settings#permission-settings)으로 미리 승인된 도구는 실행되고, 그 외는 모두 거부됩니다         |
| `"auto"` (TypeScript 전용) | 모델 분류기를 사용하여 각 도구 호출을 승인하거나 거부합니다. 가용성과 동작은 [자동 모드](/permission-modes#eliminate-prompts-with-auto-mode)를 참조하세요 |
| `"bypassPermissions"`      | 허용된 모든 도구를 확인 없이 실행합니다. Unix에서 root로 실행 중일 때는 사용할 수 없습니다. 에이전트의 작업이 중요한 시스템에 영향을 미칠 수 없는 격리된 환경에서만 사용하세요 |

인터랙티브 애플리케이션에는 도구 승인 콜백과 함께 `"default"`를 사용하여 승인 프롬프트를 표시하세요. 개발 머신의 자율 에이전트에는 `"acceptEdits"`를 사용하면 파일 편집과 일반 파일시스템 명령(`mkdir`, `touch`, `mv`, `cp` 등)을 자동 승인하면서 다른 `Bash` 명령은 허용 규칙 뒤에서 게이팅합니다. `"bypassPermissions"`는 CI, 컨테이너 또는 기타 격리된 환경용으로 예약하세요. 자세한 내용은 [권한](/agent-sdk/permissions)을 참조하세요.

### 모델

`model`을 설정하지 않으면 SDK는 인증 방법과 구독에 따라 달라지는 Claude Code의 기본값을 사용합니다. 특정 모델을 고정하거나 더 빠르고 저렴한 에이전트를 위해 더 작은 모델을 사용하려면 명시적으로 설정하세요 (예: `model="claude-sonnet-4-6"`). 사용 가능한 ID는 [모델](https://platform.claude.com/docs/en/about-claude/models)을 참조하세요.

## 컨텍스트 창

컨텍스트 창은 세션 동안 Claude가 사용할 수 있는 총 정보량입니다. 세션 내 턴 간에 리셋되지 않습니다. 시스템 프롬프트, 도구 정의, 대화 기록, 도구 입력, 도구 출력 등 모든 것이 누적됩니다. 턴 간에 동일하게 유지되는 콘텐츠(시스템 프롬프트, 도구 정의, CLAUDE.md)는 자동으로 [프롬프트 캐시](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)되어 반복되는 접두사에 대한 비용과 지연 시간을 줄입니다.

### 컨텍스트 소비 요소

SDK에서 각 구성 요소가 컨텍스트에 미치는 영향은 다음과 같습니다:

| 소스                   | 로드 시점                                                                            | 영향                                                                                                                           |
| :--------------------- | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **시스템 프롬프트**    | 모든 요청                                                                            | 작은 고정 비용, 항상 존재                                                                                                      |
| **CLAUDE.md 파일**     | 세션 시작, [`settingSources`](/agent-sdk/claude-code-features) 활성화 시             | 모든 요청에 전체 콘텐츠 포함 (단, 프롬프트 캐시되므로 첫 번째 요청만 전체 비용 지불)                                          |
| **도구 정의**          | 모든 요청                                                                            | 각 도구가 스키마를 추가합니다; 한꺼번에 로드하는 대신 [MCP 도구 검색](/agent-sdk/mcp#mcp-tool-search)으로 필요 시 로드하세요   |
| **대화 기록**          | 턴에 걸쳐 누적                                                                       | 각 턴마다 증가: 프롬프트, 응답, 도구 입력, 도구 출력                                                                          |
| **스킬 설명**          | 세션 시작 (설정 소스 활성화 시)                                                      | 짧은 요약; 전체 콘텐츠는 호출될 때만 로드됨                                                                                   |

큰 도구 출력은 상당한 컨텍스트를 소비합니다. 큰 파일을 읽거나 상세한 출력이 있는 명령을 실행하면 단일 턴에서 수천 개의 토큰을 사용할 수 있습니다. 컨텍스트는 턴에 걸쳐 누적되므로, 많은 도구 호출을 포함한 긴 세션은 짧은 세션보다 훨씬 더 많은 컨텍스트를 쌓습니다.

### 자동 압축

컨텍스트 창이 한계에 가까워지면 SDK는 자동으로 대화를 압축합니다: 공간을 확보하기 위해 오래된 기록을 요약하면서 가장 최근의 교환과 주요 결정은 유지합니다. SDK는 이 작업이 발생할 때 스트림에서 `type: "system"` 및 `subtype: "compact_boundary"` 메시지를 emit합니다 (Python에서는 `SystemMessage`, TypeScript에서는 별도의 `SDKCompactBoundaryMessage` 타입).

압축은 오래된 메시지를 요약으로 대체하므로, 대화 초반의 특정 지침이 보존되지 않을 수 있습니다. 영구적인 규칙은 초기 프롬프트보다 CLAUDE.md에 넣는 것이 좋습니다([`settingSources`](/agent-sdk/claude-code-features)를 통해 로드). CLAUDE.md 콘텐츠는 모든 요청에서 다시 삽입되기 때문입니다.

압축 동작을 여러 방법으로 커스터마이징할 수 있습니다:

* **CLAUDE.md의 요약 지침:** 압축기는 다른 컨텍스트처럼 CLAUDE.md를 읽으므로, 요약 시 보존할 내용을 지시하는 섹션을 포함할 수 있습니다. 섹션 헤더는 자유 형식입니다(특별한 문자열이 아님); 압축기는 의도에 맞게 매칭합니다.
* **`PreCompact` hook:** 압축이 발생하기 전에 커스텀 로직을 실행합니다 (예: 전체 대화록 아카이브). Hook은 `trigger` 필드(`manual` 또는 `auto`)를 받습니다. [hooks](/agent-sdk/hooks)를 참조하세요.
* **수동 압축:** 온디맨드 압축을 트리거하려면 프롬프트 문자열로 `/compact`를 전송하세요. (이 방법으로 전송된 슬래시 명령은 SDK 입력이며, CLI 전용 단축키가 아닙니다. [SDK의 슬래시 명령](/agent-sdk/slash-commands)을 참조하세요.)

::: details 예시: CLAUDE.md의 요약 지침

프로젝트의 CLAUDE.md에 압축기가 보존할 내용을 알려주는 섹션을 추가하세요. 헤더 이름은 특별하지 않으며; 명확한 레이블이면 무엇이든 사용하세요.

```markdown
# Summary instructions

When summarizing this conversation, always preserve:
- The current task objective and acceptance criteria
- File paths that have been read or modified
- Test results and error messages
- Decisions made and the reasoning behind them
```

:::

### 컨텍스트 효율적으로 유지하기

장기 실행 에이전트를 위한 몇 가지 전략:

* **서브태스크에 서브에이전트 사용.** 각 서브에이전트는 새로운 대화로 시작합니다(이전 메시지 기록 없이, 단 자체 시스템 프롬프트와 CLAUDE.md 같은 프로젝트 수준 컨텍스트는 로드됩니다). 서브에이전트는 부모의 턴을 볼 수 없으며, 최종 응답만 도구 결과로 부모에게 반환됩니다. 메인 에이전트의 컨텍스트는 전체 서브태스크 대화록이 아닌 그 요약만큼만 증가합니다. 자세한 내용은 [서브에이전트가 상속하는 것](/agent-sdk/subagents#what-subagents-inherit)을 참조하세요.
* **도구 선택적으로 사용.** 모든 도구 정의는 컨텍스트 공간을 차지합니다. [`AgentDefinition`](/agent-sdk/subagents#agent-definition-configuration)의 `tools` 필드를 사용하여 서브에이전트가 필요한 최소 도구 세트만 갖도록 범위를 제한하고, [MCP 도구 검색](/agent-sdk/mcp#mcp-tool-search)을 사용하여 모든 것을 미리 로드하는 대신 필요 시 도구를 로드하세요.
* **MCP 서버 비용 주의.** 각 MCP 서버는 모든 도구 스키마를 모든 요청에 추가합니다. 많은 도구를 가진 몇 개의 서버는 에이전트가 실제 작업을 시작하기 전에 상당한 컨텍스트를 소비할 수 있습니다. `ToolSearch` 도구는 모든 것을 미리 로드하는 대신 필요 시 도구를 로드하는 데 도움이 될 수 있습니다. 설정은 [MCP 도구 검색](/agent-sdk/mcp#mcp-tool-search)을 참조하세요.
* **일상적인 작업에는 낮은 effort 사용.** 파일을 읽거나 디렉토리를 나열하기만 하면 되는 에이전트에는 [effort](#추론-노력-수준)를 `"low"`로 설정하세요. 이렇게 하면 토큰 사용량과 비용이 줄어듭니다.

기능별 컨텍스트 비용에 대한 자세한 분석은 [컨텍스트 비용 이해](/features-overview#understand-context-costs)를 참조하세요.

## 세션과 연속성

SDK와의 각 상호작용은 세션을 생성하거나 계속합니다. 나중에 재개할 수 있도록 `ResultMessage.session_id`(두 SDK 모두에서 사용 가능)에서 세션 ID를 캡처하세요. TypeScript SDK는 init `SystemMessage`의 직접 필드로도 노출합니다; Python에서는 `SystemMessage.data`에 중첩되어 있습니다.

재개할 때 이전 턴의 전체 컨텍스트가 복원됩니다: 읽은 파일, 수행된 분석, 취해진 작업. 원본을 수정하지 않고 다른 접근 방식으로 분기하기 위해 세션을 포크할 수도 있습니다.

재개, 계속, 포크 패턴에 대한 전체 가이드는 [세션 관리](/agent-sdk/sessions)를 참조하세요.

::: info
Python에서 `ClaudeSDKClient`는 여러 호출에 걸쳐 세션 ID를 자동으로 처리합니다. 자세한 내용은 [Python SDK 참조](/agent-sdk/python#choosing-between-query-and-claude-sdk-client)를 참조하세요.
:::

## 결과 처리

루프가 종료되면 `ResultMessage`가 무슨 일이 일어났는지 알려주고 출력을 제공합니다. `subtype` 필드(두 SDK 모두에서 사용 가능)는 종료 상태를 확인하는 기본 방법입니다.

| 결과 subtype                          | 발생 상황                                                                           | `result` 필드 사용 가능 여부 |
| :------------------------------------ | :---------------------------------------------------------------------------------- | :--------------------------: |
| `success`                             | Claude가 작업을 정상적으로 완료함                                                   |              예              |
| `error_max_turns`                     | 완료 전에 `maxTurns` 한도에 도달함                                                  |             아니오            |
| `error_max_budget_usd`                | 완료 전에 `maxBudgetUsd` 한도에 도달함                                              |             아니오            |
| `error_during_execution`              | 오류로 인해 루프가 중단됨 (예: API 실패 또는 취소된 요청)                           |             아니오            |
| `error_max_structured_output_retries` | 설정된 재시도 한도 후 구조화된 출력 유효성 검사 실패                                |             아니오            |

`result` 필드(최종 텍스트 출력)는 `success` 변형에만 존재하므로, 읽기 전에 항상 subtype을 확인하세요. 모든 결과 subtype은 오류 후에도 비용을 추적하고 재개할 수 있도록 `total_cost_usd`, `usage`, `num_turns`, `session_id`를 제공합니다. Python에서 `total_cost_usd`와 `usage`는 optional로 타입이 지정되어 있으며 일부 오류 경로에서 `None`일 수 있으므로, 포매팅 전에 가드하세요. `usage` 필드 해석에 대한 자세한 내용은 [비용 및 사용량 추적](/agent-sdk/cost-tracking)을 참조하세요.

결과에는 마지막 턴에서 모델이 생성을 멈춘 이유를 나타내는 `stop_reason` 필드(`string | null` in TypeScript, `str | None` in Python)도 포함됩니다. 일반적인 값은 `end_turn`(모델이 정상적으로 완료), `max_tokens`(출력 토큰 한도 도달), `refusal`(모델이 요청 거부)입니다. 오류 결과 subtype에서 `stop_reason`은 루프가 종료되기 전 마지막 어시스턴트 응답의 값을 전달합니다. 거부를 감지하려면 `stop_reason === "refusal"` (TypeScript) 또는 `stop_reason == "refusal"` (Python)을 확인하세요. 전체 타입은 [`SDKResultMessage`](/agent-sdk/typescript#sdk-result-message) (TypeScript) 또는 [`ResultMessage`](/agent-sdk/python#result-message) (Python)를 참조하세요.

## Hooks

[Hooks](/agent-sdk/hooks)는 루프의 특정 지점에서 실행되는 콜백입니다: 도구가 실행되기 전, 반환된 후, 에이전트가 완료되었을 때 등. 자주 사용되는 hook은 다음과 같습니다:

| Hook                             | 실행 시점                        | 일반적인 사용 사례                          |
| :------------------------------- | :------------------------------- | :------------------------------------------ |
| `PreToolUse`                     | 도구 실행 전                     | 입력 유효성 검사, 위험한 명령 차단          |
| `PostToolUse`                    | 도구 반환 후                     | 출력 감사, 사이드 이펙트 트리거             |
| `UserPromptSubmit`               | 프롬프트가 전송될 때             | 프롬프트에 추가 컨텍스트 삽입               |
| `Stop`                           | 에이전트가 완료될 때             | 결과 유효성 검사, 세션 상태 저장            |
| `SubagentStart` / `SubagentStop` | 서브에이전트가 생성되거나 완료될 때 | 병렬 작업 결과 추적 및 집계              |
| `PreCompact`                     | 컨텍스트 압축 전                 | 요약 전에 전체 대화록 아카이브              |

Hook은 에이전트의 컨텍스트 창이 아닌 애플리케이션 프로세스에서 실행되므로 컨텍스트를 소비하지 않습니다. Hook은 루프를 단락시킬 수도 있습니다: 도구 호출을 거부하는 `PreToolUse` hook은 실행을 방지하고, Claude는 대신 거부 메시지를 받습니다.

두 SDK 모두 위의 모든 이벤트를 지원합니다. TypeScript SDK는 Python이 아직 지원하지 않는 추가 이벤트를 포함합니다. 전체 이벤트 목록, SDK별 가용성, 전체 콜백 API는 [hooks로 실행 제어](/agent-sdk/hooks)를 참조하세요.

## 모두 합치기

이 예시는 이 페이지의 주요 개념을 실패하는 테스트를 수정하는 단일 에이전트로 결합합니다. 허용된 도구(에이전트가 자율적으로 실행될 수 있도록 자동 승인), 프로젝트 설정, 턴과 추론 노력에 대한 안전 한도로 에이전트를 구성합니다. 루프가 실행되면서 잠재적인 재개를 위해 세션 ID를 캡처하고, 최종 결과를 처리하고, 총 비용을 출력합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def run_agent():
    session_id = None

    async for message in query(
        prompt="Find and fix the bug causing test failures in the auth module",
        options=ClaudeAgentOptions(
            allowed_tools=[
                "Read",
                "Edit",
                "Bash",
                "Glob",
                "Grep",
            ],  # Listing tools here auto-approves them (no prompting)
            setting_sources=[
                "project"
            ],  # Load CLAUDE.md, skills, hooks from current directory
            max_turns=30,  # Prevent runaway sessions
            effort="high",  # Thorough reasoning for complex debugging
        ),
    ):
        # Handle the final result
        if isinstance(message, ResultMessage):
            session_id = message.session_id  # Save for potential resumption

            if message.subtype == "success":
                print(f"Done: {message.result}")
            elif message.subtype == "error_max_turns":
                # Agent ran out of turns. Resume with a higher limit.
                print(f"Hit turn limit. Resume session {session_id} to continue.")
            elif message.subtype == "error_max_budget_usd":
                print("Hit budget limit.")
            else:
                print(f"Stopped: {message.subtype}")
            if message.total_cost_usd is not None:
                print(f"Cost: ${message.total_cost_usd:.4f}")


asyncio.run(run_agent())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

let sessionId: string | undefined;

for await (const message of query({
  prompt: "Find and fix the bug causing test failures in the auth module",
  options: {
    allowedTools: ["Read", "Edit", "Bash", "Glob", "Grep"], // Listing tools here auto-approves them (no prompting)
    settingSources: ["project"], // Load CLAUDE.md, skills, hooks from current directory
    maxTurns: 30, // Prevent runaway sessions
    effort: "high" // Thorough reasoning for complex debugging
  }
})) {
  // Save the session ID to resume later if needed
  if (message.type === "system" && message.subtype === "init") {
    sessionId = message.session_id;
  }

  // Handle the final result
  if (message.type === "result") {
    if (message.subtype === "success") {
      console.log(`Done: ${message.result}`);
    } else if (message.subtype === "error_max_turns") {
      // Agent ran out of turns. Resume with a higher limit.
      console.log(`Hit turn limit. Resume session ${sessionId} to continue.`);
    } else if (message.subtype === "error_max_budget_usd") {
      console.log("Hit budget limit.");
    } else {
      console.log(`Stopped: ${message.subtype}`);
    }
    console.log(`Cost: $${message.total_cost_usd.toFixed(4)}`);
  }
}
```

:::

## 다음 단계

루프를 이해했다면, 만들고 있는 것에 따라 다음으로 이동하세요:

* **아직 에이전트를 실행해본 적이 없나요?** [빠른 시작](/agent-sdk/quickstart)으로 시작하여 SDK를 설치하고 엔드 투 엔드로 실행되는 전체 예시를 확인하세요.
* **프로젝트에 연결할 준비가 되었나요?** [CLAUDE.md, 스킬, 파일시스템 hooks 로드](/agent-sdk/claude-code-features)로 에이전트가 프로젝트 규칙을 자동으로 따르게 하세요.
* **인터랙티브 UI를 만들고 있나요?** [스트리밍](/agent-sdk/streaming-output)을 활성화하여 루프가 실행되는 동안 실시간으로 텍스트와 도구 호출을 표시하세요.
* **에이전트가 할 수 있는 작업을 더 엄격하게 제어해야 하나요?** [권한](/agent-sdk/permissions)으로 도구 접근을 잠그고, [hooks](/agent-sdk/hooks)를 사용하여 도구 호출을 실행 전에 감사, 차단 또는 변환하세요.
* **길거나 비용이 많이 드는 작업을 실행하나요?** [서브에이전트](/agent-sdk/subagents)에게 격리된 작업을 위임하여 메인 컨텍스트를 효율적으로 유지하세요.

에이전트 루프의 더 넓은 개념적 그림(SDK에 국한되지 않음)은 [Claude Code 동작 방식](/how-claude-code-works)을 참조하세요.
