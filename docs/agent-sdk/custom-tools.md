---
title: Claude에 커스텀 도구 제공하기
description: Claude Agent SDK의 인-프로세스 MCP 서버로 커스텀 도구를 정의하여 Claude가 함수를 호출하고, API를 사용하며, 도메인별 작업을 수행할 수 있도록 합니다.
---

# Claude에 커스텀 도구 제공하기

> Claude Agent SDK의 인-프로세스 MCP 서버로 커스텀 도구를 정의하여 Claude가 함수를 호출하고, API를 사용하며, 도메인별 작업을 수행할 수 있도록 합니다.

커스텀 도구는 Agent SDK를 확장하여 대화 중에 Claude가 호출할 수 있는 함수를 직접 정의할 수 있게 해줍니다. SDK의 인-프로세스 MCP 서버를 통해 Claude에게 데이터베이스, 외부 API, 도메인 특화 로직, 또는 애플리케이션에 필요한 기타 기능에 대한 접근 권한을 부여할 수 있습니다.

이 가이드에서는 입력 스키마와 핸들러로 도구를 정의하는 방법, MCP 서버에 묶는 방법, `query`에 전달하는 방법, 그리고 Claude가 접근할 수 있는 도구를 제어하는 방법을 다룹니다. 오류 처리, 도구 어노테이션, 이미지와 같은 비텍스트 콘텐츠 반환도 함께 설명합니다.

## 빠른 참조

