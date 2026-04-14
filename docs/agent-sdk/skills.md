---
title: SDK의 Agent Skills
description: Claude Agent SDK에서 Agent Skills를 사용해 Claude의 기능을 확장하는 방법
---

# SDK의 Agent Skills

Agent Skills를 사용해 Claude Agent SDK에서 Claude의 전문 기능을 확장하세요.

## 개요

Agent Skills는 Claude가 필요에 따라 자율적으로 호출하는 전문 기능을 Claude에 추가합니다. Skills는 지시사항, 설명, 그리고 선택적인 지원 리소스를 포함하는 `SKILL.md` 파일로 패키징됩니다.

Skills의 이점, 아키텍처, 작성 가이드라인 등 포괄적인 정보는 [Agent Skills 개요](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)를 참조하세요.

## SDK에서 Skills의 동작 방식

Claude Agent SDK를 사용할 때 Skills는 다음과 같이 동작합니다:

1. **파일시스템 아티팩트로 정의**: 특정 디렉토리(`.claude/skills/`)에 `SKILL.md` 파일로 생성됩니다.
2. **파일시스템에서 로드**: Skills는 설정된 파일시스템 위치에서 로드됩니다. 파일시스템에서 Skills를 로드하려면 `settingSources`(TypeScript) 또는 `setting_sources`(Python)를 지정해야 합니다.
3. **자동 검색**: 파일시스템 설정이 로드되면 Skill 메타데이터는 시작 시 사용자 및 프로젝트 디렉토리에서 자동으로 검색되며, 전체 콘텐츠는 트리거될 때 로드됩니다.
4. **모델이 직접 호출**: Claude가 컨텍스트에 따라 자율적으로 사용 시점을 결정합니다.
5. **`allowed_tools`를 통해 활성화**: Skills를 활성화하려면 `allowed_tools`에 `"Skill"`을 추가하세요.

서브에이전트(프로그래밍 방식으로 정의 가능)와 달리, Skills는 파일시스템 아티팩트로 생성해야 합니다. SDK는 Skills를 등록하는 프로그래밍 API를 제공하지 않습니다.

::: info
**기본 동작**: SDK는 기본적으로 파일시스템 설정을 로드하지 않습니다. Skills를 사용하려면 옵션에서 `settingSources: ['user', 'project']`(TypeScript) 또는 `setting_sources=["user", "project"]`(Python)을 명시적으로 설정해야 합니다.
:::

## SDK에서 Skills 사용하기

SDK에서 Skills를 사용하려면 다음이 필요합니다:

1. `allowed_tools` 설정에 `"Skill"` 포함
2. 파일시스템에서 Skills를 로드하도록 `settingSources`/`setting_sources` 설정

설정이 완료되면 Claude는 지정된 디렉토리에서 Skills를 자동으로 검색하고 사용자 요청에 맞는 Skills를 호출합니다.

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions


async def main():
    options = ClaudeAgentOptions(
        cwd="/path/to/project",  # .claude/skills/이 있는 프로젝트
        setting_sources=["user", "project"],  # 파일시스템에서 Skills 로드
        allowed_tools=["Skill", "Read", "Write", "Bash"],  # Skill 도구 활성화
    )

    async for message in query(
        prompt="Help me process this PDF document", options=options
    ):
        print(message)


asyncio.run(main())
```

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Help me process this PDF document",
  options: {
    cwd: "/path/to/project", // .claude/skills/이 있는 프로젝트
    settingSources: ["user", "project"], // 파일시스템에서 Skills 로드
    allowedTools: ["Skill", "Read", "Write", "Bash"] // Skill 도구 활성화
  }
})) {
  console.log(message);
}
```

:::

## Skill 저장 위치

Skills는 `settingSources`/`setting_sources` 설정에 따라 파일시스템 디렉토리에서 로드됩니다:

