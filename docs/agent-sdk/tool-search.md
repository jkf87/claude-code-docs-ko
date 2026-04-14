---
title: 툴 검색으로 대규모 도구 운용
description: 필요한 툴만 동적으로 검색·로드하여 에이전트가 수천 개의 툴을 처리할 수 있도록 확장합니다.
---

# 툴 검색으로 대규모 도구 운용

> 필요한 툴만 온디맨드로 검색·로드하여 수천 개의 툴까지 에이전트를 확장하세요.

툴 검색(tool search)은 에이전트가 수백~수천 개의 툴을 동적으로 검색하고 필요할 때만 로드하는 방식으로 대규모 도구 환경에서 동작할 수 있게 합니다. 모든 툴 정의를 컨텍스트 윈도우에 미리 올려두는 대신, 에이전트가 툴 카탈로그를 검색하여 실제로 필요한 툴만 로드합니다.

이 방식은 툴 라이브러리가 커질수록 두 가지 문제를 해결합니다.

* **컨텍스트 효율성:** 툴 정의는 컨텍스트 윈도우의 상당 부분을 차지합니다(툴 50개가 10~20K 토큰을 소비할 수 있음). 미리 로드할수록 실제 작업에 사용할 공간이 줄어듭니다.
* **툴 선택 정확도:** 한 번에 30~50개 이상의 툴이 로드되면 툴 선택 정확도가 떨어집니다.

