---
title: SDK에서 Claude Code 기능 사용하기
description: 프로젝트 지침, Skills, Hooks 등 Claude Code의 파일시스템 기반 기능을 Agent SDK에 로드하는 방법을 안내합니다.
---

# SDK에서 Claude Code 기능 사용하기

> 프로젝트 지침, Skills, Hooks 및 기타 Claude Code 기능을 SDK 에이전트에 로드합니다.

Agent SDK는 Claude Code와 동일한 기반 위에 구축되어 있습니다. 따라서 SDK 에이전트는 파일시스템 기반 기능에 동일하게 접근할 수 있습니다: 프로젝트 지침(`CLAUDE.md` 및 rules), Skills, Hooks 등이 포함됩니다.

기본적으로 SDK는 파일시스템 설정을 전혀 로드하지 않습니다. 에이전트는 프로그래밍 방식으로 전달한 내용만으로 격리 모드에서 실행됩니다. CLAUDE.md, Skills, 또는 파일시스템 Hooks를 로드하려면 `settingSources`를 설정하여 SDK가 어디서 찾아야 할지 알려주어야 합니다.

각 기능이 무엇을 하는지, 언제 사용하는지에 대한 개념적 개요는 [Claude Code 확장하기](/features-overview)를 참고하세요.

## settingSources로 Claude Code 기능 활성화하기

