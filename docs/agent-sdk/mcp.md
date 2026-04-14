---
title: MCP로 외부 도구 연결하기
description: MCP 서버를 설정하여 에이전트를 외부 도구로 확장합니다. 전송 유형, 대규모 도구 세트의 도구 검색, 인증, 오류 처리를 다룹니다.
---

# MCP로 외부 도구 연결하기

> MCP 서버를 설정하여 에이전트를 외부 도구로 확장합니다. 전송 유형, 대규모 도구 세트의 도구 검색, 인증, 오류 처리를 다룹니다.

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro)는 AI 에이전트를 외부 도구 및 데이터 소스에 연결하기 위한 개방형 표준입니다. MCP를 사용하면 에이전트가 데이터베이스를 쿼리하고, Slack이나 GitHub 같은 API와 연동하고, 별도의 커스텀 도구 구현 없이 다양한 서비스에 연결할 수 있습니다.

MCP 서버는 로컬 프로세스로 실행하거나, HTTP로 연결하거나, SDK 애플리케이션 내에서 직접 실행할 수 있습니다.

## 빠른 시작

이 예제는 [HTTP 전송](#httpsse-서버)을 사용하여 [Claude Code 문서](https://code.claude.com/docs) MCP 서버에 연결하고, 와일드카드와 함께 [`allowedTools`](#mcp-도구-허용)를 사용하여 서버의 모든 도구를 허용합니다.

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Use the docs MCP server to explain what hooks are in Claude Code",
  options: {
    mcpServers: {
      "claude-code-docs": {
        type: "http",
        url: "https://code.claude.com/docs/mcp"
      }
    },
    allowedTools: ["mcp__claude-code-docs__*"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def main():
    options = ClaudeAgentOptions(
        mcp_servers={
            "claude-code-docs": {
                "type": "http",
                "url": "https://code.claude.com/docs/mcp",
            }
        },
        allowed_tools=["mcp__claude-code-docs__*"],
    )

    async for message in query(
        prompt="Use the docs MCP server to explain what hooks are in Claude Code",
        options=options,
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

:::

에이전트는 문서 서버에 연결하여 훅에 대한 정보를 검색하고 결과를 반환합니다.

## MCP 서버 추가

`query()`를 호출할 때 코드에서 직접 MCP 서버를 설정하거나, [`settingSources`](#설정-파일에서)를 통해 로드되는 `.mcp.json` 파일에서 설정할 수 있습니다.

### 코드에서 설정

`mcpServers` 옵션에 MCP 서버를 직접 전달합니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "List files in my project",
  options: {
    mcpServers: {
      filesystem: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
      }
    },
    allowedTools: ["mcp__filesystem__*"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def main():
    options = ClaudeAgentOptions(
        mcp_servers={
            "filesystem": {
                "command": "npx",
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-filesystem",
                    "/Users/me/projects",
                ],
            }
        },
        allowed_tools=["mcp__filesystem__*"],
    )

    async for message in query(prompt="List files in my project", options=options):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

:::

### 설정 파일에서

프로젝트 루트에 `.mcp.json` 파일을 생성합니다. SDK는 기본적으로 파일시스템 설정을 로드하지 않으므로, 파일이 인식되려면 옵션에서 `settingSources: ["project"]`(Python: `setting_sources=["project"]`)를 설정해야 합니다:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    }
  }
}
```

## MCP 도구 허용

MCP 도구는 Claude가 사용하기 전에 명시적인 권한이 필요합니다. 권한이 없으면 Claude는 도구가 사용 가능하다는 것은 알지만 호출할 수 없습니다.

### 도구 명명 규칙

MCP 도구는 `mcp__<서버이름>__<도구이름>` 형태의 명명 패턴을 따릅니다. 예를 들어, `"github"`라는 이름의 GitHub 서버에 `list_issues` 도구가 있다면 `mcp__github__list_issues`가 됩니다.

### allowedTools로 접근 허용

`allowedTools`를 사용하여 Claude가 사용할 수 있는 MCP 도구를 지정합니다:

```typescript
const _ = {
  options: {
    mcpServers: {
      // 서버 설정
    },
    allowedTools: [
      "mcp__github__*", // github 서버의 모든 도구
      "mcp__db__query", // db 서버의 query 도구만
      "mcp__slack__send_message" // slack 서버의 send_message만
    ]
  }
};
```

와일드카드(`*`)를 사용하면 각 도구를 일일이 나열하지 않고 서버의 모든 도구를 허용할 수 있습니다.

::: info
**MCP 접근에는 권한 모드보다 `allowedTools`를 사용하세요.** `permissionMode: "acceptEdits"`는 MCP 도구를 자동 승인하지 않습니다(파일 편집 및 파일시스템 Bash 명령만 자동 승인). `permissionMode: "bypassPermissions"`는 MCP 도구를 자동 승인하지만 다른 모든 안전 프롬프트도 비활성화하므로 필요 이상으로 범위가 넓습니다. `allowedTools`의 와일드카드는 원하는 MCP 서버에만 정확히 권한을 부여합니다. 전체 비교는 [권한 모드](/agent-sdk/permissions#permission-modes)를 참조하세요.
:::

### 사용 가능한 도구 확인

MCP 서버가 제공하는 도구를 확인하려면 서버 문서를 참조하거나, 서버에 연결하여 `system` init 메시지를 확인하세요:

```typescript
for await (const message of query({ prompt: "...", options })) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Available MCP tools:", message.mcp_servers);
  }
}
```

## 전송 유형

MCP 서버는 다양한 전송 프로토콜을 사용하여 에이전트와 통신합니다. 서버 문서를 확인하여 어떤 전송 방식을 지원하는지 알아보세요:

* 문서에 **실행할 명령어**가 있으면(예: `npx @modelcontextprotocol/server-github`) stdio를 사용하세요
* 문서에 **URL**이 있으면 HTTP 또는 SSE를 사용하세요
* 코드에서 직접 도구를 만든다면 SDK MCP 서버를 사용하세요

### stdio 서버

stdin/stdout을 통해 통신하는 로컬 프로세스입니다. 같은 머신에서 실행하는 MCP 서버에 사용합니다:

**코드에서 설정:**

::: code-group

```typescript [TypeScript]
const _ = {
  options: {
    mcpServers: {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN
        }
      }
    },
    allowedTools: ["mcp__github__list_issues", "mcp__github__search_issues"]
  }
};
```

```python [Python]
options = ClaudeAgentOptions(
    mcp_servers={
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]},
        }
    },
    allowed_tools=["mcp__github__list_issues", "mcp__github__search_issues"],
)
```

:::

**.mcp.json 파일:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### HTTP/SSE 서버

클라우드 호스팅 MCP 서버 및 원격 API에는 HTTP 또는 SSE를 사용합니다:

**코드에서 설정:**

::: code-group

```typescript [TypeScript]
const _ = {
  options: {
    mcpServers: {
      "remote-api": {
        type: "sse",
        url: "https://api.example.com/mcp/sse",
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`
        }
      }
    },
    allowedTools: ["mcp__remote-api__*"]
  }
};
```

```python [Python]
options = ClaudeAgentOptions(
    mcp_servers={
        "remote-api": {
            "type": "sse",
            "url": "https://api.example.com/mcp/sse",
            "headers": {"Authorization": f"Bearer {os.environ['API_TOKEN']}"},
        }
    },
    allowed_tools=["mcp__remote-api__*"],
)
```

:::

**.mcp.json 파일:**

```json
{
  "mcpServers": {
    "remote-api": {
      "type": "sse",
      "url": "https://api.example.com/mcp/sse",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

HTTP(비스트리밍)의 경우 `"type": "http"`를 사용합니다.

### SDK MCP 서버

별도의 서버 프로세스를 실행하는 대신 애플리케이션 코드에서 직접 커스텀 도구를 정의합니다. 구현 세부 사항은 [커스텀 도구 가이드](/agent-sdk/custom-tools)를 참조하세요.

## MCP 도구 검색

MCP 도구가 많이 설정된 경우 도구 정의가 컨텍스트 윈도우의 상당 부분을 차지할 수 있습니다. 도구 검색은 도구 정의를 컨텍스트에서 제외하고 각 턴에 Claude가 필요한 도구만 로드하여 이 문제를 해결합니다.

도구 검색은 기본적으로 활성화되어 있습니다. 설정 옵션 및 세부 사항은 [도구 검색](/agent-sdk/tool-search)을 참조하세요.

모범 사례 및 커스텀 SDK 도구와 함께 도구 검색을 사용하는 방법을 포함한 자세한 내용은 [도구 검색 가이드](/agent-sdk/tool-search)를 참조하세요.

## 인증

대부분의 MCP 서버는 외부 서비스에 접근하기 위해 인증이 필요합니다. 서버 설정에서 환경 변수를 통해 자격 증명을 전달합니다.

### 환경 변수로 자격 증명 전달

`env` 필드를 사용하여 API 키, 토큰 및 기타 자격 증명을 MCP 서버에 전달합니다:

**코드에서 설정:**

::: code-group

```typescript [TypeScript]
const _ = {
  options: {
    mcpServers: {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN
        }
      }
    },
    allowedTools: ["mcp__github__list_issues"]
  }
};
```

```python [Python]
options = ClaudeAgentOptions(
    mcp_servers={
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]},
        }
    },
    allowed_tools=["mcp__github__list_issues"],
)
```

:::

**.mcp.json 파일:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

`${GITHUB_TOKEN}` 구문은 런타임에 환경 변수를 확장합니다.

디버그 로깅이 포함된 완전한 작동 예제는 [저장소 이슈 목록 조회](#저장소-이슈-목록-조회)를 참조하세요.

### 원격 서버의 HTTP 헤더

HTTP 및 SSE 서버의 경우 서버 설정에 인증 헤더를 직접 전달합니다:

**코드에서 설정:**

::: code-group

```typescript [TypeScript]
const _ = {
  options: {
    mcpServers: {
      "secure-api": {
        type: "http",
        url: "https://api.example.com/mcp",
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`
        }
      }
    },
    allowedTools: ["mcp__secure-api__*"]
  }
};
```

```python [Python]
options = ClaudeAgentOptions(
    mcp_servers={
        "secure-api": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "headers": {"Authorization": f"Bearer {os.environ['API_TOKEN']}"},
        }
    },
    allowed_tools=["mcp__secure-api__*"],
)
```

:::

**.mcp.json 파일:**

```json
{
  "mcpServers": {
    "secure-api": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

`${API_TOKEN}` 구문은 런타임에 환경 변수를 확장합니다.

### OAuth2 인증

[MCP 명세는 인가를 위해 OAuth 2.1을 지원합니다](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization). SDK는 OAuth 흐름을 자동으로 처리하지 않지만, 애플리케이션에서 OAuth 흐름을 완료한 후 헤더를 통해 액세스 토큰을 전달할 수 있습니다:

::: code-group

```typescript [TypeScript]
// 앱에서 OAuth 흐름 완료 후
const accessToken = await getAccessTokenFromOAuthFlow();

const options = {
  mcpServers: {
    "oauth-api": {
      type: "http",
      url: "https://api.example.com/mcp",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  },
  allowedTools: ["mcp__oauth-api__*"]
};
```

```python [Python]
# 앱에서 OAuth 흐름 완료 후
access_token = await get_access_token_from_oauth_flow()

options = ClaudeAgentOptions(
    mcp_servers={
        "oauth-api": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "headers": {"Authorization": f"Bearer {access_token}"},
        }
    },
    allowed_tools=["mcp__oauth-api__*"],
)
```

:::

## 예제

### 저장소 이슈 목록 조회

이 예제는 [GitHub MCP 서버](https://github.com/modelcontextprotocol/servers/tree/main/src/github)에 연결하여 최근 이슈를 나열합니다. MCP 연결 및 도구 호출을 확인하기 위한 디버그 로깅이 포함되어 있습니다.

실행하기 전에 `repo` 스코프로 [GitHub 개인 액세스 토큰](https://github.com/settings/tokens)을 생성하고 환경 변수로 설정합니다:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "List the 3 most recent issues in anthropics/claude-code",
  options: {
    mcpServers: {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN
        }
      }
    },
    allowedTools: ["mcp__github__list_issues"]
  }
})) {
  // MCP 서버 연결 성공 확인
  if (message.type === "system" && message.subtype === "init") {
    console.log("MCP servers:", message.mcp_servers);
  }

  // Claude가 MCP 도구를 호출할 때 로그 출력
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "tool_use" && block.name.startsWith("mcp__")) {
        console.log("MCP tool called:", block.name);
      }
    }
  }

  // 최종 결과 출력
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

```python [Python]
import asyncio
import os
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    ResultMessage,
    SystemMessage,
    AssistantMessage,
)


async def main():
    options = ClaudeAgentOptions(
        mcp_servers={
            "github": {
                "command": "npx",
                "args": ["-y", "@modelcontextprotocol/server-github"],
                "env": {"GITHUB_TOKEN": os.environ["GITHUB_TOKEN"]},
            }
        },
        allowed_tools=["mcp__github__list_issues"],
    )

    async for message in query(
        prompt="List the 3 most recent issues in anthropics/claude-code",
        options=options,
    ):
        # MCP 서버 연결 성공 확인
        if isinstance(message, SystemMessage) and message.subtype == "init":
            print("MCP servers:", message.data.get("mcp_servers"))

        # Claude가 MCP 도구를 호출할 때 로그 출력
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if hasattr(block, "name") and block.name.startswith("mcp__"):
                    print("MCP tool called:", block.name)

        # 최종 결과 출력
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

:::

### 데이터베이스 쿼리

이 예제는 [Postgres MCP 서버](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)를 사용하여 데이터베이스를 쿼리합니다. 연결 문자열은 서버에 인수로 전달됩니다. 에이전트가 자동으로 데이터베이스 스키마를 발견하고, SQL 쿼리를 작성하여 결과를 반환합니다:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

// 환경 변수에서 연결 문자열 가져오기
const connectionString = process.env.DATABASE_URL;

for await (const message of query({
  // 자연어 쿼리 - Claude가 SQL을 작성합니다
  prompt: "How many users signed up last week? Break it down by day.",
  options: {
    mcpServers: {
      postgres: {
        command: "npx",
        // 서버에 연결 문자열을 인수로 전달
        args: ["-y", "@modelcontextprotocol/server-postgres", connectionString]
      }
    },
    // 읽기 쿼리만 허용, 쓰기 제외
    allowedTools: ["mcp__postgres__query"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
```

```python [Python]
import asyncio
import os
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def main():
    # 환경 변수에서 연결 문자열 가져오기
    connection_string = os.environ["DATABASE_URL"]

    options = ClaudeAgentOptions(
        mcp_servers={
            "postgres": {
                "command": "npx",
                # 서버에 연결 문자열을 인수로 전달
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-postgres",
                    connection_string,
                ],
            }
        },
        # 읽기 쿼리만 허용, 쓰기 제외
        allowed_tools=["mcp__postgres__query"],
    )

    # 자연어 쿼리 - Claude가 SQL을 작성합니다
    async for message in query(
        prompt="How many users signed up last week? Break it down by day.",
        options=options,
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

:::

## 오류 처리

MCP 서버는 다양한 이유로 연결에 실패할 수 있습니다: 서버 프로세스가 설치되지 않았거나, 자격 증명이 유효하지 않거나, 원격 서버에 연결할 수 없는 경우가 있습니다.

SDK는 각 쿼리 시작 시 `init` 서브타입의 `system` 메시지를 발생시킵니다. 이 메시지에는 각 MCP 서버의 연결 상태가 포함됩니다. 에이전트가 작업을 시작하기 전에 `status` 필드를 확인하여 연결 실패를 감지하세요:

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Process data",
  options: {
    mcpServers: {
      "data-processor": dataServer
    }
  }
})) {
  if (message.type === "system" && message.subtype === "init") {
    const failedServers = message.mcp_servers.filter((s) => s.status !== "connected");

    if (failedServers.length > 0) {
      console.warn("Failed to connect:", failedServers);
    }
  }

  if (message.type === "result" && message.subtype === "error_during_execution") {
    console.error("Execution failed");
  }
}
```

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage, ResultMessage


async def main():
    options = ClaudeAgentOptions(mcp_servers={"data-processor": data_server})

    async for message in query(prompt="Process data", options=options):
        if isinstance(message, SystemMessage) and message.subtype == "init":
            failed_servers = [
                s
                for s in message.data.get("mcp_servers", [])
                if s.get("status") != "connected"
            ]

            if failed_servers:
                print(f"Failed to connect: {failed_servers}")

        if (
            isinstance(message, ResultMessage)
            and message.subtype == "error_during_execution"
        ):
            print("Execution failed")


asyncio.run(main())
```

:::

## 문제 해결

### 서버가 "failed" 상태로 표시되는 경우

`init` 메시지를 확인하여 어떤 서버가 연결에 실패했는지 확인합니다:

```typescript
if (message.type === "system" && message.subtype === "init") {
  for (const server of message.mcp_servers) {
    if (server.status === "failed") {
      console.error(`Server ${server.name} failed to connect`);
    }
  }
}
```

일반적인 원인:

* **누락된 환경 변수**: 필요한 토큰과 자격 증명이 설정되어 있는지 확인하세요. stdio 서버의 경우 `env` 필드가 서버가 기대하는 것과 일치하는지 확인하세요.
* **서버 미설치**: `npx` 명령의 경우 패키지가 존재하고 Node.js가 PATH에 있는지 확인하세요.
* **유효하지 않은 연결 문자열**: 데이터베이스 서버의 경우 연결 문자열 형식과 데이터베이스에 접근 가능한지 확인하세요.
* **네트워크 문제**: 원격 HTTP/SSE 서버의 경우 URL에 접근 가능하고 방화벽이 연결을 허용하는지 확인하세요.

### 도구가 호출되지 않는 경우

Claude가 도구를 볼 수 있지만 사용하지 않는다면 `allowedTools`로 권한을 부여했는지 확인하세요:

```typescript
const _ = {
  options: {
    mcpServers: {
      // 서버 설정
    },
    allowedTools: ["mcp__servername__*"] // Claude가 도구를 사용하려면 필수
  }
};
```

### 연결 타임아웃

MCP SDK는 서버 연결에 기본적으로 60초 타임아웃을 적용합니다. 서버 시작에 더 오랜 시간이 걸리면 연결이 실패합니다. 시작 시간이 더 필요한 서버의 경우 다음을 고려하세요:

* 가능하다면 더 가벼운 서버 사용
* 에이전트 시작 전에 서버 미리 준비
* 서버 로그에서 느린 초기화 원인 확인

## 관련 리소스

* **[커스텀 도구 가이드](/agent-sdk/custom-tools)**: SDK 애플리케이션과 함께 인프로세스로 실행되는 자체 MCP 서버 구축
* **[권한](/agent-sdk/permissions)**: `allowedTools` 및 `disallowedTools`로 에이전트가 사용할 수 있는 MCP 도구 제어
* **[TypeScript SDK 레퍼런스](/agent-sdk/typescript)**: MCP 설정 옵션을 포함한 전체 API 레퍼런스
* **[Python SDK 레퍼런스](/agent-sdk/python)**: MCP 설정 옵션을 포함한 전체 API 레퍼런스
* **[MCP 서버 디렉토리](https://github.com/modelcontextprotocol/servers)**: 데이터베이스, API 등을 위한 사용 가능한 MCP 서버 탐색