- **프로젝트 Skills** (`.claude/skills/`): git을 통해 팀과 공유 - `setting_sources`에 `"project"`가 포함될 때 로드
- **사용자 Skills** (`~/.claude/skills/`): 모든 프로젝트에서 사용하는 개인 Skills - `setting_sources`에 `"user"`가 포함될 때 로드
- **플러그인 Skills**: 설치된 Claude Code 플러그인에 번들로 제공

## Skills 만들기

Skills는 YAML 프론트매터와 Markdown 콘텐츠를 포함하는 `SKILL.md` 파일이 있는 디렉토리로 정의됩니다. `description` 필드는 Claude가 해당 Skill을 호출할 시점을 결정합니다.

**디렉토리 구조 예시**:

```bash
.claude/skills/processing-pdfs/
└── SKILL.md
```

Skills 생성에 대한 전체 안내(SKILL.md 구조, 다중 파일 Skills, 예시 포함)는 다음을 참조하세요:

- [Claude Code의 Agent Skills](/skills): 예시가 포함된 완전한 가이드
- [Agent Skills 모범 사례](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): 작성 가이드라인과 명명 규칙

## 도구 제한

::: info
SKILL.md의 `allowed-tools` 프론트매터 필드는 Claude Code CLI를 직접 사용할 때만 지원됩니다. **SDK를 통해 Skills를 사용할 때는 적용되지 않습니다**.

SDK를 사용할 때는 쿼리 설정의 메인 `allowedTools` 옵션을 통해 도구 접근을 제어하세요.
:::

SDK 애플리케이션에서 Skills의 도구 접근을 제어하려면 `allowedTools`를 사용해 특정 도구를 사전 승인하세요. `canUseTool` 콜백 없이는 목록에 없는 모든 것이 거부됩니다:

::: info
이후 코드 스니펫에서는 첫 번째 예시의 import 문이 포함된 것으로 가정합니다.
:::

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    setting_sources=["user", "project"],  # 파일시스템에서 Skills 로드
    allowed_tools=["Skill", "Read", "Grep", "Glob"],
)

async for message in query(prompt="Analyze the codebase structure", options=options):
    print(message)
```

```typescript [TypeScript]
for await (const message of query({
  prompt: "Analyze the codebase structure",
  options: {
    settingSources: ["user", "project"], // 파일시스템에서 Skills 로드
    allowedTools: ["Skill", "Read", "Grep", "Glob"],
    permissionMode: "dontAsk" // allowedTools에 없는 것은 모두 거부
  }
})) {
  console.log(message);
}
```

:::

## 사용 가능한 Skills 확인

SDK 애플리케이션에서 어떤 Skills를 사용할 수 있는지 확인하려면 Claude에게 직접 물어보세요:

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    setting_sources=["user", "project"],  # 파일시스템에서 Skills 로드
    allowed_tools=["Skill"],
)

async for message in query(prompt="What Skills are available?", options=options):
    print(message)
```

```typescript [TypeScript]
for await (const message of query({
  prompt: "What Skills are available?",
  options: {
    settingSources: ["user", "project"], // 파일시스템에서 Skills 로드
    allowedTools: ["Skill"]
  }
})) {
  console.log(message);
}
```

:::

Claude는 현재 작업 디렉토리와 설치된 플러그인을 기반으로 사용 가능한 Skills 목록을 알려줍니다.

## Skills 테스트

Skills의 설명과 일치하는 질문으로 Skills를 테스트하세요:

::: code-group

```python [Python]
options = ClaudeAgentOptions(
    cwd="/path/to/project",
    setting_sources=["user", "project"],  # 파일시스템에서 Skills 로드
    allowed_tools=["Skill", "Read", "Bash"],
)

async for message in query(prompt="Extract text from invoice.pdf", options=options):
    print(message)
```

```typescript [TypeScript]
for await (const message of query({
  prompt: "Extract text from invoice.pdf",
  options: {
    cwd: "/path/to/project",
    settingSources: ["user", "project"], // 파일시스템에서 Skills 로드
    allowedTools: ["Skill", "Read", "Bash"]
  }
})) {
  console.log(message);
}
```

:::

설명이 요청과 일치하면 Claude가 관련 Skill을 자동으로 호출합니다.

