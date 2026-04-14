---
title: Claude Agent SDK 마이그레이션 가이드
description: Claude Code TypeScript 및 Python SDK를 Claude Agent SDK로 마이그레이션하는 가이드
---

# Claude Agent SDK로 마이그레이션

> Claude Code TypeScript 및 Python SDK를 Claude Agent SDK로 마이그레이션하는 가이드

## 개요

Claude Code SDK는 **Claude Agent SDK**로 이름이 변경되었으며, 문서도 재편되었습니다. 이 변경은 코딩 작업을 넘어 다양한 AI 에이전트를 구축할 수 있는 SDK의 더 넓은 역량을 반영합니다.

## 변경 사항

| 항목                       | 이전                        | 이후                             |
| :------------------------- | :-------------------------- | :------------------------------- |
| **패키지 이름 (TS/JS)**    | `@anthropic-ai/claude-code` | `@anthropic-ai/claude-agent-sdk` |
| **Python 패키지**          | `claude-code-sdk`           | `claude-agent-sdk`               |
| **문서 위치**              | Claude Code 문서            | API 가이드 → Agent SDK 섹션      |

::: info
**문서 변경 사항:** Agent SDK 문서는 Claude Code 문서에서 API 가이드의 전용 [Agent SDK](/agent-sdk/overview) 섹션으로 이동했습니다. Claude Code 문서는 이제 CLI 도구 및 자동화 기능에 집중합니다.
:::

## 마이그레이션 단계

### TypeScript/JavaScript 프로젝트의 경우

**1. 기존 패키지 제거:**

```bash
npm uninstall @anthropic-ai/claude-code
```

**2. 새 패키지 설치:**

```bash
npm install @anthropic-ai/claude-agent-sdk
```

**3. import 구문 업데이트:**

`@anthropic-ai/claude-code`의 모든 import를 `@anthropic-ai/claude-agent-sdk`로 변경하세요:

```typescript
// 이전
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-code";

// 이후
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
```

**4. package.json 의존성 업데이트:**

`package.json`에 패키지가 등록되어 있다면 업데이트하세요:

이전:

```json
{
  "dependencies": {
    "@anthropic-ai/claude-code": "^0.0.42"
  }
}
```

이후:

```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.0"
  }
}
```

이것으로 끝입니다! 그 외 코드 변경은 필요하지 않습니다.

### Python 프로젝트의 경우

**1. 기존 패키지 제거:**

```bash
pip uninstall claude-code-sdk
```

**2. 새 패키지 설치:**

```bash
pip install claude-agent-sdk
```

**3. import 구문 업데이트:**

`claude_code_sdk`의 모든 import를 `claude_agent_sdk`로 변경하세요:

```python
# 이전
from claude_code_sdk import query, ClaudeCodeOptions

# 이후
from claude_agent_sdk import query, ClaudeAgentOptions
```

**4. 타입 이름 업데이트:**

`ClaudeCodeOptions`를 `ClaudeAgentOptions`로 변경하세요:

```python
# 이전
from claude_code_sdk import query, ClaudeCodeOptions

options = ClaudeCodeOptions(model="claude-opus-4-6")

# 이후
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(model="claude-opus-4-6")
```