| 목표                                          | 방법                                                                                                                                                                                                       |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 도구 정의                                | Python의 [`@tool`](/agent-sdk/python#tool) 또는 TypeScript의 [`tool()`](/agent-sdk/typescript#tool)을 이름, 설명, 스키마, 핸들러와 함께 사용합니다. [커스텀 도구 생성](#커스텀-도구-생성) 참조. |
| Claude에 도구 등록                  | `create_sdk_mcp_server` / `createSdkMcpServer`로 래핑하고 `query()`의 `mcpServers`에 전달합니다. [커스텀 도구 호출](#커스텀-도구-호출) 참조.                                                                  |
| 도구 사전 승인                           | 허용된 도구 목록에 추가합니다. [허용 도구 설정](#허용-도구-설정) 참조.                                                                                                                                           |
| Claude 컨텍스트에서 내장 도구 제거 | 원하는 내장 도구만 나열한 `tools` 배열을 전달합니다. [허용 도구 설정](#허용-도구-설정) 참조.                                                                                                            |
| Claude의 병렬 도구 호출 허용            | 사이드 이펙트가 없는 도구에 `readOnlyHint: true`를 설정합니다. [도구 어노테이션 추가](#도구-어노테이션-추가) 참조.                                                                                                    |
| 루프를 멈추지 않고 오류 처리      | throw 대신 `isError: true`를 반환합니다. [오류 처리](#오류-처리) 참조.                                                                                                                              |
| 이미지 또는 파일 반환                       | content 배열에 `image` 또는 `resource` 블록을 사용합니다. [이미지와 리소스 반환](#이미지와-리소스-반환) 참조.                                                                                       |
| 많은 도구로 확장                          | [도구 검색](/agent-sdk/tool-search)을 사용하여 필요 시 도구를 로드합니다.                                                                                                                         |

## 커스텀 도구 생성

도구는 네 가지 요소로 정의됩니다. TypeScript의 [`tool()`](/agent-sdk/typescript#tool) 헬퍼나 Python의 [`@tool`](/agent-sdk/python#tool) 데코레이터에 인수로 전달합니다:

* **이름(Name):** Claude가 도구를 호출할 때 사용하는 고유 식별자.
* **설명(Description):** 도구가 수행하는 작업. Claude가 도구를 언제 호출할지 결정할 때 읽습니다.
* **입력 스키마(Input schema):** Claude가 반드시 제공해야 하는 인수. TypeScript에서는 항상 [Zod 스키마](https://zod.dev/)이며, 핸들러의 `args`는 이로부터 자동으로 타입이 지정됩니다. Python에서는 `{"latitude": float}`처럼 이름을 타입에 매핑하는 딕셔너리이며, SDK가 이를 JSON Schema로 변환해줍니다. Python 데코레이터는 열거형, 범위, 선택 필드, 중첩 객체가 필요한 경우 완전한 [JSON Schema](https://json-schema.org/understanding-json-schema/about) 딕셔너리도 직접 받을 수 있습니다.
* **핸들러(Handler):** Claude가 도구를 호출할 때 실행되는 비동기 함수. 검증된 인수를 받고 다음을 포함하는 객체를 반환해야 합니다:
  * `content` (필수): 결과 블록의 배열. 각 블록의 `type`은 `"text"`, `"image"`, `"resource"` 중 하나입니다. 비텍스트 블록은 [이미지와 리소스 반환](#이미지와-리소스-반환) 참조.
  * `isError` (선택): 도구 실패를 Claude에게 알려 반응할 수 있도록 `true`로 설정합니다. [오류 처리](#오류-처리) 참조.

도구를 정의한 후, TypeScript의 [`createSdkMcpServer`](/agent-sdk/typescript#create-sdk-mcp-server) 또는 Python의 [`create_sdk_mcp_server`](/agent-sdk/python#create-sdk-mcp-server)로 서버에 래핑합니다. 서버는 별도의 프로세스가 아닌 애플리케이션 내부에서 인-프로세스로 실행됩니다.

### 날씨 도구 예제

이 예제는 `get_temperature` 도구를 정의하고 MCP 서버에 래핑합니다. 도구 설정만 다루며, `query`에 전달하여 실행하는 방법은 아래 [커스텀 도구 호출](#커스텀-도구-호출)을 참조하세요.

::: code-group
  ```python Python
  from typing import Any
  import httpx
  from claude_agent_sdk import tool, create_sdk_mcp_server


  # 도구 정의: 이름, 설명, 입력 스키마, 핸들러
  @tool(
      "get_temperature",
      "Get the current temperature at a location",
      {"latitude": float, "longitude": float},
  )
  async def get_temperature(args: dict[str, Any]) -> dict[str, Any]:
      async with httpx.AsyncClient() as client:
          response = await client.get(
              "https://api.open-meteo.com/v1/forecast",
              params={
                  "latitude": args["latitude"],
                  "longitude": args["longitude"],
                  "current": "temperature_2m",
                  "temperature_unit": "fahrenheit",
              },
          )
          data = response.json()

      # content 배열 반환 - Claude는 이를 도구 결과로 봅니다
      return {
          "content": [
              {
                  "type": "text",
                  "text": f"Temperature: {data['current']['temperature_2m']}°F",
              }
          ]
      }


  # 인-프로세스 MCP 서버에 도구 래핑
  weather_server = create_sdk_mcp_server(
      name="weather",
      version="1.0.0",
      tools=[get_temperature],
  )
  ```

  ```typescript TypeScript
  import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
  import { z } from "zod";

  // 도구 정의: 이름, 설명, 입력 스키마, 핸들러
  const getTemperature = tool(
    "get_temperature",
    "Get the current temperature at a location",
    {
      latitude: z.number().describe("Latitude coordinate"), // .describe()로 Claude가 보는 필드 설명 추가
      longitude: z.number().describe("Longitude coordinate")
    },
    async (args) => {
      // args는 스키마로부터 타입이 지정됨: { latitude: number; longitude: number }
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current=temperature_2m&temperature_unit=fahrenheit`
      );
      const data: any = await response.json();

      // content 배열 반환 - Claude는 이를 도구 결과로 봅니다
      return {
        content: [{ type: "text", text: `Temperature: ${data.current.temperature_2m}°F` }]
      };
    }
  );

  // 인-프로세스 MCP 서버에 도구 래핑
  const weatherServer = createSdkMcpServer({
    name: "weather",
    version: "1.0.0",
    tools: [getTemperature]
  });
  ```
:::

전체 파라미터 상세 내용(JSON Schema 입력 형식, 반환값 구조 포함)은 TypeScript의 [`tool()`](/agent-sdk/typescript#tool) 참조 또는 Python의 [`@tool`](/agent-sdk/python#tool) 참조를 확인하세요.

::: tip
파라미터를 선택적으로 만들려면: TypeScript에서는 Zod 필드에 `.default()`를 추가합니다. Python에서는 딕셔너리 스키마가 모든 키를 필수로 처리하므로, 스키마에서 파라미터를 제외하고 설명 문자열에 언급한 뒤 핸들러에서 `args.get()`으로 읽습니다. [아래의 `get_precipitation_chance` 도구](#도구-추가)에서 두 패턴을 모두 확인할 수 있습니다.
:::

### 커스텀 도구 호출

`mcpServers` 옵션을 통해 생성한 MCP 서버를 `query`에 전달합니다. `mcpServers`의 키는 각 도구의 완전한 이름에서 `{server_name}` 세그먼트가 됩니다: `mcp__{server_name}__{tool_name}`. 도구가 권한 프롬프트 없이 실행되도록 해당 이름을 `allowedTools`에 나열합니다.

아래 코드는 [위 예제](#날씨-도구-예제)의 `weatherServer`를 재사용하여 Claude에게 특정 위치의 날씨를 묻습니다.

::: code-group
  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  async def main():
      options = ClaudeAgentOptions(
          mcp_servers={"weather": weather_server},
          allowed_tools=["mcp__weather__get_temperature"],
      )

      async for message in query(
          prompt="What's the temperature in San Francisco?",
          options=options,
      ):
          # ResultMessage는 모든 도구 호출이 완료된 후의 최종 메시지입니다
          if isinstance(message, ResultMessage) and message.subtype == "success":
              print(message.result)


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "What's the temperature in San Francisco?",
    options: {
      mcpServers: { weather: weatherServer },
      allowedTools: ["mcp__weather__get_temperature"]
    }
  })) {
    // "result"는 모든 도구 호출이 완료된 후의 최종 메시지입니다
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
  ```
:::

### 도구 추가

서버는 `tools` 배열에 나열된 만큼 많은 도구를 보유할 수 있습니다. 서버에 도구가 여러 개인 경우, `allowedTools`에 각각 개별적으로 나열하거나 와일드카드 `mcp__weather__*`를 사용하여 서버가 노출하는 모든 도구를 한번에 허용할 수 있습니다.

아래 예제는 [날씨 도구 예제](#날씨-도구-예제)의 `weatherServer`에 두 번째 도구 `get_precipitation_chance`를 추가하고 두 도구를 배열에 포함하여 서버를 재구성합니다.

::: code-group
  ```python Python
  # 동일한 서버를 위한 두 번째 도구 정의
  @tool(
      "get_precipitation_chance",
      "Get the hourly precipitation probability for a location. "
      "Optionally pass 'hours' (1-24) to control how many hours to return.",
      {"latitude": float, "longitude": float},
  )
  async def get_precipitation_chance(args: dict[str, Any]) -> dict[str, Any]:
      # 'hours'는 스키마에 없음 - .get()으로 읽어 선택적으로 만듦
      hours = args.get("hours", 12)
      async with httpx.AsyncClient() as client:
          response = await client.get(
              "https://api.open-meteo.com/v1/forecast",
              params={
                  "latitude": args["latitude"],
                  "longitude": args["longitude"],
                  "hourly": "precipitation_probability",
                  "forecast_days": 1,
              },
          )
          data = response.json()
      chances = data["hourly"]["precipitation_probability"][:hours]

      return {
          "content": [
              {
                  "type": "text",
                  "text": f"Next {hours} hours: {'%, '.join(map(str, chances))}%",
              }
          ]
      }


  # 두 도구를 배열에 포함하여 서버 재구성
  weather_server = create_sdk_mcp_server(
      name="weather",
      version="1.0.0",
      tools=[get_temperature, get_precipitation_chance],
  )
  ```

  ```typescript TypeScript
  // 동일한 서버를 위한 두 번째 도구 정의
  const getPrecipitationChance = tool(
    "get_precipitation_chance",
    "Get the hourly precipitation probability for a location",
    {
      latitude: z.number(),
      longitude: z.number(),
      hours: z
        .number()
        .int()
        .min(1)
        .max(24)
        .default(12) // .default()로 파라미터를 선택적으로 만듦
        .describe("How many hours of forecast to return")
    },
    async (args) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&hourly=precipitation_probability&forecast_days=1`
      );
      const data: any = await response.json();
      const chances = data.hourly.precipitation_probability.slice(0, args.hours);

      return {
        content: [{ type: "text", text: `Next ${args.hours} hours: ${chances.join("%, ")}%` }]
      };
    }
  );

  // 두 도구를 배열에 포함하여 서버 재구성
  const weatherServer = createSdkMcpServer({
    name: "weather",
    version: "1.0.0",
    tools: [getTemperature, getPrecipitationChance]
  });
  ```
:::

이 배열의 모든 도구는 매 턴마다 컨텍스트 윈도우 공간을 소비합니다. 도구를 수십 개 정의하는 경우, 필요할 때 로드하는 [도구 검색](/agent-sdk/tool-search)을 참조하세요.

### 도구 어노테이션 추가

[도구 어노테이션](https://modelcontextprotocol.io/docs/concepts/tools#tool-annotations)은 도구 동작 방식을 설명하는 선택적 메타데이터입니다. TypeScript의 `tool()` 헬퍼에서는 다섯 번째 인수로, Python의 `@tool` 데코레이터에서는 `annotations` 키워드 인수로 전달합니다. 모든 힌트 필드는 Boolean 타입입니다.

| 필드             | 기본값 | 의미                                                                                                               |
| :---------------- | :------ | :-------------------------------------------------------------------------------------------------------------------- |
| `readOnlyHint`    | `false` | 도구가 환경을 수정하지 않습니다. 다른 읽기 전용 도구와 병렬로 호출될 수 있는지를 제어합니다. |
| `destructiveHint` | `true`  | 도구가 파괴적인 업데이트를 수행할 수 있습니다. 정보 제공용입니다.                                                             |
| `idempotentHint`  | `false` | 동일한 인수로 반복 호출해도 추가적인 효과가 없습니다. 정보 제공용입니다.                                 |
| `openWorldHint`   | `true`  | 도구가 프로세스 외부 시스템에 접근합니다. 정보 제공용입니다.                                                        |

어노테이션은 메타데이터이지 강제 사항이 아닙니다. `readOnlyHint: true`로 표시된 도구도 핸들러가 그렇게 동작한다면 디스크에 쓸 수 있습니다. 어노테이션은 핸들러의 실제 동작과 일치하게 유지하세요.

이 예제는 [날씨 도구 예제](#날씨-도구-예제)의 `get_temperature` 도구에 `readOnlyHint`를 추가합니다.

::: code-group
  ```python Python
  from claude_agent_sdk import tool, ToolAnnotations


  @tool(
      "get_temperature",
      "Get the current temperature at a location",
      {"latitude": float, "longitude": float},
      annotations=ToolAnnotations(
          readOnlyHint=True
      ),  # Claude가 다른 읽기 전용 호출과 함께 배치할 수 있게 합니다
  )
  async def get_temperature(args):
      return {"content": [{"type": "text", "text": "..."}]}
  ```

  ```typescript TypeScript
  tool(
    "get_temperature",
    "Get the current temperature at a location",
    { latitude: z.number(), longitude: z.number() },
    async (args) => ({ content: [{ type: "text", text: `...` }] }),
    { annotations: { readOnlyHint: true } } // Claude가 다른 읽기 전용 호출과 함께 배치할 수 있게 합니다
  );
  ```
:::

[TypeScript](/agent-sdk/typescript#tool-annotations) 또는 [Python](/agent-sdk/python#tool-annotations) 참조에서 `ToolAnnotations`를 확인하세요.

## 도구 접근 제어

[날씨 도구 예제](#날씨-도구-예제)에서는 서버를 등록하고 `allowedTools`에 도구를 나열했습니다. 이 섹션에서는 도구 이름이 어떻게 구성되는지, 그리고 도구가 여러 개이거나 내장 도구를 제한하려 할 때 접근 범위를 어떻게 설정하는지 설명합니다.

### 도구 이름 형식

MCP 도구가 Claude에 노출될 때 이름은 특정 형식을 따릅니다:

* 패턴: `mcp__{server_name}__{tool_name}`
* 예시: 서버 `weather`의 `get_temperature` 도구는 `mcp__weather__get_temperature`가 됩니다

### 허용 도구 설정

`tools` 옵션과 허용/거부 목록은 별도의 레이어에서 작동합니다. `tools`는 Claude의 컨텍스트에 나타나는 내장 도구를 제어합니다. 허용 및 거부 도구 목록은 Claude가 도구를 호출하려 할 때 승인 또는 거부 여부를 제어합니다.

| 옵션                    | 레이어        | 효과                                                                                                                                            |
| :------------------------ | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tools: ["Read", "Grep"]` | 가용성 | 나열된 내장 도구만 Claude 컨텍스트에 있습니다. 나열되지 않은 내장 도구는 제거됩니다. MCP 도구는 영향받지 않습니다.                                      |
| `tools: []`               | 가용성 | 모든 내장 도구가 제거됩니다. Claude는 MCP 도구만 사용할 수 있습니다.                                                                                    |
| 허용 도구             | 권한   | 나열된 도구는 권한 프롬프트 없이 실행됩니다. 나열되지 않은 도구는 여전히 사용 가능하며, 호출은 [권한 흐름](/agent-sdk/permissions)을 거칩니다. |
| 거부 도구          | 권한   | 나열된 도구에 대한 모든 호출이 거부됩니다. 도구는 Claude 컨텍스트에 남아 있으므로 Claude가 호출을 시도했다가 거부될 수 있습니다.            |

Claude가 사용할 수 있는 내장 도구를 제한하려면 거부 도구 목록보다 `tools`를 사용하는 것이 좋습니다. `tools`에서 도구를 제외하면 컨텍스트에서 제거되어 Claude가 시도하지 않습니다. `disallowedTools`(Python: `disallowed_tools`)에 나열하면 호출은 차단되지만 도구가 여전히 보이므로 Claude가 시도하다가 실패하는 턴을 낭비할 수 있습니다. 전체 평가 순서는 [권한 설정](/agent-sdk/permissions)을 참조하세요.

## 오류 처리

핸들러가 오류를 보고하는 방식에 따라 에이전트 루프가 계속될지 중단될지가 결정됩니다:

| 상황                                                                                     | 결과                                                                                                           |
| :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| 핸들러가 잡히지 않은 예외를 throw                                                             | 에이전트 루프 중단. Claude는 오류를 볼 수 없으며 `query` 호출이 실패합니다.                                       |
| 핸들러가 오류를 잡고 `isError: true` (TS) / `"is_error": True` (Python) 반환 | 에이전트 루프 계속. Claude는 오류를 데이터로 보고 재시도하거나, 다른 도구를 시도하거나, 실패를 설명할 수 있습니다. |

아래 예제는 throw하는 대신 핸들러 내부에서 두 종류의 실패를 잡습니다. 200이 아닌 HTTP 상태는 응답에서 잡아서 오류 결과로 반환됩니다. 네트워크 오류나 잘못된 JSON은 주변의 `try/except` (Python) 또는 `try/catch` (TypeScript)로 잡혀 역시 오류 결과로 반환됩니다. 두 경우 모두 핸들러는 정상적으로 반환되고 에이전트 루프는 계속됩니다.

::: code-group
  ```python Python
  import json
  import httpx
  from typing import Any


  @tool(
      "fetch_data",
      "Fetch data from an API",
      {"endpoint": str},  # 간단한 스키마
  )
  async def fetch_data(args: dict[str, Any]) -> dict[str, Any]:
      try:
          async with httpx.AsyncClient() as client:
              response = await client.get(args["endpoint"])
              if response.status_code != 200:
                  # 실패를 도구 결과로 반환하여 Claude가 반응할 수 있게 합니다.
                  # is_error는 이것이 이상한 데이터가 아닌 실패한 호출임을 표시합니다.
                  return {
                      "content": [
                          {
                              "type": "text",
                              "text": f"API error: {response.status_code} {response.reason_phrase}",
                          }
                      ],
                      "is_error": True,
                  }

              data = response.json()
              return {"content": [{"type": "text", "text": json.dumps(data, indent=2)}]}
      except Exception as e:
          # 여기서 잡으면 에이전트 루프가 살아있게 됩니다. 잡히지 않은 예외는
          # 전체 query() 호출을 종료시킵니다.
          return {
              "content": [{"type": "text", "text": f"Failed to fetch data: {str(e)}"}],
              "is_error": True,
          }
  ```

  ```typescript TypeScript
  tool(
    "fetch_data",
    "Fetch data from an API",
    {
      endpoint: z.string().url().describe("API endpoint URL")
    },
    async (args) => {
      try {
        const response = await fetch(args.endpoint);

        if (!response.ok) {
          // 실패를 도구 결과로 반환하여 Claude가 반응할 수 있게 합니다.
          // isError는 이것이 이상한 데이터가 아닌 실패한 호출임을 표시합니다.
          return {
            content: [
              {
                type: "text",
                text: `API error: ${response.status} ${response.statusText}`
              }
            ],
            isError: true
          };
        }

        const data = await response.json();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        // 여기서 잡으면 에이전트 루프가 살아있게 됩니다. 잡히지 않은 throw는
        // 전체 query() 호출을 종료시킵니다.
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
  ```
:::

## 이미지와 리소스 반환

도구 결과의 `content` 배열은 `text`, `image`, `resource` 블록을 허용합니다. 동일한 응답에서 혼합하여 사용할 수 있습니다.

### 이미지

이미지 블록은 이미지 바이트를 base64로 인코딩하여 인라인으로 전달합니다. URL 필드는 없습니다. URL에 있는 이미지를 반환하려면 핸들러에서 이미지를 가져와 응답 바이트를 읽고 base64로 인코딩한 후 반환합니다. 결과는 시각적 입력으로 처리됩니다.

| 필드      | 타입      | 참고                                                                      |
| :--------- | :-------- | :------------------------------------------------------------------------- |
| `type`     | `"image"` |                                                                            |
| `data`     | `string`  | Base64 인코딩된 바이트. 순수 base64만 허용, `data:image/...;base64,` 접두사 없음  |
| `mimeType` | `string`  | 필수. 예: `image/png`, `image/jpeg`, `image/webp`, `image/gif` |

::: code-group
  ```python Python
  import base64
  import httpx


  # URL에서 이미지를 가져와 Claude에 반환하는 도구 정의
  @tool("fetch_image", "Fetch an image from a URL and return it to Claude", {"url": str})
  async def fetch_image(args):
      async with httpx.AsyncClient() as client:  # 이미지 바이트 가져오기
          response = await client.get(args["url"])

      return {
          "content": [
              {
                  "type": "image",
                  "data": base64.b64encode(response.content).decode(
                      "ascii"
                  ),  # 원시 바이트를 Base64 인코딩
                  "mimeType": response.headers.get(
                      "content-type", "image/png"
                  ),  # 응답에서 MIME 타입 읽기
              }
          ]
      }
  ```

  ```typescript TypeScript
  tool(
    "fetch_image",
    "Fetch an image from a URL and return it to Claude",
    {
      url: z.string().url()
    },
    async (args) => {
      const response = await fetch(args.url); // 이미지 바이트 가져오기
      const buffer = Buffer.from(await response.arrayBuffer()); // base64 인코딩을 위해 Buffer로 읽기
      const mimeType = response.headers.get("content-type") ?? "image/png";

      return {
        content: [
          {
            type: "image",
            data: buffer.toString("base64"), // 원시 바이트를 Base64 인코딩
            mimeType
          }
        ]
      };
    }
  );
  ```
:::

### 리소스

리소스 블록은 URI로 식별되는 콘텐츠를 포함합니다. URI는 Claude가 참조하는 레이블이며 실제 콘텐츠는 블록의 `text` 또는 `blob` 필드에 있습니다. 생성된 파일이나 외부 시스템의 레코드처럼 나중에 이름으로 참조할 때 의미 있는 경우에 사용합니다.

| 필드               | 타입         | 참고                                                       |
| :------------------ | :----------- | :---------------------------------------------------------- |
| `type`              | `"resource"` |                                                             |
| `resource.uri`      | `string`     | 콘텐츠 식별자. 모든 URI 스킴 허용                  |
| `resource.text`     | `string`     | 텍스트인 경우 콘텐츠. `blob`과 함께 제공하지 않습니다 |
| `resource.blob`     | `string`     | 바이너리인 경우 base64 인코딩된 콘텐츠                  |
| `resource.mimeType` | `string`     | 선택 사항                                                    |

이 예제는 도구 핸들러 내부에서 반환되는 resource 블록을 보여줍니다. URI `file:///tmp/report.md`는 Claude가 나중에 참조할 수 있는 레이블이며, SDK는 해당 경로를 읽지 않습니다.

::: code-group
  ```typescript TypeScript
  return {
    content: [
      {
        type: "resource",
        resource: {
          uri: "file:///tmp/report.md", // Claude가 참조할 레이블, SDK가 읽는 경로가 아님
          mimeType: "text/markdown",
          text: "# Report\n..." // 실제 콘텐츠, 인라인
        }
      }
    ]
  };
  ```

  ```python Python
  return {
      "content": [
          {
              "type": "resource",
              "resource": {
                  "uri": "file:///tmp/report.md",  # Claude가 참조할 레이블, SDK가 읽는 경로가 아님
                  "mimeType": "text/markdown",
                  "text": "# Report\n...",  # 실제 콘텐츠, 인라인
              },
          }
      ]
  }
  ```
:::

이 블록 형태는 MCP `CallToolResult` 타입에서 가져옵니다. 전체 정의는 [MCP 사양](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result)을 참조하세요.

## 예제: 단위 변환기

이 도구는 길이, 온도, 무게 단위 간의 값을 변환합니다. 사용자가 "100킬로미터를 마일로 변환해줘" 또는 "72°F는 섭씨로 얼마야?"라고 묻으면 Claude가 요청에서 올바른 단위 타입과 단위를 선택합니다.

두 가지 패턴을 보여줍니다:

* **Enum 스키마:** `unit_type`은 고정된 값 집합으로 제한됩니다. TypeScript에서는 `z.enum()`을 사용합니다. Python에서는 딕셔너리 스키마가 열거형을 지원하지 않으므로 완전한 JSON Schema 딕셔너리가 필요합니다.
* **지원되지 않는 입력 처리:** 변환 쌍을 찾을 수 없을 때 핸들러가 `isError: true`를 반환하여 Claude가 실패를 일반 결과로 처리하지 않고 사용자에게 무엇이 잘못되었는지 알릴 수 있습니다.

::: code-group
  ```python Python
  from typing import Any
  from claude_agent_sdk import tool, create_sdk_mcp_server


  # TypeScript의 z.enum()은 JSON Schema에서 "enum" 제약이 됩니다.
  # 딕셔너리 스키마는 이에 해당하는 것이 없으므로 전체 JSON Schema가 필요합니다.
  @tool(
      "convert_units",
      "Convert a value from one unit to another",
      {
          "type": "object",
          "properties": {
              "unit_type": {
                  "type": "string",
                  "enum": ["length", "temperature", "weight"],
                  "description": "Category of unit",
              },
              "from_unit": {
                  "type": "string",
                  "description": "Unit to convert from, e.g. kilometers, fahrenheit, pounds",
              },
              "to_unit": {"type": "string", "description": "Unit to convert to"},
              "value": {"type": "number", "description": "Value to convert"},
          },
          "required": ["unit_type", "from_unit", "to_unit", "value"],
      },
  )
  async def convert_units(args: dict[str, Any]) -> dict[str, Any]:
      conversions = {
          "length": {
              "kilometers_to_miles": lambda v: v * 0.621371,
              "miles_to_kilometers": lambda v: v * 1.60934,
              "meters_to_feet": lambda v: v * 3.28084,
              "feet_to_meters": lambda v: v * 0.3048,
          },
          "temperature": {
              "celsius_to_fahrenheit": lambda v: (v * 9) / 5 + 32,
              "fahrenheit_to_celsius": lambda v: (v - 32) * 5 / 9,
              "celsius_to_kelvin": lambda v: v + 273.15,
              "kelvin_to_celsius": lambda v: v - 273.15,
          },
          "weight": {
              "kilograms_to_pounds": lambda v: v * 2.20462,
              "pounds_to_kilograms": lambda v: v * 0.453592,
              "grams_to_ounces": lambda v: v * 0.035274,
              "ounces_to_grams": lambda v: v * 28.3495,
          },
      }

      key = f"{args['from_unit']}_to_{args['to_unit']}"
      fn = conversions.get(args["unit_type"], {}).get(key)

      if not fn:
          return {
              "content": [
                  {
                      "type": "text",
                      "text": f"Unsupported conversion: {args['from_unit']} to {args['to_unit']}",
                  }
              ],
              "is_error": True,
          }

      result = fn(args["value"])
      return {
          "content": [
              {
                  "type": "text",
                  "text": f"{args['value']} {args['from_unit']} = {result:.4f} {args['to_unit']}",
              }
          ]
      }


  converter_server = create_sdk_mcp_server(
      name="converter",
      version="1.0.0",
      tools=[convert_units],
  )
  ```

  ```typescript TypeScript
  import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
  import { z } from "zod";

  const convert = tool(
    "convert_units",
    "Convert a value from one unit to another",
    {
      unit_type: z.enum(["length", "temperature", "weight"]).describe("Category of unit"),
      from_unit: z
        .string()
        .describe("Unit to convert from, e.g. kilometers, fahrenheit, pounds"),
      to_unit: z.string().describe("Unit to convert to"),
      value: z.number().describe("Value to convert")
    },
    async (args) => {
      type Conversions = Record<string, Record<string, (v: number) => number>>;

      const conversions: Conversions = {
        length: {
          kilometers_to_miles: (v) => v * 0.621371,
          miles_to_kilometers: (v) => v * 1.60934,
          meters_to_feet: (v) => v * 3.28084,
          feet_to_meters: (v) => v * 0.3048
        },
        temperature: {
          celsius_to_fahrenheit: (v) => (v * 9) / 5 + 32,
          fahrenheit_to_celsius: (v) => ((v - 32) * 5) / 9,
          celsius_to_kelvin: (v) => v + 273.15,
          kelvin_to_celsius: (v) => v - 273.15
        },
        weight: {
          kilograms_to_pounds: (v) => v * 2.20462,
          pounds_to_kilograms: (v) => v * 0.453592,
          grams_to_ounces: (v) => v * 0.035274,
          ounces_to_grams: (v) => v * 28.3495
        }
      };

      const key = `${args.from_unit}_to_${args.to_unit}`;
      const fn = conversions[args.unit_type]?.[key];

      if (!fn) {
        return {
          content: [
            {
              type: "text",
              text: `Unsupported conversion: ${args.from_unit} to ${args.to_unit}`
            }
          ],
          isError: true
        };
      }

      const result = fn(args.value);
      return {
        content: [
          {
            type: "text",
            text: `${args.value} ${args.from_unit} = ${result.toFixed(4)} ${args.to_unit}`
          }
        ]
      };
    }
  );

  const converterServer = createSdkMcpServer({
    name: "converter",
    version: "1.0.0",
    tools: [convert]
  });
  ```
:::

서버가 정의되면 날씨 예제와 동일한 방식으로 `query`에 전달합니다. 이 예제는 루프에서 세 가지 다른 프롬프트를 보내 동일한 도구가 다른 단위 타입을 처리하는 것을 보여줍니다. 각 응답에서 `AssistantMessage` 객체(해당 턴에 Claude가 수행한 도구 호출을 포함)를 검사하고 최종 `ResultMessage` 텍스트를 출력하기 전에 각 `ToolUseBlock`을 출력합니다. 이를 통해 Claude가 도구를 사용하는 시점과 자체 지식으로 답변하는 시점을 확인할 수 있습니다.

::: code-group
  ```python Python
  import asyncio
  from claude_agent_sdk import (
      query,
      ClaudeAgentOptions,
      ResultMessage,
      AssistantMessage,
      ToolUseBlock,
  )


  async def main():
      options = ClaudeAgentOptions(
          mcp_servers={"converter": converter_server},
          allowed_tools=["mcp__converter__convert_units"],
      )

      prompts = [
          "Convert 100 kilometers to miles.",
          "What is 72°F in Celsius?",
          "How many pounds is 5 kilograms?",
      ]

      for prompt in prompts:
          async for message in query(prompt=prompt, options=options):
              if isinstance(message, AssistantMessage):
                  for block in message.content:
                      if isinstance(block, ToolUseBlock):
                          print(f"[tool call] {block.name}({block.input})")
              elif isinstance(message, ResultMessage) and message.subtype == "success":
                  print(f"Q: {prompt}\nA: {message.result}\n")


  asyncio.run(main())
  ```

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const prompts = [
    "Convert 100 kilometers to miles.",
    "What is 72°F in Celsius?",
    "How many pounds is 5 kilograms?"
  ];

  for (const prompt of prompts) {
    for await (const message of query({
      prompt,
      options: {
        mcpServers: { converter: converterServer },
        allowedTools: ["mcp__converter__convert_units"]
      }
    })) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            console.log(`[tool call] ${block.name}`, block.input);
          }
        }
      } else if (message.type === "result" && message.subtype === "success") {
        console.log(`Q: ${prompt}\nA: ${message.result}\n`);
      }
    }
  }
  ```
:::

## 다음 단계

커스텀 도구는 비동기 함수를 표준 인터페이스로 래핑합니다. 이 페이지의 패턴들을 동일한 서버에서 혼합하여 사용할 수 있습니다. 단일 서버에 데이터베이스 도구, API 게이트웨이 도구, 이미지 렌더러를 함께 보유할 수 있습니다.

다음 단계:

* 서버의 도구가 수십 개로 늘어나면 Claude가 필요할 때까지 로딩을 미루는 [도구 검색](/agent-sdk/tool-search)을 참조하세요.
* 직접 빌드하는 대신 외부 MCP 서버(파일시스템, GitHub, Slack)에 연결하려면 [MCP 서버 연결](/agent-sdk/mcp)을 참조하세요.
* 자동으로 실행되는 도구와 승인이 필요한 도구를 제어하려면 [권한 설정](/agent-sdk/permissions)을 참조하세요.

## 관련 문서

* [TypeScript SDK 참조](/agent-sdk/typescript)
* [Python SDK 참조](/agent-sdk/python)
* [MCP 문서](https://modelcontextprotocol.io)
* [SDK 개요](/agent-sdk/overview)