## 문제 해결

### Skills를 찾을 수 없는 경우

**settingSources 설정 확인**: Skills는 `settingSources`/`setting_sources`를 명시적으로 설정했을 때만 로드됩니다. 가장 흔한 문제입니다:

::: code-group

```python [Python]
# 잘못됨 - Skills가 로드되지 않음
options = ClaudeAgentOptions(allowed_tools=["Skill"])

# 올바름 - Skills가 로드됨
options = ClaudeAgentOptions(
    setting_sources=["user", "project"],  # Skills 로드에 필요
    allowed_tools=["Skill"],
)
```

```typescript [TypeScript]
// 잘못됨 - Skills가 로드되지 않음
const options = {
  allowedTools: ["Skill"]
};

// 올바름 - Skills가 로드됨
const options = {
  settingSources: ["user", "project"], // Skills 로드에 필요
  allowedTools: ["Skill"]
};
```

:::

`settingSources`/`setting_sources`에 대한 자세한 내용은 [TypeScript SDK 레퍼런스](/agent-sdk/typescript#setting-source) 또는 [Python SDK 레퍼런스](/agent-sdk/python#setting-source)를 참조하세요.

**작업 디렉토리 확인**: SDK는 `cwd` 옵션을 기준으로 Skills를 로드합니다. `.claude/skills/`가 포함된 디렉토리를 가리키는지 확인하세요:

::: code-group

```python [Python]
# cwd가 .claude/skills/를 포함하는 디렉토리를 가리키는지 확인
options = ClaudeAgentOptions(
    cwd="/path/to/project",  # .claude/skills/가 있어야 함
    setting_sources=["user", "project"],  # Skills 로드에 필요
    allowed_tools=["Skill"],
)
```

```typescript [TypeScript]
// cwd가 .claude/skills/를 포함하는 디렉토리를 가리키는지 확인
const options = {
  cwd: "/path/to/project", // .claude/skills/가 있어야 함
  settingSources: ["user", "project"], // Skills 로드에 필요
  allowedTools: ["Skill"]
};
```

:::

전체 패턴은 위의 "SDK에서 Skills 사용하기" 섹션을 참조하세요.

**파일시스템 위치 확인**:

```bash
# 프로젝트 Skills 확인
ls .claude/skills/*/SKILL.md

# 개인 Skills 확인
ls ~/.claude/skills/*/SKILL.md
```

### Skill이 사용되지 않는 경우

**Skill 도구가 활성화되어 있는지 확인**: `allowedTools`에 `"Skill"`이 포함되어 있는지 확인하세요.

**설명 확인**: 설명이 구체적이고 관련 키워드를 포함하는지 확인하세요. 효과적인 설명 작성에 대한 안내는 [Agent Skills 모범 사례](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#writing-effective-descriptions)를 참조하세요.

### 추가 문제 해결

일반적인 Skills 문제 해결(YAML 문법, 디버깅 등)은 [Claude Code Skills 문제 해결 섹션](/skills#troubleshooting)을 참조하세요.

## 관련 문서

### Skills 가이드

- [Claude Code의 Agent Skills](/skills): 생성, 예시, 문제 해결을 포함한 완전한 Skills 가이드
- [Agent Skills 개요](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview): 개념 개요, 이점, 아키텍처
- [Agent Skills 모범 사례](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): 효과적인 Skills 작성 가이드라인
- [Agent Skills Cookbook](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction): 예시 Skills 및 템플릿

### SDK 리소스

- [SDK의 서브에이전트](/agent-sdk/subagents): 프로그래밍 방식 옵션이 있는 유사한 파일시스템 기반 에이전트
- [SDK의 슬래시 명령어](/agent-sdk/slash-commands): 사용자가 직접 호출하는 명령어
- [SDK 개요](/agent-sdk/overview): 일반적인 SDK 개념
- [TypeScript SDK 레퍼런스](/agent-sdk/typescript): 완전한 API 문서
- [Python SDK 레퍼런스](/agent-sdk/python): 완전한 API 문서
