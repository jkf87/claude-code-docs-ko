---
title: SDK에서의 Plugins
description: Agent SDK를 통해 명령어, Agents, Skills, Hooks를 포함한 커스텀 Plugins로 Claude Code를 확장하는 방법
---

# SDK에서의 Plugins

> Agent SDK를 통해 slash commands, Agents, Skills, Hooks를 포함한 커스텀 Plugins를 로드하여 Claude Code를 확장하세요

Plugins를 사용하면 프로젝트 간에 공유할 수 있는 커스텀 기능으로 Claude Code를 확장할 수 있습니다. Agent SDK를 통해 로컬 디렉터리에서 Plugins를 프로그래밍 방식으로 로드하여 에이전트 세션에 커스텀 slash commands, Agents, Skills, Hooks, MCP 서버를 추가할 수 있습니다.

## Plugins란 무엇인가요?

Plugins는 다음을 포함할 수 있는 Claude Code 확장 패키지입니다:

* **Skills**: Claude가 자율적으로 사용하는 모델 호출 기능 (`/skill-name` 형식으로도 호출 가능)
* **Agents**: 특정 작업을 위한 전문화된 서브에이전트
* **Hooks**: 도구 사용 및 기타 이벤트에 반응하는 이벤트 핸들러
* **MCP servers**: Model Context Protocol을 통한 외부 도구 통합

::: info
`commands/` 디렉터리는 레거시 형식입니다. 새 Plugins에는 `skills/`를 사용하세요. Claude Code는 하위 호환성을 위해 두 형식을 모두 지원합니다.
:::

Plugin 구조 및 생성 방법에 대한 전체 정보는 [Plugins](/plugins)를 참조하세요.

## Plugins 로드하기

