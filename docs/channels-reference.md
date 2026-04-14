---
title: 채널 레퍼런스
description: 웹훅, 알림, 채팅 메시지를 Claude Code 세션에 푸시하는 MCP 서버를 만드세요. 채널 계약에 대한 레퍼런스: 기능 선언, 알림 이벤트, 응답 도구, 발신자 게이팅, 권한 릴레이.
---

# 채널 레퍼런스

::: info
채널은 [리서치 프리뷰](/channels.html#리서치-프리뷰) 단계이며 Claude Code v2.1.80 이상이 필요합니다. claude.ai 로그인이 필요하며, Console 및 API 키 인증은 지원되지 않습니다. Team 및 Enterprise 조직은 [명시적으로 활성화](/channels.html#enterprise-제어)해야 합니다.
:::

채널은 Claude Code 세션에 이벤트를 푸시하는 MCP 서버로, 터미널 외부에서 발생하는 일에 Claude가 반응할 수 있게 합니다.

단방향 또는 양방향 채널을 만들 수 있습니다. 단방향 채널은 알림, 웹훅 또는 모니터링 이벤트를 전달하여 Claude가 처리하게 합니다. 채팅 브릿지 같은 양방향 채널은 [응답 도구를 노출](#응답-도구-노출)하여 Claude가 메시지를 다시 보낼 수 있게 합니다. 신뢰할 수 있는 발신자 경로가 있는 채널은 [권한 프롬프트 릴레이](#권한-프롬프트-릴레이)에도 옵트인하여 원격으로 도구 사용을 승인하거나 거부할 수 있습니다.

이 페이지에서 다루는 내용:

* [개요](#개요): 채널 작동 방식
* [필요한 것](#필요한-것): 요구 사항 및 일반 단계
* [예제: 웹훅 수신기 만들기](#예제-웹훅-수신기-만들기): 최소한의 단방향 가이드
* [서버 옵션](#서버-옵션): 생성자 필드
* [알림 형식](#알림-형식): 이벤트 페이로드
* [응답 도구 노출](#응답-도구-노출): Claude가 메시지를 다시 보낼 수 있게 하기
* [수신 메시지 게이팅](#수신-메시지-게이팅): 프롬프트 인젝션 방지를 위한 발신자 검사
* [권한 프롬프트 릴레이](#권한-프롬프트-릴레이): 도구 승인 프롬프트를 원격 채널로 전달

기존 채널을 사용하려면 [채널](/channels.html)을 참조하세요. 리서치 프리뷰에는 Telegram, Discord, iMessage, fakechat이 포함되어 있습니다.

## 개요

채널은 Claude Code와 같은 머신에서 실행되는 [MCP](https://modelcontextprotocol.io) 서버입니다. Claude Code가 서브프로세스로 생성하고 stdio를 통해 통신합니다. 채널 서버는 외부 시스템과 Claude Code 세션 사이의 브릿지입니다:

* **채팅 플랫폼** (Telegram, Discord): 플러그인이 로컬에서 실행되며 플랫폼의 API를 폴링하여 새 메시지를 확인합니다. 누군가 봇에 DM을 보내면, 플러그인이 메시지를 수신하여 Claude에게 전달합니다. 노출할 URL이 없습니다.
* **웹훅** (CI, 모니터링): 서버가 로컬 HTTP 포트에서 수신 대기합니다. 외부 시스템이 해당 포트로 POST하면, 서버가 페이로드를 Claude에게 푸시합니다.

<img src="https://mintcdn.com/claude-code/zbUxPYi8065L3Y_P/en/images/channel-architecture.svg?fit=max&auto=format&n=zbUxPYi8065L3Y_P&q=85&s=fd6b6b949eab38264043d2a96285a57c" alt="외부 시스템이 로컬 채널 서버에 연결되고, 채널 서버가 stdio를 통해 Claude Code와 통신하는 아키텍처 다이어그램" width="600" height="220" data-path="en/images/channel-architecture.svg" />

## 필요한 것

유일한 필수 요구 사항은 [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) 패키지와 Node.js 호환 런타임입니다. [Bun](https://bun.sh), [Node](https://nodejs.org), [Deno](https://deno.com) 모두 사용 가능합니다. 리서치 프리뷰의 사전 빌드된 플러그인은 Bun을 사용하지만, 채널이 반드시 그럴 필요는 없습니다.

서버가 해야 하는 일:

1. `claude/channel` 기능을 선언하여 Claude Code가 알림 리스너를 등록하도록 합니다
2. 무언가 발생하면 `notifications/claude/channel` 이벤트를 발생시킵니다
3. [stdio transport](https://modelcontextprotocol.io/docs/concepts/transports#standard-io)를 통해 연결합니다 (Claude Code가 서버를 서브프로세스로 생성)

[서버 옵션](#서버-옵션)과 [알림 형식](#알림-형식) 섹션에서 각각을 자세히 다룹니다. 전체 가이드는 [예제: 웹훅 수신기 만들기](#예제-웹훅-수신기-만들기)를 참조하세요.

리서치 프리뷰 기간 동안, 커스텀 채널은 [승인된 허용 목록](/channels.html#지원되는-채널)에 없습니다. 로컬 테스트에는 `--dangerously-load-development-channels`를 사용하세요. 자세한 내용은 [리서치 프리뷰 기간 테스트](#리서치-프리뷰-기간-테스트)를 참조하세요.

## 예제: 웹훅 수신기 만들기

이 가이드는 HTTP 요청을 수신하고 Claude Code 세션으로 전달하는 단일 파일 서버를 만듭니다. 완료하면, CI 파이프라인, 모니터링 알림, `curl` 명령 등 HTTP POST를 보낼 수 있는 모든 것이 Claude에게 이벤트를 푸시할 수 있습니다.

이 예제는 내장 HTTP 서버와 TypeScript 지원이 있는 [Bun](https://bun.sh)을 런타임으로 사용합니다. [Node](https://nodejs.org)나 [Deno](https://deno.com)를 대신 사용할 수 있으며, 유일한 요구 사항은 [MCP SDK](https://www.npmjs.com/package/@modelcontextprotocol/sdk)입니다.

1. **프로젝트 생성**

   새 디렉토리를 만들고 MCP SDK를 설치합니다:

   ```bash
   mkdir webhook-channel && cd webhook-channel
   bun add @modelcontextprotocol/sdk
   ```

2. **채널 서버 작성**

   `webhook.ts` 파일을 만듭니다. 이것이 전체 채널 서버입니다: stdio를 통해 Claude Code에 연결하고, 포트 8788에서 HTTP POST를 수신합니다. 요청이 도착하면, 본문을 채널 이벤트로 Claude에게 푸시합니다.

   ```ts title="webhook.ts"
   #!/usr/bin/env bun
   import { Server } from '@modelcontextprotocol/sdk/server/index.js'
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

   // MCP 서버를 만들고 채널로 선언
   const mcp = new Server(
     { name: 'webhook', version: '0.0.1' },
     {
       // 이 키가 채널로 만드는 것 — Claude Code가 이를 위한 리스너를 등록
       capabilities: { experimental: { 'claude/channel': {} } },
       // Claude의 시스템 프롬프트에 추가되어 이벤트 처리 방법을 알려줌
       instructions: 'Events from the webhook channel arrive as <channel source="webhook" ...>. They are one-way: read them and act, no reply expected.',
     },
   )

   // stdio를 통해 Claude Code에 연결 (Claude Code가 이 프로세스를 생성)
   await mcp.connect(new StdioServerTransport())

   // 모든 POST를 Claude에 전달하는 HTTP 서버 시작
   Bun.serve({
     port: 8788,  // 사용 가능한 포트 아무거나
     // localhost 전용: 이 머신 외부에서는 POST 불가
     hostname: '127.0.0.1',
     async fetch(req) {
       const body = await req.text()
       await mcp.notification({
         method: 'notifications/claude/channel',
         params: {
           content: body,  // <channel> 태그의 본문이 됨
           // 각 키가 태그 속성이 됨, 예: <channel path="/" method="POST">
           meta: { path: new URL(req.url).pathname, method: req.method },
         },
       })
       return new Response('ok')
     },
   })
   ```

   파일은 세 가지를 순서대로 수행합니다:

   * **서버 구성**: 기능에 `claude/channel`을 포함하여 MCP 서버를 생성합니다. 이것이 Claude Code에 이것이 채널임을 알려줍니다. [`instructions`](#서버-옵션) 문자열은 Claude의 시스템 프롬프트에 들어갑니다: Claude에게 어떤 이벤트를 기대하고, 응답 여부, 응답해야 한다면 응답을 어떻게 라우팅할지 알려줍니다.
   * **Stdio 연결**: stdin/stdout을 통해 Claude Code에 연결합니다. 이것은 모든 [MCP 서버](https://modelcontextprotocol.io/docs/concepts/transports#standard-io)의 표준입니다: Claude Code가 서브프로세스로 생성합니다.
   * **HTTP 리스너**: 포트 8788에서 로컬 웹 서버를 시작합니다. 모든 POST 본문이 `mcp.notification()`을 통해 채널 이벤트로 Claude에 전달됩니다. `content`가 이벤트 본문이 되고, 각 `meta` 항목이 `<channel>` 태그의 속성이 됩니다. 리스너는 `mcp` 인스턴스에 접근해야 하므로 같은 프로세스에서 실행됩니다. 더 큰 프로젝트에서는 별도 모듈로 분리할 수 있습니다.

3. **Claude Code에 서버 등록**

   Claude Code가 서버를 시작하는 방법을 알 수 있도록 MCP 구성에 서버를 추가합니다. 같은 디렉토리의 프로젝트 수준 `.mcp.json`에는 상대 경로를 사용합니다. `~/.claude.json`의 사용자 수준 구성에는 어떤 프로젝트에서든 서버를 찾을 수 있도록 전체 절대 경로를 사용합니다:

   ```json title=".mcp.json"
   {
     "mcpServers": {
       "webhook": { "command": "bun", "args": ["./webhook.ts"] }
     }
   }
   ```

   Claude Code는 시작 시 MCP 구성을 읽고 각 서버를 서브프로세스로 생성합니다.

4. **테스트**

   리서치 프리뷰 기간 동안 커스텀 채널은 허용 목록에 없으므로, 개발 플래그로 Claude Code를 시작합니다:

   ```bash
   claude --dangerously-load-development-channels server:webhook
   ```

   Claude Code가 시작되면, MCP 구성을 읽고 `webhook.ts`를 서브프로세스로 생성하며, HTTP 리스너가 구성한 포트(이 예제에서는 8788)에서 자동으로 시작됩니다. 서버를 직접 실행할 필요가 없습니다.

   "blocked by org policy"가 표시되면, Team 또는 Enterprise 관리자가 먼저 [채널을 활성화](/channels.html#enterprise-제어)해야 합니다.

   별도의 터미널에서, 서버에 HTTP POST로 메시지를 보내 웹훅을 시뮬레이션합니다. 이 예제는 포트 8788(또는 구성한 포트)로 CI 실패 알림을 보냅니다:

   ```bash
   curl -X POST localhost:8788 -d "build failed on main: https://ci.example.com/run/1234"
   ```

   페이로드가 `<channel>` 태그로 Claude Code 세션에 도착합니다:

   ```text
   <channel source="webhook" path="/" method="POST">build failed on main: https://ci.example.com/run/1234</channel>
   ```

   Claude Code 터미널에서 Claude가 메시지를 수신하고 응답을 시작하는 것을 볼 수 있습니다: 파일 읽기, 명령 실행 등 메시지가 요청하는 작업을 수행합니다. 이것은 단방향 채널이므로, Claude는 세션에서 작업하지만 웹훅을 통해 아무것도 돌려보내지 않습니다. 응답을 추가하려면 [응답 도구 노출](#응답-도구-노출)을 참조하세요.

   이벤트가 도착하지 않으면, 진단은 `curl`이 반환한 것에 따라 다릅니다:

   * **`curl`이 성공하지만 Claude에 아무것도 도착하지 않음**: 세션에서 `/mcp`를 실행하여 서버 상태를 확인하세요. "Failed to connect"는 보통 서버 파일의 의존성이나 import 오류를 의미합니다. `~/.claude/debug/<session-id>.txt`의 디버그 로그에서 stderr 트레이스를 확인하세요.
   * **`curl`이 "connection refused"로 실패**: 포트가 아직 바인딩되지 않았거나, 이전 실행의 오래된 프로세스가 포트를 점유하고 있습니다. `lsof -i :<port>`로 수신 대기 중인 것을 확인하고, 세션을 재시작하기 전에 오래된 프로세스를 `kill`하세요.

[fakechat 서버](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/fakechat)는 이 패턴을 웹 UI, 파일 첨부, 양방향 채팅을 위한 응답 도구로 확장합니다.

## 리서치 프리뷰 기간 테스트

리서치 프리뷰 기간 동안, 모든 채널은 [승인된 허용 목록](/channels.html#리서치-프리뷰)에 있어야 등록할 수 있습니다. 개발 플래그는 확인 프롬프트 후 특정 항목에 대해 허용 목록을 우회합니다. 이 예제는 두 가지 항목 유형을 보여줍니다:

```bash
# 개발 중인 플러그인 테스트
claude --dangerously-load-development-channels plugin:yourplugin@yourmarketplace

# 베어 .mcp.json 서버 테스트 (플러그인 래퍼 없음)
claude --dangerously-load-development-channels server:webhook
```

우회는 항목별로 적용됩니다. 이 플래그를 `--channels`와 결합해도 `--channels` 항목으로 우회가 확장되지 않습니다. 리서치 프리뷰 기간 동안 승인된 허용 목록은 Anthropic이 관리하므로, 빌드하고 테스트하는 동안 채널은 개발 플래그에 머무릅니다.

::: info
이 플래그는 허용 목록만 건너뜁니다. `channelsEnabled` 조직 정책은 여전히 적용됩니다. 신뢰할 수 없는 소스의 채널을 실행하는 데 사용하지 마세요.
:::

## 서버 옵션

채널은 [`Server`](https://modelcontextprotocol.io/docs/concepts/servers) 생성자에서 이러한 옵션을 설정합니다. `instructions`와 `capabilities.tools` 필드는 [표준 MCP](https://modelcontextprotocol.io/docs/concepts/servers)이며, `capabilities.experimental['claude/channel']`과 `capabilities.experimental['claude/channel/permission']`이 채널 특유의 추가 사항입니다:

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `capabilities.experimental['claude/channel']` | `object` | 필수. 항상 `{}`. 존재하면 알림 리스너가 등록됩니다. |
| `capabilities.experimental['claude/channel/permission']` | `object` | 선택. 항상 `{}`. 이 채널이 권한 릴레이 요청을 수신할 수 있음을 선언합니다. 선언되면, Claude Code가 도구 승인 프롬프트를 채널로 전달하여 원격으로 승인하거나 거부할 수 있습니다. [권한 프롬프트 릴레이](#권한-프롬프트-릴레이)를 참조하세요. |
| `capabilities.tools` | `object` | 양방향 전용. 항상 `{}`. 표준 MCP 도구 기능. [응답 도구 노출](#응답-도구-노출)을 참조하세요. |
| `instructions` | `string` | 권장. Claude의 시스템 프롬프트에 추가됩니다. Claude에게 어떤 이벤트를 기대하고, `<channel>` 태그 속성의 의미, 응답 여부, 응답해야 한다면 어떤 도구를 사용하고 어떤 속성(예: `chat_id`)을 다시 전달할지 알려줍니다. |

단방향 채널을 만들려면 `capabilities.tools`를 생략하세요. 이 예제는 채널 기능, 도구, 지시사항이 설정된 양방향 구성을 보여줍니다:

```ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'

const mcp = new Server(
  { name: 'your-channel', version: '0.0.1' },
  {
    capabilities: {
      experimental: { 'claude/channel': {} },  // 채널 리스너 등록
      tools: {},  // 단방향 채널에서는 생략
    },
    // Claude의 시스템 프롬프트에 추가되어 이벤트 처리 방법을 알려줌
    instructions: 'Messages arrive as <channel source="your-channel" ...>. Reply with the reply tool.',
  },
)
```

이벤트를 푸시하려면 method `notifications/claude/channel`로 `mcp.notification()`을 호출합니다. 매개변수는 다음 섹션에 있습니다.

## 알림 형식

서버는 두 개의 매개변수로 `notifications/claude/channel`을 발생시킵니다:

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `content` | `string` | 이벤트 본문. `<channel>` 태그의 본문으로 전달됩니다. |
| `meta` | `Record<string, string>` | 선택. 각 항목이 `<channel>` 태그의 속성이 되어 채팅 ID, 발신자 이름, 알림 심각도 같은 라우팅 컨텍스트를 제공합니다. 키는 식별자여야 합니다: 문자, 숫자, 밑줄만 가능. 하이픈이나 기타 문자를 포함하는 키는 자동으로 제거됩니다. |

서버는 `Server` 인스턴스에서 `mcp.notification()`을 호출하여 이벤트를 푸시합니다. 이 예제는 두 개의 meta 키로 CI 실패 알림을 푸시합니다:

```ts
await mcp.notification({
  method: 'notifications/claude/channel',
  params: {
    content: 'build failed on main: https://ci.example.com/run/1234',
    meta: { severity: 'high', run_id: '1234' },
  },
})
```

이벤트가 `<channel>` 태그로 감싸져 Claude의 컨텍스트에 도착합니다. `source` 속성은 서버의 구성된 이름에서 자동으로 설정됩니다:

```text
<channel source="your-channel" severity="high" run_id="1234">
build failed on main: https://ci.example.com/run/1234
</channel>
```

## 응답 도구 노출

채널이 양방향인 경우(알림 전달기가 아닌 채팅 브릿지), Claude가 메시지를 다시 보낼 수 있는 표준 [MCP 도구](https://modelcontextprotocol.io/docs/concepts/tools)를 노출합니다. 도구 등록에 채널 특유의 것은 없습니다. 응답 도구에는 세 가지 구성 요소가 있습니다:

1. Claude Code가 도구를 발견할 수 있도록 `Server` 생성자 기능에 `tools: {}` 항목
2. 도구의 스키마를 정의하고 전송 로직을 구현하는 도구 핸들러
3. Claude에게 도구를 언제 어떻게 호출할지 알려주는 `Server` 생성자의 `instructions` 문자열

[위의 웹훅 수신기](#예제-웹훅-수신기-만들기)에 이를 추가하려면:

1. **도구 검색 활성화**

   `webhook.ts`의 `Server` 생성자에서, Claude Code가 서버가 도구를 제공한다는 것을 알 수 있도록 기능에 `tools: {}`를 추가합니다:

   ```ts
   capabilities: {
     experimental: { 'claude/channel': {} },
     tools: {},  // 도구 검색 활성화
   },
   ```

2. **응답 도구 등록**

   `webhook.ts`에 다음을 추가합니다. `import`는 다른 import와 함께 파일 상단에, 두 핸들러는 `Server` 생성자와 `mcp.connect()` 사이에 넣습니다. 이것은 Claude가 `chat_id`와 `text`로 호출할 수 있는 `reply` 도구를 등록합니다:

   ```ts
   // webhook.ts 상단에 이 import를 추가
   import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

   // 시작 시 Claude가 서버가 제공하는 도구를 쿼리
   mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
     tools: [{
       name: 'reply',
       description: 'Send a message back over this channel',
       // inputSchema가 Claude에게 전달할 인수를 알려줌
       inputSchema: {
         type: 'object',
         properties: {
           chat_id: { type: 'string', description: 'The conversation to reply in' },
           text: { type: 'string', description: 'The message to send' },
         },
         required: ['chat_id', 'text'],
       },
     }],
   }))

   // 도구를 호출하려 할 때 Claude가 이것을 호출
   mcp.setRequestHandler(CallToolRequestSchema, async req => {
     if (req.params.name === 'reply') {
       const { chat_id, text } = req.params.arguments as { chat_id: string; text: string }
       // send()가 아웃바운드: 채팅 플랫폼에 POST하거나, 로컬
       // 테스트에서는 아래 전체 예제의 SSE 브로드캐스트 사용
       send(`Reply to ${chat_id}: ${text}`)
       return { content: [{ type: 'text', text: 'sent' }] }
     }
     throw new Error(`unknown tool: ${req.params.name}`)
   })
   ```

3. **지시사항 업데이트**

   `Server` 생성자의 `instructions` 문자열을 업데이트하여 Claude가 응답 도구를 통해 응답을 라우팅하도록 합니다. 이 예제는 Claude에게 수신 태그에서 `chat_id`를 전달하도록 알려줍니다:

   ```ts
   instructions: 'Messages arrive as <channel source="webhook" chat_id="...">. Reply with the reply tool, passing the chat_id from the tag.'
   ```

다음은 양방향 지원이 포함된 완전한 `webhook.ts`입니다. 아웃바운드 응답은 [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) (SSE)를 사용하여 `GET /events`로 스트리밍되므로, `curl -N localhost:8788/events`로 실시간 확인이 가능합니다. 인바운드 채팅은 `POST /`로 도착합니다:

```ts title="응답 도구가 포함된 전체 webhook.ts"
#!/usr/bin/env bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

// --- 아웃바운드: /events의 curl -N 리스너에 쓰기 --------------------
// 실제 브릿지는 채팅 플랫폼에 POST합니다.
const listeners = new Set<(chunk: string) => void>()
function send(text: string) {
  const chunk = text.split('\n').map(l => `data: ${l}\n`).join('') + '\n'
  for (const emit of listeners) emit(chunk)
}

const mcp = new Server(
  { name: 'webhook', version: '0.0.1' },
  {
    capabilities: {
      experimental: { 'claude/channel': {} },
      tools: {},
    },
    instructions: 'Messages arrive as <channel source="webhook" chat_id="...">. Reply with the reply tool, passing the chat_id from the tag.',
  },
)

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'reply',
    description: 'Send a message back over this channel',
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: { type: 'string', description: 'The conversation to reply in' },
        text: { type: 'string', description: 'The message to send' },
      },
      required: ['chat_id', 'text'],
    },
  }],
}))

mcp.setRequestHandler(CallToolRequestSchema, async req => {
  if (req.params.name === 'reply') {
    const { chat_id, text } = req.params.arguments as { chat_id: string; text: string }
    send(`Reply to ${chat_id}: ${text}`)
    return { content: [{ type: 'text', text: 'sent' }] }
  }
  throw new Error(`unknown tool: ${req.params.name}`)
})

await mcp.connect(new StdioServerTransport())

let nextId = 1
Bun.serve({
  port: 8788,
  hostname: '127.0.0.1',
  idleTimeout: 0,  // 유휴 SSE 스트림을 닫지 않음
  async fetch(req) {
    const url = new URL(req.url)

    // GET /events: curl -N으로 Claude의 응답을 실시간으로 볼 수 있는 SSE 스트림
    if (req.method === 'GET' && url.pathname === '/events') {
      const stream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(': connected\n\n')  // curl이 즉시 무언가를 표시하도록
          const emit = (chunk: string) => ctrl.enqueue(chunk)
          listeners.add(emit)
          req.signal.addEventListener('abort', () => listeners.delete(emit))
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }

    // POST: 채널 이벤트로 Claude에 전달
    const body = await req.text()
    const chat_id = String(nextId++)
    await mcp.notification({
      method: 'notifications/claude/channel',
      params: {
        content: body,
        meta: { chat_id, path: url.pathname, method: req.method },
      },
    })
    return new Response('ok')
  },
})
```

[fakechat 서버](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/fakechat)에서 파일 첨부와 메시지 편집이 포함된 더 완전한 예제를 확인할 수 있습니다.

## 수신 메시지 게이팅

게이팅되지 않은 채널은 프롬프트 인젝션 벡터입니다. 엔드포인트에 도달할 수 있는 누구나 Claude 앞에 텍스트를 넣을 수 있습니다. 채팅 플랫폼이나 공개 엔드포인트를 수신하는 채널에는 이벤트를 발생시키기 전에 실제 발신자 검사가 필요합니다.

`mcp.notification()`을 호출하기 전에 허용 목록에 대해 발신자를 검사합니다. 이 예제는 세트에 없는 발신자의 메시지를 차단합니다:

```ts
const allowed = new Set(loadAllowlist())  // access.json 또는 동등한 파일에서

// 메시지 핸들러 내부, 이벤트 발생 전:
if (!allowed.has(message.from.id)) {  // 채팅방이 아닌 발신자
  return  // 조용히 차단
}
await mcp.notification({ ... })
```

채팅방 ID가 아닌 발신자의 ID로 게이팅하세요: 예제에서 `message.chat.id`가 아닌 `message.from.id`. 그룹 채팅에서는 이 둘이 다르며, 채팅방으로 게이팅하면 허용된 그룹의 모든 사람이 세션에 메시지를 주입할 수 있습니다.

[Telegram](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/telegram)과 [Discord](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord) 채널은 같은 방식으로 발신자 허용 목록으로 게이팅합니다. 페어링으로 목록을 구성합니다: 사용자가 봇에 DM을 보내면 봇이 페어링 코드로 응답하고, 사용자가 Claude Code 세션에서 승인하면 플랫폼 ID가 추가됩니다. 전체 페어링 흐름은 각 구현을 참조하세요. [iMessage](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/imessage) 채널은 다른 접근 방식을 취합니다: 시작 시 Messages 데이터베이스에서 사용자의 자체 주소를 감지하여 자동으로 통과시키고, 다른 발신자는 핸들로 추가합니다.

## 권한 프롬프트 릴레이

::: info
권한 릴레이는 Claude Code v2.1.81 이상이 필요합니다. 이전 버전은 `claude/channel/permission` 기능을 무시합니다.
:::

Claude가 승인이 필요한 도구를 호출하면, 로컬 터미널 대화 상자가 열리고 세션이 대기합니다. 양방향 채널은 같은 프롬프트를 병렬로 수신하고 다른 기기의 사용자에게 릴레이하도록 옵트인할 수 있습니다. 두 곳 모두 활성 상태를 유지합니다: 터미널이나 휴대폰에서 응답할 수 있으며, Claude Code는 먼저 도착한 답변을 적용하고 나머지를 닫습니다.

릴레이는 `Bash`, `Write`, `Edit` 같은 도구 사용 승인을 다룹니다. 프로젝트 신뢰 및 MCP 서버 동의 대화 상자는 릴레이되지 않습니다; 로컬 터미널에서만 나타납니다.

### 릴레이 작동 방식

권한 프롬프트가 열리면, 릴레이 루프는 네 단계를 거칩니다:

1. Claude Code가 짧은 요청 ID를 생성하고 서버에 알림
2. 서버가 프롬프트와 ID를 채팅 앱으로 전달
3. 원격 사용자가 해당 ID와 함께 yes 또는 no로 응답
4. 인바운드 핸들러가 응답을 판정으로 파싱하고, Claude Code는 ID가 열린 요청과 일치하는 경우에만 적용

이 과정 내내 로컬 터미널 대화 상자는 열린 상태를 유지합니다. 원격 판정이 도착하기 전에 터미널에서 누군가 응답하면, 그 답변이 대신 적용되고 대기 중인 원격 요청은 삭제됩니다.

<img src="https://mintcdn.com/claude-code/DsZvsJII1OmzIjIs/en/images/channel-permission-relay.svg?fit=max&auto=format&n=DsZvsJII1OmzIjIs&q=85&s=c1d75f6ee34c2757983e2cca899b90d1" alt="Claude Code가 채널 서버에 permission_request 알림을 보내고, 서버가 프롬프트를 채팅 앱에 전달하고, 사람이 판정으로 응답하며, 서버가 응답을 파싱하여 Claude Code에 권한 알림으로 되돌려보내는 시퀀스 다이어그램" width="600" height="230" data-path="en/images/channel-permission-relay.svg" />

### 권한 요청 필드

Claude Code에서 보내는 아웃바운드 알림은 `notifications/claude/channel/permission_request`입니다. [채널 알림](#알림-형식)과 마찬가지로, 전송은 표준 MCP이지만 메서드와 스키마는 Claude Code 확장입니다. `params` 객체에는 서버가 발신 프롬프트로 포맷하는 네 개의 문자열 필드가 있습니다:

| 필드 | 설명 |
| --- | --- |
| `request_id` | `a`-`z`에서 `l`을 제외한 5개의 소문자. 휴대폰에서 입력할 때 `1`이나 `I`로 읽히지 않도록. 응답에서 에코할 수 있도록 발신 프롬프트에 포함하세요. Claude Code는 자신이 발행한 ID가 포함된 판정만 수락합니다. 로컬 터미널 대화 상자에는 이 ID가 표시되지 않으므로, 아웃바운드 핸들러가 이를 확인할 수 있는 유일한 방법입니다. |
| `tool_name` | Claude가 사용하려는 도구 이름, 예: `Bash` 또는 `Write`. |
| `description` | 이 특정 도구 호출이 수행하는 작업의 사람이 읽을 수 있는 요약. 로컬 터미널 대화 상자에 표시되는 텍스트와 동일합니다. Bash 호출의 경우 Claude의 명령 설명이거나, 설명이 없으면 명령 자체입니다. |
| `input_preview` | 도구의 인수를 JSON 문자열로, 200자로 잘립니다. Bash의 경우 명령이고, Write의 경우 파일 경로와 내용의 접두사입니다. 한 줄 메시지만 보낼 공간이 있다면 프롬프트에서 생략하세요. 무엇을 보여줄지는 서버가 결정합니다. |

서버가 되돌려보내는 판정은 `notifications/claude/channel/permission`으로, 위의 ID를 에코하는 `request_id`와 `'allow'` 또는 `'deny'`로 설정된 `behavior` 두 필드를 포함합니다. allow는 도구 호출을 진행시키고, deny는 로컬 대화 상자에서 No를 응답하는 것과 같습니다. 어떤 판정도 향후 호출에 영향을 주지 않습니다.

### 채팅 브릿지에 릴레이 추가

양방향 채널에 권한 릴레이를 추가하려면 세 가지 구성 요소가 필요합니다:

1. `Server` 생성자의 `experimental` 기능에 `claude/channel/permission: {}` 항목: Claude Code가 프롬프트를 전달하도록
2. `notifications/claude/channel/permission_request`에 대한 알림 핸들러: 프롬프트를 포맷하고 플랫폼 API를 통해 전송
3. 인바운드 메시지 핸들러에서 `yes <id>` 또는 `no <id>`를 인식하고 텍스트를 Claude에 전달하는 대신 `notifications/claude/channel/permission` 판정을 발생시키는 검사

채널이 [발신자를 인증](#수신-메시지-게이팅)하는 경우에만 기능을 선언하세요. 채널을 통해 응답할 수 있는 누구나 세션에서 도구 사용을 승인하거나 거부할 수 있기 때문입니다.

[응답 도구 노출](#응답-도구-노출)에서 조립한 양방향 채팅 브릿지에 이를 추가하려면:

1. **권한 기능 선언**

   `Server` 생성자에서, `experimental` 아래 `claude/channel` 옆에 `claude/channel/permission: {}`을 추가합니다:

   ```ts
   capabilities: {
     experimental: {
       'claude/channel': {},
       'claude/channel/permission': {},  // 권한 릴레이 옵트인
     },
     tools: {},
   },
   ```

2. **수신 요청 처리**

   `Server` 생성자와 `mcp.connect()` 사이에 알림 핸들러를 등록합니다. Claude Code는 권한 대화 상자가 열릴 때 [네 개의 요청 필드](#권한-요청-필드)로 이를 호출합니다. 핸들러는 플랫폼에 맞게 프롬프트를 포맷하고 ID로 응답하는 방법을 포함합니다:

   ```ts
   import { z } from 'zod'

   // setNotificationHandler는 method 필드의 z.literal으로 라우팅하므로,
   // 이 스키마가 유효성 검사기이자 디스패치 키
   const PermissionRequestSchema = z.object({
     method: z.literal('notifications/claude/channel/permission_request'),
     params: z.object({
       request_id: z.string(),     // 5개의 소문자, 프롬프트에 그대로 포함
       tool_name: z.string(),      // 예: "Bash", "Write"
       description: z.string(),    // 이 호출의 사람이 읽을 수 있는 요약
       input_preview: z.string(),  // 도구 인수를 JSON으로, ~200자로 잘림
     }),
   })

   mcp.setNotificationHandler(PermissionRequestSchema, async ({ params }) => {
     // send()가 아웃바운드: 채팅 플랫폼에 POST하거나, 로컬
     // 테스트에서는 아래 전체 예제의 SSE 브로드캐스트 사용
     send(
       `Claude wants to run ${params.tool_name}: ${params.description}\n\n` +
       // 지시사항의 ID가 3단계에서 인바운드 핸들러가 파싱하는 것
       `Reply "yes ${params.request_id}" or "no ${params.request_id}"`,
     )
   })
   ```

3. **인바운드 핸들러에서 판정 가로채기**

   인바운드 핸들러는 플랫폼에서 메시지를 수신하는 루프나 콜백입니다: [발신자 게이팅](#수신-메시지-게이팅)을 수행하고 `notifications/claude/channel`을 발생시켜 채팅을 Claude에 전달하는 동일한 곳입니다. 채팅 전달 호출 전에 판정 형식을 인식하고 대신 권한 알림을 발생시키는 검사를 추가합니다.

   정규식은 Claude Code가 생성하는 ID 형식에 일치합니다: 5개의 문자, `l` 없음. `/i` 플래그는 휴대폰 자동 수정으로 대문자가 되는 것을 허용합니다; 전송 전에 캡처된 ID를 소문자로 변환합니다.

   ```ts
   // "y abcde", "yes abcde", "n abcde", "no abcde"에 일치
   // [a-km-z]는 Claude Code가 사용하는 ID 알파벳 (소문자, 'l' 건너뜀)
   // /i는 휴대폰 자동 수정을 허용; 전송 전에 캡처를 소문자로
   const PERMISSION_REPLY_RE = /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i

   async function onInbound(message: PlatformMessage) {
     if (!allowed.has(message.from.id)) return  // 발신자 먼저 게이팅

     const m = PERMISSION_REPLY_RE.exec(message.text)
     if (m) {
       // m[1]은 판정 단어, m[2]는 요청 ID
       // 채팅 대신 Claude Code에 판정 알림 발생
       await mcp.notification({
         method: 'notifications/claude/channel/permission',
         params: {
           request_id: m[2].toLowerCase(),  // 자동 수정 대문자 정규화
           behavior: m[1].toLowerCase().startsWith('y') ? 'allow' : 'deny',
         },
       })
       return  // 판정으로 처리됨, 채팅으로 전달하지 않음
     }

     // 판정 형식과 일치하지 않음: 일반 채팅 경로로 진행
     await mcp.notification({
       method: 'notifications/claude/channel',
       params: { content: message.text, meta: { chat_id: String(message.chat.id) } },
     })
   }
   ```

Claude Code는 로컬 터미널 대화 상자도 열어 두므로, 어디서든 응답할 수 있으며, 먼저 도착한 답변이 적용됩니다. 예상 형식과 정확히 일치하지 않는 원격 응답은 두 가지 방식 중 하나로 실패하며, 두 경우 모두 대화 상자는 열린 상태를 유지합니다:

* **다른 형식**: 인바운드 핸들러의 정규식이 일치하지 않으므로, `approve it`이나 ID 없는 `yes` 같은 텍스트는 Claude에 일반 메시지로 전달됩니다.
* **올바른 형식, 잘못된 ID**: 서버가 판정을 발생시키지만, Claude Code가 해당 ID의 열린 요청을 찾지 못하고 조용히 삭제합니다.

### 전체 예제

아래의 조립된 `webhook.ts`는 이 페이지의 세 가지 확장을 모두 결합합니다: 응답 도구, 발신자 게이팅, 권한 릴레이. 여기서 시작하는 경우, 초기 가이드의 [프로젝트 설정과 `.mcp.json` 항목](#예제-웹훅-수신기-만들기)도 필요합니다.

curl에서 양방향을 테스트할 수 있도록, HTTP 리스너는 두 경로를 제공합니다:

* **`GET /events`**: SSE 스트림을 열어 두고 각 아웃바운드 메시지를 `data:` 라인으로 푸시하므로, `curl -N`으로 Claude의 응답과 권한 프롬프트가 실시간으로 도착하는 것을 볼 수 있습니다.
* **`POST /`**: 인바운드 쪽, 이전과 같은 핸들러이지만 이제 채팅 전달 분기 전에 판정 형식 검사가 삽입되어 있습니다.

```ts title="권한 릴레이가 포함된 전체 webhook.ts"
#!/usr/bin/env bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// --- 아웃바운드: /events의 curl -N 리스너에 쓰기 --------------------
// 실제 브릿지는 채팅 플랫폼에 POST합니다.
const listeners = new Set<(chunk: string) => void>()
function send(text: string) {
  const chunk = text.split('\n').map(l => `data: ${l}\n`).join('') + '\n'
  for (const emit of listeners) emit(chunk)
}

// 발신자 허용 목록. 로컬 가이드에서는 단일 X-Sender
// 헤더 값 "dev"를 신뢰; 실제 브릿지는 플랫폼의 사용자 ID를 검사
const allowed = new Set(['dev'])

const mcp = new Server(
  { name: 'webhook', version: '0.0.1' },
  {
    capabilities: {
      experimental: {
        'claude/channel': {},
        'claude/channel/permission': {},  // 권한 릴레이 옵트인
      },
      tools: {},
    },
    instructions:
      'Messages arrive as <channel source="webhook" chat_id="...">. ' +
      'Reply with the reply tool, passing the chat_id from the tag.',
  },
)

// --- 응답 도구: Claude가 메시지를 돌려보낼 때 호출 -------------------
mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'reply',
    description: 'Send a message back over this channel',
    inputSchema: {
      type: 'object',
      properties: {
        chat_id: { type: 'string', description: 'The conversation to reply in' },
        text: { type: 'string', description: 'The message to send' },
      },
      required: ['chat_id', 'text'],
    },
  }],
}))

mcp.setRequestHandler(CallToolRequestSchema, async req => {
  if (req.params.name === 'reply') {
    const { chat_id, text } = req.params.arguments as { chat_id: string; text: string }
    send(`Reply to ${chat_id}: ${text}`)
    return { content: [{ type: 'text', text: 'sent' }] }
  }
  throw new Error(`unknown tool: ${req.params.name}`)
})

// --- 권한 릴레이: 대화 상자가 열릴 때 Claude Code(Claude가 아님)가 호출
const PermissionRequestSchema = z.object({
  method: z.literal('notifications/claude/channel/permission_request'),
  params: z.object({
    request_id: z.string(),
    tool_name: z.string(),
    description: z.string(),
    input_preview: z.string(),
  }),
})

mcp.setNotificationHandler(PermissionRequestSchema, async ({ params }) => {
  send(
    `Claude wants to run ${params.tool_name}: ${params.description}\n\n` +
    `Reply "yes ${params.request_id}" or "no ${params.request_id}"`,
  )
})

await mcp.connect(new StdioServerTransport())

// --- HTTP :8788: GET /events는 아웃바운드 스트림, POST는 인바운드 라우팅 -------
const PERMISSION_REPLY_RE = /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i
let nextId = 1

Bun.serve({
  port: 8788,
  hostname: '127.0.0.1',
  idleTimeout: 0,  // 유휴 SSE 스트림을 닫지 않음
  async fetch(req) {
    const url = new URL(req.url)

    // GET /events: curl -N으로 응답과 프롬프트를 실시간으로 볼 수 있는 SSE 스트림
    if (req.method === 'GET' && url.pathname === '/events') {
      const stream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(': connected\n\n')  // curl이 즉시 무언가를 표시하도록
          const emit = (chunk: string) => ctrl.enqueue(chunk)
          listeners.add(emit)
          req.signal.addEventListener('abort', () => listeners.delete(emit))
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }

    // 나머지는 인바운드: 발신자 먼저 게이팅
    const body = await req.text()
    const sender = req.headers.get('X-Sender') ?? ''
    if (!allowed.has(sender)) return new Response('forbidden', { status: 403 })

    // 채팅으로 처리하기 전에 판정 형식 검사
    const m = PERMISSION_REPLY_RE.exec(body)
    if (m) {
      await mcp.notification({
        method: 'notifications/claude/channel/permission',
        params: {
          request_id: m[2].toLowerCase(),
          behavior: m[1].toLowerCase().startsWith('y') ? 'allow' : 'deny',
        },
      })
      return new Response('verdict recorded')
    }

    // 일반 채팅: 채널 이벤트로 Claude에 전달
    const chat_id = String(nextId++)
    await mcp.notification({
      method: 'notifications/claude/channel',
      params: { content: body, meta: { chat_id, path: url.pathname } },
    })
    return new Response('ok')
  },
})
```

세 개의 터미널에서 판정 경로를 테스트합니다. 첫 번째는 [개발 플래그](#리서치-프리뷰-기간-테스트)로 시작된 Claude Code 세션으로, `webhook.ts`를 생성합니다:

```bash
claude --dangerously-load-development-channels server:webhook
```

두 번째에서는 아웃바운드 쪽을 스트리밍하여 Claude의 응답과 권한 프롬프트가 발생하는 것을 확인합니다:

```bash
curl -N localhost:8788/events
```

세 번째에서는 Claude가 명령을 실행하도록 하는 메시지를 보냅니다:

```bash
curl -d "list the files in this directory" -H "X-Sender: dev" localhost:8788
```

Claude Code 터미널에서 로컬 권한 대화 상자가 열립니다. 잠시 후 프롬프트가 `/events` 스트림에 5글자 ID와 함께 나타납니다. 원격에서 승인합니다:

```bash
curl -d "yes <id>" -H "X-Sender: dev" localhost:8788
```

로컬 대화 상자가 닫히고 도구가 실행됩니다. Claude의 응답이 `reply` 도구를 통해 돌아와 스트림에도 나타납니다.

이 파일의 세 가지 채널 특유 요소:

* **생성자의 기능**: `claude/channel`이 알림 리스너를 등록하고, `claude/channel/permission`이 권한 릴레이에 옵트인하며, `tools`가 Claude에게 응답 도구를 발견하게 합니다.
* **아웃바운드 경로**: `reply` 도구 핸들러는 Claude가 대화 응답을 위해 호출하는 것이고, `PermissionRequestSchema` 알림 핸들러는 권한 대화 상자가 열릴 때 Claude Code가 호출하는 것입니다. 둘 다 `send()`를 호출하여 `/events`로 브로드캐스트하지만, 시스템의 다른 부분에 의해 트리거됩니다.
* **HTTP 핸들러**: `GET /events`는 SSE 스트림을 열어 두어 curl이 아웃바운드를 실시간으로 볼 수 있게 합니다. `POST`는 인바운드로, `X-Sender` 헤더로 게이팅됩니다. `yes <id>` 또는 `no <id>` 본문은 Claude Code에 판정 알림으로 전달되며 Claude에 도달하지 않습니다. 그 외의 것은 채널 이벤트로 Claude에 전달됩니다.

## 플러그인으로 패키징

채널을 설치 가능하고 공유 가능하게 만들려면, [플러그인](/plugins.html)으로 감싸고 [마켓플레이스](/plugin-marketplaces.html)에 게시하세요. 사용자는 `/plugin install`로 설치한 다음 `--channels plugin:<name>@<marketplace>`로 세션별로 활성화합니다.

자체 마켓플레이스에 게시된 채널은 [승인된 허용 목록](/channels.html#지원되는-채널)에 없으므로 여전히 `--dangerously-load-development-channels`가 필요합니다. 추가하려면 [공식 마켓플레이스에 플러그인을 제출](/plugins.html#submit-your-plugin-to-the-official-marketplace)하세요. 채널 플러그인은 승인 전에 보안 검토를 거칩니다. Team 및 Enterprise 플랜에서 관리자는 대신 조직의 자체 [`allowedChannelPlugins`](/channels.html#실행-가능한-채널-플러그인-제한) 목록에 플러그인을 포함할 수 있으며, 이는 기본 Anthropic 허용 목록을 대체합니다.

## 참고 자료

* [채널](/channels.html): Telegram, Discord, iMessage 또는 fakechat 데모를 설치하고 사용하며, Team 또는 Enterprise 조직에서 채널 활성화
* [작동하는 채널 구현](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins): 페어링 흐름, 응답 도구, 파일 첨부가 포함된 완전한 서버 코드
* [MCP](/mcp.html): 채널 서버가 구현하는 기본 프로토콜
* [플러그인](/plugins.html): 사용자가 `/plugin install`로 설치할 수 있도록 채널을 패키징