툴 검색은 기본적으로 활성화되어 있습니다. 이 페이지에서는 [작동 방식](#툴-검색-작동-방식), [설정 방법](#툴-검색-설정), [툴 발견 최적화](#툴-발견-최적화)를 다룹니다.

## 툴 검색 작동 방식

툴 검색이 활성화되면 툴 정의는 컨텍스트 윈도우에서 제외됩니다. 에이전트는 사용 가능한 툴의 요약 정보를 받고, 현재 로드된 툴로는 처리할 수 없는 기능이 필요할 때 관련 툴을 검색합니다. 가장 관련성 높은 툴 3~5개가 컨텍스트에 로드되며, 이후 대화에서도 계속 사용할 수 있습니다. 대화가 길어져 SDK가 이전 메시지를 압축하여 공간을 확보할 경우, 이미 발견된 툴이 제거될 수 있고 에이전트는 필요에 따라 다시 검색합니다.

툴 검색은 Claude가 처음 툴을 발견할 때 검색 단계에서 한 번의 추가 왕복이 발생하지만, 대규모 툴 세트에서는 매 턴마다 컨텍스트가 작아지는 이점으로 상쇄됩니다. 툴이 약 10개 미만이라면 모두 미리 로드하는 것이 일반적으로 더 빠릅니다.

기반 API 메커니즘에 대한 자세한 내용은 [API의 툴 검색](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)을 참고하세요.

::: info
툴 검색은 Claude Sonnet 4 이상 또는 Claude Opus 4 이상이 필요합니다. Haiku 모델은 툴 검색을 지원하지 않습니다.
:::

## 툴 검색 설정

기본적으로 툴 검색은 항상 활성화되어 있습니다. `ENABLE_TOOL_SEARCH` 환경 변수로 동작을 변경할 수 있습니다.

| 값       | 동작                                                                                                                                                                              |
| :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (미설정) | 툴 검색이 항상 활성화됩니다. 툴 정의는 컨텍스트에 로드되지 않습니다. 기본값입니다.                                                                                               |
| `true`   | 미설정과 동일합니다.                                                                                                                                                              |
| `auto`   | 모든 툴 정의의 합산 토큰 수를 모델 컨텍스트 윈도우와 비교합니다. 10%를 초과하면 툴 검색이 활성화되고, 10% 미만이면 모든 툴이 정상적으로 컨텍스트에 로드됩니다.                   |
| `auto:N` | `auto`와 동일하지만 기준 비율을 직접 지정합니다. `auto:5`는 툴 정의가 컨텍스트 윈도우의 5%를 초과할 때 활성화됩니다. 값이 낮을수록 더 일찍 활성화됩니다.                         |
| `false`  | 툴 검색이 비활성화됩니다. 모든 툴 정의가 매 턴마다 컨텍스트에 로드됩니다.                                                                                                        |

툴 검색은 리모트 MCP 서버나 [커스텀 SDK MCP 서버](/agent-sdk/custom-tools)에서 등록된 모든 툴에 적용됩니다. `auto` 사용 시 임계값은 모든 서버에 걸친 툴 정의의 합산 크기를 기준으로 합니다.

`query()`의 `env` 옵션에 값을 설정합니다. 아래 예시는 많은 툴을 제공하는 리모트 MCP 서버에 연결하고, 와일드카드로 모든 툴을 사전 승인하며, `auto:5`를 사용해 툴 정의가 컨텍스트 윈도우의 5%를 초과하면 툴 검색이 활성화됩니다.

::: code-group

```typescript [TypeScript]
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and run the appropriate database query",
  options: {
    mcpServers: {
      "enterprise-tools": {
        // Connect to a remote MCP server
        type: "http",
        url: "https://tools.example.com/mcp"
      }
    },
    allowedTools: ["mcp__enterprise-tools__*"], // Wildcard pre-approves all tools from this server
    env: {
      ENABLE_TOOL_SEARCH: "auto:5" // Activate tool search when tools exceed 5% of context
    }
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
            "enterprise-tools": {
                "type": "http",
                "url": "https://tools.example.com/mcp",
            }
        },
        allowed_tools=[
            "mcp__enterprise-tools__*"
        ],  # Wildcard pre-approves all tools from this server
        env={
            "ENABLE_TOOL_SEARCH": "auto:5"  # Activate tool search when tools exceed 5% of context
        },
    )

    async for message in query(
        prompt="Find and run the appropriate database query",
        options=options,
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)


asyncio.run(main())
```

:::

`ENABLE_TOOL_SEARCH`를 `"false"`로 설정하면 툴 검색이 비활성화되고, 모든 툴 정의가 매 턴마다 컨텍스트에 로드됩니다. 검색 왕복이 없어지므로 툴 세트가 작고(약 10개 미만) 정의가 컨텍스트 윈도우에 충분히 들어가는 경우 더 빠를 수 있습니다.

## 툴 발견 최적화

검색 메커니즘은 쿼리를 툴 이름과 설명에 매칭합니다. `query_slack`보다 `search_slack_messages` 같은 이름이 더 다양한 요청에 노출됩니다. "Query Slack"처럼 일반적인 설명보다 "Search Slack messages by keyword, channel, or date range"처럼 구체적인 키워드가 포함된 설명이 더 많은 쿼리에 매칭됩니다.

시스템 프롬프트에 사용 가능한 툴 카테고리 목록을 추가하는 것도 효과적입니다. 이를 통해 에이전트가 어떤 종류의 툴을 검색할 수 있는지 파악할 수 있습니다.

```text
You can search for tools to interact with Slack, GitHub, and Jira.
```

## 제한 사항

* **최대 툴 수:** 카탈로그에 최대 10,000개의 툴
* **검색 결과:** 검색당 가장 관련성 높은 툴 3~5개 반환
* **지원 모델:** Claude Sonnet 4 이상, Claude Opus 4 이상 (Haiku 미지원)

## 관련 문서

* [API의 툴 검색](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool): 커스텀 구현을 포함한 툴 검색 전체 API 문서
* [MCP 서버 연결](/agent-sdk/mcp): MCP 서버를 통한 외부 툴 연결
* [커스텀 툴](/agent-sdk/custom-tools): SDK MCP 서버로 자체 툴 구축
* [TypeScript SDK 레퍼런스](/agent-sdk/typescript): 전체 API 레퍼런스
* [Python SDK 레퍼런스](/agent-sdk/python): 전체 API 레퍼런스