setting sources 옵션(Python의 [`setting_sources`](/agent-sdk/python#claude-agent-options), TypeScript의 [`settingSources`](/agent-sdk/typescript#setting-source))은 SDK가 로드하는 파일시스템 기반 설정을 제어합니다. 이 옵션 없이는 에이전트가 Skills, `CLAUDE.md` 파일, 프로젝트 수준의 Hooks를 탐색하지 않습니다.

다음 예시는 `settingSources`를 `["user", "project"]`로 설정하여 사용자 수준과 프로젝트 수준의 설정을 모두 로드합니다:

::: code-group
```python Python
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage

async for message in query(
    prompt="Help me refactor the auth module",
    options=ClaudeAgentOptions(
        # "user"는 ~/.claude/에서, "project"는 현재 작업 디렉토리의 ./.claude/에서 로드합니다.
        # 두 설정을 함께 사용하면 에이전트가 두 위치에서 CLAUDE.md, Skills, Hooks,
        # 권한에 접근할 수 있습니다.
        setting_sources=["user", "project"],
        allowed_tools=["Read", "Edit", "Bash"],
    ),
):
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if hasattr(block, "text"):
                print(block.text)
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(f"\nResult: {message.result}")
```

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Help me refactor the auth module",
  options: {
    // "user"는 ~/.claude/에서, "project"는 현재 작업 디렉토리의 ./.claude/에서 로드합니다.
    // 두 설정을 함께 사용하면 에이전트가 두 위치에서 CLAUDE.md, Skills, Hooks,
    // 권한에 접근할 수 있습니다.
    settingSources: ["user", "project"],
    allowedTools: ["Read", "Edit", "Bash"]
  }
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") console.log(block.text);
    }
  }
  if (message.type === "result" && message.subtype === "success") {
    console.log(`\nResult: ${message.result}`);
  }
}
```
:::

각 소스는 특정 위치에서 설정을 로드합니다. `<cwd>`는 `cwd` 옵션으로 전달한 작업 디렉토리(설정하지 않은 경우 프로세스의 현재 디렉토리)를 의미합니다. 전체 타입 정의는 [`SettingSource`](/agent-sdk/typescript#setting-source) (TypeScript) 또는 [`SettingSource`](/agent-sdk/python#setting-source) (Python)를 참고하세요.

| 소스        | 로드 내용                                                                                       | 위치                                                                                                                                |
| :---------- | :---------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `"project"` | 프로젝트 CLAUDE.md, `.claude/rules/*.md`, 프로젝트 Skills, 프로젝트 Hooks, 프로젝트 `settings.json` | `<cwd>/.claude/` 및 파일시스템 루트까지의 각 상위 디렉토리 (`.claude/`가 발견되거나 더 이상 상위 디렉토리가 없을 때 중지) |
| `"user"`    | 사용자 CLAUDE.md, `~/.claude/rules/*.md`, 사용자 Skills, 사용자 설정                             | `~/.claude/`                                                                                                                        |
| `"local"`   | CLAUDE.local.md (gitignore 대상), `.claude/settings.local.json`                                  | `<cwd>/`                                                                                                                            |

완전한 Claude Code CLI 동작을 재현하려면 `["user", "project", "local"]`을 사용하세요.

::: warning
`cwd` 옵션은 SDK가 프로젝트 설정을 찾는 위치를 결정합니다. `cwd`나 그 상위 디렉토리 어느 것도 `.claude/` 폴더를 포함하지 않는 경우, 프로젝트 수준 기능이 로드되지 않습니다. 자동 메모리(Claude Code가 대화형 세션 간 메모를 유지하는 데 사용하는 `~/.claude/projects/<project>/memory/` 디렉토리)는 CLI 전용 기능이며 SDK에서는 로드되지 않습니다.
:::

## 프로젝트 지침 (CLAUDE.md 및 rules)

`CLAUDE.md` 파일과 `.claude/rules/*.md` 파일은 에이전트에 프로젝트에 대한 지속적인 컨텍스트를 제공합니다: 코딩 관례, 빌드 명령어, 아키텍처 결정사항, 그리고 지침들이 포함됩니다. `settingSources`에 `"project"`가 포함되면(위 예시처럼), SDK는 세션 시작 시 이 파일들을 컨텍스트에 로드합니다. 그러면 에이전트는 매번 프롬프트에서 반복하지 않아도 프로젝트 관례를 따르게 됩니다.

### CLAUDE.md 로드 위치

| 레벨                  | 위치                                           | 로드 시점                                                                                           |
| :-------------------- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| 프로젝트 (루트)       | `<cwd>/CLAUDE.md` 또는 `<cwd>/.claude/CLAUDE.md` | `settingSources`에 `"project"` 포함 시                                                              |
| 프로젝트 rules        | `<cwd>/.claude/rules/*.md`                     | `settingSources`에 `"project"` 포함 시                                                              |
| 프로젝트 (상위 디렉토리) | `cwd` 위의 디렉토리에 있는 `CLAUDE.md` 파일   | `settingSources`에 `"project"` 포함 시, 세션 시작 시 로드                                           |
| 프로젝트 (하위 디렉토리) | `cwd` 하위 디렉토리에 있는 `CLAUDE.md` 파일   | `settingSources`에 `"project"` 포함 시, 에이전트가 해당 서브트리의 파일을 읽을 때 필요에 따라 로드  |
| 로컬 (gitignore 대상) | `<cwd>/CLAUDE.local.md`                        | `settingSources`에 `"local"` 포함 시                                                                |
| 사용자                | `~/.claude/CLAUDE.md`                          | `settingSources`에 `"user"` 포함 시                                                                 |
| 사용자 rules          | `~/.claude/rules/*.md`                         | `settingSources`에 `"user"` 포함 시                                                                 |

모든 레벨은 누적 적용됩니다: 프로젝트와 사용자 CLAUDE.md 파일이 모두 존재하면, 에이전트는 둘 다 인식합니다. 레벨 간 엄격한 우선순위 규칙은 없습니다. 지침이 충돌하는 경우 결과는 Claude가 어떻게 해석하느냐에 달려 있습니다. 충돌하지 않는 규칙을 작성하거나, 더 구체적인 파일에 우선순위를 명시적으로 기술하세요 ("이 프로젝트 지침은 사용자 수준 기본값과 충돌하는 경우 우선합니다").

::: tip
CLAUDE.md 파일을 사용하지 않고 `systemPrompt`를 통해 직접 컨텍스트를 주입할 수도 있습니다. [시스템 프롬프트 수정하기](/agent-sdk/modifying-system-prompts)를 참고하세요. 대화형 Claude Code 세션과 SDK 에이전트 사이에서 동일한 컨텍스트를 공유하고 싶을 때 CLAUDE.md를 사용하세요.
:::

CLAUDE.md 내용을 구조화하고 정리하는 방법은 [Claude의 메모리 관리](/memory)를 참고하세요.

## Skills

Skills는 에이전트에 전문 지식과 호출 가능한 워크플로우를 제공하는 마크다운 파일입니다. 매 세션 로드되는 `CLAUDE.md`와 달리, Skills는 필요할 때 로드됩니다. 에이전트는 시작 시 Skill 설명을 받고, 관련이 있을 때 전체 내용을 로드합니다.

SDK에서 Skills를 사용하려면 `settingSources`를 설정하여 에이전트가 파일시스템에서 Skill 파일을 탐색하게 하세요. `Skill` 도구는 `allowedTools`를 지정하지 않은 경우 기본으로 활성화됩니다. `allowedTools` 허용 목록을 사용하는 경우, `"Skill"`을 명시적으로 포함해야 합니다.

::: code-group
```python Python
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

# settingSources에 "project"가 포함되면
# .claude/skills/의 Skills가 자동으로 탐색됩니다
async for message in query(
    prompt="Review this PR using our code review checklist",
    options=ClaudeAgentOptions(
        setting_sources=["user", "project"],
        allowed_tools=["Skill", "Read", "Grep", "Glob"],
    ),
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(message.result)
```

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

// settingSources에 "project"가 포함되면
// .claude/skills/의 Skills가 자동으로 탐색됩니다
for await (const message of query({
  prompt: "Review this PR using our code review checklist",
  options: {
    settingSources: ["user", "project"],
    allowedTools: ["Skill", "Read", "Grep", "Glob"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```
:::

::: info
Skills는 파일시스템 아티팩트(`.claude/skills/<name>/SKILL.md`)로 생성해야 합니다. SDK에는 Skills를 등록하는 프로그래밍 방식의 API가 없습니다. 자세한 내용은 [SDK의 Agent Skills](/agent-sdk/skills)를 참고하세요.
:::

Skills를 생성하고 사용하는 방법에 대한 자세한 내용은 [SDK의 Agent Skills](/agent-sdk/skills)를 참고하세요.

## Hooks

SDK는 Hooks를 정의하는 두 가지 방법을 지원하며, 이 둘은 나란히 실행됩니다:

* **파일시스템 Hooks:** `settings.json`에 정의된 셸 명령어로, `settingSources`에 관련 소스가 포함될 때 로드됩니다. [대화형 Claude Code 세션](/hooks-guide)에서 설정하는 Hooks와 동일합니다.
* **프로그래밍 방식 Hooks:** `query()`에 직접 전달하는 콜백 함수입니다. 이 함수는 애플리케이션 프로세스에서 실행되며 구조화된 결정을 반환할 수 있습니다. [Hooks로 실행 제어하기](/agent-sdk/hooks)를 참고하세요.

두 유형 모두 동일한 Hook 생명주기 동안 실행됩니다. 프로젝트의 `.claude/settings.json`에 이미 Hooks가 있고 `settingSources: ["project"]`를 설정하면, 추가 설정 없이 SDK에서 해당 Hooks가 자동으로 실행됩니다.

Hook 콜백은 도구 입력을 받아 결정 딕셔너리를 반환합니다. `{}`(빈 딕셔너리)를 반환하면 도구 실행을 허용합니다. `{"decision": "block", "reason": "..."}`를 반환하면 실행이 차단되고 reason이 도구 결과로 Claude에 전달됩니다. 전체 콜백 시그니처와 반환 타입은 [Hooks 가이드](/agent-sdk/hooks)를 참고하세요.

::: code-group
```python Python
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher, ResultMessage


# PreToolUse 훅 콜백. 위치 인자:
#   input_data: tool_name, tool_input, hook_event_name이 포함된 HookInput 딕셔너리
#   tool_use_id: str | None, 인터셉트 중인 도구 호출의 ID
#   context: HookContext, 세션 메타데이터를 담음
async def audit_bash(input_data, tool_use_id, context):
    command = input_data.get("tool_input", {}).get("command", "")
    if "rm -rf" in command:
        return {"decision": "block", "reason": "Destructive command blocked"}
    return {}  # 빈 딕셔너리: 도구 실행 허용


# .claude/settings.json의 파일시스템 Hooks는 settingSources가
# 로드할 때 자동으로 실행됩니다. 프로그래밍 방식 Hooks도 추가할 수 있습니다:
async for message in query(
    prompt="Refactor the auth module",
    options=ClaudeAgentOptions(
        setting_sources=["project"],  # .claude/settings.json에서 Hooks 로드
        hooks={
            "PreToolUse": [
                HookMatcher(matcher="Bash", hooks=[audit_bash]),
            ]
        },
    ),
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        print(message.result)
```

```typescript TypeScript
import { query, type HookInput, type HookJSONOutput } from "@anthropic-ai/claude-agent-sdk";

// PreToolUse 훅 콜백. HookInput은 hook_event_name에 대한 구별된 유니온이므로
// 이를 통해 좁히면 TypeScript가 이 이벤트에 대한 올바른
// tool_input 형태를 제공합니다.
const auditBash = async (input: HookInput): Promise<HookJSONOutput> => {
  if (input.hook_event_name !== "PreToolUse") return {};
  const toolInput = input.tool_input as { command?: string };
  if (toolInput.command?.includes("rm -rf")) {
    return { decision: "block", reason: "Destructive command blocked" };
  }
  return {}; // 빈 객체: 도구 실행 허용
};

// .claude/settings.json의 파일시스템 Hooks는 settingSources가
// 로드할 때 자동으로 실행됩니다. 프로그래밍 방식 Hooks도 추가할 수 있습니다:
for await (const message of query({
  prompt: "Refactor the auth module",
  options: {
    settingSources: ["project"], // .claude/settings.json에서 Hooks 로드
    hooks: {
      PreToolUse: [{ matcher: "Bash", hooks: [auditBash] }]
    }
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```
:::

### 어떤 Hook 유형을 사용할지 선택하기

| Hook 유형                                 | 적합한 용도                                                                                                                                                                                                                                               |
| :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **파일시스템** (`settings.json`)          | CLI와 SDK 세션 간에 Hooks 공유. `"command"`(셸 스크립트), `"http"`(엔드포인트로 POST), `"prompt"`(LLM이 프롬프트 평가), `"agent"`(검증 에이전트 생성)를 지원합니다. 메인 에이전트 및 생성된 모든 서브에이전트에서 실행됩니다. |
| **프로그래밍 방식** (`query()`의 콜백)    | 애플리케이션 특화 로직, 구조화된 결정 반환, 인프로세스 통합에 적합합니다. 메인 세션에만 범위가 한정됩니다.                                                                                                                                               |

::: info
TypeScript SDK는 Python 외에 `SessionStart`, `SessionEnd`, `TeammateIdle`, `TaskCompleted` 등 추가 Hook 이벤트를 지원합니다. 전체 이벤트 호환성 표는 [Hooks 가이드](/agent-sdk/hooks)를 참고하세요.
:::

프로그래밍 방식 Hooks에 대한 자세한 내용은 [Hooks로 실행 제어하기](/agent-sdk/hooks)를 참고하세요. 파일시스템 Hook 문법은 [Hooks](/hooks)를 참고하세요.

## 적합한 기능 선택하기

Agent SDK는 에이전트의 동작을 확장하는 여러 방법을 제공합니다. 어떤 것을 사용할지 확실하지 않다면, 이 표에서 일반적인 목표에 맞는 접근 방식을 확인하세요.

| 목표                                                                               | 사용할 기능                                           | SDK 인터페이스                                                                                                                                              |
| :--------------------------------------------------------------------------------- | :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 에이전트가 항상 따르는 프로젝트 관례 설정                                          | [CLAUDE.md](/memory)                                  | `settingSources: ["project"]`로 자동 로드                                                                                                                   |
| 관련 시점에 로드하는 참고 자료 제공                                                | [Skills](/agent-sdk/skills)                           | `settingSources` + `allowedTools: ["Skill"]`                                                                                                                |
| 재사용 가능한 워크플로우 실행 (배포, 리뷰, 릴리스)                                | [사용자 호출 가능 Skills](/agent-sdk/skills)          | `settingSources` + `allowedTools: ["Skill"]`                                                                                                                |
| 격리된 서브태스크를 새로운 컨텍스트에 위임 (리서치, 리뷰)                         | [서브에이전트](/agent-sdk/subagents)                  | `agents` 파라미터 + `allowedTools: ["Agent"]`                                                                                                               |
| 공유 태스크 목록과 직접 에이전트 간 메시징으로 여러 Claude Code 인스턴스 조율     | [에이전트 팀](/agent-teams)                           | SDK 옵션으로 직접 설정하지 않습니다. 에이전트 팀은 하나의 세션이 팀 리더 역할을 하여 독립적인 팀원들의 작업을 조율하는 CLI 기능입니다.                      |
| 도구 호출에 대한 결정론적 로직 실행 (감사, 차단, 변환)                            | [Hooks](/agent-sdk/hooks)                             | 콜백이 있는 `hooks` 파라미터, 또는 `settingSources`로 로드되는 셸 스크립트                                                                                  |
| 외부 서비스에 대한 구조화된 도구 접근 제공                                        | [MCP](/agent-sdk/mcp)                                 | `mcpServers` 파라미터                                                                                                                                       |

::: tip
**서브에이전트 vs 에이전트 팀:** 서브에이전트는 임시적이고 격리되어 있습니다: 새로운 대화, 단일 태스크, 부모에게 요약 반환. 에이전트 팀은 태스크 목록을 공유하고 서로 직접 메시지를 주고받는 여러 독립적인 Claude Code 인스턴스를 조율합니다. 에이전트 팀은 CLI 기능입니다. 자세한 내용은 [서브에이전트가 상속하는 것](/agent-sdk/subagents#what-subagents-inherit)과 [에이전트 팀 비교](/agent-teams#compare-with-subagents)를 참고하세요.
:::

활성화하는 모든 기능은 에이전트의 컨텍스트 윈도우를 소비합니다. 기능별 비용과 이러한 기능들이 함께 작동하는 방식은 [Claude Code 확장하기](/features-overview#understand-context-costs)를 참고하세요.

## 관련 리소스

* [Claude Code 확장하기](/features-overview): 모든 확장 기능의 개념적 개요, 비교 표 및 컨텍스트 비용 분석
* [SDK의 Skills](/agent-sdk/skills): Skills를 프로그래밍 방식으로 사용하는 완전한 가이드
* [서브에이전트](/agent-sdk/subagents): 격리된 서브태스크를 위한 서브에이전트 정의 및 호출
* [Hooks](/agent-sdk/hooks): 주요 실행 시점에서 에이전트 동작 인터셉트 및 제어
* [권한](/agent-sdk/permissions): 모드, 규칙, 콜백으로 도구 접근 제어
* [시스템 프롬프트](/agent-sdk/modifying-system-prompts): CLAUDE.md 파일 없이 컨텍스트 주입