**5. [주요 변경 사항](#주요-변경-사항) 검토**

마이그레이션을 완료하기 위해 필요한 코드 변경 사항을 적용하세요.

## 주요 변경 사항

::: warning
격리 및 명시적 설정을 개선하기 위해 Claude Agent SDK v0.1.0은 Claude Code SDK에서 마이그레이션하는 사용자에게 주요 변경 사항을 도입합니다. 마이그레이션 전에 이 섹션을 주의 깊게 검토하세요.
:::

### Python: ClaudeCodeOptions가 ClaudeAgentOptions로 이름 변경

**변경 내용:** Python SDK 타입 `ClaudeCodeOptions`가 `ClaudeAgentOptions`로 이름 변경되었습니다.

**마이그레이션:**

```python
# 이전 (claude-code-sdk)
from claude_code_sdk import query, ClaudeCodeOptions

options = ClaudeCodeOptions(model="claude-opus-4-6", permission_mode="acceptEdits")

# 이후 (claude-agent-sdk)
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(model="claude-opus-4-6", permission_mode="acceptEdits")
```

**변경 이유:** 타입 이름이 "Claude Agent SDK" 브랜딩과 일치하게 되어 SDK 전반의 명명 규칙이 통일됩니다.

### 시스템 프롬프트가 기본값으로 사용되지 않음

**변경 내용:** SDK는 더 이상 기본적으로 Claude Code의 system prompt를 사용하지 않습니다.

**마이그레이션:**

::: code-group

```typescript [TypeScript]
// 이전 (v0.0.x) - Claude Code의 system prompt를 기본으로 사용
const result = query({ prompt: "Hello" });

// 이후 (v0.1.0) - 최소한의 system prompt를 기본으로 사용
// 이전 동작을 유지하려면 Claude Code 프리셋을 명시적으로 지정하세요:
const result = query({
  prompt: "Hello",
  options: {
    systemPrompt: { type: "preset", preset: "claude_code" }
  }
});

// 또는 커스텀 system prompt 사용:
const result = query({
  prompt: "Hello",
  options: {
    systemPrompt: "You are a helpful coding assistant"
  }
});
```

```python [Python]
# 이전 (v0.0.x) - Claude Code의 system prompt를 기본으로 사용
async for message in query(prompt="Hello"):
    print(message)

# 이후 (v0.1.0) - 최소한의 system prompt를 기본으로 사용
# 이전 동작을 유지하려면 Claude Code 프리셋을 명시적으로 지정하세요:
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Hello",
    options=ClaudeAgentOptions(
        system_prompt={"type": "preset", "preset": "claude_code"}  # 프리셋 사용
    ),
):
    print(message)

# 또는 커스텀 system prompt 사용:
async for message in query(
    prompt="Hello",
    options=ClaudeAgentOptions(system_prompt="You are a helpful coding assistant"),
):
    print(message)
```

:::

**변경 이유:** SDK 애플리케이션에 더 나은 제어와 격리를 제공합니다. 이제 Claude Code의 CLI 중심 지침을 상속하지 않고도 커스텀 동작을 가진 에이전트를 구축할 수 있습니다.

### 설정 소스가 기본적으로 로드되지 않음

**변경 내용:** SDK는 더 이상 기본적으로 파일시스템 설정(CLAUDE.md, settings.json, 슬래시 커맨드 등)을 읽지 않습니다.

**마이그레이션:**

::: code-group

```typescript [TypeScript]
// 이전 (v0.0.x) - 모든 설정을 자동으로 로드
const result = query({ prompt: "Hello" });
// 다음에서 읽어옴:
// - ~/.claude/settings.json (사용자)
// - .claude/settings.json (프로젝트)
// - .claude/settings.local.json (로컬)
// - CLAUDE.md 파일
// - 커스텀 슬래시 커맨드

// 이후 (v0.1.0) - 기본적으로 설정 로드 없음
// 이전 동작을 유지하려면:
const result = query({
  prompt: "Hello",
  options: {
    settingSources: ["user", "project", "local"]
  }
});

// 또는 특정 소스만 로드:
const result = query({
  prompt: "Hello",
  options: {
    settingSources: ["project"] // 프로젝트 설정만
  }
});
```

```python [Python]
# 이전 (v0.0.x) - 모든 설정을 자동으로 로드
async for message in query(prompt="Hello"):
    print(message)
# 다음에서 읽어옴:
# - ~/.claude/settings.json (사용자)
# - .claude/settings.json (프로젝트)
# - .claude/settings.local.json (로컬)
# - CLAUDE.md 파일
# - 커스텀 슬래시 커맨드

# 이후 (v0.1.0) - 기본적으로 설정 로드 없음
# 이전 동작을 유지하려면:
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Hello",
    options=ClaudeAgentOptions(setting_sources=["user", "project", "local"]),
):
    print(message)

# 또는 특정 소스만 로드:
async for message in query(
    prompt="Hello",
    options=ClaudeAgentOptions(
        setting_sources=["project"]  # 프로젝트 설정만
    ),
):
    print(message)
```

:::

**변경 이유:** SDK 애플리케이션이 로컬 파일시스템 설정과 무관하게 예측 가능한 동작을 갖도록 보장합니다. 이는 특히 다음 상황에서 중요합니다:

* **CI/CD 환경** - 로컬 커스터마이징 없이 일관된 동작
* **배포된 애플리케이션** - 파일시스템 설정에 대한 의존성 없음
* **테스트** - 격리된 테스트 환경
* **멀티 테넌트 시스템** - 사용자 간 설정 누출 방지

::: info
**하위 호환성:** 애플리케이션이 파일시스템 설정(커스텀 슬래시 커맨드, CLAUDE.md 지침 등)에 의존하고 있었다면, 옵션에 `settingSources: ['user', 'project', 'local']`을 추가하세요.
:::

## 이름을 변경한 이유

Claude Code SDK는 원래 코딩 작업을 위해 설계되었지만, 모든 유형의 AI 에이전트를 구축하기 위한 강력한 프레임워크로 발전했습니다. 새 이름 "Claude Agent SDK"는 그 역량을 더 잘 반영합니다:

* 비즈니스 에이전트 구축 (법률 어시스턴트, 재무 어드바이저, 고객 지원)
* 전문화된 코딩 에이전트 생성 (SRE 봇, 보안 리뷰어, 코드 리뷰 에이전트)
* 툴 사용, MCP 통합 등을 활용한 모든 도메인의 커스텀 에이전트 개발

## 도움 받기

마이그레이션 중 문제가 발생하면:

**TypeScript/JavaScript의 경우:**

1. 모든 import가 `@anthropic-ai/claude-agent-sdk`를 사용하도록 업데이트되었는지 확인
2. package.json에 새 패키지 이름이 있는지 확인
3. `npm install`을 실행하여 의존성이 업데이트되었는지 확인

**Python의 경우:**

1. 모든 import가 `claude_agent_sdk`를 사용하도록 업데이트되었는지 확인
2. requirements.txt 또는 pyproject.toml에 새 패키지 이름이 있는지 확인
3. `pip install claude-agent-sdk`를 실행하여 패키지가 설치되었는지 확인

## 다음 단계

* [Agent SDK 개요](/agent-sdk/overview)에서 사용 가능한 기능을 알아보세요
* [TypeScript SDK 레퍼런스](/agent-sdk/typescript)에서 상세 API 문서를 확인하세요
* [Python SDK 레퍼런스](/agent-sdk/python)에서 Python 전용 문서를 검토하세요
* [커스텀 도구](/agent-sdk/custom-tools) 및 [MCP 통합](/agent-sdk/mcp)에 대해 알아보세요