옵션 설정에서 로컬 파일 시스템 경로를 제공하여 Plugins를 로드합니다. SDK는 서로 다른 위치에서 여러 Plugins를 로드하는 것을 지원합니다.

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Hello",
  options: {
    plugins: [
      { type: "local", path: "./my-plugin" },
      { type: "local", path: "/absolute/path/to/another-plugin" }
    ]
  }
})) {
  // Plugin 명령어, Agents, 기타 기능을 이제 사용할 수 있습니다
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query


async def main():
    async for message in query(
        prompt="Hello",
        options={
            "plugins": [
                {"type": "local", "path": "./my-plugin"},
                {"type": "local", "path": "/absolute/path/to/another-plugin"},
            ]
        },
    ):
        # Plugin 명령어, Agents, 기타 기능을 이제 사용할 수 있습니다
        pass


asyncio.run(main())
```

:::

### 경로 지정 방식

Plugin 경로는 다음과 같이 지정할 수 있습니다:

* **상대 경로**: 현재 작업 디렉터리 기준으로 해석됩니다 (예: `"./plugins/my-plugin"`)
* **절대 경로**: 전체 파일 시스템 경로 (예: `"/home/user/plugins/my-plugin"`)

::: info
경로는 Plugin의 루트 디렉터리(`.claude-plugin/plugin.json`을 포함하는 디렉터리)를 가리켜야 합니다.
:::

## Plugin 설치 확인하기

Plugins가 성공적으로 로드되면 시스템 초기화 메시지에 표시됩니다. Plugin이 사용 가능한지 다음과 같이 확인할 수 있습니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Hello",
  options: {
    plugins: [{ type: "local", path: "./my-plugin" }]
  }
})) {
  if (message.type === "system" && message.subtype === "init") {
    // 로드된 Plugins 확인
    console.log("Plugins:", message.plugins);
    // 예시: [{ name: "my-plugin", path: "./my-plugin" }]

    // Plugins에서 제공하는 명령어 확인
    console.log("Commands:", message.slash_commands);
    // 예시: ["/help", "/compact", "my-plugin:custom-command"]
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query


async def main():
    async for message in query(
        prompt="Hello", options={"plugins": [{"type": "local", "path": "./my-plugin"}]}
    ):
        if message.type == "system" and message.subtype == "init":
            # 로드된 Plugins 확인
            print("Plugins:", message.data.get("plugins"))
            # 예시: [{"name": "my-plugin", "path": "./my-plugin"}]

            # Plugins에서 제공하는 명령어 확인
            print("Commands:", message.data.get("slash_commands"))
            # 예시: ["/help", "/compact", "my-plugin:custom-command"]


asyncio.run(main())
```

:::

## Plugin Skills 사용하기

Plugins의 Skills는 충돌을 방지하기 위해 Plugin 이름으로 자동 네임스페이스가 지정됩니다. slash commands로 호출할 때의 형식은 `plugin-name:skill-name`입니다.

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// 커스텀 /greet Skill이 있는 Plugin 로드
for await (const message of query({
  prompt: "/my-plugin:greet", // 네임스페이스를 포함하여 Plugin Skill 사용
  options: {
    plugins: [{ type: "local", path: "./my-plugin" }]
  }
})) {
  // Claude가 Plugin의 커스텀 greeting Skill을 실행합니다
  if (message.type === "assistant") {
    console.log(message.message.content);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, AssistantMessage, TextBlock


async def main():
    # 커스텀 /greet Skill이 있는 Plugin 로드
    async for message in query(
        prompt="/demo-plugin:greet",  # 네임스페이스를 포함하여 Plugin Skill 사용
        options={"plugins": [{"type": "local", "path": "./plugins/demo-plugin"}]},
    ):
        # Claude가 Plugin의 커스텀 greeting Skill을 실행합니다
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    print(f"Claude: {block.text}")


asyncio.run(main())
```

:::

::: info
CLI를 통해 Plugin을 설치한 경우 (예: `/plugin install my-plugin@marketplace`), 설치 경로를 제공하면 SDK에서도 사용할 수 있습니다. CLI로 설치된 Plugins는 `~/.claude/plugins/`에서 확인하세요.
:::

## 전체 예제

Plugin 로드 및 사용을 보여주는 전체 예제입니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as path from "path";

async function runWithPlugin() {
  const pluginPath = path.join(__dirname, "plugins", "my-plugin");

  console.log("Loading plugin from:", pluginPath);

  for await (const message of query({
    prompt: "What custom commands do you have available?",
    options: {
      plugins: [{ type: "local", path: pluginPath }],
      maxTurns: 3
    }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log("Loaded plugins:", message.plugins);
      console.log("Available commands:", message.slash_commands);
    }

    if (message.type === "assistant") {
      console.log("Assistant:", message.message.content);
    }
  }
}

runWithPlugin().catch(console.error);
```

```python [Python]
#!/usr/bin/env python3
"""Agent SDK와 함께 Plugins를 사용하는 방법을 보여주는 예제."""

from pathlib import Path
import anyio
from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    TextBlock,
    query,
)


async def run_with_plugin():
    """커스텀 Plugin을 사용하는 예제."""
    plugin_path = Path(__file__).parent / "plugins" / "demo-plugin"

    print(f"Loading plugin from: {plugin_path}")

    options = ClaudeAgentOptions(
        plugins=[{"type": "local", "path": str(plugin_path)}],
        max_turns=3,
    )

    async for message in query(
        prompt="What custom commands do you have available?", options=options
    ):
        if message.type == "system" and message.subtype == "init":
            print(f"Loaded plugins: {message.data.get('plugins')}")
            print(f"Available commands: {message.data.get('slash_commands')}")

        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    print(f"Assistant: {block.text}")


if __name__ == "__main__":
    anyio.run(run_with_plugin)
```

:::

## Plugin 구조 참조

Plugin 디렉터리에는 반드시 `.claude-plugin/plugin.json` 매니페스트 파일이 있어야 합니다. 선택적으로 다음을 포함할 수 있습니다:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # 필수: Plugin 매니페스트
├── skills/                   # Agent Skills (자율적으로 또는 /skill-name으로 호출)
│   └── my-skill/
│       └── SKILL.md
├── commands/                 # 레거시: skills/ 사용 권장
│   └── custom-cmd.md
├── agents/                   # 커스텀 Agents
│   └── specialist.md
├── hooks/                    # 이벤트 핸들러
│   └── hooks.json
└── .mcp.json                # MCP 서버 정의
```

Plugin 생성에 대한 자세한 내용은 다음을 참조하세요:

* [Plugins](/plugins) - 전체 Plugin 개발 가이드
* [Plugins 레퍼런스](/plugins-reference) - 기술 사양 및 스키마

## 주요 사용 사례

### 개발 및 테스트

전역 설치 없이 개발 중에 Plugins를 로드합니다:

```typescript
plugins: [{ type: "local", path: "./dev-plugins/my-plugin" }];
```

### 프로젝트별 확장

팀 전체의 일관성을 위해 프로젝트 저장소에 Plugins를 포함합니다:

```typescript
plugins: [{ type: "local", path: "./project-plugins/team-workflows" }];
```

### 다중 Plugin 소스

서로 다른 위치의 Plugins를 조합합니다:

```typescript
plugins: [
  { type: "local", path: "./local-plugin" },
  { type: "local", path: "~/.claude/custom-plugins/shared-plugin" }
];
```

## 문제 해결

### Plugin이 로드되지 않을 때

Plugin이 init 메시지에 나타나지 않는 경우:

1. **경로 확인**: 경로가 Plugin 루트 디렉터리(`.claude-plugin/` 포함)를 가리키는지 확인하세요
2. **plugin.json 검증**: 매니페스트 파일의 JSON 문법이 올바른지 확인하세요
3. **파일 권한 확인**: Plugin 디렉터리에 읽기 권한이 있는지 확인하세요

### Skills가 나타나지 않을 때

Plugin Skills가 작동하지 않는 경우:

1. **네임스페이스 사용**: slash commands로 호출할 때 Plugin Skills는 `plugin-name:skill-name` 형식이 필요합니다
2. **init 메시지 확인**: 올바른 네임스페이스로 `slash_commands`에 Skill이 나타나는지 확인하세요
3. **Skill 파일 검증**: 각 Skill이 `skills/` 아래의 자체 서브디렉터리에 `SKILL.md` 파일을 가지는지 확인하세요 (예: `skills/my-skill/SKILL.md`)

### 경로 해석 문제

상대 경로가 작동하지 않는 경우:

1. **작업 디렉터리 확인**: 상대 경로는 현재 작업 디렉터리 기준으로 해석됩니다
2. **절대 경로 사용**: 안정성을 위해 절대 경로 사용을 고려하세요
3. **경로 정규화**: 경로 유틸리티를 사용하여 경로를 올바르게 구성하세요

## 관련 문서

* [Plugins](/plugins) - 전체 Plugin 개발 가이드
* [Plugins 레퍼런스](/plugins-reference) - 기술 사양
* [Slash Commands](/agent-sdk/slash-commands) - SDK에서 slash commands 사용하기
* [Subagents](/agent-sdk/subagents) - 전문화된 Agents 다루기
* [Skills](/agent-sdk/skills) - Agent Skills 사용하기
